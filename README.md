# PL Design Tools

Static bilingual calculators for landscape design geometry. The project has no backend or external runtime dependencies and can be hosted directly on GitHub Pages.

## Tools

- `index.html` — slope calculator using any two compatible values from run, rise, slope length, ratio and percentage.
- `stairs.html` — stair calculator using the two latest edited values from eight fields. It compares the user's geometry with a separate `2R + T = 630 mm` option using two proportionally matched section drawings.

The stair calculator assumes one flight has one fewer tread than risers. Two inputs do not mathematically define every stair dimension, so unspecified values use starting targets of approximately 150 mm riser and 300 mm tread. The interface labels this assumption. The 630 mm result is a design comparison, not a statement of regulatory compliance.

## Test locally

Run the automated calculation tests with Node.js:

```sh
node --test tests/*.test.js
```

Serve the repository root with any static HTTP server and open `index.html` or `stairs.html`.

## Deploy with GitHub Pages

1. Push the files to the repository's default branch.
2. Open **Settings → Pages** in GitHub.
3. Select **Deploy from a branch**.
4. Select the default branch and the repository root, then save.
5. Open the Pages URL after the deployment workflow completes.
