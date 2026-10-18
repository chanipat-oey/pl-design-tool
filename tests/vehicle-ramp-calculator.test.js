const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../vehicle-ramp-calculator.js');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
const base={totalRise:2,transitionInRun:3,transitionOutRun:3,mainRatio:10};

test('design mode calculates required main and total run',()=>{const r=C.calculate(base);close(r.transitionRise,.5);close(r.mainRise,1.5);close(r.mainRun,15);close(r.totalRun,21);assert.equal(r.mainStatus,'target');});
test('entry and exit transition lengths are independent and may exceed 3 m',()=>{const r=C.calculate({...base,transitionInRun:4,transitionOutRun:5});close(r.transitionRun,9);close(r.transitionRise,4/12+5/12);assert.deepEqual(r.minimumWarnings,[]);});
test('optional 1:20 intro and outro contribute run and rise',()=>{const r=C.calculate({...base,introEnabled:true,introRun:3,outroEnabled:true,outroRun:4});assert.deepEqual(r.segments.map(x=>x.key),['intro','transitionIn','main','transitionOut','outro']);close(r.transitionRise,.5+.15+.2);});
test('fit mode recognises 1:10 target',()=>{const r=C.calculate({...base,mode:'fit',totalRun:21});close(r.mainRatio,10);assert.equal(r.mainStatus,'target');});
test('fit mode warns between 1:10 and 1:7',()=>{const r=C.calculate({...base,mode:'fit',totalRun:18});close(r.mainRatio,8);assert.equal(r.mainStatus,'caution');});
test('fit mode reports footprint steeper than 1:7',()=>{const r=C.calculate({...base,mode:'fit',totalRun:15});close(r.mainRatio,6);assert.equal(r.mainStatus,'tooSteep');});
test('fit mode holds main at 1:10 and reports surplus as level area',()=>{const r=C.calculate({...base,mode:'fit',totalRun:25});close(r.mainRatio,10);close(r.extraRun,4);close(r.totalRun,25);assert.equal(r.mainStatus,'extra');assert.equal(r.segments.at(-1).key,'extra');});
test('segments below 3 m calculate with an explicit warning',()=>{const r=C.calculate({...base,transitionInRun:2.5});assert.deepEqual(r.minimumWarnings,['transitionIn']);assert.ok(r.totalRun>0);});
test('rejects transition rise greater than total rise',()=>assert.throws(()=>C.calculate({...base,totalRise:.4}),e=>e.code==='TRANSITION_RISE'));
test('rejects footprint consumed by transitions',()=>assert.throws(()=>C.calculate({...base,mode:'fit',totalRun:6}),e=>e.code==='FOOTPRINT'));
test('design main ratio is limited to 1:7 through 1:10',()=>{for(const n of [6.99,10.01,0,-1,''])assert.throws(()=>C.calculate({...base,mainRatio:n}),e=>e.code==='MAIN_RATIO');});
test('all lengths reject zero, negative and nonnumeric input',()=>{for(const n of [0,-1,'x',''])assert.throws(()=>C.calculate({...base,totalRise:n}),e=>e.code==='TOTAL_RISE');});
test('translation keys remain aligned between Thai and English',()=>{const tr=require('../vehicle-ramp-translations.js');assert.deepEqual(Object.keys(tr.th).sort(),Object.keys(tr.en).sort());assert.deepEqual(Object.keys(tr.th.errors).sort(),Object.keys(tr.en.errors).sort());});
