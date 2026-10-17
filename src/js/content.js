/* =====================================================================
   CONTENIDO · grupos y estructuras
   Campos de PARTS:
     id, g (grupo), name, color (modo atlas), real (color aproximado del tejido)
     cortex: 1  → pieza de corteza; le afecta la "opacidad de la corteza"
     overlay: 1 → área pintada sobre la corteza (hija de su lóbulo); po = polygonOffset
     alpha      → opacidad fija (ventrículos)
     par: true  → estructura par (una por hemisferio); false → línea media
     sup: true  → se ve desde fuera sin desarmar (pistas del quiz)
     lobe       → (overlays) lóbulo/pieza sobre la que se dibuja
   ===================================================================== */
const GROUPS = [
  {id:'lobulos',    name:'Lóbulos cerebrales'},
  {id:'areas',      name:'Áreas funcionales', hint:'Se dibujan sobre la corteza'},
  {id:'giros',      name:'Giros y surcos', hint:'Referencias para orientarse'},
  {id:'brodmann',   name:'Áreas de Brodmann', hint:'Mapa citoarquitectónico (1909)'},
  {id:'limbico',    name:'Sistema límbico'},
  {id:'diencefalo', name:'Diencéfalo y glándulas'},
  {id:'basales',    name:'Ganglios basales'},
  {id:'tronco',     name:'Tronco encefálico y médula'},
  {id:'cerebelo',   name:'Cerebelo'},
  {id:'otros',      name:'Sustancia blanca, ventrículos y nervios'}
];

const PARTS = [
  // --- lóbulos (piezas de corteza) ---
  {id:'frontal',   g:'lobulos', name:'Lóbulo frontal',   color:'#5b8def', real:'#dba9a2', cortex:1, par:true, sup:true},
  {id:'parietal',  g:'lobulos', name:'Lóbulo parietal',  color:'#f2c14e', real:'#dba9a2', cortex:1, par:true, sup:true},
  {id:'temporal',  g:'lobulos', name:'Lóbulo temporal',  color:'#4fbf86', real:'#dba9a2', cortex:1, par:true, sup:true},
  {id:'occipital', g:'lobulos', name:'Lóbulo occipital', color:'#ef6f6c', real:'#dba9a2', cortex:1, par:true, sup:true},
  {id:'insula',    g:'lobulos', name:'Ínsula',           color:'#f39c4a', real:'#d39e98', cortex:1, par:true},

  // --- áreas funcionales (overlays) ---
  {id:'prefrontal',   g:'areas', name:'Corteza prefrontal',            color:'#b28dff', overlay:1, po:-1, par:true, sup:true, lobe:'frontal'},
  {id:'orbitofrontal',g:'areas', name:'Corteza orbitofrontal',         color:'#d4b5ff', overlay:1, po:-2, par:true, lobe:'frontal'},
  {id:'premotora',    g:'areas', name:'Corteza premotora',             color:'#ff8fb8', overlay:1, po:-2, par:true, sup:true, lobe:'frontal'},
  {id:'ams',          g:'areas', name:'Área motora suplementaria',     color:'#ffb3d1', overlay:1, po:-3, par:true, sup:true, lobe:'frontal'},
  {id:'motora',       g:'areas', name:'Corteza motora primaria',       color:'#ff4f8b', overlay:1, po:-1, par:true, sup:true, lobe:'frontal'},
  {id:'somato',       g:'areas', name:'Corteza somatosensorial primaria', color:'#ffd23f', overlay:1, po:-1, par:true, sup:true, lobe:'parietal'},
  {id:'broca',        g:'areas', name:'Área de Broca',                 color:'#ff7b2e', overlay:1, po:-4, par:false, sup:true, lobe:'frontal'},
  {id:'wernicke',     g:'areas', name:'Área de Wernicke',              color:'#2ec4ff', overlay:1, po:-4, par:false, sup:true, lobe:'temporal'},
  {id:'auditiva',     g:'areas', name:'Corteza auditiva primaria',     color:'#00e0b8', overlay:1, po:-2, par:true, lobe:'temporal'},
  {id:'visual',       g:'areas', name:'Corteza visual primaria',       color:'#fff27a', overlay:1, po:-2, par:true, sup:true, lobe:'occipital'},
  {id:'fusiforme',    g:'areas', name:'Giro fusiforme (área de las caras)', color:'#9ef0c0', overlay:1, po:-3, par:true, lobe:'temporal'},
  {id:'parahipocampal',g:'areas',name:'Giro parahipocampal y corteza entorrinal', color:'#ffd6a0', overlay:1, po:-3, par:true, lobe:'temporal'},
  {id:'cing_ant',     g:'areas', name:'Corteza cingulada anterior',    color:'#e0a6ff', overlay:1, po:-2, par:true, lobe:'cingulado'},
  {id:'cing_post',    g:'areas', name:'Corteza cingulada posterior',   color:'#b983e6', overlay:1, po:-2, par:true, lobe:'cingulado'},

  // --- giros y surcos (overlays y tubos de referencia) ---
  {id:'g_precentral', g:'giros', name:'Giro precentral',          color:'#ff9aa2', overlay:1, po:-5, par:true, sup:true, lobe:'frontal'},
  {id:'g_poscentral', g:'giros', name:'Giro poscentral',          color:'#ffe29a', overlay:1, po:-5, par:true, sup:true, lobe:'parietal'},
  {id:'g_fsup',       g:'giros', name:'Giro frontal superior',    color:'#8fb4ff', overlay:1, po:-5, par:true, sup:true, lobe:'frontal'},
  {id:'g_fmed',       g:'giros', name:'Giro frontal medio',       color:'#6f9bff', overlay:1, po:-5, par:true, sup:true, lobe:'frontal'},
  {id:'g_finf',       g:'giros', name:'Giro frontal inferior',    color:'#4f82f0', overlay:1, po:-5, par:true, sup:true, lobe:'frontal'},
  {id:'g_tsup',       g:'giros', name:'Giro temporal superior',   color:'#8fe7b8', overlay:1, po:-5, par:true, sup:true, lobe:'temporal'},
  {id:'g_tmed',       g:'giros', name:'Giro temporal medio',      color:'#5fd39a', overlay:1, po:-5, par:true, sup:true, lobe:'temporal'},
  {id:'g_tinf',       g:'giros', name:'Giro temporal inferior',   color:'#3bb37c', overlay:1, po:-5, par:true, sup:true, lobe:'temporal'},
  {id:'g_angular',    g:'giros', name:'Giro angular',             color:'#ffcf70', overlay:1, po:-6, par:true, sup:true, lobe:'parietal'},
  {id:'g_supramarg',  g:'giros', name:'Giro supramarginal',       color:'#f7b955', overlay:1, po:-6, par:true, sup:true, lobe:'parietal'},
  {id:'s_central',    g:'giros', name:'Surco central (de Rolando)',     color:'#ffffff', surco:1, par:true, sup:true},
  {id:'s_lateral',    g:'giros', name:'Cisura lateral (de Silvio)',     color:'#ffffff', surco:1, par:true, sup:true},
  {id:'s_parietooc',  g:'giros', name:'Surco parieto-occipital',       color:'#ffffff', surco:1, par:true, sup:true},
  {id:'s_calcarina',  g:'giros', name:'Cisura calcarina',              color:'#ffffff', surco:1, par:true},
  {id:'s_cingulado',  g:'giros', name:'Surco del cíngulo',             color:'#ffffff', surco:1, par:true},

  // --- Brodmann (overlays con número) ---
  {id:'ba4',   g:'brodmann', name:'Área 4 (motora primaria)',           color:'#ff4f8b', overlay:1, po:-7, par:true, sup:true, lobe:'frontal',  ba:'4'},
  {id:'ba6',   g:'brodmann', name:'Área 6 (premotora y AMS)',           color:'#ff8fb8', overlay:1, po:-7, par:true, sup:true, lobe:'frontal',  ba:'6'},
  {id:'ba8',   g:'brodmann', name:'Área 8 (campo ocular frontal)',      color:'#c89bff', overlay:1, po:-7, par:true, sup:true, lobe:'frontal',  ba:'8'},
  {id:'ba946', g:'brodmann', name:'Áreas 9 y 46 (prefrontal dorsolateral)', color:'#b28dff', overlay:1, po:-7, par:true, sup:true, lobe:'frontal', ba:'9/46'},
  {id:'ba10',  g:'brodmann', name:'Área 10 (polo frontal)',             color:'#dcc8ff', overlay:1, po:-7, par:true, sup:true, lobe:'frontal',  ba:'10'},
  {id:'ba11',  g:'brodmann', name:'Área 11 (orbitofrontal)',            color:'#d4b5ff', overlay:1, po:-7, par:true, lobe:'frontal',  ba:'11'},
  {id:'ba4445',g:'brodmann', name:'Áreas 44 y 45 (Broca)',              color:'#ff7b2e', overlay:1, po:-7, par:true, sup:true, lobe:'frontal',  ba:'44/45'},
  {id:'ba312', g:'brodmann', name:'Áreas 3, 1 y 2 (somatosensorial)',   color:'#ffd23f', overlay:1, po:-7, par:true, sup:true, lobe:'parietal', ba:'3,1,2'},
  {id:'ba57',  g:'brodmann', name:'Áreas 5 y 7 (parietal superior)',    color:'#f2c14e', overlay:1, po:-7, par:true, sup:true, lobe:'parietal', ba:'5/7'},
  {id:'ba39',  g:'brodmann', name:'Área 39 (giro angular)',             color:'#ffcf70', overlay:1, po:-7, par:true, sup:true, lobe:'parietal', ba:'39'},
  {id:'ba40',  g:'brodmann', name:'Área 40 (giro supramarginal)',       color:'#f7b955', overlay:1, po:-7, par:true, sup:true, lobe:'parietal', ba:'40'},
  {id:'ba4142',g:'brodmann', name:'Áreas 41 y 42 (auditiva)',           color:'#00e0b8', overlay:1, po:-7, par:true, lobe:'temporal', ba:'41/42'},
  {id:'ba22',  g:'brodmann', name:'Área 22 (Wernicke, temporal superior)', color:'#2ec4ff', overlay:1, po:-7, par:true, sup:true, lobe:'temporal', ba:'22'},
  {id:'ba2021',g:'brodmann', name:'Áreas 20 y 21 (temporal inferior y medio)', color:'#4fbf86', overlay:1, po:-7, par:true, sup:true, lobe:'temporal', ba:'20/21'},
  {id:'ba37',  g:'brodmann', name:'Área 37 (fusiforme)',                color:'#9ef0c0', overlay:1, po:-7, par:true, lobe:'temporal', ba:'37'},
  {id:'ba38',  g:'brodmann', name:'Área 38 (polo temporal)',            color:'#7fd9a5', overlay:1, po:-7, par:true, sup:true, lobe:'temporal', ba:'38'},
  {id:'ba28',  g:'brodmann', name:'Área 28 (entorrinal)',               color:'#ffd6a0', overlay:1, po:-7, par:true, lobe:'temporal', ba:'28'},
  {id:'ba17',  g:'brodmann', name:'Área 17 (visual primaria, V1)',      color:'#fff27a', overlay:1, po:-7, par:true, sup:true, lobe:'occipital', ba:'17'},
  {id:'ba1819',g:'brodmann', name:'Áreas 18 y 19 (visual secundaria)',  color:'#ef6f6c', overlay:1, po:-7, par:true, sup:true, lobe:'occipital', ba:'18/19'},
  {id:'ba2432',g:'brodmann', name:'Áreas 24 y 32 (cingulada anterior)', color:'#e0a6ff', overlay:1, po:-7, par:true, lobe:'cingulado', ba:'24/32'},
  {id:'ba2331',g:'brodmann', name:'Áreas 23 y 31 (cingulada posterior)',color:'#b983e6', overlay:1, po:-7, par:true, lobe:'cingulado', ba:'23/31'},

  // --- sistema límbico ---
  {id:'cingulado', g:'limbico', name:'Giro cingulado',    color:'#c77dff', real:'#d6a29c', cortex:1, par:true},
  {id:'hipocampo', g:'limbico', name:'Hipocampo',         color:'#ffb347', real:'#c9a49d', par:true},
  {id:'amigdala',  g:'limbico', name:'Amígdala',          color:'#ff4d6d', real:'#c49a94', par:true},
  {id:'fornix',    g:'limbico', name:'Fórnix',            color:'#efe7d4', real:'#f1e9de', par:true},
  {id:'mamilares', g:'limbico', name:'Cuerpos mamilares', color:'#ff9ad5', real:'#c9a49d', par:true, sup:true},
  {id:'septales',  g:'limbico', name:'Núcleos septales',  color:'#ffc8e8', real:'#c9a49d', par:true},

  // --- diencéfalo ---
  {id:'talamo',     g:'diencefalo', name:'Tálamo',           color:'#5ec8ff', real:'#bf9e98', par:true},
  {id:'hipotalamo', g:'diencefalo', name:'Hipotálamo',       color:'#ff8fa3', real:'#c79f99', par:false},
  {id:'hipofisis',  g:'diencefalo', name:'Hipófisis',        color:'#ff6f9e', real:'#d48f8c', par:false, sup:true},
  {id:'pineal',     g:'diencefalo', name:'Glándula pineal',  color:'#ffd166', real:'#d9b38c', par:false},

  // --- ganglios basales ---
  {id:'caudado',    g:'basales', name:'Núcleo caudado',     color:'#3fd1c3', real:'#b99a95', par:true},
  {id:'putamen',    g:'basales', name:'Putamen',            color:'#2a9d8f', real:'#b99a95', par:true},
  {id:'palido',     g:'basales', name:'Globo pálido',       color:'#a7e8bd', real:'#dccdc1', par:true},
  {id:'accumbens',  g:'basales', name:'Núcleo accumbens',   color:'#f4a261', real:'#bf9e98', par:true},
  {id:'subtalamico',g:'basales', name:'Núcleo subtalámico', color:'#7fc8a9', real:'#b99a95', par:true},
  {id:'negra',      g:'basales', name:'Sustancia negra',    color:'#6b4f4f', real:'#3d2b2b', par:true},

  // --- tronco ---
  {id:'mesencefalo',   g:'tronco', name:'Mesencéfalo',              color:'#d4a373', real:'#e2c7b8', par:false, sup:true},
  {id:'atv',           g:'tronco', name:'Área tegmental ventral',   color:'#ff6b35', real:'#c9a49d', par:true},
  {id:'protuberancia', g:'tronco', name:'Protuberancia (puente)',   color:'#bc8a5f', real:'#e0c2b2', par:false, sup:true},
  {id:'locus',         g:'tronco', name:'Locus coeruleus',          color:'#4a7bff', real:'#6b7fa8', par:true},
  {id:'rafe',          g:'tronco', name:'Núcleos del rafe',         color:'#ff5fa2', real:'#c9a49d', par:false},
  {id:'bulbo',         g:'tronco', name:'Bulbo raquídeo',           color:'#a47148', real:'#dfc1b0', par:false, sup:true},
  {id:'medula',        g:'tronco', name:'Médula espinal',           color:'#e6ccb2', real:'#ead6c6', par:false, sup:true},

  {id:'cerebelo', g:'cerebelo', name:'Cerebelo', color:'#e07bb0', real:'#d29c97', par:false, sup:true},

  // --- sustancia blanca, ventrículos y nervios ---
  {id:'calloso',     g:'otros', name:'Cuerpo calloso',          color:'#f5efe3', real:'#f3ebe0', par:false},
  {id:'arqueado',    g:'otros', name:'Fascículo arqueado',      color:'#fff0a8', real:'#f3ebe0', par:false},
  {id:'capsula',     g:'otros', name:'Cápsula interna',         color:'#e8e0d0', real:'#f3ebe0', par:true},
  {id:'ventriculos', g:'otros', name:'Ventrículos cerebrales',  color:'#4fc3f7', real:'#9fd3f0', alpha:.5, par:true},
  {id:'optico',      g:'otros', name:'Nervios y quiasma ópticos', color:'#fff3b0', real:'#efe5cf', par:true, sup:true},
  {id:'olfatorio',   g:'otros', name:'Bulbos olfatorios',       color:'#b5e48c', real:'#e3cbbd', par:true, sup:true}
];

// Manuales usados en las referencias (ediciones de las que se toman los capítulos)
const BOOKS = {
  c:  {short:'Carlson', full:'Carlson, N. R. y Birkett, M. A. <i>Fisiología de la conducta</i> (11.ª/12.ª ed.). Pearson.'},
  k:  {short:'Kandel', full:'Kandel, E. R. y cols. <i>Principios de neurociencia</i> (5.ª ed.). McGraw-Hill.'},
  kw: {short:'Kolb y Whishaw', full:'Kolb, B. y Whishaw, I. Q. <i>Neuropsicología humana</i> (7.ª ed.). Médica Panamericana.'}
};

// Autoría y licencias
const AUTHOR={name:'Cristian Farías',url:'https://www.linkedin.com/in/cristianfarias/',year:'2026',repo:'https://github.com/Tian-Farias/Cerebro3D'};
const LICENSES={
  content:{name:'CC BY-SA 4.0',url:'https://creativecommons.org/licenses/by-sa/4.0/deed.es',desc:'Textos, fichas, recorridos, casos y modelo 3D: Creative Commons Atribución-CompartirIgual 4.0 Internacional.'},
  code:{name:'Apache 2.0',url:'https://www.apache.org/licenses/LICENSE-2.0',desc:'Código fuente de la aplicación: Apache License 2.0.'}
};

// INFO se rellena en info1.js, info2.js e info3.js
const INFO = {};
