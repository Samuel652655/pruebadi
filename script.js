/* ==========================================================
   SIMULADOR DE EVALUACIÓN DIAGNÓSTICA — SIMULACIÓN EDUCATIVA
   Todo ocurre en el navegador. No se envía ni guarda nada.
   Secciones: 1 Utilidades · 2 Pasos · 3 Cámara · 4 Fotos
   5 Documento · 6 Micrófono · 7 Pantalla · 8 Checklist
   9 Banco de preguntas · 10 Quiz · 11 Modo profesor · 12 Limpieza
   ========================================================== */
'use strict';

/* ---------- 1. UTILIDADES ---------- */
const $ = id => document.getElementById(id);
const TOTAL_STEPS = 10;

// Estado de la sesión: solo vive en memoria.
const S = {
  step: 1, camStream: null, micStream: null, screenStream: null,
  audioCtx: null, raf: null,
  photos: { cam: null, front: null, left: null, right: null, doc: null }, // dataURL en memoria
  done: { cam: false, front: false, left: false, right: false, doc: false, mic: false, screen: false },
  cfg: { n: 25, diff: 0, cats: null },   // configuración (modo profesor)
  quiz: [], qi: 0, answers: [], lastStats: null
};

function msg(el, text, type) { el.textContent = text; el.className = 'msg ' + (type || ''); }

/* ---------- 2. NAVEGACIÓN ENTRE PASOS ---------- */
function showStep(n) {
  S.step = n;
  document.querySelectorAll('.step').forEach(s => s.hidden = true);
  $('s' + n).hidden = false;
  $('stepLabel').textContent = `PASO ${n}/${TOTAL_STEPS}`;
  $('barFill').style.width = (n / TOTAL_STEPS * 100) + '%';
  if (n === 8) buildChecklist();
  if (n === 9) startQuiz();
  if (n === 10) showFinal();
  if (n >= 3 && n <= 5) attachCam();
  window.scrollTo(0, 0);
}
// Cualquier botón con data-go="N" lleva al paso N.
document.querySelectorAll('[data-go]').forEach(b =>
  b.addEventListener('click', () => showStep(+b.dataset.go)));

/* Paso 2: datos ficticios (solo se validan que no estén vacíos, no se guardan) */
$('datosBtn').onclick = () => {
  const ids = ['fNombre', 'fApellido', 'fGrado', 'fSeccion', 'fCodigo'];
  if (ids.some(i => !$(i).value.trim())) return msg($('datosMsg'), 'Completa todos los campos con datos de prueba.', 'err');
  msg($('datosMsg'), 'Datos registrados correctamente.', 'ok');
  $('datosBtn').hidden = false; $('datosNext').hidden = false;
};

/* ---------- 3. CÁMARA ---------- */
function attachCam() { // conecta el mismo stream a todos los <video class="cam">
  document.querySelectorAll('video.cam').forEach(v => { if (S.camStream) v.srcObject = S.camStream; });
}
function permissionMsg(err, el, what) {
  const denied = err && (err.name === 'NotAllowedError' || err.name === 'SecurityError');
  msg(el, denied
    ? `No se concedió el permiso de ${what}. Pulsa el icono de candado junto a la dirección, elige PERMITIR y vuelve a intentarlo.`
    : `No se pudo usar ${what}: ${err && err.message ? err.message : 'dispositivo no disponible'}. Si abriste el archivo directamente, prueba con localhost (ver README).`, 'err');
}
$('camOn').onclick = async () => {
  try {
    S.camStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
    attachCam();
    $('stCam').textContent = '🟢 Funcionando';
    $('stPrev').textContent = '🟢 Disponible';
    $('camShot').disabled = false;
    msg($('camMsg'), '', '');
  } catch (e) { permissionMsg(e, $('camMsg'), 'la cámara'); }
};

// Captura un frame del video usando Canvas y devuelve una imagen en memoria.
function grab(video) {
  const c = document.createElement('canvas');
  c.width = video.videoWidth || 640; c.height = video.videoHeight || 480;
  const ctx = c.getContext('2d');
  ctx.translate(c.width, 0); ctx.scale(-1, 1);          // igual que la vista espejo
  ctx.drawImage(video, 0, 0, c.width, c.height);
  const url = c.toDataURL('image/jpeg', .8);
  c.width = c.height = 0;                                // libera el canvas
  return url;
}
$('camShot').onclick = () => {
  S.photos.cam = grab(document.querySelector('#s3 video'));
  $('photoPrev').src = S.photos.cam; $('photoPrev').hidden = false;
  $('camShot').hidden = true; $('camRetry').hidden = false; $('camOk').hidden = false;
};
$('camRetry').onclick = () => {
  S.photos.cam = null; $('photoPrev').hidden = true;
  $('camShot').hidden = false; $('camRetry').hidden = true; $('camOk').hidden = true;
};
$('camOk').onclick = () => { S.done.cam = true; showStep(4); };

/* ---------- 4. TRES FOTOS DE IDENTIFICACIÓN SIMULADA ---------- */
const SHOTS = [
  { key: 'front', title: 'FOTO FRONTAL', instr: 'Mire directamente hacia la cámara.', ok: 'Fotografía frontal registrada para esta simulación.' },
  { key: 'left', title: 'PERFIL IZQUIERDO', instr: 'Gire lentamente el rostro hacia la izquierda.', ok: 'Perfil izquierdo registrado para esta simulación.' },
  { key: 'right', title: 'PERFIL DERECHO', instr: 'Gire lentamente el rostro hacia la derecha.', ok: 'Perfil derecho registrado para esta simulación.' }
];
let shotI = 0;
function renderShot() {
  const s = SHOTS[shotI];
  $('idTitle').textContent = s.title; $('idInstr').textContent = s.instr;
  $('idPrev').hidden = true; msg($('idMsg'), '', '');
  $('idShot').hidden = false; $('idRetry').hidden = true; $('idNext').hidden = true;
}
$('idShot').onclick = () => {
  const s = SHOTS[shotI];
  S.photos[s.key] = grab(document.querySelector('#s4 video'));
  S.done[s.key] = true;
  $('idPrev').src = S.photos[s.key]; $('idPrev').hidden = false;
  msg($('idMsg'), s.ok, 'ok');
  $('idShot').hidden = true; $('idRetry').hidden = false; $('idNext').hidden = false;
  $('idNext').textContent = shotI < 2 ? 'SIGUIENTE' : 'CONTINUAR';
  if (shotI === 2) msg($('idMsg'), '✓ Fotografías de simulación completadas', 'ok');
};
$('idRetry').onclick = renderShot;
$('idNext').onclick = () => { if (shotI < 2) { shotI++; renderShot(); } else showStep(5); };

/* ---------- 5. DOCUMENTO DE SIMULACIÓN ---------- */
$('docShot').onclick = () => {
  S.photos.doc = grab(document.querySelector('#s5 video')); S.done.doc = true;
  $('docPrev').src = S.photos.doc; $('docPrev').hidden = false;
  msg($('docMsg'), '✓ Documento de práctica capturado', 'ok');
  $('docShot').hidden = true; $('docRetry').hidden = false; $('docNext').hidden = false;
};
$('docRetry').onclick = () => {
  $('docPrev').hidden = true; msg($('docMsg'), '', '');
  $('docShot').hidden = false; $('docRetry').hidden = true; $('docNext').hidden = true;
};

/* ---------- 6. MICRÓFONO (solo mide volumen, no graba) ---------- */
$('micGo').onclick = async () => {
  try {
    S.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (e) { return permissionMsg(e, $('micMsg'), 'el micrófono'); }
  S.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const an = S.audioCtx.createAnalyser(); an.fftSize = 512;
  S.audioCtx.createMediaStreamSource(S.micStream).connect(an);
  const buf = new Uint8Array(an.fftSize);
  let peak = 0; const end = performance.now() + 3000;
  $('micGo').disabled = true; msg($('micMsg'), 'Escuchando… habla ahora.', '');
  (function loop() {
    an.getByteTimeDomainData(buf);
    let max = 0; buf.forEach(v => max = Math.max(max, Math.abs(v - 128)));
    const level = Math.min(1, max / 60); peak = Math.max(peak, level);
    $('meterFill').style.width = (level * 100) + '%';
    if (performance.now() < end) S.raf = requestAnimationFrame(loop);
    else {
      stopMic(); $('micGo').disabled = false; $('meterFill').style.width = '0';
      if (peak > .12) { S.done.mic = true; msg($('micMsg'), '✓ Micrófono funcionando correctamente.', 'ok'); $('micNext').hidden = false; }
      else msg($('micMsg'), 'No se detectó sonido. Acércate al micrófono e inténtalo de nuevo.', 'err');
    }
  })();
};
function stopMic() {
  cancelAnimationFrame(S.raf);
  if (S.micStream) S.micStream.getTracks().forEach(t => t.stop());
  if (S.audioCtx) S.audioCtx.close().catch(() => {});
  S.micStream = null; S.audioCtx = null;
}

/* ---------- 7. COMPARTIR PANTALLA ---------- */
$('scrGo').onclick = async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia)
    return msg($('scrMsg'), 'Este navegador o contexto no permite compartir pantalla. Profesor: ejecute la página desde localhost (ver README).', 'err');
  try {
    S.screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
    $('scrVideo').srcObject = S.screenStream; $('scrVideo').hidden = false;
    $('scrGo').hidden = true; $('scrStop').hidden = false;
    msg($('scrMsg'), 'Pantalla compartida (solo vista previa local).', '');
    S.screenStream.getVideoTracks()[0].onended = finishScreen; // si se detiene desde Chrome
  } catch (e) { permissionMsg(e, $('scrMsg'), 'compartir pantalla'); }
};
function finishScreen() {
  stopScreen(); $('scrVideo').hidden = true; $('scrStop').hidden = true; $('scrGo').hidden = false;
  S.done.screen = true; msg($('scrMsg'), '✓ Compartir pantalla completado.', 'ok'); $('scrNext').hidden = false;
}
$('scrStop').onclick = finishScreen;
function stopScreen() {
  if (S.screenStream) S.screenStream.getTracks().forEach(t => t.stop());
  S.screenStream = null; $('scrVideo').srcObject = null;
}

/* ---------- 8. CHECKLIST ---------- */
const ITEMS = [['Cámara', 'cam'], ['Fotografía frontal', 'front'], ['Perfil izquierdo', 'left'],
  ['Perfil derecho', 'right'], ['Documento simulado', 'doc'], ['Micrófono', 'mic'], ['Compartir pantalla', 'screen']];
function buildChecklist() {
  $('checkList').innerHTML = ITEMS.map(([t, k]) => `<li><span>${t}</span><span>${S.done[k] ? '🟢' : '🔴'}</span></li>`).join('');
}

/* ---------- 9. BANCO DE 25 PREGUNTAS ORIGINALES ----------
   c = categoría · d = dificultad (1 básica, 2 media, 3 difícil)
   o = opciones (A–D) · a = índice de la correcta · t = texto de lectura */
const CATS = ['Matemática', 'Razonamiento lógico', 'Comprensión lectora', 'Ciencias', 'Cultura y tecnología'];
const TX_A = 'Cuando una comunidad instala paneles solares en su escuela, el ahorro de electricidad suele celebrarse como el principal beneficio. Sin embargo, el proyecto de la aldea Los Robles mostró algo distinto: al monitorear la producción diaria, los estudiantes empezaron a relacionar el clima con la energía y mejoraron sus notas de ciencias. El director admite que nadie previó ese efecto, aunque cree que sin el ahorro inicial el programa no habría sido aprobado. Un concejal opina que fue «el mejor gasto del año», pero las cuentas municipales aún no lo confirman.';
const TX_B = 'Varias ciudades han propuesto eliminar los automóviles del centro histórico. Los comerciantes temen perder clientes; sin embargo, estudios en otras ciudades indican que las ventas se mantuvieron estables porque los peatones se detienen más tiempo frente a las tiendas. Aun así, esos estudios no incluyeron ciudades con transporte público deficiente.';
const Q = [
  // Matemática
  { c: 0, d: 2, q: 'En la sucesión a₁ = 3, aₙ₊₁ = 2aₙ + 1, ¿cuánto vale a₅?', o: ['47', '63', '65', '127'], a: 1 },
  { c: 0, d: 1, q: 'Se lanzan dos dados justos. ¿Cuál es la probabilidad de que la suma sea 8?', o: ['1/6', '5/36', '1/9', '7/36'], a: 1 },
  { c: 0, d: 3, q: 'De 6 estudiantes se forma un comité de 3, pero Ana y Beto no pueden estar juntos. ¿Cuántos comités distintos hay?', o: ['12', '16', '18', '20'], a: 1 },
  { c: 0, d: 2, q: 'Cuadernos a Q3 y lápices a Q2. Se compraron 14 artículos por Q34 en total. ¿Cuántos cuadernos se compraron?', o: ['4', '5', '6', '8'], a: 2 },
  { c: 0, d: 2, q: 'Un precio sube 20 % y luego baja 20 %. Comparado con el precio original, el precio final es:', o: ['igual', '4 % menor', '4 % mayor', '2 % menor'], a: 1 },
  // Razonamiento lógico
  { c: 1, d: 1, q: '¿Qué número continúa? 2, 6, 12, 20, 30, …', o: ['36', '40', '42', '44'], a: 2 },
  { c: 1, d: 1, q: 'Luis está delante de Mario y Nora está detrás de Mario, todos en la misma fila. ¿Quién está en medio?', o: ['Luis', 'Mario', 'Nora', 'No se puede saber'], a: 1 },
  { c: 1, d: 3, q: 'Ana dice: «Al menos uno de nosotros dos (Ana o Beto) miente». Cada persona siempre dice la verdad o siempre miente. Se concluye que:', o: ['Ambos dicen la verdad', 'Ambos mienten', 'Ana dice la verdad y Beto miente', 'Ana miente y Beto dice la verdad'], a: 2 },
  { c: 1, d: 2, q: 'Si llueve, el partido se cancela. El partido no se canceló. Entonces:', o: ['Llovió', 'No llovió', 'Pudo haber llovido', 'El partido se jugó tarde'], a: 1 },
  { c: 1, d: 2, q: 'Todos los A son B y ningún B es C. Se puede afirmar con certeza que:', o: ['Algún A es C', 'Ningún A es C', 'Todos los C son A', 'Algún B es A y C'], a: 1 },
  // Comprensión lectora
  { c: 2, d: 1, t: TX_A, q: '¿Cuál es la idea principal del texto?', o: ['Los paneles solares son caros', 'El proyecto tuvo beneficios más allá del ahorro', 'Los concejales aprueban todos los proyectos', 'Las notas dependen del clima'], a: 1 },
  { c: 2, d: 2, t: TX_A, q: '¿Qué se puede inferir de la postura del director?', o: ['El ahorro fue condición para que el programa existiera', 'Los estudiantes no aprendieron nada', 'El proyecto fue un fracaso', 'Los paneles no producen energía'], a: 0 },
  { c: 2, d: 2, t: TX_A, q: '¿Cuál de estas afirmaciones es una opinión, no un hecho comprobado?', o: ['Los estudiantes monitorearon la producción', 'Las notas de ciencias mejoraron', 'Fue «el mejor gasto del año»', 'La escuela instaló paneles solares'], a: 2 },
  { c: 2, d: 2, t: TX_B, q: '¿Qué limitación tiene la conclusión de los estudios citados?', o: ['Podría no aplicar a ciudades con transporte público deficiente', 'Solo estudió comercios grandes', 'No midió ventas', 'Se hizo en centros históricos sin peatones'], a: 0 },
  { c: 2, d: 3, t: TX_B, q: '¿Qué dato debilitaría más el argumento de que las ventas se mantienen?', o: ['Los peatones caminan despacio', 'La mayoría de clientes llega en auto desde zonas sin transporte público', 'Hay tiendas de ropa y de comida', 'El centro tiene edificios antiguos'], a: 1 },
  // Ciencias
  { c: 3, d: 2, q: 'Sin resistencia del aire, si se duplica la altura desde la que cae un objeto, el tiempo de caída se multiplica por:', o: ['2', '√2', '4', '1/2'], a: 1 },
  { c: 3, d: 3, q: 'En 2H₂ + O₂ → 2H₂O se mezclan 4 mol de H₂ con 1 mol de O₂. ¿Cuántos mol de agua se forman como máximo?', o: ['1', '2', '4', '5'], a: 1 },
  { c: 3, d: 1, q: 'Se cruzan dos organismos Aa × Aa (A dominante). ¿Probabilidad de descendiente aa?', o: ['1/2', '1/4', '3/4', '1/8'], a: 1 },
  { c: 3, d: 2, q: 'Un estudiante prueba un fertilizante: 10 plantas con fertilizante al sol y 10 sin fertilizante en la sombra. ¿Cuál es la falla principal del experimento?', o: ['Muy pocas plantas', 'Cambió dos variables a la vez', 'No usó agua', 'Midió demasiado tiempo'], a: 1 },
  { c: 3, d: 2, q: 'Dos resistencias iguales de 10 Ω se conectan en paralelo. La resistencia equivalente es:', o: ['20 Ω', '10 Ω', '5 Ω', '2,5 Ω'], a: 2 },
  // Cultura general y tecnología
  { c: 4, d: 1, q: 'Recibes un correo que exige tu contraseña «con urgencia». Lo más seguro es:', o: ['Responder con la contraseña', 'No responder y verificar por un canal oficial', 'Reenviarlo a tus amigos', 'Abrir todos sus enlaces'], a: 1 },
  { c: 4, d: 1, q: '¿Cuál es el valor decimal del número binario 1011?', o: ['9', '10', '11', '13'], a: 2 },
  { c: 4, d: 2, q: 'El candado (HTTPS) en el navegador garantiza principalmente que:', o: ['El sitio es confiable', 'La comunicación viaja cifrada', 'No hay virus en el sitio', 'El sitio es oficial'], a: 1 },
  { c: 4, d: 2, q: 'La imprenta de tipos móviles se desarrolló en Europa en el siglo:', o: ['XII', 'XIV', 'XV', 'XVII'], a: 2 },
  { c: 4, d: 1, q: 'La línea imaginaria que separa los hemisferios oriental y occidental y pasa por Greenwich es:', o: ['El Ecuador', 'El Trópico de Capricornio', 'El meridiano de Greenwich', 'El círculo polar ártico'], a: 2 }
];

/* ---------- 10. QUIZ ---------- */
function startQuiz() {
  let pool = Q.filter(q => (!S.cfg.cats || S.cfg.cats.includes(q.c)) && (!S.cfg.diff || q.d === S.cfg.diff));
  if (!pool.length) pool = Q.slice();                       // si el filtro deja 0 preguntas
  S.quiz = pool.slice(0, S.cfg.n); S.qi = 0; S.answers = [];
  renderQ();
}
function renderQ() {
  const q = S.quiz[S.qi];
  $('qCount').textContent = `Pregunta ${S.qi + 1} de ${S.quiz.length} · ${CATS[q.c]}`;
  $('qText').hidden = !q.t; $('qText').textContent = q.t || '';
  $('qStem').textContent = q.q;
  $('qOpts').innerHTML = '';
  q.o.forEach((txt, i) => {
    const b = document.createElement('button');
    b.className = 'opt'; b.textContent = `${'ABCD'[i]}. ${txt}`;   // textContent evita inyección HTML
    b.onclick = () => {
      S.answers[S.qi] = i;
      document.querySelectorAll('.opt').forEach(x => x.classList.remove('sel'));
      b.classList.add('sel'); $('qNext').disabled = false;
    };
    $('qOpts').appendChild(b);
  });
  $('qNext').disabled = true;
  $('qNext').textContent = S.qi === S.quiz.length - 1 ? 'FINALIZAR' : 'SIGUIENTE';
}
$('qNext').onclick = () => { // no se revela la respuesta correcta durante la práctica
  if (S.qi < S.quiz.length - 1) { S.qi++; renderQ(); } else showStep(10);
};

/* ---------- Pantalla final ---------- */
function showFinal() {
  $('sumList').innerHTML = [['Cámara', S.done.cam], ['Fotografías', S.done.front && S.done.left && S.done.right],
    ['Documento simulado', S.done.doc], ['Micrófono', S.done.mic], ['Pantalla compartida', S.done.screen], ['Preguntas de práctica', true]]
    .map(([t, ok]) => `<li><span>${ok ? '✓' : '✗'} ${t}</span></li>`).join('');
  const st = {}; let good = 0;
  S.quiz.forEach((q, i) => {
    const ok = S.answers[i] === q.a; if (ok) good++;
    st[q.c] = st[q.c] || { ok: 0, n: 0 }; st[q.c].n++; if (ok) st[q.c].ok++;
  });
  const n = S.quiz.length;
  $('resBody').innerHTML = `${n} preguntas<br>${good} correctas<br>${n - good} incorrectas<br><b>${Math.round(good / n * 100)} %</b>`;
  S.lastStats = { n, good, st };
  stopAllMedia(); // ya no se necesitan cámara, micrófono ni pantalla
}
$('again').onclick = () => { showStep(9); };
$('reset').onclick = () => { fullReset(); showStep(1); };

/* ---------- 11. MODO PROFESOR ---------- */
$('tCats').innerHTML = CATS.map((c, i) => `<label><input type="checkbox" value="${i}" checked> ${c}</label>`).join('');
$('teacherBtn').onclick = () => {
  const s = S.lastStats;
  $('tStats').innerHTML = s ? `${s.good}/${s.n} correctas.<br>` + Object.entries(s.st)
    .map(([c, v]) => `${CATS[c]}: ${v.ok}/${v.n}`).join('<br>') : 'Aún no hay resultados.';
  $('teacher').showModal();
};
$('tNum').oninput = () => $('tnVal').textContent = $('tNum').value;
$('tClose').onclick = () => {
  S.cfg.n = +$('tNum').value; S.cfg.diff = +$('tDiff').value;
  const cats = [...document.querySelectorAll('#tCats input:checked')].map(i => +i.value);
  S.cfg.cats = cats.length && cats.length < CATS.length ? cats : null;
  $('teacher').close();
};

/* ---------- 12. LIMPIEZA DE MEDIOS E IMÁGENES ---------- */
function stopAllMedia() {
  stopMic(); stopScreen();
  if (S.camStream) S.camStream.getTracks().forEach(t => t.stop());
  S.camStream = null;
  document.querySelectorAll('video').forEach(v => v.srcObject = null);
  $('stCam').textContent = '⚪ Sin activar'; $('stPrev').textContent = '⚪ No disponible';
  $('camShot').disabled = true;
}
function clearImages() {
  Object.keys(S.photos).forEach(k => S.photos[k] = null);
  ['photoPrev', 'idPrev', 'docPrev'].forEach(i => { $(i).removeAttribute('src'); $(i).hidden = true; });
}
function fullReset() {
  stopAllMedia(); clearImages();
  Object.keys(S.done).forEach(k => S.done[k] = false);
  S.quiz = []; S.answers = []; S.lastStats = null; shotI = 0; renderShot();
  document.querySelectorAll('input:not([type=checkbox]):not([type=range])').forEach(i => i.value = '');
  document.querySelectorAll('.msg').forEach(m => msg(m, '', ''));
  ['camRetry', 'camOk', 'docRetry', 'docNext', 'micNext', 'scrStop', 'scrNext', 'datosNext'].forEach(i => $(i).hidden = true);
  ['camShot', 'docShot', 'scrGo'].forEach(i => $(i).hidden = i === 'camShot' ? false : false);
}
// Si el usuario cierra o abandona la página, se detienen cámara, micrófono y pantalla.
window.addEventListener('pagehide', () => { stopAllMedia(); clearImages(); });

renderShot();
showStep(1);
