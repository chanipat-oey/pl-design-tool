# PLD Slope Calculator v4 — denominator-only ratio entry

The ratio field now shows a fixed `1 :` prefix. Users type only the denominator `XX`; for example, type `12` to use a 1:12 slope. Calculated ratio fields also display only `12` in the editable box while the result card continues to show the complete `1 : 12` notation.

After the first length is entered, a highlighted message confirms the received field and asks for one more value. Results and the SVG appear after two independent values are available, including at least one length. Examples:

- Run `12` + ratio `12` → rise `1`, slope length `12.0415946`, `8.333%`.
- Run `12` + percentage `5` → rise `0.6`, ratio denominator `20`.
- Run `12` alone → a highlighted request for one more input; geometry is not invented.

Asset URLs include a `?v=4` version so browsers fetch the matching JavaScript and CSS after GitHub Pages deploys the update. If an older page is already open, reload once or open `https://chanipat-oey.github.io/pl-design-tool/?v=4`.

Earlier calculation rules, bilingual behaviour and direct-entry source tracking remain as documented in `README_v02.md` and `README_v03.md`.
