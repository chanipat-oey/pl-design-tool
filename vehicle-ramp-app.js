(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const els = {
    start:$('vehicle-start-level'), end:$('vehicle-end-level'), rise:$('vehicle-total-rise'), run:$('vehicle-total-run'), descending:$('vehicle-descending'),
    introOn:$('vehicle-use-intro'), intro:$('vehicle-intro-run'), inRun:$('vehicle-transition-in-run'), main:$('vehicle-main-ratio'), outRun:$('vehicle-transition-out-run'), outroOn:$('vehicle-use-outro'), outro:$('vehicle-outro-run'),
    introFields:$('vehicle-intro-fields'), outroFields:$('vehicle-outro-fields'), runField:$('vehicle-total-run-field'), mainField:$('vehicle-main-ratio-field'), mainCalc:$('vehicle-main-calculated'),
    status:$('vehicle-status'), geometry:$('vehicle-geometry'), table:$('vehicle-table-body'), check:$('vehicle-check')
  };
  let language = localStorage.getItem('pld-slope-language') === 'en' ? 'en' : 'th';
  const t = key => VehicleRampTranslations[language][key] ?? key;
  const fmt = (number, digits=2) => Number(number).toLocaleString(language === 'th' ? 'th-TH' : 'en-GB',{minimumFractionDigits:digits,maximumFractionDigits:digits});
  const levelFmt = number => `${number >= 0 ? '+' : ''}${fmt(number,3)}`;
  const mode = () => document.querySelector('[name="vehicle-mode"]:checked').value;
  const segmentName = key => t({intro:'introName',transitionIn:'transitionInName',main:'mainName',transitionOut:'transitionOutName',outro:'outroName',extra:'extraName'}[key]);

  function levels() {
    const start = els.start.value.trim(), end = els.end.value.trim();
    let rise, data;
    if (start && end) {
      data = LevelCalculator.difference(start,end);
      if (data.rise <= 0) throw Object.assign(new Error('TOTAL_RISE'),{code:'TOTAL_RISE'});
      rise = data.rise; els.rise.value = String(Number(rise.toFixed(6))); els.rise.readOnly = true;
    } else {
      els.rise.readOnly = false;
      rise = VehicleRampCalculator.positive(els.rise.value,'TOTAL_RISE');
      data = LevelCalculator.complete(start,end,rise,els.descending.checked ? -1 : 1);
    }
    return {rise, start:data.start ?? 0, end:data.end ?? (data.direction * rise), direction:data.direction, relative:data.start === null};
  }

  function values(levelData) {
    return {mode:mode(),totalRise:levelData.rise,totalRun:els.run.value,introEnabled:els.introOn.checked,introRun:els.intro.value,transitionInRun:els.inRun.value,mainRatio:els.main.value,transitionOutRun:els.outRun.value,outroEnabled:els.outroOn.checked,outroRun:els.outro.value};
  }
  function syncControls() {
    const fit=mode()==='fit'; els.runField.hidden=!fit; els.mainField.hidden=fit; els.mainCalc.hidden=!fit;
    els.introFields.hidden=!els.introOn.checked; els.outroFields.hidden=!els.outroOn.checked;
  }
  function clearResults() {
    ['main-ratio','main-percent','total-run','overall','total-rise','extra'].forEach(k=>$(`vehicle-${k}-result`).textContent='—');
    els.mainCalc.querySelector('strong').textContent='—'; els.table.replaceChildren(); els.check.hidden=true;
    els.geometry.innerHTML=`<text x="450" y="230" text-anchor="middle" class="empty-text">${t('start')}</text>`;
  }
  function showError(error) {
    const code=error.code || error.message || 'INVALID'; els.status.className='status error'; els.status.textContent=VehicleRampTranslations[language].errors[code] || t('errors').INVALID || code; clearResults();
  }
  function renderResults(result) {
    $('vehicle-main-ratio-result').textContent=`1:${fmt(result.mainRatio,2)}`;
    $('vehicle-main-percent-result').textContent=`${fmt(result.mainPercentage,2)}%`;
    $('vehicle-total-run-result').textContent=`${fmt(result.totalRun,2)} m`;
    $('vehicle-overall-result').textContent=`1:${fmt(result.overallRatio,2)} · ${fmt(result.overallPercentage,2)}%`;
    $('vehicle-total-rise-result').textContent=`${fmt(result.totalRise,3)} m`;
    $('vehicle-extra-result').textContent=`${fmt(result.extraRun,2)} m`;
    els.mainCalc.querySelector('strong').textContent=`1:${fmt(result.mainRatio,2)} · ${fmt(result.mainPercentage,2)}%`;
  }
  function renderCheck(result) {
    const statusText=t(result.mainStatus); const warnings=result.minimumWarnings.map(segmentName);
    els.check.hidden=false; els.check.className=`vehicle-check ${result.mainStatus==='tooSteep'?'danger':result.mainStatus==='caution'?'warning':'success'}`;
    els.check.innerHTML=`<strong>${statusText}</strong>${warnings.length?`<p>${t('minimumWarning')} ${warnings.join(', ')}</p>`:''}`;
  }
  function renderTable(result, levelData) {
    els.table.replaceChildren();
    result.segments.forEach(segment=>{
      const start=levelData.start + levelData.direction*segment.startRise, end=levelData.start + levelData.direction*segment.endRise;
      let check=t('pass');
      if (segment.key==='main' && result.mainStatus==='tooSteep') check=t('exceedsLimit');
      else if (result.minimumWarnings.includes(segment.key)) check=t('belowMinimum');
      const tr=document.createElement('tr');
      tr.innerHTML=`<th>${segmentName(segment.key)}</th><td>${segment.ratio===Infinity?'—':`1:${fmt(segment.ratio,2)}`}<small>${fmt(segment.percentage,2)}%</small></td><td>${fmt(segment.run,2)} m</td><td>${fmt(segment.rise,3)} m</td><td>RL ${levelFmt(start)}</td><td>RL ${levelFmt(end)}</td><td class="check-${check===t('pass')?'pass':'warn'}">${check}</td>`;
      els.table.appendChild(tr);
    });
  }
  function svgEl(name,attrs={},text='') { const node=document.createElementNS('http://www.w3.org/2000/svg',name); Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,v)); node.textContent=text; return node; }
  function renderDiagram(result, levelData) {
    els.geometry.replaceChildren(); const w=760,h=260,left=70,top=70;
    const scale=Math.min(w/result.totalRun,h/result.totalRise); const usedW=result.totalRun*scale, usedH=result.totalRise*scale;
    const ox=left+(w-usedW)/2, base=levelData.direction>0?top+h:top; const sy=r=>base-levelData.direction*r*scale;
    const points=[[ox,sy(0)]]; result.segments.forEach(s=>points.push([ox+s.endRun*scale,sy(s.endRise)]));
    const fill=[...points,[points.at(-1)[0],base],[ox,base]].map(p=>p.join(',')).join(' ');
    els.geometry.append(svgEl('polygon',{points:fill,class:'vehicle-fill'}));
    els.geometry.append(svgEl('line',{x1:ox,y1:base,x2:ox+usedW,y2:base,class:'vehicle-datum'}));
    result.segments.forEach((s,i)=>{
      const a=points[i],b=points[i+1]; els.geometry.append(svgEl('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:`vehicle-line segment-${s.key}`}));
      const mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2+(i%2?-18:24); const label=s.ratio===Infinity?t('extraName'):`${segmentName(s.key).replace(/^\d\s*·\s*/, '')} · 1:${fmt(s.ratio,1)}`;
      if (s.run*scale>62) els.geometry.append(svgEl('text',{x:mx,y:my,'text-anchor':'middle',class:'segment-label'},label));
    });
    points.forEach((p,i)=>{
      els.geometry.append(svgEl('circle',{cx:p[0],cy:p[1],r:4,class:'junction'}));
      const rise=i===0?0:result.segments[i-1].endRise, rl=levelData.start+levelData.direction*rise;
      els.geometry.append(svgEl('text',{x:p[0],y:p[1]+(levelData.direction>0?-12:20),'text-anchor':i===0?'start':i===points.length-1?'end':'middle',class:'level-label'},`RL ${levelFmt(rl)}`));
    });
    const dy=levelData.direction>0?410:390; els.geometry.append(svgEl('line',{x1:ox,y1:dy,x2:ox+usedW,y2:dy,class:'dimension'}));
    els.geometry.append(svgEl('text',{x:ox+usedW/2,y:dy-8,'text-anchor':'middle',class:'dimension-label'},`${t('totalRunResult')} ${fmt(result.totalRun,2)} m`));
    $('vehicle-svg-desc').textContent=`${t('sectionTitle')}: ${result.segments.map(s=>`${segmentName(s.key)} ${fmt(s.run,2)} m`).join(', ')}`;
  }
  function calculate() {
    syncControls();
    try {
      const levelData=levels(), result=VehicleRampCalculator.calculate(values(levelData));
      els.status.className='status success'; els.status.textContent=t('ready'); renderResults(result); renderCheck(result); renderTable(result,levelData); renderDiagram(result,levelData);
    } catch(error) { showError(error); }
  }
  function setLanguage(next) {
    language=next; localStorage.setItem('pld-slope-language',next); document.documentElement.lang=next;
    document.querySelectorAll('[data-i18n]').forEach(node=>{node.textContent=t(node.dataset.i18n);});
    document.querySelectorAll('[data-language]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===next))); calculate();
  }
  function reset() {
    [els.start,els.end,els.rise,els.run].forEach(x=>{x.value='';x.readOnly=false;}); els.descending.checked=false; els.introOn.checked=false;els.outroOn.checked=false;els.intro.value='3';els.inRun.value='3';els.main.value='10';els.outRun.value='3';els.outro.value='3';document.querySelector('[name="vehicle-mode"][value="design"]').checked=true; syncControls(); els.status.className='status';els.status.textContent=t('start');clearResults();
  }
  document.querySelectorAll('input').forEach(input=>{input.addEventListener('input',calculate);input.addEventListener('change',calculate);});
  document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.language)));
  $('vehicle-reset').addEventListener('click',reset); setLanguage(language); reset();
})();
