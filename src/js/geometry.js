/* =====================================================================
   UTILIDADES, RUIDO Y GEOMETRÍA ANATÓMICA
   Unidades ≈ 10 cm; +x derecha, +y superior, +z anterior
   ===================================================================== */
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const mix=(a,b,t)=>a+(b-a)*t;
const smoothstep=(e0,e1,x)=>{const t=clamp((x-e0)/(e1-e0),0,1);return t*t*(3-2*t);};
const gauss=(x,w)=>Math.exp(-(x*x)/(w*w));
function smin(a,b,k){const h=clamp(0.5+0.5*(b-a)/k,0,1);return mix(b,a,h)-k*h*(1-h);}
function smax(a,b,k){return -smin(-a,-b,k);}

const noise3 = (function(){
  const grad=[1,1,0,-1,1,0,1,-1,0,-1,-1,0,1,0,1,-1,0,1,1,0,-1,-1,0,-1,0,1,1,0,-1,1,0,1,-1,0,-1,-1];
  const perm=new Uint8Array(512), pm=new Uint8Array(512);
  let s=1337; const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};
  const p=[];for(let i=0;i<256;i++)p[i]=i;
  for(let i=255;i>0;i--){const j=Math.floor(rnd()*(i+1));[p[i],p[j]]=[p[j],p[i]];}
  for(let i=0;i<512;i++){perm[i]=p[i&255];pm[i]=perm[i]%12;}
  const F3=1/3,G3=1/6;
  return function(x,y,z){
    const s=(x+y+z)*F3,i=Math.floor(x+s),j=Math.floor(y+s),k=Math.floor(z+s);
    const t=(i+j+k)*G3,x0=x-(i-t),y0=y-(j-t),z0=z-(k-t);
    let i1,j1,k1,i2,j2,k2;
    if(x0>=y0){ if(y0>=z0){i1=1;j1=0;k1=0;i2=1;j2=1;k2=0;} else if(x0>=z0){i1=1;j1=0;k1=0;i2=1;j2=0;k2=1;} else {i1=0;j1=0;k1=1;i2=1;j2=0;k2=1;} }
    else { if(y0<z0){i1=0;j1=0;k1=1;i2=0;j2=1;k2=1;} else if(x0<z0){i1=0;j1=1;k1=0;i2=0;j2=1;k2=1;} else {i1=0;j1=1;k1=0;i2=1;j2=1;k2=0;} }
    const x1=x0-i1+G3,y1=y0-j1+G3,z1=z0-k1+G3,x2=x0-i2+2*G3,y2=y0-j2+2*G3,z2=z0-k2+2*G3,x3=x0-0.5,y3=y0-0.5,z3=z0-0.5;
    const ii=i&255,jj=j&255,kk=k&255;
    let n=0,tt,g;
    tt=0.6-x0*x0-y0*y0-z0*z0; if(tt>0){g=pm[ii+perm[jj+perm[kk]]]*3;tt*=tt;n+=tt*tt*(grad[g]*x0+grad[g+1]*y0+grad[g+2]*z0);}
    tt=0.6-x1*x1-y1*y1-z1*z1; if(tt>0){g=pm[ii+i1+perm[jj+j1+perm[kk+k1]]]*3;tt*=tt;n+=tt*tt*(grad[g]*x1+grad[g+1]*y1+grad[g+2]*z1);}
    tt=0.6-x2*x2-y2*y2-z2*z2; if(tt>0){g=pm[ii+i2+perm[jj+j2+perm[kk+k2]]]*3;tt*=tt;n+=tt*tt*(grad[g]*x2+grad[g+1]*y2+grad[g+2]*z2);}
    tt=0.6-x3*x3-y3*y3-z3*z3; if(tt>0){g=pm[ii+1+perm[jj+1+perm[kk+1]]]*3;tt*=tt;n+=tt*tt*(grad[g]*x3+grad[g+1]*y3+grad[g+2]*z3);}
    return 32*n;
  };
})();

/* Icosfera indexada (sin costuras) */
const icoCache={};
function getIco(detail){
  if(icoCache[detail]) return icoCache[detail];
  const t=(1+Math.sqrt(5))/2;
  const v0=[-1,t,0,1,t,0,-1,-t,0,1,-t,0,0,-1,t,0,1,t,0,-1,-t,0,1,-t,t,0,-1,t,0,1,-t,0,-1,-t,0,1];
  const f0=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];
  const total=10*Math.pow(4,detail)+2;
  const pos=new Float64Array(total*3);
  for(let i=0;i<12;i++){const x=v0[i*3],y=v0[i*3+1],z=v0[i*3+2],l=Math.hypot(x,y,z);pos[i*3]=x/l;pos[i*3+1]=y/l;pos[i*3+2]=z/l;}
  let nv=12, faces=Uint32Array.from(f0);
  for(let d=0;d<detail;d++){
    const cache=new Map(), nf=new Uint32Array(faces.length*4);
    const mid=(a,b)=>{const key=a<b?a*total+b:b*total+a;let m=cache.get(key);if(m!==undefined)return m;m=nv++;
      let x=pos[a*3]+pos[b*3],y=pos[a*3+1]+pos[b*3+1],z=pos[a*3+2]+pos[b*3+2];const l=Math.hypot(x,y,z);
      pos[m*3]=x/l;pos[m*3+1]=y/l;pos[m*3+2]=z/l;cache.set(key,m);return m;};
    let k=0;
    for(let i=0;i<faces.length;i+=3){
      const a=faces[i],b=faces[i+1],c=faces[i+2],ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);
      nf[k++]=a;nf[k++]=ab;nf[k++]=ca; nf[k++]=b;nf[k++]=bc;nf[k++]=ab;
      nf[k++]=c;nf[k++]=ca;nf[k++]=bc; nf[k++]=ab;nf[k++]=bc;nf[k++]=ca;
    }
    faces=nf;
  }
  return icoCache[detail]={pos:Float32Array.from(pos.subarray(0,nv*3)),idx:faces,n:nv};
}

/* ---------- forma del hemisferio y surcos principales ---------- */
const CS = y => 0.17 - 0.33*y;                              // surco central (z en función de la altura)
const SY = z => -0.115 + clamp(0.42 - z, 0, 0.8)*0.19;      // cisura lateral de Silvio (altura en función de z)
const ZO = y => -0.585 + 0.05*y;                            // surco parieto-occipital
// Distancias firmadas a los surcos principales, con ondulación natural (x = |x|)
const dCS=(x,y,z)=>{const a=Math.abs(x);return z-CS(y)-0.03*noise3(y*5.5+2.1,a*3+0.7,1.3)-0.011*noise3(y*14+3,a*9,4.2);};
const dSY=(x,y,z)=>{const a=Math.abs(x);return y-SY(z)-0.02*noise3(z*6+5.5,a*3,2.2)-0.008*noise3(z*15,a*8,6.1);};
const dZO=(x,y,z)=>{const a=Math.abs(x);return z-ZO(y)-0.035*noise3(y*5+8.1,a*4,3.3);};
const ECC = (y,z) => Math.hypot((y-0.1)/0.2, (z+0.04)/0.41);  // elipse alrededor del cuerpo calloso (cara medial)
const SFS = (z) => 0.30 - 0.06*smoothstep(0.1,0.6,z);        // surco frontal superior (altura)
const IFS = (z) => 0.13 - 0.05*smoothstep(0.1,0.6,z);        // surco frontal inferior
const STS = -0.10, ITS = -0.22;                              // surcos temporales (distancia a Silvio)

function hemiShape(dx,dy,dz,out){
  let lx=0.375*dx*(1-0.10*dz), ly=0.55*dy, lz=0.84*dz;
  if(ly>0) ly*=1-0.13*Math.max(0,dz)*Math.max(0,dz)+0.05*Math.max(0,-dz);
  lx=smax(lx,-0.276,0.04);                                // cara medial plana
  let x=0.288+lx, y=0.08+ly, z=lz;
  // abultamiento del lóbulo temporal hacia abajo
  const wT=smoothstep(0.52,0.28,z)*smoothstep(-0.66,-0.32,z);
  const lat=smoothstep(0.16,0.42,x), low=smoothstep(0.2,-0.5,dy);
  y-=0.11*wT*lat*low; x+=0.03*wT*lat*low;
  const notch=smoothstep(0.16,0.4,z)*gauss(y-SY(z)+0.01,0.055)*smoothstep(0.3,0.5,x);
  x-=0.075*notch;                                          // valle silviano entre polo temporal y lóbulo frontal
  // base del cerebro (fosa anterior, media y tentorio)
  const zf=smoothstep(0.32,0.52,z), zo=smoothstep(-0.38,-0.62,z);
  const floorLat=-0.39*(1-zf)*(1-zo)+(-0.11)*zf+(-0.17)*zo*(1-zf);
  let floorMed=mix(-0.15,-0.11,smoothstep(0.2,0.42,z)); floorMed=mix(floorMed,-0.17,zo);
  const fl=mix(floorMed,floorLat,smoothstep(0.13,0.3,x));
  if(y<fl){const tt=fl-y;y=fl-0.03*Math.log(1+tt/0.03);}
  out[0]=x;out[1]=y;out[2]=z;
}

// Relieve de giros y surcos: devuelve [desplazamiento, oclusión]
function cortexRelief(x,y,z){
  const ax=Math.abs(x);
  const ws=2.1, wa=0.075;
  const wx=noise3(x*ws+3.1,y*ws+1.7,z*ws+5.3)*wa, wy=noise3(x*ws+7.7,y*ws+9.2,z*ws+2.4)*wa, wz=noise3(x*ws+4.4,y*ws+6.6,z*ws+8.8)*wa;
  const f=5.4, qx=(x+wx)*f, qy=(y+wy)*f, qz=(z+wz)*f;
  const n=noise3(qx,qy,qz)+0.32*noise3(qx*2.2+11,qy*2.2+7,qz*2.2+3);
  let crown=smoothstep(0.0,0.3,Math.abs(n));
  const dc=dCS(x,y,z), ds=dSY(x,y,z);
  const above=smoothstep(-0.03,0.04,ds);
  let g=0;
  g=Math.max(g,gauss(dc,0.017)*above);                                 // surco central
  g=Math.max(g,0.75*gauss(dc-0.105,0.015)*above*smoothstep(0.0,0.08,ds)); // surco precentral
  g=Math.max(g,0.75*gauss(dc+0.105,0.015)*above);                      // surco poscentral
  const latS=smoothstep(0.22,0.4,ax)*smoothstep(0.5,0.38,z)*smoothstep(-0.56,-0.38,z);
  g=Math.max(g,1.25*gauss(ds,0.022)*latS);                             // cisura de Silvio
  g=Math.max(g,0.7*gauss(ds-STS,0.015)*latS*smoothstep(0.45,0.3,z));   // surco temporal superior
  g=Math.max(g,0.55*gauss(ds-ITS,0.014)*latS*smoothstep(0.4,0.25,z));  // surco temporal inferior
  const frontLat=smoothstep(0.3,0.45,ax)*smoothstep(-0.02,0.08,dc);
  g=Math.max(g,0.55*gauss(y-SFS(z),0.014)*frontLat);                   // surco frontal superior
  g=Math.max(g,0.55*gauss(y-IFS(z),0.014)*frontLat);                   // surco frontal inferior
  g=Math.max(g,0.85*gauss(dZO(x,y,z),0.017)*smoothstep(0.25,0.0,ax+0.12*smoothstep(0.3,0.6,y))); // parieto-occipital
  g=Math.max(g,0.8*gauss(y-0.02,0.016)*smoothstep(-0.5,-0.62,z)*smoothstep(0.12,0.04,ax));    // calcarina
  if(ax<0.08){const e=ECC(y,z); g=Math.max(g,0.7*gauss(e-1.45,0.05)*smoothstep(-0.05,0.05,y));} // surco cingulado
  const calm=gauss(dc,0.14)*above;
  crown=mix(crown,1,0.72*calm);
  g=Math.min(g,1.3);
  const d=0.027*(crown-1)-0.045*g;
  const ao=clamp(0.42+0.58*crown-0.45*g,0.2,1);
  return [d,ao];
}

// x = |x|; dc, ds, dz: distancias firmadas al surco central, a la cisura de Silvio y al surco parieto-occipital
function classifyLobe(x,y,z,dc,ds,dz){
  if(x<0.075){const e=ECC(y,z); if(y>-0.15&&e<1.0) return null; if(y>-0.06&&e<1.42) return 'cingulado';}
  if(dz<0) return 'occipital';
  const temporal=ds<0 && z<0.42 && (x>0.17 || z<0.12);
  if(dc>0 && !temporal) return 'frontal';
  if(temporal || ds<0) return 'temporal';
  return 'parietal';
}

// Devuelve la lista de ids de overlays (áreas funcionales, giros y Brodmann) a los que pertenece un triángulo
function regionsOf(lobe,x,y,z,side,dc,ds){
  const r=[];
  const add=(...ids)=>{for(const i of ids) r.push(i);};
  const L=side<0;                                    // hemisferio izquierdo (dominante para el lenguaje)
  const lateral=x>0.3, base=y<-0.085;
  if(lobe==='frontal'){
    const pre=dc<0.085 && ds>0.01;                   // giro precentral
    const prem=dc>=0.085 && dc<0.2 && ds>0.01;
    if(pre) add('motora','g_precentral','ba4');
    if(prem){ add('premotora'); if(x<0.17&&y>0.25) add('ams'); add('ba6'); }
    if(dc>=0.2 && dc<0.3 && y>0.12 && y<0.3 && lateral) add('ba8');
    if(dc>0.24 && !base) add('prefrontal');
    if(dc>0.3 && y>0.05 && y<0.33 && lateral && z<0.6) add('ba946');
    if(z>0.62 && !base) add('ba10');
    if(base && z>0.22 && x<0.34){ add('orbitofrontal','ba11'); }
    if(L && x>0.36 && ds>0.005 && ds<0.14 && dc>0.08 && dc<0.27) add('broca');
    if(x>0.36 && ds>0.005 && ds<0.14 && dc>0.08 && dc<0.27) add('ba4445');
    // giros frontales (cara lateral y superior, por delante del precentral)
    if(dc>=0.085 && !base){
      if(y>SFS(z) || x<0.14) add('g_fsup');
      else if(y>IFS(z)) add('g_fmed');
      else if(ds>0.01) add('g_finf');
    }
  } else if(lobe==='parietal'){
    if(dc>-0.085 && ds>0.01) add('somato','g_poscentral','ba312');
    const post=dc<=-0.085;
    if(post && (y>0.22 || x<0.15)) add('ba57');
    if(post && lateral && y<=0.22){
      if(z>-0.32 && ds>0.0 && ds<0.17) add('g_supramarg','ba40');
      else if(z<=-0.32 && y>0.0) add('g_angular','ba39');
    }
  } else if(lobe==='temporal'){
    const med=x<0.14, inf=!med && y<-0.2 && x<0.42 && z<0.15;   // cara inferior del lóbulo temporal
    if(L && x>0.36 && ds>-0.13 && z>-0.47 && z<-0.21) add('wernicke');
    if(x>0.35 && ds>-0.04 && z>-0.2 && z<0.08) add('auditiva','ba4142');
    if(med && y<-0.17 && z>-0.45 && z<0.2) add('parahipocampal','ba28');
    if(inf && z>-0.5) add('fusiforme','ba37');
    if(z>0.3 && x>0.17) add('ba38');
    if(lateral && !inf){
      if(ds>STS){ add('g_tsup'); if(z<0.3) add('ba22'); }
      else if(ds>ITS){ add('g_tmed','ba2021'); }
      else { add('g_tinf','ba2021'); }
    } else if(!med && !inf && y>-0.33 && x>0.2){ add('g_tinf','ba2021'); }
  } else if(lobe==='occipital'){
    const v1=(x<0.11 && Math.abs(y-0.02)<0.13) || z<-0.8;
    if(v1) add('visual','ba17'); else add('ba1819');
  } else if(lobe==='cingulado'){
    if(z>-0.1) add('cing_ant','ba2432'); else add('cing_post','ba2331');
  }
  return r;
}

/* ---------- constructores genéricos ---------- */
function indexedGeo(pos,idx,col){
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  g.setIndex(new THREE.BufferAttribute(idx,1));
  if(col) g.setAttribute('color',new THREE.BufferAttribute(col,3));
  g.computeVertexNormals();
  return g;
}
// Deforma una icosfera: fn(dx,dy,dz) -> [x,y,z]; relief(x,y,z) -> [desplazamiento, ao]
function blob(fn,opt={}){
  const ico=getIco(opt.detail||4), n=ico.n, pos=new Float32Array(n*3);
  for(let i=0;i<n;i++){const p=fn(ico.pos[i*3],ico.pos[i*3+1],ico.pos[i*3+2]);pos[i*3]=p[0];pos[i*3+1]=p[1];pos[i*3+2]=p[2];}
  let idx=ico.idx;
  if(opt.mirror){idx=idx.slice();for(let i=0;i<idx.length;i+=3){const t=idx[i+1];idx[i+1]=idx[i+2];idx[i+2]=t;} for(let i=0;i<n;i++)pos[i*3]*=-1;}
  const g=indexedGeo(pos,idx,null);
  if(opt.relief) applyRelief(g,opt.relief);
  return g;
}
function applyRelief(g,relief){
  const P=g.attributes.position.array,N=g.attributes.normal.array,n=P.length/3,col=new Float32Array(n*3);
  const base=P.slice();
  for(let i=0;i<n;i++){const r=relief(base[i*3],base[i*3+1],base[i*3+2]);
    P[i*3]+=N[i*3]*r[0];P[i*3+1]+=N[i*3+1]*r[0];P[i*3+2]+=N[i*3+2]*r[0];col[i*3]=col[i*3+1]=col[i*3+2]=r[1];}
  g.setAttribute('color',new THREE.BufferAttribute(col,3));
  g.computeVertexNormals();
}
const ell=(cx,cy,cz,rx,ry,rz,warp)=>(dx,dy,dz)=>{let x=dx*rx,y=dy*ry,z=dz*rz;if(warp){const w=warp(dx,dy,dz,x,y,z);x=w[0];y=w[1];z=w[2];}return[cx+x,cy+y,cz+z];};

// Tubo a lo largo de una curva con sección elíptica variable y extremos redondeados
function tube(points,rfn,opt={}){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(p[0],p[1],p[2])),false,'centripetal');
  const segs=opt.segs||72, rad=opt.rad||24, L=curve.getLength();
  const ref=opt.ref?new THREE.Vector3().fromArray(opt.ref):null;
  const frames=curve.computeFrenetFrames(segs,false);
  const r0=Math.max(...rfn(0)), r1=Math.max(...rfn(1));
  const c0=opt.cap0===false?0:Math.min(0.45,r0/L), c1=opt.cap1===false?0:Math.min(0.45,r1/L);
  const pos=new Float32Array((segs+1)*rad*3), P=new THREE.Vector3(), N1=new THREE.Vector3(), N2=new THREE.Vector3();
  for(let i=0;i<=segs;i++){
    const t=i/segs; curve.getPointAt(t,P); const T=frames.tangents[i];
    if(ref){N1.copy(ref).addScaledVector(T,-ref.dot(T)).normalize();} else N1.copy(frames.normals[i]);
    N2.crossVectors(T,N1).normalize();
    let e=1;
    if(c0>0&&t<c0){const u=t/c0;e=Math.sqrt(1-(1-u)*(1-u));}
    if(c1>0&&t>1-c1){const u=(1-t)/c1;e=Math.min(e,Math.sqrt(1-(1-u)*(1-u)));}
    const [ra,rb]=rfn(t);
    for(let j=0;j<rad;j++){const a=j/rad*Math.PI*2,ca=Math.cos(a)*ra*e,sa=Math.sin(a)*rb*e,k=(i*rad+j)*3;
      pos[k]=P.x+N1.x*ca+N2.x*sa;pos[k+1]=P.y+N1.y*ca+N2.y*sa;pos[k+2]=P.z+N1.z*ca+N2.z*sa;}
  }
  const idx=new Uint32Array(segs*rad*6);let q=0;
  for(let i=0;i<segs;i++)for(let j=0;j<rad;j++){
    const a=i*rad+j,b=i*rad+(j+1)%rad,c=(i+1)*rad+j,d=(i+1)*rad+(j+1)%rad;
    idx[q++]=a;idx[q++]=b;idx[q++]=c; idx[q++]=b;idx[q++]=d;idx[q++]=c;
  }
  const g=indexedGeo(pos,idx,null);
  g.userData.curve=curve;
  if(opt.relief) applyRelief(g,opt.relief);
  return g;
}

/* ---------- surcos: muestreo de la superficie para trazar tubos de referencia ----------
   Cada surco se define por: test(x,y,z) → true si el vértice está sobre el surco;
   key(x,y,z) → parámetro por el que se ordena (se agrupa en bins y se promedia). */
const SULCI = {
  s_central:   {test:(x,y,z,dc,ds)=>Math.abs(dc)<0.012&&ds>0.03, key:(x,y,z)=>y, bins:22},
  s_lateral:   {test:(x,y,z,dc,ds)=>Math.abs(ds)<0.014&&x>0.26&&z<0.48&&z>-0.5, key:(x,y,z)=>z, bins:24},
  s_parietooc: {test:(x,y,z,dc,ds,dz)=>Math.abs(dz)<0.012&&x<0.2&&y>-0.05, key:(x,y,z)=>x+0.5*y, bins:14},
  s_calcarina: {test:(x,y,z)=>Math.abs(y-0.02)<0.012&&z<-0.52&&x<0.08, key:(x,y,z)=>z, bins:12},
  s_cingulado: {test:(x,y,z)=>x<0.07&&Math.abs(ECC(y,z)-1.45)<0.05&&y>0.0, key:(x,y,z)=>Math.atan2(y-0.1,(z+0.04)/2), bins:20}
};
function sampleSulcus(def,base,N,side){
  const bins=new Map();
  for(let i=0;i<N;i++){
    const x=Math.abs(base[i*3]),y=base[i*3+1],z=base[i*3+2];
    const dc=dCS(x,y,z),ds=dSY(x,y,z),dz=dZO(x,y,z);
    if(!def.test(x,y,z,dc,ds,dz)) continue;
    const k=def.key(x,y,z);
    let b=bins.get(0); // placeholder to keep linter calm
    const bk=Math.round(k*def.bins);
    b=bins.get(bk); if(!b){b={n:0,x:0,y:0,z:0,k:bk};bins.set(bk,b);}
    b.n++;b.x+=x;b.y+=y;b.z+=z;
  }
  const pts=[...bins.values()].filter(b=>b.n>=2).sort((a,b)=>a.k-b.k).map(b=>[b.x/b.n*side,b.y/b.n,b.z/b.n]);
  return pts;
}
