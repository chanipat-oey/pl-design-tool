const {test} = require('node:test');
const assert = require('node:assert/strict');
const {calculate, fields} = require('../stairs-calculator.js');
const close = (a, b, tolerance = 1e-6) => assert.ok(Math.abs(a - b) <= tolerance, `${a} != ${b}`);

test('exposes all eight requested inputs', () => {
  assert.deepEqual(fields, ['risers','treads','totalRise','totalRun','riserHeight','treadDepth','ratio','percentage']);
});

test('total rise and target riser produce integer steps and a 630 mm option', () => {
  const output = calculate(['totalRise','riserHeight'], {totalRise:'1', riserHeight:'150'});
  assert.equal(output.user.risers, 7);
  close(output.user.totalRise, 1, 0.001);
  close(output.user.riserHeight, 1000 / 7, 0.02);
  close(output.recommended.comfort, 630, 0.001);
  assert.equal(output.recommended.treads, 6);
});

test('total geometry is preserved while the recommended count minimises 2R+T', () => {
  const output = calculate(['totalRise','totalRun'], {totalRise:'1.2', totalRun:'2.4'});
  close(output.user.totalRise, 1.2, 0.001);
  close(output.user.totalRun, 2.4, 0.001);
  close(output.recommended.totalRise, 1.2, 0.001);
  close(output.recommended.totalRun, 2.4, 0.001);
  assert.ok(Math.abs(output.recommended.comfort - 630) <= Math.abs(output.user.comfort - 630) + 0.01);
});

test('riser count and total rise calculate the actual riser', () => {
  const output = calculate(['risers','totalRise'], {risers:'8', totalRise:'1.2'});
  assert.equal(output.user.risers, 8);
  assert.equal(output.user.treads, 7);
  close(output.user.riserHeight, 150, 0.001);
  close(output.recommended.treadDepth, 330, 0.001);
});

test('ratio entry uses denominator only and drives both ratio outputs', () => {
  const output = calculate(['totalRise','ratio'], {totalRise:'1', ratio:'2'});
  close(output.user.ratio, 2, 0.001);
  close(output.user.percentage, 50, 0.01);
  close(output.recommended.ratio, 2, 0.001);
});

test('percentage and ratio alone are rejected as duplicate slope data', () => {
  assert.throws(() => calculate(['ratio','percentage'], {ratio:'2', percentage:'50'}), error => error.code === 'DUPLICATE_SLOPE');
});

test('riser and tread counts must describe one flight', () => {
  assert.throws(() => calculate(['risers','treads'], {risers:'8', treads:'8'}), error => error.code === 'COUNT_RELATION');
  const output = calculate(['risers','treads'], {risers:'8', treads:'7'});
  assert.equal(output.user.risers, 8);
  assert.equal(output.user.treads, 7);
});

test('invalid, negative, zero and fractional counts are rejected', () => {
  for (const value of ['', 'abc', '-1', '0']) assert.throws(() => calculate(['risers','totalRise'], {risers:value, totalRise:'1'}));
  assert.throws(() => calculate(['risers','totalRise'], {risers:'7.5', totalRise:'1'}), error => error.code === 'COUNT');
});
