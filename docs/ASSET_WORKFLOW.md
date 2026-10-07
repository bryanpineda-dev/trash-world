# Flujo de assets reutilizables

## Archivos

- `assets/source/style.json`: paleta y limites del kit.
- `assets/source/parts.json`: piezas originales y parches de sus variantes.
- `assets/source/characters.json`: rig, piezas elegidas, remapeos y objetos.
- `assets/source/animations.json`: poses, clips compartidos y relacion con estados de la IA.
- `assets/generated/atlas.png`: spritesheet RGBA transparente.
- `assets/generated/atlas.json`: rectangulos, anclas, limites visibles, clips y tiempos en milisegundos.
- `assets/generated/style-kit.png`: hoja comparativa de poses y paleta.

Los JSON de source son editables y autoritativos. Los archivos generated y los iconos se regeneran; no editarlos directamente. PNG + metadata se pueden consumir desde otros motores, sin depender del renderer de este proyecto.

## Preparar y revisar

```sh
npm run assets
npm run assets:check
npm test
npm run dev
```

Abrir `/asset-lab.html` en la URL que muestre Vite. Revisar todos los clips, ambos sentidos, su punto de apoyo y el personaje a escala pequena. Revisar luego la escena principal. `npm run dev` y `npm run build` regeneran y validan el kit antes de arrancar.

`npm test` tambien compara cada pixel y clip del atlas con los originales. Si falla por un atlas desactualizado, regenerarlo con `npm run assets`. Los tests no regeneran archivos silenciosamente.

## Crear una variante de personaje

1. Agregar una entrada en `characters.json`, dentro de `characters`.
2. Reutilizar los slots del rig. Para recolorear, remapear tokens existentes, sin duplicar piezas.
3. Para cambiar una pieza, duplicar o crear su entrada en `parts.json` con las variantes compatibles. No duplicar las animaciones.
4. Regenerar, probar y revisar todos los clips. El visor lista automaticamente los nuevos personajes.

Ejemplo de recolor que hereda los ocho clips:

```json
"guardian": {
  "label": "Guardian",
  "parts": { "head": "skull", "body": "ribs", "pelvis": "pelvis", "leftArm": "arm", "rightArm": "arm", "leftLeg": "leg", "rightLeg": "leg" },
  "remap": { "b": "l", "s": "r" }
}
```

Usar identificadores en minusculas con guiones, sin espacios ni `:`. No cambiar `skeleton-v2` para acomodar una sola pieza: afectaria a todos sus personajes.

Para una anatomia diferente, agregar un rig en `characters.rigs`, seleccionar su ID con `character.rig` y definir sus poses en `animations.rigs[rigId].poses`. Sin `character.rig` se sigue usando el rig original. Los clips comunes conservan sus tiempos; `animations.rigs[rigId].clips` agrega o sustituye clips de esa anatomia. Cada slot puede incluir `mirror: true` para reflejar horizontalmente una pieza sin duplicar su fuente. Ver `skeleton-v2` y [el contrato de Miga](CHARACTER.md).

## Crear una pieza

Cada fila de `pixels` contiene exactamente el ancho declarado. El numero de filas coincide con el alto. El contorno y los materiales usan los tokens de la paleta; `.` deja transparencia.

Una variante es una lista de parches. Cada parche tiene `at: [x, y]` y filas `pixels`. Se aplica sobre la pieza base: un `.` en un parche **borra** el pixel original. Al componer las piezas del personaje, en cambio, la transparencia no borra las piezas de abajo.

Una variante sin parches se escribe `"rest": []`. No se permiten recortes de pixeles opacos fuera del lienzo del rig, aunque una pieza tenga margen transparente.

## Crear un objeto

1. Dibujar la pieza y sus variantes en `parts.json`.
2. Agregar el objeto en `characters.json`, dentro de `objects`: `part`, `anchor`, `loop`, `label` y `frames` como parejas `[variante, milisegundos]`.
3. El visor lo muestra automaticamente. Para colocarlo en el mundo, agregar o actualizar su entrada en `src/world/World.js` y su ruta de dibujo en `Renderer.js`.
4. Mantener estable el ID de descubrimiento si solo cambia el dibujo de un objeto que ya existe en guardados.

## Ampliar una animacion

Crear o modificar poses en `animations.json`; reutilizar `extends` para cambios pequenos. Variantes, offsets, espejos, `rotations` y `remaps` por slot se combinan con los del padre. El offset global se reemplaza, no se suma al padre. Las rotaciones por pieza son 0/90/180/270 grados, sin suavizado; se aplican despues del espejo y antes de colocar la pieza. Los remapeos por pieza se aplican antes del colorway del personaje. `rotation` gira la pose completa solo en rigs cuadrados; `grounded: true` centra el resultado y lo apoya sobre el ancla. Una vista nueva requiere variantes dibujadas. Un clip es una secuencia `[pose, duracion]`, con duraciones enteras entre 40 y 10000 ms. `loopFrom`, opcional en clips repetidos, indica el indice del primer frame del bucle: los anteriores se reproducen una sola vez. El visor y el mundo comparten este comportamiento.

Los cambios de tiempos afectan a todos los personajes del rig. Revisar caminar, dormir, despertar y reaccionar dentro del juego, no solo el frame aislado. La IA sigue siendo responsable de la duracion de sus estados.

`drawOrder`, opcional por pose, reemplaza la lista completa de slots en orden de fondo a frente y se hereda sin combinarse. Debe contener todos los slots exactamente una vez. El perfil de Miga coloca solo el brazo lejano (`leftArm`) antes de las costillas; el cercano (`rightArm`) se dibuja despues. No poner ambos brazos bajo el torax. Sin esta propiedad se conserva el orden del rig. El atlas incorpora esta composicion y el fallback usa el mismo orden.

## Exportacion y limites

El atlas guarda cada pose una sola vez por personaje, aunque varios clips la compartan. El renderer usa recortes del atlas con smoothing desactivado; mientras carga, dibuja los mismos pixeles de source como fallback.

La herramienta actual es un **visor**, no un editor de pixeles. No hay importador de Aseprite ni un generador automatico de personajes. Se puede usar un editor externo como referencia, pero adaptar sus dibujos al formato fuente y validar el kit antes de integrarlos.
