# Generacion De Identidad Del Entorno

Fecha: 2026-10-15. Herramienta: `image_gen.imagegen` integrado. Una llamada por asset, todas guiadas por la referencia de castillo, puente y cementerio aportada por el usuario, con `transparent_background: true`. No se descargan packs, no se usa un escenario completo como fondo y no se modifica Miga.

Los doce prompts exactos estan en [IDENTITY_PROMPTS.json](IDENTITY_PROMPTS.json). Los originales se guardan sin cambios en `source/`; el runtime solo consume sus PNG de `native/`. Cada original y export tiene hash SHA-256 en `manifest.json`.

| ID | Archivo relativo a source/ y native/ | Tamano nativo |
| --- | --- | --- |
| distantCitadel | architecture/citadel-bridge.png | 420 x 177 |
| watchtower | architecture/ruined-watchtower.png | 57 x 148 |
| bareOak | trees/bare-oak.png | 208 x 238 |
| silverAsh | trees/silver-ash.png | 199 x 238 |
| roseGrave | gravestones/rose-marble.png | 51 x 78 |
| graniteObelisk | gravestones/granite-obelisk.png | 37 x 98 |
| flowerLedger | gravestones/flower-ledger.png | 82 x 25 |
| urnMemorial | gravestones/terracotta-urn.png | 34 x 72 |
| westWildflowers | vegetation/west-wildflowers.png | 540 x 45 |
| eastFungi | vegetation/east-fungi.png | 540 x 48 |
| uniqueForestFar | backgrounds/unique-forest-far.png | 1600 x 220 |
| uniqueForestMiddle | backgrounds/unique-forest-middle.png | 900 x 213 |

## Tratamiento

Recorte al contenido con alpha >= 240, reduccion por vecino mas cercano y cobertura binaria 0/255. Los halos semitransparentes de los originales no se convierten en bandas de niebla. Se conservan proporciones del contenido; los dos fondos inicialmente normalizados a dimensiones fijas se corrigen tras inspeccion visual. Los originales y los 19 assets anteriores no se sobrescriben.

El tamano sugerido en los prompts es una guia, no el resultado exacto. Las dimensiones reales se eligen desde la silueta generada, se registran en la tabla y se usan para las anclas. El roble seco y el fresno tienen anclas en sus troncos, no en el centro de sus copas.

## Limites

No es dibujo manual pixel por pixel ni extraccion sin perdida. La ciudadela agrupa castillo, puente, roca y cascada como un hito arquitectonico coherente; no incluye el escenario cercano. Las dos franjas de vegetacion agrupan plantas distintas y huecos, no se presentan como un tileset de flores individuales. La cascada es estatica. Las pequenas particulas ambientales se dibujan por codigo sobre la cuadricula nativa, no forman parte de estos PNG.
