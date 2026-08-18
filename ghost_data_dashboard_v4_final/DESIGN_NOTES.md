# Design Notes

- V4 dashboard language: light gray canvas, white analytical panels, dark slate title bars, restrained teal accent.
- Data hierarchy is prioritized over decorative web design.
- Charts are simple SVG bar/line charts with hover tooltips and only task-relevant filters.
- Cross-document CSS View Transitions are retained as the single strong motion signature, with a CSS/JS fallback wipe.
- Mobile layout collapses dashboard grids, preserves horizontal navigation, reduces SVG margins, and adapts chart labels for narrow screens.
- Summary language separates evidence, interpretation, and hypotheses to reduce causal overclaiming.
