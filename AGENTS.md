# Working in this repository

A collection of beer recipes in [BeerJSON v1](https://github.com/beerjson/beerjson) format.
One recipe per file, one file per brew, at the top level. `readme.md` indexes
them; `doc/` holds the brew day, keg day and bottle day checklists.

## Before you edit a recipe

Run the analyzer. It answers the questions you would otherwise have to guess at,
and it catches ingredients that are not in the reference data yet.

```bash
node utils/analyze-recipe.js my-recipe.json
```

That reports estimated original and final gravity, ABV, IBU, colour, the water
profile of both the mash and the finished beer, and what the ingredients cost.
Add `--verbose` to see which ingredient contributed what.

Other things worth knowing about:

| Command | What it does |
| :------ | :----------- |
| `node utils/analyze-recipe.js --summary *.json` | One line per recipe. Good for comparing a new recipe against every previous one. |
| `node utils/analyze-recipe.js --efficiency *.json` | Back-solves the brewhouse efficiency each recipe implies from its recorded gravity. |
| `node utils/calculate-cost.js *.json` | Ingredient cost per recipe. |
| `node utils/summarize-ingredients.js *.json` | How much of each ingredient has been used, across every recipe. |
| `node utils/water.js *.json` | Water volumes and ABV, oldest first. |

Everything is plain Node with no dependencies and no build step.

## The code

- `utils/ingredients.js` — reference data for every ingredient: price, colour,
  extract yield, alpha acid, attenuation, ion contributions. The header comment
  documents the units of every field.
- `utils/brewing.js` — the calculations, as pure functions of a recipe. Nothing
  in here prints.
- `utils/analyze-recipe.js` — the command line front end.

If you add an ingredient to a recipe, add it to `utils/ingredients.js` in the
same change, otherwise every tool will fail on that recipe. The tools tell you
exactly which name they could not find.

## How much to trust the numbers

Colour and gravity are built on typical maltster spec values rather than lot
analyses, so treat them as estimates:

- **Original gravity** is within 5 gravity points of the recorded value for half
  the recipes here, and within 12 for ninety percent of them. Fruit beers are
  the worst, because fruit sugar content varies enormously.
- **Brewhouse efficiency defaults to 48%**, which is not a guess: it is the
  median back-solved from every recipe with a recorded gravity, and it has sat
  between 45% and 52% every year since 2020. It is far below the 70–80% a
  textbook quotes, so do not "correct" it upward — the recipes here really do
  need the grain bills they have. Pass `--assume-efficiency=0.6` to explore
  what a better day would give.
- **IBU** uses Tinseth. Only boil additions count. Dry hops and flameout
  additions at zero minutes contribute nothing.
- **Colour** uses Morey, and ignores fruit entirely.
- **Mash pH is not calculated.** That needs the acidity and buffering capacity
  of each malt, which is not in the reference data. Residual alkalinity is
  reported instead, which is the input that actually moves mash pH.
- **Residual alkalinity bands are style dependent, so do not read a single
  number as a fault.** The usual rule of thumb — pale beers want residual
  alkalinity near zero, dark beers want it high — is calibrated on British and
  American barley grists, and it does not transfer to Bavarian styles. Munich
  water sits near +140, so a Weissbier at +80 is traditional rather than
  broken, and the ferulic acid rest that gives Weissbier its clove character
  wants the higher mash pH that comes with it. Across the recipes here,
  residual alkalinity has no measurable effect on brewhouse efficiency
  (r = -0.04 over 126 recipes), so before calling a water profile wrong, check
  it against the style's traditional water and against how the beer actually
  turned out.

## Recipe conventions

- Weights in grams, volumes in litres, gravity in `sg`, colour never stored on
  the recipe — it is calculated.
- `batch_size` is the volume going into the fermenter, and the boil is assumed
  to end there. `packaging.packaged_volume` is what actually made it to the keg.
- Record `original_gravity` and `final_gravity` as measured, once you have
  brewed it. Those measurements are what keeps the efficiency figure honest.
- Water additions carry the full Västerås tap water profile, and the salts go in
  as `miscellaneous_additions` of type `water agent` with `use: add_to_mash`.
- Hop additions should carry the `alpha_acid` of the packet actually used. The
  database's typical value is only a fallback, and the analyzer stars it when it
  had to fall back.
