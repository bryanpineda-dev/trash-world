# Procedencia Y Regeneracion

Fecha: 2026-10-15. Herramienta: `image_gen.imagegen`, integrada en Codex. Una generacion independiente por asset, guiada por la referencia de cementerio del usuario. No se descargaron packs de terceros ni se uso un escenario aplanado.

`source/` guarda resultados originales sin modificar. `native/` contiene versiones recortadas a contenido alpha >= 240, ajustadas con vecino mas cercano y alpha 0/255. El manifiesto registra recortes, dimensiones y hashes. No equivale a una limpieza manual pixel por pixel; puede requerir retoques posteriores.

Los siguientes son briefs para regenerar la familia, no una transcripcion literal del historial de llamadas.

## Brief Comun

Pixel art de fantasia para un cementerio boscoso lateral. Usar la referencia del usuario para material y ambiente: verde azulado profundo, hojas oliva con luces amarillentas, corteza calida apagada, piedra gris azulada con caras y biseles legibles, musgo irregular. Bordes del tono oscuro del material, sin contorno negro universal. Siluetas organicas, grupos de pixeles deliberados, sin ruido uniforme ni poligonos superpuestos. Un recurso aislado con transparencia real; sin personaje, UI, texto, logotipos, runas brillantes ni faroles. Perspectiva y direccion de luz compatibles; formas legibles al tamano nativo.

## Briefs Por Asset

| ID | Instruccion especifica | Nativo |
| --- | --- | --- |
| oakLeft | Roble izquierdo: raices a la izquierda y tronco curvado hacia arriba/derecha; ramas que afinan desde su origen y desaparecen parcialmente bajo copas agrupadas; hiedra fina colgante. | 215 x 236 |
| oakRight | Segundo roble de encuadre derecho, curva arriba/izquierda. Silueta y raices distintas, no un espejo del primero. Mismos materiales. | 208 x 244 |
| gabledGrave | Lapida alta a dos aguas; biseles, cruz pequena tallada, inscripcion ilegible, desgaste y musgo lateral; base apoyada. | 50 x 78 |
| roundGrave | Lapida baja arqueada de hombros redondos, erosionada y con base asimetrica; silueta distinta. | 44 x 53 |
| ringCross | Cruz anular sin runa; huecos triangulares legibles dentro del aro, fuste largo y base rota con musgo. | 64 x 112 |
| chapel | Capilla gotica de fondo con tejado a dos aguas, torre y cruz completas, lancetas frontales con vela ambar. Arquitectura coherente, sin asimetrias accidentales. | 102 x 154 |
| ruin | Pilar de bloques grandes y dintel roto en T incompleta, grietas estructurales, biseles y enredadera que sigue la piedra. | 85 x 142 |
| forestMiddle | Panoramica intermedia de bosque mixto: cipreses y copas anchas, huecos y siluetas variadas, verdes frios ricos, base irregular transparente sin piso horizontal. | 720 x 190 |
| forestFar | Bosque lejano azul verdoso, claro y de alturas variadas; perspectiva atmosferica cromatica y base irregular transparente. | 800 x 204 |
| ground | Camino lateral de piedra y musgo, hierba fina arriba, tierra oscura estratificada y raices debajo; superficie de caminar estable. | 560 x 52 |
| fence | Tramo de verja de hierro con puntas y pilares de piedra biselada, musgo ligero, escala coherente. | 144 x 62 |
| undergrowth | Grupo bajo de helechos, musgo y flores blancas; sin bayas de interaccion; contornos por material. | 79 x 42 |
| mushrooms | Grupo pequeno de hongos rojos de motas claras, tallos y musgo; escala de sotobosque. | 28 x 20 |
| moon | Disco marfil amarillento con crateres agrupados, borde escalonado, sin halo, cielo ni estrellas incrustadas. | 36 x 36 |

No se genero ni modifico Miga. Rig y clips aprobados permanecen en `assets/source/` y el atlas original.

Correccion de exportacion, 2026-10-16: `ruin` pasa de 72 x 142 a 85 x 142 y `undergrowth` de 70 x 42 a 79 x 42, recuperando la proporcion del `sourceRect` con la misma altura. Reexportacion mecanica desde los originales inmutables con vecino mas cercano y alpha binario, sin nueva generacion ni retoque manual. Anclas actuales: [31,142] y [40,42]; se mantienen el apoyo vertical y el punto horizontal proporcional con error de redondeo menor a medio pixel. Manifiesto y hashes actualizados; comparativas en `docs/ASSET_FIXES.md`.

Limpieza, 2026-10-19: `forestFar` y `forestMiddle` de la tabla son fuentes historicas, sustituidas por `uniqueForestFar` y `uniqueForestMiddle`. Sus originales y SHA-256 se conservan en `manifest.retiredSources`; sus PNG nativos se retiran de la biblioteca. La tabla conserva el brief y las medidas de la generacion original, no promete que todos sus exports sigan activos. Ver `docs/ASSET_CLEANUP.md`.

La revision se reproduce con los PNG y hashes guardados, no prometiendo que repetir un prompt produzca la misma imagen. Los originales grandes no se cargan en el navegador: Vite incorpora solo PNG nativos usados por el runtime.
