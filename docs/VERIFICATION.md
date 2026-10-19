# Verificacion de V0.1

## Profundidad E Hiedra, 2026-10-19

- Las dos torres comparten parallax 0.22, apoyo -71 y plano `landmark` detras del bosque intermedio. La torre oriental no cambia de dibujo ni de escala nativa.
- Iglesia de 173 x 256 con hiedra mas fina aprobada; misma ancla, recorte y mascara de roseton. Miga, arboles, fauna, zoom y reglas sin cambios.
- Sandbox: 266 pruebas, `assets:check` y build aprobados. 24 renders offline del renderer principal: tres zonas, dia/noche y cuatro proporciones. Se validan hashes, 39 exports, alpha binario y 164 archivos protegidos.
- Navegador: visor diurno del este, claro nocturno y carga del mundo principal comprobados a 495 x 452. La carga inicial incompleta del mundo termino correctamente. No se afirma QA de escritorio real, rendimiento ni dispositivo fisico.
- [Alcance](DEPTH_VEGETATION.md), [mediciones nuevas](DEPTH_VEGETATION_QA.json), [navegador](DEPTH_VEGETATION_BROWSER.json) y [entrega estable](DEPTH_VEGETATION_DELIVERY.json). Sin staging, commit, tag ni push.

## Vida Nocturna Y Orden, 2026-10-19

- Luciernagas con pausas y destellos independientes, un murcielago ocasional de cuatro poses y estrellas con coordenadas descorrelacionadas. Mismo reloj ambiental, desaparicion diurna y oclusion por la arquitectura cercana. Miga, sus clips y las reglas permanecen intactos.
- Se retiran 17 PNG duplicados del estudio de arquitectura y 51 directorios vacios, con respaldo y hashes. El estudio usa ahora los archivos canonicos de `assets/reference-biome/`; originales, caches y fuentes usadas por pruebas se conservan.
- Medios nuevos `nightlife-`: renders offline, comparacion del cielo y WebP lossless de 12 segundos. No se presentan como capturas de navegador ni como FPS medidos.
- [Alcance y limites](NIGHTLIFE.md), [QA del sandbox](NIGHTLIFE_QA.json), [auditoria](NIGHTLIFE_ASSET_AUDIT.json) y [entrega estable](NIGHTLIFE_DELIVERY.json). La evidencia anterior queda como historial. Sin staging, commit, tag ni push.

## Bosque, Torre Y Verja, 2026-10-19

- Revision actual: copas reparadas, torre occidental con estatua alada y verja continua con un pilar cada 252 unidades. Catalogo: 39 nativos y 33 originales distintos; la ciudadela y catarata dejan de estar activas.
- Sandbox: 257 tests, `assets:check` y build aprobados. Matriz offline del renderer: 882 combinaciones, 562422 pixeles opacos de Miga cotejados, alpha binario y archivos protegidos intactos. El bosque lejano recupera 18065 pixeles opacos respecto al export anterior, sin cambiar el original.
- Medios nuevos `environment-*.png`: renders offline inspeccionados de dia y noche; no son capturas de navegador. El navegador integrado fallo al adjuntar pestaña en esta pasada. Las capturas `integrated-` siguientes son historial de la revision anterior.
- Detalle y limites: [QA ambiental](ENVIRONMENT_POLISH.md). Resultados: [sandbox](ENVIRONMENT_POLISH_QA.json) y [entrega estable](ENVIRONMENT_DELIVERY.json). Sin staging, commit, tag ni push.

## Integracion Principal, 2026-10-19

- Por solicitud del usuario se integran los tres exports actuales y nueve cruces al mundo completo. La aprobacion del commit y futuras mejoras artisticas siguen pendientes; no se ejecuta ninguna escritura de Git.
- 38 nativos activos y 33 originales distintos. Se verifica el inventario exacto, las hojas compartidas, dimensiones, alpha binario y hashes. Se respaldan y retiran los seis PNG sustituidos.
- Nuevas regresiones cubren promocion exacta, ausencia de dependencias de runtime sobre estudios, nueve usos unicos, jerarquia de profundidad, mascara del roseton, metadatos de velas, encuadre entero y orden de dibujo. La inspeccion visual detecto que la verja ocultaba el altar; se corrige situando el oratorio delante de ella.
- El renderer offline se comprueba con Miga en reposo, caminata y descanso, ambos sentidos, tres horas, siete posiciones y siete proporciones. Se cotejan los pixeles del personaje, atlas/fallback y congelacion ambiental. Sus resultados son renders/pruebas del motor, no FPS de navegador.
- Navegador real: centro diurno/nocturno, patio nocturno y aplicacion principal. Los medios nuevos llevan prefijo `integrated-`. Las vistas previas de estudio anteriores son historial, no evidencia de esta integracion. Las pruebas de controles no repetidas, dispositivos fisicos, consumo y desconexion real siguen sin verificar.
- README, inventario y procedencia actualizados. La entrega se verifica por hashes y pruebas/build en el escritorio; el estado exacto de Git y archivos se registra aparte. Sin staging, commit, etiqueta, push ni release.

[QA del sandbox](ARCHITECTURE_INTEGRATED_QA.json). [Comprobacion y copia estable](ARCHITECTURE_DELIVERY.json). [Alcance y capturas](ARCHITECTURE_INTEGRATION.md).

## Perspectiva De Tumba: Revision 6, 2026-10-19

- Las revisiones 2-5 no estan aprobadas. La revision 5 conservaba un travesano casi vertical en pantalla, ajeno a la profundidad de la tapa. Se investigaron referencias en internet y se inspeccionaron en navegador una imagen del modelo de Mechan3D y la fotografia de Bradford-on-Tone. Referencias y limites en [Revision de perspectiva](TOMB_PERSPECTIVE_REVIEW.md).
- Candidato actual: tumba 120 x 49 con cruz pequena a la izquierda, travesano diagonal y esquina derecha completa. La iglesia del estudio mide 173 x 256 y el canvas 640/320 x 400; su roseton usa una mascara proporcional a sus dimensiones nativas. Produccion, Miga, camara activa, guardado y dependencias permanecen sin cambios.
- `npm run check`: 248 pruebas aprobadas, cero fallos, build correcto y 45 archivos en precache. Bundle independiente del visor correcto. La prueba de proporcion respeta el redondeo de hasta medio pixel en el eje no fijado del export, en lugar de medir solo error de ancho en objetos muy apaisados.
- 96 renders offline nuevos: dos anchos, seis horas, cuatro focos y actual/candidato. Doce originales y exports por hash, dimensiones y alpha binario. 150 archivos protegidos de produccion coinciden con su respaldo. En cinco instantes, el movimiento sigue limitado al roseton y las tres velas; la tumba es estatica.
- Navegador real a 1280 x 720: tumba de revision 6 junto a Miga, dibujada a escala nativa dentro de un canvas 640 x 400. Captura nueva `architecture-v6-browser-tomb.png`. No se afirma una nueva prueba interactiva de controles ni movil fisico; el fallo de herramienta registrado en revision 2 no se convierte en aprobado.
- Los medios `architecture-v6-*` corresponden a esta propuesta; las imagenes de revision 2 son historicas. El diagrama de ejes es documentacion independiente, no un asset ni un retoque manual del sprite.
- README y procedencia actualizados. Carpeta estable sin copiar por falta de aprobacion artistica; sin staging, commit, etiquetas ni push. Quedan abiertos la aprobacion de tumba e iglesia, el contexto del mundo completo y la entrega estable verificada.

[Datos de QA y estado de entrega](ARCHITECTURE_V6_QA.json). [Prompt completo](../studies/architecture/prompt-v6.json).

## Correccion De Profundidad Y Tapa: Revision 2, 2026-10-19

- El usuario rechazo la lectura visual de la tumba v1. Sus pruebas tecnicas no demostraban que el relieve pareciera una cruz. Una primera regeneracion de esta pasada tambien se descarto por conservar un travesano diminuto; la seleccionada tiene tapa inclinada mas visible y cruz latina asimetrica, exportada a 112 x 56. Comparacion nueva a 1x y 4x y captura de navegador a escala nativa.
- Iglesia y oratorio, originales y PNGs nativos, siguen byte-identicos. La iglesia no aumenta: conserva 140 x 208. Su base sube 16 px en la composicion y su parallax cambia de 0.64 a 0.48. Verja posterior a 0.58, cinco cruces traseras a 0.66 y cuatro marcadores delanteros a 0.84; Miga y objetos cercanos a 1. No se agrega niebla ni se modifica el fondo del juego.
- La primera colocacion ocultaba demasiadas cruces con la verja y se descarto durante QA. La verja queda ahora detras de las dos filas. Nueve recortes individuales se extraen de dos originales transparentes con limites en columnas sin alpha; cada dibujo se coloca una sola vez. El estudio conserva 12 PNG nativos y cinco originales, sin exports huerfanos. La biblioteca activa de produccion sigue en 29.
- Suite completa: 247 pruebas aprobadas, cero fallos. Siete pruebas del estudio. `assets:check`, build de produccion y bundle separado del visor aprobados. Produccion mantiene 45 recursos en precache; el estudio sigue fuera de ese build.
- 96 renders offline nuevos en dos anchos, seis horas, cuatro focos y dos revisiones; 12 exports por hash, dimensiones y alpha binario. 150 archivos protegidos de codigo, assets activos, dependencias declaradas y configuracion permanecen intactos respecto al respaldo previo. La comparacion temporal mantiene el movimiento limitado al roseton y altar.
- Navegador real a 1280 x 720: escenas de dia/noche y tumba aislada abiertas mediante sus URLs de fixture. Se guardan tres capturas nuevas. La accion sobre el checkbox y un intento de abrir otra pestana sufrieron timeout en la herramienta: no se cuentan como pruebas interactivas aprobadas ni como evidencia de un fallo de la aplicacion. El clic de ese control sigue pendiente de repetir. No se reutiliza el QA movil de v1 para validar v2; los perfiles estrechos de esta pasada son renders offline.
- Medios nuevos con prefijo `architecture-v2-`: piezas diurnas, escena diurna, escena nocturna, comparacion de tumbas, captura real diurna, nocturna y de tumba. Los medios anteriores conservados son historia, no evidencia de la correccion. No se ha medido FPS ni probado desconexion offline en esta pasada.
- Respaldo previo de 366 archivos comprobado. Carpeta estable sin copiar y limpia en `main`, siguiendo `origin/main`, HEAD `2e01f604b643fb5c65c697914a2715a63a128162`. Sin staging, commit, etiqueta ni push; propuesta pendiente de aprobacion.

[Datos y hashes de revision 2](ARCHITECTURE_V2_QA.json). [Comparacion visual y alcance](ARCHITECTURE_STUDY.md). [Prompts completos y procedencia](../studies/architecture/prompts-v2.json).

## Muestra De Arquitectura: Revision 1, 2026-10-19

- Propuesta aislada en `studies/architecture/`: iglesia con entrada doble y roseton, oratorio abierto con crucifijo y tres velas, y tumba con cruz en relieve. No cambia el juego ni el catalogo activo de 29 recursos.
- Suite completa: 245 pruebas, cero fallos; cinco pruebas nuevas del estudio. `assets:check`, build normal y bundle independiente del visor aprobados. Produccion conserva 45 archivos en precache; el estudio no se agrega al build ni al cache publicados.
- QA offline: 96 combinaciones de ancho, hora, foco y revision; originales y nativos por SHA-256; tres exports con alpha binario y proporcion preservada. Cinco muestras temporales por pieza mantienen su silueta. La variacion queda limitada a 139 pixeles del roseton y 393 pixeles del area local de velas, incluida su luz suave; la tumba no cambia.
- 150 hashes de `src/`, assets activos, declaraciones de dependencias y configuracion de build coinciden con el respaldo previo. Miga y los clips aprobados permanecen intactos.
- Navegador real a 1280 x 720: carga, dia/noche, actual/propuesta, escena/piezas, foco, extremos de camara y reproducir/pausar. Cero errores o avisos capturados en consola. Se corrige en el visor el zoom global que inicialmente sacaba el suelo del viewport de escritorio.
- Responsive probado dentro de ventanas anidadas de navegador de 320 x 720, 390 x 844 y 844 x 390; no son telefonos fisicos. En horizontal bajo el documento necesita scroll vertical para inspeccionar todo el canvas, manteniendo sus proporciones. No se declara corregido el encuadre de produccion por probar este visor independiente.
- Medios nuevos: `architecture-pieces-day.png`, `architecture-scene-day.png` y `architecture-scene-night.png` son renders offline 2x; `architecture-browser-night.png`, `architecture-browser-pieces.png` y `architecture-browser-mobile.png` son capturas reales convertidas a PNG. La ultima conserva el contexto de la ventana anidada, no pretende ser una captura de un telefono.
- No se ha medido FPS ni probado desconexion offline en esta pasada. Ciudadela, ramas, tratamiento de los bosques y recorrido completo siguen pendientes. Los nuevos raster proceden del generador integrado y una exportacion mecanica, no de retoque manual pixel a pixel.
- Carpeta estable sin copiar: `main` limpio y sincronizado con `origin/main`, HEAD `2e01f604b643fb5c65c697914a2715a63a128162`. No se ejecuta staging, commit, tag o push. La muestra y su documentacion esperan aprobacion antes de integrar o entregar a estable.

Datos y hashes de los seis medios: [ARCHITECTURE_STUDY_QA.json](ARCHITECTURE_STUDY_QA.json). [Capturas y alcance](ARCHITECTURE_STUDY.md).

## Historial

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

## HUD De Cristal Y Apoyo: 2026-10-15

- El usuario aprueba el estilo ambiental y pide contacto con el suelo, cristal en encabezado, stats flotantes de color y reloj circular. Esta nueva propuesta de interfaz permanece en sandbox para revision visual; no se confunde la aprobacion del arte con la del nuevo HUD.
- Se elimina la banda verde opaca bajo Miga. Las sombras se derivan de los tramos de la pose proximos al suelo, ocupan dos filas nativas de alpha 0.16/0.06 y se reflejan con su direccion. No se redibuja ningun frame ni se cambian tiempos, posiciones de huesos o reglas de animacion.
- Ancla del sendero de `[0,8]` a `[0,12]`: la fila anterior tenia 227 columnas transparentes. Se verifican las 560 columnas de las filas 11 y 12 como opacas. No cambian los PNG, las coordenadas logicas del personaje, la camara ni la proyeccion de toques.
- 170 pruebas y build correctos. Doce regresiones nuevas cubren todos los estados y colores, limites de reservas, horas/fases, continuidad a medianoche, actualizaciones del HUD, avisos de guardado, contactos de poses, reflexion y transparencia de sombras, y ancla del terreno.
- Renderer de produccion offline: 432 casos, tres luces, seis proporciones, tres posiciones y dos direcciones. Atlas/fallback iguales y 289 980 pixeles opacos de Miga cotejados sin alteracion u oclusion. Ambiente congelado exactamente. Lamina nueva de apoyo en reposo, caminar y dormir, ampliada por vecino mas cercano; no es captura de navegador.
- 254 archivos protegidos conservan SHA-256 respecto a la base anterior: arte, kit original, fuentes/exports, logica del juego, persistencia, sensores, camara y dependencias. El manifiesto ambiental cambia solo el ancla del sendero; no se agregan assets ni dependencias.
- Navegador real a 1280 x 720 y 320 x 720, ventanas de 844 x 260 y 320 x 260, y mediciones DOM a 390 x 844. Se revisan texto largo, colores de estado, reservas en tres niveles, aviso de almacenamiento y separacion de HUD/reloj. Las mediciones DOM se distinguen de una prueba en telefono fisico.
- La primera inspeccion identifica el exceso de caja de una orbita cuadrada rotada. El pivote pasa a tamano cero y los glifos siguen derechos; el reloj ya no ensancha su contenedor. Se ajustan puntos de cambio para que la variante compacta no invada el plano de caminar en alturas intermedias.
- Mediciones finales a ancho 844: con alto 360, suelo en Y=285 y stats/reloj en Y=316/312; con alto 381, suelo 301.625 y stats/reloj 305/304; con alto 541, suelo 428.292 y stats/reloj 432/433. No hay desborde horizontal y las superficies del HUD quedan debajo de las suelas.
- Vista controlada de navegador con los mismos Renderer y WorldHUD, sin guardados: fase/pose/reservas fijas y reloj acelerado 60x para comprobar avance. La lectura pasa de 22:07 y 151.75 grados a 09:06 y 1036.56 grados, con cambio de fase y sin animacion CSS independiente. Las pruebas unitarias verifican la continuidad exacta en medianoche; esto no es un benchmark de fluidez.
- Juego autonomo real: observado durmiendo, recuperando energia, mirando y caminando; los medidores coinciden con diagnostico y Observar cambia a LOOK_AROUND. El reloj refleja hora/fase de WorldTime. Captura real nueva del juego a 07:45, con necesidades vivas, separada de las muestras controladas. No se fuerzan hora o pose para esa captura.
- Cinco medios nuevos del README: juego autonomo, noche controlada, dos moviles controlados y lamina offline. El catalogo ambiental anterior se identifica como dibujos sin cambios, no como prueba del HUD. Se verifican dimensiones, hashes y referencias locales.
- Algunas capturas o consultas del control de navegador agotan su plazo durante recargas; se recupera la misma pestana desde el estado actualizado y se rehacen las capturas. Una invocacion de build usa una ruta duplicada y falla antes de compilar; la compilacion final se ejecuta desde la ruta correcta. No se presentan esos intentos como pruebas aprobadas.
- Pendientes: aprobacion del HUD/contacto, Android fisico, coste de blur y bateria, safe-area con muesca real, rendimiento prolongado, desconexion real y nueva partida nocturna prolongada. No se ejecutan commit, tag, push o transferencia estable para esta propuesta.

## Preparacion Para Versionar El HUD: 2026-10-15

- El usuario solicita los comandos de GitHub para esta revision. README y guia del HUD pasan a entrega local preparada para versionado. Se conservan los cinco medios nuevos de esta pasada, con su procedencia de navegador o renderer offline indicada.
- Preflight: carpeta estable limpia en `main...origin/main`, HEAD `b642e51`, remoto `https://github.com/bryanpineda-dev/trash-world.git` y ultima etiqueta local `v0.1.9`. Se propone `v0.1.10`, sin crearla.
- La entrega verifica respaldo y cambios concurrentes, hashes de todos los archivos y medios, inventario de los 14 assets ambientales y 254 archivos protegidos. Las pruebas se ejecutan desde la carpeta estable y el build se escribe en una carpeta independiente del sandbox para conservar el `dist/` anterior.
- El reporte local de transferencia registra los resultados de copia, pruebas y build; estos no sustituyen ni amplian las pruebas de navegador documentadas arriba. Se preservan `.git`, dependencias, caches y archivos locales, sin copia espejo ni borrados.
- No se ejecutan staging, commit, tag, push ni release. Permanecen los pendientes de hardware, rendimiento prolongado y desconexion real; una copia local no es una publicacion en GitHub.

## Extension Lateral Con Assets De Referencia: 2026-10-15

- El usuario aporta dos referencias y solicita ampliar el mundo lateralmente manteniendo la distancia entre planos. Cinco llamadas a ImageGen integrado reconstruyen angel sobre pedestal, mausoleo, grupo de cipreses, angel reclinado y cruz fracturada como recursos transparentes separados. No se afirma una extraccion pixel-exacta: las partes tapadas son generadas. Originales y PNG nativos tienen hashes y anclas; prompts completos en `assets/reference-biome/LATERAL_GENERATION.md`.
- El mundo pasa de 560 a 1680 unidades, limites -560 y 1120. No se desplaza el claro original ni se cambia el ancho nativo habitual de 560. Camara, colision y rango de exploracion cambian expresamente; se mantienen necesidades, velocidades, descanso, reloj, HUD y esquema de guardado.
- 182 pruebas aprobadas y build correcto. Doce regresiones nuevas cubren limites y margen de poses, zoom, guardados antiguos y posiciones nuevas, exploracion autonoma, cruces de las dos fronteras anteriores, proyeccion de toques, camara, origen unico de parallax, tramos de suelo y orden de planos.
- La primera pasada detecta un test antiguo que suponia que -100 siempre era invalido; ahora se prueba un extremo realmente fuera del nuevo mundo. Otra asercion se ajusta a la tolerancia de llegada existente de 0.1, sin cambiar el movimiento para satisfacer una igualdad exacta artificial.
- Renderer de produccion offline: 504 casos, tres luces, cuatro proporciones, siete posiciones, tres poses y dos direcciones. Atlas y fallback iguales, 321 384 pixeles opacos de Miga cotejados sin tinte, recorte u oclusion. Ambiente congelado exactamente. Panoramicas generales y lamina de cinco assets son renders offline, no capturas ni benchmarks.
- Alpha 0/255 comprobado en 549 658 pixeles de los 19 PNG. El sendero alterna el original y su reflejo, sin modificar el archivo. Se cotejan 208 pixeles RGBA en cuatro bordes enfrentados, y las filas 11 y 12 siguen opacas en las 560 columnas. No se certifica un tileset de plataformas o pendientes arbitrarias.
- SHA-256 conserva 250 archivos protegidos: los dibujos anteriores, el kit/atlas original de Miga, su rig, sus necesidades, persistencia, reloj, HUD de cristal, sombras, renderer principal y dependencias. Las cinco piezas se anaden sin sobrescribir assets existentes. El build incluye 35 recursos en precache; no equivale a una nueva desconexion real.
- Navegador real: capturas actuales del visor a 1280 x 720 y 320 x 720, alas oeste y este, dia y noche controlados. Canvas de escritorio 560 x 246 y movil 288 x 393; ancho del documento igual al viewport. Los controles moviles ocupan filas separadas y no se desbordan. Posicion -528 y 1088 comprobadas mediante el slider y seleccion directa de zonas.
- Biblioteca del navegador filtrada a Lapidas: seis monumentos y Miga como referencia de escala, con rutas y tamanos correctos. Algunas acciones del control de navegador agotan su plazo; se recupera el estado actual y no se presentan los intentos incompletos de reproduccion/cierre como flujos validados. La caminata entre fronteras se verifica en pruebas de simulacion, no se confunde con una nueva prueba completa de ese recorrido en navegador.
- README y medios nuevos identifican su procedencia. La lamina anterior de sombras queda como documentacion historica sin cambios, no evidencia de esta extension. La propuesta queda en sandbox: no se copia a la carpeta estable sin revision ni se ejecutan staging, commit, tag, push o release.
- Pendientes: aprobacion artistica de las dos alas, recorrido completo prolongado en navegador, Android fisico, framerate/consumo, desconexion real y futuras interacciones. La repeticion de robles y verja es reutilizacion de biblioteca, no una nueva variante dibujada.

## Identidad De Zonas Y Vida Ambiental: 2026-10-15

- El usuario rechaza las copias de hitos en las alas y solicita variedad de tumbas, ofrendas y hongos, con luciernagas nocturnas y vida diurna. Doce llamadas independientes a ImageGen integrado producen ciudadela/puente, torre, roble seco, fresno, marmol con rosas, obelisco, losa, urna, dos franjas de flora y dos bosques. Originales, exports, anclas y hashes registrados; prompts exactos en `IDENTITY_PROMPTS.json`. No se afirma dibujo manual ni extraccion pixel-exacta.
- Una sola iglesia central. Cada edificio, monumento y arbol protagonista se coloca una sola vez en el mundo; los hitos de las alas no copian los del centro ni los de la otra ala. Se conservan modulos estructurales de suelo y verja y la vegetacion central anterior; no se promete unicidad de cada elemento modular.
- La inspeccion visual detecta copas ensanchadas en los fondos iniciales. Se exportan de nuevo conservando proporcion: bosque lejano 1600 x 220 y franja intermedia 900 x 213, sin mosaico. La tumba clara se separa del centro de revision de Miga. Los PNG originales y los 19 recursos previos permanecen intactos.
- 202 pruebas aprobadas y build correcto. Veinte regresiones nuevas cubren unicidad, zonas, fondos, biblioteca, fases ambientales, densidad, brillo asincrono, movimiento local, continuidad a 60 Hz, proyeccion desde la camara, pausa, aleteo, hojas intermitentes, tiempo invalido, estado del canvas y dibujo sin segundas copias de flora bajo el piso.
- Renderer offline: 504 casos, tres fases, cuatro proporciones y siete posiciones, tres poses y dos direcciones. Atlas/fallback iguales y 321 384 pixeles opacos de Miga cotejados sin tinte, recorte u oclusion. Pausa ambiental exacta. Las particulas aisladas cambian 89 pixeles entre las dos parejas de muestras diurnas/nocturnas, con extension acotada.
- Alpha binario comprobado en 1 335 322 pixeles de 31 exports. SHA-256 conserva 280 archivos protegidos, incluidos dibujos anteriores, Miga, logica, persistencia, HUD, camara y dependencias. El renderer ambiental evita crear una pequena copia temporal de RGB por cada pixel al preparar las superficies; conserva los resultados de color existentes.
- Build con 47 recursos en precache. Pruebas completas con runner Node y concurrencia 2, y build normal de npm con sus pasos pre/post. Esto no es una prueba nueva de desconexion, framerate o consumo.
- Muestras WebP offline lossless, 120 frames de entrada por fase y doce segundos. El codec fusiona frames identicos, por lo que se valida duracion y un numero de frames codificados entre 2 y 120, no igualdad artificial con la entrada. Primer frame decodificado cotejado con el buffer original. No son grabaciones ni benchmarks de navegador.
- El control de navegador no responde al recuperar la pestana ni al abrir una nueva; la apertura desde la app queda en cola. No se confunde ese fallo del control con una prueba aprobada ni se reutilizan capturas antiguas como evidencia de los nuevos dibujos. Todas las vistas y animaciones actuales del README se identifican como offline; la lamina de sombras anterior queda expresamente como documentacion historica.
- No cambian las 1680 unidades, guardados, reglas, velocidades, clips de Miga o HUD. No se copia esta propuesta a Desktop ni se ejecutan staging, commit, tag, push o release. Pendientes: aprobacion artistica, navegador real, recorrido prolongado, Android fisico, rendimiento/consumo y desconexion real.

## Luz Continua Y Profundidad: 2026-10-16

- El usuario solicita corregir una franja gris bajo el bosque, la escala/oclusiones de la ciudadela occidental y la lectura del dia, con transiciones de cielo/paleta, estrellas y vida segun hora. Se respalda la propuesta anterior antes de editar. Los 31 dibujos raster originales y nativos permanecen intactos.
- La ciudadela pasa a escala 0.58, parallax 0.22 y offset -71, detras del bosque intermedio 0.34. La torre oriental 0.56 permanece delante de ese plano. Una base forestal irregular cierra los huecos claros de cielo entre las raices y la verja; sotobosque y menor mezcla atmosferica sustituyen la lectura de banda gris, sin anadir una lamina de niebla.
- `Daylight` interpola cinco grados cromaticos desde `WorldTime.hour`: noche, amanecer, dia, luz dorada y crepusculo. Conserva el dia de 1440 segundos, las etiquetas de simulacion y el reloj/HUD. El cielo, la vegetacion y las superficies reciben cambios continuos. Las altas luces de la piedra conservan diferencias, sin clipping blanco masivo. Solo el cristal de la iglesia tiene mascara emisiva; las piedras/estatuas no reciben nuevas fuentes ni halos.
- Campo fijo de 840 estrellas nativas, ocultables por los assets del paisaje; aparicion gradual, sin reseeding por frame. Luna elevada y con color original. Luciernagas, mariposas y hojas reciben pesos continuos segun hora, manteniendo habitats, trayectorias deterministas y el mismo control de movimiento ambiental.
- 222 pruebas aprobadas y build correcto. Veinte regresiones nuevas cubren continuidad de todo el ciclo y los antiguos limites de fase, medianoche, color, claves finitas de cache, alpha, altas luces, suelo, estrellas, oclusion/escala y entrada gradual de vida/luz.
- La primera prueba temporal offline encuentra una doble mezcla de opacidad de luna/mascara de vela al pasar entre grados. Se corrige dibujando esos recursos una sola vez, y se agrega una regresion especifica. No se relaja el umbral temporal para ocultar el fallo.
- Renderer offline de produccion: 504 casos, tres horas/fases de referencia, cuatro proporciones, siete posiciones, tres poses y dos direcciones. Atlas/fallback iguales, pausa exacta y 321 384 pixeles opacos de Miga cotejados sin tinte, recorte u oclusion. Las nuevas imagenes incluyen cinco momentos del dia y vistas de las tres zonas, ademas de la comparacion horaria.
- SHA-256 conserva 303 archivos protegidos: todos los dibujos, fuentes/atlas de Miga, logica, persistencia, reloj, HUD, camara y dependencias. Los 31 PNG conservan alpha binario en 1 335 322 pixeles; los 47 recursos del build quedan incluidos en el precache. No es una prueba nueva de desconexion.
- Ciclo WebP offline lossless: 200 muestras de entrada, 20 segundos, un dia comprimido 72x. Se cotejan el primer frame decodificado y la duracion; el codec puede fusionar muestras identicas. Se compara tambien la diferencia media RGB en ambos lados de medianoche y limites horarios, manteniendo umbral menor de 0.15/255. El movimiento entre muestras del ciclo acelerado permanece menor de 5/255 de diferencia media. No se presenta como benchmark ni grabacion de navegador.
- README y guia `DAYLIGHT.md` documentan esta revision con nuevos medios `daylight-*`. El visor permite ajustar hora continua y cinco presets sin tocar una partida. Las laminas antiguas que permanecen en README se identifican como documentacion de mecanismos o dibujos sin cambios.
- Navegador: recuperar la pestana vuelve a agotar el tiempo del controlador. No hay nuevas capturas reales ni se certifican los controles, el layout movil, FPS, bateria o hardware a partir de los renders offline. Queda pendiente esa comprobacion manual/real.
- Esta propuesta sigue en sandbox para aprobacion artistica; la carpeta estable se verifica contra su base anterior y no se modifica. No se ejecutan staging, commit, tag, push ni release.

## Auditoria Critica De Assets: 2026-10-16

- Revision solicitada expresamente, sin reexportar sprites ni cambiar runtime. Se inspeccionan 31 pares original/nativo, todos PNG reales: hashes y dimensiones correctos, alpha binario nativo, recortes dentro de la fuente y sin pixeles alpha >= 240 fuera de ellos. Cero PNG fuera del manifiesto y cero duplicados exactos.
- Uso: 29 recursos del mundo y 2 bosques disponibles solo en biblioteca. El cargador sigue precargando los 31. Se identifican 147 exports PNG del entorno procedural anterior, su atlas y 13 archivos de estudios; no forman parte del runtime actual, pero generadores y tests aun dependen de ellos. No se borran ni mueven.
- Se registran cambios de proporcion relativos al recorte original: pilar -15.6 %, sotobosque -11.4 %, cruz +6.1 %, lapida arqueada -4.5 %, suelo +6.4 %, luna -3.2 % y bosque lejano anterior +11.8 %. No se confunde ese porcentaje con perdida de calidad. Se priorizan pilar/sotobosque; el modulo de suelo y el disco lunar no se reexportan automaticamente.
- 78 encuadres geometricos y 18 renders nuevos offline. Edificios completos en las cinco proporciones habituales auditadas; a 3440 x 360, el limite de ancho produce canvas 2048 x 214 y corta entre 5 y 14 filas superiores de cuatro construcciones. Los cipreses pierden 18 filas de copa en vistas de 240 px nativos. Se distingue recorte de camara de recorte del archivo.
- El renderer mantiene vecino mas cercano. Las reducciones fraccionarias del sotobosque a unos 30 x 18 px descartan detalle, aunque no haya blur. Las miniaturas de panoramicas de la biblioteca tampoco permiten una inspeccion a resolucion real. Ambos puntos quedan como hallazgos, no como correcciones ya realizadas.
- Vite compila las tres entradas en modo sin escritura, permitiendo revisar el bundle sin regenerar los historicos. El renderer procedural anterior no esta entre los modulos de produccion. Se ejecutan de nuevo las 222 pruebas del proyecto y se coteja que los 39 archivos de `src` y los 62 PNG permanecen intactos durante el cierre documental.
- README, inventario JSON e informe `ASSET_QA.md` incorporan cuatro laminas nuevas offline, con ampliaciones enteras para los sprites. Los anchos tienen lamina propia para no cortarlos ni superponerlos. No son capturas de navegador ni prueban CSS, DPR, interfaz movil o rendimiento real.
- El control automatizado de navegador vuelve a agotar su tiempo. Esa comprobacion permanece pendiente. Se conserva la carpeta estable y no se ejecutan staging, commit, tag, push ni release; la auditoria queda en sandbox con hallazgos abiertos.

## Proporcion Y Encuadre: 2026-10-16

- Correcciones aprobadas para implementar en sandbox tras la auditoria. Respaldo previo de 464 archivos, verificado antes de editar. Se reexportan solo pilar y sotobosque desde sus originales, manteniendo altura y puntos de apoyo: 85 x 142 con ancla [31,142] y 79 x 42 con ancla [40,42]. No hay nueva generacion de dibujos ni alteracion de originales.
- Camera conserva ancho, zoom habitual y proyeccion horizontal. En vistas bajas deja al menos 12 filas inferiores; edificios, monumentos y cipreses marcados ajustan escala/offset juntos para conservar ocho pixeles arriba, con redondeo acotado. La mascara del cristal comparte el rectangulo final de la capilla. Arboles de borde y panoramicas pueden quedar parcialmente fuera del viewport deliberadamente.
- 236 pruebas aprobadas y build completo. Catorce regresiones nuevas cubren proporciones, anclas, hashes fuente, encuadres, cipreses, offsets, parallax, resize, rectangulos de dibujo, cristal y coordenadas de toque. Se actualiza una prueba historica cuyo margen fijo de 32 filas ya no representa la nueva politica de vistas bajas.
- Renderer de produccion offline: 882 casos, tres horas, siete proporciones, siete posiciones, tres poses y dos direcciones; 562 422 pixeles opacos de Miga cotejados, atlas/fallback iguales y pausa exacta. Alpha 0/255 en 1 337 546 pixeles nativos. Los 47 recursos del build estan incluidos en el precache; no equivale a probar desconexion.
- Auditoria actualizada: 31 originales/nativos con hashes y dimensiones correctos, cero PNG fuera de manifiesto, duplicados exactos o pixeles alpha alto fuera de sourceRect. Cero recortes verticales de sujetos revisados en 78 encuadres y 18 renders adicionales offline. Permanecen cinco avisos de proporcion que requieren criterio artistico o preservar contratos: cruz, lapida arqueada, suelo, luna y bosque anterior de reserva.
- SHA-256 conserva 304 archivos protegidos. Miga, atlas, rig, animaciones, reglas, persistencia, HUD, originales raster y dependencias quedan intactos. Cambian dos PNG nativos, manifiesto y tres modulos de encuadre. No se borran recursos historicos que todavia consumen generadores/tests.
- El control de navegador vuelve a funcionar con un servidor local nuevo. Capturas reales nuevas del visor: escritorio 1280 x 720 (canvas 560 x 246), movil 320 x 720 (288 x 331), horizontal 844 x 390 (1250 x 240) y panorama 3440 x 360 (2048 x 121). El ancho de documento coincide con el viewport. Se prueban cambios de zona/momento, apertura/filtro/cierre de biblioteca y se consultan errores/avisos de consola sin resultados. El override de viewport se restaura al terminar.
- Captura principal del README: fixture real en navegador a 1280 x 720 y 22:00, renderer y HUD actuales, sin cargar ni guardar una partida. No se presenta como prueba autonoma prolongada. Los renders de antes/despues se calculan de nuevo desde el respaldo y la revision actual; los detalles de vistas extremas estan identificados como recortes. Los medios `framing-*` son nuevos y distinguen navegador de offline.
- La carpeta estable no se modifica y la propuesta espera revision visual. Sin staging, commit, tag, push o release. Pendientes: variantes pequenas de vegetacion, inspector nativo, carga diferida de reservas, revision artistica, recorrido prolongado, Android fisico, rendimiento/consumo y desconexion real. Detalle en `ASSET_FIXES.md`.

## Revision Visual Integral: 2026-10-18

- Auditoria solicitada, sin cambios del runtime ni de los PNG. Se registra una base de hashes del estado actual antes de repetir las comprobaciones. La documentacion y medios nuevos no se presentan como una correccion artistica.
- Se repiten las 236 pruebas completas y el build normal con pre/post: aprobados. Renderer offline de produccion: 882 casos, 562 422 pixeles opacos de Miga cotejados, atlas/fallback iguales y pausa exacta. La auditoria de 31 pares original/nativo vuelve a pasar dimensiones, hashes, alpha, limites del recorte y ausencia de duplicados/archivos fuera del manifiesto. Los sujetos geometricos revisados no se cortan en 78 encuadres; esto no certifica su escala relativa ni composicion.
- Navegador real: tres zonas a dia/noche; amanecer, atardecer y crepusculo centrales; reproduccion/pausa de caminar y dormir; filtros y cierre de biblioteca; visor a 320 x 720 y 1920 x 260. El fixture controlado del juego comprueba HUD a 1280 x 720, 320 x 720, 390 x 844, 844 x 390 y 320 x 320. Los limites DOM de header, HUD y reloj quedan dentro de la pantalla y no se superponen en esas mediciones.
- Una captura inicialmente destinada a movil sigue en escritorio porque el override se aplica a la pestana seleccionada del HUD. Se detecta midiendo el DOM, se excluye esa imagen como prueba movil y se repite con una sola pestana: viewport/documento 320 x 720, canvas 288 x 331. Dos acciones del controlador agotan su tiempo; el estado se comprueba despues antes de continuar. No se convierten intentos fallidos en pruebas aprobadas. Se restaura el viewport y la consola consultada no muestra errores ni avisos.
- Nuevas laminas offline: quince vistas horarias, seis posiciones de fronteras/extremos, seis muestras de poses y los 31 assets divididos entre recursos individuales y panoramicas a escala 1x. Los medios JPEG son capturas reales del navegador; los PNG son renders/laminas offline. Las horas del rotulado se muestran en HH:MM, no como decimales.
- Hallazgos abiertos: luna fragmentada por oclusion en algunos encuadres; escalas relativas alteradas por ajuste individual en ventanas muy bajas; vegetacion reducida repetitiva y franjas compuestas en lugar de plantas sueltas; simbolos de estado oscuros; cielo excesivo en vertical; falta de inspector nativo y estado de uso en biblioteca; retoques locales de enredaderas/proporciones menores. Ver `VISUAL_REVIEW.md`.
- Miga, rig, animaciones, originales, exports, reglas, dependencias y persistencia conservan sus hashes actuales. No se promueve a Desktop ni se ejecutan acciones de Git. Sin telefono fisico, benchmark FPS/consumo, nueva desconexion real ni partida autonoma prolongada. Esta revision no deja el acabado visual aprobado automaticamente.
- Cierre: 311 archivos actuales de runtime/assets/dependencias intactos; 385 archivos de base de la carpeta estable conservados y Git limpio en `main...origin/main`. La herramienta recorta la captura de 390 x 844 a 390 x 780 y la de 1920 x 260 a 1511 x 260; se identifican como parciales y se usan medidas DOM para los limites completos. No se reporta ese recorte instrumental como un defecto CSS de la app. La imagen vertical publicada de 320 x 720 y la horizontal de 844 x 390 estan completas.

## Investigacion Del Mundo: 2026-10-19

- Entrega documental, no correccion artistica. Fuentes primarias y propuesta en `WORLD_BUILDING_RESEARCH.md`; datos reproducidos en `WORLD_RESEARCH_MEASUREMENTS.json` y dos laminas nuevas `world-research-*` en `docs/images/`. Son estudios offline, no capturas reales ni nuevos assets de produccion.
- Nueve assets medidos desde sus PNG/recortes y colocaciones, siete entradas de tamano para la formula de camara y cuatro trazas estaticas de solicitudes/dibujo de superficies. Los bosques activos permanecen a 1x; la ciudadela se reduce de 420 x 177 a unos 244 x 103 en escena. No se infiere el DPR o el viewport CSS real desde el adjunto del usuario.
- La traza muestra superficies solicitadas antes del descarte: oeste/mediodia, 29 claves solicitadas y 14 dibujadas. Estimados RGBA por dimensiones, no mediciones de heap/GPU o tiempos. No se atribuye a ello una latencia de navegador demostrada.
- No se repiten suite/build ni navegador porque no cambia codigo o arte; los 236 tests y el build del dia 18 quedan identificados como evidencia previa. Se cotejan los 311 hashes protegidos actuales y la base de la carpeta estable en el cierre documental. Sin instalaciones, cambios de dependencias, staging, commit, tag, push, copia a Desktop o release.

### Ampliacion: Escalas Y Perspectiva

- Se inspeccionan en navegador capturas oficiales de Blasphemous, The Last Faith y Kingdom Two Crowns. Las lecturas de composicion son interpretaciones visuales, no acceso a sus renderers ni mediciones de sus distancias. No se extraen sus assets ni se incorporan imagenes comerciales al repositorio; se enlazan originales y galerias en `WORLD_SCALE_AND_PERSPECTIVE.md`.
- Estudio offline nuevo: `world-perspective-scale.png`, seis elementos al mismo aumento entero 2x, y `WORLD_PERSPECTIVE_MEASUREMENTS.json`. Miga se mide por bounds visibles: 28 x 56; los assets ambientales, por export completo. La lamina no propone que compartan plano. Cuatro entradas de camara calculadas, sin inferir el DPR del adjunto ni segmentar puertas como medicion exacta.
- La capilla tiene parallax efectivo 1 y offset -25, frente a mausoleo 0.86/-12 y torre 0.56/-35. La ambiguedad espacial es una inferencia artistica, no una formula de distancia deducida de esos valores. Se proponen rangos de escala y criterios para proteger la cruz, sin cambiar runtime/PNGs.
- La navegacion de referencia tiene esperas y una seleccion que agota tiempo; se consulta el estado despues y solo se analizan imagenes efectivamente visibles. No es una nueva prueba real de Trash World. Se conserva el juego y la carpeta estable, sin operaciones de escritura Git.

## Limpieza De Assets: 2026-10-19

- Respaldo previo de 499 archivos fuera del proyecto, con SHA-256 comprobado antes de editar. Retirada individual y acotada de 162 exports: 147 PNG procedurales, 13 exports de estudios y dos PNG de bosques sustituidos. Total versionable retirado: 866 487 bytes; no se presenta como espacio libre neto porque existen respaldo y caches.
- El manifiesto contiene 29 assets activos y dos registros `retiredSources`. Se preservan los 31 originales, los 29 dibujos que usa el mundo, todas las colocaciones y los modulos de `src`. Miga, rig, clips, atlas, reglas, guardado, HUD y dependencias quedan intactos. Se cotejan 146 archivos retenidos de runtime/fuentes/assets/lockfile con el respaldo; las modificaciones deliberadas son metadatos, generadores, pruebas y documentacion.
- Suite completa nueva: **240 pruebas aprobadas**, incluidas cuatro regresiones de ciclo de vida del inventario. Los 160 exports regenerables se cotejan byte a byte mediante hashes previos y comprobaciones de contenido. `assets:check`, build normal, exportacion historica explicita y verificacion de los exports del estudio pasan. Ninguno devuelve los archivos retirados a sus antiguas rutas de assets.
- `npm run assets:legacy` recupera los 160 exports en `.cache/legacy-assets/`, ignorada por Git. El build normal solo mantiene los atlas que aun necesitan Miga y los estudios/pruebas; no vuelve a llenar las carpetas de exports historicos.
- Dos bundles nuevos del renderer, desde respaldo y revision actual: **54 casos identicos pixel a pixel**, tres zonas, dia/noche, tres proporciones y tres poses; 8 776 512 pixeles comparados. Los 29 PNG nativos conservan sus hashes y alpha 0/255 en 1 037 546 pixeles. El build tiene 45 archivos y todos figuran en precache; no equivale a probar desconexion real.
- Navegador real en el servidor local existente: biblioteca con 30 canvases (29 recursos mas Miga), filtro Fondos con solo los dos bosques activos, cierre del modal y cambio al patio de noche. Capturas nuevas de biblioteca y escena; consola consultada sin errores ni avisos. Un intento de leer pixeles mediante el puente DOM no esta soportado y un selector de label no encuentra coincidencias; se usa el ID observado, se comprueba el estado y se inspeccionan las capturas. No se cuentan esos intentos como pruebas aprobadas.
- README, inventario JSON, guia de limpieza y medios nuevos distinguen renders offline de capturas reales e informes historicos. No se implementan aun los cambios propuestos de iglesia/oratorio/tumba o perspectiva. La carpeta estable se conserva y no hay staging, commit, tag, push ni release; la entrega estable espera aprobacion.
