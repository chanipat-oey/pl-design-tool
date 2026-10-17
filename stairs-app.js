'use strict';
const stair$ = id => document.getElementById(id);
const stairFields = StairCalculator.fields;
let stairState = StairInputState.create();
let stairLanguage = 'th';
let stairLevelState = {start:'',end:'',startSource:false,endSource:false,direction:1,error:null};
let stairLandingValues = [];
let stairConfigError = null;
try { if (localStorage.getItem('pld-slope-language') === 'en') stairLanguage = 'en'; } catch (_) { /* Storage is optional. */ }
const stairT = key => StairTranslations[stairLanguage][key];

function stairFormat(value, digits = 2) {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('en-GB', {maximumFractionDigits:digits});
}

function stairLevelFormat(value) {
  if (!Number.isFinite(value)) return '—';
  return `${value >= 0 ? '+' : ''}${value.toLocaleString('en-GB', {minimumFractionDigits:3, maximumFractionDigits:3})}`;
}

function stairInputDisplay(key, value) {
  if (!Number.isFinite(value)) return '';
  if (key === 'risers' || key === 'treads') return String(Math.round(value));
  return String(Number(value.toPrecision(9)));
}

function activeFlights() {
  if (!stair$('use-stair-landings').checked) return 1;
  return LayoutCalculator.whole(stair$('stair-flights').value, 'FLIGHTS');
}

function stairLandingSettings() {
  return {enabled:stair$('use-stair-landings').checked, runMode:document.querySelector('input[name="stair-run-mode"]:checked')?.value || 'extend', flights:activeFlights(), equal:stair$('equal-stair-landings').checked, sharedLength:stair$('stair-landing-length').value, lengths:stairLandingValues};
}

function stairCalculationOptions() {
  const settings = stairLandingSettings();
  const lengths = settings.enabled ? LayoutCalculator.landingLengths(settings.flights - 1, settings) : [];
  return {...settings, landingTotal:lengths.reduce((sum,value)=>sum+value,0)};
}

function recalculateStairs() {
  stairConfigError = null;
  try {
    const flights = activeFlights();
    if (stair$('use-stair-landings').checked && !stair$('equal-stair-landings').checked && stair$('stair-individual-landings').children.length !== flights - 1) renderStairLandingInputs(flights - 1);
    stairState = StairInputState.recalculate(stairState, stairCalculationOptions());
  } catch (error) {
    stairConfigError = error.code || 'FLIGHTS';
    let flights = 1; try { flights = activeFlights(); } catch (_) { /* Report the original configuration error. */ }
    stairState = StairInputState.recalculate(stairState, {flights,runMode:document.querySelector('input[name="stair-run-mode"]:checked')?.value || 'extend',landingTotal:NaN});
  }
}

function completeStairLevels(rise) {
  try {
    stairLevelState.error = null;
    return LevelCalculator.complete(stairLevelState.startSource ? stairLevelState.start : '', stairLevelState.endSource ? stairLevelState.end : '', rise, stairLevelState.direction);
  } catch (error) {
    stairLevelState.error = error.code || 'LEVEL_INVALID';
    return {start:null,end:null,rise,direction:stairLevelState.direction};
  }
}

function syncStairLevelInputs(levels) {
  for (const [id,key,sourceKey] of [['stair-start-level','start','startSource'],['stair-end-level','end','endSource']]) {
    const input = stair$(id), source = stairLevelState[sourceKey], value = levels[key];
    input.dataset.source = String(source); input.dataset.calculated = String(!source && Number.isFinite(value)); input.classList.toggle('level-calculated', !source && Number.isFinite(value));
    input.setAttribute('aria-invalid', String(Boolean(stairLevelState.error && source)));
    stair$(id+'-tag').textContent = source ? stairT('input') : Number.isFinite(value) ? stairT('calculated') : '';
    if (!source) input.value = Number.isFinite(value) ? String(Number(value.toFixed(6))) : '';
  }
  stair$('stair-descending').checked = levels.direction < 0;
  stair$('stair-level-status').textContent = stairLevelState.error ? stairT('errors')[stairLevelState.error] : stairLevelState.startSource && stairLevelState.endSource ? stairT('levelFromPair') : (stairLevelState.startSource || stairLevelState.endSource) && stairState.result ? stairT('levelCalculated') : '';
  stair$('stair-level-status').className = `config-status${stairLevelState.error ? ' error' : ''}`;
}

function renderStairLandingInputs(count) {
  stairLandingValues.length = Math.max(stairLandingValues.length, count);
  const container = stair$('stair-individual-landings'); container.innerHTML = '';
  for (let index = 0; index < count; index += 1) {
    const field = document.createElement('div'); field.className = 'field';
    const label = document.createElement('label'); label.htmlFor = `stair-landing-${index}`;
    const name = document.createElement('span'); name.textContent = `${stairT('landingNumber')} ${index + 1}`; label.appendChild(name);
    const wrap = document.createElement('div'); wrap.className = 'input-wrap';
    const input = document.createElement('input'); input.id = `stair-landing-${index}`; input.inputMode = 'decimal'; input.autocomplete = 'off'; input.placeholder = '1.20'; input.value = stairLandingValues[index] || '';
    input.addEventListener('input', () => { stairLandingValues[index] = input.value; recalculateStairs(); updateStairs(); });
    const unit = document.createElement('span'); unit.textContent = stairT('metre'); wrap.append(input,unit); field.append(label,wrap); container.appendChild(field);
  }
}

function calculateStairLayouts(result) {
  stairConfigError = null;
  const baseUser = LayoutCalculator.stairs(result.user, {enabled:false}), baseProposal = LayoutCalculator.stairs(result.recommended, {enabled:false});
  stair$('stair-layout-status').textContent = ''; stair$('stair-layout-status').className = 'config-status';
  if (!stair$('use-stair-landings').checked) return {user:baseUser, proposal:baseProposal};
  try {
    const flights = activeFlights(), count = flights - 1;
    if (!stair$('equal-stair-landings').checked && stair$('stair-individual-landings').children.length !== count) renderStairLandingInputs(count);
    const settings = stairLandingSettings();
    const layouts = {user:LayoutCalculator.stairs(result.user,settings),proposal:LayoutCalculator.stairs(result.recommended,settings)};
    stair$('stair-layout-status').textContent = stairT('layoutReady');
    return layouts;
  } catch (error) {
    stairConfigError = error.code || 'LANDING'; stair$('stair-layout-status').textContent = stairT('errors')[stairConfigError] || stairT('errors').LANDING; stair$('stair-layout-status').className = 'config-status error';
    let flights = 1;
    try { flights = activeFlights(); } catch (_) { /* Keep one flight until the count is valid. */ }
    const fallback = section => ({enabled:flights > 1,flights,landingCount:Math.max(0,flights-1),landingLengths:Array(Math.max(0,flights-1)).fill(0),totalLandingRun:0,stairRun:section.stairRun ?? section.totalRun,overallRun:section.overallRun ?? section.totalRun,risersByFlight:LayoutCalculator.distribute(section.risers,flights),treadsByFlight:LayoutCalculator.distribute(section.risers,flights).map(value=>Math.max(0,value-1))});
    return flights > 1 ? {user:fallback(result.user),proposal:fallback(result.recommended)} : {user:baseUser,proposal:baseProposal};
  }
}

function stairEmpty(groupId) {
  stair$(groupId).innerHTML = `<text class="diagram-empty" x="360" y="195" text-anchor="middle">${stairT('empty')}</text><text class="diagram-empty" x="360" y="226" text-anchor="middle">${stairT('emptySecond')}</text>`;
}

function stairGeometry(section, layout, scale, direction) {
  let x = 58, y = direction < 0 ? 70 : 306;
  const startX = x, startY = y, rise = section.riserHeight * scale, tread = section.treadDepth * scale;
  let path = `M ${x} ${y}`, slopes = '', landingLabels = '';
  const directionY = direction < 0 ? 1 : -1;
  for (let flight = 0; flight < layout.flights; flight += 1) {
    const flightStartX = x, flightStartY = y, flightRisers = layout.risersByFlight[flight];
    for (let index = 0; index < flightRisers; index += 1) {
      y += directionY * rise; path += ` V ${y}`;
      if (index < flightRisers - 1) { x += tread; path += ` H ${x}`; }
    }
    slopes += `<path class="slope-line" d="M ${flightStartX} ${flightStartY} L ${x} ${y}"/>`;
    if (flight < layout.landingCount) {
      const landingStart = x; x += layout.landingLengths[flight] * scale; path += ` H ${x}`;
      landingLabels += `<text class="segment-text" x="${(landingStart+x)/2}" y="${y-9}" text-anchor="middle">${stairT('landingNumber')} ${flight+1}</text>`;
    }
  }
  return {path,slopes,landingLabels,startX,startY,endX:x,endY:y};
}

function drawStair(groupId, section, layout, scale, levels) {
  const geometry = stairGeometry(section,layout,scale,levels.direction);
  const {path,slopes,landingLabels,startX,startY,endX,endY} = geometry, centreX = (startX+endX)/2;
  const fill = `${path} L ${endX} 334 L ${startX} 334 Z`;
  const levelLabels = [];
  if (Number.isFinite(levels.start)) levelLabels.push(`<text class="level-text" x="${startX}" y="${startY + (levels.direction < 0 ? -14 : 22)}">${stairT('startLevel')} ${stairLevelFormat(levels.start)}</text>`);
  if (Number.isFinite(levels.end)) levelLabels.push(`<text class="level-text" x="${endX}" y="${endY + (levels.direction < 0 ? 22 : -14)}" text-anchor="end">${stairT('endLevel')} ${stairLevelFormat(levels.end)}</text>`);
  let cumulativeRisers = 0, cumulativeRun = 0, intermediate = '';
  for (let index = 0; index < layout.landingCount; index += 1) {
    cumulativeRisers += layout.risersByFlight[index]; cumulativeRun += layout.treadsByFlight[index] * section.treadDepth;
    const px = startX + (cumulativeRun + layout.landingLengths.slice(0,index).reduce((a,b)=>a+b,0)) * scale;
    const py = startY + (levels.direction < 0 ? 1 : -1) * cumulativeRisers * section.riserHeight * scale;
    const actualLevel = Number.isFinite(levels.start) ? levels.start + levels.direction * cumulativeRisers * section.riserHeight : null;
    if (Number.isFinite(actualLevel)) intermediate += `<text class="level-text" x="${px+4}" y="${py+18}">${stairLevelFormat(actualLevel)}</text>`;
  }
  stair$(groupId).innerHTML = `
    <path class="stair-fill" d="${fill}"/><path class="stair-line" d="${path}"/>${slopes}
    <path class="dimension" d="M ${startX} 345 V 376 M ${endX} 345 V 376 M ${startX} 367 H ${endX}"/>
    <text x="${centreX}" y="393" text-anchor="middle">${stairT('overallFootprint')} ${stairFormat(layout.overallRun,3)} ${stairT('metre')}</text>
    <text class="diagram-label" x="${centreX}" y="${Math.max(20,Math.min(startY,endY)-30)}" text-anchor="middle">${section.risers} ${stairT('risers')} · ${section.treads} ${stairT('treads')}</text>
    <text x="${centreX}" y="${Math.max(39,Math.min(startY,endY)-11)}" text-anchor="middle">R ${stairFormat(section.riserHeight,3)} · T ${stairFormat(section.treadDepth,3)} ${stairT('metre')}</text>
    <text x="${startX}" y="326">${stairT('comfortLabel')} = ${stairFormat(section.comfort,3)} ${stairT('metre')}</text>
    <text x="${endX}" y="326" text-anchor="end">1:${stairFormat(section.ratio,2)} · ${stairFormat(section.percentage,1)}%</text>
    ${landingLabels}${levelLabels.join('')}${intermediate}`;
}

function comparisonRows(user, proposal, userLayout, proposalLayout) {
  const rows = [
    ['risers','risers','',0],['treads','treads','',0],['totalRise','totalRise',stairT('metre'),3],['stairRunTotal','stairRun',stairT('metre'),3],
    ['overallFootprint','overallRun',stairT('metre'),3],['riserHeight','riserHeight',stairT('metre'),3],['treadDepth','treadDepth',stairT('metre'),3],['comfortLabel','comfort',stairT('metre'),3],['flightRatio','ratio','',2],['flightPercentage','percentage','%',1],['flightAngle','angle','°',1],['overallRatioLabel','overallRatio','',2],['overallPercentageLabel','overallPercentage','%',1],['overallAngleLabel','overallAngle','°',1]
  ];
  return rows.map(([label,key,unit,digits]) => {
    const current = key === 'overallRun' ? userLayout.overallRun : user[key], suggested = key === 'overallRun' ? proposalLayout.overallRun : proposal[key], difference = suggested-current;
    const display = (value,prefix='') => ['ratio','overallRatio'].includes(key) ? `1:${stairFormat(value,digits)}` : `${prefix}${stairFormat(value,digits)}${unit ? ` ${unit}` : ''}`;
    const delta = Math.abs(difference) < .5 * Math.pow(10,-digits) ? '—' : display(Math.abs(difference),difference > 0 ? '+' : '−');
    return `<tr><th scope="row">${stairT(label)}</th><td>${display(current)}</td><td>${display(suggested)}</td><td>${delta}</td></tr>`;
  }).join('');
}

function renderStairSummary(layout) {
  const summary = stair$('stair-layout-summary');
  if (!stair$('use-stair-landings').checked) { summary.hidden = true; summary.innerHTML = ''; return; }
  summary.hidden = false;
  summary.innerHTML = `<article><small>${stairT('flights')}</small><strong>${layout.flights}</strong></article><article><small>${stairT('landings')}</small><strong>${layout.landingCount}</strong></article><article><small>${stairT('risersPerFlight')}</small><strong>${layout.risersByFlight.join(' + ')}</strong></article><article><small>${stairT('stairRunTotal')}</small><strong>${stairFormat(layout.stairRun,3)} ${stairT('metre')}</strong></article><article><small>${stairT('totalLandingRun')}</small><strong>${stairFormat(layout.totalLandingRun,3)} ${stairT('metre')}</strong></article><article><small>${stairT('overallFootprint')}</small><strong>${stairFormat(layout.overallRun,3)} ${stairT('metre')}</strong></article>`;
}

function updateStairs() {
  const {active,values,result,error} = stairState;
  stair$('stair-landing-options').hidden = !stair$('use-stair-landings').checked;
  stair$('stair-shared-landing').hidden = !stair$('equal-stair-landings').checked;
  stair$('stair-individual-landings').hidden = stair$('equal-stair-landings').checked;
  for (const key of stairFields) {
    const source = active.includes(key), input = stair$(key); input.dataset.source = String(source); input.dataset.calculated = String(!source && values[key] !== ''); input.setAttribute('aria-invalid','false');
    stair$(key+'-tag').textContent = source ? stairT('input') : values[key] !== '' ? stairT('calculated') : '';
    if (!source) input.value = values[key] === '' ? '' : stairInputDisplay(key,Number(values[key]));
  }
  stair$('stair-sources').textContent = active.length ? `${stairT('using')} ${active.map(stairT).join(' + ')}` : '';
  const levels = completeStairLevels(result?.user.totalRise ?? 0); syncStairLevelInputs(levels);
  if (result) {
    const layouts = calculateStairLayouts(result);
    const maxRun = Math.max(layouts.user.overallRun,layouts.proposal.overallRun), maxRise = Math.max(result.user.totalRise,result.recommended.totalRise);
    const scale = Math.min(540/Math.max(maxRun,0.001),220/Math.max(maxRise,0.001));
    drawStair('user-geometry',result.user,layouts.user,scale,levels); drawStair('proposal-geometry',result.recommended,layouts.proposal,scale,levels);
    stair$('comparison-body').innerHTML = comparisonRows(result.user,result.recommended,layouts.user,layouts.proposal);
    stair$('stair-overall-results').hidden = !stair$('use-stair-landings').checked;
    stair$('user-overall-ratio').textContent = `1:${stairFormat(result.user.overallRatio,2)}`; stair$('user-overall-percent').textContent = `${stairFormat(result.user.overallPercentage,1)}%`; stair$('user-overall-angle').textContent = `${stairFormat(result.user.overallAngle,1)}°`;
    stair$('proposal-overall-ratio').textContent = `1:${stairFormat(result.recommended.overallRatio,2)}`; stair$('proposal-overall-percent').textContent = `${stairFormat(result.recommended.overallPercentage,1)}%`; stair$('proposal-overall-angle').textContent = `${stairFormat(result.recommended.overallAngle,1)}°`;
    stair$('stair-status').textContent = stairT('ready'); stair$('stair-status').className = ''; stair$('assumption-note').textContent = result.usesDefaults ? stairT('assumptions') : ''; renderStairSummary(layouts.user);
  } else {
    stairEmpty('user-geometry'); stairEmpty('proposal-geometry'); stair$('comparison-body').innerHTML = ''; stair$('stair-layout-summary').hidden = true; stair$('stair-overall-results').hidden = true;
    const shownError = stairConfigError || error, waiting = !shownError || shownError === 'SECOND';
    stair$('stair-status').textContent = active.length === 1 ? stairT('received') : shownError ? stairT('errors')[shownError] || stairT('errors').INVALID : stairT('start');
    stair$('stair-status').className = waiting && active.length === 1 ? 'waiting' : shownError && shownError !== 'SECOND' ? 'error' : ''; stair$('assumption-note').textContent = '';
    if (shownError && shownError !== 'SECOND') for (const key of active) stair$(key).setAttribute('aria-invalid','true');
  }
}

function useStairLevelPair() {
  if (!(stairLevelState.startSource && stairLevelState.endSource)) return;
  try {
    const levels = LevelCalculator.difference(stairLevelState.start,stairLevelState.end); stairLevelState.direction = levels.direction; stairLevelState.error = null;
    let options = {flights:1,runMode:'extend',landingTotal:0};
    try { options = stairCalculationOptions(); stairConfigError = null; } catch (error) { stairConfigError = error.code || 'FLIGHTS'; options.landingTotal = NaN; }
    stair$('totalRise').value = String(Number(levels.rise.toPrecision(12))); stairState = StairInputState.edit(stairState,'totalRise',stair$('totalRise').value,options);
  } catch (error) { stairLevelState.error = error.code || 'LEVEL_INVALID'; }
}

function editStairLevel(key,value) {
  stairLevelState[key] = value; stairLevelState[key+'Source'] = String(value).trim() !== ''; useStairLevelPair(); updateStairs();
}

function setStairLanguage(next) {
  stairLanguage = next; document.documentElement.lang = next;
  for (const node of document.querySelectorAll('[data-i18n]')) node.textContent = stairT(node.dataset.i18n);
  for (const button of document.querySelectorAll('[data-language]')) button.setAttribute('aria-pressed',String(button.dataset.language === next));
  try { localStorage.setItem('pld-slope-language',next); } catch (_) { /* Storage is optional. */ }
  renderStairLandingInputs(stair$('equal-stair-landings').checked ? 0 : stair$('stair-individual-landings').children.length); updateStairs();
}

for (const key of stairFields) stair$(key).addEventListener('input', () => {
  let options = {flights:1,runMode:'extend',landingTotal:0};
  try {
    const flights = activeFlights();
    if (stair$('use-stair-landings').checked && !stair$('equal-stair-landings').checked && stair$('stair-individual-landings').children.length !== flights - 1) renderStairLandingInputs(flights - 1);
    options = stairCalculationOptions(); stairConfigError = null;
  } catch (error) { stairConfigError = error.code || 'FLIGHTS'; options = {...options,flights:(()=>{try{return activeFlights();}catch(_){return 1;}})(),runMode:document.querySelector('input[name="stair-run-mode"]:checked')?.value || 'extend',landingTotal:NaN}; }
  stairState = StairInputState.edit(stairState,key,stair$(key).value,options);
  if (stairState.result && !stairState.active.includes('totalRise') && stairLevelState.startSource && stairLevelState.endSource) stairLevelState.endSource = false;
  if (key === 'totalRise' && stairLevelState.startSource && stairLevelState.endSource) stairLevelState.endSource = false;
  updateStairs();
});
stair$('stair-start-level').addEventListener('input',()=>editStairLevel('start',stair$('stair-start-level').value));
stair$('stair-end-level').addEventListener('input',()=>editStairLevel('end',stair$('stair-end-level').value));
stair$('stair-descending').addEventListener('change',()=>{stairLevelState.direction=stair$('stair-descending').checked?-1:1;if(stairLevelState.startSource&&stairLevelState.endSource)stairLevelState.endSource=false;updateStairs();});
stair$('use-stair-landings').addEventListener('change',()=>{recalculateStairs();updateStairs();});
stair$('equal-stair-landings').addEventListener('change',()=>{recalculateStairs();updateStairs();});
for(const input of document.querySelectorAll('input[name="stair-run-mode"]'))input.addEventListener('change',()=>{recalculateStairs();updateStairs();});
stair$('stair-flights').addEventListener('input',()=>{recalculateStairs();updateStairs();});
stair$('stair-landing-length').addEventListener('input',()=>{recalculateStairs();updateStairs();});
stair$('stair-reset').addEventListener('click',()=>{
  stairState=StairInputState.create();stairLevelState={start:'',end:'',startSource:false,endSource:false,direction:1,error:null};stairLandingValues=[];stairConfigError=null;
  for(const id of ['stair-start-level','stair-end-level','stair-flights','stair-landing-length'])stair$(id).value='';
  stair$('use-stair-landings').checked=false;stair$('equal-stair-landings').checked=true;stair$('stair-descending').checked=false;document.querySelector('input[name="stair-run-mode"][value="extend"]').checked=true;stair$('stair-individual-landings').innerHTML='';updateStairs();stair$('risers').focus();
});
for(const button of document.querySelectorAll('[data-language]'))button.addEventListener('click',()=>setStairLanguage(button.dataset.language));
setStairLanguage(stairLanguage);
