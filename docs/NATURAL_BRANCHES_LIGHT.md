# Ramas, Enredaderas Y Luz

Revision del 2026-10-08, desarrollada en sandbox sobre la base `v0.1.4`. Se prepara para entregar localmente y versionar como `v0.1.5`; no crea commits, etiquetas ni publicaciones automaticamente.

## Dibujo

Los tres robles conservan sus lienzos de 176 x 192 y anclas. Las bifurcaciones nacen de puntos de la curva del tronco, se estrechan hacia arriba y desaparecen parcialmente detras del follaje. Se elimina la rama baja casi horizontal que atravesaba el roble antiguo. El tronco se pinta sobre la union de las ramas para evitar una barra de sombra superpuesta.

Las enredaderas de robles, abedul y arbol seco se apoyan en un pixel de madera o follaje. Su caida es fina, con curvatura corta por gravedad y grupos de hojas espaciados de forma irregular. No se convierten en otra animacion ni se desplazan sus siluetas. Miga, los objetos interactivos, los cipreses y el resto de dibujos mantienen sus fuentes aprobadas.

## Iglesia

La geometria de la capilla no cambia. `candle.phases` habilita luz solo en `EVENING` y `NIGHT`; `unlit` cambia los tokens de cristal `D` y reflejos `f` a los materiales frios `E` y `A` durante `DAY`. La misma paleta por sprite se usa en atlas, PNG individuales y fallback del renderer.

De dia no se dibuja la mascara de vela. Al atardecer y de noche, la base calida y la variacion continua anterior permanecen visibles. Se conservan ventanas alineadas, marco, piedra, ancla y silueta. No se alternan frames encendido/apagado.

## Farol

El aporte de luz afecta solo los pixeles existentes del sendero, vegetacion del borde y briznas cercanas. Es un tinte ambar acotado por distancia, con niveles discretos de pixel art, sin halos, blur, bloom ni lectura del framebuffer en cada frame.

Las mascaras se cachean por fase, sprite, orientacion y posicion mundial. Su alcance es 48 px horizontal y 44 vertical alrededor del foco a 24 px del suelo; el tinte maximo es 30% de noche y 15% al atardecer, y desaparece de dia. Los faroles superpuestos no acumulan exposicion. La luz permanece anclada al mundo al mover la camara y no recolorea a Miga, el fondo lejano ni el kit aprobado del farol.

## Verificacion

105 pruebas y build correcto. Se cotejan los 414 frames y 138 PNG, incluidos los nuevos colores diurnos de la capilla. Regresiones nuevas cubren cristal y reflejos apagados, validacion de fases, luz local y ausencia de la rama transversal.

Prueba adicional del renderer real: atlas y fallback coinciden exactamente en dia y noche. El suelo no recibe aporte de luz diurno; de noche cambian 1139 pixeles de superficies locales. Al mover la camara se mantiene el color en la misma coordenada mundial y se reutilizan las mascaras de luz.

Capturas reales del visor en 1280 x 720 y 320 x 720, de dia y noche; documento sin desbordamiento horizontal y biblioteca movil con ancho interno y scrollWidth de 265 px. Caminata observada avanzando de x=294 a 299. Filtro de arboles, cierre de biblioteca y captura de la escena comprobados; logs finales sin errores o advertencias.

Los renders offline y el GIF siguen identificados como tales. No se usa el canvas del navegador para leer pixeles a traves del evaluador DOM: esa API no estaba disponible. No se mide framerate real, telefono fisico, consumo prolongado ni una nueva desconexion completa.
