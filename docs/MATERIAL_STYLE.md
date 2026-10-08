# Materiales: primera familia patron

Revision de ruina, sendero y farol: 2026-10-07. Estos patrones se extienden despues al resto del entorno en la [biblioteca viva](LIVING_CEMETERY.md), tambien como propuesta en sandbox. La referencia del cementerio orienta volumen, desgaste y composicion, no se usa como textura ni se recortan sus sprites.

## Contrato comun

- Un pixel nativo tiene la misma escala para personaje, objetos y escenografia. No ampliar individualmente un dibujo pequeno para simular un objeto grande.
- Conservar lienzo, ancla, luz superior izquierda y apoyo antes de agregar detalle. Miga y sus animaciones aprobadas no se redibujan.
- El contorno pertenece al material. Reservar el tono mas oscuro para huecos, uniones y lados en sombra; no rodear todos los objetos con una linea negra uniforme.
- Modelar primero silueta y masas de luz. Agrupar textura en manchas cortas y grietas localizadas; evitar ruido repartido por toda la superficie.
- Usar pixeles enteros sin suavizado. Los escalones y cortes de las diagonales siguen el volumen, no una decoracion repetida.
- Mantener las rampas actuales: 16 colores para el kit interactivo, 32 para escenografia. La profundidad del renderer reduce el contraste del fondo; no pintar el mismo asset mas borroso.

## Piedra: ruina 112 x 80

- Cara frontal de tono medio, superficie superior clara y lateral mas oscuro. Los biseles son fragmentos, no una franja vertical continua de luz.
- Bloques con pequenas diferencias de ancho y esquinas melladas. Las juntas separan piezas reales; las grietas parten de un borde o de una tension del bloque.
- Musgo sobre cornisas, grietas y zocalos. Las enredaderas recorren esos apoyos y se mantienen conectadas a la piedra.
- Conservar el espacio transparente del arco y las dos secciones apoyadas en el suelo. No convertirlo en una pared rectangular ni agregar fragmentos flotantes.

Fuente: `assets/source/environment/ruins/broken-arch.json`. Ancla [56,79]. Exportaciones individuales en la familia `ruins/broken-arch/`, con las tres fases del dia.

## Sendero: tres tramos 64 x 32

- Losas de tamanos distintos con caras superiores, biseles y juntas cortas. La piedra clara no debe ocupar toda la superficie.
- Musgo siguiendo juntas; raices que nacen bajo ese musgo y penetran en la tierra. Fragmentos minerales agrupados en el corte del suelo.
- Conservar las dos columnas de union compartidas, el apoyo plano [32,31] y la ultima fila transparente. Cada combinacion de tramos debe unirse sin huecos.
- Son tres variantes horizontales, no un sistema de pendientes, esquinas o autotiling. Plantas, flores y hongos siguen siendo sprites aparte.

Fuentes: `assets/source/environment/terrain/ground-a.json`, `ground-b.json` y `ground-c.json`.

## Hierro y cristal: farol 24 x 40

- Asa abierta por dentro, tejadillo biselado, marco frio y base escalonada. El lateral del marco se distingue del frontal sin ensanchar artificialmente el objeto.
- Cristal ambar legible, con reflejo corto en el borde iluminado. Reservar el color mas claro para el centro de la llama y un pequeno reflejo, no todo el metal.
- El parpadeo cambia solamente la region interior [9,19,5,8]. Asa, marco, cristal exterior y base permanecen inmoviles.
- Conservar ancla [12,39], alto visible 38 px, radio de toque y secuencia 480/180 ms. Su ID persistente sigue siendo `can`; no se reinician descubrimientos.

La fuente sigue siendo `lantern` en `assets/source/parts.json`; la secuencia vive en `characters.json`. No se duplica el dibujo en la biblioteca de escenografia.

## Revision

Comparar antes/despues con la misma luz y zoom entero, luego revisar las tres piezas dentro del renderer y junto a Miga. Las pruebas verifican fuentes, exportaciones, apoyo, conectividad, uniones y limites del parpadeo; la calidad de las formas requiere inspeccion visual. Aplicar estos patrones al resto de la biblioteca solo despues de aprobar esta familia.
