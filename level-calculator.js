(function (root) {
  'use strict';

  const signedNumeric = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;

  function failure(code) {
    const error = new Error(code);
    error.code = code;
    throw error;
  }

  function parseLevel(value) {
    const text = String(value ?? '').trim();
    if (!signedNumeric.test(text)) failure('LEVEL_INVALID');
    const number = Number(text);
    if (!Number.isFinite(number)) failure('LEVEL_INVALID');
    return number;
  }

  function difference(start, end) {
    const startLevel = parseLevel(start), endLevel = parseLevel(end);
    return {
      start: startLevel,
      end: endLevel,
      rise: Math.abs(endLevel - startLevel),
      direction: endLevel < startLevel ? -1 : 1
    };
  }

  function complete(start, end, rise, direction = 1) {
    const height = Number(rise);
    if (!Number.isFinite(height) || height < 0) failure('LEVEL_INVALID');
    const hasStart = String(start ?? '').trim() !== '';
    const hasEnd = String(end ?? '').trim() !== '';
    if (hasStart && hasEnd) return difference(start, end);
    if (hasStart) {
      const startLevel = parseLevel(start);
      return {start:startLevel, end:startLevel + (direction < 0 ? -height : height), rise:height, direction:direction < 0 ? -1 : 1};
    }
    if (hasEnd) {
      const endLevel = parseLevel(end);
      return {start:endLevel - (direction < 0 ? -height : height), end:endLevel, rise:height, direction:direction < 0 ? -1 : 1};
    }
    return {start:null, end:null, rise:height, direction:direction < 0 ? -1 : 1};
  }

  const api = {parseLevel, difference, complete};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LevelCalculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
