/* PRUEBA DE TERCERO BÁSICO — simulación educativa. Todo ocurre en el navegador y en memoria. */

/* ============ CONFIGURACIÓN DEL DETECTOR (modifique aquí) ============ */
// HEAD_TURN_THRESHOLD: cuánto puede desviarse la nariz del centro del rostro (0.5 = centro exacto).
//   0.18 = giro claro. Súbalo (0.22) para ser más tolerante; bájelo (0.12) para ser más estricto.
const HEAD_TURN_THRESHOLD = 0.18;
// TURN_HOLD_MS: tiempo que la cabeza debe permanecer girada antes de mostrar la advertencia.
const TURN_HOLD_MS = 1500;
// NO_FACE_TIMEOUT: milisegundos sin detectar rostro antes de mostrar la advertencia.
const NO_FACE_TIMEOUT = 2000;
// WARNING_SECONDS: segundos de cuenta regresiva antes de pausar la prueba.
const WARNING_SECONDS = 3;
const DETECT_INTERVAL_MS = 200;
const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
const MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

/* ============ PREGUNTAS (originales) ============ */
// Formato: [textoIndex(-1 = ninguno), pregunta, correcta, [3 incorrectas], posición de la correcta 0-3]
const build = a => a.map(([t, q, c, w, p]) => { const o = [...w]; o.splice(p, 0, c); return { t, q, o, a: p }; });
const PASSAGES = [
  'Las abejas no solo producen miel. Al viajar de flor en flor transportan polen, y gracias a ello muchas plantas pueden reproducirse. Sin embargo, el uso excesivo de pesticidas ha reducido sus colonias, lo que amenaza tanto a los cultivos como a la biodiversidad.',
  'Cuando Marta llegó a la estación, el tren ya se había marchado. Miró el reloj, suspiró y sacó su cuaderno. «Al menos tendré tiempo de terminar el poema», pensó, mientras el viento movía las hojas del andén.',
  'Algunos afirman que las tareas escolares deben eliminarse porque cansan a los estudiantes. Otros sostienen que, bien planificadas, refuerzan lo aprendido y desarrollan la responsabilidad. El problema, entonces, no parece ser la tarea en sí, sino su cantidad y su calidad.',
  'Leer todos los días amplía el vocabulario, mejora la ortografía y estimula la imaginación. Por eso, muchos maestros recomiendan dedicar al menos quince minutos diarios a la lectura.'
];
const MATE = build([
  [-1, 'Resuelva: 3x − 7 = 2x + 5. ¿Cuál es el valor de x?', '12', ['2', '−2', '8'], 1],
  [-1, 'Si x + y = 10 y x − y = 4, ¿cuánto vale x · y?', '21', ['18', '24', '12'], 0],
  [-1, 'Un artículo cuesta Q250. Se rebaja 40% y luego se aumenta 20% sobre el precio rebajado. ¿Cuál es el precio final?', 'Q180', ['Q170', 'Q190', 'Q200'], 2],
  [-1, 'Un triángulo rectángulo tiene catetos de 9 cm y 12 cm. ¿Cuál es su perímetro?', '36 cm', ['30 cm', '42 cm', '45 cm'], 0],
  [-1, 'Una bolsa tiene 5 bolas rojas, 3 azules y 2 verdes. Se sacan dos bolas sin devolverlas. ¿Cuál es la probabilidad de que ambas sean rojas?', '2/9', ['1/4', '1/5', '4/9'], 1],
  [-1, '¿Cuántos números de 3 cifras distintas se pueden formar con los dígitos 1, 2, 3, 4 y 5?', '60', ['120', '125', '15'], 2],
  [-1, 'Si f(x) = 2x² − 3x + 1, ¿cuánto vale f(3)?', '10', ['16', '12', '8'], 2],
  [-1, 'En la sucesión 3, 7, 11, 15, …, ¿cuál es el término número 20?', '79', ['83', '80', '75'], 0],
  [-1, 'Las soluciones de x² − 5x + 6 = 0 son a y b. ¿Cuánto vale a² + b²?', '13', ['11', '25', '5'], 1],
  [-1, 'Un círculo tiene radio 7 cm. Usando π = 22/7, ¿cuál es su área?', '154 cm²', ['44 cm²', '49 cm²', '308 cm²'], 3],
  [-1, 'Un gráfico de barras muestra las ventas: enero 30, febrero 45, marzo 60 y abril 45. ¿Qué porcentaje del total vendió marzo, aproximadamente?', '33%', ['25%', '30%', '40%'], 2],
  [-1, 'Seis obreros construyen un muro en 8 días. Con el mismo ritmo, ¿cuánto tardarían 4 obreros?', '12 días', ['10 días', '16 días', '14 días'], 0],
  [-1, 'Si 2x + 3y = 12 y 4x − y = 10, ¿cuánto vale x + y?', '5', ['6', '7', '4'], 2],
  [-1, 'Se depositan Q2,000 a 6% de interés simple anual durante 3 años. ¿Cuál es el monto final?', 'Q2,360', ['Q2,120', 'Q2,180', 'Q2,600'], 3],
  [-1, '¿Cuánto suman los ángulos interiores de un hexágono?', '720°', ['540°', '900°', '1080°'], 0],
  [-1, '¿Cuál es el menor número entero que cumple 3x − 5 > 10?', '6', ['5', '4', '7'], 3],
  [-1, 'Un prisma mide 5 × 4 × 3 cm. Si se duplican las tres aristas, ¿cuál es su nuevo volumen?', '480 cm³', ['120 cm³', '240 cm³', '360 cm³'], 2],
  [-1, 'Cinco números tienen promedio 12. Al agregar un sexto número, el promedio sube a 13. ¿Cuál es ese número?', '18', ['15', '20', '25'], 3],
  [-1, 'Se lanza una moneda 3 veces. ¿Cuál es la probabilidad de obtener al menos una cara?', '7/8', ['1/8', '3/8', '1/2'], 2],
  [-1, 'Simplifique: (x + 3y)² − (x − 3y)²', '12xy', ['6xy', '18y²', '12y²'], 0],
  [-1, 'Una función lineal pasa por los puntos (1, 3) y (3, 9) y por el origen. ¿Cuánto vale f(10)?', '30', ['27', '33', '36'], 1],
  [-1, '¿De cuántas formas se puede formar un comité de 3 personas a partir de 6 candidatos?', '20', ['18', '36', '120'], 3],
  [-1, 'Un padre tiene 4 veces la edad de su hijo. Dentro de 5 años tendrá 3 veces su edad. ¿Cuántos años tiene hoy el hijo?', '10', ['8', '12', '15'], 0],
  [-1, '¿Cuál es la distancia entre los puntos (1, 2) y (7, 10)?', '10', ['8', '12', '14'], 2],
  [-1, 'Una mezcla de 40 litros tiene leche y agua en razón 3 : 2. ¿Cuántos litros de agua contiene?', '16 L', ['12 L', '24 L', '20 L'], 1]
]);
const LANG = build([
  [0, '¿Cuál es la idea principal del texto?', 'La disminución de las abejas amenaza a las plantas y a la biodiversidad.', ['Las abejas producen miel de excelente calidad.', 'Los pesticidas son económicos.', 'Las flores necesitan más agua.'], 1],
  [0, 'Se puede inferir que, si desaparecieran las abejas…', 'muchos cultivos se verían afectados.', ['aumentaría la producción de miel.', 'dejarían de usarse pesticidas.', 'las flores crecerían más rápido.'], 3],
  [0, 'En el texto, «amenaza» significa:', 'pone en riesgo', ['anuncia una fiesta', 'celebra un logro', 'mejora una situación'], 0],
  [1, '¿Por qué suspiró Marta?', 'Porque perdió el tren y tendría que esperar.', ['Porque estaba feliz de llegar.', 'Porque había olvidado su cuaderno.', 'Porque el poema estaba terminado.'], 2],
  [1, '¿Qué actitud muestra Marta ante el contratiempo?', 'Aprovecha el tiempo de forma positiva.', ['Se enfurece con el empleado.', 'Decide regresar a casa.', 'Se queda dormida.'], 1],
  [2, '¿Cuál es la conclusión del autor?', 'El problema es la cantidad y la calidad de las tareas.', ['Las tareas deben eliminarse.', 'Los estudiantes no se cansan.', 'Las tareas deben duplicarse.'], 3],
  [2, '¿Qué relación hay entre las dos posturas del texto?', 'Son opuestas (contraste).', ['Son idénticas.', 'Una causa la otra.', 'Una es ejemplo de la otra.'], 0],
  [-1, '¿Qué oración tiene el verbo correctamente conjugado?', 'Ayer nosotros fuimos al mercado.', ['Ayer nosotros fuemos al mercado.', 'Ayer nosotros irimos al mercado.', 'Ayer nosotros fueron al mercado.'], 2],
  [-1, '¿Cuál palabra está bien escrita?', 'exhibición', ['exivición', 'exhivición', 'esibición'], 1],
  [-1, '¿Cuál oración está bien acentuada?', 'Tú ganaste el premio.', ['El sabia la respuesta.', 'Mi hermano dijo que si vendra.', 'Que hora es.'], 3],
  [-1, 'En «Ese joven es muy ávido de conocimientos», «ávido» significa:', 'deseoso', ['cansado', 'temeroso', 'olvidadizo'], 0],
  [-1, '¿Qué significa «elocuente»?', 'Que se expresa con fluidez y fuerza.', ['Que habla muy poco.', 'Que es muy alto.', 'Que escribe con errores.'], 2],
  [-1, '¿Cuál es el antónimo de «efímero»?', 'duradero', ['breve', 'pasajero', 'fugaz'], 1],
  [-1, '¿Qué oración tiene concordancia correcta?', 'Los niños jugaban felices en el parque.', ['Los niños jugaba felices en el parque.', 'La niños jugaban felices en el parque.', 'Los niño jugaban felices en el parque.'], 0],
  [-1, 'En «Ana estudió toda la noche; sin embargo, olvidó su cuaderno», «sin embargo» expresa:', 'contraste', ['causa', 'tiempo', 'finalidad'], 2],
  [3, '¿Cuál es la idea principal del texto?', 'Leer a diario ofrece beneficios y se recomienda practicarlo.', ['Los maestros no leen.', 'La ortografía no se puede mejorar.', 'Quince minutos son demasiado tiempo.'], 3],
  [3, '¿Qué función cumple «Por eso» en el texto?', 'Introduce una consecuencia.', ['Introduce un ejemplo.', 'Introduce una duda.', 'Introduce una contradicción.'], 1],
  [-1, '«Sus ojos eran dos luceros» es un ejemplo de:', 'metáfora', ['comparación', 'hipérbole', 'onomatopeya'], 0],
  [-1, '«El viento susurraba secretos» es un ejemplo de:', 'personificación', ['metáfora', 'antítesis', 'rima'], 2],
  [-1, 'Un texto breve con animales que hablan y deja una enseñanza es una:', 'fábula', ['noticia', 'receta', 'carta'], 3],
  [-1, '¿Qué oración usa bien la coma?', 'Compré manzanas, peras, uvas y fresas.', ['Compré, manzanas peras uvas y fresas.', 'Compré manzanas peras, uvas, y fresas.', 'Compré manzanas peras uvas, y fresas,'], 1],
  [-1, 'En «Llovió tanto que el río se desbordó», la relación entre las ideas es de:', 'causa y consecuencia', ['contraste', 'comparación', 'orden temporal'], 0],
  [-1, '¿Cuál de estas oraciones expresa una opinión?', 'Ese es el mejor equipo del país.', ['El equipo ganó tres partidos.', 'El estadio tiene cuatro puertas.', 'El partido comenzó a las 3:00.'], 2],
  [-1, '¿Cuál oración usa correctamente «haber»?', 'Debe haber llegado temprano.', ['Debe a ver llegado temprano.', 'Debe haver llegado temprano.', 'Debe aver llegado temprano.'], 3],
  [1, 'Al decir «el viento movía las hojas del andén», el autor crea un ambiente de:', 'soledad y calma', ['fiesta y ruido', 'peligro y persecución', 'humor y burla'], 0]
]);

/* ============ ESTADO EN MEMORIA (nada se guarda) ============ */
const $ = id => document.getElementById(id);
const NAMES = { mate: 'MATEMÁTICA', lang: 'COMUNICACIÓN Y LENGUAJE' };
const state = { code: '', area: '', results: {}, checks: {} };
let stream = null, landmarker = null;
let quiz = { qs: [], ans: [], i: 0 };
let mTimer = null, wTimer = null, warning = false, paused = false, badSince = 0;

function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === 's-' + id));
  window.scrollTo(0, 0);
}

/* ============ CÁMARA (sin audio) ============ */
async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' }, audio: false });
    attach($('v-cam'));
    $('cam-status').textContent = 'CÁMARA: 🟢 ACTIVA';
    $('b-cam').disabled = false;
    state.checks.cam = true;
    loadDetector();
  } catch (e) {
    $('cam-status').textContent = 'No se pudo activar la cámara. Permita el acceso y use http://localhost (ver README). ' + e.name;
  }
}
function attach(v) { if (stream) { v.srcObject = stream; v.play().catch(() => {}); } }

/* ============ FOTOGRAFÍAS Y DOCUMENTO (Canvas temporal) ============ */
const STEPS = [
  { k: 'front', t: 'VERIFICACIÓN DE FOTOGRAFÍA', x: 'Instrucción: coloque su rostro directamente frente a la cámara.' },
  { k: 'left', t: 'PERFIL IZQUIERDO', x: 'Instrucción: gire su rostro hacia la izquierda.' },
  { k: 'right', t: 'PERFIL DERECHO', x: 'Instrucción: gire su rostro hacia la derecha.' },
  { k: 'doc', t: 'VERIFICACIÓN DE DOCUMENTO', x: 'Esta sección es únicamente una simulación. Utilice una tarjeta ficticia, carnet de práctica u objeto cualquiera.', doc: true }
];
let steps = [], si = 0, afterSteps = null;

function startPhotos(list, done) { steps = list; si = 0; afterSteps = done; showStep(); }
function showStep() {
  const s = steps[si];
  $('ph-title').textContent = s.t; $('ph-text').textContent = s.x;
  $('b-snap').textContent = s.doc ? 'TOMAR CAPTURA' : 'TOMAR FOTOGRAFÍA';
  $('guide').classList.toggle('hidden', !s.doc);
  $('cv').classList.add('hidden'); $('v-photo').classList.remove('hidden');
  $('b-snap').classList.remove('hidden'); $('b-retry').classList.add('hidden'); $('b-accept').classList.add('hidden');
  attach($('v-photo')); show('photo');
}
$('b-snap').onclick = () => {
  const v = $('v-photo'), c = $('cv');
  c.width = v.videoWidth || 640; c.height = v.videoHeight || 480;
  c.getContext('2d').drawImage(v, 0, 0, c.width, c.height); // frame temporal, nunca se guarda ni se envía
  v.classList.add('hidden'); c.classList.remove('hidden');
  $('b-snap').classList.add('hidden'); $('b-retry').classList.remove('hidden'); $('b-accept').classList.remove('hidden');
};
$('b-retry').onclick = () => { clearCanvas(); showStep(); };
$('b-accept').onclick = () => {
  clearCanvas();
  state.checks[steps[si].k] = true;
  if (++si < steps.length) showStep(); else afterSteps();
};
function clearCanvas() { const c = $('cv'); c.getContext('2d').clearRect(0, 0, c.width, c.height); c.width = c.height = 0; }

/* ============ FLUJO INICIAL ============ */
$('b-start').onclick = () => show('code');
$('b-code').onclick = () => {
  const v = $('code').value.trim();
  if (!v) { $('code-err').textContent = 'Escriba su código para continuar.'; return; }
  state.code = v; show('cam'); startCamera();
};
$('code').onkeydown = e => { if (e.key === 'Enter') $('b-code').click(); };
$('b-cam').onclick = () => startPhotos(STEPS, () => { updateMenu(); show('menu'); });

/* ============ MENÚ Y VERIFICACIÓN PREVIA ============ */
function updateMenu() {
  ['mate', 'lang'].forEach(a => {
    const b = $('m-' + a), done = !!state.results[a];
    b.disabled = done; b.textContent = NAMES[a] + (done ? ' ✓' : '');
  });
}
['mate', 'lang'].forEach(a => $('m-' + a).onclick = () => { state.area = a; show('pre'); });
$('b-pre').onclick = () => startPhotos(STEPS.slice(0, 3), () => {
  $('b-ready').textContent = 'INICIAR PRUEBA DE ' + NAMES[state.area]; show('ready');
});
$('b-ready').onclick = () => startQuiz(state.area);

/* ============ PREGUNTAS Y NAVEGACIÓN ============ */
function startQuiz(area) {
  quiz = { qs: area === 'mate' ? MATE : LANG, ans: [], i: 0 };
  paused = false; warning = false; badSince = 0;
  show('quiz'); attach($('v-mini')); renderQ(); startMonitor();
}
function renderQ() {
  const q = quiz.qs[quiz.i];
  $('q-num').textContent = `PREGUNTA ${quiz.i + 1} DE ${quiz.qs.length}`;
  $('q-pass').classList.toggle('hidden', q.t < 0);
  if (q.t >= 0) $('q-pass').textContent = PASSAGES[q.t];
  $('q-text').textContent = q.q;
  $('q-opts').innerHTML = '';
  q.o.forEach((txt, k) => {
    const l = document.createElement('label'); l.className = 'opt';
    const r = document.createElement('input'); r.type = 'radio'; r.name = 'opt'; r.checked = quiz.ans[quiz.i] === k;
    r.onchange = () => quiz.ans[quiz.i] = k;
    l.append(r, document.createTextNode('ABCD'[k] + ')  ' + txt)); $('q-opts').append(l);
  });
  $('b-prev').disabled = quiz.i === 0;
  $('b-next').textContent = quiz.i === quiz.qs.length - 1 ? 'FINALIZAR' : 'SIGUIENTE';
}
$('b-prev').onclick = () => { quiz.i--; renderQ(); };
$('b-next').onclick = () => {
  if (quiz.i < quiz.qs.length - 1) { quiz.i++; renderQ(); return; }
  const blank = quiz.qs.length - quiz.ans.filter(a => a !== undefined).length;
  if (blank && !confirm(`Tiene ${blank} pregunta(s) sin responder. ¿Desea finalizar?`)) return;
  finishQuiz();
};

/* ============ RESULTADOS ============ */
function finishQuiz() {
  stopMonitor();
  const ok = quiz.qs.filter((q, i) => quiz.ans[i] === q.a).length, n = quiz.qs.length;
  state.results[state.area] = { ok, n, pct: Math.round(ok * 100 / n) };
  const r = state.results[state.area], both = state.results.mate && state.results.lang;
  $('r-title').textContent = NAMES[state.area] + ' COMPLETADA';
  $('r-body').innerHTML = `${n} preguntas<br>${r.ok} correctas<br>${n - r.ok} incorrectas<br><b>${r.ok} / ${n}</b><br><b>${r.pct}%</b>`;
  const other = state.area === 'mate' ? 'lang' : 'mate';
  $('r-other').textContent = 'IR A ' + NAMES[other];
  $('r-other').classList.toggle('hidden', !!both);
  $('r-other').onclick = () => { state.area = other; show('pre'); };
  $('r-final').classList.toggle('hidden', !both);
  show('result');
}
$('r-menu').onclick = () => { updateMenu(); show('menu'); };
$('r-final').onclick = () => {
  const c = state.checks, m = state.results.mate, l = state.results.lang, mk = v => (v ? '✓' : '✗');
  $('f-body').innerHTML = `Código del estudiante: <b id="f-code"></b><br><br>
    MATEMÁTICA<br>${m.n} preguntas<br><b>${m.pct}%</b><br><br>
    COMUNICACIÓN Y LENGUAJE<br>${l.n} preguntas<br><b>${l.pct}%</b><br><br>
    VERIFICACIONES:<br>${mk(c.cam)} Cámara<br>${mk(c.front)} Foto frontal<br>${mk(c.left)} Perfil izquierdo<br>
    ${mk(c.right)} Perfil derecho<br>${mk(c.doc)} Documento de simulación<br>${mk(c.det)} Detector de orientación`;
  $('f-code').textContent = state.code; // textContent evita inyectar HTML
  show('final'); cleanup(); // 23. detener cámara y liberar recursos
};
$('b-restart').onclick = () => location.reload();

/* ============ DETECTOR DE ORIENTACIÓN (MediaPipe Face Landmarker) ============ */
// Solo estima el giro de cabeza con la posición de la nariz (punto 1) entre los bordes del rostro (234 y 454).
// No identifica personas ni usa biometría.
async function loadDetector() {
  try {
    const { FilesetResolver, FaceLandmarker } = await import(MP + '/vision_bundle.mjs');
    const fs = await FilesetResolver.forVisionTasks(MP + '/wasm');
    landmarker = await FaceLandmarker.createFromOptions(fs, { baseOptions: { modelAssetPath: MODEL }, runningMode: 'VIDEO', numFaces: 1 });
    state.checks.det = true;
  } catch (e) { console.warn('Detector no disponible:', e); landmarker = null; }
}
function faceState() {
  const v = $('v-mini');
  if (!landmarker || v.readyState < 2) return 'ok';
  const l = landmarker.detectForVideo(v, performance.now()).faceLandmarks[0];
  if (!l) return 'noface';
  const w = l[454].x - l[234].x;
  if (Math.abs(w) < 1e-3) return 'ok';
  return Math.abs((l[1].x - l[234].x) / w - 0.5) > HEAD_TURN_THRESHOLD ? 'turn' : 'ok';
}
function startMonitor() {
  $('det-note').classList.toggle('hidden', !!landmarker);
  clearInterval(mTimer); mTimer = setInterval(tick, DETECT_INTERVAL_MS);
}
function stopMonitor() { clearInterval(mTimer); clearInterval(wTimer); warning = false; $('warn').classList.add('hidden'); }

function tick() {
  if (paused) return;
  const st = faceState();
  if (warning) { if (st === 'ok') cancelWarning(); return; } // volvió a mirar: cancelar
  if (st === 'ok') { badSince = 0; return; }              // parpadeos y movimientos leves no cuentan
  if (!badSince) badSince = Date.now();
  if (Date.now() - badSince >= (st === 'noface' ? NO_FACE_TIMEOUT : TURN_HOLD_MS)) startWarning(st);
}

/* ============ ADVERTENCIA, CUENTA REGRESIVA Y PAUSA ============ */
function startWarning(kind) {
  warning = true; let n = WARNING_SECONDS;
  $('warn-msg').textContent = kind === 'noface'
    ? 'NO SE DETECTA EL ROSTRO. POR FAVOR, VUELVA A COLOCARSE FRENTE A LA CÁMARA.'
    : 'POR FAVOR, VUELVA A MIRAR HACIA LA PANTALLA.';
  $('warn-count').textContent = n; $('warn').classList.remove('hidden');
  wTimer = setInterval(() => {
    if (--n > 0) { $('warn-count').textContent = n; return; }
    clearInterval(wTimer);
    faceState() === 'ok' ? cancelWarning() : pauseTest();
  }, 1000);
}
function cancelWarning() { clearInterval(wTimer); warning = false; badSince = 0; $('warn').classList.add('hidden'); }
function pauseTest() {
  cancelWarning(); paused = true; $('pause').classList.remove('hidden'); // quiz (pregunta actual) queda intacto
}
$('b-pause').onclick = () => {
  $('pause').classList.add('hidden');
  startPhotos(STEPS.slice(0, 3), () => { // al terminar vuelve EXACTAMENTE a la misma pregunta
    paused = false; badSince = 0; show('quiz'); attach($('v-mini'));
  });
};

/* ============ LIMPIEZA DE RECURSOS ============ */
function cleanup() {
  stopMonitor(); clearCanvas();
  if (stream) stream.getTracks().forEach(t => t.stop());
  stream = null;
  ['v-cam', 'v-photo', 'v-mini'].forEach(id => { $(id).srcObject = null; });
  if (landmarker) { landmarker.close(); landmarker = null; }
}
window.addEventListener('beforeunload', cleanup);
