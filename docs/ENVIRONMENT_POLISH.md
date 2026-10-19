# Revision Ambiental

2026-10-19. Alcance: tres correcciones antes del commit, sin ampliar el mundo ni alterar a Miga.

## Cambios

- Se reparan los huecos artificiales de las copas del bosque intermedio en el original raster. El export de 900 x 229 conserva su aspecto; ancla inferior a 229 y parallax 0.34. En el bosque lejano se regenera el export desde su original intacto: se recuperan 18065 pixeles opacos borrados indebidamente y se coteja cada pixel de alpha con la fuente.
- Una torre memorial de 70 x 190 con angel de piedra alado sustituye ciudadela, puente y catarata. La figura con alas responde a la preferencia del usuario. Se conserva `distantCitadel` como id interno; el archivo activo es `guardian-tower.png`.
- Hierro y pilares se separan en dos recortes nativos del dibujo existente. Tramos de 84px y un soporte cada 252px, con un unico origen entero de parallax. No se estiran barrotes ni se cambia la verja al mover la camara.
- Se retiran solo los dos PNG de la ciudadela anterior, con respaldo y hashes fuera del repositorio. Catalogo: 39 exports, 33 originales distintos, todos los activos consumidos.

## Pruebas

Sandbox: 257 tests aprobados, `assets:check` y build aprobados. Cuatro regresiones nuevas cubren continuidad y espaciado de la verja, extraccion de modulos, sustitucion del hito occidental y export de alpha del bosque lejano.

El renderer principal compilado se comprueba offline en 882 combinaciones: siete viewports, siete posiciones, tres horas, tres poses y dos direcciones. Se contrastan 562422 pixeles opacos de Miga, fallback contra atlas y pausa exacta. Se verifican 1022908 pixeles de alpha binario, 150 archivos protegidos sin cambios y 45 recursos de precache. Esto no mide rendimiento de navegador.

Se inspeccionaron a ojo los seis renders nuevos de oeste, centro y este, dia y noche. Los medios `environment-*.png` son renders offline ampliados 2x sin suavizado. No se reutilizan las capturas de la integracion anterior como evidencia nueva.

El navegador integrado no logro adjuntar una pestaña en esta pasada. Quedan pendientes la comprobacion interactiva en navegador, dispositivo fisico y rendimiento. La vista previa estable es `http://127.0.0.1:5190/`; el visor permite inspeccionar cada zona sin tocar la partida.

Resultados mecanicos: `ENVIRONMENT_POLISH_QA.json`. Entrega, hashes de paridad y verificaciones en carpeta estable: `ENVIRONMENT_DELIVERY.json`. Los documentos de arquitectura anteriores son historial de esa revision, no el estado de esta pasada. No se ejecutan staging, commit, tag ni push; la aprobacion visual final sigue pendiente.
