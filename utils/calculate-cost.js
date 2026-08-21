const assert = require('node:assert')

const brewing = require('./brewing.js')

/**
 * Ingredient cost of a recipe.
 *
 * Prices live in `ingredients.js` alongside the rest of the reference data, and
 * the arithmetic lives in `brewing.js`; this is just the printing.
 */
function printCost (recipe, summary) {
  const { name, packaging } = recipe
  const { total, contributions } = brewing.calculateCost(recipe)

  if (summary) {
    if (packaging?.packaged_volume == null) {
      console.log(`${name.padEnd(48, ' ')} ${total.toFixed(2).padStart(10, ' ')} kr`)
    } else {
      assert(packaging.packaged_volume.unit === 'l', 'Can only handle litres')
      console.log(`${name.padEnd(48, ' ')} ${total.toFixed(2).padStart(10, ' ')} kr ${packaging.packaged_volume.value.toFixed(1).padStart(10, ' ')} l ${(total / packaging.packaged_volume.value).toFixed(2).padStart(10, ' ')} kr/l`)
    }

    return
  }

  console.log(`## ${name}`)
  console.log('')

  for (const { name, cost } of contributions) {
    console.log(`${name}: ${cost.toFixed(2)} kr`)
  }

  console.log('')

  if (packaging?.packaged_volume == null) {
    console.log(`${total.toFixed(2)} kr`)
  } else {
    assert(packaging.packaged_volume.unit === 'l', 'Can only handle litres')
    console.log(`${total.toFixed(2)}kr / ${packaging.packaged_volume.value}l = ${(total / packaging.packaged_volume.value).toFixed(2)} kr per liter`)
  }

  console.log('')
}

for (const fileName of process.argv.slice(2)) {
  try {
    printCost(brewing.readRecipe(fileName), true)
  } catch (error) {
    console.error(`Error in ${fileName}: ${error.message}`)
  }
}
