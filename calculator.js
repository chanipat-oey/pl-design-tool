(function (root) {
  'use strict';
  const messages = {
    MISSING: 'Enter both known values.', INVALID: 'Use finite, non-negative lengths or slope values only.',
    RATIO: 'Enter a ratio such as 1:12 or its denominator 12.',
    GEOMETRY: 'Slope Length must be at least as long as the known Run or Rise.',
    ZERO: 'At least one dimension must be greater than zero. A zero-length section has no slope.',
    RANGE: 'These dimensions exceed the supported numeric range.', PAIR: 'Choose a valid pair of known values.',
    CONFLICT: 'The ratio and percentage describe different slopes.',
    LEVEL: 'A level surface must have zero rise.', VERTICAL: 'A vertical section must have zero run.'
  };
  function fail(code) { const error = new Error(messages[code]); error.code = code; throw error; }
  const fields = ['run', 'rise', 'length', 'ratio', 'percentage'];
  const pairs = fields.flatMap((a, i) => fields.slice(i + 1).map(b => `${a}-${b}`));
  const numeric = /^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
  function parseLength(value) {
    if ((typeof value !== 'number' && typeof value !== 'string') || String(value).trim() === '') fail('MISSING');
    const text = String(value).trim(), n = Number(text);
    if (!numeric.test(text) || !Number.isFinite(n) || n < 0) fail('INVALID');
    if (n === 0 && /[1-9]/.test(text.split(/e/i)[0])) fail('RANGE');
    return n;
  }
  function parseRatio(value) {
    if (typeof value === 'number' && value === Infinity) return Infinity;
    let text = String(value ?? '').trim();
    if (text.includes(':')) {
      const parts = text.split(':').map(part => part.trim());
      if (parts.length !== 2 || parts[0] !== '1') fail('RATIO');
      text = parts[1];
    }
    if (/^(∞|infinity)$/i.test(text)) return Infinity;
    return parseLength(text);
  }
  function parsePercentage(value) {
    if (typeof value === 'number' && value === Infinity) return Infinity;
    const text = String(value ?? '').trim().replace(/%$/, '').trim();
    if (/^(∞|infinity)$/i.test(text)) return Infinity;
    return parseLength(text);
  }
  function missingLeg(length, leg) {
    if (length < leg) fail('GEOMETRY');
    if (length === 0) return 0;
    return Math.sqrt(length - leg) * Math.sqrt(length) * Math.sqrt(1 + leg / length);
  }
  function gradient(key, value) {
    const n = key === 'ratio' ? parseRatio(value) : parsePercentage(value);
    const ratio = key === 'ratio' ? n : n === 0 ? Infinity : 100 / n;
    const percentage = key === 'percentage' ? n : n === 0 ? Infinity : 100 / n;
    if (Number.isFinite(n) && n > 0 && (!Number.isFinite(ratio) || !Number.isFinite(percentage) || ratio === 0 || percentage === 0)) fail('RANGE');
    const angle = ratio === Infinity ? 0 : Math.atan2(1, ratio) * 180 / Math.PI;
    return {ratio, percentage, angle};
  }
  function partial(g, known = {}) { return {run: null, rise: null, length: null, ...known, ...g, status: 'needs-distance'}; }
  function complete(run, rise, length) {
    if (length === 0) fail('ZERO');
    if (![run, rise, length].every(Number.isFinite)) fail('RANGE');
    const ratio = rise === 0 ? Infinity : run / rise;
    const percentage = run === 0 ? Infinity : (rise / run) * 100;
    if ((run > 0 && !Number.isFinite(percentage)) || (rise > 0 && !Number.isFinite(ratio)) || (rise > 0 && run > 0 && (ratio === 0 || percentage === 0))) fail('RANGE');
    return {run, rise, length, ratio, percentage, angle: Math.atan2(rise, run) * 180 / Math.PI, status: 'complete'};
  }
  function calculate(pair, values) {
    if (!pairs.includes(pair)) fail('PAIR');
    const [a, b] = pair.split('-');
    if (pair === 'ratio-percentage') {
      const g = gradient(a, values[a]), other = gradient(b, values[b]);
      const equal = g.percentage === other.percentage || (Number.isFinite(g.percentage) && Number.isFinite(other.percentage) && Math.abs(g.percentage - other.percentage) <= Math.max(g.percentage, other.percentage) * 1e-10);
      if (!equal) fail('CONFLICT');
      return partial(g);
    }
    if (b !== 'ratio' && b !== 'percentage') {
      let run, rise, length;
      if (pair === 'run-rise') { run = parseLength(values.run); rise = parseLength(values.rise); length = Math.hypot(run, rise); }
      else if (pair === 'run-length') { run = parseLength(values.run); length = parseLength(values.length); rise = missingLeg(length, run); }
      else { rise = parseLength(values.rise); length = parseLength(values.length); run = missingLeg(length, rise); }
      return complete(run, rise, length);
    }
    const distance = parseLength(values[a]), g = gradient(b, values[b]);
    let run, rise, length;
    if (g.percentage === 0) {
      if (a === 'rise') { if (distance !== 0) fail('LEVEL'); return partial(g, {rise: 0}); }
      run = distance; rise = 0; length = distance;
    } else if (g.ratio === 0) {
      if (a === 'run') { if (distance !== 0) fail('VERTICAL'); return partial(g, {run: 0}); }
      run = 0; rise = distance; length = distance;
    } else {
      if (a === 'run') { run = distance; rise = run / g.ratio; length = Math.hypot(run, rise); }
      else if (a === 'rise') { rise = distance; run = rise * g.ratio; length = Math.hypot(run, rise); }
      else {
        length = distance;
        const normaliser = Math.hypot(g.ratio, 1);
        run = length * (g.ratio / normaliser); rise = length / normaliser;
      }
      if (distance > 0 && (run === 0 || rise === 0)) fail('RANGE');
    }
    return complete(run, rise, length);
  }
  function calculateSlope(key, value) {
    if (key !== 'ratio' && key !== 'percentage') fail('PAIR');
    return partial(gradient(key, value));
  }
  function configured(pair, values, options = {}) {
    const layoutCalculator = typeof module !== 'undefined' && module.exports ? require('./layout-calculator.js') : root.LayoutCalculator;
    const enabled = Boolean(options.enabled), runMode = options.runMode === 'fixed' ? 'fixed' : 'extend';
    if (!enabled) {
      const section = calculate(pair, values), layout = layoutCalculator.slope(section, {enabled:false});
      return {...section,rampRun:section.run,layout,...layoutCalculator.overallSlope(section.rise,section.run)};
    }
    if (runMode === 'fixed' && pair.split('-').includes('run')) {
      const layoutBase = layoutCalculator.fixedSlopeRun(parseLength(values.run), options);
      const section = calculate(pair, {...values,run:layoutBase.rampRun});
      const layout = layoutCalculator.completeSlope(layoutBase,section);
      return {...section,run:layout.overallRun,rampRun:layout.rampRun,layout,...layoutCalculator.overallSlope(section.rise,layout.overallRun)};
    }
    const section = calculate(pair,values), layout = layoutCalculator.slope(section,options);
    const displayedRun = runMode === 'fixed' ? layout.overallRun : section.run;
    return {...section,run:displayedRun,rampRun:section.run,layout:{...layout,runMode},...layoutCalculator.overallSlope(section.rise,layout.overallRun)};
  }
  const api = {calculate, configured, calculateSlope, parseLength, parseRatio, parsePercentage, pairs};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SlopeCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
