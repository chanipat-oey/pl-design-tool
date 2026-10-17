const {test} = require('node:test');
const assert = require('node:assert/strict');
const slope = require('../calculator.js');
const layout = require('../layout-calculator.js');
const stairs = require('../stairs-calculator.js');

const close = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);

test('slope extend mode adds landings after the entered ramp run', () => {
  const result = slope.configured('run-rise', {run:'12',rise:'1'}, {enabled:true,runMode:'extend',maximumRun:4,equal:true,sharedLength:1.5});
  assert.equal(result.layout.flights,3);
  close(result.rampRun,12); close(result.layout.totalLandingRun,3); close(result.layout.overallRun,15);
  close(result.percentage,100/12); close(result.overallPercentage,100/15);
  close(result.ratio,12); close(result.overallRatio,15);
});

test('slope fixed mode fits landings inside the entered overall run', () => {
  const result = slope.configured('run-rise', {run:'12',rise:'1'}, {enabled:true,runMode:'fixed',maximumRun:4,equal:true,sharedLength:1.5});
  assert.equal(result.layout.flights,3);
  close(result.run,12); close(result.rampRun,9); close(result.layout.totalLandingRun,3); close(result.layout.overallRun,12);
  close(result.percentage,100/9); close(result.overallPercentage,100/12);
  close(result.ratio,9); close(result.overallRatio,12);
});

test('fixed slope mode supports separate landings and rejects consumed footprints', () => {
  const result = layout.fixedSlopeRun(13,{enabled:true,runMode:'fixed',maximumRun:6,equal:false,lengths:[3,1]});
  assert.equal(result.flights,2); assert.deepEqual(result.landingLengths,[3]); close(result.rampRun,10);
  assert.throws(() => layout.fixedSlopeRun(2,{enabled:true,runMode:'fixed',maximumRun:1,equal:true,sharedLength:2}), error => error.code === 'FOOTPRINT');
});

test('stair extend mode keeps flight slope and reports the flatter overall average', () => {
  const result = stairs.calculate(['risers','totalRise'], {risers:17,totalRise:2.55}, {flights:3,runMode:'extend',landingTotal:2.4}).user;
  close(result.stairRun,4.2,1e-6); close(result.totalRun,4.2,1e-6); close(result.overallRun,6.6,1e-6);
  close(result.percentage,2.55/4.2*100,1e-5); close(result.overallPercentage,2.55/6.6*100,1e-5);
});

test('stair fixed mode subtracts landings before solving the flight geometry', () => {
  const result = stairs.calculate(['totalRise','totalRun'], {totalRise:2.55,totalRun:6.6}, {flights:3,runMode:'fixed',landingTotal:2.4}).user;
  close(result.stairRun,4.2,1e-6); close(result.totalRun,6.6,1e-6); close(result.overallRun,6.6,1e-6);
  close(result.percentage,2.55/4.2*100,1e-5); close(result.overallPercentage,2.55/6.6*100,1e-5);
});

test('a shorter fixed stair footprint becomes steeper and invalid footprints fail clearly', () => {
  const result = stairs.calculate(['totalRise','totalRun'], {totalRise:2.55,totalRun:4.2}, {flights:3,runMode:'fixed',landingTotal:2.4}).user;
  close(result.stairRun,1.8,1e-6); close(result.percentage,2.55/1.8*100,2e-5); close(result.overallPercentage,2.55/4.2*100,1e-5);
  assert.throws(() => stairs.calculate(['totalRise','totalRun'], {totalRise:2.55,totalRun:2.4}, {flights:3,runMode:'fixed',landingTotal:2.4}), error => error.code === 'FOOTPRINT');
});
