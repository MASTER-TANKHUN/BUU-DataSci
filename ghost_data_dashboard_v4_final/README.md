# Ghost Data Dashboard — V4 Final

Vanilla HTML / CSS / JS multi-page dashboard based on the supplied Final.zip analyses.

## Pages
- `index.html` — Overview of the four retained insights
- `reach.html` — Caption status vs average views + total views by year
- `timing.html` — Average views by published day of week
- `narrative.html` — Narrative Arc from unstructured caption text

## Run
For the best cross-document View Transition behavior:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Data honesty
- Caption averages and yearly totals come from the supplied notebook output.
- The Day-of-Week source notebook is empty in Final.zip, so the page uses ranking/relative bar lengths from the supplied chart and only labels Wednesday as approximately 1.1M views.
- Narrative Arc uses the supplied 534-story feature table.
- Explanatory hypotheses are visually separated from results that the data directly supports.
