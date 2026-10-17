/* =====================================================================
   ESTUDIO: recorridos guiados y autoevaluación
   ===================================================================== */

/* ---------- recorridos ---------- */
function showTourMenu(){
  openModal(`<h2 tabindex="-1">Recorridos guiados</h2><p>Cada recorrido resalta paso a paso las estructuras de un circuito y explica cómo trabajan juntas. Las flechas indican el sentido de la información.</p>
    <div class="grid2">${TOURS.map(t=>`<button class="tcard" data-t="${t.id}"><b>${esc(t.name)}</b><span>${esc(t.sub)} · ${t.steps.length} pasos</span></button>`).join('')}</div>`,'Recorridos guiados');
  $$('.tcard').forEach(b=>b.onclick=()=>{closeModal();startTour(TOURS.find(t=>t.id===b.dataset.t));});
}
function startTour(t){
  exitQuiz(true); if(state.tour) exitTour(true);
  state.tour={t,i:0,prev:{hemi:state.hemi,explode:state.explodeT,isolate:state.isolate}};
  state.isolate=null; setExplode(0); state.explode=0;
  if(t.hemi){state.hemi=t.hemi;syncHemi();}
  if(t.view){setView(t.view);setActiveView(t.view);}
  showTourStep();
  if(isMobile()) $('#right').classList.add('open');
}
function tourFicha(p){
  const I=p.info;
  return `<div class="tficha"><h4>${esc(p.name)} <small>${I.alias||''}</small></h4><p>${I.desc||''}</p>${I.ubic?`<p><b>Ubicación:</b> ${I.ubic}</p>`:''}
    ${I.fun?`<ul>${I.fun.slice(0,4).map(x=>`<li>${x}</li>`).join('')}</ul>`:''}<button class="btn sm" data-full="${p.id}">Ficha completa</button></div>`;
}
function showTourStep(){
  const {t,i}=state.tour, s=t.steps[i], ids=s.ids.filter(id=>PART[id]);
  state.selected=null;
  setGhost(new Set(ids),'tour'); state.forced=new Set(ids);
  applyStateNow();
  focusParts(ids);
  if(t.flow&&i>0){const from=s.from||t.steps[i-1].ids[0];setFlow(from,ids[0],PART[ids[0]].color);} else clearFlow();
  $('#info').innerHTML=`<div class="tour-step">${esc(t.name)} · paso ${i+1} de ${t.steps.length}</div>
    <h2 style="margin-top:6px">${s.t}</h2>
    <div class="progress"><div style="width:${(i+1)/t.steps.length*100}%"></div></div>
    <p class="lead" style="margin-top:12px">${s.x}</p>
    <div class="related" style="margin-top:12px">${ids.map(id=>chip(PART[id],'data-tour="1"')).join('')}</div>
    <div id="tourFicha"></div>
    <div class="tour-nav"><button class="btn sm" id="tPrev" ${i===0?'disabled':''}>← Anterior</button><button class="btn sm" id="tExit">Salir</button>
    <button class="btn sm primary" id="tNext">${i===t.steps.length-1?'Terminar':'Siguiente →'}</button></div>
    <p class="nota">Puedes girar el modelo libremente. Pulsa un nombre para leer su ficha sin salir del recorrido; un clic en el modelo sí sale del recorrido.</p>`;
  $('#tPrev').onclick=()=>{state.tour.i--;showTourStep();};
  $('#tNext').onclick=()=>{if(state.tour.i>=t.steps.length-1){exitTour();return;}state.tour.i++;showTourStep();};
  $('#tExit').onclick=()=>exitTour();
  $$('#info .chip[data-tour]').forEach(c=>c.onclick=()=>{const p=PART[c.dataset.id];const box=$('#tourFicha');
    if(box.dataset.id===p.id){box.innerHTML='';box.dataset.id='';return;}
    box.dataset.id=p.id; box.innerHTML=tourFicha(p); pulse(); state.selected=p; requestRender();
    box.querySelector('[data-full]').onclick=()=>{exitTour();p.visible=true;select(p,{focus:true,source:'chip'});};});
  refreshList(); $('#right').scrollTop=0;
}
function exitTour(silent){
  if(!state.tour) return;
  const prev=state.tour.prev, t=state.tour.t; state.tour=null;
  clearFlow(); setGhost(null); state.forced=null; state.selected=null;
  if(t.hemi){state.hemi=prev.hemi;syncHemi();}
  if(prev.explode) setExplode(prev.explode);
  applyState();
  if(!silent) showWelcome();
}

/* ---------- autoevaluación ---------- */
const quizCard=$('#quizCard');
const QUIZ_GROUPS=['lobulos','areas','giros','limbico','diencefalo','basales','tronco','otros'];
function quizPool(group){
  return PARTS.filter(p=>p.id!=='medula'&&!p.ba&&(group?p.g===group:true)&&!(group!=='giros'&&p.surco));
}
function bestKey(){const q=state.quiz;return 'atlas.best.'+q.mode+'.'+(q.group||'all');}
function readBest(key){try{return +localStorage.getItem(key)||0;}catch(e){return 0;}}
function showQuizMenu(){
  const gopts=QUIZ_GROUPS.map(g=>`<option value="${g}">${esc(GROUPS.find(x=>x.id===g).name)}</option>`).join('');
  openModal(`<h2 tabindex="-1">Autoevaluación</h2>
    <div class="grid2">
      <button class="tcard" data-m="find"><b>Encuéntrala</b><span>Se te pide una estructura: haz clic en ella en el modelo.</span></button>
      <button class="tcard" data-m="name"><b>¿Qué estructura es?</b><span>Se resalta una estructura: elige su nombre entre cuatro.</span></button>
      <button class="tcard" data-m="caso"><b>Caso clínico</b><span>Lee los síntomas de un paciente y señala la región lesionada. ${CASES.length} casos.</span></button>
    </div>
    <div class="row" style="margin-top:14px;gap:10px;flex-wrap:wrap"><label>Grupo: <select id="qGroup"><option value="">Todas las estructuras</option>${gopts}</select></label>
    <label>Preguntas: <select id="qN"><option>10</option><option>20</option><option value="0">Sin límite</option></select></label></div>
    <p class="nota">En los modos “Encuéntrala” y “Caso clínico” las estructuras profundas se pueden ver bajando la opacidad de la corteza o separando las partes; la “Pista” lo hace por ti.</p>`,'Autoevaluación');
  $$('#modal .tcard').forEach(b=>b.onclick=()=>{const g=$('#qGroup').value,n=+$('#qN').value;closeModal();startQuiz(b.dataset.m,g||null,n);});
}
function startQuiz(mode,group,n){
  exitTour(true); if(state.quiz) exitQuiz(true);
  state.quiz={mode,group:mode==='caso'?null:group,n:n===undefined?10:n,score:0,total:0,target:null,locked:false,timer:null,misses:[],asked:[],
    prev:{op:state.cortexOp,explode:state.explodeT,labels:state.labels,hemi:state.hemi,cut:state.cut,isolate:state.isolate,ghost:state.ghost}};
  state.isolate=null; setGhost(null); state.forced=null; state.labels=false; $('#tLabels').checked=false; hideLabels();
  state.hemi='both'; syncHemi(); if(state.cut!=='none') setCut('none',0,false);
  state.selected=null; showWelcome(); $('#btnQuiz').textContent='Salir del quiz'; $('#btnQuiz').classList.add('on'); quizCard.classList.remove('hidden');
  closeDrawers(); $('#right').classList.remove('open');
  tweenCamera(HOME_POS,HOME_TGT); setExplode(0);
  nextQuestion();
}
function nextQuestion(){
  const q=state.quiz; if(!q) return;
  clearTimeout(q.timer); q.timer=null; q.locked=false;
  if(q.n&&q.total>=q.n){showQuizSummary();return;}
  setCortexOp(1);
  if(q.mode==='caso'){
    let c; const left=CASES.filter(x=>!q.asked.includes(x)); const pool=left.length?left:CASES;
    do{c=pool[Math.floor(Math.random()*pool.length)];}while(pool.length>1&&c===q.target);
    q.target=c; q.asked.push(c); q.targetIds=c.ans.filter(id=>PART[id]);
    quizForce(q.targetIds);
  } else {
    const pool=quizPool(q.group); let left=pool.filter(p=>!q.asked.includes(p)); if(!left.length){q.asked=[];left=pool;}
    const t=left[Math.floor(Math.random()*left.length)];
    q.target=t; q.asked.push(t); q.targetIds=[t.id];
    quizForce([t.id]);
    if(q.mode==='name'){
      setGhost(new Set([t.id]),'quiz'); applyStateNow(); focusParts([t.id]);
      const same=pool.filter(p=>p!==t&&p.g===t.g), other=pool.filter(p=>p!==t&&p.g!==t.g);
      const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
      const cand=[...shuffle(same).slice(0,2),...shuffle(other),...same.slice(2)];   // 2 del mismo grupo, el resto de otros (o del mismo si no hay)
      q.opts=shuffle([t,...cand.slice(0,3)]);
    }
  }
  renderQuiz();
}
// Hace visibles las respuestas sin delatarlas: si son áreas/giros, muestra toda su capa
function quizForce(ids){
  const set=new Set(ids);
  // si alguna respuesta válida es una pieza de corteza o una estructura profunda, basta con ella: no se muestran capas
  const onlyOverlays=ids.every(id=>PART[id]&&(PART[id].overlay||PART[id].surco));
  if(onlyOverlays){const p=PART[ids[0]]; PARTS.filter(x=>x.g===p.g).forEach(x=>set.add(x.id));}
  else ids.forEach(id=>{const p=PART[id]; if(p&&(p.overlay||p.surco)) set.delete(id);});
  state.quizForced=set; setGhost(null); applyStateNow();
}
function renderQuiz(fb){
  const q=state.quiz, t=q.target;
  const modes=[['find','Encuéntrala'],['name','¿Qué estructura es?'],['caso','Caso clínico']];
  let body='';
  if(q.mode==='find'){
    const deep=!t.sup;
    body=`<div class="prompt">Haz clic en: <b>${esc(t.name)}</b></div><div class="nota">Grupo: ${esc(t.group.name)}${deep?' · Pista: está en el interior; usa la pista o baja la opacidad de la corteza.':''}</div>
      <div class="row" style="margin-top:8px"><button class="btn sm" id="qHint">Pista</button><button class="btn sm" id="qSkip">Saltar</button></div>`;
  } else if(q.mode==='name'){
    body=`<div class="prompt">¿Qué estructura está resaltada?</div><div class="opts">${q.opts.map((o,i)=>`<button class="btn opt" data-i="${i}">${esc(o.name)}</button>`).join('')}</div>`;
  } else {
    body=`<div class="case"><span class="tag">Paciente</span> ${esc(t.sym)}</div><div class="prompt" style="font-size:15px">¿Qué estructura está dañada? Haz clic en ella.</div>
      <div class="row" style="margin-top:8px"><button class="btn sm" id="qHint">Pista</button><button class="btn sm" id="qSkip">Saltar</button></div>`;
  }
  quizCard.innerHTML=`<div class="qtop"><div class="seg" role="group" aria-label="Modo">${modes.map(m=>`<button data-m="${m[0]}" class="${q.mode===m[0]?'on':''}" aria-pressed="${q.mode===m[0]}">${m[1]}</button>`).join('')}</div>
    <span class="score">Aciertos: <b>${q.score}</b> / ${q.total}${q.n?' de '+q.n:''}</span><button class="icon-btn" id="qClose" title="Salir" aria-label="Salir del quiz" style="font-size:20px;line-height:1">×</button></div>
    ${body}<div class="fb ${fb?fb.cls:''}" aria-live="polite">${fb?fb.msg:''}</div>`;
  quizCard.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{startQuiz(b.dataset.m,q.group,q.n);});
  $('#qClose').onclick=()=>exitQuiz();
  if($('#qSkip')) $('#qSkip').onclick=()=>{ if(q.locked) return; q.locked=true; q.total++; q.misses.push({target:t,given:null}); renderQuiz({cls:'bad',msg:(q.mode==='caso'?t.name+': ':'')+'era '+(q.mode==='caso'?PART[q.targetIds[0]].name:t.name)}); flashAnswer(q.targetIds); };
  if($('#qHint')) $('#qHint').onclick=()=>{ const deep=q.targetIds.some(id=>!PART[id].sup); if(deep){setCortexOp(0.12);} focusParts(q.targetIds); if(q.mode==='caso'){quizCard.querySelector('.fb').textContent='Pista: '+t.expl.split(':')[0].split('(')[0]+'…';} };
  quizCard.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{ if(q.locked) return; quizAnswer(q.opts[+b.dataset.i],b); });
}
function quizClick(p){
  const q=state.quiz; if(!q||q.mode==='name'||!p||q.locked) return;
  quizAnswer(p);
}
function quizAnswer(p,btn){
  const q=state.quiz; if(!q||q.locked) return;
  q.locked=true; q.total++;
  let ok=q.targetIds.includes(p.id), near=false;
  if(!ok&&q.mode==='caso'){ // se acepta el lóbulo que contiene el área lesionada
    near=q.targetIds.some(id=>PART[id].lobe===p.id);
    if(near) ok=true;
  }
  if(ok) q.score++; else q.misses.push({target:q.target,given:p});
  const tname=q.mode==='caso'?q.target.name:q.target.name;
  if(q.mode==='name'){
    quizCard.querySelectorAll('.opt').forEach((b,i)=>{if(q.opts[i]===q.target)b.classList.add('ok');else if(b===btn)b.classList.add('bad');});
    const fb=quizCard.querySelector('.fb'); fb.className='fb '+(ok?'ok':'bad'); fb.textContent=ok?'¡Correcto!':'Era: '+tname;
    quizCard.querySelector('.score').innerHTML=`Aciertos: <b>${q.score}</b> / ${q.total}${q.n?' de '+q.n:''}`;
    q.timer=setTimeout(()=>{if(state.quiz===q)nextQuestion();},ok?1100:2000);
  } else if(q.mode==='caso'){
    const msg=ok?(near?`¡Correcto! (${esc(p.name)}; la zona exacta: ${esc(PART[q.targetIds[0]].name)}). ${q.target.name}: ${q.target.expl}`:`¡Correcto! ${q.target.name}: ${q.target.expl}`):`Eso es ${esc(p.name)}. Es un caso de <b>${q.target.name}</b>: ${q.target.expl}`;
    renderQuiz({cls:ok?'ok':'bad',msg});
    flashAnswer(q.targetIds,ok?2600:3400);
  } else {
    renderQuiz({cls:ok?'ok':'bad',msg:ok?'¡Correcto! '+esc(p.name):'Eso es '+esc(p.name)+'. Te muestro dónde está '+esc(q.target.name)+'…'});
    if(ok) q.timer=setTimeout(()=>{if(state.quiz===q)nextQuestion();},1000);
    else flashAnswer(q.targetIds);
  }
}
function flashAnswer(ids,ms){
  const q=state.quiz; setGhost(new Set(ids),'quiz'); applyStateNow(); focusParts(ids); pulse();
  q.timer=setTimeout(()=>{if(state.quiz!==q) return; setGhost(null); applyState(); nextQuestion();},ms||2200);
}
function showQuizSummary(){
  const q=state.quiz; const pct=q.total?Math.round(q.score/q.total*100):0;
  const key=bestKey(); const best=Math.max(readBest(key),pct); try{localStorage.setItem(key,best);}catch(e){}
  const missed=new Map(); q.misses.forEach(m=>{const k=m.target.id||m.target.name; if(!missed.has(k)) missed.set(k,m.target);});
  const items=[...missed.values()].map(t=>{const p=t.id?t:PART[t.ans.find(id=>PART[id])]; return `<li><button class="chip" data-rev="${p.id}"><span class="cdot" style="background:${p.color}"></span>${esc(t.id?t.name:t.name+' → '+p.name)}</button></li>`;}).join('');
  openModal(`<h2 tabindex="-1">Resultado</h2><p class="big">${q.score} de ${q.total} aciertos (${pct} %)${best>pct?` · tu mejor marca: ${best} %`:(q.total?' · ¡nueva mejor marca!':'')}</p>
    ${items?`<h3>Para repasar</h3><ul class="plain">${items}</ul><p class="nota">Pulsa una estructura para abrir su ficha.</p>`:'<p>Sin fallos. 🎉</p>'}
    <div class="row" style="margin-top:14px;gap:8px"><button class="btn primary" id="qAgain">Otra ronda</button><button class="btn" id="qEnd">Terminar</button></div>`,'Resultado');
  $('#qAgain').onclick=()=>{const m=q.mode,g=q.group,n=q.n;closeModal();startQuiz(m,g,n);};
  $('#qEnd').onclick=()=>{closeModal();exitQuiz();};
  $$('#modal [data-rev]').forEach(b=>b.onclick=()=>{const p=PART[b.dataset.rev];closeModal();exitQuiz(true);p.visible=true;select(p,{focus:true,source:'chip'});});
  exitQuiz(true,true);
}
function exitQuiz(silent,keepCard){
  const q=state.quiz; if(!q) return;
  clearTimeout(q.timer); state.quiz=null;
  state.quizForced=null; setGhost(null);
  setCortexOp(q.prev.op); if(q.prev.labels){state.labels=true;$('#tLabels').checked=true;}
  if(!keepCard) quizCard.classList.add('hidden');
  else quizCard.classList.add('hidden');
  $('#btnQuiz').textContent='Autoevaluación'; $('#btnQuiz').classList.remove('on');
  applyState();
  if(!silent) showWelcome();
}
