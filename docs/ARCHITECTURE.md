# Arquitectura

La simulacion usa coordenadas del mundo independientes del canvas. El eje X recorre 560 unidades y Y=0 representa el suelo. La camara transforma esos puntos a pixeles y los toques hacen el recorrido inverso.

- `core/Game`: conecta simulacion, entrada, renderer y almacenamiento; pausa al ocultar la pagina.
- `core/GameLoop`: paso fijo de 30 Hz con dibujo por requestAnimationFrame; limita la recuperacion tras un bloqueo.
- `core/Time`: dia de 24 minutos y limites de tiempo offline.
- `creature/Creature`: datos y transiciones de estados.
- `creature/CreatureAI`: decisiones segun necesidades, personalidad, objetos y momento del dia.
- `creature/Needs`: cambios normalizados; hunger representa saciedad, donde 100 significa alimentada.
- `world/World`: objetos, reloj y descubrimientos; memoria de los ultimos 20 eventos.
- `physics/Collision`: limites y movimiento hacia objetivos.
- `sensors/TouchInput`: pointer events, distincion entre toque, toque sostenido y arrastre.
- `sensors/SensorManager`: contrato neutral para los sensores de V0.2.
- `rendering`: camara, sprites por pixeles y escena; no decide el comportamiento.
- `rendering/AssetModel`: valida piezas y compone poses para compartirlas entre personajes; funcion pura usada por el generador y los tests.
- `rendering/AssetLibrary`: reproduce clips del atlas con anclas comunes y fallback desde las fuentes.
- `assets/source`: paleta, rig, piezas, poses y tiempos originales. `scripts/generate-assets` exporta el PNG y la metadata.
- `asset-lab`: visor independiente que usa exactamente el mismo renderer de assets que la escena.
- `persistence`: esquema v1, migracion desde v0, respaldo de datos danados y calculo offline acotado.
- `ui/DebugPanel`: diagnostico y controles de pruebas fuera de la interfaz habitual.

El build genera el atlas y los iconos PNG a partir de las piezas originales y un service worker con los nombres reales de los archivos del build. El juego y el visor tienen entradas HTML propias; su cache de navegacion usa claves separadas. Los recursos y el estado viven en el dispositivo. La unica dependencia de interfaz es Lucide, cuyos iconos se incluyen en el bundle. Vite solo participa en el desarrollo y la compilacion.

La IA depende de un generador aleatorio inyectable para reproducir decisiones en tests. La simulacion, el esquema, el reloj, las necesidades y los limites se prueban con el runner nativo de Node, sin navegador ni libreria de tests.
