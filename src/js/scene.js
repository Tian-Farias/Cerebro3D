/* =====================================================================
   ESCENA 3D: renderer, construcción del modelo, estado visual, selección y cámara
   ===================================================================== */
const canvas=document.getElementById('view');
const hooks={};                    // la interfaz registra aquí sus callbacks (onStateApplied, onFrame, insets)
let renderer, scene, camera, controls, cutPlane;
let needsRender=true, idsDirty=true;
const requestRender=()=>{needsRender=true;};

const PART={}; PARTS.forEach(p=>{PART[p.id]=p;p.meshes=[];p.visible=!(p.overlay||p.surco);p.extract=0;p.extractT=0;p.info=INFO[p.id]||{};p.group=GROUPS.find(g=>g.id===p.g);});
const meshes=[];
const HOME_POS=new THREE.Vector3(-2.55,0.95,2.15), HOME_TGT=new THREE.Vector3(0,-0.08,0);

const EXPLODE={
  frontal:[0.36,0.22,0.6], parietal:[0.36,0.5,-0.2], temporal:[0.6,-0.3,0.08], occipital:[0.32,0.15,-0.66],
  insula:[0.5,-0.04,0.18], cingulado:[0.17,0.26,0.02],
  calloso:[0,0.42,0], ventriculos:[0.1,0.22,0], caudado:[0.16,0.26,0.12], putamen:[0.4,0.03,0.14], palido:[0.28,-0.05,0.06],
  accumbens:[0.13,-0.14,0.34], negra:[0.16,-0.24,0.0], talamo:[0.08,0.06,-0.09], hipotalamo:[0,-0.12,0.2], mamilares:[0.03,-0.2,0.08],
  hipofisis:[0,-0.34,0.3], pineal:[0,0.14,-0.32], hipocampo:[0.3,-0.24,-0.16], amigdala:[0.38,-0.24,0.22], fornix:[0.05,0.16,-0.1],
  optico:[0,-0.26,0.32], olfatorio:[0.04,-0.16,0.46], mesencefalo:[0,-0.32,0], protuberancia:[0,-0.48,0.12], bulbo:[0,-0.62,0.0],
  medula:[0,-0.8,0], cerebelo:[0,-0.44,-0.58],
  septales:[0.06,-0.02,0.3], subtalamico:[0.2,-0.12,-0.04], atv:[0.06,-0.3,0.02], locus:[0.1,-0.4,-0.22], rafe:[0,-0.5,-0.26],
  capsula:[0.3,0.1,0.08], arqueado:[0.55,0.05,0]
};

const state={explode:0,explodeT:0,cortexOp:1,hemi:'both',real:false,labels:false,
  isolate:null, ghost:null, ghostSrc:null, forced:null, quizForced:null,
  selected:null, hover:null, cut:'none', cutPos:0, cutFlip:false, quiz:null, tour:null, reduced:false};

/* ---------- renderer ---------- */
function createScene(){
  THREE.ColorManagement.legacyMode=false;   // los colores hex se interpretan como sRGB
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputEncoding=THREE.sRGBEncoding;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.25;
  renderer.setClearColor(0x000000,0);
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(38,1,0.01,100);
  camera.position.copy(HOME_POS);
  scene.add(camera);
  controls=new THREE.OrbitControls(camera,canvas);
  controls.target.copy(HOME_TGT);
  controls.enableDamping=true;controls.dampingFactor=0.08;controls.minDistance=0.35;controls.maxDistance=9;
  controls.rotateSpeed=0.8;controls.autoRotateSpeed=1.2;controls.keyPanSpeed=12;
  controls.listenToKeyEvents(window);
  controls.addEventListener('change',()=>{needsRender=true;idsDirty=true;});
  scene.add(new THREE.HemisphereLight(0xe8eeff,0x2a2236,0.55));
  const key=new THREE.DirectionalLight(0xffffff,0.95);key.position.set(1.2,1.8,2.5);camera.add(key);
  const fill=new THREE.DirectionalLight(0xbfd0ff,0.35);fill.position.set(-2.5,-0.5,1);camera.add(fill);
  const rim=new THREE.DirectionalLight(0xffe2cc,0.45);rim.position.set(0,2,-3);scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff,0.12));
  cutPlane=new THREE.Plane(new THREE.Vector3(1,0,0),0);
  state.reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ---------- materiales ---------- */
const _white=new THREE.Color(1,1,1);
function makeMaterial(part,opt){
  const m=new THREE.MeshStandardMaterial({color:new THREE.Color(part.color),roughness:opt.rough??0.62,metalness:0,
    vertexColors:!!opt.vc,side:opt.front?THREE.FrontSide:THREE.DoubleSide});
  m.userData.inner={value:new THREE.Color()};
  m.onBeforeCompile=sh=>{  // las caras internas (cortes, piezas separadas) se pintan planas con el color del interior
    sh.uniforms.innerColor=m.userData.inner;
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 innerColor;')
      .replace('#include <output_fragment>','#include <output_fragment>\n\tif(!gl_FrontFacing){gl_FragColor=vec4(innerColor,diffuseColor.a);}');
  };
  if(part.overlay){m.polygonOffset=true;m.polygonOffsetFactor=part.po;m.polygonOffsetUnits=part.po*2;m.roughness=0.5;}
  if(part.surco){m.roughness=0.35;m.emissive.set(0x222222);}
  return m;
}
function centerOf(g,idx){
  const P=g.attributes.position.array, c=new THREE.Vector3(); let n=0;
  const I=idx||g.index.array; const step=Math.max(1,Math.floor(I.length/6000));
  for(let i=0;i<I.length;i+=step){const k=I[i]*3;c.x+=P[k];c.y+=P[k+1];c.z+=P[k+2];n++;}
  return c.multiplyScalar(1/n);
}
function radiusOf(g,c,idx){
  const P=g.attributes.position.array, I=idx||g.index.array; let r=0; const step=Math.max(1,Math.floor(I.length/4000));
  for(let i=0;i<I.length;i+=step){const k=I[i]*3;r=Math.max(r,Math.hypot(P[k]-c.x,P[k+1]-c.y,P[k+2]-c.z));}
  return r;
}
function surfaceAnchor(g,idx,from,c){
  const P=g.attributes.position.array, dir=c.clone().sub(from).normalize(); let best=-1e9,bi=0;
  for(let i=0;i<idx.length;i+=3){const k=idx[i]*3;const d=(P[k]-from.x)*dir.x+(P[k+1]-from.y)*dir.y+(P[k+2]-from.z)*dir.z;if(d>best){best=d;bi=k;}}
  return new THREE.Vector3(P[bi],P[bi+1],P[bi+2]);
}
function addMesh(partId,geo,side,opt={}){
  const part=PART[partId]; if(!part) throw new Error('Parte desconocida: '+partId);
  const mat=makeMaterial(part,opt), m=new THREE.Mesh(geo,mat);
  const id=meshes.length, idx=geo.index.array;
  const center=opt.center||centerOf(geo,idx);
  const ev=opt.offset||EXPLODE[partId]||[0,0,0];
  const sx=side==='L'?-1:1;
  m.userData={part,side,id,center,radius:opt.radius||radiusOf(geo,center,idx),anchor:opt.anchor||center.clone(),
    offset:part.overlay?new THREE.Vector3():new THREE.Vector3(ev[0]*sx,ev[1],ev[2]),carrier:false};
  const pm=new THREE.MeshBasicMaterial({side:THREE.DoubleSide,toneMapped:false});
  pm.color.setRGB(((id+1)>>16&255)/255,((id+1)>>8&255)/255,((id+1)&255)/255);
  if(part.overlay){pm.polygonOffset=true;pm.polygonOffsetFactor=part.po;pm.polygonOffsetUnits=part.po*2;}
  m.userData.pickMat=pm;
  m.renderOrder=part.overlay?2:(part.alpha?1:0);
  m.frustumCulled=!!opt.cull;
  meshes.push(m);part.meshes.push(m);
  (opt.parent||scene).add(m);
  return m;
}

/* ---------- hemisferios ---------- */
const tick=()=>new Promise(r=>setTimeout(r,0));
async function buildHemisphere(side,detail,progress){
  const ico=getIco(detail), n=ico.n, base=new Float32Array(n*3), tmp=[0,0,0];
  for(let i=0;i<n;i++){hemiShape(ico.pos[i*3],ico.pos[i*3+1],ico.pos[i*3+2],tmp);base[i*3]=tmp[0]*side;base[i*3+1]=tmp[1];base[i*3+2]=tmp[2];}
  let idx=ico.idx;
  if(side<0){idx=idx.slice();for(let i=0;i<idx.length;i+=3){const t=idx[i+1];idx[i+1]=idx[i+2];idx[i+2]=t;}}
  const pos=base.slice(), g=indexedGeo(pos,idx,null), N=g.attributes.normal.array, col=new Float32Array(n*3);
  const CH=12000;
  for(let i=0;i<n;i++){
    const r=cortexRelief(base[i*3],base[i*3+1],base[i*3+2]);
    pos[i*3]+=N[i*3]*r[0];pos[i*3+1]+=N[i*3+1]*r[0];pos[i*3+2]+=N[i*3+2]*r[0];col[i*3]=col[i*3+1]=col[i*3+2]=r[1];
    if(i%CH===CH-1){progress(i/n);await tick();}
  }
  g.attributes.position.needsUpdate=true; g.computeVertexNormals();
  const colAttr=new THREE.BufferAttribute(col,3);
  const lobes={}, regions={};
  for(let i=0;i<idx.length;i+=3){
    const a=idx[i]*3,b=idx[i+1]*3,c=idx[i+2]*3;
    const x=Math.abs(base[a]+base[b]+base[c])/3,y=(base[a+1]+base[b+1]+base[c+1])/3,z=(base[a+2]+base[b+2]+base[c+2])/3;
    const dc=dCS(x,y,z), ds=dSY(x,y,z), dz=dZO(x,y,z);
    const lobe=classifyLobe(x,y,z,dc,ds,dz); if(!lobe) continue;
    (lobes[lobe]||(lobes[lobe]=[])).push(idx[i],idx[i+1],idx[i+2]);
    for(const k of regionsOf(lobe,x,y,z,side,dc,ds)){
      if(!PART[k]) continue;
      if(!PART[k].par && side>0) continue;            // Broca/Wernicke: solo hemisferio izquierdo
      (regions[k]||(regions[k]={lobe,list:[]})).list.push(idx[i],idx[i+1],idx[i+2]);
    }
  }
  const sd=side>0?'R':'L', hc=new THREE.Vector3(0.3*side,0.05,0), lobeMesh={};
  const sub=(list)=>{const sg=new THREE.BufferGeometry();sg.setAttribute('position',g.attributes.position);sg.setAttribute('normal',g.attributes.normal);sg.setAttribute('color',colAttr);const ia=Uint32Array.from(list);sg.setIndex(new THREE.BufferAttribute(ia,1));return [sg,ia];};
  for(const id in lobes){
    const [sg,ia]=sub(lobes[id]); const c=centerOf(sg,ia); const r=radiusOf(sg,c,ia);
    sg.boundingSphere=new THREE.Sphere(c.clone(),r*1.05);
    lobeMesh[id]=addMesh(id,sg,sd,{vc:true,center:c,radius:r,anchor:surfaceAnchor(sg,ia,hc,c),cull:true});
  }
  for(const id in regions){
    const [sg,ia]=sub(regions[id].list); const c=centerOf(sg,ia); const r=radiusOf(sg,c,ia);
    sg.boundingSphere=new THREE.Sphere(c.clone(),r*1.05);
    const parent=lobeMesh[regions[id].lobe]; if(!parent) continue;
    addMesh(id,sg,sd,{vc:true,front:true,center:c,radius:r,anchor:surfaceAnchor(sg,ia,hc,c),parent,cull:true});
  }
  // surcos de referencia: tubos finos trazados sobre la superficie
  for(const id in SULCI){
    const pts=sampleSulcus(SULCI[id],base,n,side); if(pts.length<3) continue;
    for(const p of pts){const d=new THREE.Vector3(p[0]-hc.x,p[1]-hc.y,p[2]-hc.z).normalize();p[0]+=d.x*0.012;p[1]+=d.y*0.012;p[2]+=d.z*0.012;}
    const geo=tube(pts,()=>[0.009,0.009],{segs:Math.max(16,pts.length*3),rad:10});
    addMesh(id,geo,sd,{rough:0.3});
  }
  progress(1);
}

/* ---------- estructuras profundas ---------- */
function buildDeep(){
  const gyriBlob=(f,a)=>(x,y,z)=>{const n=noise3(x*f,y*f,z*f);const c=smoothstep(0,0.32,Math.abs(n));return[a*(c-1),0.5+0.5*c];};
  for(const s of [1,-1]){
    const sd=s>0?'R':'L', M=s<0, X=p=>p.map(q=>[q[0]*s,q[1],q[2]]);
    addMesh('insula',blob(ell(0.5,-0.02,0.08,0.035,0.105,0.165,(dx,dy,dz,x,y,z)=>[x-0.04*dz*dz,y*(1-0.25*Math.max(0,dz)),z]),{mirror:M,detail:5,relief:gyriBlob(16,0.012)}),sd,{vc:true});
    addMesh('talamo',blob(ell(0.075,0.04,-0.07,0.066,0.07,0.135,(dx,dy,dz,x,y,z)=>[x+0.045*smoothstep(0,-1,dz)-0.012*dz,y-0.02*dz*dz,z]),{mirror:M}),sd);
    addMesh('hipocampo',tube(X([[0.27,-0.215,0.13],[0.29,-0.19,0.02],[0.28,-0.16,-0.1],[0.25,-0.1,-0.2],[0.2,-0.035,-0.27]]),
      t=>{const r=mix(0.05,0.019,smoothstep(0,1,t));return[r,r*0.72];},{ref:[1,0,0],relief:(x,y,z)=>{const d=0.006*Math.sin(z*90);return[-Math.abs(d)*smoothstep(0.0,0.1,z),1-6*Math.abs(d)*smoothstep(0,0.1,z)];}}),sd,{vc:true});
    addMesh('amigdala',blob(ell(0.27,-0.175,0.215,0.042,0.04,0.052),{mirror:M}),sd);
    addMesh('fornix',tube(X([[0.2,-0.035,-0.27],[0.13,0.08,-0.25],[0.065,0.15,-0.17],[0.03,0.172,-0.05],[0.024,0.145,0.06],[0.02,0.06,0.1],[0.018,-0.05,0.05],[0.018,-0.105,0.0]]),
      t=>{const r=0.012+0.006*Math.sin(t*Math.PI);return[r,r*0.75];},{ref:[0,1,0]}),sd);
    addMesh('mamilares',blob(ell(0.019,-0.125,-0.012,0.018,0.018,0.018),{mirror:M,detail:3}),sd);
    addMesh('septales',blob(ell(0.025,-0.015,0.19,0.02,0.03,0.026),{mirror:M,detail:3}),sd);
    addMesh('caudado',tube(X([[0.12,0.075,0.3],[0.135,0.13,0.2],[0.155,0.175,0.06],[0.175,0.175,-0.08],[0.205,0.14,-0.2],[0.255,0.05,-0.275],[0.305,-0.045,-0.24],[0.33,-0.08,-0.12],[0.335,-0.09,-0.02]]),
      t=>{const r=mix(0.066,0.011,smoothstep(0,0.62,t));return[r,r*0.85];},{ref:[1,0,0],segs:110}),sd);
    addMesh('putamen',blob(ell(0.255,0.02,0.09,0.046,0.11,0.165,(dx,dy,dz,x,y,z)=>[x+0.02*(1-dy*dy)*(dx>0?1:0.3),y-0.03*dz,z]),{mirror:M}),sd);
    addMesh('palido',blob(ell(0.195,0.0,0.06,0.03,0.074,0.092,(dx,dy,dz,x,y,z)=>[x-0.012*dx*dx,y,z]),{mirror:M}),sd);
    addMesh('capsula',blob(ell(0.165,0.03,0.04,0.011,0.12,0.19,(dx,dy,dz,x,y,z)=>[x+0.035*dz*dz-0.01*dy,y+0.02*dz,z]),{mirror:M,detail:4}),sd);
    addMesh('accumbens',blob(ell(0.095,-0.065,0.25,0.04,0.034,0.046),{mirror:M,detail:3}),sd);
    addMesh('subtalamico',blob(ell(0.105,-0.085,-0.03,0.036,0.015,0.03,(dx,dy,dz,x,y,z)=>[x,y+0.012*dx,z]),{mirror:M,detail:3}),sd);
    addMesh('negra',blob(ell(0.058,-0.14,-0.065,0.052,0.013,0.03,(dx,dy,dz,x,y,z)=>[x,y-0.02*Math.abs(dx),z-0.02*dx*dx]),{mirror:M,detail:3}),sd);
    addMesh('atv',blob(ell(0.02,-0.148,-0.04,0.018,0.012,0.03),{mirror:M,detail:3}),sd);
    addMesh('locus',blob(ell(0.035,-0.285,-0.165,0.011,0.02,0.011),{mirror:M,detail:3}),sd);
    addMesh('ventriculos',tube(X([[0.07,0.1,0.27],[0.08,0.16,0.15],[0.09,0.19,0.0],[0.11,0.18,-0.14],[0.16,0.13,-0.26],[0.23,0.05,-0.3],[0.29,-0.05,-0.22],[0.32,-0.1,-0.08],[0.32,-0.12,0.04]]),
      t=>{const w=0.045-0.02*smoothstep(0.5,1,t);return[w,0.018+0.006*Math.sin(t*Math.PI)];},{ref:[1,0,0],segs:110}),sd);
    addMesh('ventriculos',tube(X([[0.16,0.13,-0.26],[0.17,0.105,-0.36],[0.155,0.08,-0.45]]),t=>[0.028*(1-0.5*t),0.018*(1-0.4*t)],{ref:[1,0,0]}),sd);
    addMesh('olfatorio',tube(X([[0.07,-0.175,0.3],[0.075,-0.195,0.48],[0.078,-0.205,0.64]]),t=>{const r=0.011+0.014*smoothstep(0.68,0.95,t);return[r,r*0.7];},{ref:[1,0,0]}),sd);
    addMesh('optico',tube([[0.03*s,-0.142,0.165],[0.08*s,-0.155,0.3],[0.115*s,-0.18,0.45],[0.14*s,-0.21,0.56]],()=>[0.016,0.013],{ref:[0,1,0]}),sd);
    addMesh('optico',tube([[0.03*s,-0.142,0.135],[0.09*s,-0.12,0.06],[0.14*s,-0.085,-0.04],[0.16*s,-0.045,-0.12]],()=>[0.014,0.01],{ref:[0,1,0]}),sd);
  }
  // fascículo arqueado: solo hemisferio izquierdo, bajo la corteza
  addMesh('arqueado',tube([[-0.5,-0.07,-0.37],[-0.5,0.06,-0.3],[-0.49,0.13,-0.12],[-0.49,0.12,0.08],[-0.5,0.03,0.26],[-0.52,-0.04,0.34]],t=>[0.016,0.012],{ref:[1,0,0],segs:60}),'L');
  // Línea media
  addMesh('calloso',tube([[0,0.0,0.27],[0,0.09,0.36],[0,0.19,0.345],[0,0.25,0.2],[0,0.275,0.02],[0,0.27,-0.16],[0,0.235,-0.31],[0,0.155,-0.39],[0,0.085,-0.355]],
    t=>[0.17*(0.75+0.25*Math.sin(t*Math.PI)),0.028+0.022*gauss(t-0.12,0.1)+0.034*gauss(t-0.87,0.09)],{ref:[1,0,0],segs:140,rad:36}),'M');
  addMesh('ventriculos',blob(ell(0,0.02,-0.03,0.012,0.075,0.11)),'M',{offset:[0,0.05,0]});
  addMesh('ventriculos',blob(ell(0,-0.38,-0.215,0.055,0.065,0.022)),'M',{offset:[0,-0.48,-0.3]});
  addMesh('hipotalamo',blob(ell(0,-0.08,0.06,0.062,0.048,0.075,(dx,dy,dz,x,y,z)=>[x,y-0.02*Math.max(0,-dy),z])),'M');
  addMesh('optico',blob(ell(0,-0.142,0.15,0.05,0.012,0.026),{detail:3}),'M');
  addMesh('hipofisis',tube([[0,-0.11,0.08],[0,-0.18,0.11],[0,-0.235,0.12]],()=>[0.012,0.012]),'M');
  addMesh('hipofisis',blob(ell(0,-0.265,0.12,0.045,0.03,0.036)),'M');
  addMesh('pineal',blob(ell(0,0.03,-0.24,0.02,0.018,0.03,(dx,dy,dz,x,y,z)=>[x*(1-0.4*Math.max(0,-dz)),y*(1-0.4*Math.max(0,-dz)),z]),{detail:3}),'M');
  addMesh('mesencefalo',tube([[0,0.0,-0.135],[0,-0.13,-0.115],[0,-0.27,-0.095]],t=>[0.11-0.015*t,0.085],{ref:[1,0,0]}),'M');
  addMesh('protuberancia',blob(ell(0,-0.355,-0.07,0.15,0.105,0.115,(dx,dy,dz,x,y,z)=>[x,y,z+0.03*Math.max(0,dz)]),{detail:5,
    relief:(x,y,z)=>{const st=0.0025*Math.sin(y*260);return[st*smoothstep(-0.1,-0.02,z),1-0.25*Math.abs(Math.sin(y*260))*smoothstep(-0.1,-0.02,z)];}}),'M',{vc:true});
  addMesh('rafe',tube([[0,-0.07,-0.125],[0,-0.3,-0.115],[0,-0.56,-0.13]],t=>[0.011,0.011],{ref:[1,0,0]}),'M');
  addMesh('bulbo',tube([[0,-0.43,-0.11],[0,-0.55,-0.125],[0,-0.68,-0.135]],t=>[mix(0.095,0.064,t),mix(0.075,0.055,t)],{ref:[1,0,0]}),'M');
  addMesh('medula',tube([[0,-0.665,-0.135],[0,-0.85,-0.14],[0,-1.05,-0.142]],t=>[0.054-0.004*t,0.047-0.003*t],{ref:[1,0,0],cap1:false}),'M');
  const cb=blob((dx,dy,dz)=>{
    const pinch=Math.exp(-(dx/0.17)*(dx/0.17));
    let x=dx*0.5,y=dy*0.215,z=dz*0.31;
    z*=1-0.13*pinch*(dz<0?1:0.25); y*=1-0.08*pinch;
    const front=smoothstep(0.15,0.9,dz)*Math.exp(-(dx/0.42)*(dx/0.42)); z-=0.14*front;
    if(y>0)y*=0.82;
    return [x,-0.435+y,-0.5+z];
  },{detail:6,relief:(x,y,z)=>{
    const ly=y+0.43, lz=z+0.16, th=Math.atan2(ly,lz);
    const ph=th*44+1.4*noise3(x*3.5,y*3.5,z*3.5)+5*x*x;
    const gr=Math.pow(0.5+0.5*Math.cos(ph),9);
    const fiss=gauss(Math.abs(th)-3.0,0.05)+0.8*gauss(th-2.35,0.05);
    const verm=0.6*gauss(x,0.04)*smoothstep(-0.4,-0.6,z);
    return[-0.012*gr-0.03*Math.min(1,fiss)-0.02*verm, clamp(1-0.55*gr-0.5*fiss-0.4*verm,0.25,1)];
  }});
  addMesh('cerebelo',cb,'M',{vc:true});
}

async function buildAll(progress){
  const q=new URLSearchParams(location.search).get('calidad');
  const detail=q==='baja'?6:(q==='alta'?7:((window.innerWidth<800||(navigator.hardwareConcurrency||8)<=2)?6:7));
  progress('Modelando el hemisferio derecho…',0); await tick();
  await buildHemisphere(1,detail,f=>progress(null,f*0.45));
  progress('Modelando el hemisferio izquierdo…',0.45); await tick();
  await buildHemisphere(-1,detail,f=>progress(null,0.45+f*0.45));
  progress('Modelando las estructuras profundas…',0.9); await tick();
  buildDeep();
  progress('Listo',1);
}

/* =====================================================================
   ESTADO VISUAL
   ===================================================================== */
function effOpacity(m){
  const p=m.userData.part;
  let op=p.alpha||1;
  if(p.cortex) op=Math.min(op,state.cortexOp);
  if(p.overlay) op=Math.min(1,state.cortexOp*1.5);
  if(p.surco) op=0.9;
  if(state.ghost&&!state.ghost.has(p.id)) op=Math.min(op,p.cortex?0.07:0.1);
  if(m.userData.carrier) op=0.1;
  return op;
}
function isForced(id){return (state.forced&&state.forced.has(id))||(state.quizForced&&state.quizForced.has(id));}
function baseVisible(m){
  const u=m.userData,p=u.part;
  let v=p.visible||isForced(p.id);
  if(p.overlay&&state.ghost&&!state.ghost.has(p.id)) v=false;
  if(state.isolate&&!state.isolate.has(p.id)) v=false;
  if(u.side==='L'&&state.hemi==='R') v=false;
  if(u.side==='R'&&state.hemi==='L') v=false;
  return !!v;
}
function applyVisibility(){
  for(const m of meshes){m.userData.carrier=false;m.visible=baseVisible(m);}
  for(const m of meshes){ // un overlay visible necesita su lóbulo como soporte (translúcido si el lóbulo está oculto)
    if(m.userData.part.overlay&&m.visible&&m.parent&&m.parent.isMesh&&!m.parent.visible){
      const sideOk=!(m.userData.side==='L'&&state.hemi==='R')&&!(m.userData.side==='R'&&state.hemi==='L');
      if(sideOk){m.parent.visible=true;m.parent.userData.carrier=true;} else m.visible=false;
    }
  }
}
function applyMaterials(){
  for(const m of meshes){
    const p=m.userData.part, mat=m.material, op=effOpacity(m);
    mat.color.set(state.real&&p.real&&!p.overlay?p.real:p.color);
    const wm=p.cortex||p.id==='cerebelo';
    if(state.real) mat.userData.inner.value.set(wm?'#eadfce':(p.real||p.color)).multiplyScalar(wm?1:0.82);
    else mat.userData.inner.value.set(p.color).lerp(_white,wm?0.6:0.25).multiplyScalar(0.92);
    mat.opacity=op; mat.transparent=op<0.999; mat.depthWrite=op>0.5;
  }
  renderer.clippingPlanes=state.cut==='none'?[]:[cutPlane];
}
let applyQueued=false;
function applyState(){ // agrupa varias llamadas seguidas en una sola pasada
  if(applyQueued) return; applyQueued=true;
  queueMicrotask(()=>{applyQueued=false;applyVisibility();applyMaterials();updateCut();needsRender=true;idsDirty=true;if(hooks.onStateApplied)hooks.onStateApplied();});
}
function applyStateNow(){applyQueued=false;applyVisibility();applyMaterials();updateCut();needsRender=true;idsDirty=true;if(hooks.onStateApplied)hooks.onStateApplied();}
function pickable(m){
  if(!m.visible) return false;
  let o=m; while(o){ if(!o.visible) return false; o=o.parent; }
  return effOpacity(m)>=0.45;
}

/* ---------- plano de corte ---------- */
function updateCut(){
  const v=state.cutPos/100, f=state.cutFlip?-1:1;
  if(state.cut==='sag'){cutPlane.normal.set(f,0,0);cutPlane.constant=-f*v*0.75;}      // conserva el lado derecho (x ≥ pos) por defecto
  else if(state.cut==='cor'){cutPlane.normal.set(0,0,-f);cutPlane.constant=f*v*0.95;}  // conserva la mitad posterior por defecto
  else if(state.cut==='axi'){cutPlane.normal.set(0,-f,0);cutPlane.constant=f*(v*0.7+0.05);} // conserva la mitad inferior por defecto
  needsRender=true;idsDirty=true;
}
function cutFaceDir(){ // dirección desde la que se ve la cara cortada
  const f=state.cutFlip?-1:1;
  if(state.cut==='sag') return new THREE.Vector3(-f,0.15,0.1);
  if(state.cut==='cor') return new THREE.Vector3(0.1,0.15,f);
  if(state.cut==='axi') return new THREE.Vector3(0.1,f,0.1);
  return null;
}

/* =====================================================================
   SELECCIÓN POR BÚFER DE IDENTIFICADORES
   - clic: render de 1 px (exacto)
   - hover y etiquetas: búfer a 1/3 de resolución, actualizado solo cuando cambia la escena
   ===================================================================== */
let pickRT, pickPx=new Uint8Array(4), occRT=null, occBuf=null, occW=0, occH=0, lastOcc=0;
function renderIds(target){
  const saved=meshes.map(m=>m.material);
  for(const m of meshes){const pm=m.userData.pickMat; pm.visible=pickable(m); m.material=pm;}
  renderer.setRenderTarget(target); renderer.clear(); renderer.render(scene,camera); renderer.setRenderTarget(null);
  meshes.forEach((m,i)=>{m.material=saved[i];});
}
function pickAt(cx,cy){
  if(!pickRT) pickRT=new THREE.WebGLRenderTarget(1,1);
  const w=canvas.clientWidth,h=canvas.clientHeight;
  camera.setViewOffset(w,h,Math.floor(cx+viewOff.x),Math.floor(cy+viewOff.y),1,1);
  renderIds(pickRT);
  applyViewOffset();
  renderer.readRenderTargetPixels(pickRT,0,0,1,1,pickPx);
  const id=((pickPx[0]<<16)|(pickPx[1]<<8)|pickPx[2])-1;
  return id>=0&&id<meshes.length?meshes[id]:null;
}
function refreshOcclusion(){
  const w=Math.max(1,Math.ceil(canvas.clientWidth/3)),h=Math.max(1,Math.ceil(canvas.clientHeight/3));
  if(!occRT||occW!==w||occH!==h){if(occRT)occRT.dispose();occRT=new THREE.WebGLRenderTarget(w,h);occBuf=new Uint8Array(w*h*4);occW=w;occH=h;}
  renderIds(occRT);
  renderer.readRenderTargetPixels(occRT,0,0,w,h,occBuf);
  idsDirty=false; lastOcc=performance.now();
}
function ensureOcclusion(now){ if(idsDirty&&now-lastOcc>120) refreshOcclusion(); }
function idAt(sx,sy){ // coordenadas CSS → id de malla bajo el puntero (según el búfer de baja resolución)
  if(!occBuf) return -1;
  const x=Math.floor(sx/3),y=occH-1-Math.floor(sy/3);
  if(x<0||y<0||x>=occW||y>=occH) return -1;
  const k=(y*occW+x)*4; return ((occBuf[k]<<16)|(occBuf[k+1]<<8)|occBuf[k+2])-1;
}
function idsAround(sx,sy){
  const x=Math.floor(sx/3),y=occH-1-Math.floor(sy/3), found=new Set();
  if(!occBuf||x<0||y<0||x>=occW||y>=occH) return found;
  for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){const xx=clamp(x+ox,0,occW-1),yy=clamp(y+oy,0,occH-1),k=(yy*occW+xx)*4;found.add(((occBuf[k]<<16)|(occBuf[k+1]<<8)|occBuf[k+2])-1);}
  return found;
}

/* =====================================================================
   CÁMARA
   ===================================================================== */
let camTween=null;
const viewOff={x:0,y:0};
function applyViewOffset(){
  const w=canvas.clientWidth,h=canvas.clientHeight;
  if(viewOff.x||viewOff.y) camera.setViewOffset(w,h,viewOff.x,viewOff.y,w,h); else camera.clearViewOffset();
}
function resize(){
  const w=window.innerWidth,h=window.innerHeight;
  renderer.setSize(w,h,false); camera.aspect=w/h;
  camera.fov=w>=h?38:Math.min(72,2*Math.atan(Math.tan(19*Math.PI/180)*1.15/camera.aspect)*180/Math.PI);
  const ins=hooks.insets?hooks.insets():null;  // centrar el modelo en el hueco que dejan los paneles
  viewOff.x=ins?Math.round(w/2-(ins.left+ins.right)/2):0;
  viewOff.y=ins?Math.round(h/2-(ins.top+ins.bottom)/2):0;
  applyViewOffset(); camera.updateProjectionMatrix(); needsRender=true; idsDirty=true;
}
function tweenCamera(pos,target,dur=750){
  if(state.reduced) dur=1;
  camTween={t0:performance.now(),dur,p0:camera.position.clone(),q0:controls.target.clone(),p1:pos.clone(),q1:target.clone()};
  needsRender=true;
}
const _q=new THREE.Quaternion(), _q2=new THREE.Quaternion(), _d0=new THREE.Vector3(), _d1=new THREE.Vector3(), _dir=new THREE.Vector3(), _tg=new THREE.Vector3();
function stepCamera(now){
  if(!camTween) return false;
  const c=camTween; let k=clamp((now-c.t0)/c.dur,0,1); k=k<0.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
  _tg.copy(c.q0).lerp(c.q1,k);
  _d0.copy(c.p0).sub(c.q0); _d1.copy(c.p1).sub(c.q1);
  const l=mix(_d0.length(),_d1.length(),k); _d0.normalize(); _d1.normalize();
  if(_d0.dot(_d1)<-0.999) _dir.copy(_d0).applyAxisAngle(new THREE.Vector3(0,1,0),Math.PI*k);
  else{_q.setFromUnitVectors(_d0,_d1);_q2.identity().slerp(_q,k);_dir.copy(_d0).applyQuaternion(_q2);}
  controls.target.copy(_tg);camera.position.copy(_tg).addScaledVector(_dir,l);
  if(k>=1)camTween=null;
  return true;
}
const VIEWS={left:[-1,0.12,0],right:[1,0.12,0],front:[0,0.15,1],back:[0,0.15,-1],top:[0.0001,1,0.02],bottom:[0.0001,-1,0.06]};
function setView(name){
  const ex=1+0.6*state.explodeT;
  if(name==='medial'){state.hemi='R';applyState();tweenCamera(new THREE.Vector3(-3.2*ex,0.05,0),new THREE.Vector3(0.1,-0.08,0));return;}
  const d=new THREE.Vector3().fromArray(VIEWS[name]).normalize();
  const dist=(name==='top'||name==='bottom'?4.0:3.3)*ex;
  tweenCamera(HOME_TGT.clone().addScaledVector(d,dist),HOME_TGT.clone());
}
function lookAtCut(){
  const d=cutFaceDir(); if(!d) return;
  const dist=camera.position.distanceTo(controls.target);
  tweenCamera(HOME_TGT.clone().addScaledVector(d.normalize(),Math.max(2.6,dist)),HOME_TGT.clone());
}
function partWorldCenter(ids){
  const box=new THREE.Box3(); let any=false;
  for(const id of ids)for(const m of (PART[id]?PART[id].meshes:[])){ if(!m.visible&&!PART[id].overlay) continue;
    const c=m.localToWorld(m.userData.center.clone()), r=m.userData.radius;
    box.expandByPoint(c.clone().addScalar(r*0.6)); box.expandByPoint(c.clone().addScalar(-r*0.6)); any=true;}
  if(!any) for(const id of ids)for(const m of (PART[id]?PART[id].meshes:[])){const c=m.localToWorld(m.userData.center.clone());box.expandByPoint(c);any=true;}
  const c=new THREE.Vector3(),s=new THREE.Vector3(); box.getCenter(c); box.getSize(s);
  return {c,r:s.length()/2};
}
function focusParts(ids){
  const {c,r}=partWorldCenter(ids);
  const dir=camera.position.clone().sub(controls.target).normalize();
  const dist=clamp(r*4+0.95,1.35,4.2);
  tweenCamera(c.clone().addScaledVector(dir,dist),c);
}

/* =====================================================================
   FLECHAS DE FLUJO (recorridos)
   ===================================================================== */
const flow={group:null,curve:null,dots:[]};
function clearFlow(){ if(flow.group){scene.remove(flow.group);flow.group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});} flow.group=null;flow.curve=null;flow.dots=[]; needsRender=true; }
function setFlow(fromId,toId,color){
  clearFlow();
  if(!PART[fromId]||!PART[toId]) return;
  const a=partWorldCenter([fromId]).c, b=partWorldCenter([toId]).c;
  if(a.distanceTo(b)<0.02) return;
  const mid=a.clone().add(b).multiplyScalar(0.5);
  const out=mid.clone().sub(new THREE.Vector3(0,-0.05,0)); out.y+=0.001; out.normalize();
  const bulge=0.25+0.3*a.distanceTo(b);
  const c1=mid.clone().addScaledVector(out,bulge);
  const curve=new THREE.QuadraticBezierCurve3(a,c1,b);
  const g=new THREE.Group();
  const tubeGeo=new THREE.TubeGeometry(curve,40,0.008,8,false);
  const mat=new THREE.MeshBasicMaterial({color:color||'#ffffff',transparent:true,opacity:0.85,depthTest:false});
  g.add(new THREE.Mesh(tubeGeo,mat));
  const cone=new THREE.Mesh(new THREE.ConeGeometry(0.028,0.07,12),mat);
  const tEnd=0.97, pe=curve.getPoint(tEnd), tg=curve.getTangent(tEnd);
  cone.position.copy(pe); cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),tg.normalize());
  g.add(cone);
  for(let i=0;i<3;i++){const d=new THREE.Mesh(new THREE.SphereGeometry(0.016,10,10),new THREE.MeshBasicMaterial({color:'#fff6a0',depthTest:false}));g.add(d);flow.dots.push(d);}
  g.renderOrder=5; scene.add(g); flow.group=g; flow.curve=curve; needsRender=true;
}
function stepFlow(now){
  if(!flow.curve) return false;
  flow.dots.forEach((d,i)=>{const t=((now/1600)+i/3)%1;d.position.copy(flow.curve.getPoint(t));});
  return !state.reduced;
}

/* =====================================================================
   BUCLE PRINCIPAL (render a demanda)
   ===================================================================== */
let last=performance.now(), pulseUntil=0;
function pulse(){pulseUntil=performance.now()+(state.reduced?0:2500);needsRender=true;}
function animate(now){
  requestAnimationFrame(animate);
  const dt=Math.min(0.05,(now-last)/1000); last=now;
  let active=false;
  if(stepCamera(now)) active=true;
  if(controls.update()) active=true;
  if(controls.autoRotate) active=true;
  const k=1-Math.exp(-dt*7);
  const prevEx=state.explode;
  if(Math.abs(state.explodeT-state.explode)>1e-4){state.explode+=(state.explodeT-state.explode)*k;active=true;} else state.explode=state.explodeT;
  if(prevEx!==state.explode&&!camTween){ // mantener el encuadre mientras se separan las piezas
    const f=(1+0.6*state.explode)/(1+0.6*prevEx), o=camera.position.clone().sub(controls.target);
    camera.position.copy(controls.target).addScaledVector(o,f);
  }
  for(const p of PARTS){ if(Math.abs(p.extractT-p.extract)>1e-4){p.extract+=(p.extractT-p.extract)*k;active=true;} else p.extract=p.extractT; }
  for(const m of meshes){
    const u=m.userData; if(u.part.overlay) continue;
    const o=u.offset, len=o.length()||1, ex=u.part.extract;
    m.position.set(o.x*state.explode+o.x/len*0.55*ex, o.y*state.explode+o.y/len*0.55*ex, o.z*state.explode+o.z/len*0.55*ex);
  }
  if(stepFlow(now)) active=true;
  const pulsing=now<pulseUntil;
  const pv=pulsing?0.5+0.5*Math.sin(now/260):0.5;
  for(const m of meshes){
    const p=m.userData.part, e=m.material.emissive;
    if(p===state.selected) e.set(p.color).multiplyScalar(0.18+0.22*pv);
    else if(p===state.hover) e.setRGB(0.16,0.16,0.18);
    else if(p.surco) e.setRGB(0.13,0.13,0.13);
    else e.setRGB(0,0,0);
  }
  if(pulsing) active=true;
  if(active){needsRender=true;idsDirty=true;}
  if(needsRender){renderer.render(scene,camera);needsRender=false;}
  if(hooks.onFrame) hooks.onFrame(now,active);
}
function screenshotDataURL(){ renderer.render(scene,camera); return canvas.toDataURL('image/png'); }
