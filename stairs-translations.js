(function (root) {
  'use strict';
  const translations = {
    th: {
      brand:'เครื่องมือออกแบบ', header:'ภูมิสถาปัตยกรรม / เรขาคณิต', slopeTool:'ความลาดชัน', stairTool:'บันได',
      eyebrow:'02 / คำนวณบันได', intro:'กรอก 2 ค่า ตัวเลขและรูปตัดทั้งสองแบบจะปรับทันที', inputsTitle:'ข้อมูลบันได', units:'จำนวน / ม. / %',
      hint:'พิมพ์ได้ทุกช่อง ระบบใช้ 2 ค่าที่แก้ล่าสุดเป็นค่าตั้งต้น', input:'ค่าตั้งต้น', calculated:'คำนวณ · แก้ได้', using:'ยึดค่า:',
      risers:'จำนวนลูกตั้ง', treads:'จำนวนลูกนอน', totalRise:'ความต่างระดับรวม', totalRun:'ระยะทางนอนรวม', riserHeight:'ความสูงลูกตั้งที่ต้องการ', treadDepth:'ความลึกลูกนอนที่ต้องการ', ratio:'ความลาดชัน 1:XX', percentage:'ความลาดชันเป็น %',
      count:'ขั้น', metre:'ม.', ratioHelp:'กรอกเฉพาะเลข XX เช่น 2', percentHelp:'กรอกเฉพาะตัวเลข เช่น 50',
      start:'เริ่มกรอก 2 ค่า', received:'รับค่าแล้ว 1 ค่า · กรอกอีก 1 ช่องเพื่อคำนวณ', ready:'คำนวณแล้ว · จำนวนขั้นเป็นจำนวนเต็มและใช้สัดส่วนจริงในรูปตัด', assumptions:'ค่าที่ไม่ได้กรอกใช้เป้าหมายเริ่มต้น R≈0.150 ม. และ T≈0.300 ม. เพื่อสร้างแบบเปรียบเทียบ', reset:'ล้างค่า',
      comparison:'เปรียบเทียบรูปตัดบันได', sameScale:'มาตราส่วนเดียวกันทั้ง 2 ภาพ', yourResult:'ผลลัพธ์ตามค่าของเอย', yourCaption:'ใช้ค่าที่กรอกและแสดงค่าที่ก่อสร้างได้จริง', proposal:'ข้อเสนอ 2R+T=0.630 ม.', proposalCaption:'รักษาข้อมูลหลักและปรับสัดส่วนขั้นเพื่อเปรียบเทียบ',
      sectionA:'รูปตัด A — ค่าที่กรอก', sectionB:'รูปตัด B — สูตร 0.630 ม.', totalRiseLabel:'สูงรวม', totalRunLabel:'ยาวรวม', riserLabel:'ลูกตั้ง', treadLabel:'ลูกนอน', comfortLabel:'2R+T',
      compareTitle:'เปรียบเทียบตัวเลข', item:'รายการ', current:'ตามค่าของเอย', suggested:'ข้อเสนอ 0.630 ม.', difference:'ผลต่าง', angle:'มุมบันได',
      noteTitle:'หลักการคำนวณ', note:'จำนวนลูกนอนเท่ากับจำนวนลูกตั้งลบหนึ่ง ค่าที่กรอกยังคงเป็นค่าตั้งต้น ส่วนสูตร 0.630 ม. แสดงเป็นข้อเสนอแยกต่างหากและไม่รับรองการผ่านข้อกำหนดโครงการ',
      footer:'เครื่องมือสำหรับภูมิสถาปนิก', scope:'คำนวณเรขาคณิต · ตรวจสอบกฎหมาย การเข้าถึง ชานพัก และราวจับแยกต่างหาก', empty:'กรอกข้อมูลให้ครบ 2 ค่า', emptySecond:'เพื่อสร้างและเปรียบเทียบรูปตัด',
      errors:{SECOND:'กรอกอีก 1 ค่าเพื่อคำนวณ',INVALID:'กรอกตัวเลขที่มากกว่า 0 ไม่ใช้ค่าติดลบหรือตัวอักษร',COUNT:'จำนวนขั้นต้องเป็นจำนวนเต็มตั้งแต่ 1 ถึง 200',PAIR:'คู่ข้อมูลไม่ถูกต้อง',DUPLICATE_SLOPE:'1:XX และ % เป็นข้อมูลความลาดชันเดียวกัน กรุณาเปลี่ยนหนึ่งช่องเป็นจำนวนหรือระยะ',COUNT_RELATION:'บันไดหนึ่งช่วงต้องมีจำนวนลูกนอนเท่ากับจำนวนลูกตั้งลบหนึ่ง',GEOMETRY:'ข้อมูลชุดนี้ไม่สามารถสร้างรูปตัดบันไดที่เป็นไปได้'}
    },
    en: {
      brand:'DESIGN TOOLS', header:'LANDSCAPE / GEOMETRY', slopeTool:'Slope', stairTool:'Stairs',
      eyebrow:'02 / STAIR GEOMETRY', intro:'Enter two values. Both calculated sections update immediately.', inputsTitle:'Stair inputs', units:'COUNT / m / %',
      hint:'Use any field. The two latest edits drive the calculation.', input:'SOURCE', calculated:'CALCULATED · EDITABLE', using:'Using:',
      risers:'Number of Risers', treads:'Number of Treads', totalRise:'Total Rise', totalRun:'Total Run', riserHeight:'Target Riser Height', treadDepth:'Target Tread Depth', ratio:'Slope Ratio 1:N', percentage:'Slope Percentage',
      count:'steps', metre:'m', ratioHelp:'Enter XX only, for example 2', percentHelp:'Enter a number, for example 50',
      start:'Enter two values to begin', received:'1 value received · enter one more value', ready:'Calculated · step counts are whole numbers and sections use true proportions', assumptions:'Unspecified values use starting targets of R≈0.150 m and T≈0.300 m for comparison.', reset:'Reset',
      comparison:'Compare stair sections', sameScale:'Both drawings use the same scale', yourResult:'Result from your values', yourCaption:'Uses your inputs and shows buildable whole-step geometry', proposal:'2R+T=0.630 m option', proposalCaption:'Retains the primary constraints and adjusts step proportions for comparison',
      sectionA:'SECTION A — INPUT RESULT', sectionB:'SECTION B — 0.630 m OPTION', totalRiseLabel:'total rise', totalRunLabel:'total run', riserLabel:'riser', treadLabel:'tread', comfortLabel:'2R+T',
      compareTitle:'Value comparison', item:'Item', current:'Your result', suggested:'0.630 m option', difference:'Difference', angle:'Stair angle',
      noteTitle:'Calculation basis', note:'Tread count equals riser count minus one. Your entries remain the source values; the 0.630 m calculation is shown separately and does not confirm compliance with project requirements.',
      footer:'Landscape architecture tools', scope:'Geometry only · Check regulations, accessibility, landings and handrails separately.', empty:'Enter two valid values', emptySecond:'to generate and compare the stair sections',
      errors:{SECOND:'Enter one more value to calculate.',INVALID:'Use numbers greater than zero. Negative values and letters are not accepted.',COUNT:'Step counts must be whole numbers from 1 to 200.',PAIR:'Choose a valid pair of inputs.',DUPLICATE_SLOPE:'Ratio and percentage describe the same slope. Replace one with a count or dimension.',COUNT_RELATION:'For one stair flight, tread count must equal riser count minus one.',GEOMETRY:'These inputs cannot produce a feasible stair section.'}
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = translations;
  else root.StairTranslations = translations;
})(typeof globalThis !== 'undefined' ? globalThis : this);
