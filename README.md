# Landscape Design Tools

Static bilingual calculators for landscape design geometry. The project has no backend or external runtime dependencies and can be hosted directly on GitHub Pages.

## Tools

- `index.html` — home page and tool directory.
- `slope-stair/index.html` — slope calculator using any two compatible values from run, rise, slope length, ratio and percentage. Optional start/end levels and landings are supported.
- `slope-stair/stairs.html` — stair calculator using the two latest edited values from eight fields, with levels, landings and a separate `2R + T = 0.630 m` comparison.
- `vehicle-ramp/index.html` — five-segment transition ramp calculator for low-clearance vehicles, with custom slopes, level tracking, limit warnings and a dimension chain.

For stairs, total tread count equals riser count minus the number of flights; intermediate landings are measured separately. Two primary inputs do not mathematically define every stair dimension, so unspecified values use starting targets of approximately 0.150 m riser and 0.300 m tread. The interface labels this assumption. The 0.630 m result is a design comparison, not a statement of regulatory compliance.

Levels accept positive, zero and negative project datums. Lengths remain non-negative. Landing controls are optional configuration and do not count as either of the two primary geometry inputs.

The ratio, percentage and angle shown for a ramp or stair flight exclude level landings. When landings are enabled, the interface also reports the overall average ratio, percentage and angle using total rise divided by the complete horizontal footprint.

## Test locally

Run the automated calculation tests with Node.js:

```sh
node --test tests/*.test.js
```

Serve the repository root with any static HTTP server and open `/`, `/slope-stair/`, `/slope-stair/stairs.html` or `/vehicle-ramp/`.

## Deploy with GitHub Pages

1. Push the files to the repository's default branch.
2. Open **Settings → Pages** in GitHub.
3. Select **Deploy from a branch**.
4. Select the default branch and the repository root, then save.
5. Open `https://landscape-design-tools.github.io/` after the deployment workflow completes.
