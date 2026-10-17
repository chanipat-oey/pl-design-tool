(function (root) {
  'use strict';
  const translations = {
    th: {
      brand: 'เครื่องมือออกแบบ', header: 'ภูมิสถาปัตยกรรม / เรขาคณิต', eyebrow: '01 / คำนวณความลาดชัน',
      intro: 'เลือกข้อมูลที่ทราบ 2 ค่าจาก 5 รายการ แล้วคำนวณค่าที่เหลืออัตโนมัติ',
      dimensions: 'ข้อมูลความลาดชัน', units: 'เมตร / อัตราส่วน / %', known: 'เลือก 2 ค่าที่ทราบ',
      hint: 'ช่องสีขาวใช้กรอกข้อมูล ช่องสีฟ้าเป็นผลคำนวณ', input: 'กรอกค่า', calculated: 'คำนวณ',
      run: 'ระยะทางยาว (แนวราบ)', rise: 'ระยะทางสูง', length: 'ระยะทางเอียง', ratio: 'ความลาดชัน 1:XX', percentage: 'ความลาดชันเป็น %',
      ratioHelp: 'กรอก 1:12 หรือ 12 · แนวตั้ง : แนวราบ', percentageHelp: 'กรอก 5 หรือ 5%', metre: 'ม.',
      reset: 'ล้างค่า', section: 'รูปตัดความลาดชัน', live: 'ปรับตามข้อมูล', sectionCode: 'รูปตัด A–A', scale: 'สัดส่วนจริง · ระยะเป็นเมตร',
      percentFormula: 'ระยะสูง ÷ ระยะราบ × 100', ratioFormula: 'แนวตั้ง : แนวราบ', angle: 'มุมเอียง', angleFormula: 'วัดจากแนวราบ',
      noteTitle: 'เลือกคู่ข้อมูลอย่างไร?', note: 'ใช้ระยะ 2 ค่า หรือระยะ 1 ค่า + ความลาดชัน 1 ค่า อัตราส่วนกับ % เพียงอย่างเดียวบอกมุมได้ แต่หาระยะจริงไม่ได้',
      footer: 'เครื่องมือสำหรับภูมิสถาปนิก', scope: 'คำนวณเรขาคณิต · ตรวจสอบข้อกำหนดโครงการแยกต่างหาก',
      ready: 'คำนวณอัตโนมัติ · ผลแสดงแบบปัดเศษ แต่ใช้ค่าความละเอียดเต็มในการคำนวณ',
      level: 'พื้นราบ · ความลาดชัน 0% · อัตราส่วน 1:∞', vertical: 'แนวดิ่ง · ความลาดชัน ∞% · อัตราส่วน 1:0',
      needsDistance: 'ข้อมูลนี้บอกมุมได้ แต่ยังระบุระยะจริงไม่ได้ เลือกคู่ข้อมูลที่มีระยะราบหรือระยะเอียงที่มากกว่า 0 (แนวดิ่งใช้ระยะสูงหรือระยะเอียง)',
      slopePairHelp: 'อัตราส่วนกับ % เป็นข้อมูลชนิดเดียวกัน จึงต้องเปลี่ยนหนึ่งช่องเป็นระยะเพื่อคำนวณขนาดจริง',
      empty: 'กรอกข้อมูลให้ครบ 2 ค่า', emptySecond: 'เพื่อแสดงรูปตัดตามสัดส่วนจริง', undetermined: 'ยังระบุขนาดจริงไม่ได้', undeterminedSecond: 'เลือกคู่ข้อมูลที่มีระยะอย่างน้อย 1 ค่า',
      diagramRun: 'ระยะราบ', diagramRise: 'ระยะสูง', diagramLength: 'ระยะเอียง', slope: 'ความลาดชัน', verticalLabel: 'แนวดิ่ง',
      diagramDescription: 'รูปตัดใช้มาตราส่วนเดียวกันทั้งแนวราบและแนวตั้ง',
      errors: {
        MISSING: 'กรุณากรอกข้อมูลที่เลือกให้ครบทั้ง 2 ค่า', INVALID: 'กรุณากรอกตัวเลขตั้งแต่ 0 ขึ้นไป ไม่ใช้ค่าติดลบหรือตัวอักษร',
        RATIO: 'กรุณากรอกอัตราส่วนแบบ 1:12 หรือกรอกเฉพาะ 12', GEOMETRY: 'ระยะเอียงต้องไม่น้อยกว่าระยะราบหรือระยะสูงที่ทราบ',
        ZERO: 'ระยะอย่างน้อยหนึ่งค่าต้องมากกว่า 0 จุดที่ไม่มีความยาวไม่สามารถระบุความลาดชันได้', RANGE: 'ค่าที่กรอกเกินช่วงความละเอียดที่เครื่องคำนวณรองรับ',
        PAIR: 'กรุณาเลือกคู่ข้อมูลที่ถูกต้อง', CONFLICT: 'อัตราส่วนกับเปอร์เซ็นต์ไม่ตรงกัน เช่น 1:20 ต้องเท่ากับ 5% และยังต้องมีระยะเพื่อระบุขนาดจริง',
        LEVEL: 'พื้นราบที่มีความลาดชัน 0% ต้องมีระยะสูงเท่ากับ 0', VERTICAL: 'แนวดิ่งที่มีอัตราส่วน 1:0 ต้องมีระยะราบเท่ากับ 0'
      }
    },
    en: {
      brand: 'DESIGN TOOLS', header: 'LANDSCAPE / GEOMETRY', eyebrow: '01 / SLOPE GEOMETRY',
      intro: 'Choose two known values from five. Calculate the rest automatically.',
      dimensions: 'Slope inputs', units: 'METRES / RATIO / %', known: 'Choose two known values',
      hint: 'White fields are inputs. Blue fields are calculated.', input: 'INPUT', calculated: 'CALCULATED',
      run: 'Horizontal Run', rise: 'Vertical Rise', length: 'Slope Length', ratio: 'Slope Ratio 1:N', percentage: 'Slope Percentage',
      ratioHelp: 'Enter 1:12 or 12 · vertical : horizontal', percentageHelp: 'Enter 5 or 5%', metre: 'm',
      reset: 'Reset', section: 'Slope section', live: 'LIVE GEOMETRY', sectionCode: 'SECTION A–A', scale: 'True proportions · dimensions in m',
      percentFormula: 'Rise / Run × 100', ratioFormula: 'Vertical : Horizontal', angle: 'Inclination Angle', angleFormula: 'Measured from the horizontal',
      noteTitle: 'Which two values?', note: 'Use two lengths, or one length and one slope value. Ratio and percentage alone determine the angle, but cannot determine physical lengths.',
      footer: 'Landscape architecture tools', scope: 'Geometry only · Check project requirements separately.',
      ready: 'Calculated automatically · display rounded; calculations use full precision.',
      level: 'Level surface · 0% slope · ratio 1:∞', vertical: 'Vertical section · ∞% slope · ratio 1:0',
      needsDistance: 'The angle is known, but the lengths are not determined. Choose a pair with a positive run or slope length (for a vertical section, use rise or slope length).',
      slopePairHelp: 'Ratio and percentage describe the same slope. Replace one input with a length to determine the section size.',
      empty: 'Enter two valid values', emptySecond: 'to see the section in true proportion', undetermined: 'Physical lengths are not determined', undeterminedSecond: 'Choose a pair that includes a length',
      diagramRun: 'Run', diagramRise: 'Rise', diagramLength: 'Length', slope: 'slope', verticalLabel: 'Vertical slope',
      diagramDescription: 'The horizontal and vertical dimensions use the same scale.',
      errors: {
        MISSING: 'Enter both selected values.', INVALID: 'Use non-negative numbers. Negative values and letters are not accepted.',
        RATIO: 'Enter a ratio such as 1:12 or its denominator 12.', GEOMETRY: 'Slope Length must be at least as long as the known Run or Rise.',
        ZERO: 'At least one length must be greater than zero. A zero-length point has no slope.', RANGE: 'These values exceed the supported numeric range.',
        PAIR: 'Choose a valid pair of inputs.', CONFLICT: 'Ratio and percentage do not match: for example, 1:20 equals 5%. A length is also needed to determine the section size.',
        LEVEL: 'A level surface (0% slope) must have zero rise.', VERTICAL: 'A vertical section (1:0) must have zero run.'
      }
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = translations;
  else root.SlopeTranslations = translations;
})(typeof globalThis !== 'undefined' ? globalThis : this);
