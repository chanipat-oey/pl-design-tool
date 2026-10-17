'use strict';
const stair$ = id => document.getElementById(id);
const stairFields = StairCalculator.fields;
let stairState = StairInputState.create();
let stairLanguage = 'th';
try { if (localStorage.getItem('pld-slope-language') === 'en') stairLanguage = 'en'; } catch (_) { /* Storage is optional. */ }
const stairT = key => StairTranslations[stairLanguage][key];

function stairFormat(value, digits = 2) {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('en-GB', {maximumFractionDigits: digits});
}

function stairInputDisplay(key, value) {
  if (!Number.isFinite(value)) return '';
  if (key === 'risers' || key === 'treads') return String(Math.round(value));
  return String(Number(value.toPrecision(9)));
}

function stairEmpty(groupId) {
  stair$(groupId).innerHTML = `<text class="diagram-empty" x="360" y="195" text-anchor="middle">${stairT('empty')}</text><text class="diagram-empty" x="360" y="226" text-anchor="middle">${stairT('emptySecond')}</text>`;
}

function stairPath(section, scale) {
  const x = 72, y = 310, rise = section.riserHeight / 1000 * scale, tread = section.treadDepth / 1000 * scale;
  let path = `M ${x} ${y}`;
  for (let index = 0; index < section.risers; index += 1) {
    path += ` V ${y - (index + 1) * rise}`;
    if (index < section.treads) path += ` H ${x + (index + 1) * tread}`;
  }
  return {path, x, y, endX:x + section.totalRun * scale, topY:y - section.totalRise * scale};
}

function drawStair(groupId, section, scale) {
  const {path, x, y, endX, topY} = stairPath(section, scale);
  const fill = `${path} L ${endX} ${y} L ${x} ${y} Z`;
  const riseLabelX = Math.min(690, endX + 34), centreX = (x + endX) / 2;
  stair$(groupId).innerHTML = `
    <path class="stair-fill" d="${fill}"/>
    <path class="stair-line" d="${path}"/>
    <path class="slope-line" d="M ${x} ${y} L ${endX} ${topY}"/>
    <path class="dimension" d="M ${x} ${y+15} V ${y+48} M ${endX} ${y+15} V ${y+48} M ${x} ${y+39} H ${endX}"/>
    <text x="${centreX}" y="${y+68}" text-anchor="middle">${stairT('totalRunLabel')} ${stairFormat(section.totalRun,3)} ${stairT('metre')}</text>
    <path class="dimension" d="M ${endX+10} ${y} H ${riseLabelX} M ${endX+10} ${topY} H ${riseLabelX} M ${riseLabelX-7} ${y} V ${topY}"/>
    <text x="${riseLabelX+15}" y="${(y+topY)/2}" text-anchor="middle" transform="rotate(-90 ${riseLabelX+15} ${(y+topY)/2})">${stairT('totalRiseLabel')} ${stairFormat(section.totalRise,3)} ${stairT('metre')}</text>
    <text class="diagram-label" x="${centreX}" y="${Math.max(28,topY-24)}" text-anchor="middle">${section.risers} ${stairT('risers')} · ${section.treads} ${stairT('treads')}</text>
    <text x="${centreX}" y="${Math.max(49,topY-4)}" text-anchor="middle">R ${stairFormat(section.riserHeight,1)} · T ${stairFormat(section.treadDepth,1)} ${stairT('millimetre')}</text>
    <text x="${x}" y="${y+94}">${stairT('comfortLabel')} = ${stairFormat(section.comfort,1)} ${stairT('millimetre')}</text>
    <text x="${endX}" y="${y+94}" text-anchor="end">1:${stairFormat(section.ratio,2)} · ${stairFormat(section.percentage,1)}%</text>`;
}

function comparisonRows(user, proposal) {
  const rows = [
    ['risers','risers','',0], ['treads','treads','',0], ['totalRise','totalRise',stairT('metre'),3], ['totalRun','totalRun',stairT('metre'),3],
    ['riserHeight','riserHeight',stairT('millimetre'),1], ['treadDepth','treadDepth',stairT('millimetre'),1], ['comfortLabel','comfort',stairT('millimetre'),1],
    ['ratio','ratio','',2], ['percentage','percentage','%',1], ['angle','angle','°',1]
  ];
  return rows.map(([label,key,unit,digits]) => {
    const current = user[key], suggested = proposal[key], difference = suggested - current;
    const display = (value, prefix = '') => key === 'ratio' ? `1:${stairFormat(value,digits)}` : `${prefix}${stairFormat(value,digits)}${unit ? ` ${unit}` : ''}`;
    const delta = Math.abs(difference) < 1e-9 ? '—' : display(Math.abs(difference), difference > 0 ? '+' : '−');
    return `<tr><th scope="row">${stairT(label)}</th><td>${display(current)}</td><td>${display(suggested)}</td><td>${delta}</td></tr>`;
  }).join('');
}

function updateStairs() {
  const {active, values, result, error} = stairState;
  for (const key of stairFields) {
    const source = active.includes(key), input = stair$(key);
    input.dataset.source = String(source);
    input.dataset.calculated = String(!source && values[key] !== '');
    input.setAttribute('aria-invalid','false');
    stair$(key+'-tag').textContent = source ? stairT('input') : values[key] !== '' ? stairT('calculated') : '';
    if (!source) input.value = values[key] === '' ? '' : stairInputDisplay(key, Number(values[key]));
  }
  stair$('stair-sources').textContent = active.length ? `${stairT('using')} ${active.map(stairT).join(' + ')}` : '';
  if (result) {
    const maxRun = Math.max(result.user.totalRun, result.recommended.totalRun);
    const maxRise = Math.max(result.user.totalRise, result.recommended.totalRise);
    const scale = Math.min(500 / maxRun, 225 / maxRise);
    drawStair('user-geometry', result.user, scale);
    drawStair('proposal-geometry', result.recommended, scale);
    stair$('comparison-body').innerHTML = comparisonRows(result.user, result.recommended);
    stair$('stair-status').textContent = stairT('ready');
    stair$('stair-status').className = '';
    stair$('assumption-note').textContent = result.usesDefaults ? stairT('assumptions') : '';
  } else {
    stairEmpty('user-geometry'); stairEmpty('proposal-geometry');
    stair$('comparison-body').innerHTML = '';
    const waiting = !error || error === 'SECOND';
    stair$('stair-status').textContent = active.length === 1 ? stairT('received') : error ? stairT('errors')[error] || stairT('errors').INVALID : stairT('start');
    stair$('stair-status').className = waiting && active.length === 1 ? 'waiting' : error && error !== 'SECOND' ? 'error' : '';
    stair$('assumption-note').textContent = '';
    if (error && error !== 'SECOND') for (const key of active) stair$(key).setAttribute('aria-invalid','true');
  }
}

function setStairLanguage(next) {
  stairLanguage = next; document.documentElement.lang = next;
  for (const node of document.querySelectorAll('[data-i18n]')) node.textContent = stairT(node.dataset.i18n);
  for (const button of document.querySelectorAll('[data-language]')) button.setAttribute('aria-pressed', String(button.dataset.language === next));
  try { localStorage.setItem('pld-slope-language', next); } catch (_) { /* Storage is optional. */ }
  updateStairs();
}

for (const key of stairFields) stair$(key).addEventListener('input', () => { stairState = StairInputState.edit(stairState, key, stair$(key).value); updateStairs(); });
stair$('stair-reset').addEventListener('click', () => { stairState = StairInputState.create(); updateStairs(); stair$('risers').focus(); });
for (const button of document.querySelectorAll('[data-language]')) button.addEventListener('click', () => setStairLanguage(button.dataset.language));
setStairLanguage(stairLanguage);
