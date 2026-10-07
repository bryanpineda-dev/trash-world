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
