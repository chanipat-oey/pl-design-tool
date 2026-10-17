'use strict';
const $ = id => document.getElementById(id);
const fields = ['run', 'rise', 'length', 'ratio', 'percentage'];
const model = {run: '12', rise: '', length: '', ratio: '1:12', percentage: ''};
let language = 'th';
try { if (localStorage.getItem('pld-slope-language') === 'en') language = 'en'; } catch (_) { /* Storage is optional. */ }
const t = key => SlopeTranslations[language][key];
function format(n, digits = 3) {
  if (n === null) return '—';
  if (n === Infinity) return '∞';
  if (n === 0) return '0';
  return n < 0.001 || n >= 1e7 ? n.toExponential(digits) : n.toLocaleString('en-GB', {maximumFractionDigits: digits});
}
function inputDisplay(key, n) {
  if (n === null) return '';
  const number = Number.isFinite(n) ? String(Number(n.toPrecision(9))) : '∞';
  return key === 'ratio' ? `1:${number}` : number;
}
function draw(s) {
  const max = Math.max(s.run, s.rise), nr = s.run / max, nh = s.rise / max;
  const scale = Math.min(nr === 0 ? Infinity : 450 / nr, nh === 0 ? Infinity : 220 / nh);
  const w = nr * scale, h = nh * scale, x = 100 + (450 - w) / 2, y = 300, end = x + w, top = y - h;
  const radians = s.angle * Math.PI / 180, r = 40;
  const arcX = x + r * Math.cos(radians), arcY = y - r * Math.sin(radians), mark = Math.min(14, w / 3, h / 3);
  const lx = x + w / 2 - 12 * Math.sin(radians), ly = y - h / 2 - 16 * Math.cos(radians);
  $('svg-desc').textContent = `${t('diagramRun')} ${format(s.run)} ${t('metre')}, ${t('diagramRise')} ${format(s.rise)} ${t('metre')}, ${t('diagramLength')} ${format(s.length)} ${t('metre')}. ${t('angle')} ${format(s.angle)}°. ${t('diagramDescription')}`;
  // Fixed translations and formatted numbers only; never interpolate raw input.
  $('geometry').innerHTML = `
    <path class="shape" d="M ${x} ${y} H ${end} V ${top} Z"/>
    <path class="surface" d="M ${x} ${y} L ${end} ${top}"/>
    <path class="dim" d="M ${x} ${y+10} V ${y+53} M ${end} ${y+10} V ${y+53} M ${x} ${y+43} H ${end} M ${x-4} ${y+48} l 8 -10 M ${end-4} ${y+48} l 8 -10"/>
    <text x="${x+w/2}" y="${y+76}" text-anchor="middle">${t('diagramRun')} ${format(s.run)} ${t('metre')}</text>
    <path class="dim" d="M ${end+10} ${y} H ${end+50} M ${end+10} ${top} H ${end+50} M ${end+40} ${y} V ${top} M ${end+35} ${y+4} l 10 -8 M ${end+35} ${top+4} l 10 -8"/>
    <text x="${end+61}" y="${top+h/2}" text-anchor="middle" transform="rotate(-90 ${end+61} ${top+h/2})">${t('diagramRise')} ${format(s.rise)} ${t('metre')}</text>
    <text x="${x+w/2}" y="${top-35}" text-anchor="middle" class="label">${s.run === 0 ? t('verticalLabel') : `${t('slope')} ${format(s.percentage)}%`}</text>
    <text x="${lx}" y="${ly}" text-anchor="middle" transform="rotate(${-s.angle} ${lx} ${ly})">${t('diagramLength')} ${format(s.length)} ${t('metre')}</text>
    ${s.rise > 0 && s.run > 0 ? `<path class="dim" d="M ${end-mark} ${y} v ${-mark} h ${mark}"/>` : ''}
    <path class="dim" d="M ${x+r} ${y} A ${r} ${r} 0 0 0 ${arcX} ${arcY}"/>
    <path class="dim" d="M ${x} ${y} h 55"/>
    <text x="${x-12}" y="${y+24}" text-anchor="end">${format(s.angle)}°</text>`;
}
function emptyDiagram(partial = false) {
  const line1 = t(partial ? 'undetermined' : 'empty'), line2 = t(partial ? 'undeterminedSecond' : 'emptySecond');
  $('geometry').innerHTML = `<text x="360" y="200" text-anchor="middle">${line1}</text><text x="360" y="232" text-anchor="middle">${line2}</text>`;
  $('svg-desc').textContent = `${line1}. ${line2}.`;
}
function update() {
  const active = $('pair').value.split('-');
  $('pair-help').textContent = t($('pair').value === 'ratio-percentage' ? 'slopePairHelp' : 'hint');
  for (const key of fields) {
    $(key).readOnly = !active.includes(key);
    $(key).setAttribute('aria-invalid', 'false');
    $(key+'-tag').textContent = t(active.includes(key) ? 'input' : 'calculated');
  }
  try {
    const s = SlopeCalculator.calculate($('pair').value, model);
    for (const key of fields.filter(key => !active.includes(key))) { model[key] = s[key] === null ? '' : s[key]; $(key).value = inputDisplay(key, s[key]); }
    $('percent-result').textContent = `${format(s.percentage)}%`;
    $('ratio-result').textContent = `1 : ${format(s.ratio)}`;
    $('angle-result').textContent = `${format(s.angle)}°`;
    const partial = s.status === 'needs-distance';
    $('status').className = partial ? 'notice' : '';
    $('status').textContent = t(partial ? 'needsDistance' : s.rise === 0 ? 'level' : s.run === 0 ? 'vertical' : 'ready');
    if (partial) emptyDiagram(true); else draw(s);
  } catch (error) {
    for (const key of fields.filter(key => !active.includes(key))) { model[key] = ''; $(key).value = ''; }
    for (const key of ['percent-result', 'ratio-result', 'angle-result']) $(key).textContent = '—';
    emptyDiagram();
    $('status').textContent = SlopeTranslations[language].errors[error.code] || t('errors').INVALID;
    $('status').className = error.code === 'MISSING' ? '' : 'error';
    for (const key of active) $(key).setAttribute('aria-invalid', error.code === 'MISSING' && String(model[key]).trim() !== '' ? 'false' : 'true');
  }
}
function setLanguage(next) {
  language = next; document.documentElement.lang = next;
  for (const node of document.querySelectorAll('[data-i18n]')) node.textContent = t(node.dataset.i18n);
  for (const button of document.querySelectorAll('[data-language]')) button.setAttribute('aria-pressed', String(button.dataset.language === next));
  const selected = $('pair').value || 'run-ratio';
  $('pair').replaceChildren(...SlopeCalculator.pairs.map(pair => {
    const option = document.createElement('option'); option.value = pair;
    option.textContent = pair.split('-').map(t).join(' + '); return option;
  }));
  $('pair').value = selected;
  try { localStorage.setItem('pld-slope-language', next); } catch (_) { /* Works without storage. */ }
  update();
}
for (const key of fields) $(key).addEventListener('input', () => { model[key] = $(key).value; update(); });
$('pair').addEventListener('change', () => {
  // Promote full precision, not rounded display values, when changing input pairs.
  for (const key of $('pair').value.split('-')) {
    const raw = model[key];
    $(key).value = typeof raw === 'number' ? (key === 'ratio' ? `1:${raw === Infinity ? '∞' : raw}` : raw === Infinity ? '∞' : String(raw)) : raw;
  }
  update();
});
$('reset').addEventListener('click', () => { for (const key of fields) { model[key] = ''; $(key).value = ''; } update(); $($('pair').value.split('-')[0]).focus(); });
for (const button of document.querySelectorAll('[data-language]')) button.addEventListener('click', () => setLanguage(button.dataset.language));
setLanguage(language);
