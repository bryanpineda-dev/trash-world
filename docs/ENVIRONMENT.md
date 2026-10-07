# Entorno: familia de assets a escala estable

Los cuatro objetos se dibujan pixel a pixel con bordes de 1 px propios de cada material, paleta de 16 colores y luz superior izquierda. Miga mantiene su contorno aprobado. Aumentar detalle no significa cambiar el tamano de un pixel. Ningun objeto recibe una ampliacion individual en el mundo.

## Medidas nativas

| Asset | Lienzo | Alto visible | Ancla de suelo | Alto respecto a Miga |
| --- | --- | --- | --- | --- |
| Miga en reposo | 64 x 64 | 56 | [32, 61] | 1.00 |
| Farol de hierro | 24 x 40 | 38 | [12, 39] | 0.68 |
| Tumba runica | 36 x 48 | 46 | [18, 47] | 0.82 |
| Arbusto de bayas | 28 x 28 | 26 | [14, 27] | 0.46 |
| Roble pequeno | 64 x 64 | 62 | [32, 63] | 1.11 |

El alto visible excluye margenes transparentes. Todos los frames terminan exactamente sobre su ancla: la ultima fila del lienzo de cada objeto es transparente y el contorno de apoyo esta una fila antes. El roble es un arbol pequeno de este mundo de bolsillo, no un arbol adulto dibujado a escala reducida.

## Materiales y variantes

- Farol: asa cerrada, tejadillo, marco de hierro envejecido, cristal ambar, llama clara y base con volumen. `flicker` cambia solo la llama; conserva los tiempos anteriores de 480/180 ms.
- Tumba: borde biselado, cara frontal tallada, sombra lateral, grieta agrupada, musgo y pedestal. `lit` ilumina solo el grabado; conserva los tiempos de 1800/800 ms.
- Arbusto: ramas escalonadas, hojas con volumen y bayas coral. `breeze` dobla el extremo superior 1 px; tallo y raices conservan su apoyo. Tiempos: 2400/1400 ms.
- Roble: tronco curvado, corteza agrupada, ramas conectadas, copa por grupos y raices con musgo. `breeze` desplaza la copa 1 px sin mover la base. Tiempos: 3000/1800 ms.

Las fuentes y variantes viven en `assets/source/parts.json`; anclas, etiquetas y secuencias viven en `characters.json`. Los cuatro usan el atlas y el mismo fallback de fuentes que Miga. Plantas y arboles ya no se dibujan como rectangulos independientes en el renderer.

## Integracion

Las posiciones y los IDs persistentes siguen intactos: `plant` (x = 95), `can`/farol (164), `stone`/tumba (335) y `tree` (458). No se reinician necesidades, memoria, descubrimientos ni guardados existentes.

`WORLD_OBJECTS` conserva el alto visible y el radio que cubre todos los frames de cada objeto. Las pruebas comparan esas medidas con el atlas. El toque acepta 6 px de margen y cubre tambien la parte alta de la tumba y la copa. La distancia de investigacion es el radio del objeto mas 16 px; Miga se detiene junto a la silueta, en ambos sentidos.

Miga, sus siete slots, todos sus pixeles, limites visibles y tiempos permanecen intactos. Esta familia se aprobo antes del rediseno del fondo. La segunda propuesta del [bioma](BIOME.md) sustituye solo los contornos casi negros de estos objetos por tonos de material, sin cambiar su dibujo, transparencias, variantes ni animaciones. Una regresion fija su geometria y tiempos anteriores.

## Revision

- `style-kit.png` compara Miga y los cuatro objetos a escala entera 3, con un mismo suelo.
- El visor muestra objetos y piezas en lienzos de 160 x 160, con los sprites a escala entera 2. Sus columnas se reorganizan en pantallas estrechas sin encoger los pixeles.
- 73 tests y build aprobados. Siete regresiones nuevas cubren identidad de Miga, medidas, apoyo, zonas de toque, aproximacion, regiones animadas, siluetas conectadas y compatibilidad de guardados.
- Revision visual de la lamina fuente de dia y noche, y de los cuatro objetos en el visor. Viewport movil medido: 320 x 720, ancho de contenido 305 mas una barra vertical de 15 px, sin desbordamiento horizontal; los trece lienzos de objetos y piezas mantienen 160 x 160 CSS.
- La base anterior se conserva fuera del proyecto activo en `work/archive/environment-assets/` del espacio de trabajo. La etiqueta Git `v0.1.0` no se modifica.
