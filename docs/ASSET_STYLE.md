# Trash World: guia de estilo de assets V1

## Direccion

Fantasia medieval pequena y amable: una calaverita curiosa que vive por su cuenta, extremidades libres, objetos encontrados y magia discreta. La referencia de comportamiento son los cubitos fisicos autonomos. No estamos construyendo un RPG de combate o inventario.

El tablero de inspiracion es una referencia de ambiente, no un spritesheet listo para produccion. Los sprites del kit estan definidos pixel a pixel en `assets/source/` y exportados de forma determinista. El perfil de Miga sigue la referencia de anatomia entregada por el usuario.

## Reglas visuales

- Trabajar a resolucion nativa, sin suavizado, degradados, blur ni subpixeles.
- Contorno oscuro de 1 px. Luz desde arriba a la izquierda; sombras agrupadas, no ruido aleatorio.
- Cabeza grande y silueta legible. Expresiones con pocos pixeles, ojos oscuros y gestos tranquilos.
- Los cambios de color conservan contraste entre contorno, material, sombra y luz.
- Escalar por numeros enteros y con nearest-neighbor. No reinterpretar el tamano de un pixel entre assets.
- El suelo es el punto de apoyo del personaje y los objetos. Cambiar una pieza no debe mover ese punto.

La paleta siguiente se aplica a este kit de personajes y objetos. El fondo procedural de V0.1 todavia tiene sus propias paletas de dia, tarde y noche; migrarlo al nuevo lenguaje visual queda para la siguiente pasada de arte.

## Paleta canonica

La fuente de verdad es `assets/source/style.json`. Los tokens se usan en las filas de pixeles.

| Token | Hex | Material |
| --- | --- | --- |
| k | #233b37 | Contorno |
| b | #eee4c9 | Hueso |
| h | #fff6df | Luz de hueso |
| s | #b7b19a | Sombra de hueso |
| t | #365d5c | Tela oscura |
| c | #5e8b83 | Tela |
| e | #91b6a2 | Luz de tela / magia |
| g | #68815b | Musgo |
| m | #9aa96a | Luz de musgo |
| a | #61746e | Piedra oscura |
| r | #8b998b | Piedra |
| l | #b4bcaa | Luz de piedra |
| w | #7f6351 | Cuero / madera |
| o | #bb865a | Metal / brasa |
| f | #efc278 | Luz de farol |
| p | #cf8685 | Acento coral |

`.` significa transparencia. No anadir colores nuevos para cada dibujo: elegir primero los materiales existentes. Una revision de paleta debe tratarse como un cambio del kit completo.

## Rig skeleton-v2

Lienzo de personaje: **64 x 64 px**. Ancla de suelo: **[32, 61]**. Coordenadas desde la esquina superior izquierda; offsets enteros. El margen lateral permite desplegar los huesos sin recortarlos.

| Orden | Slot | Posicion | Pieza | Tamano |
| --- | --- | --- | --- | --- |
| 1 | leftArm | [12, 22] | arm, reflejada | 16 x 26 |
| 2 | leftLeg | [17, 39] | leg, reflejada | 16 x 24 |
| 3 | rightLeg | [31, 39] | leg | 16 x 24 |
| 4 | body | [25, 22] | ribs | 14 x 18 |
| 5 | pelvis | [26, 38] | pelvis | 12 x 8 |
| 6 | rightArm | [36, 22] | arm | 16 x 26 |
| 7 | head | [22, 4] | skull | 20 x 22 |

Cada lado elige variantes y offsets por separado. Las poses de perfil desactivan el espejo de la pierna lejana para que ambos pies miren hacia la marcha. El brazo lejano se dibuja detras del torso con espejo y variantes `far-swing-*`; cada plano tiene su recorrido de codo y mano. Un personaje compatible conserva rig, poses y clips y cambia solo piezas o remapeos.

El orden de la tabla es el frontal. `drawOrder` en la pose `side` coloca `leftArm` (lejano) antes de las costillas y `rightArm` (cercano) despues de ellas; se hereda en las ocho fases de caminar. El torax tapa el humero lejano, nunca el cercano. No modifica el orden del reposo ni de las expresiones. La caja toracica es estrecha arriba y se ensancha hacia el frente abajo; el brazo cercano puede cruzar su borde sin taparla por completo. Al reflejar el personaje completo cambia el sentido de marcha, no esta profundidad relativa.

En reposo y caminar, el tubo principal de brazos y piernas mide 4 px por fila: `khbk` o `kbsk`, con dos interiores y dos de contorno. Dibujar el escalonado por filas, no con sellos cuadrados que engorden las diagonales. Cada extremidad conserva dos segmentos y una articulacion central; la mano se une al antebrazo sin un segundo corte negro en la muneca. En perfil, los hombros del brazo cercano y lejano son [30, 27] y [32, 27] antes del rebote del torax. El codo cambia de posicion durante el balanceo; comprobar la direccion real del brazo lejano despues de aplicar su espejo.

Solo Miga y sus siete fuentes (cinco de personaje y dos de objetos) forman el catalogo activo. No hay capa, bolso ni variantes de personajes de los estudios previos.

## Movimiento

Ocho clips de comportamiento: `idle`, `walk`, `look`, `inspect`, `sleep`, `wake`, `surprise`, `happy`. Las poses pueden heredar de otra pose; los cambios de piezas, offsets y expresiones viven en la pose. Los tiempos y el loop viven en el clip.

`murmur` (boquita) y `wave` (saludo) son clips de expresion del visor, sin estados nuevos de IA ni audio. La caminata usa ocho fases de perfil, un ojo visible, apoyo en el suelo y brazos opuestos a las piernas. Dormir separa las piezas en un monton de huesos, sin girar el cuerpo completo. La entrada se reproduce una vez y luego solo se repite el descanso (`loopFrom`). Ver `CHARACTER.md`.

La IA elige el estado; el renderer traduce ese estado al clip y usa `stateElapsed`. Las animaciones no cambian necesidades, decisiones ni descubrimientos. `wake` y `surprise` no hacen loop: mantienen el ultimo frame al terminar.

## Objetos

El farol usa un lienzo de **16 x 24 px**, ancla **[8, 23]** y dos variantes para el parpadeo. La runa usa **24 x 32 px**, ancla **[12, 30]** y dos variantes de luz. Limite inicial por pieza: **64 x 64 px**.

Mantener un aspecto gastado pero sencillo. La luz del farol y las runas se dibuja con colores de la paleta, no con bloom o efectos que oculten los pixeles.

## Revision

La validacion automatica comprueba paleta, dimensiones, filas, referencias, variantes, herencia, duraciones, anclas y recortes. No puede juzgar si una silueta es bonita, si la luz esta bien colocada o si un movimiento tiene personalidad: eso se revisa en el visor y en la escena real.
