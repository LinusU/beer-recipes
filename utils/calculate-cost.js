const assert = require('assert')
const fs = require('fs')

const prices = new Map([
  ['Acidulated Malt', 40 / 1000],
  ['Aromatic Malt', 35 / 1000],
  ['Beech Smoked Barley Malt', 38 / 1000],
  ['Biscuit Malt', 35 / 1000],
  ['Brown Malt', 35 / 1000],
  ['Caraaroma', 34 / 1000],
  ['Carabelge', 38 / 1000],
  ['Carabohemian', 38 / 1000],
  ['Carafa Special 3', 35 / 1000],
  ['Carahell', 32 / 1000],
  ['Caramünch 1', 30 / 1000],
  ['Caramünch 2', 32 / 1000],
  ['Caramünch 3', 32 / 1000],
  ['Carapils', 27 / 1000],
  ['Carawheat', 31 / 1000],
  ['Chocolate Malt', 33 / 1000],
  ['Crystal 150', 34 / 1000],
  ['Crystal 240', 34 / 1000],
  ['Extra Pale Malt', 29 / 1000],
  ['Flaked Barley', 32 / 1000],
  ['Flaked Torrefied Oats', 479 / 25000],
  ['Golden Promise Malt', 36 / 1000],
  ['Maris Otter Ale Malt', 499 / 25000],
  ['Melanoidinmalt', 29 / 1000],
  ['Munic 1 Malt', 25 / 1000],
  ['Munic 2 Malt', 25 / 1000],
  ['Naked Oat Malt', 39 / 1000],
  ['Pale Ale Malt', 449 / 25000],
  ['Pilsner Malt', 439 / 25000],
  ['Roasted Barley', 34 / 1000],
  ['Rye Malt', 29 / 1000],
  ['Special B', 35 / 1000],
  ['SprayMalt Extra Light', 55 / 500],
  ['Torrefied Maize', 39 / 1000],
  ['Torrefied Wheat', 27 / 1000],
  ['Vienna Malt', 24 / 1000],
  ['Wheat Malt', 439 / 25000],

  ['Munkens Honung', 99 / 500],
  ['Cane sugar', 21.95 / 500],
  ['Bread Syrup', 19.95 / 750],
  ['Caster sugar', 20.95 / 2000],
  ['Flaked Oats', 24.95 / 1500],
  ['Honung från flera sorters blommor', 49.95 / 700],
  ['Svensk landskapshonung', 83.95 / 650],
  ['Blackberries', 16.95 / 250],
  ['Passion fruit purée', 25.95 / 250],
  ['Pineapple puree', 15.95 / 250],
  ['Frozen Strawberries', 32.95 / 1000],

  ['Amarillo', 69 / 100],
  ['Azacca', 69 / 100],
  ['Bramling Cross', 59 / 100],
  ['Cascade', 69 / 100],
  ['Centennial', 69 / 100],
  ['Challenger', 59 / 100],
  ['Chinook', 69 / 100],
  ['Citra', 59 / 50],
  ['Columbus', 59 / 100],
  ['East Kent Golding', 59 / 100],
  ['Ekuanot', 59 / 50],
  ['El Dorado', 59 / 100],
  ['Fuggle', 59 / 100],
  ['Galaxy', 109 / 100],
  ['Hallertauer Mittelfrüh', 59 / 100],
  ['Hersbrucker', 59 / 100],
  ['Magnum', 59 / 100],
  ['Mandarina Bavaria', 59 / 100],
  ['Mosaic', 59 / 50],
  ['Motueka', 89 / 100],
  ['Nectaron', 129 / 100],
  ['Northern Brewer', 59 / 100],
  ['Pacifica', 89 / 100],
  ['Pacific Gem', 69 / 100],
  ['Perle', 59 / 100],
  ['Saaz', 59 / 100],
  ['Simcoe', 59 / 50],
  ['Styrian Golding Bobek', 59 / 100],
  ['Target', 59 / 100],
  ['Tettnanger', 59 / 100],
  ['Vista', 79 / 100],
  ['Wai-iti', 89 / 100],
  ['Willamette', 59 / 100],

  ['Belle Saison', 59 / 11],
  ['New England', 59 / 11],
  ['Safale K-97', 45 / 11.5],
  ['Safale BE-256', 59 / 11.5],
  ['Safale T-58', 35 / 11.5],
  ['Saflager S-23', 65 / 11.5],
  ['Safale S-33', 35 / 11.5],
  ['Safale BE-134', 49 / 11.5],
  ['Safale WB-06', 49 / 11.5],
  ['Safale S-04', 45 / 11.5],
  ['Saflager W-34/70', 65 / 11.5],
  ['EC-1118', 29 / 5],
  ['London ESB', 59 / 11],
  ['Belgian Wit M21', 39 / 10],
  ['Safale US-05', 45 / 11.5],
  ['Bavarian Wheat M20', 39 / 10],

  ['London Fog WLP066', 109 / 40],

  ['Lactose', 99 / 1000],

  ['Baking Soda (NaHCO₃)', 16 / 200],
  ['Gypsum (CaSO₄)', 89 / 1000],
  ['Calcium Chloride (CaCl₂)', 109 / 1000],
  ['Canning Salt (NaCl)', 15 / 600],
  ['Epsom Salt (MgSO₄)', 69 / 1000],
  ['Chalk (CaCO₃)', 109 / 1000],
  ['Lactic Acid 80%', 79 / 250],

  ['Cinnamon Stick', 12 / 4],
  ['Ginger', 51 / 1000],
  ['Star anise', 16 / 25],
  ['Coriander', 22 / 27],
  ['Ground coriander seed', 22 / 27],
  ['Bitter orange peel', 16 / 16],
  ['Gelatin Sheet', 11 / 10],
  ['Gelatin Powder', 20 / 100],
  ['Sea Salt', 10 / 1000],
])

function calculateCost (input, summary) {
  const { name, ingredients, packaging } = input.beerjson.recipes[0]

  if (!summary) {
    console.log(`## ${name}`)
    console.log('')
  }

  let totalCost = 0

  for (const fermentable of ingredients.fermentable_additions) {
    assert(fermentable.amount.unit === 'g', 'Can only handle grams')

    const price = prices.get(fermentable.name)
    assert(price, `Unknown price: ${fermentable.name}`)

    const cost = price * fermentable.amount.value
    if (!summary) console.log(`${fermentable.name}: ${cost.toFixed(2)} kr`)

    totalCost += cost
  }

  for (const hop of ingredients.hop_additions) {
    assert(hop.amount.unit === 'g', 'Can only handle grams')

    const price = prices.get(hop.name)
    if (!price) console.log(hop)
    assert(price, `Unknown price: ${hop.name}`)

    const cost = price * hop.amount.value
    if (!summary) console.log(`${hop.name}: ${cost.toFixed(2)} kr`)

    totalCost += cost
  }

  for (const culture of ingredients.culture_additions) {
    assert(culture.amount.unit === 'g' || culture.amount.unit === 'ml', 'Can only handle grams/milliliters')

    const price = prices.get(culture.name)
    assert(price, `Unknown price: ${culture.name}`)

    const cost = price * culture.amount.value
    if (!summary) console.log(`${culture.name}: ${cost.toFixed(2)} kr`)

    totalCost += cost
  }

  for (const misc of ingredients.miscellaneous_additions ?? []) {
    // Protafloc is basically free
    if (misc.name === 'Protafloc') continue

    if (misc.amount.unit === 'tsp') {
      misc.amount.unit = 'ml'
      misc.amount.value *= 5
    }

    assert(misc.amount.unit === 'g' || misc.amount.unit === 'unit' || misc.amount.unit === 'ml', 'Can only handle grams/unit/milliliters')

    const price = prices.get(misc.name)
    assert(price, `Unknown price: ${misc.name}`)

    const cost = price * misc.amount.value
    if (!summary) console.log(`${misc.name}: ${cost.toFixed(2)} kr`)
    totalCost += cost
  }

  if (summary) {
    if (packaging?.packaged_volume == null) {
      console.log(`${name.padEnd(30, ' ')} ${totalCost.toFixed(2).padStart(10, ' ')} kr`)
    } else {
      assert(packaging.packaged_volume.unit === 'l', 'Can only handle litres')
      console.log(`${name.padEnd(30, ' ')} ${totalCost.toFixed(2).padStart(10, ' ')} kr ${packaging.packaged_volume.value.toFixed(1).padStart(10, ' ')} l ${(totalCost / packaging.packaged_volume.value).toFixed(2).padStart(10, ' ')} kr/l`)
    }
  } else {
    if (packaging?.packaged_volume == null) {
      console.log('')
      console.log(`${totalCost.toFixed(2)} kr`)
      console.log('')
    } else {
      assert(packaging.packaged_volume.unit === 'l', 'Can only handle litres')

      console.log('')
      console.log(`${totalCost.toFixed(2)}kr / ${packaging.packaged_volume.value}l = ${(totalCost / packaging.packaged_volume.value).toFixed(2)} kr per liter`)
      console.log('')
    }
  }
}

for (const fileName of process.argv.slice(2)) {
  calculateCost(JSON.parse(fs.readFileSync(fileName).toString()), true)
}
