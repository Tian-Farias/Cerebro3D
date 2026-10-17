/* =====================================================================
   INTERFAZ: lista, fichas, etiquetas, controles, puntero, teclado, modales, compartir
   ===================================================================== */
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const isMobile=()=>window.innerWidth<=900;
const ICON={
  eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 3l18 18M10.6 5.1A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a10 10 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
  focus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/></svg>',
  chev:'<svg class="gchev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>'
};

/* ---------- lista de estructuras ---------- */
function buildList(){
  const root=$('#groups'); root.innerHTML='';
  for(const g of GROUPS){
    const parts=PARTS.filter(p=>p.g===g.id);
    const el=document.createElement('section'); el.className='group'; el.dataset.g=g.id;
    el.innerHTML=`<div class="ghead"><button class="icon-btn gtoggle" aria-label="Contraer o expandir ${esc(g.name)}" aria-expanded="true">${ICON.chev}</button>
      <button class="gname" title="Resaltar este grupo">${esc(g.name)}</button>
      <button class="icon-btn gfocus" title="Resaltar el grupo (atenúa el resto)" aria-label="Resaltar ${esc(g.name)}">${ICON.focus}</button>
      <button class="icon-btn geye" title="Mostrar u ocultar el grupo" aria-label="Mostrar u ocultar ${esc(g.name)}" aria-pressed="true">${ICON.eye}</button></div>
      ${g.hint?`<div class="ghint">${esc(g.hint)}</div>`:''}<div class="items" role="list"></div>`;
    const items=el.querySelector('.items');
    for(const p of parts){
      const it=document.createElement('div'); it.className='item'; it.dataset.id=p.id; it.setAttribute('role','listitem');
      it.innerHTML=`<button class="iname" aria-label="${esc(p.name)}: ver ficha"><span class="dot" style="background:${p.color}"></span><span>${esc(p.name)}${p.ba?` <small class="ba">BA ${esc(p.ba)}</small>`:''}</span></button>
        <button class="icon-btn eye" title="Mostrar u ocultar" aria-label="Mostrar u ocultar ${esc(p.name)}" aria-pressed="${p.visible}">${ICON.eye}</button>`;
      it.querySelector('.iname').onclick=()=>{ if(state.quiz) return; if(!p.visible){p.visible=true;} select(p,{focus:true,source:'list'}); closeDrawers(); };
      it.querySelector('.eye').onclick=()=>{ if(state.quiz) return; toggleVisible(p); };
      items.appendChild(it); p.itemEl=it;
    }
    el.querySelector('.gtoggle').onclick=e=>{el.classList.toggle('collapsed');e.currentTarget.setAttribute('aria-expanded',!el.classList.contains('collapsed'));};
    el.querySelector('.geye').onclick=()=>{ if(state.quiz) return; const any=parts.some(p=>p.visible); parts.forEach(p=>{p.visible=!any; if(state.isolate&&p.visible) state.isolate.add(p.id);}); if(any&&state.selected&&parts.includes(state.selected)) select(null); applyState(); };
    const focusGroup=()=>{ if(state.quiz) return; exitTour(); parts.forEach(p=>{p.visible=true;}); setGhost(new Set(parts.map(p=>p.id)),'group'); state.isolate=null; applyState(); focusParts(parts.map(p=>p.id)); showGroupInfo(g,parts); closeDrawers(); };
    el.querySelector('.gfocus').onclick=focusGroup; el.querySelector('.gname').onclick=focusGroup;
    g.el=el; root.appendChild(el);
  }
}
function toggleVisible(p){
  p.visible=!p.visible;
  if(state.isolate&&p.visible) state.isolate.add(p.id);
  applyState();
  if(!p.visible&&state.selected===p) select(null); else if(state.selected) showInfo(state.selected);
}
function refreshList(){
  for(const g of GROUPS){const parts=PARTS.filter(p=>p.g===g.id);const any=parts.some(p=>p.visible);const b=g.el.querySelector('.geye');b.innerHTML=any?ICON.eye:ICON.eyeOff;b.setAttribute('aria-pressed',any);}
  const quiz=!!state.quiz;
  for(const p of PARTS){if(!p.itemEl)continue;
    const on=p.visible||(!quiz&&isForced(p.id));
    p.itemEl.classList.toggle('off',!on);
    p.itemEl.classList.toggle('sel',state.selected===p);
    const e=p.itemEl.querySelector('.eye'); e.innerHTML=p.visible?ICON.eye:ICON.eyeOff; e.setAttribute('aria-pressed',p.visible);}
  const hidden=!state.tour&&!state.quiz&&(PARTS.some(p=>!p.visible&&!p.overlay&&!p.surco)||!!state.isolate||(!!state.ghost&&state.ghostSrc!=='auto'));
  $('#showAll').classList.toggle('hidden',!hidden);
}
function showAllParts(){ PARTS.forEach(p=>{p.visible=!(p.overlay||p.surco);}); state.isolate=null; setGhost(null); applyState(); if(state.selected) showInfo(state.selected); else showWelcome(); }
function revealInList(p){
  if(!p||!p.itemEl) return;
  p.group.el.classList.remove('collapsed'); p.group.el.style.display='';
  p.itemEl.style.display='';
  if(!isMobile()) p.itemEl.scrollIntoView({block:'nearest',behavior:state.reduced?'auto':'smooth'});
}

/* ---------- búsqueda ---------- */
function searchText(p){const I=p.info;return norm([p.name,I.alias||'',...(I.fun||[]),...(I.psi||[]),I.desc||'',I.dato||''].join(' '));}
function runSearch(){
  const q=norm($('#search').value.trim());
  $('#searchClear').classList.toggle('hidden',!q);
  let count=0, first=null;
  for(const p of PARTS){
    const byName=!q||norm(p.name+' '+(p.info.alias||'')).includes(q);
    const ok=byName||(q.length>=3&&searchText(p).includes(q));
    p.itemEl.style.display=ok?'':'none'; p.itemEl.classList.toggle('hit-deep',ok&&!byName&&!!q);
    if(ok){count++; if(!first) first=p;}
  }
  for(const g of GROUPS){const vis=PARTS.some(p=>p.g===g.id&&p.itemEl.style.display!=='none');g.el.style.display=vis?'':'none';if(q)g.el.classList.remove('collapsed');}
  $('#noResults').classList.toggle('hidden',count>0||!q);
  return first;
}

/* ---------- resaltado ---------- */
function setGhost(set,src){ state.ghost=set&&set.size?set:null; state.ghostSrc=state.ghost?src:null; }

/* ---------- ficha informativa ---------- */
function relatedOf(p){
  const rel=new Set();
  for(const t of TOURS)for(const s of t.steps)if(s.ids.includes(p.id))s.ids.forEach(i=>i!==p.id&&PART[i]&&rel.add(i));
  PARTS.filter(q=>q.g===p.g&&q!==p&&!q.ba).forEach(q=>rel.add(q.id));
  return [...rel].slice(0,8).map(i=>PART[i]);
}
function chip(p,extra=''){return `<button class="chip" data-id="${p.id}" ${extra}><span class="cdot" style="background:${p.color}"></span>${esc(p.name)}</button>`;}
function bindChips(root){ (root||$('#info')).querySelectorAll('.chip[data-id]').forEach(c=>c.onclick=()=>{const p=PART[c.dataset.id]; if(!p||state.quiz) return; p.visible=true; select(p,{focus:true,source:'chip'});}); }
function showWelcome(){
  $('#info').innerHTML=`<div class="welcome">
    <h2>Bienvenida 👋</h2>
    <p class="lead">Este modelo te permite explorar el encéfalo pieza por pieza, como un atlas de anatomía que se puede girar y desarmar.</p>
    <h3>Primeros pasos</h3>
    <ol>
      <li><b>Gira</b> arrastrando, <b>acerca</b> con la rueda o pellizcando y <b>desplaza</b> con clic derecho o dos dedos.</li>
      <li><b>Haz clic</b> en cualquier parte para ver su ficha: ubicación, funciones, relevancia en psicología, lesiones y bibliografía.</li>
      <li>Mueve <b>“Separar partes”</b> para desarmar el cerebro y ver las estructuras profundas, o baja la <b>opacidad de la corteza</b>.</li>
      <li>Usa la vista <b>Medial</b>, el <b>plano de corte</b> o los <b>cortes clásicos</b> para ver el cerebro por dentro${isMobile()?' (en el menú “Más” de abajo)':''}.</li>
      <li>Activa con el ojo las capas <b>Áreas funcionales</b>, <b>Giros y surcos</b> o <b>Áreas de Brodmann</b>${isMobile()?' (botón “Partes”)':''}.</li>
    </ol>
    <h3>Para estudiar</h3>
    <p>Prueba los <b>Recorridos</b> (Papez, recompensa, lenguaje, estrés, memoria, neurotransmisores…), consulta el <b>Glosario</b> y ponte a prueba con la <b>Autoevaluación</b>, que incluye casos clínicos.</p>
    <div class="tip"><b>Atajos:</b> <span class="kbd">F</span> enfocar · <span class="kbd">I</span> aislar · <span class="kbd">H</span> ocultar · <span class="kbd">E</span> extraer · <span class="kbd">L</span> etiquetas · <span class="kbd">Esc</span> deseleccionar · <span class="kbd">R</span> reiniciar · flechas: mover la cámara</div>
  </div>`;
}
function showGroupInfo(g,parts){
  state.selected=null;
  $('#info').innerHTML=`<h2>${esc(g.name)}</h2><p class="alias">${parts.length} estructuras resaltadas · el resto está atenuado</p>
    <div class="actions"><button class="btn sm" id="gClear">Quitar resaltado</button><button class="btn sm ${state.isolate?'on':''}" id="gIso">${state.isolate?'Mostrar todo':'Ver solo este grupo'}</button></div>
    <div class="related" style="margin-top:10px">${parts.map(p=>chip(p)).join('')}</div>`;
  $('#gClear').onclick=()=>{setGhost(null);applyState();showWelcome();};
  $('#gIso').onclick=()=>{ if(state.isolate){state.isolate=null;applyState();showGroupInfo(g,parts);} else {setGhost(null);state.isolate=new Set(parts.map(p=>p.id));applyState();showGroupInfo(g,parts);} };
  bindChips(); refreshList();
}
function refLine(I){
  if(!I.ref) return '';
  const parts=[];
  for(const k of ['c','k','kw']) if(I.ref[k]) parts.push(`<li><b>${BOOKS[k].short}:</b> ${I.ref[k]}</li>`);
  return parts.length?`<h3>Dónde ampliar</h3><ul class="refs">${parts.join('')}</ul>`:'';
}
function showInfo(p){
  const I=p.info, g=p.group;
  const lat=p.par===false?'Línea media':(p.par?'Estructura par (una en cada hemisferio)':'');
  const latB=(p.id==='broca'||p.id==='wernicke'||p.id==='arqueado')?'Hemisferio izquierdo (dominante para el lenguaje)':lat;
  const iso=state.isolate&&state.isolate.size===1&&state.isolate.has(p.id);
  const gh=state.ghost&&state.ghost.size===1&&state.ghost.has(p.id);
  $('#info').innerHTML=`
    <div class="ihead"><span class="swatch" style="background:${p.color}"></span><div><h2 id="infoTitle">${esc(p.name)}</h2>
      <div class="alias">${I.alias||''}</div><span class="badge">${esc(g.name)}</span> ${latB?`<span class="badge">${latB}</span>`:''}</div></div>
    <div class="actions">
      <button class="btn sm" data-a="focus">Enfocar</button>
      <button class="btn sm ${iso?'on':''}" data-a="iso">${iso?'Mostrar todo':'Aislar'}</button>
      <button class="btn sm ${gh?'on':''}" data-a="ghost">${gh?'Quitar resaltado':'Resaltar'}</button>
      ${p.overlay||p.surco?'':`<button class="btn sm ${p.extractT?'on':''}" data-a="ext">${p.extractT?'Devolver':'Extraer'}</button>`}
      <button class="btn sm" data-a="hide">Ocultar</button>
      <button class="btn sm" data-a="print" title="Imprimir esta ficha">Imprimir</button>
    </div>
    <p class="lead">${I.desc||''}</p>
    ${I.ubic?`<h3>Ubicación</h3><p>${I.ubic}</p>`:''}
    ${I.fun&&I.fun.length?`<h3>Funciones principales</h3><ul>${I.fun.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}
    ${I.psi&&I.psi.length?`<h3>Relevancia en psicología</h3><ul>${I.psi.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}
    ${I.lesion?`<h3>Lesión → síntoma</h3><table class="lesion">${I.lesion.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>`:''}
    ${I.conex?`<h3>Conexiones</h3><p>${I.conex}</p>`:''}
    ${I.nt?`<h3>Neurotransmisores</h3><p>${I.nt}</p>`:''}
    ${I.tests?`<h3>Pruebas neuropsicológicas</h3><ul>${I.tests.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}
    ${I.dato?`<div class="tip"><b>Para recordar:</b> ${I.dato}</div>`:''}
    ${refLine(I)}
    ${I.nota?`<p class="nota">${I.nota}</p>`:''}
    <h3>Estructuras relacionadas</h3><div class="related">${relatedOf(p).map(q=>chip(q)).join('')}</div>`;
  $('#info').querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>doAction(b.dataset.a,p));
  bindChips();
  $('#right').scrollTop=0;
}
function doAction(a,p){
  if(!p||state.quiz) return;
  if(a==='focus') focusParts([p.id]);
  else if(a==='iso'){ if(state.isolate&&state.isolate.size===1&&state.isolate.has(p.id)) state.isolate=null; else {state.isolate=new Set([p.id]);setGhost(null);p.visible=true;} applyState(); focusParts([p.id]); }
  else if(a==='ghost'){ if(state.ghost&&state.ghost.size===1&&state.ghost.has(p.id)) setGhost(null); else setGhost(new Set([p.id]),'manual'); applyState(); focusParts([p.id]); }
  else if(a==='ext'){ p.extractT=p.extractT?0:1; requestRender(); }
  else if(a==='hide'){ p.visible=false; applyState(); select(null); return; }
  else if(a==='print'){ printInfo(p); return; }
  showInfo(p);
}
// Selección: toda selección nueva sustituye el resaltado anterior; una estructura profunda elegida desde
// la lista o un chip se resalta sola (si no, quedaría tapada por la corteza).
function select(p,opt={}){
  if(state.tour) exitTour();
  if(state.ghostSrc!=='manual'||!p||!state.ghost||!state.ghost.has(p.id)) setGhost(null);
  state.selected=p;
  if(p&&opt.source&&!p.cortex&&!p.overlay&&!p.surco&&!state.isolate) setGhost(new Set([p.id]),'auto');
  if(p&&opt.source&&(p.overlay||p.surco)) p.visible=true;
  applyState();
  if(p){ pulse(); showInfo(p); revealInList(p); if(opt.focus) focusParts([p.id]); if(isMobile()&&opt.open!==false) $('#right').classList.add('open'); }
  else showWelcome();
  updateHash();
}

/* ---------- etiquetas 3D ---------- */
const labelsRoot=$('#labels');
function buildLabels(){
  for(const p of PARTS){const el=document.createElement('button');el.className='lbl';el.type='button';el.innerHTML=`<i style="background:${p.color}"></i>${esc(p.ba?'BA '+p.ba:p.name)}`;el.style.opacity=0;el.tabIndex=-1;
    el.onclick=()=>{if(state.quiz)return;select(p,{focus:true,source:'label'});}; labelsRoot.appendChild(el);p.labelEl=el;p.labelW=0;}
}
const _v=new THREE.Vector3();
function hideLabels(){for(const p of PARTS){p.labelEl.style.opacity=0;p.labelEl.style.pointerEvents='none';}}
function updateLabels(now){
  if(!state.labels||state.quiz){hideLabels();return;}
  ensureOcclusion(now);
  const w=canvas.clientWidth,h=canvas.clientHeight, camPos=camera.position, placed=[];
  for(const p of PARTS){
    let best=null,bd=1e9;
    for(const m of p.meshes){ if(!pickable(m)) continue; const wp=m.localToWorld(_v.copy(m.userData.anchor)); const d=wp.distanceTo(camPos); if(d<bd){bd=d;best=m;} }
    const el=p.labelEl;
    if(!best){el.style.opacity=0;el.style.pointerEvents='none';continue;}
    const wp=best.localToWorld(_v.copy(best.userData.anchor)).project(camera);
    const sx=(wp.x*0.5+0.5)*w, sy=(-wp.y*0.5+0.5)*h;
    let vis=wp.z<1&&sx>0&&sx<w&&sy>0&&sy<h;
    if(vis){const ids=idsAround(sx,sy); vis=p.meshes.some(m=>ids.has(m.userData.id));}
    if(vis){for(const q of placed){if(Math.abs(q[0]-sx)<70&&Math.abs(q[1]-sy)<18){vis=false;break;}}}
    if(vis){placed.push([sx,sy]); if(!p.labelW) p.labelW=el.offsetWidth||80; const hw=p.labelW/2+4; const lx=clamp(sx,hw,w-hw);
      el.style.transform=`translate(${lx}px,${sy}px) translate(-50%,-140%)`;}
    el.style.opacity=vis?1:0; el.style.pointerEvents=vis?'auto':'none';
  }
}

/* ---------- brújula ---------- */
const compass=$('#compass'); let compassNodes=null; const _lastQ=new THREE.Quaternion(0,0,0,0);
function initCompass(){
  compass.innerHTML=`<circle r="44" fill="var(--compass-bg)" stroke="var(--line)"/>`+
    ['Der','Izq','Sup','Inf','Ant','Post'].map((t,i)=>`<line id="cl${i}" x1="0" y1="0" x2="0" y2="0" stroke="${['#ff8a8a','#ff8a8a','#8affb0','#8affb0','#8ab4ff','#8ab4ff'][i]}" stroke-width="${i%2?1.2:2.2}" opacity="${i%2?.5:1}"/><text id="ct${i}">${t}</text>`).join('');
  compassNodes=[0,1,2,3,4,5].map(i=>[document.getElementById('cl'+i),document.getElementById('ct'+i)]);
}
const AX=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].map(a=>new THREE.Vector3(...a));
const qInv=new THREE.Quaternion(), _ax=new THREE.Vector3();
function updateCompass(){
  if(!compassNodes||_lastQ.equals(camera.quaternion)) return;
  _lastQ.copy(camera.quaternion); qInv.copy(camera.quaternion).invert();
  AX.forEach((a,i)=>{_ax.copy(a).applyQuaternion(qInv);const [l,t]=compassNodes[i];
    l.setAttribute('x2',_ax.x*26);l.setAttribute('y2',-_ax.y*26);t.setAttribute('x',_ax.x*36);t.setAttribute('y',-_ax.y*36);t.setAttribute('opacity',0.45+0.55*clamp(0.5+_ax.z*0.5,0,1));});
}

/* ---------- controles del dock ---------- */
function setExplode(v){state.explodeT=v;$('#explode').value=Math.round(v*100);$('#explodeVal').textContent=Math.round(v*100)+'%';requestRender();}
function setCortexOp(v){state.cortexOp=v;$('#cortexOp').value=Math.round(v*100);$('#opVal').textContent=Math.round(v*100)+'%';applyState();}
function syncHemi(){$$('#hemi button').forEach(b=>{const on=b.dataset.v===state.hemi;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);});}
function setActiveView(name){$$('[data-view]').forEach(b=>{const on=b.dataset.view===name;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);});}
function syncCutUI(){
  $('#cutMode').value=state.cut; $('#cutPos').value=state.cutPos; $('#cutPos').disabled=state.cut==='none'; $('#cutFlip').disabled=state.cut==='none';
  const names={sag:['Izq.','Der.'],cor:['Post.','Ant.'],axi:['Inf.','Sup.']};
  $('#cutVal').textContent=state.cut==='none'?'':(state.cutPos===0?'centro':(state.cutPos<0?names[state.cut][0]:names[state.cut][1])+' '+Math.abs(state.cutPos)+'%');
}
function setCut(mode,pos,flip,look){
  state.cut=mode; state.cutPos=pos; state.cutFlip=!!flip; syncCutUI(); applyState(); if(look&&mode!=='none') lookAtCut(); updateHash();
}
function initDock(){
  $('#explode').oninput=e=>{setExplode(e.target.value/100);setActiveView(null);};
  $('#cortexOp').oninput=e=>{state.cortexOp=e.target.value/100;$('#opVal').textContent=e.target.value+'%';applyMaterials();requestRender();idsDirty=true;};
  $('#cortexOp').onchange=()=>{applyState();updateHash();};
  $$('#hemi button').forEach(b=>b.onclick=()=>{state.hemi=b.dataset.v;syncHemi();applyState();updateHash();});
  $('#cutMode').onchange=e=>setCut(e.target.value,state.cutPos,state.cutFlip,true);
  $('#cutPos').oninput=e=>{state.cutPos=+e.target.value;syncCutUI();updateCut();};
  $('#cutFlip').onclick=()=>setCut(state.cut,state.cutPos,!state.cutFlip,true);
  const ps=$('#cutPreset'); PRESET_CUTS.forEach(c=>{const o=document.createElement('option');o.value=c.id;o.textContent=c.name;o.title=c.desc;ps.appendChild(o);});
  ps.onchange=e=>{const c=PRESET_CUTS.find(x=>x.id===e.target.value); if(!c) return; setCortexOp(1); setExplode(0); state.hemi='both'; syncHemi(); setCut(c.mode,c.pos,c.flip,true); $('#info').innerHTML=`<h2>${esc(c.name)}</h2><p class="lead">${esc(c.desc)}</p><p class="nota">Mueve el deslizador del plano de corte para avanzar o retroceder. Pulsa ⇄ para conservar el otro lado.</p><div class="actions"><button class="btn sm" id="cutOff">Quitar corte</button></div>`; $('#cutOff').onclick=()=>{setCut('none',0,false);ps.value='';showWelcome();}; state.selected=null; refreshList(); e.target.value='';};
  $$('[data-view]').forEach(b=>b.onclick=()=>{ if(b.dataset.view!=='medial'&&state.hemi!=='both'){state.hemi='both';syncHemi();applyState();} setView(b.dataset.view); if(b.dataset.view==='medial') syncHemi(); setActiveView(b.dataset.view); updateHash(); });
  $('#tLabels').onchange=e=>{state.labels=e.target.checked;idsDirty=true;requestRender();if(!state.labels)hideLabels();};
  $('#tReal').onchange=e=>{state.real=e.target.checked;applyState();};
  $('#tRotate').onchange=e=>{controls.autoRotate=e.target.checked;requestRender();};
  $('#dockMore').onclick=()=>{const d=$('#dock');d.classList.toggle('expanded');const ex=d.classList.contains('expanded');$('#dockMore').textContent=ex?'Menos ▴':'Más ▾';$('#dockMore').setAttribute('aria-expanded',ex);setTimeout(resize,0);};
}
function resetAll(opt={}){
  if(state.quiz&&!opt.force&&state.quiz.total>0&&!confirm('Hay una autoevaluación en curso. ¿Reiniciar y perder la puntuación?')) return;
  exitQuiz(true); exitTour(); closeModal(); clearFlow();
  PARTS.forEach(p=>{p.visible=!(p.overlay||p.surco);p.extractT=0;});
  Object.assign(state,{explodeT:0,explode:0,cortexOp:1,hemi:'both',isolate:null,ghost:null,ghostSrc:null,forced:null,quizForced:null,cut:'none',cutPos:0,cutFlip:false,labels:false,real:false});
  setExplode(0); $('#cortexOp').value=100; $('#opVal').textContent='100%';
  $('#tLabels').checked=false; $('#tReal').checked=false; $('#tRotate').checked=false; controls.autoRotate=false; hideLabels();
  $('#search').value=''; runSearch(); $$('.group').forEach(g=>g.classList.remove('collapsed'));
  $('#dock').classList.remove('expanded'); $('#dockMore').textContent='Más ▾'; closeDrawers(); $('#right').classList.remove('open');
  syncHemi(); syncCutUI(); setActiveView(null); applyState(); select(null); tweenCamera(HOME_POS,HOME_TGT);
  history.replaceState(null,'',location.pathname+location.search);
}

/* ---------- cajones en móvil ---------- */
function closeDrawers(){ if(isMobile()) $('#left').classList.remove('open'); }
function initDrawers(){
  $('#btnLeft').onclick=()=>{$('#left').classList.toggle('open');$('#right').classList.remove('open');};
  $('#btnRight').onclick=()=>{$('#right').classList.toggle('open');$('#left').classList.remove('open');};
  $$('.drawer-close').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).classList.remove('open'));
}

/* ---------- puntero ---------- */
const tooltip=$('#tooltip'); let down=null, hoverPending=null;
function setHover(m){const p=m?m.userData.part:null; if(state.hover===p) return; state.hover=p; canvas.style.cursor=p?'pointer':'grab'; requestRender();}
function initPointer(){
  canvas.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY};camTween=null;});
  canvas.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse') return;
    hoverPending={x:e.clientX,y:e.clientY,buttons:e.buttons};
  });
  canvas.addEventListener('pointerleave',()=>{hoverPending=null;setHover(null);tooltip.classList.add('hidden');});
  canvas.addEventListener('pointerup',e=>{
    if(!down) return; const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y); down=null;
    if(moved>6) return;
    const m=pickAt(e.clientX,e.clientY);
    if(state.quiz){ quizClick(m?m.userData.part:null); return; }
    select(m?m.userData.part:null,{open:true});
  });
  canvas.addEventListener('dblclick',e=>{const m=pickAt(e.clientX,e.clientY);if(m&&!state.quiz)focusParts([m.userData.part.id]);});
}
function processHover(now){ // se ejecuta una vez por frame; usa el búfer de ids de baja resolución
  if(!hoverPending) return;
  const h=hoverPending; hoverPending=null;
  if(h.buttons){tooltip.classList.add('hidden');return;}
  ensureOcclusion(now);
  const id=idAt(h.x,h.y), m=id>=0&&id<meshes.length?meshes[id]:null;
  setHover(m);
  if(m&&!state.quiz){const p=m.userData.part;tooltip.innerHTML=`${esc(p.name)}<small>${esc(p.group.name)}</small>`;tooltip.style.left=h.x+'px';tooltip.style.top=h.y+'px';tooltip.classList.remove('hidden');}
  else tooltip.classList.add('hidden');
}

/* ---------- teclado ---------- */
function initKeys(){
  window.addEventListener('keydown',e=>{
    if(e.ctrlKey||e.metaKey||e.altKey) return;
    const t=e.target;
    if(t&&t.matches&&t.matches('input[type=text],input[type=search],textarea,select')) { if(e.key==='Escape') t.blur(); return; }
    const modal=!$('#modal').classList.contains('hidden');
    const k=e.key.toLowerCase(), p=state.selected;
    if(k==='escape'){ if(modal) closeModal(); else if($('#menu').classList.contains('open')) toggleMenu(false); else if(state.quiz) exitQuiz(); else if(state.tour) exitTour(); else {setGhost(null);state.isolate=null;applyState();select(null);} return; }
    if(modal) return;
    if(k==='l'){$('#tLabels').click();return;}
    if(k==='r'){resetAll();return;}
    if(state.quiz) return;
    if(k==='f'&&p) doAction('focus',p);
    else if(k==='i'&&p) doAction('iso',p);
    else if(k==='h'&&p) doAction('hide',p);
    else if(k==='e'&&p&&!p.overlay&&!p.surco) doAction('ext',p);
    else if(k==='/'){e.preventDefault();$('#search').focus();}
  });
}

/* ---------- modal ---------- */
let lastFocus=null;
function openModal(html,title){
  lastFocus=document.activeElement;
  $('#modalBody').innerHTML=html; const m=$('#modal'); m.classList.remove('hidden');
  if(title) m.setAttribute('aria-label',title);
  const f=m.querySelector('h2, input, button:not(.close)'); (f||m.querySelector('.close')).focus();
}
function closeModal(){const m=$('#modal'); if(m.classList.contains('hidden')) return; m.classList.add('hidden'); if(lastFocus&&lastFocus.focus) lastFocus.focus();}
function initModal(){
  $('#modal .close').onclick=closeModal;
  $('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});
  $('#modal').addEventListener('keydown',e=>{ // atrapar el foco dentro del diálogo
    if(e.key!=='Tab') return;
    const f=[...$('#modal').querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x=>!x.disabled&&x.offsetParent);
    if(!f.length) return; const first=f[0], last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){last.focus();e.preventDefault();} else if(!e.shiftKey&&document.activeElement===last){first.focus();e.preventDefault();}
  });
}

/* ---------- guía, glosario, acerca de ---------- */
function showGuide(){openModal(`
  <h2 tabindex="-1">Guía de estudio</h2>
  <p>Una ruta sugerida para aprender neuroanatomía funcional de forma progresiva. Cada paso se puede hacer directamente en el modelo.</p>
  <h3>1 · Orientarse: planos y direcciones</h3>
  <table class="terms">
    <tr><td>Anterior / rostral</td><td>Hacia la frente. Posterior / caudal: hacia la nuca.</td></tr>
    <tr><td>Superior / dorsal</td><td>Hacia arriba. Inferior / ventral: hacia la base del cerebro.</td></tr>
    <tr><td>Medial / lateral</td><td>Hacia la línea media / hacia los lados.</td></tr>
    <tr><td>Ipsilateral / contralateral</td><td>Del mismo lado / del lado opuesto (la mayoría de vías motoras y sensitivas son contralaterales).</td></tr>
    <tr><td>Plano sagital</td><td>Divide en izquierda y derecha (vista “Medial”, corte sagital).</td></tr>
    <tr><td>Plano coronal</td><td>Divide en anterior y posterior (como un corte “de oreja a oreja”).</td></tr>
    <tr><td>Plano axial</td><td>Corte horizontal: divide en superior e inferior (como una TAC).</td></tr>
  </table>
  <p>La brújula de la esquina te indica siempre hacia dónde está cada dirección.</p>
  <h3>2 · Los cuatro lóbulos (+ ínsula)</h3>
  <p>Activa la capa <b>Giros y surcos</b> y localiza el <b>surco central</b> (frontal/parietal), la <b>cisura de Silvio</b> (temporal) y el <b>surco parieto-occipital</b>. Luego separa las partes para encontrar la <b>ínsula</b>. Estudia en este orden: <i>dónde está → qué hace → qué pasa si se daña</i> (las fichas siguen ese orden).</p>
  <h3>3 · Áreas funcionales y Brodmann</h3>
  <p>Activa <b>Áreas funcionales</b>. Relaciona cada área con una función y con lo que ocurre cuando se lesiona (afasias, heminegligencia, ceguera cortical…). La capa <b>Áreas de Brodmann</b> te da los números que usan los manuales y los artículos.</p>
  <h3>4 · Por dentro: sistema límbico y diencéfalo</h3>
  <p>Usa la vista <b>Medial</b> o los <b>cortes clásicos</b>. Ubica hipocampo, amígdala, fórnix, cingulado, tálamo e hipotálamo. Haz los recorridos <b>Circuito de Papez</b>, <b>Miedo y ansiedad</b> y <b>Sistemas de memoria</b>.</p>
  <h3>5 · Ganglios basales, tronco y neurotransmisores</h3>
  <p>Relaciónalos con el movimiento, los hábitos y la recompensa (Parkinson, Huntington, TOC, adicciones). Haz los recorridos <b>Recompensa</b>, <b>Movimiento</b> y <b>Sistemas de neurotransmisores</b>: son la base de la psicofarmacología.</p>
  <h3>6 · Ponte a prueba</h3>
  <p>La <b>Autoevaluación</b> tiene tres modos: “Encuéntrala” (haz clic en la estructura pedida), “¿Qué estructura es?” (elige entre cuatro opciones) y <b>“Caso clínico”</b> (lee el síntoma y señala la lesión). Al terminar una sesión verás un resumen con lo que conviene repasar.</p>
  <div class="tip"><b>Consejo:</b> estudia siempre en tres capas: <i>dónde está</i> → <i>qué hace</i> → <i>qué pasa si se daña</i>. Y cada estructura con su neurotransmisor y su fármaco.</div>
  <p class="nota">Modelo didáctico simplificado: las formas y proporciones son aproximadas y la localización de las áreas funcionales y de Brodmann varía entre personas.</p>`,'Guía de estudio');}
function showGlossary(q){
  const list=GLOSSARY.map((t,i)=>`<div class="gl" data-i="${i}"><b>${t[0]}</b><div>${t[1]}</div></div>`).join('');
  openModal(`<h2 tabindex="-1">Glosario</h2><input id="glq" type="search" class="search" placeholder="Buscar término… (ej. afasia, decusación, ISRS)" aria-label="Buscar en el glosario"><div id="glList">${list}</div><div id="glNone" class="nota hidden">Sin resultados.</div>`,'Glosario');
  const inp=$('#glq'); const run=()=>{const s=norm(inp.value.trim());let n=0;$$('#glList .gl').forEach(el=>{const ok=!s||norm(el.textContent).includes(s);el.classList.toggle('hidden',!ok);if(ok)n++;});$('#glNone').classList.toggle('hidden',n>0);};
  inp.oninput=run; if(q){inp.value=q;run();} inp.focus();
}
function showAbout(){openModal(`
  <h2 tabindex="-1">Acerca de este atlas</h2>
  <p>Atlas 3D didáctico del encéfalo humano orientado a estudiantes de Psicología. Versión del ${esc(BUILD_DATE)}. Funciona íntegramente en este archivo, sin conexión a internet.</p>
  <h3>Cómo citar</h3>
  <p class="cite">Atlas 3D del Cerebro: guía interactiva de neuroanatomía para Psicología (${esc(BUILD_DATE.slice(0,4))}). Aplicación HTML autocontenida.</p>
  <h3>Bibliografía de referencia</h3>
  <p>Las fichas indican el capítulo donde ampliar cada estructura en tres manuales habituales de la carrera. Los números de capítulo corresponden a estas ediciones y pueden variar en otras:</p>
  <ul>${Object.values(BOOKS).map(b=>`<li>${b.full}</li>`).join('')}</ul>
  <p>Otras fuentes usadas en los textos: Damasio, <i>El error de Descartes</i>; LeDoux, <i>El cerebro emocional</i>; Sacks, <i>El hombre que confundió a su mujer con un sombrero</i>; Squire y Kandel, <i>Memoria</i>; Gazzaniga, <i>¿Quién manda aquí?</i></p>
  <h3>Limitaciones</h3>
  <ul><li>Las formas se generan por código a partir de funciones matemáticas: son aproximadas y no proceden de una resonancia real.</li><li>La posición de las áreas funcionales, los giros y las áreas de Brodmann es orientativa; varía mucho entre personas.</li><li>El contenido es material de estudio, no de diagnóstico.</li></ul>
  <h3>Opciones</h3>
  <ul><li><code>?calidad=baja</code> o <code>?calidad=alta</code> al final de la dirección fuerza la resolución del modelo.</li><li>La dirección cambia al explorar (<code>#…</code>): cópiala para compartir exactamente lo que ves (menú ⋯ → Copiar enlace).</li></ul>
  <h3>Créditos técnicos</h3>
  <p>Gráficos 3D con <a href="https://threejs.org" target="_blank" rel="noopener">Three.js</a> r147 y OrbitControls (licencia MIT, © three.js authors), incrustados en este archivo. Modelo, interfaz y contenidos creados con asistencia de Claude (Anthropic).</p>`,'Acerca de');}

/* ---------- menú ⋯ ---------- */
function toggleMenu(open){const m=$('#menu');const o=open===undefined?!m.classList.contains('open'):open;m.classList.toggle('open',o);$('#btnMore').setAttribute('aria-expanded',o);}
function initMenu(){
  $('#btnMore').onclick=e=>{e.stopPropagation();toggleMenu();};
  document.addEventListener('click',e=>{if(!e.target.closest('#menu'))toggleMenu(false);});
  $('#mAbout').onclick=()=>{toggleMenu(false);showAbout();};
  $('#mShare').onclick=()=>{toggleMenu(false);shareLink();};
  $('#mShot').onclick=()=>{toggleMenu(false);takeScreenshot();};
  $('#mPrint').onclick=()=>{toggleMenu(false);if(state.selected)printInfo(state.selected);else printAll();};
  $('#mPrintAll').onclick=()=>{toggleMenu(false);printAll();};
  $('#mTheme').onclick=()=>{toggleMenu(false);toggleTheme();};
}

/* ---------- tema ---------- */
function applyTheme(t){document.documentElement.dataset.theme=t;$('#mTheme').textContent=t==='light'?'Tema oscuro':'Tema claro';try{localStorage.setItem('atlas.theme',t);}catch(e){}}
function toggleTheme(){applyTheme(document.documentElement.dataset.theme==='light'?'dark':'light');}
function initTheme(){let t='dark';try{t=localStorage.getItem('atlas.theme')||(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');}catch(e){} applyTheme(t);}

/* ---------- compartir: estado en el hash ---------- */
let hashBusy=false;
function updateHash(){
  if(hashBusy||!window.__ready) return;
  const q=[]; if(state.selected) q.push('s='+state.selected.id);
  if(state.explodeT) q.push('x='+Math.round(state.explodeT*100));
  if(state.cortexOp<1) q.push('o='+Math.round(state.cortexOp*100));
  if(state.hemi!=='both') q.push('h='+state.hemi);
  if(state.cut!=='none') q.push('c='+state.cut+','+state.cutPos+(state.cutFlip?',f':''));
  const vis=PARTS.filter(p=>(p.overlay||p.surco)&&p.visible).map(p=>p.id); if(vis.length&&vis.length<12) q.push('v='+vis.join('.'));
  if(state.labels) q.push('l=1'); if(state.real) q.push('r=1');
  const cp=camera.position, ct=controls.target; q.push('cam='+[cp.x,cp.y,cp.z,ct.x,ct.y,ct.z].map(n=>n.toFixed(2)).join(','));
  history.replaceState(null,'',location.pathname+location.search+(q.length?'#'+q.join('&'):''));
}
function restoreHash(){
  const h=location.hash.slice(1); if(!h) return false;
  hashBusy=true; const P=new URLSearchParams(h);
  if(P.get('x')) setExplode(clamp(+P.get('x'),0,100)/100);
  if(P.get('o')) setCortexOp(clamp(+P.get('o'),4,100)/100);
  if(P.get('h')&&['L','R','both'].includes(P.get('h'))){state.hemi=P.get('h');syncHemi();}
  if(P.get('c')){const [m,pos,f]=P.get('c').split(',');if(['sag','cor','axi'].includes(m)){state.cut=m;state.cutPos=clamp(+pos||0,-100,100);state.cutFlip=f==='f';syncCutUI();}}
  if(P.get('v')) P.get('v').split('.').forEach(id=>{if(PART[id])PART[id].visible=true;});
  if(P.get('l')){state.labels=true;$('#tLabels').checked=true;}
  if(P.get('r')){state.real=true;$('#tReal').checked=true;}
  applyStateNow();
  if(P.get('cam')){const v=P.get('cam').split(',').map(Number);if(v.length===6&&v.every(n=>isFinite(n))){camera.position.set(v[0],v[1],v[2]);controls.target.set(v[3],v[4],v[5]);}}
  if(P.get('s')&&PART[P.get('s')]){state.explode=state.explodeT;select(PART[P.get('s')],{focus:!P.get('cam'),source:'hash'});}
  hashBusy=false; return true;
}
function shareLink(){
  updateHash();
  const url=location.href;
  const done=()=>toast('Enlace copiado. Pégalo para compartir exactamente esta vista.');
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done,()=>prompt('Copia este enlace:',url));
  else prompt('Copia este enlace:',url);
}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.remove('hidden');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.add('hidden'),3200);}

/* ---------- captura PNG ---------- */
function takeScreenshot(){
  const src=screenshotDataURL(); const img=new Image();
  img.onload=()=>{
    const c=document.createElement('canvas'); c.width=img.width; c.height=img.height; const g=c.getContext('2d');
    const light=document.documentElement.dataset.theme==='light';
    g.fillStyle=light?'#eef2fb':'#0b1020'; g.fillRect(0,0,c.width,c.height); g.drawImage(img,0,0);
    const sc=c.width/canvas.clientWidth;
    if(state.labels){ g.font=`${Math.round(12*sc)}px system-ui,sans-serif`; g.textAlign='center';
      for(const p of PARTS){const el=p.labelEl; if(!el||el.style.opacity!=='1') continue; const m=/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(el.style.transform); if(!m) continue;
        const x=+m[1]*sc, y=(+m[2]-14)*sc, txt=p.name, w=g.measureText(txt).width+16*sc;
        g.fillStyle='rgba(10,14,26,.75)'; g.fillRect(x-w/2,y-13*sc,w,18*sc); g.fillStyle='#fff'; g.fillText(txt,x,y);} }
    const title=state.selected?state.selected.name:'Atlas 3D del Cerebro';
    g.font=`bold ${Math.round(18*sc)}px system-ui,sans-serif`; g.textAlign='left'; g.fillStyle=light?'#1a2238':'#fff'; g.fillText(title,16*sc,c.height-16*sc);
    const a=document.createElement('a'); a.download=('cerebro-'+norm(title).replace(/[^a-z0-9]+/g,'-')+'.png'); a.href=c.toDataURL('image/png'); a.click();
    toast('Captura descargada.');
  };
  img.src=src;
}

/* ---------- impresión ---------- */
function fichaHTML(p){
  const I=p.info;
  return `<article class="pf"><h2>${esc(p.name)}</h2><p class="alias">${I.alias||''} · ${esc(p.group.name)}</p>
    <p>${I.desc||''}</p>${I.ubic?`<h4>Ubicación</h4><p>${I.ubic}</p>`:''}
    ${I.fun?`<h4>Funciones</h4><ul>${I.fun.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}
    ${I.psi?`<h4>Relevancia en psicología</h4><ul>${I.psi.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}
    ${I.lesion?`<h4>Lesión → síntoma</h4><table class="lesion">${I.lesion.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('')}</table>`:''}
    ${I.conex?`<h4>Conexiones</h4><p>${I.conex}</p>`:''}${I.nt?`<h4>Neurotransmisores</h4><p>${I.nt}</p>`:''}
    ${I.tests?`<h4>Pruebas</h4><p>${I.tests.join(' · ')}</p>`:''}
    ${I.dato?`<p class="tip"><b>Para recordar:</b> ${I.dato}</p>`:''}${refLine(I).replace('<h3>','<h4>').replace('</h3>','</h4>')}</article>`;
}
function printInfo(p){ $('#printArea').innerHTML=`<h1>Atlas 3D del Cerebro · ficha</h1>${fichaHTML(p)}`; document.body.classList.add('printing'); window.print(); setTimeout(()=>document.body.classList.remove('printing'),500); }
function printAll(){
  const groups=GROUPS.filter(g=>g.id!=='brodmann').map(g=>`<h1 class="pg">${esc(g.name)}</h1>`+PARTS.filter(p=>p.g===g.id).map(fichaHTML).join('')).join('');
  $('#printArea').innerHTML=`<h1>Atlas 3D del Cerebro · resumen de estudio</h1><p class="nota">${PARTS.filter(p=>!p.ba).length} fichas. Generado el ${new Date().toLocaleDateString('es')}.</p>${groups}
    <h1 class="pg">Glosario</h1><table class="terms">${GLOSSARY.map(t=>`<tr><td>${t[0]}</td><td>${t[1]}</td></tr>`).join('')}</table>`;
  document.body.classList.add('printing'); window.print(); setTimeout(()=>document.body.classList.remove('printing'),500);
}

/* ---------- registro en la escena ---------- */
hooks.onStateApplied=refreshList;
hooks.insets=()=>{
  const w=window.innerWidth,h=window.innerHeight;
  if(isMobile()){const T=$('#topnav').getBoundingClientRect().bottom,B=$('#dock').getBoundingClientRect().top;return {left:0,right:w,top:T,bottom:B};}
  const L=$('#left').getBoundingClientRect().right,R=$('#right').getBoundingClientRect().left,T=$('#topnav').getBoundingClientRect().bottom,B=$('#dock').getBoundingClientRect().top;
  return {left:L,right:R,top:T,bottom:B};
};
hooks.onFrame=(now,active)=>{ processHover(now); updateLabels(now); updateCompass(); if(active&&window.__ready&&!camTween&&!hashBusy) hashDirty=true; };
let hashDirty=false;
setInterval(()=>{if(hashDirty&&!camTween){hashDirty=false;updateHash();}},1500);

function initUI(){
  initCompass(); initDock(); initDrawers(); initPointer(); initKeys(); initModal(); initMenu(); initTheme();
  $('#search').oninput=runSearch;
  $('#search').onkeydown=e=>{if(e.key==='Enter'){const f=runSearch();if(f){f.visible=true;select(f,{focus:true,source:'list'});closeDrawers();}}};
  $('#searchClear').onclick=()=>{$('#search').value='';runSearch();$('#search').focus();};
  $('#showAll').onclick=showAllParts;
  $('#btnGuide').onclick=showGuide; $('#btnGlossary').onclick=()=>showGlossary(); $('#btnReset').onclick=()=>resetAll();
  $('#btnTours').onclick=showTourMenu; $('#btnQuiz').onclick=()=>{ if(state.quiz) exitQuiz(); else showQuizMenu(); };
  window.addEventListener('resize',resize);
}
