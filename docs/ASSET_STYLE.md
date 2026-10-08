# Trash World: guia de estilo de assets V1

## Direccion

Fantasia medieval pequena y amable: una calaverita curiosa que vive por su cuenta, extremidades libres, objetos encontrados y magia discreta. La referencia de comportamiento son los cubitos fisicos autonomos. No estamos construyendo un RPG de combate o inventario.

El tablero de inspiracion es una referencia de ambiente, no un spritesheet listo para produccion. Los sprites del kit estan definidos pixel a pixel en `assets/source/` y exportados de forma determinista. El perfil de Miga sigue la referencia de anatomia entregada por el usuario.

## Reglas visuales

- Trabajar a resolucion nativa, sin suavizado, degradados, blur ni subpixeles.
- Miga conserva el contorno verde oscuro aprobado de 1 px. En el entorno, el borde pertenece al material: piedra gris verdosa, hierro frio y follaje verde profundo. No usar un delineado universal negro o casi negro. Luz desde arriba a la izquierda; sombras agrupadas, no ruido aleatorio.
- Cabeza grande y silueta legible. Expresiones con pocos pixeles, ojos oscuros y gestos tranquilos.
- Los cambios de color conservan contraste entre contorno, material, sombra y luz.
- Escalar por numeros enteros y con nearest-neighbor. No reinterpretar el tamano de un pixel entre assets.
- El suelo es el punto de apoyo del personaje y los objetos. Cambiar una pieza no debe mover ese punto.

La paleta siguiente se aplica a este kit de personajes y objetos. El bosque usa una biblioteca independiente de escenografia con 32 tokens de material, tres luces y contraste por profundidad. Sus rampas extra no se aplican a Miga ni a los objetos interactivos. Los arboles grandes se dibujan a escala nativa, no ampliando el roble pequeno. Ver [bioma](BIOME.md).

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

Solo Miga y sus nueve fuentes (cinco de personaje y cuatro de objetos) forman el catalogo activo. No hay capa, bolso ni variantes de personajes de los estudios previos.

## Movimiento

Ocho clips de comportamiento: `idle`, `walk`, `look`, `inspect`, `sleep`, `wake`, `surprise`, `happy`. Las poses pueden heredar de otra pose; los cambios de piezas, offsets y expresiones viven en la pose. Los tiempos y el loop viven en el clip.

`murmur` (boquita) y `wave` (saludo) son clips de expresion del visor, sin estados nuevos de IA ni audio. La caminata usa ocho fases de perfil, un ojo visible, apoyo en el suelo y brazos opuestos a las piernas. Dormir separa las piezas en un monton de huesos, sin girar el cuerpo completo. La entrada se reproduce una vez y luego solo se repite el descanso (`loopFrom`). Ver `CHARACTER.md`.

La IA elige el estado; el renderer traduce ese estado al clip y usa `stateElapsed`. Las animaciones no cambian necesidades, decisiones ni descubrimientos. `wake` y `surprise` no hacen loop: mantienen el ultimo frame al terminar.

## Objetos

El farol usa un lienzo de **24 x 40 px**, ancla **[12, 39]** y dos variantes para el parpadeo. La tumba runica usa **36 x 48 px**, ancla **[18, 47]** y dos variantes de luz. El arbusto usa **28 x 28 px**, ancla **[14, 27]**; el roble pequeno usa **64 x 64 px**, ancla **[32, 63]**. Su follaje tiene dos variantes, manteniendo inmoviles las raices. Limite por pieza: **64 x 64 px**.

Miga mide 56 px visibles en reposo. El farol mide 38, la tumba 46, el arbusto 26 y el roble 62. Todos se dibujan a escala 1 en el mundo y a escala 2 en las miniaturas del visor. La hoja `style-kit.png` compara los cinco sobre el mismo suelo a escala 3. Ver [contrato de medidas del entorno](ENVIRONMENT.md).

Mantener un aspecto gastado pero sencillo. La luz del farol y las runas se dibuja con colores de la paleta, no con bloom o efectos que oculten los pixeles.

Los cuatro objetos ya usan contornos por material. La correccion inicial conservo sus mascaras de transparencia, geometria, anclas, zonas de toque y variantes animadas. La revision de materiales de 2026-10-07 redibuja solo el farol dentro de su lienzo y medidas anteriores; sus tiempos y apoyo no cambian. El token `k` permanece disponible para el personaje, no se usa en objetos ni escenografia. La biblioteca del bioma suma veinte dibujos originales con escala nativa comun. Ver [patrones de material](MATERIAL_STYLE.md).

## Revision

La validacion automatica comprueba paleta, dimensiones, filas, referencias, variantes, herencia, duraciones, anclas y recortes. No puede juzgar si una silueta es bonita, si la luz esta bien colocada o si un movimiento tiene personalidad: eso se revisa en el visor y en la escena real.
