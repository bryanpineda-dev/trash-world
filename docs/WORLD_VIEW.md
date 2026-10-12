# Encuadre Amplio Y Atmosfera

Fecha: 2026-10-12. Encuadre aprobado por el usuario para entrega local y versionado. Base Git: `v0.1.7`; siguiente etiqueta propuesta: `v0.1.8`. No se crea ni publica automaticamente.

## Alcance

La primera propuesta no resolvio la referencia. Esta correccion abre la camara para observar mas mundo con Miga mas pequena, elimina la lectura de agua del fondo y recupera la iglesia completa y su luz nocturna. No declara terminado el acabado artistico de la biblioteca.

![Encuadre nocturno actual en navegador.](images/world-view-night.jpg)

## Camara

- Un pixel comun para todos los sprites. Miga conserva su fuente de 64 x 64 y sus 56 pixeles visibles; no se cambia ningun clip.
- Ancho nativo habitual de 560 en escritorio y minimo de 288 en movil, frente a 384/192 anteriores. Tamano visual de Miga reducido aproximadamente 31% y 33% respectivamente.
- Vista de 1280 x 720: escena de 1280 x 563, canvas nativo 560 x 246. Vista de 320 x 720: escena de 320 x 506, canvas 288 x 455.
- Escala proporcional y nearest-neighbor. En ventanas apaisadas bajas se amplia el ancho para conservar 240 pixeles nativos de altura; limite excepcional de 2048 de ancho.
- Si la camara abarca los 560 pixeles jugables, su centro queda fijo en x=280. Las zonas decorativas exteriores no amplian colisiones, objetos ni mundo guardado. Las vistas estrechas conservan seguimiento.
- Encabezado y footer/controles ocupan filas propias, fuera del canvas. La proyeccion de toque usa el rectangulo real de la escena, no el viewport completo.

## Fondo Y Luz

Se retiran las superficies solidas del color de horizonte. El suelo lejano tiene tierra, hojarasca y vegetacion irregular. Los dos fondos de bosque pierden el corte horizontal inferior; su ancla se recalcula contra su ultima fila visible.

La niebla se distribuye en manchas con espacios entre ellas, no en una franja continua. Sus densidades y aportes son menores y permanece entre planos, sin cubrir a Miga. La mascara se interpola antes de componer una sola vez y se reutiliza si el ambiente esta pausado.

Las ventanas mantienen el ambar original al atardecer y de noche, sin mezclarlo con el azul de la distancia. De dia cambian al cristal frio aprobado. La intensidad de vela sigue siendo continua. Sol y luna quedan a 64 pixeles a la derecha del centro del encuadre, despejados de la copa derecha en la composicion inicial.

## QA

Las pruebas de motor, renderer offline y navegador se reportan por separado en [Verificacion](VERIFICATION.md). Los casos de camara cubren movil, escritorio y ventanas apaisadas, extremos de posicion y toques. La validacion del bosque comprueba apoyo y conectividad, no solo la ausencia de una linea recta.

`npm run check`: 144 pruebas aprobadas y build de las tres vistas. Cache offline de 19 recursos. Se agregan seis pruebas de encuadre y luz, y se actualizan las expectativas de niebla, emision nocturna y apoyo de los fondos. Siguen las comprobaciones pixel a pixel de todas las exportaciones.

Renderer de produccion offline: 64 poses/direcciones en cuatro proporciones de viewport y dos fases. Atlas y fallback identicos; 42960 pixeles opacos de Miga cotejados sin recorte o tinte. El ambiente se congela exactamente. Antes de la entrega, 33 archivos protegidos y los 279 archivos previos de Desktop conservaron SHA-256.

Navegador real: visor diurno/nocturno a 1280 x 720 y 320 x 720, y mundo autonomo diurno en escritorio. Se observa a Miga en diferentes posiciones y caminando con el centro de camara fijo. Las capturas muestran cruz completa y cristal frio/calido segun fase. No se afirma aqui una nueva validacion completa de todos los flujos de toque ni una medicion de rendimiento.

Las capturas del README corresponden a esta revision. El GIF es un render offline de IA y animaciones aprobadas, no una grabacion ni un benchmark del navegador. Ninguna prueba tecnica certifica semejanza artistica con la referencia.

La entrega aprobada respalda la base, copia archivos del proyecto sin reemplazar Git, dependencias, builds, caches ni configuraciones locales, y coteja bytes e inventario. Las pruebas se ejecutan tambien desde la carpeta estable; su build de verificacion usa un directorio separado para conservar el `dist/` existente. Pedir comandos no autoriza al agente a ejecutar staging, commit, tag o push.

Pendientes: dibujo de arquitectura y fuentes secundarias, Android fisico, rendimiento y consumo prolongados, partida nocturna prolongada y desconexion real. La aprobacion del encuadre no declara final toda la biblioteca de arte.
