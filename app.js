'use strict';
const $ = id => document.getElementById(id);
const fields = ['run', 'rise', 'length', 'ratio', 'percentage'];
let state = SlopeInputState.create();
let language = 'th';
let levelState = {start:'', end:'', startSource:false, endSource:false, direction:1, error:null};
let separateLandingValues = [];
try { if (localStorage.getItem('pld-slope-language') === 'en') language = 'en'; } catch (_) { /* Storage is optional. */ }
const t = key => SlopeTranslations[language][key];

function format(number, digits = 3) {
  if (number === null) return '—';
  if (number === Infinity) return '∞';
  if (number === 0) return '0';
  return Math.abs(number) < 0.001 || Math.abs(number) >= 1e7 ? number.toExponential(digits) : number.toLocaleString('en-GB', {maximumFractionDigits:digits});
}

function formatLevel(number) {
  if (!Number.isFinite(number)) return '—';
  return `${number >= 0 ? '+' : ''}${number.toLocaleString('en-GB', {minimumFractionDigits:3, maximumFractionDigits:3})}`;
}

function inputDisplay(number) {
  if (number === null) return '';
  return Number.isFinite(number) ? String(Number(number.toPrecision(9))) : '∞';
}

function completeLevels(rise) {
  try {
    levelState.error = null;
    return LevelCalculator.complete(levelState.startSource ? levelState.start : '', levelState.endSource ? levelState.end : '', rise, levelState.direction);
  } catch (error) {
    levelState.error = error.code || 'LEVEL_INVALID';
    return {start:null, end:null, rise, direction:levelState.direction};
  }
}

function syncLevelInputs(levels) {
  const pairs = [['start-level','start','startSource'], ['end-level','end','endSource']];
  for (const [id,key,sourceKey] of pairs) {
    const input = $(id), source = levelState[sourceKey], value = levels[key];
    input.dataset.source = String(source);
    input.dataset.calculated = String(!source && Number.isFinite(value));
    input.classList.toggle('level-calculated', !source && Number.isFinite(value));
    input.setAttribute('aria-invalid', String(Boolean(levelState.error && source)));
    $(id+'-tag').textContent = source ? t('input') : Number.isFinite(value) ? t('calculated') : '';
    if (!source) input.value = Number.isFinite(value) ? String(Number(value.toFixed(6))) : '';
  }
  $('slope-descending').checked = levels.direction < 0;
  $('level-status').textContent = levelState.error ? t('errors')[levelState.error] : levelState.startSource && levelState.endSource ? t('levelFromPair') : (levelState.startSource || levelState.endSource) && state.result ? t('levelCalculated') : '';
  $('level-status').className = `config-status${levelState.error ? ' error' : ''}`;
}

function landingSettings() {
  return {enabled:$('use-slope-landings').checked, maximumRun:$('max-flight-run').value, equal:$('equal-slope-landings').checked, sharedLength:$('slope-landing-length').value, lengths:separateLandingValues};
}

function requiredLandingCount(section) {
  if (!$('use-slope-landings').checked || !section || section.run === 0) return 0;
  const maximum = LayoutCalculator.positive($('max-flight-run').value, 'MAX_RUN');
  return Math.max(0, Math.ceil(section.run / maximum - 1e-12) - 1);
}

function renderIndividualLandings(count) {
  separateLandingValues.length = Math.max(separateLandingValues.length, count);
  const container = $('slope-individual-landings');
  container.innerHTML = '';
  for (let index = 0; index < count; index += 1) {
    const field = document.createElement('div'); field.className = 'field';
    const label = document.createElement('label'); label.htmlFor = `slope-landing-${index}`;
    const name = document.createElement('span'); name.textContent = `${t('landingNumber')} ${index + 1}`; label.appendChild(name);
    const wrap = document.createElement('div'); wrap.className = 'input-wrap';
    const input = document.createElement('input'); input.id = `slope-landing-${index}`; input.inputMode = 'decimal'; input.autocomplete = 'off'; input.placeholder = '1.50'; input.value = separateLandingValues[index] || '';
    input.addEventListener('input', () => { separateLandingValues[index] = input.value; update(); });
    const unit = document.createElement('span'); unit.textContent = t('metre');
    wrap.append(input, unit); field.append(label, wrap); container.appendChild(field);
  }
}

function currentLayout(section) {
  const base = LayoutCalculator.slope(section, {enabled:false});
  $('slope-layout-status').textContent = ''; $('slope-layout-status').className = 'config-status';
  if (!$('use-slope-landings').checked) return base;
  try {
    const count = requiredLandingCount(section);
    if (!$('equal-slope-landings').checked && $('slope-individual-landings').children.length !== count) renderIndividualLandings(count);
    const layout = LayoutCalculator.slope(section, landingSettings());
    $('slope-layout-status').textContent = layout.landingCount ? t('layoutReady') : t('noLandingNeeded');
    return layout;
  } catch (error) {
    $('slope-layout-status').textContent = t('errors')[error.code] || t('errors').LANDING;
    $('slope-layout-status').className = 'config-status error';
    return base;
  }
}

function draw(section, layout, levels) {
  const totalRun = Math.max(layout.overallRun, section.run), rise = section.rise;
  const scale = Math.min(totalRun === 0 ? Infinity : 500 / totalRun, rise === 0 ? Infinity : 210 / rise);
  const safeScale = Number.isFinite(scale) ? scale : 1;
  let x = 92, y = levels.direction < 0 ? 92 : 302;
  const startX = x, startY = y, points = [[x,y]], surface = [];
  for (let index = 0; index < layout.flights; index += 1) {
    const nextX = x + layout.flightRun * safeScale;
    const nextY = y + (levels.direction < 0 ? 1 : -1) * layout.flightRise * safeScale;
    surface.push(`<path class="surface" d="M ${x} ${y} L ${nextX} ${nextY}"/>`);
    x = nextX; y = nextY; points.push([x,y]);
    if (index < layout.landingCount) {
      const landingEnd = x + layout.landingLengths[index] * safeScale;
      surface.push(`<path class="landing-line" d="M ${x} ${y} H ${landingEnd}"/>`);
      x = landingEnd; points.push([x,y]);
    }
  }
  const endX = x, endY = y, baseline = 330;
  const fillPath = `M ${startX} ${startY} ${points.slice(1).map(point => `L ${point[0]} ${point[1]}`).join(' ')} L ${endX} ${baseline} L ${startX} ${baseline} Z`;
  const levelLabels = [];
  if (Number.isFinite(levels.start)) levelLabels.push(`<text class="level-text" x="${startX}" y="${startY + (levels.direction < 0 ? -17 : 24)}" text-anchor="start">${t('startLevel')} ${formatLevel(levels.start)}</text>`);
  if (Number.isFinite(levels.end)) levelLabels.push(`<text class="level-text" x="${endX}" y="${endY + (levels.direction < 0 ? 24 : -17)}" text-anchor="end">${t('endLevel')} ${formatLevel(levels.end)}</text>`);
  let flightEndX = startX, flightEndY = startY;
  const intermediate = [];
  for (let index = 0; index < layout.landingCount; index += 1) {
    flightEndX += layout.flightRun * safeScale; flightEndY += (levels.direction < 0 ? 1 : -1) * layout.flightRise * safeScale;
    const landingLevel = Number.isFinite(levels.start) ? levels.start + levels.direction * layout.flightRise * (index + 1) : null;
    if (Number.isFinite(landingLevel)) intermediate.push(`<text class="segment-text" x="${flightEndX + 5}" y="${flightEndY - 8}">${formatLevel(landingLevel)}</text>`);
    flightEndX += layout.landingLengths[index] * safeScale;
  }
  $('svg-desc').textContent = `${t('diagramRun')} ${format(section.run)} ${t('metre')}, ${t('diagramRise')} ${format(section.rise)} ${t('metre')}, ${layout.flights} ${t('flights')}, ${layout.landingCount} ${t('landings')}.`;
  $('geometry').innerHTML = `
    <path class="shape" d="${fillPath}"/>${surface.join('')}
    <path class="dim" d="M ${startX} 346 V 380 M ${endX} 346 V 380 M ${startX} 370 H ${endX}"/>
    <text x="${(startX+endX)/2}" y="398" text-anchor="middle">${t('overallFootprint')} ${format(layout.overallRun)} ${t('metre')}</text>
    <text class="label" x="${(startX+endX)/2}" y="${Math.max(22,Math.min(startY,endY)-34)}" text-anchor="middle">${t('slope')} ${format(section.percentage)}% · 1:${format(section.ratio)}</text>
    <text class="segment-text" x="${(startX+endX)/2}" y="${Math.max(43,Math.min(startY,endY)-13)}" text-anchor="middle">${layout.flights} ${t('flights')} · ${t('perFlightRun')} ${format(layout.flightRun)} ${t('metre')}</text>
    ${levelLabels.join('')}${intermediate.join('')}`;
}

function emptyDiagram(partial = false) {
  const line1 = t(partial ? 'undetermined' : 'empty'), line2 = t(partial ? 'undeterminedSecond' : 'emptySecond');
  $('geometry').innerHTML = `<text x="360" y="200" text-anchor="middle">${line1}</text><text x="360" y="232" text-anchor="middle">${line2}</text>`;
  $('svg-desc').textContent = `${line1}. ${line2}.`;
}

function renderLayoutSummary(layout) {
  const summary = $('slope-layout-summary');
  if (!$('use-slope-landings').checked) { summary.hidden = true; summary.innerHTML = ''; return; }
  summary.hidden = false;
  summary.innerHTML = `<article><small>${t('flights')}</small><strong>${layout.flights}</strong></article><article><small>${t('landings')}</small><strong>${layout.landingCount}</strong></article><article><small>${t('perFlightRun')}</small><strong>${format(layout.flightRun)} ${t('metre')}</strong></article><article><small>${t('overallFootprint')}</small><strong>${format(layout.overallRun)} ${t('metre')}</strong></article>`;
}

function update() {
  const {active, values, result:section, error} = state;
  for (const key of fields) {
    const source = active.includes(key), input = $(key);
    input.dataset.source = String(source); input.dataset.calculated = String(!source && values[key] !== ''); input.setAttribute('aria-invalid','false');
    $(key+'-tag').textContent = source ? t('input') : values[key] !== '' ? t('calculated') : '';
    if (!source) input.value = values[key] === '' ? '' : inputDisplay(values[key]);
  }
  $('slope-landing-options').hidden = !$('use-slope-landings').checked;
  $('slope-shared-landing').hidden = !$('equal-slope-landings').checked;
  $('slope-individual-landings').hidden = $('equal-slope-landings').checked;
  $('sources').textContent = active.length ? `${t('using')} ${active.map(t).join(' + ')}` : '';
  const levels = completeLevels(section?.rise ?? 0); syncLevelInputs(levels);
  if (section) {
    $('percent-result').textContent = `${format(section.percentage)}%`; $('ratio-result').textContent = `1 : ${format(section.ratio)}`; $('angle-result').textContent = `${format(section.angle)}°`;
    const partial = section.status === 'needs-distance'; $('status').className = partial ? 'notice' : ''; $('status').textContent = t(partial ? 'needsDistance' : section.rise === 0 ? 'level' : section.run === 0 ? 'vertical' : 'ready');
    if (partial) { emptyDiagram(true); $('slope-layout-summary').hidden = true; }
    else { const layout = currentLayout(section); draw(section, layout, levels); renderLayoutSummary(layout); }
  } else {
    for (const key of ['percent-result','ratio-result','angle-result']) $(key).textContent = '—'; emptyDiagram(); $('slope-layout-summary').hidden = true;
    const waiting = error === 'SECOND' && active.length === 1;
    $('status').textContent = waiting ? `${t('received')} ${t(active[0])} · ${t('nextValue')}` : error ? t('errors')[error] || t('errors').INVALID : t('start');
    const invalid = error && !['MISSING','SECOND'].includes(error); $('status').className = invalid ? 'error' : waiting ? 'waiting' : '';
    if (invalid) for (const key of active) $(key).setAttribute('aria-invalid','true');
  }
}

function useLevelPair() {
  if (!(levelState.startSource && levelState.endSource)) return;
  try {
    const levels = LevelCalculator.difference(levelState.start, levelState.end);
    levelState.direction = levels.direction; levelState.error = null; $('rise').value = String(Number(levels.rise.toPrecision(12))); state = SlopeInputState.edit(state, 'rise', $('rise').value);
  } catch (error) { levelState.error = error.code || 'LEVEL_INVALID'; }
}

function editLevel(key, value) {
  levelState[key] = value; levelState[key+'Source'] = String(value).trim() !== ''; useLevelPair(); update();
}

function setLanguage(next) {
  language = next; document.documentElement.lang = next;
  for (const node of document.querySelectorAll('[data-i18n]')) node.textContent = t(node.dataset.i18n);
  for (const button of document.querySelectorAll('[data-language]')) button.setAttribute('aria-pressed', String(button.dataset.language === next));
  try { localStorage.setItem('pld-slope-language', next); } catch (_) { /* Works without storage. */ }
  renderIndividualLandings($('equal-slope-landings').checked ? 0 : $('slope-individual-landings').children.length); update();
}

for (const key of fields) $(key).addEventListener('input', () => {
  state = SlopeInputState.edit(state, key, $(key).value);
  if (state.result && !state.active.includes('rise') && levelState.startSource && levelState.endSource) levelState.endSource = false;
  if (key === 'rise' && levelState.startSource && levelState.endSource) levelState.endSource = false;
  update();
});
$('start-level').addEventListener('input', () => editLevel('start', $('start-level').value));
$('end-level').addEventListener('input', () => editLevel('end', $('end-level').value));
$('slope-descending').addEventListener('change', () => { levelState.direction = $('slope-descending').checked ? -1 : 1; if (levelState.startSource && levelState.endSource) levelState.endSource = false; update(); });
for (const id of ['use-slope-landings','equal-slope-landings']) $(id).addEventListener('change', update);
for (const id of ['max-flight-run','slope-landing-length']) $(id).addEventListener('input', update);
$('reset').addEventListener('click', () => {
  state = SlopeInputState.create(); levelState = {start:'',end:'',startSource:false,endSource:false,direction:1,error:null}; separateLandingValues = [];
  for (const id of ['start-level','end-level','max-flight-run','slope-landing-length']) $(id).value = '';
  $('use-slope-landings').checked = false; $('equal-slope-landings').checked = true; $('slope-descending').checked = false; $('slope-individual-landings').innerHTML = '';
  update(); $('run').focus();
});
for (const button of document.querySelectorAll('[data-language]')) button.addEventListener('click', () => setLanguage(button.dataset.language));
setLanguage(language);
