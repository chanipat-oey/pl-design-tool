(function (root) {
  'use strict';

  const fields = ['risers', 'treads', 'totalRise', 'totalRun', 'riserHeight', 'treadDepth', 'ratio', 'percentage'];
  const countFields = new Set(['risers', 'treads']);
  const numeric = /^(?:\d+(?:\.\d*)?|\.\d+)$/;

  function failure(code, message) {
    const error = new Error(message || code);
    error.code = code;
    throw error;
  }

  function number(value, key) {
    const text = String(value ?? '').trim();
    if (!numeric.test(text)) failure('INVALID');
    const result = Number(text);
    if (!Number.isFinite(result) || result <= 0) failure('INVALID');
    if (countFields.has(key) && (!Number.isInteger(result) || result > 200)) failure('COUNT');
    return result;
  }

  function parseInputs(active, values, flights = 1) {
    if (!Array.isArray(active) || active.length !== 2 || active[0] === active[1]) failure('SECOND');
    const parsed = {};
    for (const key of active) {
      if (!fields.includes(key)) failure('PAIR');
      parsed[key] = number(values[key], key);
    }
    if (active.includes('ratio') && active.includes('percentage')) failure('DUPLICATE_SLOPE');
    if (parsed.risers && parsed.risers <= flights) failure('FLIGHTS_GEOMETRY');
    if (parsed.risers && parsed.treads && parsed.treads !== parsed.risers - flights) failure('COUNT_RELATION');
    return parsed;
  }

  function solveLinear(equations) {
    let aa = 0, ab = 0, bb = 0, ac = 0, bc = 0;
    for (const {a, b, c, w} of equations) {
      aa += w * a * a; ab += w * a * b; bb += w * b * b;
      ac += w * a * c; bc += w * b * c;
    }
    const det = aa * bb - ab * ab;
    if (!Number.isFinite(det) || Math.abs(det) < 1e-12) failure('GEOMETRY');
    return {x: (ac * bb - bc * ab) / det, y: (bc * aa - ac * ab) / det};
  }

  function result(nr, r, t, flights = 1) {
    const nt = nr - flights, totalRise = nr * r, totalRun = nt * t;
    if (![r, t, totalRise, totalRun].every(v => Number.isFinite(v) && v > 0)) failure('GEOMETRY');
    return {
      risers: nr,
      treads: nt,
      totalRise,
      totalRun,
      riserHeight: r,
      treadDepth: t,
      ratio: totalRun / totalRise,
      percentage: totalRise / totalRun * 100,
      angle: Math.atan2(totalRise, totalRun) * 180 / Math.PI,
      comfort: 2 * r + t
    };
  }

  function countCandidates(input, flights) {
    if (input.risers) return [input.risers];
    if (input.treads) return [input.treads + flights];
    return Array.from({length: Math.max(1, 80 - flights)}, (_, index) => index + flights + 1);
  }

  function userCandidate(nr, input, flights) {
    const nt = nr - flights;
    if (nt <= 0) return null;
    const eq = [
      {a: 1, b: 0, c: Math.log(0.15), w: 1},
      {a: 0, b: 1, c: Math.log(0.30), w: 1}
    ];
    if (input.totalRise) eq.push({a: 1, b: 0, c: Math.log(input.totalRise / nr), w: 1e7});
    if (input.totalRun) eq.push({a: 0, b: 1, c: Math.log(input.totalRun / nt), w: 1e7});
    if (input.riserHeight) eq.push({a: 1, b: 0, c: Math.log(input.riserHeight), w: 2e4});
    if (input.treadDepth) eq.push({a: 0, b: 1, c: Math.log(input.treadDepth), w: 2e4});
    const ratio = input.ratio || (input.percentage ? 100 / input.percentage : null);
    if (ratio) eq.push({a: -1, b: 1, c: Math.log(ratio * nr / nt), w: 1e6});
    const solved = solveLinear(eq), r = Math.exp(solved.x), t = Math.exp(solved.y);
    let score = eq.reduce((sum, e) => sum + e.w * Math.pow(e.a * solved.x + e.b * solved.y - e.c, 2), 0);
    if (!input.risers && !input.treads) score += Math.pow((nr - 7) / 6, 2) * 0.05;
    return {data: result(nr, r, t, flights), score};
  }

  function recommendedCandidate(nr, input, flights) {
    const nt = nr - flights;
    if (nt <= 0) return null;
    const hardR = input.totalRise ? input.totalRise / nr : null;
    const hardT = input.totalRun ? input.totalRun / nt : null;
    const ratio = input.ratio || (input.percentage ? 100 / input.percentage : null);
    const q = ratio ? ratio * nr / nt : null;
    let r, t;
    if (q) {
      if (hardR) { r = hardR; t = q * r; }
      else if (hardT) { t = hardT; r = t / q; }
      else { r = 0.63 / (2 + q); t = q * r; }
    } else if (hardR && hardT) {
      r = hardR; t = hardT;
    } else if (hardR) {
      r = hardR; t = 0.63 - 2 * r;
    } else if (hardT) {
      t = hardT; r = (0.63 - t) / 2;
    } else if (input.riserHeight) {
      r = input.riserHeight; t = 0.63 - 2 * r;
    } else if (input.treadDepth) {
      t = input.treadDepth; r = (0.63 - t) / 2;
    } else {
      r = 0.15; t = 0.33;
    }
    if (!(r > 0.03 && t > 0.05)) return null;
    const data = result(nr, r, t, flights);
    let score = Math.pow((data.comfort - 0.63) / 0.01, 2);
    if (input.riserHeight) score += Math.pow((data.riserHeight - input.riserHeight) / 0.01, 2);
    if (input.treadDepth) score += Math.pow((data.treadDepth - input.treadDepth) / 0.015, 2);
    if (input.totalRise) score += Math.pow((data.totalRise - input.totalRise) / 0.001, 2);
    if (input.totalRun) score += Math.pow((data.totalRun - input.totalRun) / 0.001, 2);
    if (ratio) score += Math.pow((data.ratio - ratio) / Math.max(ratio, 0.01) * 100, 2);
    if (!input.risers && !input.treads && !input.totalRise && !input.totalRun) score += Math.pow((nr - 7) / 2, 2);
    return {data, score};
  }

  function best(candidates) {
    const valid = candidates.filter(Boolean).sort((a, b) => a.score - b.score || a.data.risers - b.data.risers);
    if (!valid.length) failure('GEOMETRY');
    return valid[0].data;
  }

  function calculate(active, values, options = {}) {
    const flights = options.flights === undefined ? 1 : Number(options.flights);
    if (!Number.isInteger(flights) || flights < 1 || flights > 30) failure('FLIGHTS');
    const input = parseInputs(active, values, flights);
    const counts = countCandidates(input, flights);
    const user = best(counts.map(nr => userCandidate(nr, input, flights)));
    const recommended = best(counts.map(nr => recommendedCandidate(nr, input, flights)));
    return {
      input, flights,
      user,
      recommended,
      usesDefaults: !input.riserHeight || !input.treadDepth || (!input.risers && !input.treads && !input.totalRise && !input.totalRun)
    };
  }

  const api = {fields, calculate, number, result};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StairCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
