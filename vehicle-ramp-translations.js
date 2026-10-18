(function (root) {
  'use strict';
  const translations = {
    th: {
      brand:'เครื่องมือออกแบบ', header:'ภูมิสถาปัตยกรรม / เรขาคณิต', slopeTool:'ความลาดชัน', stairTool:'บันได', vehicleTool:'ทางลาดรถ',
      eyebrow:'03 / ทางลาดรถยนต์', intro:'ออกแบบและตรวจสอบทางลาดรถเตี้ยแบบหลายช่วง พร้อมระดับสะสมทุกจุด', inputsTitle:'ข้อมูลทางลาดรถ', units:'เมตร / อัตราส่วน / %',
      modeTitle:'วิธีคำนวณ', designMode:'คำนวณระยะที่ต้องใช้', designModeHelp:'กำหนดระดับ ช่วง transition และความชันช่วงหลัก', fitMode:'ตรวจสอบพื้นที่ที่มีอยู่', fitModeHelp:'กำหนดระดับและระยะรวม แล้วตรวจความชันช่วงหลัก',
      levelsTitle:'ระดับและพื้นที่', startLevel:'ระดับเริ่มต้น', endLevel:'ระดับปลายทาง', totalRise:'ความต่างระดับรวม', totalRun:'ระยะทางนอนรวมที่มี', descending:'ปลายทางลดระดับจากจุดเริ่มต้น', levelHelp:'กรอกระดับต้นและปลาย หรือกรอกความต่างระดับรวมอย่างเดียว', optional:'ไม่บังคับ', metre:'ม.',
      segmentsTitle:'ช่วงความลาดชัน', segmentsHelp:'ระยะ 3 ม. เป็นค่าขั้นต่ำ แต่สามารถกรอกให้ยาวกว่านั้นได้', includeIntro:'ใส่ช่วง Intro', includeOutro:'ใส่ช่วง Outro', introName:'1 · Intro', transitionInName:'2 · Transition เข้า', mainName:'3 · ช่วงหลัก', transitionOutName:'4 · Transition ออก', outroName:'5 · Outro', extraName:'พื้นที่ราบที่เหลือ',
      length:'ระยะทางนอน', fixedSlope:'ความลาดชันกำหนด', mainRatio:'ความลาดชันช่วงหลัก 1:XX', mainRatioHelp:'กรอก XX ระหว่าง 7 ถึง 10', minimum:'ขั้นต่ำ 3 ม.',
      reset:'ล้างค่า', start:'กรอกระดับหรือความต่างระดับรวมเพื่อเริ่มคำนวณ', ready:'คำนวณแล้ว · รูปตัดใช้สัดส่วนจริง',
      sectionTitle:'รูปตัดทางลาดรถ', live:'ปรับตามข้อมูล', sectionCode:'รูปตัดทางลาดรถ', scale:'สัดส่วนจริง · ระยะเป็นเมตร',
      mainSlopeResult:'ความลาดชันช่วงหลัก', mainPercentResult:'ช่วงหลักเป็น %', totalRunResult:'ระยะทางรวม', overallSlopeResult:'ความลาดชันเฉลี่ยรวม', totalRiseResult:'ความต่างระดับรวม', extraRunResult:'พื้นที่ราบเหลือ',
      target:'ช่วงหลักอยู่ที่ค่าเป้าหมาย 1:10', caution:'ช่วงหลักชันกว่าค่าเป้าหมาย แต่ยังไม่เกินขีดจำกัด 1:7', tooSteep:'ช่วงหลักชันกว่า 1:7 · พื้นที่ไม่เพียงพอ', extra:'คงช่วงหลักไว้ที่ 1:10 และแสดงพื้นที่ราบที่เหลือ', minimumWarning:'ช่วงที่มีระยะต่ำกว่า 3 ม.:',
      scheduleTitle:'ตารางแต่ละช่วง', segment:'ช่วง', slope:'ความลาดชัน', run:'ระยะนอน', rise:'ระดับต่าง', startRL:'ระดับต้น', endRL:'ระดับปลาย', check:'ตรวจสอบ', pass:'ผ่าน', belowMinimum:'ต่ำกว่า 3 ม.', exceedsLimit:'ชันกว่า 1:7', relativeLevel:'ระดับสมมติ',
      noteTitle:'ขอบเขตการตรวจสอบ', note:'ผลนี้ตรวจเรขาคณิตตามเกณฑ์ที่กำหนด ยังไม่ใช่การตรวจระยะใต้ท้องรถ ฐานล้อ ระยะยื่น การระบายน้ำ หรือข้อกำหนดโครงการ', footer:'เครื่องมือสำหรับภูมิสถาปนิก', scope:'ตรวจรูปตัดเบื้องต้น · ประสานสถาปัตย์ โครงสร้าง งานระบบ และผู้ผลิตรถ',
      errors:{TOTAL_RISE:'กรอกความต่างระดับรวมที่มากกว่า 0 หรือกรอกระดับต้น–ปลายให้ครบ',TOTAL_RUN:'กรอกระยะทางนอนรวมที่มากกว่า 0',LEVEL_INVALID:'กรอกค่าระดับเป็นตัวเลข เช่น +10.250 หรือ -0.500',INVALID:'กรอกตัวเลขที่มากกว่า 0',INTRO:'กรอกความยาวช่วง Intro ที่มากกว่า 0',OUTRO:'กรอกความยาวช่วง Outro ที่มากกว่า 0',TRANSITION_IN:'กรอกความยาว Transition เข้าที่มากกว่า 0',TRANSITION_OUT:'กรอกความยาว Transition ออกที่มากกว่า 0',MAIN_RATIO:'กรอก XX ของช่วงหลักตั้งแต่ 7 ถึง 10',TRANSITION_RISE:'ความต่างระดับรวมน้อยกว่าระดับที่ใช้ในช่วง transition',FOOTPRINT:'ระยะทางรวมสั้นกว่าช่วง transition ที่กำหนด'}
    },
    en: {
      brand:'DESIGN TOOLS', header:'LANDSCAPE / GEOMETRY', slopeTool:'Slope', stairTool:'Stairs', vehicleTool:'Vehicle Ramp',
      eyebrow:'03 / VEHICLE RAMP', intro:'Design and check a multi-segment ramp for low-clearance vehicles, with cumulative levels at every junction.', inputsTitle:'Vehicle ramp inputs', units:'METRES / RATIO / %',
      modeTitle:'Calculation mode', designMode:'Calculate required run', designModeHelp:'Set levels, transition lengths and the main slope.', fitMode:'Check available footprint', fitModeHelp:'Set levels and total run, then check the required main slope.',
      levelsTitle:'Levels and footprint', startLevel:'Start Level', endLevel:'End Level', totalRise:'Total Rise', totalRun:'Available Horizontal Run', descending:'End level is below the start level', levelHelp:'Enter both levels, or enter total rise by itself.', optional:'OPTIONAL', metre:'m',
      segmentsTitle:'Slope segments', segmentsHelp:'3 m is the minimum transition length; longer entries are allowed.', includeIntro:'Include Intro', includeOutro:'Include Outro', introName:'1 · Intro', transitionInName:'2 · Entry Transition', mainName:'3 · Main Slope', transitionOutName:'4 · Exit Transition', outroName:'5 · Outro', extraName:'Remaining Level Area',
      length:'Horizontal run', fixedSlope:'Fixed slope', mainRatio:'Main Slope 1:N', mainRatioHelp:'Enter N from 7 to 10', minimum:'3 m minimum',
      reset:'Reset', start:'Enter levels or total rise to start.', ready:'Calculated · section uses true proportions.',
      sectionTitle:'Vehicle ramp section', live:'LIVE GEOMETRY', sectionCode:'VEHICLE RAMP SECTION', scale:'True proportions · dimensions in m',
      mainSlopeResult:'Main slope', mainPercentResult:'Main slope %', totalRunResult:'Overall run', overallSlopeResult:'Overall average slope', totalRiseResult:'Total rise', extraRunResult:'Remaining level area',
      target:'The main slope is at the 1:10 target.', caution:'The main slope is steeper than the target but does not exceed 1:7.', tooSteep:'The main slope is steeper than 1:7 · insufficient footprint.', extra:'The main slope remains at 1:10 and the remaining level area is shown.', minimumWarning:'Segments shorter than 3 m:',
      scheduleTitle:'Segment schedule', segment:'Segment', slope:'Slope', run:'Run', rise:'Rise', startRL:'Start RL', endRL:'End RL', check:'Check', pass:'Pass', belowMinimum:'Below 3 m', exceedsLimit:'Steeper than 1:7', relativeLevel:'Relative datum',
      noteTitle:'Check scope', note:'This result checks geometry against the stated criteria. It does not check vehicle underbody clearance, wheelbase, overhangs, drainage or project requirements.', footer:'Landscape architecture tools', scope:'Preliminary section check · Coordinate architecture, structure, services and vehicle data',
      errors:{TOTAL_RISE:'Enter a total rise greater than zero, or complete both levels.',TOTAL_RUN:'Enter an available horizontal run greater than zero.',LEVEL_INVALID:'Enter a valid level such as +10.250 or -0.500.',INVALID:'Enter a number greater than zero.',INTRO:'Enter an Intro length greater than zero.',OUTRO:'Enter an Outro length greater than zero.',TRANSITION_IN:'Enter an entry transition length greater than zero.',TRANSITION_OUT:'Enter an exit transition length greater than zero.',MAIN_RATIO:'Enter a main-slope denominator from 7 to 10.',TRANSITION_RISE:'The total rise is less than the rise already used by the transition segments.',FOOTPRINT:'The available run is shorter than the specified transition segments.'}
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = translations;
  else root.VehicleRampTranslations = translations;
})(typeof globalThis !== 'undefined' ? globalThis : this);
