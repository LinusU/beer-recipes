const assert = require('assert')
const fs = require('fs')

const summary = {
  fermentables: new Map(),
  hops: new Map(),
  hop_recipes: new Map(),
  cultures: new Map(),
  cultures_recipes: new Map()
}

function sort(map) {
  return Array.from(map.entries()).sort((a, b) => {
    if (a[1] === b[1]) {
      return a[0].localeCompare(b[0])
    }

    return b[1] - a[1]
  })
}

function summarizeIngredients (recipe) {
  for (const fermentable of recipe.ingredients.fermentable_additions) {
    assert(fermentable.amount.unit === 'g', 'Can only handle grams')

    const weight = fermentable.amount.value
    const current = summary.fermentables.get(fermentable.name) ?? 0

    summary.fermentables.set(fermentable.name, current + weight)
  }

  for (const hop of recipe.ingredients.hop_additions) {
    assert(hop.amount.unit === 'g', 'Can only handle grams')

    const weight = hop.amount.value
    const current = summary.hops.get(hop.name) ?? 0

    summary.hops.set(hop.name, current + weight)
  }

  for (const hop of new Set(recipe.ingredients.hop_additions.map(hop => hop.name))) {
    const current = summary.hop_recipes.get(hop) ?? 0

    summary.hop_recipes.set(hop, current + 1)
  }

  for (const culture of recipe.ingredients.culture_additions) {
    assert(culture.amount.unit === 'g' || culture.amount.unit === 'ml', 'Can only handle grams/milliliters')

    const weight = culture.amount.value
    const current = summary.cultures.get(culture.name) ?? 0

    summary.cultures.set(culture.name, current + weight)
  }

  for (const culture of new Set(recipe.ingredients.culture_additions.map(culture => culture.name))) {
    const current = summary.cultures_recipes.get(culture) ?? 0

    summary.cultures_recipes.set(culture, current + 1)
  }
}


for (const fileName of process.argv.slice(2)) {
  try {
    const input = JSON.parse(fs.readFileSync(fileName).toString())

    if (input.beerjson.version !== 1) {
      throw new Error('Not a valid BeerJSON v1 file')
    }

    if (input.beerjson.recipes.length !== 1) {
      throw new Error('Can only handle single-recipe files')
    }

    summarizeIngredients(input.beerjson.recipes[0])
  } catch (error) {
    console.error(`Error processing ${fileName}: ${error.message}`)
  }
}

console.log(`| ${'**Fermentables**'.padEnd(40, ' ')} | ${''.padStart(10, ' ')} |`)
console.log(`| ${':'.padEnd(40, '-')} | ${':'.padStart(10, '-')} |`)
for (const [name, weight] of sort(summary.fermentables)) {
  console.log(`| ${name.padEnd(40, ' ')} | ${`${(weight / 1000).toFixed(0)} kg`.padStart(10, ' ')} |`)
}
console.log('')

console.log(`| ${'**Hops**'.padEnd(40, ' ')} | ${''.padStart(10, ' ')} | ${''.padStart(3, ' ')} |`)
console.log(`| ${':'.padEnd(40, '-')} | ${':'.padStart(10, '-')} | ${':'.padStart(3, '-')} |`)
for (const [name, weight] of sort(summary.hops)) {
  console.log(`| ${name.padEnd(40, ' ')} | ${`${weight.toFixed(0)} g`.padStart(10, ' ')} | ${summary.hop_recipes.get(name).toFixed(0).padStart(3, ' ')} |`)
}
console.log('')

console.log(`| ${'**Cultures**'.padEnd(40, ' ')} | ${''.padStart(10, ' ')} | ${''.padStart(3, ' ')} |`)
console.log(`| ${':'.padEnd(40, '-')} | ${':'.padStart(10, '-')} | ${':'.padStart(3, '-')} |`)
for (const [name, weight_or_volume] of sort(summary.cultures)) {
  console.log(`| ${name.padEnd(40, ' ')} | ${`${weight_or_volume.toFixed(1)} g/ml`.padStart(10, ' ')} | ${summary.cultures_recipes.get(name).toFixed(0).padStart(3, ' ')} |`)
}
console.log('')
