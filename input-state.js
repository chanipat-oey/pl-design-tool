(function (root) {
  'use strict';
  const calculator = typeof module !== 'undefined' && module.exports ? require('./calculator.js') : root.SlopeCalculator;
  const fields = ['run', 'rise', 'length', 'ratio', 'percentage'];
  const isLength = key => ['run', 'rise', 'length'].includes(key);
  const blank = value => value === null || value === undefined || String(value).trim() === '';
  function create() {
    return {values: Object.fromEntries(fields.map(key => [key, ''])), active: [], result: null, error: null};
  }
  function evaluate(values, active, options = {}) {
    let result = null, error = null;
    try {
      if (active.some(source => blank(values[source]))) error = 'MISSING';
      else if (active.length === 1) {
        const key = active[0];
        if (isLength(key)) { calculator.parseLength(values[key]); error = 'SECOND'; }
        else result = calculator.calculateSlope(key, values[key]);
      } else {
        const pair = fields.filter(field => active.includes(field)).join('-');
        result = calculator.configured(pair, values, options);
      }
    } catch (issue) { error = issue.code || 'INVALID'; }
    const nextValues = {...values};
    for (const field of fields) if (!active.includes(field)) nextValues[field] = result?.[field] ?? '';
    return {values:nextValues,active:[...active],result,error};
  }
  function edit(state, key, value, options = {}) {
    if (!fields.includes(key)) throw new Error('Unknown input field.');
    // Keep the latest compatible source. A second slope replaces the first slope,
    // preserving the current length. Computed values never become sources by themselves.
    const partner = state.active.find(other => other !== key && !blank(state.values[other]) && (isLength(key) || isLength(other)));
    const active = partner ? [key, partner] : [key];
    const values = {...state.values, [key]: value};
    return evaluate(values,active,options);
  }
  function recalculate(state, options = {}) { return evaluate(state.values,state.active,options); }
  const api = {create, edit, recalculate};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SlopeInputState = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
