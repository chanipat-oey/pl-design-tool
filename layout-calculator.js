(function (root) {
  'use strict';

  const numeric = /^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

  function failure(code) {
    const error = new Error(code);
    error.code = code;
    throw error;
  }

  function positive(value, code = 'LANDING') {
    const text = String(value ?? '').trim(), number = Number(text);
    if (!numeric.test(text) || !Number.isFinite(number) || number <= 0) failure(code);
    return number;
  }

  function whole(value, code = 'FLIGHTS') {
    const number = positive(value, code);
    if (!Number.isInteger(number) || number > 30) failure(code);
    return number;
  }

  function landingLengths(count, settings) {
    if (count <= 0) return [];
    if (settings.equal !== false) {
      const length = positive(settings.sharedLength);
      return Array(count).fill(length);
    }
    if (!Array.isArray(settings.lengths) || settings.lengths.length < count) failure('LANDING');
    return settings.lengths.slice(0, count).map(value => positive(value));
  }

  function slope(section, settings = {}) {
    const enabled = Boolean(settings.enabled);
    if (!enabled || section.run === 0) {
      return {enabled, flights:1, landingCount:0, landingLengths:[], totalLandingRun:0, overallRun:section.run, flightRun:section.run, flightRise:section.rise, flightLength:section.length};
    }
    const maximumRun = positive(settings.maximumRun, 'MAX_RUN');
    const flights = Math.max(1, Math.ceil(section.run / maximumRun - 1e-12));
    const landingCount = flights - 1;
    const lengths = landingLengths(landingCount, settings);
    const totalLandingRun = lengths.reduce((sum, value) => sum + value, 0);
    return {
      enabled, maximumRun, flights, landingCount, landingLengths:lengths,
      totalLandingRun, overallRun:section.run + totalLandingRun,
      flightRun:section.run / flights, flightRise:section.rise / flights, flightLength:section.length / flights
    };
  }

  function distribute(total, groups) {
    const base = Math.floor(total / groups), remainder = total % groups;
    return Array.from({length:groups}, (_, index) => base + (index < remainder ? 1 : 0));
  }

  function stairs(section, settings = {}) {
    const enabled = Boolean(settings.enabled);
    const flights = enabled ? whole(settings.flights) : 1;
    if (flights > section.risers) failure('FLIGHTS_GEOMETRY');
    const landingCount = flights - 1;
    const lengths = landingLengths(landingCount, settings);
    const totalLandingRun = lengths.reduce((sum, value) => sum + value, 0);
    const risersByFlight = distribute(section.risers, flights);
    const treadsByFlight = risersByFlight.map(value => Math.max(0, value - 1));
    return {
      enabled, flights, landingCount, landingLengths:lengths, totalLandingRun,
      overallRun:section.totalRun + totalLandingRun, risersByFlight, treadsByFlight
    };
  }

  const api = {positive, whole, landingLengths, slope, stairs, distribute};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LayoutCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
