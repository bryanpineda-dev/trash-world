# Bosque, Torre Y Verja

Revision de 2026-10-19. Herramienta: ImageGen integrada, no CLI. Los prompts completos se conservan en `ENVIRONMENT_POLISH_PROMPTS.json`.

- `source/backgrounds/unique-forest-middle.png`: edicion de la panoramica existente para reparar huecos artificiales en las copas; export de 900 x 229, sin deformacion de aspecto. No se cambia su parallax.
- `native/backgrounds/unique-forest-far.png`: regeneracion mecanica desde el original intacto y su rectangulo registrado. Sin ImageGen ni redibujo en este caso. El export anterior habia borrado 18065 pixeles opacos; se conserva exactamente el alpha de la fuente con umbral 128.
- `source/architecture/guardian-tower.png`: torre nueva guiada por `ruined-watchtower.png`. Tras consultar al usuario, la figura encapuchada se sustituye por un angel de piedra con alas. Export de 70 x 190. El id `distantCitadel` permanece por compatibilidad, pero ya no representa una ciudadela, puente o catarata.
- `native/architecture/fence.png`: recorte exacto de 84 x 62 del PNG nativo anterior (x=31, y=0). Solo hierro, sin estiramiento.
- `native/architecture/fence-pillar.png`: recorte exacto de 26 x 62 del mismo PNG anterior (x=0, y=0). Usa el mismo original de procedencia; se coloca cada 252 unidades.

Los exports generados usan vecino mas cercano y alpha binario. El recorte modular de la verja no redibuja ni altera sus colores. Rectangulos de fuente, dimensiones, anclas y SHA-256 constan en `manifest.json`.

La ciudadela y catarata antiguas se retiran del catalogo y de las carpetas activas despues de respaldarlas fuera del repositorio. No se modifica el personaje, la iglesia, el oratorio, el sarcofago, las reglas, las dependencias ni el HUD.
