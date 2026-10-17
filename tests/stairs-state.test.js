const {test} = require('node:test');
const assert = require('node:assert/strict');
const {create, edit} = require('../stairs-state.js');

test('the two latest edits remain the active sources', () => {
  let state = create();
  state = edit(state, 'totalRise', '1');
  state = edit(state, 'riserHeight', '150');
  assert.deepEqual(state.active, ['riserHeight', 'totalRise']);
  assert.ok(state.result);
  state = edit(state, 'totalRun', '2');
  assert.deepEqual(state.active, ['totalRun', 'riserHeight']);
  assert.ok(state.result);
});

test('calculated fields can be promoted to a source by editing', () => {
  let state = edit(edit(create(), 'totalRise', '1'), 'riserHeight', '150');
  const calculatedRun = state.values.totalRun;
  state = edit(state, 'totalRun', String(calculatedRun));
  assert.deepEqual(state.active, ['totalRun', 'riserHeight']);
});

test('clearing a source returns to one-value guidance', () => {
  let state = edit(edit(create(), 'totalRise', '1'), 'riserHeight', '150');
  state = edit(state, 'riserHeight', '');
  assert.deepEqual(state.active, ['totalRise']);
  assert.equal(state.result, null);
  assert.equal(state.error, 'SECOND');
});
