# Simulador de evaluación diagnóstica (SIMULACIÓN EDUCATIVA)

Práctica del procedimiento técnico de una evaluación en línea: cámara, fotos de práctica, documento ficticio, micrófono, compartir pantalla y 25 preguntas originales. No es una evaluación oficial, no se conecta con ningún servicio y no envía ni guarda datos.

Archivos: `index.html` (estructura), `style.css` (estilos), `script.js` (lógica y banco de preguntas).

## 1. Cómo abrir la aplicación
Coloca los tres archivos en la misma carpeta y abre `index.html` con Google Chrome (doble clic o «Abrir con → Chrome»).
Chrome suele permitir cámara y micrófono desde `file://`, pero a veces los bloquea o no muestra el permiso. En ese caso usa la sección 5.

## 2. Cómo permitir la cámara
Al pulsar **ACTIVAR CÁMARA**, Chrome muestra «Permitir que este sitio use tu cámara». Selecciona **PERMITIR**.
Si lo bloqueaste: clic en el icono de candado/ajustes junto a la dirección → Cámara → Permitir → recarga la página.

## 3. Cómo permitir el micrófono
Al pulsar **ACTIVAR MICRÓFONO**, selecciona **PERMITIR**. Se puede corregir igual que la cámara. El audio no se graba: solo se mide el volumen.

## 4. Cómo compartir pantalla
Pulsa **COMPARTIR PANTALLA**, elige pestaña, ventana o pantalla completa en el cuadro de Chrome y pulsa **Compartir**. Para terminar, usa **DETENER COMPARTIR** o el botón «Dejar de compartir» de Chrome. Solo se muestra una vista previa local.

## 5. Ejecutar con localhost (si Chrome bloquea algo)
Con Python instalado, abre una terminal en la carpeta y ejecuta:

```
python -m http.server 8000
```

(en algunos sistemas: `python3 -m http.server 8000`). Luego entra a `http://localhost:8000` en Chrome. `localhost` se trata como contexto seguro, así que cámara, micrófono y pantalla funcionan.
Alternativa: extensión «Live Server» de VS Code o `npx serve`.

## Modo profesor
Botón «Modo profesor» (arriba a la derecha): elige número de preguntas, dificultad y categorías. Los cambios se aplican al siguiente intento. Muestra estadísticas solo de la sesión actual, sin datos personales.

## Privacidad
- Fotos y capturas viven únicamente en memoria y se borran al reiniciar, al terminar o al cerrar la página.
- Se detienen cámara, micrófono y pantalla compartida al finalizar y al abandonar la página.
- No hay reconocimiento facial, comparación de imágenes ni lectura de documentos.
- Los datos del estudiante son ficticios y no se guardan.
- Las preguntas son originales; no provienen de DIGEDUCA ni de otra evaluación oficial.
