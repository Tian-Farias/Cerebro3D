/* =====================================================================
   ARRANQUE
   ===================================================================== */
const BUILD_DATE='@@BUILD@@';
window.__ready=false;
function fail(msg){
  const l=$('#loading'); if(!l) return;
  l.querySelector('.spinner').style.display='none';
  $('#loadMsg').innerHTML=msg;
  $('#loadBar').style.display='none';
}
async function init(){
  try{ createScene(); }
  catch(err){ console.error(err); fail('No se ha podido iniciar el motor 3D (WebGL).<br>Prueba con otro navegador (Chrome, Firefox, Edge o Safari actualizados) o activa la aceleración por hardware.'); return; }
  initUI(); resize(); buildList(); buildLabels();
  const bar=$('#loadBar div'), msg=$('#loadMsg');
  const progress=(text,f)=>{ if(text) msg.textContent=text; if(f!==undefined) bar.style.width=Math.round(f*100)+'%'; };
  try{ await buildAll(progress); }
  catch(err){ console.error(err); fail('Error al construir el modelo: '+esc(err.message)+'.<br>Prueba a abrirlo con <code>?calidad=baja</code> al final de la dirección.'); return; }
  applyStateNow(); showWelcome(); syncHemi(); syncCutUI();
  $('#loading').remove();
  window.__ready=true;
  restoreHash();
  let welcomed=false; try{welcomed=localStorage.getItem('atlas.welcomed')==='1';}catch(e){}
  if(!welcomed&&!new URLSearchParams(location.search).has('sinaviso')) showDemoWelcome();
  requestAnimationFrame(animate);
  window.__atlas={state,PART,PARTS,meshes,setView,select,applyState,applyStateNow,setExplode,setCortexOp,setCut,camera,controls,startTour,TOURS,startQuiz,exitQuiz,resetAll,CASES,focusParts};
}
init();
