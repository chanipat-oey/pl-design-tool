const {test} = require('node:test');
const assert = require('node:assert/strict');
const {calculate, parseRatio, parsePercentage, pairs} = require('../calculator.js');
const translations = require('../translations.js');
const close = (a,b) => assert.ok(Math.abs(a-b) <= Math.max(Math.abs(b), 1e-300)*1e-10, `${a} != ${b}`);
const errorCode = (pair, values, code) => assert.throws(()=>calculate(pair,values), e=>e.code===code);
test('all ten selectable pairs exist',()=>assert.equal(pairs.length,10));
for (const pair of pairs.filter(p=>p!=='ratio-percentage')) {
  test(`all five outputs from ${pair}`,()=>{
    const s=calculate(pair,{run:12,rise:1,length:Math.sqrt(145),ratio:'1:12',percentage:'8.333333333333334%'});
    for (const [key,value] of Object.entries({run:12,rise:1,length:Math.sqrt(145),ratio:12,percentage:100/12,angle:4.763641690726178})) close(s[key],value);
    assert.equal(s.status,'complete');
  });
}
test('ratio accepts prefix, denominator, whitespace and infinity',()=>{
  for(const value of ['1:12','12',' 1 : 12 ',12])assert.equal(parseRatio(value),12);
  assert.equal(parseRatio('1:∞'),Infinity);assert.equal(parseRatio('1:0'),0);
  for(const value of ['2:12','1:2:3','1:-12','abc','0x10'])assert.throws(()=>parseRatio(value));
});
test('percentage accepts plain number or trailing percent',()=>{
  for(const value of ['5','5%',' 5 % ',5])assert.equal(parsePercentage(value),5);
  assert.equal(parsePercentage('∞%'),Infinity);
  for(const value of ['-5%','5%%','%5','0x10'])assert.throws(()=>parsePercentage(value));
});
test('consistent slope-only values do not invent lengths',()=>{
  const s=calculate('ratio-percentage',{ratio:'1:20',percentage:'5%'});
  assert.equal(s.status,'needs-distance'); assert.equal(s.run,null);assert.equal(s.rise,null);assert.equal(s.length,null);
  close(s.angle,2.862405226111748);
});
test('contradictory slope values are rejected',()=>errorCode('ratio-percentage',{ratio:'1:12',percentage:5},'CONFLICT'));
test('level and vertical slope-only pairs are undetermined',()=>{
  for(const values of [{ratio:'1:∞',percentage:0},{ratio:'1:0',percentage:'∞'}])assert.equal(calculate('ratio-percentage',values).status,'needs-distance');
  errorCode('ratio-percentage',{ratio:0,percentage:0},'CONFLICT');
});
for(const slopeKey of ['ratio','percentage']) {
  const level=slopeKey==='ratio'?'1:∞':0, vertical=slopeKey==='ratio'?'1:0':'∞';
  test(`level geometry with ${slopeKey}`,()=>{
    for(const lengthKey of ['run','length']){const s=calculate(`${lengthKey}-${slopeKey}`,{[lengthKey]:12,[slopeKey]:level});assert.equal(s.run,12);assert.equal(s.rise,0);assert.equal(s.length,12);}
    assert.equal(calculate(`rise-${slopeKey}`,{rise:0,[slopeKey]:level}).status,'needs-distance');
    errorCode(`rise-${slopeKey}`,{rise:1,[slopeKey]:level},'LEVEL');
  });
  test(`vertical geometry with ${slopeKey}`,()=>{
    for(const lengthKey of ['rise','length']){const s=calculate(`${lengthKey}-${slopeKey}`,{[lengthKey]:12,[slopeKey]:vertical});assert.equal(s.run,0);assert.equal(s.rise,12);assert.equal(s.length,12);}
    assert.equal(calculate(`run-${slopeKey}`,{run:0,[slopeKey]:vertical}).status,'needs-distance');
    errorCode(`run-${slopeKey}`,{run:1,[slopeKey]:vertical},'VERTICAL');
  });
  test(`zero distance with non-degenerate ${slopeKey} rejected`,()=>{for(const key of ['run','rise','length'])errorCode(`${key}-${slopeKey}`,{[key]:0,[slopeKey]:12},'ZERO');});
}
test('blank slope, negative lengths and non-finite inputs rejected',()=>{
  errorCode('run-ratio',{run:12,ratio:''},'MISSING');
  errorCode('rise-percentage',{rise:-1,percentage:5},'INVALID');
  errorCode('length-ratio',{length:Infinity,ratio:12},'INVALID');
});
test('large, small and unrepresentable slopes',()=>{
  close(calculate('length-ratio',{length:5e200,ratio:'1:0.75'}).run,3e200);
  close(calculate('run-percentage',{run:2e-200,percentage:50}).rise,1e-200);
  errorCode('run-ratio',{run:1e308,ratio:0.001},'RANGE');
  errorCode('run-percentage',{run:1e-300,percentage:1e-200},'RANGE');
  errorCode('run-percentage',{run:1,percentage:'1e-999'},'RANGE');
});
test('all nine independent pairs round-trip across 89 inclinations',()=>{
  for(let degree=1;degree<90;degree++) {
    const run=100*Math.cos(degree*Math.PI/180),rise=100*Math.sin(degree*Math.PI/180);
    const values={run,rise,length:100,ratio:run/rise,percentage:rise/run*100};
    for(const pair of pairs.filter(p=>p!=='ratio-percentage')){const s=calculate(pair,values);close(s.run,run);close(s.rise,rise);close(s.length,100);close(s.angle,degree);}
  }
});
test('Thai and English cover all labels and errors with matching keys',()=>{
  assert.deepEqual(Object.keys(translations.th).sort(),Object.keys(translations.en).sort());
  assert.deepEqual(Object.keys(translations.th.errors).sort(),Object.keys(translations.en.errors).sort());
  for(const lang of Object.values(translations))for(const value of Object.values(lang))if(typeof value==='string')assert.ok(value.length>0);
});
