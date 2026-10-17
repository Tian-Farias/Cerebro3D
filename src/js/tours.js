/* =====================================================================
   RECORRIDOS GUIADOS, CASOS CLÍNICOS, GLOSARIO Y CORTES CLÁSICOS
   Recorrido: {id, name, sub, hemi?, view?, flow (dibuja flechas entre pasos), steps:[{ids, t, x, from?}]}
     - ids[0] es la estructura principal del paso (destino de la flecha de flujo)
     - from: id de origen de la flecha (por defecto, ids[0] del paso anterior)
   ===================================================================== */
const TOURS = [
 {id:'papez', name:'Circuito de Papez', sub:'Memoria y emoción en el sistema límbico', flow:true, steps:[
  {ids:['hipocampo'], t:'Hipocampo', x:'Empieza en el hipocampo, en la cara interna del lóbulo temporal. Aquí se consolidan los recuerdos declarativos.'},
  {ids:['fornix'], t:'Fórnix', x:'La información sale del hipocampo por el fórnix, un arco de fibras que pasa por debajo del cuerpo calloso.'},
  {ids:['mamilares','hipotalamo'], t:'Cuerpos mamilares', x:'El fórnix termina en los cuerpos mamilares, en la base del hipotálamo. Su atrofia es típica del síndrome de Korsakoff.'},
  {ids:['talamo'], t:'Tálamo anterior', x:'Desde los mamilares, el tracto mamilotalámico lleva la señal al núcleo anterior del tálamo.'},
  {ids:['cingulado'], t:'Giro cingulado', x:'El tálamo proyecta al giro cingulado, que aporta la vivencia emocional consciente.'},
  {ids:['parahipocampal'], t:'Giro parahipocampal y corteza entorrinal', x:'Por el cíngulo (un haz de sustancia blanca) la información vuelve al giro parahipocampal y a la corteza entorrinal, que la devuelven al hipocampo. El circuito se cierra.'},
  {ids:['hipocampo','fornix','mamilares','talamo','cingulado','parahipocampal','amigdala'], t:'Circuito completo', x:'James Papez (1937) propuso este circuito como la base de la emoción. Hoy sabemos que es más importante para la <b>memoria</b>, y que la <b>amígdala</b> (no incluida en el original) es la clave del miedo. Paul MacLean lo amplió en 1952 y acuñó el término “sistema límbico”.'}
 ]},
 {id:'recompensa', name:'Circuito de recompensa', sub:'Dopamina, motivación y adicciones', flow:true, steps:[
  {ids:['atv'], t:'Área tegmental ventral', x:'En el mesencéfalo, medial a la sustancia negra, está el área tegmental ventral (ATV): sus neuronas liberan dopamina ante recompensas o ante señales que las anuncian.'},
  {ids:['accumbens'], t:'Núcleo accumbens', x:'La <b>vía mesolímbica</b> lleva esa dopamina al núcleo accumbens. Genera el “quiero más” (deseo, motivación), no tanto el placer.'},
  {ids:['amigdala','hipocampo'], t:'Amígdala e hipocampo', x:'Aportan la carga emocional y los recuerdos asociados: el lugar o la gente vinculados a una droga pueden disparar el deseo (craving).', from:'accumbens'},
  {ids:['prefrontal'], t:'Corteza prefrontal', x:'La <b>vía mesocortical</b> lleva dopamina a la prefrontal, que valora y frena los impulsos. En la adicción este control se debilita.', from:'atv'},
  {ids:['putamen','caudado'], t:'Del deseo al hábito', x:'Con la repetición, el control pasa del estriado ventral (accumbens: “quiero”) al estriado dorsal (putamen, caudado: “lo hago sin pensar”). La adicción se vuelve compulsión (Everitt y Robbins).', from:'accumbens'},
  {ids:['atv','accumbens','amigdala','hipocampo','prefrontal','putamen'], t:'Visión global', x:'Casi todas las drogas de abuso aumentan la dopamina en este circuito. También participa en el juego patológico, la comida ultraprocesada, las redes sociales y en la anhedonia de la depresión.'}
 ]},
 {id:'lenguaje', name:'Lenguaje', sub:'Modelo de Wernicke-Geschwind (hemisferio izquierdo)', hemi:'L', view:'left', flow:true, steps:[
  {ids:['auditiva'], t:'Corteza auditiva primaria', x:'Al escuchar una palabra, el sonido llega primero a la corteza auditiva primaria, en el lóbulo temporal.'},
  {ids:['wernicke'], t:'Área de Wernicke', x:'El área de Wernicke reconoce y comprende la palabra. Su lesión produce un habla fluida pero sin sentido.'},
  {ids:['arqueado'], t:'Fascículo arqueado', x:'Un haz de sustancia blanca, el <b>fascículo arqueado</b>, conecta Wernicke con Broca pasando por el giro supramarginal. Su lesión produce afasia de conducción (falla la repetición).'},
  {ids:['broca'], t:'Área de Broca', x:'El área de Broca planifica la articulación y la gramática de lo que vamos a decir.'},
  {ids:['motora'], t:'Corteza motora', x:'Finalmente, la corteza motora primaria mueve labios, lengua y laringe para hablar.'},
  {ids:['visual','g_angular','wernicke'], t:'¿Y al leer en voz alta?', x:'Para leer, la información entra por la corteza visual, pasa por el <b>giro angular</b> (que convierte las letras en sonidos) hasta Wernicke, y luego sigue el mismo camino hacia Broca y la corteza motora.', from:'visual'}
 ]},
 {id:'estres', name:'Respuesta al estrés', sub:'Eje hipotálamo-hipófisis-suprarrenal (HHS)', flow:true, steps:[
  {ids:['amigdala'], t:'Amígdala: alarma', x:'Ante una amenaza, la amígdala detecta el peligro y avisa al hipotálamo y al locus coeruleus.'},
  {ids:['locus'], t:'Locus coeruleus: respuesta rápida', x:'El locus coeruleus libera noradrenalina en todo el cerebro y, con el sistema simpático, acelera el corazón y dilata las pupilas en segundos.'},
  {ids:['hipotalamo'], t:'Hipotálamo: CRH', x:'El hipotálamo (núcleo paraventricular) libera la hormona CRH hacia la hipófisis: empieza la respuesta lenta, hormonal.', from:'amigdala'},
  {ids:['hipofisis'], t:'Hipófisis: ACTH', x:'La CRH hace que la hipófisis libere ACTH a la sangre, que llega a las glándulas suprarrenales (sobre los riñones), donde se produce <b>cortisol</b>.'},
  {ids:['hipocampo','prefrontal'], t:'Freno: hipocampo y prefrontal', x:'El cortisol vuelve al cerebro: el hipocampo y la corteza prefrontal lo detectan y frenan el eje (retroalimentación negativa).', from:'hipofisis'},
  {ids:['amigdala','locus','hipotalamo','hipofisis','hipocampo','prefrontal'], t:'Estrés crónico', x:'Si el estrés se mantiene, el cortisol daña al hipocampo y a la prefrontal (que frenan menos) y potencia la amígdala: un círculo vicioso implicado en la depresión, la ansiedad y el TEPT (modelo de la carga alostática de McEwen).'}
 ]},
 {id:'vision', name:'Vía visual', sub:'Del ojo a la corteza', flow:true, steps:[
  {ids:['optico'], t:'Nervios y quiasma ópticos', x:'La retina envía la señal por el nervio óptico. En el quiasma se cruzan las fibras nasales: desde aquí cada lado lleva el campo visual contrario.'},
  {ids:['talamo'], t:'Tálamo (geniculado lateral)', x:'Los tractos ópticos llegan al núcleo geniculado lateral del tálamo, que filtra y retransmite.'},
  {ids:['visual'], t:'Corteza visual primaria', x:'Las radiaciones ópticas llegan a V1, alrededor de la cisura calcarina del lóbulo occipital.'},
  {ids:['parietal','visual'], t:'Vía dorsal: “¿dónde? / ¿cómo?”', x:'Hacia el lóbulo parietal: localización, movimiento y guía de la acción. Su lesión causa problemas para alcanzar objetos (ataxia óptica).'},
  {ids:['fusiforme','g_tinf','visual'], t:'Vía ventral: “¿qué?”', x:'Hacia el lóbulo temporal inferior y el giro fusiforme: reconocimiento de objetos y caras. Su lesión causa agnosias como la prosopagnosia (Ungerleider y Mishkin, 1982; Goodale y Milner, 1992).', from:'visual'}
 ]},
 {id:'movimiento', name:'Control del movimiento', sub:'Corteza, ganglios basales y cerebelo', flow:true, steps:[
  {ids:['prefrontal','premotora','ams'], t:'Intención y plan', x:'La corteza prefrontal decide; la premotora y el área motora suplementaria planifican la secuencia.'},
  {ids:['motora'], t:'Orden', x:'La corteza motora primaria emite la orden que bajará por la vía piramidal.'},
  {ids:['putamen','caudado'], t:'Ganglios basales: estriado', x:'Una copia va al estriado, que selecciona qué movimiento iniciar y frena los que sobran.'},
  {ids:['negra'], t:'Dopamina nigroestriada', x:'La sustancia negra aporta dopamina al estriado para que la selección funcione. Su pérdida causa el Parkinson; el exceso de actividad se relaciona con tics y corea.'},
  {ids:['palido','subtalamico'], t:'Pálido y subtalámico', x:'La vía directa (estriado → pálido interno) suelta el freno; la vía indirecta (a través del pálido externo y el subtalámico) lo aprieta. El equilibrio decide si el movimiento sale.', from:'putamen'},
  {ids:['talamo'], t:'Tálamo motor', x:'El pálido interno frena al tálamo; cuando lo deja de frenar, el tálamo excita a la corteza y el movimiento se inicia.'},
  {ids:['cerebelo','protuberancia'], t:'Cerebelo', x:'El cerebelo, conectado por la protuberancia, compara lo planeado con lo ejecutado y corrige errores en tiempo real.', from:'motora'},
  {ids:['capsula','bulbo','medula'], t:'Vía piramidal', x:'La orden baja por la cápsula interna, se cruza en el bulbo (decusación de las pirámides) y desciende por la médula hasta las motoneuronas.', from:'motora'}
 ]},
 {id:'neurotransmisores', name:'Sistemas de neurotransmisores', sub:'De dónde sale cada “modulador” y a quién riega', flow:false, steps:[
  {ids:['negra','atv'], t:'Dopamina', x:'Nace en la <b>sustancia negra</b> (vía nigroestriada → movimiento; Parkinson) y en el <b>área tegmental ventral</b> (vías mesolímbica → motivación, adicción; y mesocortical → cognición, esquizofrenia). También en el hipotálamo (inhibe la prolactina).'},
  {ids:['rafe'], t:'Serotonina', x:'Nace en los <b>núcleos del rafe</b> del tronco y riega todo el cerebro. Ánimo, impulsividad, sueño, apetito y dolor. Diana de los ISRS y de los psicodélicos.'},
  {ids:['locus'], t:'Noradrenalina', x:'Nace sobre todo en el <b>locus coeruleus</b> del puente. Alerta, atención, estrés y consolidación de recuerdos emocionales. Diana de la atomoxetina y de los antidepresivos duales.'},
  {ids:['septales','protuberancia'], t:'Acetilcolina', x:'Dos fuentes: el <b>prosencéfalo basal</b> (núcleos septales y núcleo basal de Meynert → hipocampo y corteza: memoria y atención; se degenera en el Alzheimer, diana de los anticolinesterásicos) y el <b>tronco</b> (núcleos pedunculopontino y laterodorsal → tálamo: vigilia y sueño REM).'},
  {ids:['frontal','parietal','temporal','occipital'], t:'Glutamato y GABA', x:'No son sistemas difusos: el <b>glutamato</b> es el transmisor excitador de todas las neuronas piramidales de la corteza (y de la LTP, la ketamina lo bloquea) y el <b>GABA</b> el inhibidor de las interneuronas (diana de benzodiacepinas y alcohol).'},
  {ids:['hipotalamo'], t:'Neuropéptidos y hormonas', x:'El <b>hipotálamo</b> fabrica orexina (vigilia; narcolepsia), oxitocina (vínculo), vasopresina, CRH (estrés)… Los opioides endógenos (endorfinas) se liberan en la periacueductal, el accumbens y la hipófisis.'}
 ]},
 {id:'memoria', name:'Sistemas de memoria', sub:'No hay una memoria: hay varias, cada una con su circuito', flow:false, steps:[
  {ids:['hipocampo','parahipocampal'], t:'Memoria declarativa (explícita)', x:'Hechos y episodios que se pueden contar. Depende del <b>lóbulo temporal medial</b> (hipocampo, corteza entorrinal) para formarse y de la corteza para guardarse a largo plazo. H.M. la perdió.'},
  {ids:['mamilares','talamo'], t:'Memoria diencefálica', x:'Los <b>cuerpos mamilares</b> y el <b>tálamo anterior y dorsomedial</b> forman parte del mismo sistema: su lesión (Korsakoff) produce una amnesia parecida a la hipocampal, con confabulación.'},
  {ids:['putamen','caudado','cerebelo'], t:'Memoria procedimental (implícita)', x:'Habilidades y hábitos: montar en bici, escribir a máquina. Depende de los <b>ganglios basales</b> (estriado) y del <b>cerebelo</b>. H.M. la conservó; los pacientes con Parkinson o Huntington la pierden.'},
  {ids:['amigdala'], t:'Memoria emocional', x:'El condicionamiento del miedo depende de la <b>amígdala</b>, que además “marca” como importantes los recuerdos declarativos con carga emocional (por eso recordamos dónde estábamos en un momento traumático).'},
  {ids:['prefrontal'], t:'Memoria de trabajo', x:'Mantener y manipular información durante segundos (un número de teléfono). Depende de la <b>corteza prefrontal dorsolateral</b> con la parietal. No es un almacén: es un “bloc de notas” (Baddeley).'},
  {ids:['cerebelo'], t:'Condicionamiento clásico', x:'El condicionamiento del parpadeo (tono + soplo) depende del <b>cerebelo</b> (núcleo interpósito), no del hipocampo. Priming: cortezas sensoriales. Cada memoria, su sitio (Squire).'}
 ]},
 {id:'miedo', name:'Miedo y ansiedad', sub:'Las dos vías de LeDoux y el freno prefrontal', flow:true, steps:[
  {ids:['talamo'], t:'Tálamo: la señal llega', x:'Un estímulo amenazante (una sombra, un ruido) entra por los sentidos y pasa por el tálamo.'},
  {ids:['amigdala'], t:'Vía rápida: tálamo → amígdala', x:'El tálamo manda una copia “sucia pero rápida” directamente a la amígdala (12 ms). Reaccionamos antes de saber qué es.'},
  {ids:['occipital','temporal'], t:'Vía lenta: tálamo → corteza', x:'A la vez, la corteza analiza el estímulo con detalle y le dice a la amígdala si era una serpiente o un palo.', from:'talamo'},
  {ids:['hipotalamo','locus','mesencefalo'], t:'Respuesta de miedo', x:'La amígdala (núcleo central) dispara al hipotálamo (hormonas, simpático), al locus coeruleus (alerta) y a la sustancia gris periacueductal del mesencéfalo (quedarse paralizado o huir).', from:'amigdala'},
  {ids:['hipocampo'], t:'Hipocampo: el contexto', x:'El hipocampo aporta el contexto: el miedo se asocia al lugar (condicionamiento contextual). En el TEPT el contexto deja de “apagar” el miedo.', from:'amigdala'},
  {ids:['prefrontal','cing_ant'], t:'Prefrontal: el freno (extinción)', x:'La corteza prefrontal ventromedial aprende que el estímulo ya no es peligroso e inhibe a la amígdala. Es lo que hace la <b>terapia de exposición</b>: no borra el miedo, enseña a frenarlo. Si el freno falla: ansiedad, fobias, TEPT.', from:'amigdala'}
 ]},
 {id:'auditiva', name:'Vía auditiva', sub:'Del oído a la comprensión', flow:true, steps:[
  {ids:['bulbo'], t:'Núcleos cocleares (bulbo)', x:'El nervio auditivo (VIII par) entra en el tronco y llega a los núcleos cocleares del bulbo.'},
  {ids:['protuberancia'], t:'Complejo olivar superior (puente)', x:'En el puente, el complejo olivar superior compara los dos oídos para localizar de dónde viene el sonido (diferencias de tiempo e intensidad).'},
  {ids:['mesencefalo'], t:'Colículo inferior (mesencéfalo)', x:'El lemnisco lateral sube al colículo inferior, que integra y participa en el reflejo de sobresalto.'},
  {ids:['talamo'], t:'Tálamo (geniculado medial)', x:'Del colículo al núcleo geniculado <b>medial</b> del tálamo.'},
  {ids:['auditiva'], t:'Corteza auditiva primaria', x:'Y de ahí a los giros de Heschl: mapa tonotópico de frecuencias.'},
  {ids:['wernicke','g_tsup'], t:'Corteza de asociación', x:'Las áreas secundarias y Wernicke convierten el sonido en palabras con significado; el surco temporal superior reconoce voces. La vía es bilateral: por eso una lesión unilateral no produce sordera.'}
 ]},
 {id:'sueno', name:'Sueño y vigilia', sub:'El interruptor del tronco y el reloj del hipotálamo', flow:false, steps:[
  {ids:['protuberancia','mesencefalo'], t:'Sistema reticular activador', x:'En el tronco, la <b>formación reticular</b> y los núcleos colinérgicos del puente mantienen despierta a la corteza a través del tálamo. Su lesión produce coma (Moruzzi y Magoun, 1949).'},
  {ids:['locus','rafe'], t:'Aminas de la vigilia', x:'Noradrenalina (locus coeruleus), serotonina (rafe) e histamina (hipotálamo) están activas en vigilia, bajan en el sueño lento y se apagan del todo en el REM. Los antihistamínicos dan sueño por esto.'},
  {ids:['hipotalamo'], t:'Hipotálamo: el interruptor y el reloj', x:'El núcleo preóptico ventrolateral (GABA) “apaga” los sistemas de vigilia: es el interruptor del sueño. La orexina del hipotálamo lateral lo estabiliza (narcolepsia si falta). El núcleo supraquiasmático marca el ritmo de 24 h.'},
  {ids:['pineal'], t:'Melatonina', x:'El reloj avisa a la pineal, que segrega melatonina en la oscuridad: señal hormonal de “es de noche”.'},
  {ids:['talamo'], t:'Tálamo: husos y ondas lentas', x:'Durante el sueño no REM el tálamo genera los husos del sueño y las ondas lentas que desconectan la corteza del exterior.'},
  {ids:['protuberancia','hipocampo'], t:'Sueño REM y memoria', x:'El puente genera el REM (ondas PGO, atonía). Durante el sueño el hipocampo “repite” lo aprendido de día y lo transfiere a la corteza: dormir consolida la memoria.'}
 ]},
 {id:'lateralizacion', name:'Lateralización y cerebro dividido', sub:'Dos hemisferios, dos estilos', flow:false, steps:[
  {ids:['calloso'], t:'Cuerpo calloso', x:'Los dos hemisferios se comunican por el cuerpo calloso. Cuando se secciona (callosotomía para la epilepsia) cada uno queda “a solas” con lo que percibe.'},
  {ids:['broca','wernicke','arqueado'], t:'Hemisferio izquierdo: lenguaje', x:'En el 95 % de los diestros el lenguaje está a la izquierda. El paciente con cerebro dividido puede <b>nombrar</b> solo lo que ve en el campo visual derecho (hemisferio izquierdo).'},
  {ids:['parietal','fusiforme'], t:'Hemisferio derecho: espacio y caras', x:'El derecho domina la atención espacial (heminegligencia si se lesiona), el reconocimiento de caras, la prosodia emocional y la música. Puede <b>señalar</b> con la mano izquierda lo que no puede nombrar.'},
  {ids:['optico','visual'], t:'Por qué funciona el experimento', x:'Gracias al cruce del quiasma, lo que se presenta a la izquierda del punto de fijación llega solo al hemisferio derecho. Sperry y Gazzaniga lo usaron para “hablar” con cada hemisferio por separado.'},
  {ids:['prefrontal'], t:'El “intérprete”', x:'Gazzaniga llamó “intérprete” al hemisferio izquierdo: inventa explicaciones coherentes para lo que hace el derecho sin saber por qué. Base de muchas confabulaciones cotidianas.'}
 ]},
 {id:'atencion', name:'Redes de la atención', sub:'Saliencia, control ejecutivo y red por defecto', flow:false, steps:[
  {ids:['insula','cing_ant'], t:'Red de saliencia', x:'La ínsula anterior y el cingulado anterior detectan qué estímulo (externo o interno) merece atención y deciden si conectar la red ejecutiva o la red por defecto (Seeley, 2007; Menon, 2011).'},
  {ids:['prefrontal','parietal'], t:'Red frontoparietal (ejecutiva, dorsal)', x:'La prefrontal dorsolateral y la parietal superior dirigen la atención voluntaria (“de arriba abajo”): buscar unas llaves, seguir una clase.'},
  {ids:['g_supramarg','g_finf'], t:'Red ventral (reorientación)', x:'La unión temporo-parietal y el giro frontal inferior, sobre todo del hemisferio <b>derecho</b>, capturan la atención ante lo inesperado (“de abajo arriba”). Su lesión produce heminegligencia (Corbetta y Shulman, 2002).'},
  {ids:['cing_post','prefrontal'], t:'Red neuronal por defecto', x:'Cingulado posterior, prefrontal medial y giro angular se activan cuando no atendemos a nada en concreto: recuerdos, planes, rumiación. Se desactiva al atender; hiperactiva en la depresión.'},
  {ids:['talamo','locus'], t:'Alerta', x:'El nivel general de alerta depende del locus coeruleus (noradrenalina) y del tálamo. Posner (1990): tres redes, alerta, orientación y control ejecutivo, cada una con su anatomía y su neurotransmisor.'}
 ]}
];

/* ---------- Casos clínicos (modo quiz): ans = ids aceptados como respuesta ---------- */
const CASES = [
 {sym:'Habla con fluidez y buena entonación, pero lo que dice no tiene sentido (“la mesa del cielo come rápido”). No entiende las órdenes y no parece darse cuenta de su problema.', ans:['wernicke','g_tsup','ba22'], name:'Afasia de Wernicke', expl:'Lesión del área de Wernicke (temporal superior posterior izquierdo).'},
 {sym:'Entiende lo que se le dice, pero habla muy despacio, con esfuerzo, con frases de dos o tres palabras sin artículos ni verbos conjugados. Se frustra. Tiene el brazo derecho débil.', ans:['broca','g_finf','ba4445'], name:'Afasia de Broca', expl:'Lesión del área de Broca (frontal inferior izquierdo), cerca de la corteza motora de la cara y la mano.'},
 {sym:'Habla y comprende bastante bien, pero es incapaz de repetir una frase que acaba de oír; lo intenta y se equivoca en los sonidos.', ans:['arqueado','g_supramarg'], name:'Afasia de conducción', expl:'Lesión del fascículo arqueado, que une Wernicke con Broca.'},
 {sym:'Tras un ictus, come solo la mitad derecha del plato, se afeita media cara y al dibujar un reloj pone todos los números a la derecha.', ans:['parietal','g_supramarg','g_angular','ba57','ba40'], name:'Heminegligencia', expl:'Lesión del lóbulo parietal derecho (unión temporo-parietal).'},
 {sym:'Desde una operación en 1953 no recuerda nada nuevo: saluda al médico cada día como si fuera la primera vez. Sin embargo, mejora día a día en una tarea de dibujo en espejo.', ans:['hipocampo','parahipocampal','ba28'], name:'Amnesia anterógrada (H.M.)', expl:'Resección bilateral del lóbulo temporal medial (hipocampo y corteza entorrinal).'},
 {sym:'Alcohólico de larga evolución. No recuerda lo que hizo esta mañana, pero lo cuenta con todo detalle… inventándolo sin saber que miente.', ans:['mamilares','talamo','hipotalamo'], name:'Síndrome de Korsakoff', expl:'Déficit de tiamina: atrofia de los cuerpos mamilares y del tálamo dorsomedial. Confabulación.'},
 {sym:'Temblor en las manos cuando está en reposo, rigidez, pasos cortos y cara inexpresiva. Mejora con L-DOPA.', ans:['negra','putamen','mesencefalo'], name:'Enfermedad de Parkinson', expl:'Pérdida de las neuronas dopaminérgicas de la sustancia negra; falta dopamina en el putamen.'},
 {sym:'A los 40 años empieza con movimientos involuntarios de brazos y cara como si bailara, irritabilidad y pérdida de memoria. Su padre murió de lo mismo.', ans:['caudado','putamen'], name:'Enfermedad de Huntington', expl:'Degeneración del núcleo caudado (y putamen). Hereditaria autosómica dominante.'},
 {sym:'Tras un accidente ve perfectamente, pero no reconoce la cara de su mujer hasta que la oye hablar. Tampoco se reconoce en el espejo.', ans:['fusiforme','g_tinf','ba37'], name:'Prosopagnosia', expl:'Lesión del giro fusiforme (área de las caras), sobre todo derecho.'},
 {sym:'Sus ojos están sanos y las pupilas reaccionan, pero no ve nada… y niega estar ciego: dice que la habitación está oscura.', ans:['visual','occipital','ba17','s_calcarina'], name:'Ceguera cortical (síndrome de Anton)', expl:'Lesión bilateral de la corteza visual primaria (calcarina).'},
 {sym:'Camina tambaleándose con las piernas separadas, al señalar su nariz se pasa de largo y habla con la voz entrecortada. No ha bebido.', ans:['cerebelo'], name:'Ataxia cerebelosa', expl:'Lesión del cerebelo (vermis para la marcha, hemisferios para las extremidades).'},
 {sym:'Un capataz de obra ejemplar sufre un accidente con una barra de hierro. Sobrevive, pero se vuelve grosero, impulsivo, caprichoso e incapaz de mantener un plan.', ans:['prefrontal','orbitofrontal','frontal','ba11','ba10'], name:'Phineas Gage: síndrome prefrontal ventromedial', expl:'Lesión de la corteza prefrontal ventromedial / orbitofrontal.'},
 {sym:'Tras extirpar ambos lóbulos temporales anteriores, un mono deja de tener miedo a las serpientes, se lleva todo a la boca y muestra conducta sexual indiscriminada.', ans:['amigdala','temporal','ba38'], name:'Síndrome de Klüver-Bucy', expl:'Lesión temporal anterior bilateral, incluida la amígdala.'},
 {sym:'Está totalmente consciente y lo entiende todo, pero no puede mover nada excepto los ojos hacia arriba y abajo. Se comunica parpadeando.', ans:['protuberancia'], name:'Síndrome de enclaustramiento', expl:'Infarto de la base de la protuberancia (vía corticoespinal y corticobulbar).'},
 {sym:'Una mujer no siente miedo: toca serpientes, se acerca a desconocidos amenazantes y no reconoce la expresión de miedo en las caras. Su inteligencia es normal.', ans:['amigdala'], name:'Paciente S.M. (Urbach-Wiethe)', expl:'Calcificación bilateral de la amígdala.'},
 {sym:'Pierde la visión de los lados (choca con los marcos de las puertas), tiene dolores de cabeza y le ha crecido la nariz y las manos.', ans:['hipofisis','optico'], name:'Adenoma hipofisario con compresión del quiasma', expl:'Tumor de la hipófisis (acromegalia por GH) que comprime el quiasma óptico: hemianopsia bitemporal.'},
 {sym:'No puede calcular, no sabe escribir, confunde derecha e izquierda y no identifica qué dedo le tocan.', ans:['g_angular','parietal','ba39'], name:'Síndrome de Gerstmann', expl:'Lesión del giro angular del hemisferio izquierdo.'},
 {sym:'Tras una cirugía para la epilepsia, no puede nombrar los objetos que le ponen en la mano izquierda, aunque los usa correctamente. Su mano izquierda a veces desabrocha lo que la derecha abrocha.', ans:['calloso'], name:'Síndrome de desconexión (cerebro dividido)', expl:'Callosotomía: la información táctil de la mano izquierda (hemisferio derecho) no llega al hemisferio del lenguaje.'},
 {sym:'De repente lanza el brazo y la pierna izquierdos con movimientos amplios e incontrolables, como si tirara algo.', ans:['subtalamico'], name:'Hemibalismo', expl:'Lesión del núcleo subtalámico contralateral (habitualmente un ictus).'},
 {sym:'Joven que se queda dormido de golpe en clase varias veces al día y, cuando se ríe, se le aflojan las piernas y cae.', ans:['hipotalamo'], name:'Narcolepsia con cataplejía', expl:'Pérdida de las neuronas de orexina del hipotálamo lateral.'},
 {sym:'Deja de fumar de un día para otro, sin esfuerzo y sin deseo, tras un ictus. Dice que “su cuerpo olvidó la necesidad de fumar”.', ans:['insula'], name:'Lesión insular y adicción', expl:'Lesión de la ínsula (Naqvi y cols., 2007): desaparece el craving interoceptivo.'},
 {sym:'Mujer de 78 años: olvida las conversaciones recientes, repite las mismas preguntas, se perdió volviendo del mercado. Su resonancia muestra atrofia del lóbulo temporal medial.', ans:['hipocampo','parahipocampal','ba28'], name:'Enfermedad de Alzheimer (inicio)', expl:'Degeneración de la corteza entorrinal y el hipocampo (estadios de Braak).'},
 {sym:'Anciano con marcha de pasos cortos “pegados al suelo”, incontinencia urinaria y deterioro de memoria. En la TAC los ventrículos están muy grandes. Mejora tras colocar una válvula.', ans:['ventriculos'], name:'Hidrocefalia normotensiva', expl:'Acumulación de LCR con dilatación ventricular; una de las pocas demencias tratables.'},
 {sym:'Tras un traumatismo en la frente ha perdido el olfato por completo y la comida “no sabe a nada”.', ans:['olfatorio','orbitofrontal'], name:'Anosmia postraumática', expl:'Cizallamiento de los axones olfatorios en la lámina cribosa; los bulbos olfatorios quedan desconectados.'},
 {sym:'Durante meses se despierta sobresaltado, está siempre en guardia, cualquier ruido le hace saltar y revive el accidente con todo detalle sensorial. Su cortisol basal es bajo pero su respuesta de alarma, exagerada.', ans:['amigdala','locus','hipocampo'], name:'Trastorno de estrés postraumático', expl:'Hiperreactividad de la amígdala y del locus coeruleus; el hipocampo y la prefrontal no contextualizan ni frenan el miedo.'},
 {sym:'Paciente con depresión resistente a todo tratamiento. Le implantan electrodos en una zona de la cara medial del lóbulo frontal, bajo la rodilla del cuerpo calloso, y mejora.', ans:['cing_ant','cingulado','ba2432'], name:'Estimulación cerebral profunda en la depresión', expl:'Corteza cingulada subgenual (área 25), hiperactiva en la depresión (Mayberg).'},
 {sym:'Desde un ictus, el mundo le parece una serie de fotos fijas: ve el café “congelado” en el aire y de repente la taza está llena.', ans:['occipital','g_tmed','ba1819'], name:'Acinetopsia', expl:'Lesión bilateral del área V5/MT (unión temporo-occipital).'},
 {sym:'Tras la cirugía de un tumor cerca del tercer ventrículo, no consigue retener información nueva, aunque reconoce lo que ya sabía.', ans:['fornix'], name:'Amnesia por lesión del fórnix', expl:'Interrupción de la salida del hipocampo hacia los cuerpos mamilares.'}
];

/* ---------- Glosario ---------- */
const GLOSSARY = [
 ['Aferente / eferente','Aferente: fibra o señal que <i>llega</i> a una estructura. Eferente: la que <i>sale</i> de ella. (A de “arriba”/llegar; E de “exit”.)'],
 ['Anterior / posterior','Hacia la frente / hacia la nuca. Sinónimos en el encéfalo: rostral / caudal.'],
 ['Superior / inferior','Hacia arriba / hacia abajo. Sinónimos: dorsal / ventral (en el encéfalo humano, por la flexión del eje).'],
 ['Medial / lateral','Hacia la línea media / hacia los lados.'],
 ['Ipsilateral / contralateral','Del mismo lado / del lado opuesto. La mayoría de las vías motoras y sensitivas son contralaterales; el cerebelo es ipsilateral.'],
 ['Plano sagital','Corte vertical que divide en izquierda y derecha. “Sagital medio” = por la línea media.'],
 ['Plano coronal (frontal)','Corte vertical de oreja a oreja: divide en anterior y posterior.'],
 ['Plano axial (horizontal, transversal)','Corte horizontal: divide en superior e inferior. Es el plano habitual de la TAC.'],
 ['Sustancia gris','Cuerpos neuronales y dendritas: corteza y núcleos. Color grisáceo.'],
 ['Sustancia blanca','Axones mielinizados (la mielina es blanca). Forma los haces que conectan regiones.'],
 ['Núcleo','Grupo de cuerpos neuronales dentro del sistema nervioso central (p. ej. núcleo caudado).'],
 ['Ganglio','Grupo de cuerpos neuronales en el sistema nervioso periférico. Los “ganglios basales” son una excepción histórica: en realidad son núcleos.'],
 ['Giro (circunvolución)','Pliegue saliente de la corteza. Surco: hendidura entre giros. Cisura: surco muy profundo.'],
 ['Corteza','Capa externa de sustancia gris del cerebro (2–4 mm, seis capas en la neocorteza) y del cerebelo.'],
 ['Comisura','Haz de fibras que cruza de un hemisferio al otro (cuerpo calloso, comisura anterior).'],
 ['Fascículo / tracto / haz','Conjunto de axones que recorren juntos un trayecto (fascículo arqueado, tracto corticoespinal).'],
 ['Decusación','Cruce de fibras de un lado al otro (decusación de las pirámides en el bulbo).'],
 ['Vía piramidal (corticoespinal)','Vía motora voluntaria: de la corteza motora, por la cápsula interna, se cruza en el bulbo y baja por la médula.'],
 ['Sistema extrapiramidal','Término clásico para los circuitos motores que no son la vía piramidal: ganglios basales y sus conexiones. “Efectos extrapiramidales” de los antipsicóticos = parkinsonismo, distonía, acatisia.'],
 ['Diencéfalo','Tálamo, hipotálamo, epitálamo (pineal) y subtálamo.'],
 ['Telencéfalo','Hemisferios cerebrales: corteza, sustancia blanca y ganglios basales.'],
 ['Tronco encefálico','Mesencéfalo, protuberancia y bulbo raquídeo.'],
 ['Prosencéfalo basal','Región bajo el cuerpo estriado con los núcleos colinérgicos (septo, núcleo basal de Meynert).'],
 ['Formación reticular','Red de neuronas del tronco que regula la vigilia, el tono muscular y funciones vitales.'],
 ['Sistema límbico','Conjunto de estructuras ligadas a la emoción y la memoria: hipocampo, amígdala, cingulado, fórnix, cuerpos mamilares, septo… Término de MacLean (1952).'],
 ['Homúnculo','Mapa del cuerpo sobre la corteza motora (precentral) o sensorial (poscentral); las partes más sensibles o precisas ocupan más superficie.'],
 ['Somatotopía / retinotopía / tonotopía','Organización en mapa del cuerpo, de la retina o de las frecuencias sonoras sobre una estructura.'],
 ['Áreas de Brodmann','52 regiones de la corteza numeradas por Brodmann (1909) según su citoarquitectura. Se siguen usando como coordenadas.'],
 ['Afasia','Trastorno del lenguaje por lesión cerebral. De Broca (no fluente), de Wernicke (fluente), de conducción (repetición), global, anómica.'],
 ['Agnosia','Incapacidad de reconocer estímulos pese a percibirlos (visual, auditiva, táctil, prosopagnosia).'],
 ['Apraxia','Incapacidad de realizar movimientos aprendidos a la orden sin parálisis.'],
 ['Amnesia anterógrada / retrógrada','Incapacidad de formar recuerdos nuevos / de recuperar recuerdos anteriores a la lesión.'],
 ['Anosognosia','Falta de conciencia de la propia enfermedad o déficit.'],
 ['Confabulación','Relleno involuntario de lagunas de memoria con información falsa que el paciente cree verdadera (Korsakoff).'],
 ['Hemianopsia','Pérdida de la mitad del campo visual. Homónima: la misma mitad en ambos ojos (lesión tras el quiasma). Bitemporal: las mitades externas (lesión del quiasma).'],
 ['Hemiparesia / hemiplejía','Debilidad / parálisis de medio cuerpo.'],
 ['Ataxia','Falta de coordinación del movimiento (cerebelo o sus vías).'],
 ['Corea','Movimientos involuntarios breves, irregulares, “danzantes” (Huntington).'],
 ['Bradicinesia','Lentitud de movimientos (Parkinson).'],
 ['LTP (potenciación a largo plazo)','Fortalecimiento duradero de una sinapsis tras actividad intensa; base celular del aprendizaje (hipocampo, receptores NMDA).'],
 ['Neurotransmisor','Sustancia que una neurona libera para comunicarse con otra: glutamato, GABA, dopamina, serotonina, noradrenalina, acetilcolina…'],
 ['Neuromodulador','Neurotransmisor que, en lugar de excitar o inhibir directamente, cambia cómo responden grandes regiones (dopamina, serotonina, noradrenalina, acetilcolina).'],
 ['ISRS','Inhibidores selectivos de la recaptación de serotonina (fluoxetina, sertralina, escitalopram…). Antidepresivos de primera línea.'],
 ['L-DOPA','Precursor de la dopamina; tratamiento del Parkinson (la dopamina no cruza la barrera hematoencefálica).'],
 ['Antipsicóticos','Fármacos que bloquean los receptores D2 de la dopamina (típicos) o D2 y 5-HT2A (atípicos).'],
 ['ECP (estimulación cerebral profunda)','Electrodos implantados que estimulan un núcleo (subtalámico, pálido, cingulado subgenual).'],
 ['EMT (estimulación magnética transcraneal)','Estimulación no invasiva de la corteza con pulsos magnéticos; tratamiento de la depresión (DLPFC).'],
 ['Eje HHS','Eje hipotálamo-hipófisis-suprarrenal: CRH → ACTH → cortisol. Respuesta hormonal al estrés.'],
 ['Sistema nervioso autónomo','Simpático (lucha o huida, noradrenalina) y parasimpático (reposo y digestión, acetilcolina, nervio vago).'],
 ['LCR','Líquido cefalorraquídeo: llena los ventrículos y rodea el encéfalo y la médula.'],
 ['Barrera hematoencefálica','Pared selectiva de los capilares cerebrales que impide el paso de muchas sustancias desde la sangre.'],
 ['TEPT','Trastorno de estrés postraumático.'],
 ['TOC','Trastorno obsesivo-compulsivo.'],
 ['TDAH','Trastorno por déficit de atención e hiperactividad.'],
 ['Red neuronal por defecto','Conjunto de regiones (cingulado posterior, prefrontal medial, giro angular) activas en reposo y durante el pensamiento autorreferencial.'],
 ['Red de saliencia','Ínsula anterior y cingulado anterior: detectan qué estímulo merece atención.'],
 ['Vía dorsal / ventral','Dos corrientes del procesamiento visual: dorsal (occipital → parietal, “dónde/cómo”) y ventral (occipital → temporal, “qué”).'],
 ['Neurogénesis adulta','Nacimiento de neuronas nuevas en el adulto; clara en roedores (giro dentado, bulbo olfatorio), discutida en humanos.'],
 ['Plasticidad','Capacidad del sistema nervioso de cambiar su estructura y función con la experiencia o tras una lesión.'],
 ['fMRI / PET','Resonancia magnética funcional (flujo sanguíneo) y tomografía por emisión de positrones (metabolismo, receptores): técnicas para ver el cerebro en acción.'],
 ['Tractografía','Técnica de resonancia (difusión) que reconstruye los haces de sustancia blanca.']
];

/* ---------- Cortes clásicos (plano, posición -100..100, flip, vista de cámara) ---------- */
const PRESET_CUTS = [
 {id:'sagmed', name:'Sagital medio', desc:'Cara medial completa: cuerpo calloso, cingulado, tálamo, tronco y cerebelo (árbol de la vida).', mode:'sag', pos:0, flip:false},
 {id:'coramig', name:'Coronal por la amígdala', desc:'Corte a la altura del polo temporal: amígdala, accumbens, cabeza del caudado, putamen e ínsula.', mode:'cor', pos:22, flip:false},
 {id:'corbas', name:'Coronal por los ganglios basales', desc:'Corte por el tálamo: tálamo, caudado, putamen, pálido, cápsula interna e hipocampo.', mode:'cor', pos:-5, flip:false},
 {id:'axital', name:'Axial por el tálamo', desc:'Corte horizontal como una TAC: ventrículos laterales, caudado, tálamo, putamen e ínsula.', mode:'axi', pos:0, flip:false},
 {id:'axibaj', name:'Axial por el tronco', desc:'Corte bajo: amígdala, hipocampo, mesencéfalo y cerebelo.', mode:'axi', pos:-45, flip:false}
];
