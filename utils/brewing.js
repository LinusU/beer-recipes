const fs = require('node:fs')

const db = require('./ingredients.js')

/**
 * Brewing calculations for the recipes in this repository.
 *
 * Everything here is a pure function of a BeerJSON recipe object plus the
 * reference data in `ingredients.js`. Nothing prints; `analyze-recipe.js` is
 * the command line front end.
 *
 * Which volume a calculation uses matters, so to be explicit: gravity, colour
 * and bitterness are all computed against `batch_size`, the volume going into
 * the fermenter, and the boil is assumed to end at that volume.
 */

/**
 * Gravity points contributed by one kilogram of pure sugar dissolved in one
 * litre. The metric twin of the 46.21 points-per-pound-per-gallon of sucrose.
 */
const SUGAR_POINTS_PER_KG_PER_LITRE = 386

/**
 * Brewhouse efficiency to assume when the caller does not pass one.
 *
 * This is measured, not assumed. `analyze-recipe.js --efficiency` back-solves
 * the efficiency implied by every recipe that records an original gravity, and
 * 0.48 is the median across all of them. It has sat between 0.45 and 0.52 every
 * year since 2020, so it predicts this brewery's gravities well even though it
 * is far below the 0.70 to 0.80 a textbook quotes.
 *
 * Re-run `--efficiency` after a few more brew days and move this if it drifts.
 */
const DEFAULT_EFFICIENCY = 0.48

/** Read a BeerJSON file and return its single recipe. */
function readRecipe (fileName) {
  const input = JSON.parse(fs.readFileSync(fileName).toString())

  if (input.beerjson?.version !== 1) throw new Error('Not a BeerJSON v1 file')
  if (input.beerjson.recipes.length !== 1) throw new Error('Can only handle single-recipe files')

  return input.beerjson.recipes[0]
}

function amountIn (addition, unit) {
  const amount = addition.amount
  if (amount == null) throw new Error(`${addition.name} has no amount`)

  // Recipes occasionally measure spices by the teaspoon.
  if (amount.unit === 'tsp' && unit === 'ml') return amount.value * 5
  if (amount.unit !== unit) throw new Error(`${addition.name} is in ${amount.unit}, expected ${unit}`)

  return amount.value
}

function batchVolume (recipe) {
  if (recipe.batch_size == null) throw new Error('Recipe has no batch_size')
  if (recipe.batch_size.unit !== 'l') throw new Error('Can only handle batch sizes in litres')

  return recipe.batch_size.value
}

// -- Gravity, attenuation and alcohol ----------------------------------------

/**
 * Gravity points each fermentable contributes to the batch.
 *
 * Grain has to be mashed, so its extract is scaled by brewhouse efficiency.
 * Sugar, honey, fruit and dry malt extract dissolve directly and are not.
 */
function fermentablePoints (recipe, { efficiency = DEFAULT_EFFICIENCY } = {}) {
  const volume = batchVolume(recipe)
  const contributions = []

  for (const addition of recipe.ingredients.fermentable_additions ?? []) {
    const entry = db.fermentable(addition.name)
    const kilograms = amountIn(addition, 'g') / 1000
    const needsMash = entry.mash ?? entry.type === 'grain'

    const points = (kilograms * entry.yield * SUGAR_POINTS_PER_KG_PER_LITRE * (needsMash ? efficiency : 1)) / volume

    contributions.push({
      name: addition.name,
      points,
      fermentable: entry.fermentable ?? true
    })
  }

  return contributions
}

/**
 * Estimate original gravity, final gravity and ABV.
 *
 * Attenuation comes from the first culture in the recipe, which is the yeast
 * that does the primary fermentation. Any gravity from lactose is carried
 * straight through to the final gravity.
 */
function calculateGravity (recipe, { efficiency = DEFAULT_EFFICIENCY } = {}) {
  const contributions = fermentablePoints(recipe, { efficiency })

  const totalPoints = contributions.reduce((sum, c) => sum + c.points, 0)
  const unfermentablePoints = contributions.filter(c => !c.fermentable).reduce((sum, c) => sum + c.points, 0)

  const culture = recipe.ingredients.culture_additions?.[0]
  const attenuation = culture == null ? null : db.culture(culture.name).attenuation

  const og = 1 + totalPoints / 1000
  const fg = attenuation == null
    ? null
    : 1 + ((totalPoints - unfermentablePoints) * (1 - attenuation) + unfermentablePoints) / 1000

  return {
    og,
    fg,
    abv: fg == null ? null : alcoholByVolume(og, fg),
    attenuation,
    culture: culture?.name ?? null,
    efficiency,
    contributions
  }
}

/**
 * Alcohol by volume from original and final gravity.
 *
 * The same formula `water.js` has always used, so that estimated and recorded
 * ABV stay comparable.
 */
function alcoholByVolume (og, fg) {
  return (76.08 * (og - fg) / (1.775 - og)) * (fg / 0.794)
}

/**
 * Back-solve the brewhouse efficiency implied by a recipe's recorded original
 * gravity. Returns null when the recipe does not record one.
 *
 * Only the mashed fermentables scale with efficiency, so the sugar and honey
 * are subtracted off first.
 */
function impliedEfficiency (recipe) {
  const recorded = recipe.original_gravity
  if (recorded == null || recorded.value === 1) return null
  if (recorded.unit !== 'sg') throw new Error('Can only handle original gravity in sg')

  const atFull = fermentablePoints(recipe, { efficiency: 1 })

  let mashPoints = 0
  let directPoints = 0

  for (const addition of recipe.ingredients.fermentable_additions ?? []) {
    const entry = db.fermentable(addition.name)
    const points = atFull.find(c => c.name === addition.name).points

    if (entry.mash ?? entry.type === 'grain') mashPoints += points
    else directPoints += points
  }

  if (mashPoints === 0) return null

  return ((recorded.value - 1) * 1000 - directPoints) / mashPoints
}

// -- Bitterness ---------------------------------------------------------------

/**
 * IBU by the Tinseth equation.
 *
 * Only boil additions bitter the beer. Dry hops, whether they go into the
 * fermenter or the keg, contribute aroma but no measurable bitterness, and a
 * flameout addition at zero minutes contributes nothing here either.
 *
 * Alpha acid comes from the addition itself when the recipe records the lot
 * that was used, and falls back to the typical value in the database.
 */
function calculateIbu (recipe, { efficiency = DEFAULT_EFFICIENCY, boilGravity } = {}) {
  const volume = batchVolume(recipe)
  const gravity = boilGravity ?? recipe.original_gravity?.value ?? calculateGravity(recipe, { efficiency }).og

  const bigness = 1.65 * Math.pow(0.000125, gravity - 1)
  const contributions = []

  for (const addition of recipe.ingredients.hop_additions ?? []) {
    if (addition.timing?.use !== 'add_to_boil') continue

    const duration = addition.timing.duration
    if (duration?.unit !== 'min') throw new Error(`${addition.name} boil addition is not timed in minutes`)

    const grams = amountIn(addition, 'g')
    const alpha = addition.alpha_acid?.value ?? db.hop(addition.name).alpha
    const estimated = addition.alpha_acid == null

    const utilization = bigness * ((1 - Math.exp(-0.04 * duration.value)) / 4.15)
    const ibu = (alpha / 100) * grams * utilization * 1000 / volume

    contributions.push({ name: addition.name, minutes: duration.value, grams, alpha, estimated, utilization, ibu })
  }

  return {
    ibu: contributions.reduce((sum, c) => sum + c.ibu, 0),
    boilGravity: gravity,
    contributions
  }
}

// -- Colour -------------------------------------------------------------------

const ebcToSrm = (ebc) => ebc / 1.97
const srmToEbc = (srm) => srm * 1.97
const srmToLovibond = (srm) => (srm + 0.76) / 1.3546

/**
 * Beer colour by the Morey equation.
 *
 * Fruit is left out: it colours the beer, but not in any way this equation
 * models, so a purple raspberry sour will read as the base beer's colour.
 */
function calculateColor (recipe) {
  const volume = batchVolume(recipe)
  const contributions = []

  let mcu = 0

  for (const addition of recipe.ingredients.fermentable_additions ?? []) {
    const entry = db.fermentable(addition.name)
    if (entry.color === 0) continue

    const kilograms = amountIn(addition, 'g') / 1000
    const lovibond = srmToLovibond(ebcToSrm(entry.color))

    // Malt colour units are pound-per-gallon based; 8.3454 converts kg/l to it.
    const contribution = (lovibond * kilograms * 8.3454) / volume

    mcu += contribution
    contributions.push({ name: addition.name, ebc: entry.color, mcu: contribution })
  }

  const srm = 1.4922 * Math.pow(mcu, 0.6859)

  return { srm, ebc: srmToEbc(srm), mcu, contributions }
}

// -- Water chemistry ----------------------------------------------------------

const IONS = ['calcium', 'magnesium', 'sodium', 'sulfate', 'chloride', 'bicarbonate']

function mashVolumes (recipe) {
  const steps = recipe.mash?.mash_steps ?? []

  const infusion = steps.find(step => step.type === 'infusion')
  const sparge = steps.find(step => step.type === 'sparge')

  if (infusion == null) throw new Error('Recipe has no infusion mash step')
  if (infusion.amount.unit !== 'l') throw new Error('Can only handle mash volumes in litres')
  if (sparge != null && sparge.amount.unit !== 'l') throw new Error('Can only handle sparge volumes in litres')

  return {
    mash: infusion.amount.value,
    sparge: sparge?.amount.value ?? 0,
    total: infusion.amount.value + (sparge?.amount.value ?? 0)
  }
}

/**
 * Water profile of the mash, and of the whole brew.
 *
 * Salts are dosed into a volume, so the same grams give a different profile
 * depending on which volume you measure. Mash additions are reported against
 * the mash water, because that is what the mash chemistry reacts to. The
 * overall profile spreads every addition across mash plus sparge, because that
 * is what ends up in the glass and what the sulfate to chloride ratio is about.
 */
function calculateWater (recipe) {
  const volumes = mashVolumes(recipe)

  const source = recipe.ingredients.water_additions?.[0]
  const base = {}
  for (const ion of IONS) base[ion] = source?.[ion]?.value ?? 0

  const mash = { ...base }
  const overall = { ...base }

  let mashAcid = 0
  let totalAcid = 0
  const additions = []

  for (const addition of recipe.ingredients.miscellaneous_additions ?? []) {
    const entry = db.misc(addition.name)
    if (entry.type !== 'water agent') continue

    const toMash = addition.timing?.use === 'add_to_mash'

    if (entry.alkalinity != null) {
      const millilitres = amountIn(addition, 'ml')

      if (toMash) mashAcid += millilitres * entry.alkalinity
      totalAcid += millilitres * entry.alkalinity

      additions.push({ name: addition.name, amount: millilitres, unit: 'ml', target: toMash ? 'mash' : 'boil' })
      continue
    }

    const grams = amountIn(addition, 'g')

    for (const [ion, perGram] of Object.entries(entry.ions)) {
      if (toMash) mash[ion] += (grams * perGram) / volumes.mash
      overall[ion] += (grams * perGram) / volumes.total
    }

    additions.push({ name: addition.name, amount: grams, unit: 'g', target: toMash ? 'mash' : 'boil' })
  }

  return {
    source: source?.name ?? null,
    // The untreated source water, for comparison against the treated profiles.
    sourceProfile: withDerived(base, 0),
    volumes,
    additions,
    mash: withDerived(mash, mashAcid / volumes.mash),
    overall: withDerived(overall, totalAcid / volumes.total)
  }
}

/**
 * Alkalinity, residual alkalinity and the sulfate to chloride ratio.
 *
 * Residual alkalinity is Kolbach's: the alkalinity left over once the calcium
 * and magnesium have had their acidifying say. Negative pushes the mash pH
 * down, positive pushes it up, and pale beers want it near or below zero.
 */
function withDerived (profile, alkalinityRemoved) {
  // Bicarbonate expressed as CaCO₃: 50.04 g/mol equivalent over 61.02 g/mol.
  const alkalinity = Math.max(0, profile.bicarbonate * 0.8200 - alkalinityRemoved)
  const residualAlkalinity = alkalinity - (profile.calcium / 3.5 + profile.magnesium / 7)

  return {
    ...profile,
    alkalinity,
    alkalinityRemoved,
    residualAlkalinity,
    sulfateChlorideRatio: profile.chloride === 0 ? null : profile.sulfate / profile.chloride
  }
}

// -- Cost ---------------------------------------------------------------------

/** Ingredient cost of a recipe, in SEK. */
function calculateCost (recipe) {
  const contributions = []

  const add = (addition, units) => {
    const entry = db.find(addition.name)
    if (entry == null) throw new Error(`Unknown ingredient: ${JSON.stringify(addition.name)} — add it to utils/ingredients.js`)

    // A few additions are recorded without an amount.
    if (addition.amount == null) return

    const unit = addition.amount.unit === 'tsp' ? 'ml' : addition.amount.unit
    if (!units.includes(unit)) throw new Error(`${addition.name} is in ${unit}, expected one of ${units.join(', ')}`)

    contributions.push({ name: addition.name, cost: entry.price * amountIn(addition, unit) })
  }

  for (const addition of recipe.ingredients.fermentable_additions ?? []) add(addition, ['g'])
  for (const addition of recipe.ingredients.hop_additions ?? []) add(addition, ['g'])
  for (const addition of recipe.ingredients.culture_additions ?? []) add(addition, ['g', 'ml'])
  for (const addition of recipe.ingredients.miscellaneous_additions ?? []) add(addition, ['g', 'ml', 'unit'])

  return {
    total: contributions.reduce((sum, c) => sum + c.cost, 0),
    contributions
  }
}

module.exports = {
  DEFAULT_EFFICIENCY,
  alcoholByVolume,
  batchVolume,
  calculateColor,
  calculateCost,
  calculateGravity,
  calculateIbu,
  calculateWater,
  ebcToSrm,
  impliedEfficiency,
  mashVolumes,
  readRecipe,
  srmToEbc
}
