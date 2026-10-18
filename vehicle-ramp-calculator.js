(function (root) {
  'use strict';

  const numeric = /^(?:\d+(?:\.\d*)?|\.\d+)$/;
  const MIN_TRANSITION = 3;

  function failure(code) {
    const error = new Error(code);
    error.code = code;
    throw error;
  }

  function positive(value, code = 'INVALID') {
    const text = String(value ?? '').trim();
    if (!numeric.test(text)) failure(code);
    const number = Number(text);
    if (!Number.isFinite(number) || number <= 0) failure(code);
    return number;
  }

  function ratio(value) {
    const text = String(value ?? '').trim().replace(/^1\s*:\s*/, '');
    const number = positive(text, 'MAIN_RATIO');
    if (number < 7 || number > 10) failure('MAIN_RATIO');
    return number;
  }

  function segment(key, run, slopeRatio, required = true) {
    const rise = slopeRatio === Infinity ? 0 : run / slopeRatio;
    return {
      key, run, ratio:slopeRatio, percentage:slopeRatio === Infinity ? 0 : 100 / slopeRatio,
      angle:slopeRatio === Infinity ? 0 : Math.atan2(1, slopeRatio) * 180 / Math.PI,
      rise, length:Math.hypot(run, rise), required,
      minimumOk: !required || run >= MIN_TRANSITION - 1e-9
    };
  }

  function calculate(values = {}) {
    const mode = values.mode === 'fit' ? 'fit' : 'design';
    const totalRise = positive(values.totalRise, 'TOTAL_RISE');
    const introEnabled = Boolean(values.introEnabled), outroEnabled = Boolean(values.outroEnabled);
    const introRun = introEnabled ? positive(values.introRun, 'INTRO') : 0;
    const transitionInRun = positive(values.transitionInRun, 'TRANSITION_IN');
    const transitionOutRun = positive(values.transitionOutRun, 'TRANSITION_OUT');
    const outroRun = outroEnabled ? positive(values.outroRun, 'OUTRO') : 0;

    const transitionSegments = [];
    if (introEnabled) transitionSegments.push(segment('intro', introRun, 20));
    transitionSegments.push(segment('transitionIn', transitionInRun, 12));
    transitionSegments.push(segment('transitionOut', transitionOutRun, 12));
    if (outroEnabled) transitionSegments.push(segment('outro', outroRun, 20));

    const transitionRun = transitionSegments.reduce((sum, item) => sum + item.run, 0);
    const transitionRise = transitionSegments.reduce((sum, item) => sum + item.rise, 0);
    const mainRise = totalRise - transitionRise;
    if (!(mainRise > 1e-9)) failure('TRANSITION_RISE');

    let mainRatio, mainRun, extraRun = 0, rawMainRatio;
    if (mode === 'design') {
      mainRatio = ratio(values.mainRatio);
      rawMainRatio = mainRatio;
      mainRun = mainRise * mainRatio;
    } else {
      const availableRun = positive(values.totalRun, 'TOTAL_RUN');
      const availableMainRun = availableRun - transitionRun;
      if (!(availableMainRun > 1e-9)) failure('FOOTPRINT');
      rawMainRatio = availableMainRun / mainRise;
      if (rawMainRatio > 10) {
        mainRatio = 10;
        mainRun = mainRise * mainRatio;
        extraRun = availableMainRun - mainRun;
      } else {
        mainRatio = rawMainRatio;
        mainRun = availableMainRun;
      }
    }

    const ordered = [];
    if (introEnabled) ordered.push(segment('intro', introRun, 20));
    ordered.push(segment('transitionIn', transitionInRun, 12));
    ordered.push(segment('main', mainRun, mainRatio, false));
    ordered.push(segment('transitionOut', transitionOutRun, 12));
    if (outroEnabled) ordered.push(segment('outro', outroRun, 20));
    if (extraRun > 1e-9) ordered.push(segment('extra', extraRun, Infinity, false));

    let cumulativeRun = 0, cumulativeRise = 0;
    for (const item of ordered) {
      item.startRun = cumulativeRun; item.startRise = cumulativeRise;
      cumulativeRun += item.run; cumulativeRise += item.rise;
      item.endRun = cumulativeRun; item.endRise = cumulativeRise;
    }

    const totalRun = cumulativeRun;
    const minimumWarnings = ordered.filter(item => ['intro','transitionIn','transitionOut','outro'].includes(item.key) && item.run < MIN_TRANSITION - 1e-9).map(item => item.key);
    const mainStatus = mainRatio < 7 - 1e-9 ? 'tooSteep' : mainRatio < 10 - 1e-9 ? 'caution' : extraRun > 1e-9 ? 'extra' : 'target';

    return {
      mode, totalRise, totalRun, transitionRun, transitionRise, mainRun, mainRise, mainRatio,
      rawMainRatio, mainPercentage:100/mainRatio, mainAngle:Math.atan2(1,mainRatio)*180/Math.PI,
      extraRun, overallRatio:totalRun/totalRise, overallPercentage:totalRise/totalRun*100,
      overallAngle:Math.atan2(totalRise,totalRun)*180/Math.PI,
      mainStatus, minimumWarnings, segments:ordered
    };
  }

  const api = {calculate, positive, ratio, MIN_TRANSITION};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.VehicleRampCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
