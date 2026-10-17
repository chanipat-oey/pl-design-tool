# PLD Slope Calculator v3 — Direct entry / กรอกได้ทันที

## วิธีใช้

กรอกตัวเลขได้เลยในช่องระยะราบ ระยะสูง ระยะเอียง อัตราส่วน 1:XX หรือเปอร์เซ็นต์ ทุกช่องแก้ได้ตลอด ไม่ต้องเลือกเมนูหรือกดคำนวณ รูปตัดและผลลัพธ์เปลี่ยนทันทีเมื่อมีข้อมูลเพียงพอ

- ต้องมีข้อมูลอิสระ 2 ค่า โดยอย่างน้อย 1 ค่าเป็นระยะ
- แอปใช้ 2 ค่าที่แก้ล่าสุดเป็นค่าตั้งต้น และแสดงป้าย **ค่าตั้งต้น** พร้อมบรรทัด **ยึดค่า:** ให้ตรวจได้
- เมื่อแก้ % หรือ 1:XX แอปคงระยะตั้งต้นไว้ และแทนที่ความลาดชันเดิม
- เมื่อแก้ระยะอีกช่อง แอปใช้ระยะนั้นร่วมกับค่าตั้งต้นล่าสุดอีกหนึ่งค่า
- ช่องผลคำนวณสีฟ้าก็แก้ได้ การคลิกดูโดยไม่แก้ไขจะไม่เปลี่ยนค่าตั้งต้น
- หากกรอกเพียง 1:XX และ % แอปใช้ความลาดชันล่าสุดและขอระยะเพิ่ม เพราะยังระบุขนาดจริงไม่ได้
- ล้างค่าจะล้างทั้งตัวเลขและประวัติค่าตั้งต้น แต่เก็บภาษาที่เลือกไว้

ตัวอย่าง: ระยะราบ 12 ม. → อัตราส่วน 1:12 → ระยะสูง 1 ม. เปลี่ยนอัตราส่วนเป็น 1:20 → ระยะสูง 0.6 ม., ความลาดชัน 5% และรูปตัดเปลี่ยนทันที โดยระยะราบยังเป็น 12 ม.

## Direct-entry behaviour

All five inputs are always editable. There is no pair selector, submit button, or blur/Enter requirement. Each input event recalculates results and SVG. The two latest compatible user-edited fields are sources; at least one must be a length. A new ratio or percentage replaces the other slope source and retains the length. A new length keeps the most recent other non-empty source. Calculated fields never become sources unless edited. Clicking a field does not change the sources.

The app starts empty. Incomplete or invalid source values remain editable and clear stale derived lengths, results and geometry. A single valid slope can display its equivalent ratio/percentage and angle, but requires a length before drawing the section. No default size is assumed. Degenerate level/vertical cases also request an independent length where needed. Reset clears source history and all values; switching language preserves values and history.

## Run, test and deploy

Open `index.html` directly in a browser. No dependencies or backend. Run `npm test` with Node.js 18+ for geometry and direct-entry state tests. `input-state.js` contains the pure input-history logic, used by the browser and tested independently. Original geometry tests and v2 tests remain included.

Merge this update into `main`. If GitHub Pages already publishes `main / (root)`, the site updates after its deployment workflow completes. Otherwise enable **Settings → Pages → Deploy from a branch → main → / (root) → Save**. Deploy `index.html`, `styles.css`, `calculator.js`, `input-state.js`, `translations.js`, `app.js` and `.nojekyll` together at the root.

`README_v02.md` documents the mathematical formulas and edge cases; its pair-selection instructions describe the previous UI. This document supersedes those interaction instructions. Earlier guides and versions are preserved.
