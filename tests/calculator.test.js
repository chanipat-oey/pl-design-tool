const {test} = require('node:test');
const assert = require('node:assert/strict');
const {calculate,parseLength} = require('../calculator.js');
const close=(a,b)=>assert.ok(Math.abs(a-b)<=Math.max(1,Math.abs(b))*1e-12,`${a} != ${b}`);
for(const pair of ['run-rise','run-length','rise-length']) test(`3–4–5 geometry: ${pair}`,()=>{const s=calculate(pair,{run:4,rise:3,length:5});close(s.run,4);close(s.rise,3);close(s.length,5);close(s.percentage,75);close(s.ratio,4/3);close(s.angle,36.86989764584402);});
test('landscape gradient',()=>{const s=calculate('run-rise',{run:10,rise:0.5});close(s.percentage,5);close(s.ratio,20);close(s.angle,2.862405226111748);});
for(const pair of ['run-rise','run-length','rise-length']) {
 test(`level surface: ${pair}`,()=>{const s=calculate(pair,{run:10,rise:0,length:10});assert.equal(s.rise,0);assert.equal(s.percentage,0);assert.equal(s.ratio,Infinity);assert.equal(s.angle,0);});
 test(`vertical section: ${pair}`,()=>{const s=calculate(pair,{run:0,rise:10,length:10});assert.equal(s.run,0);assert.equal(s.percentage,Infinity);assert.equal(s.ratio,0);assert.equal(s.angle,90);});
 test(`zero section rejected: ${pair}`,()=>assert.throws(()=>calculate(pair,{run:0,rise:0,length:0}),/greater than zero/));
}
test('impossible hypotenuse rejected',()=>{assert.throws(()=>calculate('run-length',{run:5,length:4}),/at least/);assert.throws(()=>calculate('rise-length',{rise:5,length:4}),/at least/);});
test('missing, negative, non-finite and non-numeric values rejected',()=>{for(const n of ['', ' ', null, undefined, true, {},-1,'abc',NaN,Infinity,'1e999'])assert.throws(()=>parseLength(n));});
test('inactive value ignored',()=>close(calculate('run-rise',{run:'4',rise:'3',length:-100}).length,5));
test('invalid pair rejected',()=>assert.throws(()=>calculate('other',{}),/valid pair/));
test('large dimensions avoid square overflow',()=>{const s=calculate('run-length',{run:3e200,length:5e200});close(s.rise,4e200);});
test('tiny dimensions avoid square underflow',()=>{const s=calculate('rise-length',{rise:3e-200,length:5e-200});close(s.run/1e-200,4);});
test('unrepresentable geometry rejected',()=>assert.throws(()=>calculate('run-rise',{run:1.7e308,rise:1.7e308}),/numeric range/));
test('near-equal length remains valid',()=>assert.ok(calculate('run-length',{run:1,length:1+Number.EPSILON}).rise>0));
test('round-trip geometry across angles',()=>{for(let angle=1;angle<90;angle++){const run=100*Math.cos(angle*Math.PI/180),rise=100*Math.sin(angle*Math.PI/180);for(const pair of ['run-rise','run-length','rise-length']){const s=calculate(pair,{run,rise,length:100});close(s.angle,angle);close(s.run,run);close(s.rise,rise);}}});
