# Bosque de las ruinas: biblioteca del cementerio

Bioma de fantasia medieval misteriosa: robles antiguos, abedules abiertos, cipreses y sauces secos retorcidos. Lapidas biseladas, cruces anilladas, verja envejecida y ruinas con musgo rodean el claro. Una capilla gotica se situa a la izquierda de Miga, tras las ruinas y la niebla. Niebla baja, luciernagas turquesa y luna con crateres completan la noche. Es una propuesta visual para aprobar el entorno, no un cambio del personaje ni una expansion de sus reglas.

## Escala y profundidad

Miga conserva sus 56 px visibles en reposo. El roble usa 176 x 192 px, el abedul 104 x 146, el sauce seco 168 x 176 y el cipres 64 x 168. El roble lejano se dibuja en 56 x 84, con menos detalle por distancia. Se dibujan a escala nativa 1, sin ampliar los pixeles de un sprite pequeno. Las veinte fuentes decorativas admiten lienzos de hasta 192 x 192; el contrato de piezas del personaje y objetos sigue limitado a 64 x 64.

Familia de piedra: lapida ojival 48 x 72, lapida vencida 48 x 46, cruz anillada 64 x 96 y ruinas 112 x 80. La capilla usa 88 x 112, la verja 96 x 40 y la luna 48 x 48. Tres tramos de sendero de 64 x 32 comparten sus columnas de union y conservan un suelo plano. Helechos, arbustos, setas, flores y rocas completan la biblioteca. Todas las fuentes incluyen ID, nombre, lienzo fijo, ancla y filas de pixeles editables.

Los planos lejanos, medios y cercanos usan factores de parallax de 0.16, 0.42 y 0.78. La arquitectura usa 0.24 y profundidad lejana; se dibuja antes de la niebla y los arboles medios. La vegetacion del borde usa 1, igual que Miga y los objetos. Todas las posiciones se redondean a pixeles enteros. El color pierde contraste hacia el fondo; dia, atardecer y noche tienen paletas de 32 tokens con los mismos materiales. Solo el cristal iluminado `D` reduce la mezcla atmosferica para conservar el ambar. No hay blur ni bloom.

El roble pequeno se conserva como brote interactivo. Arboles adultos, tumbas y verja pertenecen exclusivamente a la escenografia: no tienen descubrimientos, colisiones, zonas de toque ni estado persistente. Los cuatro objetos anteriores solo cambian sus contornos por tonos propios del material; posiciones, siluetas, animaciones y zonas de toque siguen intactas.

La niebla usa franjas escalonadas, sin blur ni gradientes, detras de los arboles cercanos y de Miga. Las luciernagas son pequenos grupos de 1-3 px, sin bloom, siempre detras del personaje. Ambos movimientos son deterministas, redondeados a pixeles enteros y se congelan con el movimiento ambiental desactivado.

## Fuentes

- `assets/source/biome.json`: indice v2, paletas y colocacion por planos; ya no contiene los dibujos.
- `assets/source/environment/`: un JSON por dibujo, agrupado por familia.
- `scripts/biome-source.js` y `src/rendering/BiomeSource.js`: misma validacion para Node y Vite; rechazan rutas externas, duplicados, archivos ausentes e IDs incompatibles.
- `scripts/generate-biome.js`: atlas determinista de 180 variantes de sprite, fase y profundidad, mas 60 PNG individuales transparentes.
- `src/rendering/BiomeModel.js`: validacion, color y posicionamiento sin dependencias del navegador.
- `src/rendering/BiomeRenderer.js`: atlas, fallback con las mismas fuentes, capas y sendero.

```text
assets/source/environment/
  trees/
  vegetation/
  gravestones/
  ruins/
  fences/
  terrain/
  sky/
  architecture/churches/
```

Los PNG individuales viven en `assets/generated/environment/<familia>/<nombre>/<fase>.png`, por ejemplo `trees/oak/night.png`. Sus medidas y ancla estan en el JSON fuente; el juego sigue usando el atlas compartido. Los cuatro props animados permanecen en el kit aprobado `parts.json`/`characters.json`, sin duplicar fuentes ni cambiar su paleta.

Para un asset nuevo, crear su JSON en la familia correspondiente, registrar `{id,path}` en `assetFiles` y anadir una colocacion si debe aparecer en el mundo. La cuadricula del visor se alimenta del indice. Editar las filas nativas o las paletas y ejecutar `npm run assets` antes de `npm run check`; los tests rechazan exportaciones desactualizadas.

`npm run assets` regenera ambos kits y `npm run assets:check` valida ambos. No hay imagenes remotas, dependencias nuevas ni fondos generados por IA. El renderer del mundo vivo y el visor comparten exactamente este entorno.

## Visor

Abrir `/biome-lab.html`. Selectores de momento y pose, posicion y pausa. No lee ni escribe `localStorage`; tampoco modifica el reloj, necesidades o memoria del mundo vivo. El sprite puede caminar en el visor y su estado de dormir reproduce el clip aprobado completo.

El boton de cuadricula abre la biblioteca: Miga y los veinte assets completos, sobre un mismo suelo, a escala nativa 1 y con la luz seleccionada en la escena. Lienzos fijos de 208 x 208 evitan recortar el roble. Un selector filtra por familia; Miga sigue visible como referencia de escala. La biblioteca pausa el visor mientras esta abierta y se cierra con su boton o Escape. En movil, el canvas ocupa el espacio entre encabezado y controles: ambos dejan de tapar la composicion.

## Inspiracion y autoria

Las tres referencias del usuario orientan siluetas, desgaste y ambiente; no se copian ni se mezclan sus resoluciones. La investigacion visual incluyo [los arboles de Tolee Mi](https://tolee-mi.itch.io/haunted-graveyard/devlog/1315159/update-005-trees) y [el cementerio de Thimbleweed Park](https://blog.thimbleweedpark.com/cemetery.html). Se tomaron como referencia de variedad y composicion, no como recursos para importar. No se descargaron ni redistribuyeron sprites de terceros. Todos los dibujos activos son originales y sus fuentes nativas viven en el proyecto.

La nueva referencia del cementerio orienta corteza, follaje agrupado, desgaste de piedra, ventanas calidas y composicion. Esta primera familia afina roble, lapida, capilla y sendero; las demas fuentes se organizan sin pretender que toda la biblioteca tenga ya el mismo nivel de acabado. La propuesta permanece en el sandbox hasta aprobar su composicion. No cambia versiones, commits ni etiquetas del repositorio estable.
