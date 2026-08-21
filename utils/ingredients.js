/**
 * Reference data for every ingredient used in this repository.
 *
 * Field units, consistently:
 *
 *   price   SEK per gram, per millilitre, or per unit — matching the `amount.unit`
 *           the ingredient is written with in the recipes.
 *   color   Colour of the ingredient itself, in EBC.
 *   yield   Extract yield as a fraction of weight (fine grind, dry basis). This is
 *           the fraction of the ingredient that becomes dissolved extract, so
 *           1.0 = pure sugar. Sold as "extract %" on maltster spec sheets.
 *   mash    Whether the extract has to be mashed out of the ingredient, and is
 *           therefore subject to brewhouse efficiency. Defaults to `type === 'grain'`.
 *   fermentable  Whether the extract ferments. Defaults to true; lactose is the
 *           exception.
 *   alpha   Typical alpha acid, in %. Only a fallback — a hop addition in a recipe
 *           carries the alpha acid of the actual lot, which always wins.
 *   attenuation  Typical apparent attenuation as a fraction, per the manufacturer.
 *   ions    Milligrams of each ion released per gram of salt, which is the same
 *           number as the ppm added per gram dissolved in one litre.
 *
 * Colour and yield figures are midpoints of the maltster's published spec range.
 * They are typical values, not lot analyses, so treat calculated colour and
 * gravity as estimates good to roughly ±10%.
 */

/** Fermentables: anything that contributes extract. */
const fermentables = {
  // -- Weyermann ------------------------------------------------------------
  'Acidulated Malt': { type: 'grain', producer: 'Weyermann', price: 40 / 1000, color: 4.5, yield: 0.78 },
  'Beech Smoked Barley Malt': { type: 'grain', producer: 'Weyermann', price: 38 / 1000, color: 5.5, yield: 0.80 },
  'Caraaroma': { type: 'grain', producer: 'Weyermann', price: 34 / 1000, color: 350, yield: 0.75 },
  'Carabelge': { type: 'grain', producer: 'Weyermann', price: 38 / 1000, color: 26, yield: 0.76 },
  'Carabohemian': { type: 'grain', producer: 'Weyermann', price: 38 / 1000, color: 150, yield: 0.75 },
  'Carafa Special 1': { type: 'grain', producer: 'Weyermann', price: 35 / 1000, color: 900, yield: 0.70 },
  'Carafa Special 3': { type: 'grain', producer: 'Weyermann', price: 35 / 1000, color: 1400, yield: 0.70 },
  'Carahell': { type: 'grain', producer: 'Weyermann', price: 32 / 1000, color: 25, yield: 0.77 },
  'Caramünch 1': { type: 'grain', producer: 'Weyermann', price: 30 / 1000, color: 90, yield: 0.76 },
  'Caramünch 2': { type: 'grain', producer: 'Weyermann', price: 32 / 1000, color: 120, yield: 0.76 },
  'Caramünch 3': { type: 'grain', producer: 'Weyermann', price: 32 / 1000, color: 150, yield: 0.76 },
  'Carapils': { type: 'grain', producer: 'Weyermann', price: 27 / 1000, color: 5, yield: 0.78 },
  'Carared': { type: 'grain', producer: 'Weyermann', price: 34 / 1000, color: 50, yield: 0.76 },
  'Carawheat': { type: 'grain', producer: 'Weyermann', price: 31 / 1000, color: 110, yield: 0.75 },
  'Melanoidin Malt': { type: 'grain', producer: 'Weyermann', price: 29 / 1000, color: 70, yield: 0.78 },
  'Munic 1 Malt': { type: 'grain', producer: 'Weyermann', price: 25 / 1000, color: 15, yield: 0.80 },
  'Munic 2 Malt': { type: 'grain', producer: 'Weyermann', price: 25 / 1000, color: 22, yield: 0.79 },
  'Pale Ale Malt': { type: 'grain', producer: 'Weyermann', price: 449 / 25000, color: 6.5, yield: 0.80 },
  'Pilsner Malt': { type: 'grain', producer: 'Weyermann', price: 439 / 25000, color: 3.5, yield: 0.81 },
  'Roasted Barley': { type: 'grain', producer: 'Weyermann', price: 34 / 1000, color: 1100, yield: 0.68 },
  'Rye Malt': { type: 'grain', producer: 'Weyermann', price: 29 / 1000, color: 6.5, yield: 0.81 },
  'Vienna Malt': { type: 'grain', producer: 'Weyermann', price: 24 / 1000, color: 7, yield: 0.80 },
  'Wheat Malt': { type: 'grain', producer: 'Weyermann', price: 439 / 25000, color: 4, yield: 0.83 },

  // -- Crisp ----------------------------------------------------------------
  'Brown Malt': { type: 'grain', producer: 'Crisp', price: 35 / 1000, color: 150, yield: 0.70 },
  'Chocolate Malt': { type: 'grain', producer: 'Crisp', price: 33 / 1000, color: 1100, yield: 0.68 },
  'Crystal 150': { type: 'grain', producer: 'Crisp', price: 34 / 1000, color: 150, yield: 0.74 },
  'Crystal 240': { type: 'grain', producer: 'Crisp', price: 34 / 1000, color: 240, yield: 0.72 },
  'Flaked Torrefied Oats': { type: 'grain', producer: 'Crisp', price: 29 / 1000, color: 4, yield: 0.72 },
  'Maris Otter Ale Malt': { type: 'grain', producer: 'Crisp', price: 499 / 25000, color: 5, yield: 0.82 },
  'Torrefied Maize': { type: 'grain', producer: 'Crisp', price: 39 / 1000, color: 3, yield: 0.80 },
  'Torrefied Wheat': { type: 'grain', producer: 'Crisp', price: 27 / 1000, color: 4, yield: 0.78 },

  // -- Dingemans ------------------------------------------------------------
  'Aromatic Malt': { type: 'grain', producer: 'Dingemans', price: 35 / 1000, color: 50, yield: 0.78 },
  'Biscuit Malt': { type: 'grain', producer: 'Dingemans', price: 35 / 1000, color: 50, yield: 0.78 },
  'Special B': { type: 'grain', producer: 'Dingemans', price: 35 / 1000, color: 310, yield: 0.72 },

  // -- Other grains and adjuncts --------------------------------------------
  'Extra Pale Malt': { type: 'grain', price: 29 / 1000, color: 3, yield: 0.81 },
  'Flaked Barley': { type: 'grain', producer: 'Stora Hällsta', price: 32 / 1000, color: 4, yield: 0.70 },
  'Flaked Oats': { type: 'grain', producer: 'AXA', price: 24.95 / 1500, color: 4, yield: 0.70 },
  'Flaked Wheat': { type: 'grain', price: 54 / 1000, color: 4, yield: 0.73 },
  'Golden Promise Malt': { type: 'grain', producer: 'Thomas Fawcett', price: 36 / 1000, color: 5, yield: 0.81 },
  'Naked Oat Malt': { type: 'grain', producer: 'Crisp', price: 39 / 1000, color: 4, yield: 0.76 },
  // Dry malt extract — dissolves straight into the boil, so no mash efficiency.
  'SprayMalt Extra Light': { type: 'grain', price: 55 / 500, color: 12, yield: 0.95, mash: false },

  // -- Sugars ---------------------------------------------------------------
  'Bread Syrup': { type: 'sugar', producer: 'Dansukker', price: 19.95 / 750, color: 200, yield: 0.80 },
  'Brown Sugar': { type: 'sugar', price: 20.95 / 2000, color: 60, yield: 0.98 },
  'Cane sugar': { type: 'sugar', producer: 'Dansukker', price: 21.95 / 500, color: 0, yield: 1.00 },
  'Caster sugar': { type: 'sugar', producer: 'Dansukker', price: 20.95 / 2000, color: 0, yield: 1.00 },
  // Lactose contributes gravity but yeast cannot ferment it.
  'Lactose': { type: 'sugar', price: 99 / 1000, color: 1, yield: 1.00, fermentable: false },

  // -- Honey ----------------------------------------------------------------
  // Honey is roughly 82% sugar, 18% water.
  'Blomsterhonung': { type: 'honey', producer: 'Lune de Miel', price: 89.95 / 1000, color: 15, yield: 0.82 },
  'Honung från flera sorters blommor': { type: 'honey', producer: 'ICA', price: 49.95 / 700, color: 15, yield: 0.82 },
  'Munkens Honung': { type: 'honey', producer: 'Munkens', price: 99 / 500, color: 15, yield: 0.82 },
  'Svensk landskapshonung': { type: 'honey', price: 83.95 / 650, color: 30, yield: 0.82 },

  // -- Fruit ----------------------------------------------------------------
  // Yields are the fermentable sugar content of the fruit. Colour is left at 0
  // because fruit tints the beer in ways the Morey equation does not model.
  'Apples': { type: 'fruit', price: 0, color: 0, yield: 0.12 },
  'Blackberries': { type: 'fruit', price: 16.95 / 250, color: 0, yield: 0.08 },
  'Frozen Mango': { type: 'fruit', producer: 'Ica', price: 21.95 / 250, color: 0, yield: 0.14 },
  'Frozen Raspberries': { type: 'fruit', price: 19.95 / 250, color: 0, yield: 0.09 },
  'Frozen Strawberries': { type: 'fruit', producer: 'Ica', price: 32.95 / 1000, color: 0, yield: 0.07 },
  'Passion fruit purée': { type: 'fruit', price: 25.95 / 250, color: 0, yield: 0.13 },
  'Pineapple puree': { type: 'fruit', price: 15.95 / 250, color: 0, yield: 0.12 },
  'Sloeberries': { type: 'fruit', producer: 'Wild harvested', price: 0, color: 0, yield: 0.09 }
}

/**
 * Hops. `alpha` is a fallback for additions that do not record the alpha acid of
 * the lot that was actually used; prefer the value on the addition itself.
 */
const hops = {
  'Amarillo': { price: 69 / 100, alpha: 8.5, origin: 'USA' },
  'Azacca': { price: 69 / 100, alpha: 11.0, origin: 'USA' },
  'Bramling Cross': { price: 59 / 100, alpha: 6.5, origin: 'England' },
  'Cascade': { price: 69 / 100, alpha: 6.0, origin: 'USA' },
  'Centennial': { price: 69 / 100, alpha: 9.5, origin: 'USA' },
  'Challenger': { price: 59 / 100, alpha: 7.5, origin: 'England' },
  'Chinook': { price: 69 / 100, alpha: 12.0, origin: 'USA' },
  'Citra': { price: 59 / 50, alpha: 13.0, origin: 'USA' },
  'Columbus': { price: 59 / 100, alpha: 14.5, origin: 'USA' },
  'East Kent Golding': { price: 59 / 100, alpha: 5.5, origin: 'England' },
  'Ekuanot': { price: 59 / 50, alpha: 14.0, origin: 'USA' },
  'El Dorado': { price: 59 / 100, alpha: 13.0, origin: 'USA' },
  'Ella': { price: 79 / 100, alpha: 15.0, origin: 'Australia' },
  'Fuggle': { price: 59 / 100, alpha: 4.5, origin: 'England' },
  'Galaxy': { price: 109 / 100, alpha: 15.0, origin: 'Australia' },
  'Hallertauer Mittelfrüh': { price: 59 / 100, alpha: 4.0, origin: 'Germany' },
  'Hersbrucker': { price: 59 / 100, alpha: 3.0, origin: 'Germany' },
  'Magnum': { price: 59 / 100, alpha: 12.5, origin: 'Germany' },
  'Mandarina Bavaria': { price: 59 / 100, alpha: 8.8, origin: 'Germany' },
  'Mosaic': { price: 59 / 50, alpha: 11.5, origin: 'USA' },
  'Motueka': { price: 89 / 100, alpha: 7.0, origin: 'New Zealand' },
  'Nectaron': { price: 129 / 100, alpha: 9.5, origin: 'New Zealand' },
  'Northern Brewer': { price: 59 / 100, alpha: 6.5, origin: 'Germany' },
  'Pacific Gem': { price: 69 / 100, alpha: 14.5, origin: 'New Zealand' },
  'Pacifica': { price: 89 / 100, alpha: 5.0, origin: 'New Zealand' },
  'Perle': { price: 59 / 100, alpha: 7.0, origin: 'Germany' },
  'Saaz': { price: 59 / 100, alpha: 3.2, origin: 'Czech' },
  'Simcoe': { price: 59 / 50, alpha: 13.0, origin: 'USA' },
  'Styrian Golding Bobek': { price: 59 / 100, alpha: 3.8, origin: 'Slovenia' },
  'Target': { price: 59 / 100, alpha: 9.0, origin: 'England' },
  'Tettnanger': { price: 59 / 100, alpha: 3.8, origin: 'Germany' },
  'Vista': { price: 79 / 100, alpha: 11.9, origin: 'USA' },
  'Wai-iti': { price: 89 / 100, alpha: 2.5, origin: 'New Zealand' },
  'Willamette': { price: 59 / 100, alpha: 5.5, origin: 'USA' },

  // Concentrated lupulin pellets. Roughly double the alpha acid of the plain
  // pellet, but none of the packets used so far carried a lot analysis, so
  // these alphas are estimates.
  'Amarillo Lupulinator': { price: 89 / 100, alpha: 16.0, origin: 'Germany', estimated: true },
  'Callista Lupulinator': { price: 89 / 100, alpha: 12.0, origin: 'Germany', estimated: true },
  'Hallertau Blanc Lupulinator': { price: 89 / 100, alpha: 20.0, origin: 'Germany', estimated: true },
  'Tango': { price: 69 / 100, alpha: 10.5, origin: 'Germany', estimated: true }
}

/** Yeast and other cultures. Attenuation is apparent attenuation, as a fraction. */
const cultures = {
  'Bavarian Wheat M20': { type: 'ale', form: 'dry', producer: "Mangrove Jack's", price: 39 / 10, attenuation: 0.75 },
  'Belgian Wit M21': { type: 'ale', form: 'dry', producer: "Mangrove Jack's", price: 39 / 10, attenuation: 0.75 },
  'Belle Saison': { type: 'ale', form: 'dry', producer: 'Lallemand', price: 59 / 11, attenuation: 0.85 },
  'Californian Lager M54': { type: 'lager', form: 'dry', producer: "Mangrove Jack's", price: 39 / 10, attenuation: 0.78 },
  'EC-1118': { type: 'champagne', form: 'dry', producer: 'Lalvin', price: 29 / 5, attenuation: 0.95 },
  'Fermoale New-E': { type: 'ale', form: 'dry', producer: 'AEB', price: 59 / 11, attenuation: 0.78 },
  'London ESB': { type: 'ale', form: 'dry', producer: 'Lallemand', price: 59 / 11, attenuation: 0.75 },
  'London Fog WLP066': { type: 'ale', form: 'liquid', producer: 'White Labs', price: 109 / 40, attenuation: 0.75 },
  'New England': { type: 'ale', form: 'dry', producer: 'Lallemand', price: 59 / 11, attenuation: 0.80 },
  'Safale BE-134': { type: 'ale', form: 'dry', producer: 'Fermentis', price: 49 / 11.5, attenuation: 0.92 },
  'Safale BE-256': { type: 'ale', form: 'dry', producer: 'Fermentis', price: 59 / 11.5, attenuation: 0.84 },
  'Safale K-97': { type: 'ale', form: 'dry', producer: 'Fermentis', price: 45 / 11.5, attenuation: 0.82 },
  'Safale S-04': { type: 'ale', form: 'dry', producer: 'Fermentis', price: 45 / 11.5, attenuation: 0.77 },
  'Safale S-33': { type: 'ale', form: 'dry', producer: 'Fermentis', price: 35 / 11.5, attenuation: 0.72 },
  'Safale T-58': { type: 'ale', form: 'dry', producer: 'Fermentis', price: 35 / 11.5, attenuation: 0.74 },
  'Safale US-05': { type: 'ale', form: 'dry', producer: 'Fermentis', price: 45 / 11.5, attenuation: 0.81 },
  'Safale WB-06': { type: 'ale', form: 'dry', producer: 'Fermentis', price: 49 / 11.5, attenuation: 0.86 },
  'Saflager S-23': { type: 'lager', form: 'dry', producer: 'Fermentis', price: 65 / 11.5, attenuation: 0.82 },
  'Saflager W-34/70': { type: 'lager', form: 'dry', producer: 'Fermentis', price: 65 / 11.5, attenuation: 0.83 },
  'Windsor Ale': { type: 'ale', form: 'dry', producer: 'Lallemand', price: 59 / 11, attenuation: 0.72 }
}

/**
 * Miscellaneous additions.
 *
 * Water agents carry `ions`, in milligrams of ion released per gram of salt.
 * Salts are assumed to be the hydrate that homebrew shops sell: gypsum and
 * calcium chloride as dihydrates, Epsom salt as the heptahydrate.
 *
 * Acids carry `alkalinity`, the milligrams of alkalinity as CaCO₃ neutralised
 * per millilitre.
 */
const miscellaneous = {
  // -- Water agents ---------------------------------------------------------
  'Baking Soda (NaHCO₃)': { type: 'water agent', price: 16 / 200, ions: { sodium: 273.7, bicarbonate: 726.4 } },
  'Calcium Chloride (CaCl₂)': { type: 'water agent', price: 109 / 1000, ions: { calcium: 272.6, chloride: 482.3 } },
  'Canning Salt (NaCl)': { type: 'water agent', price: 15 / 600, ions: { sodium: 393.4, chloride: 606.6 } },
  // Chalk barely dissolves in mash water. These ions are an upper bound; in
  // practice expect a third to a half of it, so prefer baking soda when you
  // actually need alkalinity.
  'Chalk (CaCO₃)': { type: 'water agent', price: 109 / 1000, ions: { calcium: 400.4, bicarbonate: 1219.2 }, estimated: true },
  'Epsom Salt (MgSO₄)': { type: 'water agent', price: 69 / 1000, ions: { magnesium: 98.6, sulfate: 389.7 } },
  'Gypsum (CaSO₄)': { type: 'water agent', price: 89 / 1000, ions: { calcium: 232.8, sulfate: 557.9 } },
  // 80% w/w lactic acid, 1.21 g/ml, molar mass 90.08 g/mol.
  'Lactic Acid 80%': { type: 'water agent', price: 79 / 250, ions: {}, alkalinity: 538 },

  // -- Finings --------------------------------------------------------------
  'Gelatin Powder': { type: 'fining', price: 20 / 100 },
  'Gelatin Sheet': { type: 'fining', price: 11 / 10 },
  // Protafloc tablets are cheap enough to round to nothing.
  'Protafloc': { type: 'fining', price: 0 },

  // -- Spices and flavourings -----------------------------------------------
  'Bitter orange peel': { type: 'spice', price: 16 / 16 },
  'Cardamom Pods (cracked)': { type: 'spice', price: 30 / 25 },
  'Cinnamon Stick': { type: 'spice', price: 12 / 4 },
  'Coriander': { type: 'spice', price: 22 / 27 },
  'Crushed Juniper Berries': { type: 'spice', price: 25 / 30 },
  'Dried basil': { type: 'spice', price: 26.95 / 10 },
  'Dried cilantro': { type: 'spice', price: 22.95 / 28 },
  'Dried Orange Peel': { type: 'spice', price: 16 / 16 },
  'Ginger': { type: 'spice', price: 51 / 1000 },
  'Ground coriander seed': { type: 'spice', price: 22 / 27 },
  'Sea Salt': { type: 'spice', price: 10 / 1000 },
  'Star anise': { type: 'spice', price: 16 / 25 },
  'Vanilla pod': { type: 'spice', price: 30 },
  'Whole Cloves': { type: 'spice', price: 20 / 25 },

  // -- Other ----------------------------------------------------------------
  'Cold Brew Coffee': { type: 'other', price: 60 / 1000 }
}

/** Water profiles, in mg/l. */
const waters = {
  'Västerås water': {
    calcium: 29,
    magnesium: 4.6,
    sulfate: 23,
    sodium: 11,
    chloride: 20,
    bicarbonate: 76
  }
}

/**
 * Names that appear in older recipes and mean the same thing as a canonical
 * name above. Prefer the canonical spelling in new recipes.
 */
const aliases = {
  'CaraAroma': 'Caraaroma',
  'Munich I Malt': 'Munic 1 Malt'
}

function lookup (table, name) {
  return table[name] ?? table[aliases[name]] ?? null
}

/** Look up an ingredient, throwing a useful error when it is not in the database. */
function require_ (table, tableName, name) {
  const entry = lookup(table, name)
  if (entry == null) throw new Error(`Unknown ${tableName}: ${JSON.stringify(name)} — add it to utils/ingredients.js`)
  return entry
}

module.exports = {
  fermentables,
  hops,
  cultures,
  miscellaneous,
  waters,
  aliases,

  fermentable: (name) => require_(fermentables, 'fermentable', name),
  hop: (name) => require_(hops, 'hop', name),
  culture: (name) => require_(cultures, 'culture', name),
  misc: (name) => require_(miscellaneous, 'miscellaneous addition', name),
  water: (name) => require_(waters, 'water profile', name),

  find: (name) => lookup(fermentables, name) ?? lookup(hops, name) ?? lookup(cultures, name) ?? lookup(miscellaneous, name)
}
