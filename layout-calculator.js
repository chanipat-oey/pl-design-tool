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
      return {enabled, runMode:'extend', flights:1, landingCount:0, landingLengths:[], totalLandingRun:0, rampRun:section.run, overallRun:section.run, flightRun:section.run, flightRise:section.rise, flightLength:section.length};
    }
    const maximumRun = positive(settings.maximumRun, 'MAX_RUN');
    const flights = Math.max(1, Math.ceil(section.run / maximumRun - 1e-12));
    const landingCount = flights - 1;
    const lengths = landingLengths(landingCount, settings);
    const totalLandingRun = lengths.reduce((sum, value) => sum + value, 0);
    return {
      enabled, maximumRun, flights, landingCount, landingLengths:lengths,
      totalLandingRun, rampRun:section.run, overallRun:section.run + totalLandingRun, runMode:'extend',
      flightRun:section.run / flights, flightRise:section.rise / flights, flightLength:section.length / flights
    };
  }

  function fixedSlopeRun(overallRunValue, settings = {}) {
    const overallRun = positive(overallRunValue, 'FOOTPRINT');
    const maximumRun = positive(settings.maximumRun, 'MAX_RUN');
    const maximumFlights = Math.min(30, Math.max(1, Math.ceil(overallRun / maximumRun - 1e-12)));
    for (let flights = 1; flights <= maximumFlights; flights += 1) {
      const landingCount = flights - 1;
      const lengths = landingLengths(landingCount, settings);
      const totalLandingRun = lengths.reduce((sum, value) => sum + value, 0);
      const rampRun = overallRun - totalLandingRun;
      if (rampRun <= 0) failure('FOOTPRINT');
      if (rampRun / flights <= maximumRun + 1e-12) {
        return {enabled:true,runMode:'fixed',maximumRun,flights,landingCount,landingLengths:lengths,totalLandingRun,rampRun,overallRun,flightRun:rampRun/flights};
      }
    }
    failure('MAX_RUN');
  }

  function completeSlope(layout, section) {
    return {...layout,flightRise:section.rise/layout.flights,flightLength:section.length/layout.flights};
  }

  function overallSlope(rise, overallRun) {
    if (rise === 0) return {overallRatio:Infinity,overallPercentage:0,overallAngle:0};
    if (overallRun === 0) return {overallRatio:0,overallPercentage:Infinity,overallAngle:90};
    return {overallRatio:overallRun/rise,overallPercentage:rise/overallRun*100,overallAngle:Math.atan2(rise,overallRun)*180/Math.PI};
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
    const stairRun = Number.isFinite(section.stairRun) ? section.stairRun : section.totalRun;
    const overallRun = settings.runMode === 'fixed' ? section.totalRun : stairRun + totalLandingRun;
    return {
      enabled, flights, landingCount, landingLengths:lengths, totalLandingRun,
      runMode:settings.runMode === 'fixed' ? 'fixed' : 'extend', stairRun, overallRun, risersByFlight, treadsByFlight
    };
  }

  const api = {positive, whole, landingLengths, slope, fixedSlopeRun, completeSlope, overallSlope, stairs, distribute};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LayoutCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
