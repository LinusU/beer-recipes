const path = require('node:path')

const brewing = require('./brewing.js')

const USAGE = `usage: node utils/analyze-recipe.js [options] <recipe.json>...

Estimate gravity, alcohol, bitterness, colour, water chemistry and cost.

  --summary                  one line per recipe instead of a full report
  --verbose                  also break down every ingredient's contribution
  --efficiency               report the brewhouse efficiency each recipe implies
                             from its recorded original gravity, instead of
                             analysing it
  --assume-efficiency=<n>    brewhouse efficiency to calculate with, as a
                             fraction (default ${brewing.DEFAULT_EFFICIENCY})
`

function parseArguments (argv) {
  const options = { summary: false, verbose: false, efficiency: false, assume: brewing.DEFAULT_EFFICIENCY }
  const files = []

  for (const argument of argv) {
    if (argument === '--summary') options.summary = true
    else if (argument === '--verbose') options.verbose = true
    else if (argument === '--efficiency') options.efficiency = true
    else if (argument.startsWith('--assume-efficiency=')) options.assume = Number.parseFloat(argument.slice(20))
    else if (argument === '--help' || argument === '-h') { process.stdout.write(USAGE); process.exit(0) }
    else if (argument.startsWith('-')) { process.stderr.write(`Unknown option: ${argument}\n\n${USAGE}`); process.exit(1) }
    else files.push(argument)
  }

  if (files.length === 0) { process.stderr.write(USAGE); process.exit(1) }
  if (!Number.isFinite(options.assume) || options.assume <= 0) { process.stderr.write('--assume-efficiency needs a positive fraction, e.g. 0.55\n'); process.exit(1) }

  return { options, files }
}

/** Everything worth knowing about one recipe, in one object. */
function analyze (recipe, { assume }) {
  const gravity = brewing.calculateGravity(recipe, { efficiency: assume })
  const ibu = brewing.calculateIbu(recipe, { efficiency: assume })
  const color = brewing.calculateColor(recipe)
  const water = brewing.calculateWater(recipe)
  const cost = brewing.calculateCost(recipe)

  const recordedOg = recipe.original_gravity?.value === 1 ? null : recipe.original_gravity?.value
  const recordedFg = recipe.final_gravity?.value === 1 ? null : recipe.final_gravity?.value

  return {
    recipe,
    gravity,
    ibu,
    color,
    water,
    cost,
    recordedOg,
    recordedFg,
    recordedAbv: (recordedOg == null || recordedFg == null) ? null : brewing.alcoholByVolume(recordedOg, recordedFg),
    // Bitterness relative to gravity, which is what tells you whether a beer is
    // balanced towards hops or malt regardless of its strength.
    bitternessRatio: ibu.ibu / ((recordedOg ?? gravity.og) - 1) / 1000,
    volume: brewing.batchVolume(recipe),
    packaged: recipe.packaging?.packaged_volume?.value ?? null
  }
}

const sg = (value) => value == null ? '     ' : value.toFixed(3)
const pad = (value, width) => String(value).padStart(width)

function printReport (result, { verbose }) {
  const { recipe, gravity, ibu, color, water, cost } = result
  const style = recipe.style == null ? '' : `${recipe.style.name} (${recipe.style.style_guide} ${recipe.style.category_number ?? ''}${recipe.style.style_letter ?? ''})`

  console.log('')
  console.log(`${recipe.name}${recipe.created == null ? '' : `  ·  ${recipe.created}`}`)
  if (style !== '') console.log(style)
  console.log('')

  const recorded = (estimated, actual) => actual == null ? '' : `  (recorded ${sg(actual)})`

  console.log(`  Batch          ${result.volume.toFixed(1)} l${result.packaged == null ? '' : `, packaged ${result.packaged.toFixed(1)} l`}`)
  console.log(`  Gravity        OG ${sg(gravity.og)}${recorded(gravity.og, result.recordedOg)}`)
  console.log(`                 FG ${sg(gravity.fg)}${recorded(gravity.fg, result.recordedFg)}`)
  console.log(`  Alcohol        ${gravity.abv == null ? 'unknown' : `${gravity.abv.toFixed(1)} % ABV`}${result.recordedAbv == null ? '' : `  (recorded ${result.recordedAbv.toFixed(1)} %)`}`)
  console.log(`                 ${gravity.culture == null ? 'no culture' : `${gravity.culture} at ${(gravity.attenuation * 100).toFixed(0)} % apparent attenuation`}, ${(gravity.efficiency * 100).toFixed(0)} % brewhouse efficiency`)
  console.log(`  Bitterness     ${ibu.ibu.toFixed(0)} IBU (Tinseth)   BU:GU ${result.bitternessRatio.toFixed(2)}`)
  console.log(`  Colour         ${color.ebc.toFixed(0)} EBC   ${color.srm.toFixed(1)} SRM`)
  console.log(`  Cost           ${cost.total.toFixed(2)} kr   ${(cost.total / (result.packaged ?? result.volume)).toFixed(2)} kr/l`)
  console.log('')

  printWater(water)

  if (verbose) {
    printBreakdown('Gravity points', gravity.contributions, c => `${pad(c.points.toFixed(1), 6)} pts${c.fermentable ? '' : '  (unfermentable)'}`)
    // A starred alpha acid is the database's typical value, because the recipe
    // did not record the lot that was actually used.
    printBreakdown('Bitterness', ibu.contributions, c => `${pad(c.ibu.toFixed(1), 6)} IBU  ${pad(c.grams, 4)} g at ${c.alpha.toFixed(1)} %${c.estimated ? '*' : ''} for ${c.minutes} min`)
    printBreakdown('Colour', color.contributions, c => `${pad(c.mcu.toFixed(1), 6)} MCU  (${c.ebc} EBC)`)
    printBreakdown('Cost', [...cost.contributions].sort((a, b) => b.cost - a.cost), c => `${pad(c.cost.toFixed(2), 6)} kr`)
  }
}

function printBreakdown (title, contributions, format) {
  if (contributions.length === 0) return

  console.log(`  ${title}`)
  for (const contribution of contributions) {
    console.log(`    ${contribution.name.padEnd(36)}${format(contribution)}`)
  }
  console.log('')
}

const IONS = [
  ['calcium', 'Ca'],
  ['magnesium', 'Mg'],
  ['sodium', 'Na'],
  ['sulfate', 'SO4'],
  ['chloride', 'Cl'],
  ['bicarbonate', 'HCO3']
]

/**
 * Sulfate to chloride is the classic "hoppy or malty" lever. Below about 0.7
 * the beer reads round and malty, above about 2 it reads dry and bitter.
 */
function balance (ratio) {
  if (ratio == null) return ''
  if (ratio < 0.7) return 'malty'
  if (ratio > 2) return 'hoppy'
  return 'balanced'
}

function printWater (water) {
  console.log(`  Water          mash ${water.volumes.mash.toFixed(1)} l, sparge ${water.volumes.sparge.toFixed(1)} l, total ${water.volumes.total.toFixed(1)} l`)
  console.log(`    ${'ppm'.padEnd(16)}${IONS.map(([, label]) => pad(label, 6)).join('')}${pad('alk', 6)}${pad('RA', 6)}`)

  const row = (label, profile) => {
    console.log(`    ${label.slice(0, 15).padEnd(16)}${IONS.map(([ion]) => pad(profile[ion].toFixed(0), 6)).join('')}${pad(profile.alkalinity.toFixed(0), 6)}${pad(profile.residualAlkalinity.toFixed(0), 6)}`)
  }

  row(water.source ?? 'source', water.sourceProfile)
  row('mash', water.mash)
  row('overall', water.overall)

  const ratio = water.overall.sulfateChlorideRatio
  console.log(`    sulfate:chloride ${ratio == null ? 'n/a' : `${ratio.toFixed(1)} (${balance(ratio)})`}`)

  if (water.additions.length > 0) {
    console.log(`    additions        ${water.additions.map(a => `${a.name.replace(/ \(.*\)$/, '')} ${a.amount} ${a.unit}`).join(', ')}`)
  }

  console.log('')
}

function printSummaryHeader () {
  console.log(
    'Recipe'.padEnd(44),
    pad('OG', 7), pad('FG', 7), pad('ABV', 6), pad('IBU', 5), pad('EBC', 5), pad('SRM', 5), pad('BU:GU', 6), pad('kr/l', 7)
  )
  console.log('~ marks an estimate; everything else was recorded on the day')
}

/**
 * One row per recipe. Gravities the brewer wrote down win over the estimates,
 * and the ABV is derived from whichever pair is actually shown so that the row
 * is internally consistent.
 */
function printSummary (result) {
  const { gravity, ibu, color, cost } = result

  const og = result.recordedOg ?? gravity.og
  const fg = result.recordedFg ?? gravity.fg
  const abv = (og == null || fg == null) ? null : brewing.alcoholByVolume(og, fg)

  const show = (value, recorded) => value == null ? '' : `${recorded ? ' ' : '~'}${value.toFixed(3)}`

  console.log(
    result.recipe.name.slice(0, 44).padEnd(44),
    pad(show(og, result.recordedOg != null), 7),
    pad(show(fg, result.recordedFg != null), 7),
    pad(abv == null ? '' : `${abv.toFixed(1)} %`, 6),
    pad(ibu.ibu.toFixed(0), 5),
    pad(color.ebc.toFixed(0), 5),
    pad(color.srm.toFixed(1), 5),
    pad(result.bitternessRatio.toFixed(2), 6),
    pad((cost.total / (result.packaged ?? result.volume)).toFixed(2), 7)
  )
}

function printEfficiency (files) {
  const rows = []

  for (const file of files) {
    try {
      const recipe = brewing.readRecipe(file)
      const implied = brewing.impliedEfficiency(recipe)
      if (implied != null) rows.push({ name: recipe.name, created: recipe.created, implied })
    } catch (error) {
      console.error(`Error in ${path.basename(file)}: ${error.message}`)
    }
  }

  rows.sort((a, b) => (a.created ?? '').localeCompare(b.created ?? ''))

  console.log('Created'.padEnd(12), 'Recipe'.padEnd(44), 'Implied efficiency')
  for (const row of rows) {
    console.log((row.created ?? '').padEnd(12), row.name.slice(0, 44).padEnd(44), pad(`${(row.implied * 100).toFixed(1)} %`, 18))
  }

  if (rows.length === 0) return

  const sorted = rows.map(row => row.implied).sort((a, b) => a - b)
  const quantile = (p) => sorted[Math.floor((sorted.length - 1) * p)]

  console.log('')
  console.log(`${rows.length} recipes with a recorded original gravity`)
  console.log(`median ${(quantile(0.5) * 100).toFixed(1)} %, middle half ${(quantile(0.25) * 100).toFixed(1)} % to ${(quantile(0.75) * 100).toFixed(1)} %`)
}

function main () {
  const { options, files } = parseArguments(process.argv.slice(2))

  if (options.efficiency) return printEfficiency(files)

  if (options.summary) printSummaryHeader()

  for (const file of files) {
    try {
      const result = analyze(brewing.readRecipe(file), options)

      if (options.summary) printSummary(result)
      else printReport(result, options)
    } catch (error) {
      console.error(`Error in ${path.basename(file)}: ${error.message}`)
    }
  }
}

main()
