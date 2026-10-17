(function (root) {
  'use strict';
  const calculator = typeof module !== 'undefined' && module.exports ? require('./calculator.js') : root.SlopeCalculator;
  const fields = ['run', 'rise', 'length', 'ratio', 'percentage'];
  const isLength = key => ['run', 'rise', 'length'].includes(key);
  const blank = value => value === null || value === undefined || String(value).trim() === '';
  function create() {
    return {values: Object.fromEntries(fields.map(key => [key, ''])), active: [], result: null, error: null};
  }
  function edit(state, key, value) {
    if (!fields.includes(key)) throw new Error('Unknown input field.');
    // Keep the latest compatible source. A second slope replaces the first slope,
    // preserving the current length. Computed values never become sources by themselves.
    const partner = state.active.find(other => other !== key && !blank(state.values[other]) && (isLength(key) || isLength(other)));
    const active = partner ? [key, partner] : [key];
    const values = {...state.values, [key]: value};
    let result = null, error = null;
    try {
      if (active.some(source => blank(values[source]))) error = 'MISSING';
      else if (active.length === 1) {
        if (isLength(key)) { calculator.parseLength(value); error = 'SECOND'; }
        else result = calculator.calculateSlope(key, value);
      } else {
        const pair = fields.filter(field => active.includes(field)).join('-');
        result = calculator.calculate(pair, values);
      }
    } catch (issue) { error = issue.code || 'INVALID'; }
    for (const field of fields) if (!active.includes(field)) values[field] = result?.[field] ?? '';
    return {values, active, result, error};
  }
  const api = {create, edit};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SlopeInputState = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
