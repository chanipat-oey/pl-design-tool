# PLD Slope Calculator

A responsive, dependency-free slope calculator for landscape architects. HTML, CSS, JavaScript and inline SVG only. No backend, build step, analytics, CDN, or network requests. All calculations stay in the browser.

## Use locally

Open `index.html` directly in a modern browser. The example starts with a 10 m run and 0.5 m rise. Choose the two known dimensions, then edit them. The remaining field is read-only and recalculates immediately. Reset clears all dimensions and returns to Run + Rise.

## GitHub Pages deployment

1. Put `index.html`, `styles.css`, `calculator.js`, `app.js` and `.nojekyll` in the repository root (not inside another folder).
2. Commit and push these files to your publishing branch, normally `main`.
3. Open the repository's **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select `main` and `/ (root)`, then **Save**.
5. Wait for the Pages deployment to complete. Use the URL shown in Settings → Pages. For this repository the expected address is `https://chanipat-oey.github.io/pl-design-tool/`.

The deployment URL is only live after Pages has been enabled and successfully deployed. Relative asset URLs support both project and custom-domain hosting. No installation or build command is needed for hosting. Keep confidential project information out of a public repository.

## Calculations

- Slope Length = `hypot(Run, Rise)`.
- Missing Run or Rise = `sqrt(Length² − known leg²)`, evaluated in a form that avoids squaring large numbers.
- Percentage = `Rise / Run × 100`.
- Ratio = `1 : (Run / Rise)`; vertical to horizontal.
- Inclination = `atan2(Rise, Run) × 180 / π`.

Non-negative finite lengths only. Slope Length cannot be smaller than a known leg. Equality is accepted: a positive run with zero rise is level (0%, 1 : ∞, 0°); zero run with positive rise is vertical (∞%, 1 : 0, 90°). An all-zero section is rejected because its slope is undefined. Missing or invalid values clear previous results and geometry. Values beyond JavaScript's representable numeric range are rejected. Results and diagram labels are rounded to three decimal places, or scientific notation for very small/large numbers. The calculated input retains full numeric precision. All computations use the unrounded values.

The SVG fits the triangle using one uniform scale for both axes; it never exaggerates the rise. Extremely shallow or steep slopes may visually collapse at screen resolution. Dimension offsets and the angle annotation are graphical annotations, not additional geometry. This tool calculates geometry; it does not assess accessibility, drainage, constructability or regulatory compliance.

## Automated tests

With Node.js 18 or later installed, run `npm test` or `node --test tests/calculator.test.js`. There are no packages to install. Tests cover all three input pairs, known triangles, landscape gradients, zero and vertical slopes, impossible geometry, input errors, large/tiny dimensions and round trips across angles.

## Files

`index.html`: interface; `styles.css`: responsive layout; `calculator.js`: pure calculation functions (browser and Node); `app.js`: input state and SVG; `tests/calculator.test.js`: Node built-in test suite.

The original `README.md` is retained unchanged; this README documents the new application.
