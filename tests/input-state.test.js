const {test} = require('node:test');
const assert = require('node:assert/strict');
const {create, edit} = require('../input-state.js');
const {pairs} = require('../calculator.js');
const close = (actual, expected) => assert.ok(Math.abs(actual-expected) < 1e-10, `${actual} != ${expected}`);
const enter = edits => edits.reduce((state,[key,value])=>edit(state,key,value),create());
test('starts empty with no assumed length or slope',()=>{
  const s=create();assert.deepEqual(s.active,[]);assert.equal(s.result,null);assert.ok(Object.values(s.values).every(v=>v===''));
});
for(const pair of pairs.filter(p=>p!=='ratio-percentage'))for(const reverse of [false,true]) {
  test(`direct entry ${pair}, ${reverse?'reverse':'forward'} order`,()=>{
    const keys=pair.split('-');if(reverse)keys.reverse();
    const values={run:'12',rise:'1',length:String(Math.sqrt(145)),ratio:'1:12',percentage:String(100/12)+'%'};
    const s=enter(keys.map(k=>[k,values[k]]));
    assert.equal(s.error,null);assert.equal(s.result.status,'complete');close(s.result.run,12);close(s.result.rise,1);close(s.result.percentage,100/12);
  });
}
test('editing ratio keeps length and updates all derived values',()=>{
  let s=enter([['run','12'],['ratio','1:12']]);s=edit(s,'ratio','1:20');
  assert.deepEqual(s.active,['ratio','run']);close(s.result.run,12);close(s.result.rise,.6);close(s.result.percentage,5);close(s.result.length,Math.hypot(12,.6));
});
test('percentage replaces ratio and keeps the source length',()=>{
  const s=enter([['run','12'],['ratio','1:12'],['percentage','10%']]);
  assert.deepEqual(s.active,['percentage','run']);close(s.result.run,12);close(s.result.rise,1.2);close(s.values.ratio,10);
});
test('typing into a calculated length promotes it to a source',()=>{
  const s=enter([['run','12'],['ratio','1:12'],['rise','2']]);
  assert.deepEqual(s.active,['rise','ratio']);close(s.result.run,24);close(s.result.rise,2);
});
test('most recent source is retained when another length changes',()=>{
  const s=enter([['run','12'],['rise','1'],['run','24'],['length','25']]);
  assert.deepEqual(s.active,['length','run']);close(s.result.rise,7);
});
test('computed ratio is never silently treated as a user-entered source',()=>{
  const s=enter([['run','12'],['rise','1'],['length','13']]);
  assert.deepEqual(s.active,['length','rise']);close(s.result.run,Math.sqrt(168));
});
test('slope-only edits require a length and newest slope wins',()=>{
  let s=enter([['ratio','1:12'],['percentage','5%']]);
  assert.deepEqual(s.active,['percentage']);assert.equal(s.result.status,'needs-distance');assert.equal(s.values.run,'');assert.equal(s.values.ratio,20);
  s=edit(s,'rise','1');close(s.result.run,20);assert.equal(s.result.status,'complete');
});
test('clearing active input clears stale geometry and permits recovery',()=>{
  let s=enter([['run','12'],['ratio','1:12'],['run','']]);
  assert.equal(s.result,null);assert.equal(s.values.rise,'');assert.equal(s.values.length,'');assert.equal(s.values.ratio,'1:12');assert.equal(s.values.run,'');
  s=edit(s,'rise','2');assert.deepEqual(s.active,['rise','ratio']);close(s.result.run,24);
});
test('partial ratio is retained while typing, then recovers',()=>{
  let s=enter([['run','12'],['ratio','1:']]);assert.equal(s.result,null);assert.equal(s.values.ratio,'1:');
  s=edit(s,'ratio','1:20');close(s.result.rise,.6);
});
test('invalid geometry is not concealed by switching sources',()=>{
  let s=enter([['run','12'],['length','10']]);assert.equal(s.error,'GEOMETRY');assert.equal(s.result,null);assert.equal(s.values.rise,'');
  s=edit(s,'length','13');close(s.result.rise,5);
});
test('negative values remain visible with an error',()=>{
  const s=enter([['run','12'],['rise','-1']]);assert.equal(s.error,'INVALID');assert.equal(s.values.rise,'-1');assert.equal(s.result,null);
});
test('flat and vertical cases stay defined or explicitly underdetermined',()=>{
  let s=enter([['run','12'],['percentage','0']]);assert.equal(s.result.rise,0);
  s=edit(s,'rise','0');assert.equal(s.result.status,'needs-distance');assert.equal(s.values.run,'');
  s=enter([['rise','3'],['ratio','1:0']]);assert.equal(s.result.run,0);assert.equal(s.result.angle,90);
});
test('reset removes input history as well as values',()=>{
  const s=edit(create(),'length','20');assert.deepEqual(s.active,['length']);assert.equal(s.error,'SECOND');assert.equal(s.result,null);
});
test('state transitions preserve previous snapshots and numeric precision',()=>{
  const before=enter([['run','12'],['ratio','1:7']]);const after=edit(before,'ratio','1:9');
  close(before.result.rise,12/7);close(after.result.rise,12/9);assert.equal(before.values.ratio,'1:7');
});
