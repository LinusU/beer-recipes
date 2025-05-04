const assert = require('node:assert')
const fs = require('node:fs')

function calculateWater (input) {
  const { batch_size, created, final_gravity, ingredients, mash, name, original_gravity, packaging } = input.beerjson.recipes[0]

  let malt = 0

  for (const addition of ingredients.fermentable_additions) {
    switch (addition.type) {
      case 'grain':
        assert(addition.amount.unit === 'g')
        malt += addition.amount.value
        break
      case 'fruit':
      case 'honey':
      case 'sugar':
        break
      default:
        throw new Error(`Unknown fermentable ingredient type: ${addition.type}`)
    }
  }

  const infusion = mash.mash_steps.find(step => step.type === 'infusion')
  const sparge = mash.mash_steps.find(step => step.type === 'sparge') || { amount: { unit: 'l', value: 0 } }

  assert(infusion.amount.unit === 'l')
  assert(sparge.amount.unit === 'l')

  const og = original_gravity?.value == 1 ? null : original_gravity?.value
  const fg = final_gravity?.value == 1 ? null : final_gravity?.value

  return {
    abv: (og == null || fg == null) ? null : (76.08 * (og - fg) / (1.775 - og)) * (fg / 0.794),
    batch_size: batch_size?.value,
    created,
    infusion: infusion.amount.value,
    malt,
    name,
    sparge: sparge.amount.value,
    packaged_volume: packaging?.packaged_volume?.value
  }
}

let results = []

for (const fileName of process.argv.slice(2)) {
  results.push(calculateWater(JSON.parse(fs.readFileSync(fileName).toString())))
}

results.sort((a, b) => {
  return a.created.localeCompare(b.created)
})


console.log(
  'Created   ',
  'Name'.padEnd(45),
  'Malt'.padEnd(5) + '   ',
  'Infusion'.padEnd(8),
  'Sparge'.padEnd(8),
  'Batch Size'.padEnd(10),
  'Packaged'.padEnd(8),
  'ABV'.padEnd(7),
)

for (const result of results) {
  console.log(
    result.created,
    result.name.padEnd(45),
    (result.malt / 1000).toFixed(2).padStart(5) + ' kg',
    result.infusion.toFixed(0).padStart(6) + ' l',
    result.sparge.toFixed(0).padStart(6) + ' l',
    (result.batch_size == null ? '' : (result.batch_size.toFixed(1) + ' l')).padStart(10),
    (result.packaged_volume == null ? '' : (result.packaged_volume.toFixed(1) + ' l')).padStart(8),
    (result.abv == null ? '' : (result.abv.toFixed(2) + ' %')).padStart(7),
  )
}
