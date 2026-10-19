# Architecture Candidates: Provenance

Date: 2026-10-19. Tool: built-in `image_gen`, transparent background, one edit per object. These are generated raster candidates, not hand-pixelled sprites. No CLI generator, new dependency or API key was used.

## Current Candidate: Revision 6

Revisions 2, 3, 4 and 5 below are rejected or superseded proposals, not approved production assets. Revision 2's pitched lid broke the world perspective. Revision 3's cross and right lid ridge were rejected. Revision 4 moved the small cross right; the user corrected that direction to left and rejected the clipped right corner. Revision 5 restored the corner and moved the cross left, but its transverse bar remained too screen-vertical.

Revision 6 uses built-in ImageGen to edit only that cross using an independent planar construction diagram, after visual inspection of internet references. It is exported at 120 x 49 with nearest-neighbor and binary alpha. The selected original is `exec-6f11a091-d8ac-492e-bd47-919b8e3bc40c.png`. Complete prompt, reference roles and provenance: [prompt-v6.json](prompt-v6.json). Earlier edit prompts: [prompts-v4-v5.json](prompts-v4-v5.json). The diagram is documentation, not a game asset. No reference asset was purchased, downloaded into the library or reused as a texture.

The church uses the same source and crop but a larger aspect-preserving native export, 173 x 256. The study has a 400px logical height so the top cross is not cropped. The rose-window mask now follows native dimensions rather than the obsolete 140 x 208 constants. This changes only the study; production camera, Miga and active assets remain unchanged. Both current church composition and tomb perspective still require user approval and full-world integration QA.

## Revision 2 (Rejected/Superseded History)

The user rejected the v1 tomb: the cross was a shallow bar with a tab at game size. A first new edit (`exec-06d70f7b-e395-480e-abbe-ff87d82b42f4.png`) was also rejected during inspection and is not copied into the project. The selected edit is `exec-043d4acb-8a35-4d42-86b5-0bc82c5ef14c.png`: a more visible pitched lid, prominent crossbar and asymmetric Latin cross, exported at 112 x 56 without stretching.

Two newly generated sheets are saved in `assets/source/cemetery/`. Five rear markers and four front markers are cropped into nine separate reusable PNGs in `assets/native/cemetery/`. Manifest records include the exact source rectangle and sheet hash for every marker. Native maximum heights are 40 and 56 respectively; the nine silhouettes are placed once, not duplicated or flipped. The church and oratory PNGs remain byte-identical.

Full prompts, including the discarded attempt, are in `prompts-v2.json`. The old `tomb-prompt.txt` below documents the rejected v1 only. The complete 366-file v1 baseline is backed up outside the project in the sandbox archive `architecture-v1-before-depth-2026-10-19`; the current tomb source and native paths deliberately replace that rejected candidate. Production assets remain unchanged.

## References And Prompts

The first two records below are faithful prompt summaries, not verbatim transcripts. The tomb prompt is preserved verbatim in `tomb-prompt.txt`.

### Church

- Target: `../../assets/reference-biome/source/architecture/chapel.png`.
- Edit: preserve the church identity, bell tower and full top cross; add closed double wooden entrance doors low on the facade and one circular stone rose window above. Near-front upright facade with shallow right-side wall, cool grey-green stone, warm upper-left light, selective ivy and material-colored edges. Low-resolution coherent clusters; no text, floor, characters or background.
- Requested design footprint: about 136 x 208; door arch 58-64 high and rose about 24 across. These are prompt goals, not guaranteed measurements of the generated image.
- Generated original: `exec-e28731bd-a8b5-48db-babc-352e18813422.png`.

### Open Oratory

- Target: `../../assets/reference-biome/source/architecture/mausoleum.png`.
- Material reference: the new church source in this folder.
- Edit: replace the door with an open recess, two stone piers, a pitched roof, recessed back wall, wooden crucifix with a small figure, a stone altar and three unlit ivory candles of different heights with visible black wicks. No door, grille, rose window, painted flame or glow. Same upper-left light and shallow right-side volume; ivy confined to one corner.
- Requested footprint: about 144-160 x 144. The result is narrower; the export preserves its aspect instead of stretching it to meet the prompt.
- Generated original: `exec-17629cdd-5650-45e1-8f96-4ead78602f84.png`.

### Relief-Cross Tomb: Rejected V1

- Target: `../../assets/reference-biome/source/gravestones/reclining-angel.png`.
- Material reference: the new church source in this folder.
- Edit: remove the entire angel; retain a low rectangular sarcophagus with a shallow cross carved in relief directly in the lid, its shaft along the horizontal length. Not a standing cross or separate statue. Mostly exposed stone, small right-side volume, upper-left bevel highlights, selective ivy at one lower corner.
- Generated original: `exec-5b178bf6-ff8f-49f3-80d5-eb2bd8a3115a.png`.

## Reusable Files

`assets/source/` retains five exact selected original PNGs (three objects and two sheets). `assets/native/` contains twelve aspect-preserving exports (three objects and nine graves). `manifest.json` records dimensions, crop rectangles, anchors and SHA-256 for every export and its original. All seventeen PNGs have a consumer or provenance role; they are not added to the production reference catalog.

Export only crops the alpha bounds, resizes with nearest-neighbor and thresholds alpha at 128. It does not quantize the environmental palette, invent details, retouch silhouettes or claim pixel-perfect manual cleanup. No asset is flipped or stretched to manufacture a variant.

The oratory source intentionally has no flames. Runtime flame marks and a tiny radial spill are separate, independently phased and confined to the altar. Church emission is masked to the amber pixels of the rose window, not painted over timber or stone. Existing day/night grades are reused.

## Status

Candidate study only. The production church, mausoleum and reclining angel remain used, so deleting them now would break the active scene. Replacement and retirement happen only after the new sample is approved and integrated, using the existing backup/hash workflow.
