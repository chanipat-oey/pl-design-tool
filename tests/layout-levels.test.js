const {test} = require('node:test');
const assert = require('node:assert/strict');
const levels = require('../level-calculator.js');
const layout = require('../layout-calculator.js');
const stairs = require('../stairs-calculator.js');
const stairTranslations = require('../stairs-translations.js');

const close = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);

test('start and end levels calculate an upward rise', () => {
  const result = levels.difference('+10.250', '11.150');
  close(result.rise, 0.9); assert.equal(result.direction, 1);
});

test('levels accept negative datums and retain downward direction', () => {
  const result = levels.difference('-0.250', '-1.000');
  close(result.rise, 0.75); assert.equal(result.direction, -1);
});

test('one level and a rise calculate the missing level in either direction', () => {
  close(levels.complete('10', '', 0.9, 1).end, 10.9);
  close(levels.complete('', '9.1', 0.9, -1).start, 10);
});

test('invalid level text is rejected without forbidding signed levels', () => {
  for (const value of ['', 'RL 10', '1,000', 'Infinity']) assert.throws(() => levels.parseLevel(value), error => error.code === 'LEVEL_INVALID');
  assert.equal(levels.parseLevel('-10.25'), -10.25);
});

test('slope run is split equally using a user supplied maximum', () => {
  const result = layout.slope({run:14,rise:1.4,length:Math.hypot(14,1.4)}, {enabled:true,maximumRun:5,equal:true,sharedLength:1.5});
  assert.equal(result.flights, 3); assert.equal(result.landingCount, 2); close(result.flightRun, 14/3); close(result.flightRise, 1.4/3); close(result.overallRun, 17);
});

test('slope landing lengths can be entered separately', () => {
  const result = layout.slope({run:13,rise:1,length:Math.hypot(13,1)}, {enabled:true,maximumRun:5,equal:false,lengths:[1.2,1.8]});
  assert.deepEqual(result.landingLengths,[1.2,1.8]); close(result.totalLandingRun,3); close(result.overallRun,16);
});

test('no slope landing is added when run does not exceed the maximum', () => {
  const result = layout.slope({run:5,rise:.5,length:Math.hypot(5,.5)}, {enabled:true,maximumRun:5,equal:true,sharedLength:''});
  assert.equal(result.flights,1); assert.equal(result.landingCount,0); close(result.overallRun,5);
});

test('stair flights change the total tread relationship', () => {
  const output = stairs.calculate(['risers','totalRise'], {risers:17,totalRise:2.55}, {flights:3});
  assert.equal(output.user.risers,17); assert.equal(output.user.treads,14); close(output.user.riserHeight,.15);
});

test('stair count pair is validated against the selected flight count', () => {
  assert.doesNotThrow(() => stairs.calculate(['risers','treads'], {risers:17,treads:14}, {flights:3}));
  assert.throws(() => stairs.calculate(['risers','treads'], {risers:17,treads:16}, {flights:3}), error => error.code === 'COUNT_RELATION');
});

test('stair flights cannot equal or exceed a supplied riser count', () => {
  assert.throws(() => stairs.calculate(['risers','totalRise'], {risers:3,totalRise:.45}, {flights:3}), error => error.code === 'FLIGHTS_GEOMETRY');
});

test('stair risers distribute evenly and landings increase the footprint', () => {
  const section = stairs.calculate(['risers','totalRise'], {risers:17,totalRise:2.55}, {flights:3}).user;
  const result = layout.stairs(section,{enabled:true,flights:3,equal:true,sharedLength:1.2});
  assert.deepEqual(result.risersByFlight,[6,6,5]); assert.deepEqual(result.treadsByFlight,[5,5,4]); close(result.overallRun,section.totalRun+2.4);
});

test('separate stair landing lengths and impossible flight counts are validated', () => {
  const section = stairs.result(8,.15,.3,2);
  const result = layout.stairs(section,{enabled:true,flights:2,equal:false,lengths:[1.4]});
  assert.deepEqual(result.landingLengths,[1.4]);
  assert.throws(() => layout.stairs(section,{enabled:true,flights:9,equal:true,sharedLength:1}), error => error.code === 'FLIGHTS_GEOMETRY');
});

test('Thai and English stair translations cover matching keys', () => {
  assert.deepEqual(Object.keys(stairTranslations.th).sort(),Object.keys(stairTranslations.en).sort());
  assert.deepEqual(Object.keys(stairTranslations.th.errors).sort(),Object.keys(stairTranslations.en.errors).sort());
});
