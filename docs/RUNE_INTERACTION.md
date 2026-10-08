# La Lapida Runica

## Alcance

Respuesta visual de la lapida al ser investigada, posterior a la interaccion del farol. Conserva el ID persistente `stone`, tipo `rune`, posicion x=335, radio, dibujo de 36 x 48 y ancla [18,47]. No cambian los assets, clips de Miga, IA, duraciones, recompensas, necesidades, guardados ni dependencias.

Miga sigue llegando a x=301 desde la izquierda o x=369 desde la derecha y mirando al objeto. La inspeccion dura los mismos 4.5 segundos en las tres fases. La visita puede surgir de la IA autonoma o de un toque cercano sobre la lapida.

## Recorrido De Luz

`src/world/RuneInteraction.js` comprueba el objetivo, estado, orientacion y distancia. Su respuesta interpola intensidad y avance usando el tiempo de simulacion. La luz nace abajo, asciende por el tallo y se reparte por los dos lados del rombo hasta su punta. No repite un bucle durante la visita.

El recorrido se calcula una vez desde los 23 pixeles compartidos por el grabado `e` del frame `rest` y el grabado `h` del frame `lit`. Una busqueda por vecinos diagonales ordena la propagacion desde la base; no hay una segunda copia manual del dibujo. El renderer mezcla el tono claro de la paleta aprobada solo en esos pixeles. Piedra, musgo, marco, silueta y ancla no cambian.

El mundo mantiene `rest` como base estable en lugar de alternar con `lit` por un reloj ambiental. Los frames originales, sus fuentes, exports y tiempos siguen intactos en el laboratorio. La reaccion no crea halos, desenfoque, particulas, nuevos colores editables, lienzos extra ni lecturas del framebuffer por fotograma.

Intensidad maxima de mezcla: 0.16 de dia, 0.38 al atardecer y 0.72 de noche. Al dejar de observar, tocar a Miga, cambiar de objetivo o necesitar descanso, el recorrido alcanzado se conserva mientras pierde intensidad. No bloquea el sueno ni cambia la siguiente decision.

La pausa y el ajuste de movimiento ambiental congelan la respuesta. Esta vive en el renderer, no en el guardado; cargar una inspeccion existente retoma su avance con una entrada suave. El progreso offline no inventa reacciones o descubrimientos.

## Visor

El boton de gema `Observar runa` ejecuta la IA real en la vida temporal del visor. Comparte el controlador de ensayo con `Observar farol`: selector sincronizado, regreso a la pose anterior al acabar, cancelacion al cambiar posicion o pose y cambio de objetivo sin bloquear botones. No lee ni escribe la partida del mundo.

En movil los botones tienen tracks fijos de 40 px, fuera del canvas. A 320 x 720 se conserva un canvas nativo de 192 x 304 entre encabezado y controles, sin superposicion ni desbordamiento horizontal.

## Verificacion

- 127 pruebas y build de las tres vistas. Diez regresiones nuevas cubren las tres fases, aproximacion desde ambos lados, activacion por objetivo, mascara exacta, orden y simetria del recorrido, intensidad, easing a 30/60/120 Hz, pausa, interrupciones y restauracion con recompensas intactas.
- Renderer de produccion fuera del navegador: solo 23 pixeles existentes cambian en cada fase. Dia menor que atardecer y noche; salto maximo de cinco niveles RGB por fotograma a 60 Hz. Paridad exacta atlas/fallback y congelacion con movimiento ambiental desactivado.
- GIF de 180 frames a 15 fps: IA real con objetivo inicial lapida, caminata, inspeccion, descubrimiento y nueva decision. Detalle de seis momentos inspeccionado a zoom entero. Son renders offline, no grabaciones del navegador ni medidas de rendimiento.
- Navegador real: escritorio 1280 x 720 y movil 320 x 720, llegada izquierda y derecha, inspeccion diurna/nocturna, pausa, cancelacion, cambio al farol y fin de visita. Capturas nuevas y medidas DOM sin overflow; controles separados.
- Mundo autonomo diurno: toque sobre la lapida seguido de llegada y estado de investigacion. Logs consultados del mundo y visor sin errores o avisos. Una accion de navegador agoto su plazo; se recupero leyendo el estado y usando los controles accesibles.
- SHA-256: los 178 archivos anteriores de assets permanecen intactos. El README distingue las capturas actuales, la biblioteca sin cambios y el GIF offline.

Pendientes: Android fisico, framerate y consumo prolongados, nueva desconexion real y comportamiento nocturno prolongado en una partida autonoma. La prueba de continuidad a 60 Hz no certifica rendimiento del navegador ni del telefono. No se publica una version automaticamente.
