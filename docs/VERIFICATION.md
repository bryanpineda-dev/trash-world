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
