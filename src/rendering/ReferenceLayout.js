import { WORLD_LEFT, WORLD_RIGHT } from '../core/Config.js';

export const cemeteryZones = Object.freeze([
  { id: 'west', label: 'Jardin de los angeles', center: -280, bounds: [WORLD_LEFT, 0] },
  { id: 'clearing', label: 'Claro de Miga', center: 280, bounds: [0, 560] },
  { id: 'east', label: 'Patio del oratorio', center: 840, bounds: [560, WORLD_RIGHT] },
]);

export const lateralPlacements = [
  { id: 'distantCitadel', x: -390, offset: -71, depth: 'landmark', parallax: .22, fitHeadroom: true },
  { id: 'watchtower', x: 1010, offset: -71, depth: 'landmark', parallax: .22, fitHeadroom: true },
  { id: 'cypressGrove', x: 705, offset: -24, depth: 'grove', scale: .9, parallax: .68, fitHeadroom: true },
  { id: 'mausoleum', x: 810, offset: -12, depth: 'near', parallax: .86, fitHeadroom: true },
  { id: 'bareOak', x: -545, offset: 0, depth: 'near' },
  { id: 'prayingAngel', x: -420, offset: 0, depth: 'near', fitHeadroom: true },
  { id: 'roseGrave', x: -330, offset: 0, depth: 'near', fitHeadroom: true },
  { id: 'graniteObelisk', x: -175, offset: 0, depth: 'near', fitHeadroom: true },
  { id: 'brokenCross', x: -65, offset: 0, depth: 'near', fitHeadroom: true },
  { id: 'flowerLedger', x: 632, offset: 0, depth: 'near', fitHeadroom: true },
  { id: 'recliningAngel', x: 923, offset: 0, depth: 'near', fitHeadroom: true },
  { id: 'urnMemorial', x: 1035, offset: 0, depth: 'near', fitHeadroom: true },
  { id: 'silverAsh', x: 1105, offset: 0, depth: 'near' },
  { id: 'westWildflowers', x: -280, offset: 1, depth: 'groundcover', scale: .8 },
  { id: 'eastFungi', x: 840, offset: 1, depth: 'groundcover', scale: .8 },
];

export const panoramaPlacements = [
  { id: 'uniqueForestFar', x: 280, offset: -23, depth: 'far', parallax: .12 },
  { id: 'uniqueForestMiddle', x: 280, offset: -17, depth: 'middle', parallax: .34 },
];

export const cemeteryFence=Object.freeze({parallax:.58,offset:-30,railWidth:84,pillarSpacing:252});

export function fenceModules(camera) {
  const shift=Math.round(camera.width/2-camera.pixelX*cemeteryFence.parallax);
  const modules=[];
  for(const [id,spacing,margin] of [['fence',cemeteryFence.railWidth,42],['fencePillar',cemeteryFence.pillarSpacing,13]]) {
    for(let i=Math.floor((-shift-margin)/spacing);i*spacing+shift<camera.width+margin;i++)
      modules.push({id,x:i*spacing+shift,y:camera.ground+cemeteryFence.offset});
  }
  return modules;
}
export const cemeteryPlacements=Object.freeze([
  {id:'crosses-back-1',x:60,offset:-24,parallax:.66,depth:'architecture',row:'back'},
  {id:'crosses-back-2',x:108,offset:-24,parallax:.66,depth:'architecture',row:'back'},
  {id:'crosses-back-3',x:146,offset:-22,parallax:.66,depth:'architecture',row:'back'},
  {id:'crosses-back-4',x:263,offset:-23,parallax:.66,depth:'architecture',row:'back'},
  {id:'crosses-back-5',x:302,offset:-22,parallax:.66,depth:'architecture',row:'back'},
  {id:'crosses-front-1',x:126,offset:-9,parallax:.84,depth:'near',row:'front'},
  {id:'crosses-front-2',x:174,offset:-7,parallax:.84,depth:'near',row:'front'},
  {id:'crosses-front-3',x:288,offset:-10,parallax:.84,depth:'near',row:'front'},
  {id:'crosses-front-4',x:330,offset:-8,parallax:.84,depth:'near',row:'front'},
]);

export function referencePosition(camera, placement) {
  const parallax = placement.parallax ?? 1;
  return { x: Math.round(camera.width / 2 + (placement.x - camera.pixelX) * parallax),
    y: Math.round(camera.ground + placement.offset) };
}

export function fitReferencePlacement(camera, placement, asset) {
  const scale = placement.scale ?? 1;
  const rise = asset.anchor[1] * scale - placement.offset;
  const fit = placement.fitHeadroom && rise > 0 ? Math.min(1, Math.max(1, camera.ground - 8) / rise) : 1;
  const point = referencePosition(camera, { ...placement, offset: placement.offset * fit });
  return { ...point, scale: scale * fit };
}

export function terrainSegments(left, width, span = 560) {
  const segments = [];
  // Alternating the intact strip makes the facing edge pixels identical at every join.
  for (let index = Math.floor(left / span); index * span < left + width; index++) {
    segments.push({ x: index * span, flipped: Math.abs(index % 2) === 1 });
  }
  return segments;
}
