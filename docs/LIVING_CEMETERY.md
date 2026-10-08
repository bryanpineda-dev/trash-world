# Biblioteca viva del cementerio

Este documento conserva la pasada del 2026-10-07. La [revision del bosque del 2026-10-08](PREMIUM_FOREST.md) sustituye el dibujo de arboles y capilla, el viento de bloques y los frames de vidrio. Consulta esa guia para el comportamiento y las cifras actuales.

Pasada visual: 2026-10-07. Continua los patrones de [materiales](MATERIAL_STYLE.md) sin cambiar a Miga, su escala, sus clips ni la paleta del personaje.

## Familias

- Arboles: roble antiguo, roble hueco e inclinado, abedul, cipres completo y de punta rota, arbol seco retorcido y robles lejanos. Copas agrupadas, corteza con volumen y raices apoyadas; no se amplian sprites pequenos.
- Lapidas: ojival, vencida, redonda y partida; cruz anillada y tumba runica del kit. Las caras son piedra tallada con biseles, grietas y desgaste; las juntas de bloques se reservan principalmente para las ruinas y la capilla.
- Bayas: se conserva el arbusto interactivo original. Tres fuentes decorativas aportan porte bajo, ramificado y de ramas arqueadas. No crean nuevos objetivos de IA ni nuevas zonas de toque.
- Se afinan tambien verja, capilla, matorral, helecho, flores, hongos y roca. Ruina, senderos y farol conservan la pasada anterior.

El indice contiene 28 assets en ocho familias. Las nuevas fuentes viven en `trees/`, `gravestones/` y `vegetation/berries/`, dentro de `assets/source/environment/`. Cada una conserva lienzo, ancla y pixeles editables. La biblioteca filtra las subcarpetas dentro de su familia.

## Animacion

Las fuentes animadas anaden `variants` con parches de pixeles y `animation` con `loop`, `frames` y `regions`. Reutilizan `expandPart` y `frameAt` del modelo del personaje; no hay una segunda implementacion del reproductor. `rest` siempre coincide con el dibujo base.

- Viento: siete arboles, tres variantes de dibujo por asset y ciclo de 3500 ms. Grupos localizados de hojas y musgo cambian un pixel; troncos, ramas de soporte y raices quedan fijos. Cada colocacion tiene un desfase determinista para evitar movimientos sincronizados.
- Capilla: cristal en reposo, calido o ligeramente atenuado, con duraciones desiguales y ciclo de 2160 ms. No cambian el marco, la piedra, el tejado ni la silueta. Ninguna ventana se apaga por completo.
- La animacion usa el mismo reloj ambiental que niebla y luciernagas. Se congela al pausar el visor, abrir la biblioteca o desactivar movimiento ambiental en el juego.

La exportacion contiene 396 frames de fase, profundidad y variante en un atlas de estantes compactos. Se generan 132 PNG transparentes individuales: `<fase>.png` para reposo y `<fase>-<variante>.png` para los frames adicionales. No se duplican variantes identicas de reposo en el atlas.

## Arbol Retirado

El roble pequeno deja de estar en `World.objects`: no se dibuja en el mundo, no recibe toques y Miga no lo busca. Su fuente, secuencia y vista en el laboratorio de objetos se conservan como archivo reutilizable.

El ID `tree` sigue siendo valido para descubrimientos, recuerdos y eventos antiguos. Al cargar una partida que estaba caminando hacia el arbol o inspeccionandolo, se cancela ese objetivo y Miga vuelve a reposo, sin perder posicion, necesidades ni descubrimientos. No cambia la version del guardado.

## Revision

Las pruebas comparan cada pixel exportado con cada variante fuente, verifican siluetas conectadas en todos los frames de viento, materiales inmoviles, suelo, anclas, desfases, tiempos y rechazo de parches invalidos. La auditoria coteja Miga y la carpeta estable contra el respaldo previo.

Las laminas fuente muestran la misma escala entre las variantes de una familia. Las bayas y Miga comparten zoom entero 3 para juzgar proporciones; los arboles y la piedra usan zoom entero 2. Los renders de contexto ejecutan el renderer de produccion fuera del navegador; queda pendiente repetir la revision de interfaz y encuadre CSS en escritorio y movil.

La entrega estable se prepara con respaldo y comprobacion de hashes, tras la aprobacion del usuario. Copiar el proyecto a Desktop no publica nada en GitHub: staging, commit, etiquetas y push son pasos separados.
