(function (root) {
  'use strict';
  const calculator = typeof module !== 'undefined' && module.exports ? require('./stairs-calculator.js') : root.StairCalculator;
  const fields = calculator.fields;

  function create() {
    return {values: Object.fromEntries(fields.map(key => [key, ''])), active: [], result: null, error: null};
  }

  function edit(state, key, value) {
    if (!fields.includes(key)) throw new Error('Unknown stair input.');
    const values = {...state.values, [key]: value};
    const previous = state.active.find(other => other !== key && String(values[other] ?? '').trim() !== '');
    const active = String(value).trim() === '' ? state.active.filter(item => item !== key) : previous ? [key, previous] : [key];
    let result = null, error = active.length < 2 ? 'SECOND' : null;
    try {
      if (active.length === 1) calculator.number(values[active[0]], active[0]);
      if (active.length === 2) result = calculator.calculate(active, values);
    } catch (issue) { error = issue.code || 'INVALID'; }
    if (result) {
      for (const field of fields) if (!active.includes(field)) values[field] = result.user[field];
    } else {
      for (const field of fields) if (!active.includes(field)) values[field] = '';
    }
    return {values, active, result, error};
  }

  const api = {create, edit};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StairInputState = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
