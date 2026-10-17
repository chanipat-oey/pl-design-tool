# PLD Slope Calculator v2 / เครื่องคำนวณความลาดชัน

## ภาษาไทย

เลือกคู่ข้อมูลที่ทราบจากเมนู แล้วกรอกในช่องสีขาว 2 ช่อง ช่องสีฟ้าจะแสดงผลคำนวณอัตโนมัติ:

1. ระยะทางยาว (แนวราบ) หน่วยเมตร
2. ระยะทางสูง หน่วยเมตร
3. ระยะทางเอียง หน่วยเมตร
4. ความลาดชันแบบ 1:XX เช่น `1:12` หรือ `12` (แนวตั้ง : แนวราบ)
5. ความลาดชันเป็นเปอร์เซ็นต์ เช่น `5` หรือ `5%`

เลือกภาษาไทยหรือ English ที่มุมบนขวาได้โดยไม่ล้างค่าที่กรอก แอปจะจำภาษาไว้ในเบราว์เซอร์เมื่ออนุญาต localStorage ปุ่มล้างค่าจะล้างข้อมูลทั้งหมด โดยคงภาษาและคู่ข้อมูลที่เลือกไว้

ตัวอย่าง: ระยะราบ 12 ม. + อัตราส่วน 1:12 → ระยะสูง 1 ม., ระยะเอียงประมาณ 12.042 ม., ความลาดชัน 8.333%, มุม 4.764°

**ข้อจำกัดทางคณิตศาสตร์:** อัตราส่วนและเปอร์เซ็นต์เป็นข้อมูลความลาดชันชนิดเดียวกัน (`% = 100 / XX`) จึงไม่สามารถใช้สองค่านี้ระบุระยะจริงได้ แอปจะแสดงมุมและแจ้งให้เปลี่ยนหนึ่งค่าเป็นระยะ หากสองค่าไม่ตรงกันจะแจ้งข้อผิดพลาด สำหรับพื้นราบ ระยะสูง 0 กับความลาดชัน 0% ก็ยังระบุระยะราบไม่ได้ เช่นเดียวกับแนวดิ่ง ระยะราบ 0 กับอัตราส่วน 1:0 ที่ยังไม่ระบุความสูง

## English

Choose any of the ten input pairs. Exactly two white fields are editable; the other three blue fields are calculated. Nine independent pairs determine the section (except degenerate zero cases). Ratio + percentage only determines inclination, not physical size. Contradictory slope-only inputs are rejected, with relative tolerance 1e-10 for floating-point conversion; rounded values such as 1:12 and 8.33% do not count as an exact matching pair.

Enter `1:12` or `12` for ratio, and `5` or `5%` for percentage. Ratio means vertical : horizontal. Level is `1:∞` or 0%; vertical is `1:0` or `∞%`. Finite non-negative lengths are required. Impossible geometry, all-zero sections and unsupported numeric ranges show an error. A matching slope-only pair shows metrics but leaves unknown lengths blank and hides the geometry rather than inventing a size.

The language switch translates labels, options, units, diagram, instructions and errors. It preserves entered values and the selected pair. Reset clears values and retains language and pair. Only language preference is stored locally; no measurements are saved or transmitted.

## Calculation and precision

- `Length = hypot(Run, Rise)`; missing leg uses Pythagoras in an overflow-resistant form.
- `Percentage = Rise / Run × 100`; `N = Run / Rise`; ratio is `1:N`.
- `Angle = atan2(Rise, Run) × 180 / π`.
- With run and ratio: `Rise = Run / N`; with rise and ratio: `Run = Rise × N`.
- With slope length and ratio: `Rise = Length / hypot(N, 1)`; `Run = Length × N / hypot(N, 1)`.

Calculated inputs show up to 9 significant digits; summary metrics and SVG labels show up to 3 decimal places (scientific notation for tiny/large values). Full-precision values remain in memory and are used when changing input pairs. Both SVG axes use the same scale. Very shallow or steep slopes can collapse at screen resolution; no vertical exaggeration is applied. This is a geometry tool, not a compliance check.

## Local use and tests

Open `index.html` in a modern browser. No dependencies, installation, backend or build step.

With Node.js 18+, run `npm test` (or `node --test tests/*.test.js`). Tests include the original geometry cases, all nine independent pairs, underdetermined/contradictory inputs, parser validation, zero/vertical limits, range checks, 801 angle/pair round trips and translation completeness.

## Deploy / เผยแพร่บน GitHub Pages

1. Merge the v2 pull request into `main`.
2. If Pages is already configured to publish `main / (root)`, the update deploys automatically after merge. Wait for the Pages workflow in **Actions** to finish.
3. For first deployment, open **Settings → Pages → Source → Deploy from a branch**, select `main` and `/ (root)`, then **Save**.
4. Open the URL displayed by GitHub Pages; for this repository it is `https://chanipat-oey.github.io/pl-design-tool/`. Refresh after the successful deployment.

Keep these files together at the repository root: `index.html`, `styles.css`, `calculator.js`, `translations.js`, `app.js`, `.nojekyll`. Relative URLs support project hosting. No CDN or external font is used; Thai text uses available system fonts.

The original README and v1 guide are preserved. This file documents the v2 behaviour.
