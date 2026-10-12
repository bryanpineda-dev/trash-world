# Estudio De Estilo: Bosque Y Cementerio

Fecha: 2026-10-12. Estado: estudio original rechazado; [encuadre posterior aprobado](WORLD_VIEW.md) para entrega local. El acabado artistico de la biblioteca sigue pendiente. Base Git: `v0.1.7`.

La primera entrega de este estudio fue rechazada por el usuario: niebla con aspecto de agua, composicion demasiado grande y arquitectura insuficientemente afinada. Sus criterios de construccion no equivalen a aprobacion artistica. La [correccion de encuadre](WORLD_VIEW.md) es la revision actual. La referencia no se usa como fondo plano ni se extraen sus sprites.

## Escala

- Un pixel nativo comun para personaje, objetos y entorno. Sin ampliar individualmente un sprite pequeno para sustituir un arbol adulto.
- Miga: lienzo 64 x 64, 56 px visibles en reposo, ancla [32,61]. Sus fuentes, poses y clips permanecen intactos.
- Robles: 176 x 192; abedul: 104 x 146; arbol seco: 168 x 176; cipreses: 64/72 x 168.
- Fondos de bosque: dos fuentes de 192 x 112. Capilla: 80 x 112. Ruina: 112 x 80. Luna: 32 x 32. Sol: 24 x 24.
- La revision actual abre la camara: canvas de 560 x 246 en el visor a 1280 x 720 y 288 x 455 en 320 x 720. Encabezado y controles quedan fuera del canvas. En ventanas muy bajas se amplia la anchura para conservar al menos 240 pixeles nativos de altura, sin deformar sprites.
- El ancla define el apoyo de cada fuente. Los offsets de suelo por plano representan distancia, no nuevas colisiones.

## Dibujo

La silueta se lee primero. El contorno pertenece al material: madera oscura, piedra fria o follaje profundo. El token de contorno de Miga no se aplica al entorno.

La madera se construye desde un tronco y bifurcaciones ligadas a el. Cada rama conserva origen en su padre, arranque menor que el grosor disponible y punta mas fina. Las ramas de copa terminan mas arriba; las raices se extienden hacia el apoyo. La superficie se sombrea como una union, sin pintar encima cilindros con otra direccion de luz. Corteza y nudos siguen el recorrido y se agrupan en trazos breves, no rayas continuas del mismo grosor.

Los campos `woodStructure` conservan los planos de construccion de siete arboles para su QA. No son un rig animado; el juego dibuja las filas de pixeles. La validacion de metadatos no sustituye revisar la silueta real y sus uniones.

El follaje usa masas grandes como volumen y grupos mas pequenos para textura, con tamanos y posiciones irregulares. La luz viene de arriba a la izquierda. Las zonas interiores y el reverso de las copas tienen menos brillo. Evitar patrones reconocibles de hojas en filas. Las enredaderas se unen a madera o follaje y se estrechan al caer.

La piedra usa caras, cantos, juntas, pequenas grietas y musgo localizado. La capilla y la ruina se afinan dentro de su geometria anterior, preservando sus apoyos y huecos. Las lapidas, vegetacion pequena y senderos conservan sus dibujos por ahora, aunque reciben la paleta ambiental compartida. Su acabado debe revisarse contra la escena aprobada antes de ampliarlos.

## Composicion

| Plano | Papel | Parallax |
| --- | --- | --- |
| Horizonte de bosque | Dos masas distintas de robles y agujas de cipres, poco contraste | 0.09 |
| Bosque lejano | Copas simplificadas que separan horizonte y capilla | 0.16 |
| Capilla | Arquitectura reconocible y ventanas legibles | 0.24 |
| Cementerio intermedio | Ruina, verjas, tumbas y arboles secundarios | 0.42 |
| Marco cercano | Robles de las esquinas y piedra con mas contraste | 0.78 |
| Sendero y borde | Miga, objetos activos y plantas reutilizables | 1 |

El contraste disminuye con distancia mezclando hacia el color de niebla, no hacia el cielo oscuro. El horizonte tiene una mezcla adicional acotada. El cristal encendido conserva su tono calido. Los tonos son 32 tokens de escenografia; el kit de Miga sigue usando sus 16 colores aprobados. Las interpolaciones del renderer pueden producir colores intermedios, sin ampliar los tokens editables.

En el encuadre patron, x=275, las raices de los dos robles quedan fuera del centro de Miga. La composicion despeja las lancetas de la capilla y deja visible la luna entre las copas. Al desplazarse, las oclusiones naturales cambian con el parallax; no se fuerza una composicion fija en toda la caminata.

La vegetacion bajo el sendero empieza al menos 14 px por debajo del suelo de Miga. Da un primer plano al terreno sin tapar al personaje ni alterar zonas de toque.

## Ambiente

La niebla actual usa manchas separadas de 196 x 64 y 176 x 48, densidad maxima de .18 y aportes de .38/.22 por plano. No hay bancos solidos de color de horizonte. Su alpha se interpola antes de componer una sola vez; al pausar se reutiliza la mascara sin recalcularla. No usa blur, bloom ni particulas sobre Miga. Los fondos de bosque tienen borde inferior irregular y ancla ajustada a su ultima fila visible.

El viento conserva siluetas, troncos y raices y cambia suavemente pequenos grupos de tonos de hojas. Las ventanas siguen apagadas de dia y calidas al atardecer y de noche, con la variacion continua aprobada. Farol y runa conservan su logica y assets. Desactivar el movimiento ambiental congela el ambiente.

## Fuentes Y Revision

Los recursos siguen separados por carpetas en `assets/source/environment/`. Los nuevos fondos viven en `trees/forest-backdrop.json` y `trees/forest-backdrop-east.json`; sol y luna, en `sky/`. El indice registra 31 dibujos, 441 frames del atlas y 147 PNG individuales.

`scripts/draw-forest-study.js` conserva la receta editable de este estudio; `scripts/forest-brushes.js`, sus pinceles nativos. No se ejecutan automaticamente al arrancar. La receta reemplaza los dibujos y colocaciones del estudio: preservar cambios propios antes de volver a ejecutarla. Para editar un asset aislado, trabajar en su JSON y regenerar con `npm run assets`.

La [comparativa y QA](STYLE_MASTER_QA.md) son la base para aprobar el estilo. Despues de la aprobacion, aplicar estas reglas a las fuentes pendientes por familia, revisando cada una aislada y en escena antes de ampliar funciones.
