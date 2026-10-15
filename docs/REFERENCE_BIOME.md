# Cementerio De Referencia

Estado: revision implementada en sandbox el 2026-10-15 y preparada para entrega local y versionado por solicitud del usuario. Transferencia, commit, etiqueta y publicacion son pasos separados; no se ejecutan acciones de escritura de Git automaticamente.

El usuario aprueba despues el estilo del cementerio. La siguiente pasada se limita a [interfaz y contacto](GLASS_HUD.md): dibujos ambientales intactos y ancla del sendero corregida de `[0,8]` a `[0,12]`, para usar una fila de piedra opaca. Tras revisarla, solicita su entrega local y los comandos de GitHub; se prepara por separado como `v0.1.10`, sin ejecutar acciones de escritura de Git.

## Alcance

El usuario pide reconstruir el ambiente a partir de su referencia y retirar la lapida runica, el farol y las plantas de interaccion. Personaje, animaciones y encuadre amplio aprobado no se redibujan.

La propuesta anterior basada en formas y texturas generadas por codigo no se considera aprobada. Esta revision usa catorce dibujos raster independientes, generados con la referencia visual como guia y almacenados en `assets/reference-biome/`. Procedencia y briefs en `GENERATION.md`; no se afirma que sean pixel art manual.

## Composicion

1. Cielo continuo, sin franjas de niebla. Luna despues del dia.
2. Panoramica lejana: parallax 0.12, mezcla atmosferica cromatica de 25%.
3. Bosque intermedio: parallax 0.34, mezcla de 4%.
4. Capilla mas fria con cruz completa y cristal independiente; monumentos lejanos y verja apoyados en el terreno.
5. Ruina central y tres monumentos cercanos; bordes derivados de piedra y musgo.
6. Dos robles distintos, sotobosque, hongos y sendero. Tronco y ramas pertenecen al mismo dibujo, sin poligonos de ramas superpuestos.
7. Miga al final, sin filtros de luz ni cambios de escala por asset.

El suelo oscuro enlaza las bases con el camino. No hay una lamina azul/gris sobre el piso. La vegetacion inferior queda cortada por el borde de pantalla en vistas altas, sin flotar debajo del camino.

## Escala Y Color

- Mundo de 560 unidades. Ancho nativo y camara mantienen el encuadre aprobado.
- Miga: lienzo 64 x 64, altura visible de reposo 56, paleta de 16 colores.
- Robles: 215 x 236 y 208 x 244. Capilla: 102 x 154. Monumentos: 50 x 78, 44 x 53 y 64 x 112.
- PNG nativos con alpha binario y vecino mas cercano. Originales grandes sin modificar.
- El ambiente no esta restringido a los antiguos 32 tokens. La graduacion se cachea por fase y profundidad, no se recalcula por fotograma.
- La biblioteca ajusta panoramicas para mostrarlas completas; eso no cambia la escala de juego.

## Movimiento

Los arboles solo se desplazan con su plano de camara. No hay bamboleo de troncos, deformacion de ramas ni cambios de silueta por frames. El movimiento de hojas queda pendiente de aprobar el arte quieto.

De dia el cristal es frio. Al atardecer y de noche mantiene su dibujo ambar; una mascara varia de 0.035 a 0.115 de alpha sin apagar la base ni cambiar de frame. Luciernagas discretas y vela se congelan al desactivar movimiento ambiental.

## Interacciones Retiradas

`WORLD_OBJECTS` queda vacio. Farol, runa y planta no se dibujan, no tienen hitbox ni objetivos en el visor. Las plantas decorativas no son comida ni objetos clicables.

El guardado conserva los IDs historicos `tree`, `plant`, `can` y `stone`, descubrimientos y eventos. Cancela WALK/INSPECT hacia ellos al cargar. La IA maneja una lista vacia, pasea y descansa sin recompensas fantasma. El diagnostico Observar usa LOOK_AROUND.

Modulos y dibujos antiguos quedan archivados, con fixtures explicitas para sus pruebas; no entran al renderer activo. El laboratorio original permite verlos sin reactivarlos en el mundo. Sin planta ya no existe comida ambiental automatica; no se incorpora un sustituto oculto.

## Biblioteca Y Limites

El manifiesto registra familia, archivos, dimensiones, anclas, recortes y hashes. Siete familias: trees, gravestones, architecture, backgrounds, terrain, vegetation y sky.

No se usa un fondo completo con Miga incrustada. El sendero de 560 pixeles cubre esta composicion; sus uniones con tramos nuevos requieren revision. Los fondos son panoramicas; sus repeticiones no equivalen a arboles individuales editables.

Las pruebas verifican integridad, escala, renderizado y compatibilidad, no calidad artistica ni aprobacion. La semejanza se revisa visualmente con el mismo encuadre diurno/nocturno y los PNG aislados.
