# PL Design Tools

Static bilingual calculators for landscape design geometry. The project has no backend or external runtime dependencies and can be hosted directly on GitHub Pages.

## Tools

- `index.html` — slope calculator using any two compatible values from run, rise, slope length, ratio and percentage. Optional start/end levels can replace the rise. Optional landings divide the ramp into equal flights using a user-defined maximum horizontal run; landing lengths may be uniform or entered separately. The user can either extend the overall footprint by adding landings or keep the entered footprint fixed and make the ramp flights steeper.
- `stairs.html` — stair calculator using the two latest edited values from eight fields. Optional start/end levels can replace total rise. Optional landings divide risers as evenly as possible between a user-defined number of flights, with uniform or individually entered landing lengths. The same extend/fixed footprint choice is available. All length inputs and outputs use metres. It compares the user's geometry with a separate `2R + T = 0.630 m` option using two proportionally matched section drawings.
- `vehicle-ramp.html` — five-segment transition ramp calculator for low-clearance vehicles. Optional 1:20 intro/outro segments and independent 1:12 entry/exit transitions can be longer than the 3 m minimum. Each segment can optionally use a custom slope while retaining the standard values as defaults. In design mode, the entered main run remains fixed and derives the main slope; selecting a custom main slope instead calculates the required main run. Transition segments warn below 3 m, the main segment warns below 6 m, and main slopes outside 1:7–1:10 are flagged. It can calculate the required footprint or check an available footprint against a 1:10 target and 1:7 maximum main slope, with a true-proportion section, cumulative levels, individual segment dimensions and an overall dimension chain.

For stairs, total tread count equals riser count minus the number of flights; intermediate landings are measured separately. Two primary inputs do not mathematically define every stair dimension, so unspecified values use starting targets of approximately 0.150 m riser and 0.300 m tread. The interface labels this assumption. The 0.630 m result is a design comparison, not a statement of regulatory compliance.

Levels accept positive, zero and negative project datums. Lengths remain non-negative. Landing controls are optional configuration and do not count as either of the two primary geometry inputs.

The ratio, percentage and angle shown for a ramp or stair flight exclude level landings. When landings are enabled, the interface also reports the overall average ratio, percentage and angle using total rise divided by the complete horizontal footprint.

## Test locally

Run the automated calculation tests with Node.js:

```sh
node --test tests/*.test.js
```

Serve the repository root with any static HTTP server and open `index.html`, `stairs.html` or `vehicle-ramp.html`.

## Deploy with GitHub Pages

1. Push the files to the repository's default branch.
2. Open **Settings → Pages** in GitHub.
3. Select **Deploy from a branch**.
4. Select the default branch and the repository root, then save.
5. Open the Pages URL after the deployment workflow completes.
