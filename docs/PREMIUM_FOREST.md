# Revision del bosque: forma, material y movimiento

Revision del 2026-10-08, aprobada por el usuario para entregar a la carpeta estable de Desktop y preparar `v0.1.4`. La referencia principal es la composicion de bosque y cementerio enviada por el usuario: troncos arqueados en los extremos, copas detalladas, vegetacion en distintos planos, piedra desgastada y capilla de fondo. La copia local incluye fuentes, exports y README actualizado; no ejecuta commit, etiqueta ni push automaticamente.

## Referencias

- [SLYNYRD: Top Down Trees](https://www.slynyrd.com/blog/2023/5/22/pixelblog-44-top-down-trees): construccion de follaje mediante agrupaciones con volumen y luz coherente. Se estudia el material, no se adopta la perspectiva cenital.
- [SLYNYRD: Wind Effects](https://www.slynyrd.com/blog/2021/7/16/pixelblog-33-wind-effects): movimiento local y secuencial de hojas. Aqui se usa una variacion mas tenue de tonos para mantener las siluetas nativas.
- [Ansimuz: Cemetery Woods](https://ansimuz.itch.io/ultimate-gothicvania-collection/devlog/1060527/cemetery-woods): referencia secundaria de composicion lateral y profundidad para un cementerio medieval.

No se incorporan sprites, texturas ni capturas descargados de esos autores. Las fuentes siguen siendo dibujos propios en JSON editable.

## Dibujos

- Los tres robles tienen estructuras de tronco y ramaje distintas. Las ramas son trazos curvos de grosor decreciente, con la misma direccion de luz, parcialmente ocultos por grupos de hojas delanteros. No se pintan extremidades como poligonos independientes sobre toda la copa.
- Se rehacen abedul, ambos cipreses, arbol seco, roble lejano y matorral. La corteza tiene tonos de madera propios, en vez de depender del verde del follaje. El roble lejano conserva su lienzo completo sin recortes laterales.
- La capilla mantiene 80 x 112 px y ancla [40,111]. Cruz, torre, tejado, contrafuertes y contacto con el suelo tienen una silueta simetrica; el desgaste y la luz pueden variar sin alterar el eje. Dos ventanas de arco apuntado comparten altura y proporciones.
- Miga, sus clips y el kit interactivo aprobado permanecen intactos. No se cambian fisica, IA, guardados, sensores ni dependencias.

## Movimiento

Seis arboles tienen cuatro variantes de tonos, sobre la misma mascara opaca. Cambia menos del 2.5% de sus pixeles en cada variante, solo dentro de pequenos grupos de hojas. Se interpolan con smoothstep entre frames del reproductor compartido: no se desplazan bloques enteros de copa ni se dejan bordes dobles. La madera del arbol seco queda inmovil.

La capilla no tiene frames `warm`/`low`. El cristal calido es permanente. `candle` declara una mascara de tokens y una cantidad maxima; el renderer aplica una superposicion continua, tenue y acotada solamente dentro del vidrio. No cambia piedra, marco, tejado ni silueta.

La respuesta exponencial de la camara pasa de 1.8 a 8 por segundo. Conserva suavizado independiente del framerate y se pausa con dt=0. Terreno, toques, objetos, niebla y parallax comparten una coordenada de camara redondeada; los planos no tienen relojes o suavizados de seguimiento independientes. El parallax conserva sus proporciones, y los escalones de un pixel nativo siguen siendo parte del estilo.

## Exportacion Y Revision

28 fuentes, ocho familias, 32 tokens de entorno, atlas de 414 frames en 2048 x 3224 y 138 PNG individuales. Los doce exports obsoletos de ventana y musgo quedan respaldados y se retiran del sandbox. Se conservan lienzos, anclas y tres fases de luz.

La revision automatizada cubre seguimiento de camara a 30/60/120 Hz, coherencia de proyeccion y toques, continuidad en cada transicion y cierre del loop, material inmovil, simetria de arquitectura y exportacion pixel a pixel.

Los renders de contexto ejecutan el bundle de produccion con canvas fuera del navegador, en escritorio y movil, dia y noche. Se generan una comparativa antes/despues, detalle de capilla y GIF de movimiento. Estos artefactos no verifican CSS, controles DOM, rendimiento de navegador ni un telefono fisico. La revision real en navegador se reporta por separado.
