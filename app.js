'use strict';
const $ = id => document.getElementById(id);
const fields = ['run', 'rise', 'length'];
const activePairs = {'run-rise':['run','rise'], 'run-length':['run','length'], 'rise-length':['rise','length']};
function format(n) { if (n === 0) return '0'; return (Math.abs(n) < 0.001 || Math.abs(n) >= 1e7) ? n.toExponential(3) : n.toLocaleString('en-GB',{maximumFractionDigits:3}); }
function draw(s) {
  const max = Math.max(s.run, s.rise);
  const normalRun = s.run / max, normalRise = s.rise / max;
  const scale = Math.min(normalRun === 0 ? Infinity : 450 / normalRun, normalRise === 0 ? Infinity : 220 / normalRise);
  const w = normalRun * scale, h = normalRise * scale;
  const x = 100 + (450-w)/2, y = 300, end = x+w, top = y-h;
  const radians = s.angle*Math.PI/180, r = 40;
  const arcX = x+r*Math.cos(radians), arcY = y-r*Math.sin(radians);
  const mark = Math.min(14,w/3,h/3);
  $('svg-desc').textContent = `Run ${format(s.run)} metres, rise ${format(s.rise)} metres, slope length ${format(s.length)} metres. Angle ${format(s.angle)} degrees. The horizontal and vertical dimensions use the same scale.`;
  $('geometry').innerHTML = `
    <path class="shape" d="M ${x} ${y} H ${end} V ${top} Z"/>
    <path class="surface" d="M ${x} ${y} L ${end} ${top}"/>
    <path class="dim" d="M ${x} ${y+10} V ${y+53} M ${end} ${y+10} V ${y+53} M ${x} ${y+43} H ${end} M ${x-4} ${y+48} l 8 -10 M ${end-4} ${y+48} l 8 -10"/>
    <text x="${x+w/2}" y="${y+76}" text-anchor="middle">Run ${format(s.run)} m</text>
    <path class="dim" d="M ${end+10} ${y} H ${end+50} M ${end+10} ${top} H ${end+50} M ${end+40} ${y} V ${top} M ${end+35} ${y+4} l 10 -8 M ${end+35} ${top+4} l 10 -8"/>
    <text x="${end+61}" y="${top+h/2}" text-anchor="middle" transform="rotate(-90 ${end+61} ${top+h/2})">Rise ${format(s.rise)} m</text>
    <text x="${x+w/2}" y="${top-35}" text-anchor="middle" class="label">${s.run === 0 ? 'Vertical slope' : format(s.percentage)+'% slope'}</text>
    <text x="${x+w/2-12*Math.sin(radians)}" y="${y-h/2-16*Math.cos(radians)}" text-anchor="middle" transform="rotate(${-s.angle} ${x+w/2-12*Math.sin(radians)} ${y-h/2-16*Math.cos(radians)})">Length ${format(s.length)} m</text>
    ${s.rise>0 && s.run>0 ? `<path class="dim" d="M ${end-mark} ${y} v ${-mark} h ${mark}"/>` : ''}
    <path class="dim" d="M ${x+r} ${y} A ${r} ${r} 0 0 0 ${arcX} ${arcY}"/>
    <path class="dim" d="M ${x} ${y} h 55"/>
    <text x="${x-12}" y="${y+24}" text-anchor="end">${format(s.angle)}°</text>`;
}
function update() {
  const active = activePairs[$('pair').value];
  const missing = fields.find(key=>!active.includes(key));
  for (const key of fields) {
    $(key).readOnly = key === missing;
    $(key).setAttribute('aria-invalid','false');
    $(key+'-tag').textContent = key === missing ? 'CALCULATED' : 'INPUT';
  }
  try {
    const result = SlopeCalculator.calculate($('pair').value,Object.fromEntries(fields.map(key=>[key,$(key).value])));
    $(missing).value = String(result[missing]);
    $('percent').innerHTML = result.run === 0 ? '∞ <span>%</span>' : `${format(result.percentage)} <span>%</span>`;
    $('ratio').textContent = result.rise === 0 ? '1 : ∞' : `1 : ${format(result.ratio)}`;
    $('angle').innerHTML = `${format(result.angle)}<span>°</span>`;
    $('status').className = '';
    $('status').textContent = result.rise === 0 ? 'Level surface · 0% slope. Ratio shown as 1 : ∞.' : result.run === 0 ? 'Vertical section · percentage is unbounded; ratio is 1 : 0.' : 'Calculated automatically · results rounded to 3 decimal places.';
    draw(result);
  } catch(error) {
    $(missing).value = '';
    for (const key of ['percent','ratio','angle']) $(key).textContent = '—';
    $('geometry').innerHTML = '<text x="360" y="210" text-anchor="middle">Enter two valid dimensions to view the section.</text>';
    $('svg-desc').textContent = 'No valid section to display.';
    $('status').textContent = error.message; $('status').className = 'error';
    for(const key of active) $(key).setAttribute('aria-invalid','true');
  }
}
for(const key of fields) $(key).addEventListener('input',update);
$('pair').addEventListener('change',update);
$('reset').addEventListener('click',()=>{ $('pair').value='run-rise'; for(const key of fields) $(key).value=''; update(); $('run').focus(); });
update();
