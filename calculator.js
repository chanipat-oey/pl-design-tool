(function (root) {
  'use strict';
  function parseLength(value) {
    if ((typeof value !== 'number' && typeof value !== 'string') || String(value).trim() === '') throw new Error('Enter both known dimensions.');
    const number = Number(value);
    if (!Number.isFinite(number) || number < 0) throw new Error('Use finite, non-negative lengths only.');
    return number;
  }
  function missingLeg(length, leg) {
    if (length < leg) throw new Error('Slope Length must be at least as long as the known Run or Rise.');
    if (length === 0) return 0;
    // Avoid squaring lengths, which can overflow even for a representable result.
    return Math.sqrt(length - leg) * Math.sqrt(length) * Math.sqrt(1 + leg / length);
  }
  function calculate(pair, values) {
    let run, rise, length;
    if (pair === 'run-rise') { run = parseLength(values.run); rise = parseLength(values.rise); length = Math.hypot(run, rise); }
    else if (pair === 'run-length') { run = parseLength(values.run); length = parseLength(values.length); rise = missingLeg(length, run); }
    else if (pair === 'rise-length') { rise = parseLength(values.rise); length = parseLength(values.length); run = missingLeg(length, rise); }
    else throw new Error('Choose a valid pair of known dimensions.');
    if (length === 0) throw new Error('At least one dimension must be greater than zero. A zero-length section has no slope.');
    if (![run, rise, length].every(Number.isFinite)) throw new Error('These dimensions exceed the supported numeric range.');
    const percentage = run === 0 ? Infinity : rise / run * 100;
    const ratio = rise === 0 ? Infinity : run / rise;
    if ((run > 0 && !Number.isFinite(percentage)) || (rise > 0 && !Number.isFinite(ratio)) || (rise > 0 && run > 0 && (percentage === 0 || ratio === 0))) throw new Error('These dimensions exceed the supported numeric range.');
    return {run, rise, length, percentage, ratio, angle: Math.atan2(rise, run) * 180 / Math.PI};
  }
  const api = {calculate, parseLength};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SlopeCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
