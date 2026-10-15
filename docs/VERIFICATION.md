# Verificacion de V0.1

Primera verificacion: 2026-10-06.

- `npm test`: 22 pruebas aprobadas de autonomia, personalidad, estados, necesidades, objetos, limites, reloj, progreso offline, transformacion de toques, fallback de sensores y persistencia.
- `npm run build`: aprobado; bundle JavaScript de aproximadamente 30 KB, unos 11 KB gzip. El build genera los iconos y el cache offline de siete recursos.
- Navegador: la escena carga, el personaje explora e investiga y el panel refleja sus cambios de estado.
- Se forzo el sueno, se guardo y se recargo: se conservaron sueno, necesidades y dos descubrimientos.
- Un toque sobre el canvas desperto a la criatura.
- Layout medido en 320 x 640 y 1280 x 720: canvas ocupa el viewport y ningun elemento del encabezado o pie queda recortado horizontalmente.
- Se obtuvo una captura de la escena movil; otras capturas fallaron de forma intermitente en la herramienta de navegador. La validacion de medidas se hizo tambien con el DOM.
- Prueba offline: se detuvo el servidor local y se recargo la app; la interfaz volvio a abrir desde el service worker y sin avisos ni errores de consola.

## Kit medieval V1: 2026-10-06

- `npm run check`: 38 pruebas aprobadas y build de ambas entradas HTML aprobado.
- Fuentes editables: 7 piezas, 2 variantes de personaje, 8 clips compartidos y 2 objetos animados; atlas de 49 frames RGBA, aproximadamente 5.4 KB.
- Cada pixel exportado, ancla, referencia y tiempo del atlas se compara con las fuentes en los tests. Tambien se prueban transparencia, recolores, sustitucion de cabeza, recortes, ciclos de herencia y entradas invalidas.
- Tests del service worker en Node: visitar el visor no reemplaza la pagina offline del juego; cada pagina recupera su propio cache, incluyendo rutas de instalacion en subcarpetas y query strings.
- El build incluye el atlas y ambas paginas en su precache de 12 recursos.
- Visor medido en 320 x 640 y 1280 x 720, sin desbordamiento horizontal; capturas confirmaron personaje, objetos y paleta visibles.
- Controles probados: cambio de personaje y clip, pausa, cambio de direccion, final sin loop y reproduccion desde el inicio.
- Juego en navegador: se forzo SLEEP, se guardo y se recargo; persistieron el estado de sueno y dos descubrimientos. Se obtuvo captura del nuevo personaje y la runa dentro de la escena.
- No se observaron errores ni avisos de consola en el juego o el visor durante estas comprobaciones.

## Familia de entorno: 2026-10-06

- `npm run check`: 73 pruebas y build aprobados; atlas RGBA de 109 frames y unos 19.7 KB. La ultima exportacion coincide pixel por pixel con las fuentes, incluyendo llama y runa.
- Nueve fuentes: cinco de Miga y cuatro objetos. Una regresion SHA-256 fija todos los pixeles, anclas y limites de las poses aprobadas del personaje; sus tiempos tambien conservan sus regresiones anteriores.
- El farol, tumba, arbusto y roble apoyan exactamente en el suelo en todas sus variantes. Las zonas de toque cubren cada pixel visible; Miga se aproxima desde ambos lados sin quedar dentro de la silueta del objeto.
- Revision visual de los cuatro objetos en el visor de escritorio y de la planta y el arbol completos en movil. DOM medido en 320 x 720: sin desbordamiento horizontal y trece miniaturas de 160 x 160 CSS, sin encogimiento ni recortes.
- Escena real revisada al atardecer y de noche, con el personaje dormido y desplazandose junto a los nuevos objetos. Se guardaron laminas a escala comun de dia/noche y capturas reales del visor y del mundo.
- La recarga automatica durante la regeneracion mostro temporalmente el HTML sin estilos; una captura posterior confirmo la escena completa. No aparecieron errores ni avisos en los logs consultados del mundo.
- IDs, posiciones, descubrimientos y contrato de guardado permanecen estables. La etiqueta `v0.1.0` no se modifica y esta pasada no se publica automaticamente en GitHub.

No se ha probado un telefono Android fisico, su autonomia termica o energetica, ni los sensores reales. Los sensores corresponden a V0.2. No hay medicion de rendimiento prolongado en el hardware de destino. La nueva navegacion offline entre las dos paginas se verifico con tests del worker; no se repitio la prueba de desconexion del navegador en esta pasada.
# Propuesta de bioma: bosque de las ruinas

- 82 tests y build aprobados: nueve fuentes decorativas, 81 variantes exportadas de fase/profundidad y 19 archivos en el precache de produccion.
- Regresiones nuevas: identidad completa del kit aprobado, escala y anclas, paleta, exportacion pixel a pixel, parallax, visibilidad en limites, siluetas de arboles conectadas y rechazo de fuentes invalidas.
- Revision del visor con dia, atardecer y noche, reposo, caminar y dormir. La caminata avanzo la posicion visible y cambio la escena entre capturas; el sueno conserva los huesos apoyados y legibles.
- Revision final de la direccion misteriosa: atardecer gris violaceo, ruinas visibles y niebla baja en dos planos. El atlas se regenero despues del cambio de paleta y se verifico pixel a pixel antes de cerrar las pruebas.
- Viewports finales medidos: desktop 1280 x 720 (lienzo nativo 384 x 216) y movil 320 x 720 (192 x 432), sin desbordamiento horizontal. La primera pasada tambien se reviso en 433 x 937 y 355 x 800 CSS; el zoom del navegador alteraba entonces los overrides solicitados.
- La propuesta permanece en el sandbox, separada de la carpeta estable de GitHub. Sin cambios de dependencias, guardados, commits, versiones o etiquetas. No se probo en un Android fisico.

## Biblioteca del cementerio: 2026-10-06

- `npm run check`: 84 pruebas y build aprobados. Dieciseis fuentes decorativas y 144 variantes de fase/profundidad; precache de 19 archivos.
- Todos los pixeles del atlas se cotejan con las fuentes. Miga conserva el SHA-256 aprobado. Los cuatro objetos conservan mascaras de transparencia, anclas, limites y tiempos; solo se recolorean los contornos por material.
- Los cinco arboles tienen siluetas conectadas. Regresiones adicionales cubren ausencia del contorno universal oscuro, apertura transparente de la cruz y luciernagas deterministas en coordenadas enteras.
- Revision visual de dia, atardecer y noche, caminar y dormir, y extremos x=32 y x=528. Mundo autonomo real revisado en movil: el descanso termina con los huesos apoyados, sin errores de consola.
- Visor en desktop 1280 x 720 y movil 320 x 720: lienzos nativos 384 x 216 y 192 x 432; ancho de documento igual al viewport. Encabezado movil en [0,0,320,61], sin superposicion de titulo e iconos.
- Biblioteca: 17 lienzos de 192 x 192 CSS/nativos, incluyendo Miga. Dialogo movil de 282 px, ancho interno y scrollWidth de 265 px, sin overflow horizontal. Apertura, cierre, Escape y retorno al mundo verificados. La biblioteca pausa el visor y la escena fija evita el desplazamiento al devolver el foco.
- Navegar de vuelta al visor sincroniza posicion, pose y fase con los controles restaurados por el navegador.
- Capturas guardadas en `outputs/` del espacio de trabajo. Los 63 archivos estables mantienen los hashes de la copia previa; sin publicacion en GitHub ni cambio de version. No se verifico en un dispositivo fisico ni se repitio una desconexion real del navegador.

## Capilla y biblioteca por familias: 2026-10-06

- 88 pruebas y build aprobados. Exportacion actual: 20 fuentes nativas, 180 frames de fase/profundidad y 60 PNG individuales transparentes. El precache conserva 19 archivos.
- El indice v2 carga las mismas fuentes en Node y Vite. Las regresiones cubren rutas externas, duplicados, archivos ausentes, IDs incompatibles y ausencia de mutaciones del indice.
- Cada pixel del atlas y de los 60 PNG individuales coincide con su fuente y paleta. Las tres variantes del sendero comparten uniones opacas, ancla y suelo plano.
- La paleta de escenografia se amplia a 32 tonos; la del kit aprobado sigue en 16. La capilla usa profundidad lejana, parallax menor y cristal calido, detras de la niebla y la vegetacion media. El roble y la lapida se afinan sin ampliar sprites pequenos.
- Revision visual del visor en dia, atardecer y noche; extremos x=32/528; caminar y dormir. La capilla permanece legible a la izquierda de Miga en la composicion central. Mundo autonomo revisado con la nueva escenografia; logs consultados sin errores.
- Escritorio: 1280 x 720 CSS y canvas nativo 384 x 216. Movil: 320 x 720 CSS y canvas nativo 192 x 304, en [0,61,320,506], entre encabezado y controles. Documento sin overflow horizontal; suelo y huesos no quedan cubiertos por los controles.
- Biblioteca: filtros de arboles y arquitectura verificados, con Miga siempre como referencia. Lienzos de 208 x 208 nativos/CSS; roble completo sin recorte. Dialogo movil con clientWidth y scrollWidth de 265 px; etiquetas largas se ajustan. Apertura, filtro, Escape y vuelta desde el mundo conservan controles coherentes.
- Auditoria SHA-256 contra el respaldo previo: los 63 archivos estables y los nueve archivos protegidos de fuentes/atlas/laminas aprobadas no cambian. Propuesta exclusivamente en sandbox; sin transferencias, commits, cambios de dependencias ni publicacion.
- Capturas finales de escritorio, movil, biblioteca y mundo vivo en `outputs/` del espacio de trabajo. La regeneracion produjo una vista transitoria sin estilos; se sustituyo por capturas posteriores completas. No se probaron telefono fisico, rendimiento prolongado ni desconexion real en esta pasada.

## README y entrega estable: 2026-10-07

- Nueva pasada completa: 88 pruebas y build de las tres vistas aprobados.
- README con cuatro capturas reales guardadas en `docs/images/`, sin dependencias de imagenes externas. Enlaces locales y anclas verificados.
- Vista previa revisada a 1280 x 720 y 320 x 720: las cuatro imagenes cargan, la galeria movil se ajusta y el documento no desborda horizontalmente.
- Bioma aprobado y documentacion copiados desde sandbox a la carpeta estable con respaldo previo, comprobacion de cambios concurrentes y hashes SHA-256. Git, dependencias y archivos ajenos se conservan; sin staging, commit, tag ni push.
- No se repitieron pruebas en telefono fisico ni desconexion real. La vista previa local no sustituye una revision posterior del render de GitHub.

## Patrones de materiales: 2026-10-07

- `npm run check`: 90 pruebas y build de las tres vistas aprobados. Se regeneraron los 109 frames del kit, 180 variantes del bioma y 60 PNG individuales.
- Fuentes afinadas: arco roto, las tres variantes del sendero y farol. Se conservan resoluciones nativas, anclas, posiciones, paletas y tiempos. Las juntas del suelo siguen conectando en cualquier combinacion de tiles.
- Regresiones nuevas: dos secciones de ruina conectadas al suelo y una silueta de farol conectada. La llama cambia solo dentro de [9,19,5,8]; el resto del farol conserva los mismos pixeles entre sus dos frames.
- Auditoria SHA-256: las piezas y animaciones de Miga, los otros tres objetos y la composicion del bioma no cambian. Los 160 archivos de la carpeta estable mantienen los hashes del respaldo previo.
- Laminas comparativas de dia y noche revisadas a zoom entero. Capturas reales del visor guardadas en `outputs/` del espacio de trabajo, tanto en escritorio como en movil; farol y ruina mantienen su escala junto al personaje.
- Escritorio: 1280 x 720 CSS y canvas nativo 384 x 216. Movil: 320 x 720 CSS y canvas nativo 192 x 304, en [0,61,320,506]; documento sin desbordamiento horizontal. Encabezado y controles quedan fuera del canvas movil.
- Esta pasada permanece en sandbox, sin transferencias a Desktop, staging, commits, etiquetas ni publicacion. No se repitieron desconexion real, telefono fisico o rendimiento prolongado.

## Biblioteca viva: 2026-10-07

- `npm run check`: 95 pruebas y build de las tres vistas aprobados. Atlas de 396 frames en 2048 x 2940, 28 fuentes decorativas y 132 PNG individuales de fase/variante. El precache sigue incluyendo 19 archivos.
- Se verifican todos los pixeles exportados, parches y tiempos; siluetas conectadas en cada frame de viento; soporte, suelo y materiales estaticos. Siete arboles y el vidrio de la capilla incorporan clips ambientales compartidos con el reproductor del kit.
- Las tres variantes de bayas, dos lapidas nuevas y tres arboles nuevos se colocan en el bioma sin cambiar zonas de toque. El roble pequeno se retira de objetos activos, manteniendo fuente, ID historico, recuerdos y descubrimientos. Guardados dirigidos al arbol retirado vuelven a reposo sin perder el resto de datos.
- Auditoria contra el respaldo: los 160 archivos de Desktop no cambian. Miga, paletas, clips del kit, arbusto original, farol, roble archivado, ruina y senderos mantienen sus fuentes aprobadas. La tumba runica recibe solo desgaste de color dentro de la mascara existente.
- Laminas de biblioteca inspeccionadas a zoom entero; bayas y Miga comparten escala 3. Renders fuera del navegador ejecutan el bundle de produccion del renderer con canvas nativo: escritorio 384 x 216 y movil 192 x 304, en dia y noche, con 93/100 y 74/81 colores respectivamente. Se revisaron las cuatro imagenes: escena no vacia, assets cargados y Miga y suelo legibles.
- Prueba de pixeles del renderer: avanzar 1.2 segundos cambia el ambiente; desactivar movimiento y avanzar otros dos segundos conserva exactamente la imagen en los cuatro casos. Estas imagenes no son capturas del navegador ni verifican CSS, controles, eventos DOM o rendimiento del navegador.
- La herramienta de navegador no respondio al conectar pestanas o crear una nueva vista de produccion. Queda pendiente repetir la revision real de interfaz y encuadre CSS de escritorio/movil. El servidor local responde HTTP 200; eso confirma disponibilidad, no la revision de interfaz.
- Propuesta exclusivamente en sandbox. Sin transferencias a Desktop, staging, commits, etiquetas, cambios de dependencias o publicacion. No se probaron desconexion real, telefono fisico o consumo prolongado.

## README del cementerio vivo y entrega: 2026-10-07

- Nueva pasada completa de `npm run check`: 95 pruebas aprobadas y build de las tres vistas correcto.
- Galeria actualizada con tres renders de contexto y una lamina de fuentes en `docs/images/`. Los cuatro PNG se decodifican y se cotejan por dimensiones y SHA-256 con los renders revisados. No son capturas de navegador; el README indica su origen y la revision de interfaz pendiente.
- Se comprueban 19 referencias y 13 anclas del README. Las imagenes actuales suman 217608 bytes y no dependen de servicios externos. Se genera una vista previa HTML local; no se afirma haber validado su layout en navegador ni el render de GitHub.
- Entrega aprobada a la carpeta estable con respaldo previo de sandbox y Desktop, preflight de cambios concurrentes y comprobacion SHA-256 de los archivos copiados. Se conservan Git, dependencias y archivos ajenos. Sin staging, commit, tag ni push; tampoco se cambia la version del paquete.
- No se repiten pruebas de desconexion real, telefono fisico o rendimiento prolongado. Las comprobaciones de navegador de pasadas anteriores no se presentan como evidencia de la nueva interfaz.

## Forma y movimiento del bosque: 2026-10-08

- `npm run check`: 102 pruebas y build de las tres vistas aprobados. 28 fuentes, atlas de 414 frames en 2048 x 3224 y 138 PNG individuales. No cambian dependencias ni version del paquete.
- Siete regresiones nuevas cubren camara a 30/60/120 Hz, proyeccion compartida y toques, silueta y madera inmovil, continuidad de todos los frames y cierre del loop, vidrio siempre calido, simetria de capilla y rechazo de declaraciones de luz/mezcla invalidas.
- Auditoria SHA-256: los nueve archivos protegidos del kit y los 246 archivos previos de Desktop permanecen intactos. Doce exports antiguos de vidrio y musgo quedan respaldados y se retiran del sandbox; el inventario de PNG coincide exactamente con las variantes actuales.
- Renders del bundle de produccion inspeccionados en dia y noche, desktop 384 x 216 y movil 192 x 304, con zoom entero. Los cuatro casos no estan vacios, cambian al avanzar tiempo y quedan identicos al desactivar movimiento ambiental. Se generan ademas una comparativa antes/despues, detalle de capilla y GIF de 96 frames.
- Vidrio aislado: 180 frames a 60 Hz; diferencia maxima de un nivel por canal de color entre frames consecutivos. No se cambian el marco, tejado, piedra ni silueta. La comprobacion es de canvas fuera del navegador, no de rendimiento real en el dispositivo.
- La conexion del control de navegador volvio a agotar su tiempo. Quedan pendientes la revision de interfaz y controles CSS en navegador, telefono fisico, desconexion real y consumo prolongado. Los renders y GIF no se presentan como capturas reales de navegador.
- Propuesta en sandbox, sin transferencia a Desktop, staging, commit, etiquetas ni publicacion. Las fuentes y las imagenes del README corresponden a esta pasada.

## README actualizado y entrega aprobada: 2026-10-08

- El usuario aprueba entregar la revision del bosque a su carpeta estable de Desktop, antes de recibir comandos de GitHub. La version propuesta para la siguiente etiqueta es `v0.1.4`; no se crea ni publica automaticamente.
- README actualizado con el alcance de los diez dibujos refinados, cuatro imagenes de la revision actual y un GIF de 96 frames. Los cinco medios se verifican por dimensiones y SHA-256; 21 referencias y 14 anclas locales comprobadas. Los renders se identifican como pruebas del renderer fuera del navegador.
- La transferencia comprueba la base y su respaldo previo, detecta cambios concurrentes y coteja cada archivo copiado. Retira solamente doce exports generados obsoletos cuyas versiones anteriores permanecen respaldadas. Se conservan Git, dependencias, builds y archivos ajenos; sin staging, commit, etiquetas ni push.
- Se guardan reglas de entrega en el `AGENTS.md` local del sandbox: actualizar README y medios, copiar a Desktop cuando se aprueba publicar y verificar la entrega antes de proporcionar comandos. Ese archivo local no se copia al repositorio.
- La ultima comprobacion del renderer conserva 102 pruebas y build correcto. La revision real en navegador, telefono fisico y rendimiento prolongado sigue pendiente; la entrega local no resuelve esas limitaciones.

## Ramas naturales, enredaderas y luz: 2026-10-08

- `npm run assets` y `npm run check`: 105 pruebas y build correctos. Se mantienen 28 fuentes, 414 frames y 138 PNG. Se afinan tres robles y las enredaderas del abedul y arbol seco; la capilla cambia solo su declaracion de luz y paleta diurna.
- Tres regresiones nuevas verifican el cristal y reflejos frios de dia, el alcance acotado y simetrico de la luz del farol, y la ausencia de la rama transversal. Se amplian los rechazos de fases y recolores de vela invalidos. Atlas y exportaciones individuales se cotejan pixel por pixel.
- Revision real del visor en navegador a 1280 x 720 y 320 x 720, dia y noche. Canvas de escritorio 384 x 216; movil 192 x 304 en [0,61,320,506]. Ancho del documento igual al viewport. Capturas JPG actuales, no renders presentados como capturas.
- Biblioteca: filtro de arboles y cierre comprobados, con Miga como referencia. En movil, ancho interno y scrollWidth de 265 px. La caminata avanza en pantalla de x=294 a 299; la captura conserva el perfil aprobado. Logs finales sin errores o advertencias.
- Renders del bundle actual en dia y noche, escritorio y movil, y GIF de 96 frames. Los cuatro casos cambian al avanzar y se congelan con movimiento ambiental desactivado. La vela nocturna aislada conserva cambios maximos de un nivel RGB entre frames consecutivos.
- Comprobacion adicional del renderer: atlas y fallback identicos en dia y noche; overlay de suelo ausente de dia. De noche cambian 1139 pixeles de superficies dentro del alcance local. Un desplazamiento de camara conserva el color en la misma coordenada mundial y reutiliza las mascaras cacheadas.
- README y medios actualizados para esta revision. La entrega local conserva Git, dependencias y archivos ajenos; no se hace staging, commit, tag ni push. La siguiente etiqueta propuesta es `v0.1.5`.
- Sin medicion de framerate real, telefono fisico, consumo prolongado ni nueva desconexion completa. La API DOM del navegador no expuso lectura de pixeles del canvas; la verificacion pixel a pixel corresponde al renderer offline y a los tests, no al canvas vivo.

## Miga y el farol: 2026-10-08

- 117 pruebas aprobadas y build de las tres vistas. Doce pruebas nuevas cubren la observacion diferenciada del farol, distancias y orientacion, duracion nocturna, activacion, continuidad, pausa, interrupciones, guardados y recompensas sin cambios.
- Los 178 archivos previos de assets conservan SHA-256: Miga, clips, farol, paletas, fuentes y exports ambientales intactos. No hay cambios de dependencias, IDs, posiciones, toques o esquema de guardado.
- Renderer de produccion offline: respuesta de luz restringida a 53 pixeles existentes del vidrio. Diferencia maxima de dos niveles RGB a 60 Hz, paridad atlas/fallback, ausencia de respuesta adicional diurna y vespertina y congelacion exacta con movimiento ambiental desactivado.
- GIF de 180 fotogramas con IA real y objetivo inicial farol: llegada, inspeccion y nueva decision, incluyendo registro de descubrimiento. No se presenta como captura del navegador o medida de rendimiento.
- Navegador real: visor 1280 x 720 y 320 x 720, canvas 384 x 216 y 192 x 304 respectivamente. Documento sin desbordamiento horizontal. Capturas nocturnas y diurna actuales, selector sincronizado, pausa y llegada desde la izquierda comprobados; al completar la visita vuelve a reposo y se habilita el boton.
- El mundo autonomo diurno responde al toque sobre el farol y conserva el guardado local. Logs finales del visor y del mundo sin errores o advertencias. Una espera de finalizacion del visor agoto el plazo; la observacion posterior confirmo finalizacion, reposo y boton habilitado.
- README y medios corresponden a esta revision. La lamina antigua se identifica como biblioteca visual sin cambios; no se usa como prueba de la nueva interaccion. La entrega estable verifica respaldo, cambios concurrentes y hashes; sin staging, commit, tag ni push.
- Pendientes: comportamiento nocturno prolongado en partida autonoma, Android fisico, medicion real de framerate y consumo y nueva desconexion completa. La continuidad de color a 60 Hz es una prueba offline, no un certificado de rendimiento en hardware.

## La lapida runica: 2026-10-08

- 127 pruebas y build de las tres vistas aprobados. Diez pruebas nuevas cubren la inspeccion de 4.5 segundos sin cambios de IA, llegada desde ambos lados, direccion, activacion, mascara de 23 pixeles, recorrido simetrico desde la base, intensidad por fase, easing, pausa, interrupcion y guardados.
- Renderer de produccion offline: solo los 23 pixeles originales del grabado cambian. El aporte diurno es menor que el vespertino y nocturno. Salto maximo de cinco niveles RGB a 60 Hz; atlas y fallback identicos; movimiento ambiental desactivado congela la imagen exacta.
- Se inspecciona un detalle de seis momentos a zoom entero y un storyboard de llegada, inspeccion y salida. GIF de 180 frames a 15 fps con IA real, descubrimiento y nueva decision. No son capturas del navegador ni mediciones de rendimiento.
- Navegador real: capturas actuales de escritorio 1280 x 720 y movil 320 x 720, dia y noche. Canvas 384 x 216 y 192 x 304. Ancho de documento igual al viewport; labels y botones de 40 px no se solapan.
- Llegadas desde x=275 a 301 y desde x=405 a 369 comprobadas, junto con pausa, selector sincronizado, cancelacion por pose, cambio al farol y final de inspeccion con regreso a reposo y boton habilitado.
- Mundo vivo diurno: el toque sobre la lapida lleva a Miga a investigar; consola del mundo y visor sin errores ni avisos. Una accion de control de navegador agota el plazo y se recupera desde el estado actualizado, sin modificar la app.
- Los 178 archivos previos de assets conservan SHA-256. Miga, fuentes, exports, paletas, duraciones originales y el farol permanecen intactos. No cambian dependencias, necesidades, recompensas, zonas de toque ni esquema de guardado.
- README y medios de esta pasada actualizados. La lamina anterior se identifica como biblioteca sin cambios; no se usa como prueba de la interaccion. Entrega local con respaldo, preflight, hashes e inventario; no se ejecutan staging, commit, tag ni push.
- Pendientes: partida autonoma nocturna prolongada, Android fisico, framerate y consumo prolongados y nueva desconexion completa. La lectura de pixeles corresponde al renderer offline, no al canvas vivo del navegador.

## Escena patron y QA de estilo: 2026-10-12

- 138 pruebas y build correctos. Once regresiones nuevas verifican ramas con padre, taper, superficie independiente del orden, rechazos de metadatos, contraste por distancia, alpha y movimiento de niebla, composicion y escala. Inventario actual: 31 fuentes, 441 frames en 2048 x 3440 y 147 PNG.
- Renderer offline: 27 combinaciones de encuadre, fase y posicion; 216 casos de pose/direccion. Atlas y fallback identicos; 144990 pixeles opacos de Miga cotejados sin tintes, recortes u oclusion. Desactivar movimiento congela exactamente la imagen.
- El QA temporal detecta un pulso en la primera niebla: salto RGB maximo de 4 a 60 Hz. Interpolar su alpha antes de una unica composicion reduce el maximo a 2. La luna queda 100% visible y 87.97% del cristal calido de las lancetas permanece legible en el encuadre nocturno patron.
- Capturas nuevas y comparativas antes/despues; contacto de fuentes y GIF de 180 frames a 15 fps de IA real. Los renders y GIF se identifican como offline, no como capturas ni medidas de FPS del navegador.
- Visor real revisado en 1280 x 720 y 320 x 720, con dia, atardecer, noche, biblioteca, caminar, descanso, pausa y extremos. Se rehacen capturas de fase/pose con el visor visible tras detectar imagenes transitorias sin actualizar. Una demora de control se recupera desde accesibilidad.
- SHA-256: nueve archivos protegidos del kit, 23 de logica y los 279 archivos anteriores de Desktop conservados. Sin cambios de dependencias, reglas, objetos activos o guardado. README y guia corresponden al estudio; la entrega estable espera aprobacion de la escena, sin staging, commit, tag ni push.
- Pendientes: aprobacion artistica, unificar fuentes secundarias, Android fisico, framerate/consumo prolongados, desconexion real y partida nocturna prolongada. Los tests no certifican el acabado visual ni el rendimiento en hardware.

## Encuadre Amplio Tras El Rechazo: 2026-10-12

- El usuario rechaza la primera propuesta de estilo. Sus resultados tecnicos anteriores no implican aprobacion artistica. Esta revision corrige zoom, recorte de iglesia, luz y lectura de agua en el fondo.
- `npm run check`: 144 pruebas aprobadas y build de las tres vistas; cache offline de 19 recursos. Se conservan 31 fuentes, 441 frames y 147 PNG individuales. Se ajustan solo las dos bases de bosque y sus anclas, no las fuentes de Miga.
- Seis pruebas nuevas verifican mas espacio nativo y escala proporcional en seis proporciones habituales, limites de camara sin rangos invertidos, cruz completa, proyeccion de toques, emision nocturna y fondo sin corte horizontal. La conectividad y apoyo de las fuentes siguen bajo test.
- Renderer offline actual: 64 poses/direcciones, cuatro encuadres y dos fases; atlas y fallback identicos, 42960 pixeles opacos de Miga sin recorte ni tinte, ambiente congelado exactamente. GIF nuevo de 90 frames a 15 fps y 6000 ms totales, IA real con lapida como objetivo inicial. No es captura ni medicion de FPS.
- Navegador real: visor de dia/noche a 1280 x 720 y 320 x 720. Cruz completa, luz fria/caliente y escala revisadas. Juego autonomo diurno observado caminando en escritorio y descansando en vista movil; no se fuerza una pose desde el visor. Consolas finales sin errores ni avisos.
- Mediciones DOM: visor de escritorio 560 x 246 en un rectangulo 1280 x 563; mundo autonomo 560 x 255 en 1280 x 583. En vista movil del juego: 288 x 528 en 320 x 587. Encabezado y footer no se solapan con el canvas; ancho de documento coincide con viewport. Se restaura el viewport normal al terminar.
- Algunas acciones de automatizacion agotan su plazo y se recuperan desde el estado actualizado. Una pulsacion de extremo no se confirma tras una recarga del visor; no se presenta como prueba completa de ese flujo. La proyeccion y limites se comprueban en tests. Tampoco se afirma una nueva validacion completa del toque sobre objetos en navegador.
- Seis medios actuales del README: cinco capturas reales y un GIF offline. Dimensiones, hashes, 33 referencias y 17 anclas verificados. La lamina y comparativas anteriores quedan identificadas como historial.
- SHA-256: 33 archivos protegidos de logica, kit y dependencias, y los 279 archivos previos de Desktop sin cambios. Git estable limpio en `main...origin/main`. Sin copia, staging, commit, tag ni push: falta aprobacion visual de esta propuesta.
- Pendientes: acabado de arquitectura y fuentes secundarias, aprobacion del encuadre, Android fisico, rendimiento/consumo y partida nocturna prolongados, desconexion real y flujos de toque completos. El QA tecnico no certifica semejanza con la referencia.

## Entrega Aprobada Del Encuadre: 2026-10-12

- El usuario aprueba el encuadre amplio y pide los comandos para publicarlo. Se actualiza README y estado de la documentacion, manteniendo las seis capturas/medios de esta revision.
- La entrega verifica primero `main`, remoto `bryanpineda-dev/trash-world`, HEAD `759f981`, indice sin staging y etiqueta mas reciente `v0.1.7`. Se propone `v0.1.8`, sin crearla ni modificar etiquetas anteriores.
- El procedimiento respalda y coteja la base, preserva archivos locales y comprueba cambios concurrentes antes de copiar. Git, dependencias, caches y el `dist/` existente no se copian ni eliminan. No hay una copia espejo ni retirada de exports desconocidos.
- Las comprobaciones de la entrega incluyen hashes de todos los archivos, README y seis medios, 31 fuentes, 441 frames, 147 PNG, archivos protegidos, tests desde la carpeta estable y build desde esa carpeta en un directorio independiente. El reporte local de la entrega distingue estas comprobaciones de los renders y pruebas de navegador anteriores.
- No se ejecutan staging, commit, tag, push ni releases. La transferencia local no equivale a una publicacion. Permanecen las limitaciones de hardware y acabado artistico indicadas arriba.

## Auditoria Artistica Y Referencias: 2026-10-15

- El usuario rechaza color, arboles y lapidas. La aprobacion previa de encuadre no se interpreta como aprobacion del dibujo. Se documentan causas y una muestra acotada propuesta en [Direccion artistica](ART_DIRECTION_REVIEW.md), sin implementarla en el juego.
- Investigacion en paginas de autores: Moon Graveyard de Anokolisa y Pixelblogs 62 y 28 de SLYNYRD. Se inspeccionan las imagenes publicas de Moon Graveyard y el bosque del Pixelblog 62. Las consultas complementarias a Ansimuz y The Flavare se identifican con sus limitaciones, sin afirmar una revision visual completa.
- Lamina nueva offline de 1200 x 1160 desde las fuentes actuales: tres robles, cinco monumentos a zoom 2 y tabla de color calculada con la funcion del juego. No es captura de navegador ni un nuevo diseno. Se comprueba visualmente el archivo generado.
- Carga/validacion de 31 sprites y SHA-256 de 247 archivos de fuentes, runtime, scripts, tests y dependencias, iguales a Desktop. El calculo verifica mezclas de 27%, 50% y 66%; no es una prueba de belleza ni una medida de saturacion perceptual.
- Git estable verificado limpio en main...origin/main, HEAD cd30b5d y etiqueta v0.1.8. No se ejecutan acciones de escritura de Git ni se atribuye esta revision documental a esa etiqueta.
- README distingue arte rechazado de encuadre aprobado. Solo se modifican documentacion y la lamina en sandbox; no hay copia estable porque no es una entrega visual implementada ni una peticion de publicar.
- No se ejecutan nuevos tests de motor, build o QA del juego en navegador: no cambia runtime. Sus resultados anteriores siguen siendo historicos. Quedan pendientes el redibujo de la muestra, su comparacion visual y aprobacion antes de extenderla al bioma.

## Reconstruccion Del Cementerio: 2026-10-15

- El usuario rechaza la muestra anterior y solicita rehacer el ambiente, quitando farol, lapida runica y plantas de interaccion. Esta propuesta no se considera aprobada ni publicada.
- Catorce assets raster independientes generados con ImageGen integrado y la referencia del usuario: dos robles, tres monumentos, capilla, dintel, verja, dos panoramicas, sendero, sotobosque, hongos y luna. Originales intactos de 15 870 993 bytes; PNG nativos de 806 202 bytes. No se presentan como dibujo manual pixel por pixel. Manifiesto, anclas, recortes, hashes y briefs en `assets/reference-biome/`.
- `npm run check`: 158 pruebas y build correctos. Diez pruebas nuevas cubren biblioteca, integridad, siluetas distintas, color, cristal, vela continua, encuadre, retirada de objetos, guardados y parallax. Las pruebas del arte anterior siguen siendo historicas; no validan artisticamente los nuevos PNG.
- El renderer activo deja de cargar el atlas ambiental anterior. El build incorpora los recursos nativos nuevos; los dos mas pequenos quedan embebidos en JavaScript. Los 30 recursos del build estan declarados en el precache. Esto es una comprobacion de build, no una nueva prueba de desconexion real.
- Renderer de produccion offline: 96 casos de pose/direccion, cuatro proporciones y tres luces; atlas/fallback identicos y 64 440 pixeles opacos de Miga sin tinte, recorte ni oclusion. Pausa ambiental exacta. Los 483 668 pixeles de los 14 assets tienen alpha 0 o 255.
- SHA-256 conserva 208 archivos protegidos respecto al respaldo anterior a esta revision: fuentes y exports originales, kit de Miga, motor, persistencia, sensores, fisica y dependencias. World, CreatureAI y diagnostico cambian expresamente para retirar las interacciones; no se afirma que toda la logica permanezca igual.
- Mundo sin objetos activos ni hitboxes de farol/runa/planta. Partidas antiguas conservan sus recuerdos, pero cargan en IDLE si seguian caminando o inspeccionando un ID retirado. La IA sigue paseando y descansando con candidatos vacios, sin comida oculta ni recompensas fantasma. Las pruebas de interacciones historicas usan fixtures explicitas en lugar de asumir objetos activos.
- Navegador real: visor de dia/noche en 1280 x 720 y 320 x 720; lectura de capilla, suelo, vegetacion y capas. Biblioteca filtrada a las tres lapidas y Miga; pausa, caminata y camara movil. El control de posicion se comprueba en 32 y 528 estando en reposo. La caminata tiene su recorrido de demostracion 70-490. Se restaura el viewport al terminar.
- Mundo autonomo diurno observado paseando, mirando, durmiendo y despertando. El control Observar entra en LOOK_AROUND sin objeto; Guardar y Cargar muestran confirmacion de mundo cargado. Consolas finales del juego y visor sin errores ni avisos. Las demoras de control del navegador se recuperan desde el estado actualizado; no se interpretan como una medicion de rendimiento de la app.
- Seis medios nuevos: cinco capturas reales de navegador y una lamina offline. README enlaza las fases y moviles actuales, distingue la procedencia raster y retira las funciones antiguas de su descripcion. Enlaces, dimensiones, copia de medios y hashes verificados. Los renders offline y las cifras del panel no se presentan como benchmark de navegador.
- Git estable verificado limpio en `main...origin/main`, HEAD `cd30b5d`, etiqueta `v0.1.8`. No se cambia configuracion persistente de Git, no se copia esta propuesta sin aprobacion y no se ejecutan staging, commit, tag, push ni release.
- Pendientes: aprobacion artistica frente a la referencia, uniones de terreno para ampliar el mundo, movimiento de hojas, Android fisico, framerate y consumo prolongados, partida nocturna prolongada y desconexion real del nuevo build. El QA tecnico no certifica semejanza ni calidad artistica.

## Preparacion Para Versionar El Cementerio: 2026-10-15

- El usuario solicita preparar esta revision para subirla a GitHub. README y guia del escenario pasan de propuesta pendiente a revision preparada para versionado; las capturas son las de esta revision, no se sustituyen por medios anteriores.
- Preflight: carpeta estable limpia en main...origin/main, remoto `https://github.com/bryanpineda-dev/trash-world.git`, HEAD `cd30b5d` y ultima etiqueta `v0.1.8`. La siguiente etiqueta propuesta es `v0.1.9`; no se crea automaticamente.
- La entrega local requiere respaldo, comprobacion de cambios concurrentes, cotejo SHA-256 de archivos/medios/inventario, pruebas desde la carpeta estable y build en un directorio independiente. Se conservan `.git`, dependencias, caches, archivos locales y el build anterior; no se usa una copia espejo ni se borran recursos desconocidos.
- El QA de navegador y los renders anteriores siguen diferenciados de estas comprobaciones de transferencia. Versionar no elimina los pendientes de hardware, desconexion real y refinamiento visual documentados arriba. No se ejecutan staging, commit, tag, push ni release por pedir instrucciones de GitHub.
