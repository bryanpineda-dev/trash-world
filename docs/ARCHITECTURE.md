# Arquitectura

La simulacion usa coordenadas del mundo independientes del canvas. El eje X recorre 1680 unidades, de -560 a 1120, y Y=0 representa el suelo. El claro original permanece entre 0 y 560. La camara mantiene un ancho nativo habitual de 560, transforma esos puntos a pixeles y los toques hacen el recorrido inverso.

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
- `rendering/ReferenceScenery`: carga los 29 PNG activos y guarda superficies por grado/profundidad. Los dos fondos sustituidos ya no tienen export ni entrada activa; solo se conservan sus originales y registros de procedencia. No carga el atlas ambiental anterior.
- `rendering/Daylight`: cinco grados de color interpolados desde la hora de WorldTime, cielo, estrellas y pesos continuos de luz/vida. No cambia las fases de la simulacion ni crea una superficie de cache por hora.
- `rendering/AmbientLife`: muestras deterministas de luciernagas, mariposas y hojas, proyectadas desde el mundo y gobernadas por el tiempo ambiental. No cambia la simulacion ni tiene temporizadores independientes.
- `rendering/ReferenceLayout`: tres zonas, colocaciones laterales, proyeccion de planos desde una camara y tramos de suelo alternos. `fitReferencePlacement` ajusta conjuntamente escala y offset de edificios, monumentos y cipreses marcados para conservar margen superior en vistas bajas. Las capas no tienen seguimiento independiente; la proyeccion horizontal no cambia.
- `rendering/ReferenceScene`: composicion, planos de parallax, graduacion cromatica y mascara de luz de la capilla. El personaje se dibuja despues, sin tintes ambientales.
- `assets/reference-biome`: originales raster, PNG nativos y manifiesto con anclas y hashes. Los JSON ambientales anteriores y los modulos de interacciones retiradas son archivo historico, no el mundo activo.
- `assets/source`: paleta, rig, piezas, poses y tiempos originales. `scripts/generate-assets` exporta el PNG y la metadata.
- `asset-lab`: visor independiente que usa exactamente el mismo renderer de assets que la escena.
- `persistence`: esquema v1, migracion desde v0, respaldo de datos danados y calculo offline acotado.
- `ui/DebugPanel`: diagnostico y controles de pruebas fuera de la interfaz habitual.
- `ui/WorldHUD`: presentacion de estados, reservas y reloj orbital. Lee la simulacion sin modificarla; la rotacion sigue WorldTime y los medidores se refrescan de forma acotada.
- `rendering/GroundContact`: sombras nativas desde los tramos de la pose que llegan al suelo. No modifica los pixeles ni las anclas del personaje.

El build genera el atlas y los iconos PNG a partir de las piezas originales y un service worker con los nombres reales de los archivos del build. El juego y el visor tienen entradas HTML propias; su cache de navegacion usa claves separadas. Los recursos y el estado viven en el dispositivo. La unica dependencia de interfaz es Lucide, cuyos iconos se incluyen en el bundle. Vite solo participa en el desarrollo y la compilacion.

La IA depende de un generador aleatorio inyectable para reproducir decisiones en tests. La simulacion, el esquema, el reloj, las necesidades y los limites se prueban con el runner nativo de Node, sin navegador ni libreria de tests.

En vistas normales se conserva el suelo y el zoom anteriores. En panoramas bajos, Camera prioriza altura sobre el suelo conservando al menos 12 pixeles nativos por debajo. El ancho nativo sigue limitado a 2048. Los sujetos con `fitHeadroom` reservan ocho pixeles arriba; los cuatro arboles de borde y panoramicas pueden quedar recortados como encuadre deliberado. El cristal usa el mismo rectangulo ajustado que la capilla, evitando desalineacion de luz. Ver `docs/ASSET_FIXES.md`.

El escenario actual no tiene objetos interactivos: el farol, la runa y la planta se retiraron por peticion del usuario. `SaveSchema` conserva sus descubrimientos historicos y cancela objetivos pendientes hacia esos IDs. La IA pasea cuando no encuentra candidatos; no se introduce una fuente invisible de comida. Ver `docs/REFERENCE_BIOME.md`.
