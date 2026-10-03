---
name: analyze-food
description: Nutritional analysis of a single whole food the user names — apple, corn, arugula, egg, salmon, lentils. Produces per-100 g and per-serving macro estimates with explicit uncertainty ranges, standout micronutrients against NRV thresholds, which regulated nutrition claims the food legitimately earns, compound cautions (oxalates, purines, goitrogens, FODMAPs, lectins, methylmercury, vitamin K), how cooking and storage move the numbers, and pairings that raise absorption. Use it whenever the user names a food and asks whether it is healthy, what is in it, how much protein or sugar or fiber it has, whether they should eat it, or how two foods compare. Do not use it for composed dishes, recipes, packaged products with an ingredient list, or a day's meal log.
---

# Analyze Food

One whole food per analysis. No nutrient database is available, so every number
here is recalled rather than looked up — the estimation discipline below is what
keeps that honest. Follow the output template in order.

## Scope

A **whole food** is one ingredient as it exists before composition: `apple`,
`corn`, `arugula`, `egg`, `salmon`, `lentils`, `whole milk`. A cultivar, cut, or
variety is still one food — `Granny Smith apple`, `chicken thigh`,
`basmati rice`. When the user names the specific form, analyze that form.

Out of scope. Redirect, don't guess:

| Input                                    | Response                                                        |
| ---------------------------------------- | --------------------------------------------------------------- |
| Composed dish ("chicken curry")          | Name its main ingredients; offer to analyze each one separately |
| Recipe with quantities                   | Same — analyze the dominant ingredients individually            |
| Packaged product with an ingredient list | Out of scope: no additive or processing model here              |
| A day's meals or food log                | Out of scope: no daily-target model here                        |
| A supplement or isolated nutrient        | Out of scope                                                    |

## Estimation discipline

Not optional. These rules are the reason the output is trustworthy.

1. **Ranges, never point values.** Write `0.2–0.4 g`, not `0.3 g`. The width of
   the range carries information.
2. **Tag confidence once, at the top**, using the table below. If the tag is
   Low, say so in words as well as in the range.
3. **Always state the serving basis.** `1 medium apple ≈ 180 g`,
   `1 large egg ≈ 50 g shelled`. Never an unqualified "one serving".
4. **Per 100 g is the primary unit**; the household serving is secondary. Give
   both, always.
5. **Micronutrients as ≈% NRV, rounded to the nearest 5.** Never milligrams to a
   decimal place.
6. **One caveat line per analysis**, immediately after the macro table.
7. **Refuse to invent.** If you cannot place the food, say so and stop. If you
   are interpolating from a close relative, name the relative and say that is
   what you are doing.

| Confidence | Applies to                                                                           | Range width             |
| ---------- | ------------------------------------------------------------------------------------ | ----------------------- |
| **High**   | Compositionally uniform staples: egg, white rice, olive oil, whole milk              | ≈ ±10%                  |
| **Medium** | Cultivar and ripeness spread: apple, potato, banana, carrot, most vegetables         | ≈ ±25%                  |
| **Low**    | Wild, seasonal, or highly variable: foraged greens, wild mushrooms, organ meat, game | ≈ ±50%, stated in words |

## Output template

Fixed order. Skip a section only when the food genuinely has nothing to report
there — never reorder.

### 1. Identity

One line: what the food is, the form assumed (raw / whole / skin on), and the
confidence tag.

### 2. Macros

| Per                  | 100 g | 1 medium X (≈ N g) |
| -------------------- | ----- | ------------------ |
| Energy               |       |                    |
| Protein              |       |                    |
| Fat                  |       |                    |
| — of which saturated |       |                    |
| Carbohydrate         |       |                    |
| — of which sugars    |       |                    |
| Fiber                |       |                    |
| Water                |       |                    |

Then, verbatim:

> Estimates from recall, not a database lookup. Variety, ripeness, soil, cut,
> and storage shift these further than the ranges show.

### 3. Standout micronutrients

Only nutrients reaching **≥15% NRV per 100 g**. Column per nutrient: ≈% NRV, and
one clause on why it matters or what limits its absorption.

If nothing clears 15%, say so plainly — that is a finding, not a gap. Water-rich
vegetables often clear nothing per 100 g but a great deal per realistic portion;
when that happens, say it and give the portion figure.

### 4. Claims earned

Run the food against the threshold table below and state only the claims it
actually meets. This is what stops "high in X" from being a vibe.

### 5. Cautions

Only the rows of the caution table that this food actually sits in. Do not
recite the table. If none apply, one line saying so.

### 6. Preparation

How cooking, cutting, and storage move the numbers for this specific food.

### 7. Pairings

What raises or blocks absorption of the nutrients this food actually carries.

### 8. Verdict

Two or three sentences: what the food is genuinely good for, what it is not, and
where it reasonably sits in a diet. No score out of ten.

## Claim thresholds (EU Reg. 1924/2006, per 100 g)

| Claim                       | Threshold                                                 |
| --------------------------- | --------------------------------------------------------- |
| Source of fibre             | ≥ 3 g                                                     |
| High fibre                  | ≥ 6 g                                                     |
| Source of protein           | ≥ 12% of energy from protein                              |
| High protein                | ≥ 20% of energy from protein                              |
| Low fat                     | ≤ 3 g (liquids ≤ 1.5 g/100 ml)                            |
| Fat-free                    | ≤ 0.5 g                                                   |
| Low saturates               | ≤ 1.5 g (liquids ≤ 0.75 g/100 ml) **and** ≤ 10% of energy |
| Low sugars                  | ≤ 5 g (liquids ≤ 2.5 g/100 ml)                            |
| Sugars-free                 | ≤ 0.5 g                                                   |
| Low sodium                  | ≤ 0.12 g sodium (= 0.3 g salt)                            |
| Very low sodium             | ≤ 0.04 g sodium                                           |
| Source of _vitamin/mineral_ | ≥ 15% NRV                                                 |
| High in _vitamin/mineral_   | ≥ 30% NRV                                                 |

Use the words only when the threshold is met. A banana carries ≈360 mg potassium
per 100 g against a 2000 mg NRV — 18%, so it is a _source of_ potassium, not
_high in_ it. Naturally occurring sugars still count as sugars: whole fruit
rarely earns "low sugars", and that is not an indictment of the fruit.

## Cautions

| Compound                      | Concentrated in                                                     | Matters for                                                   | Mitigation                                                          |
| ----------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| Oxalates                      | spinach, chard, beet greens, rhubarb, almonds, cocoa                | calcium-oxalate stone formers                                 | boil and discard the water (−30–60%); take calcium in the same meal |
| Purines                       | anchovy, sardine, liver, kidney, mussels, yeast extract             | gout, hyperuricaemia                                          | frequency and portion, not elimination                              |
| Goitrogens                    | raw cabbage, kale, broccoli, cassava, soy                           | iodine deficiency, thyroid disease                            | cooking deactivates most; adequate iodine matters more              |
| FODMAPs                       | onion, garlic, apple, pear, wheat, legumes                          | IBS                                                           | portion size is usually the lever, not exclusion                    |
| Histamine / scombroid         | aged cheese, cured meat, ferments, poorly chilled tuna and mackerel | histamine intolerance, MAOI users                             | freshness and unbroken cold chain                                   |
| Lectins (phytohaemagglutinin) | raw or undercooked kidney beans above all                           | everyone — acute GI toxicity                                  | hard boil ≥ 10 min; a slow cooker alone is not enough               |
| Solanine                      | green or sprouted potato, green tomato                              | everyone, dose-dependent                                      | cut away green parts; store dark and cool                           |
| Methylmercury                 | swordfish, shark, king mackerel, tilefish, bigeye tuna              | pregnancy, young children                                     | salmon, sardine, anchovy, trout are low-mercury                     |
| Cyanogenic glycosides         | bitter cassava, bitter almond, apricot kernel                       | everyone, dose-dependent                                      | soak, ferment, and cook cassava properly; do not eat kernels        |
| Vitamin K                     | kale, spinach, collards, broccoli                                   | warfarin users                                                | consistency of intake, not avoidance — the prescriber sets it       |
| Phytates                      | whole grains, legumes, nuts, seeds                                  | iron and zinc status on plant-heavy diets                     | soak, sprout, or ferment; pair with vitamin C                       |
| Nitrates                      | arugula, beetroot, celery, spinach                                  | generally beneficial (blood pressure); infants under 6 months | none needed for adults                                              |

## Preparation effects

| Food                          | What changes                                                                       | Practical move                                     |
| ----------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------- |
| Tomato                        | lycopene bioavailability rises sharply with heat and oil                           | cook it with fat                                   |
| Carrot, sweet potato, pumpkin | β-carotene absorption rises with cooking and dietary fat                           | cook, add fat                                      |
| Brassicas                     | sulforaphane collapses on boiling; myrosinase deactivates above ≈60 °C             | steam briefly, or chop and rest 40 min before heat |
| Garlic, onion                 | allicin forms only after crushing, and needs ≈10 min before heat                   | crush, wait, then cook                             |
| Potato, rice, pasta           | resistant starch rises after cooking then chilling, and survives reheating         | cook, cool, reheat if you like                     |
| Spinach, chard                | oxalate drops 30–60% when boiled and drained                                       | boil, discard the water                            |
| Legumes                       | lectins and trypsin inhibitors destroyed by hard boiling; phytate falls on soaking | soak, then boil hard                               |
| Egg                           | protein digestibility ≈50% raw against >90% cooked; avidin deactivated by heat     | cook it                                            |
| Whole grains, nuts, seeds     | phytate falls with soaking, sprouting, or sourdough fermentation                   | any of the three                                   |
| Anything                      | vitamin C and folate fall with heat, time, and water contact                       | steam or eat raw; don't boil and drain             |

## Pairings

| Pair                                                                        | Effect                                            |
| --------------------------------------------------------------------------- | ------------------------------------------------- |
| Non-heme iron (lentils, spinach, tofu) + vitamin C (pepper, citrus, tomato) | absorption up several-fold                        |
| Non-heme iron + tea or coffee tannins, or a calcium load                    | absorption down — separate by about an hour       |
| Vitamins A, D, E, K + dietary fat                                           | fat-soluble; near-useless without fat in the meal |
| Turmeric + black pepper                                                     | piperine raises curcumin bioavailability sharply  |
| Oxalate-rich food + calcium in the same meal                                | oxalate binds in the gut rather than the kidney   |
| Zinc + a phytate-heavy meal                                                 | absorption down; soak or ferment the grain        |

## Comparison mode

When the user names two or more foods:

1. Run the template for each, with the macros in one shared table.
2. Close with a single "which, for what" line tied to the goal the user stated —
   protein per calorie, fiber, satiety, micronutrient density, cost.
3. If no goal was stated, ask for one rather than crowning a winner. "Healthier"
   without a goal is not a question this skill can answer.

## Hard rules

1. **No medical advice.** Gout, CKD, thyroid disease, pregnancy, diabetes,
   anticoagulation: give the mechanism, then say the treating doctor sets the
   numbers. Never prescribe an intake.
2. **No drug dosing.** Flag a drug–nutrient interaction, then route it out.
3. **No moralizing.** Drop "clean", "toxic", "superfood", "guilt-free". Foods
   have properties, not virtue.
4. **No score out of ten.** It invents precision the analysis does not have.
5. **State ignorance plainly.** An unplaceable food gets "I can't estimate this
   reliably", not a confident guess in a table.
