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

export const cemeteryParallax=.66;
export const cemeteryFence=Object.freeze({x:213,parallax:cemeteryParallax,offset:-4,railWidth:84,gap:64});

export const soilLayers=Object.freeze([
  {id:'cemeterySoil',offset:4,parallax:cemeteryParallax,depth:'architecture'},
  {id:'earthFace',offset:20,parallax:1,depth:'near',repeatVertical:true},
]);

export const additionalGraves=Object.freeze([
  {id:'trefoilMemorial',x:-329,offset:-17,parallax:cemeteryParallax,depth:'architecture',row:'back'},
  {id:'weatheredWoodCross',x:473,offset:-19,parallax:cemeteryParallax,depth:'architecture',row:'back'},
  {id:'flowerTablet',x:695,offset:-16,parallax:cemeteryParallax,depth:'architecture',row:'back'},
  {id:'slateShoulder',x:-600,offset:-19,parallax:cemeteryParallax,depth:'architecture',row:'back'},
  {id:'lancetStone',x:-455,offset:-22,parallax:cemeteryParallax,depth:'architecture',row:'back'},
  {id:'roseMemorial',x:-230,offset:-17,parallax:cemeteryParallax,depth:'architecture',row:'back'},
]);

export const gardenDetails=Object.freeze([
  {id:'wildViolets',x:-100,offset:-17,parallax:cemeteryParallax,depth:'architecture',row:'cover'},
  {id:'honeyFungi',x:-280,offset:-16,parallax:cemeteryParallax,depth:'architecture',row:'cover'},
]);

export const pollinatorStations=Object.freeze([
  {id:'bee-west',kind:'bee',x:-380,offset:-24,parallax:1,seed:1},
  {id:'bee-violets',kind:'bee',x:-100+1/cemeteryParallax,offset:-34,parallax:cemeteryParallax,seed:4,perch:'wildViolets'},
  {id:'bee-clearing',kind:'bee',x:200,offset:-19,parallax:1,seed:7},
  {id:'bee-east',kind:'bee',x:673,offset:-22,parallax:1,seed:10},
  {id:'dragonfly-west',kind:'dragonfly',x:-210,offset:-35,parallax:1,seed:13},
  {id:'dragonfly-east',kind:'dragonfly',x:920,offset:-38,parallax:1,seed:16},
]);

export function soilTiles(camera,layer,asset) {
  const left=Math.round(camera.x*layer.parallax)-Math.round(camera.width/2),tiles=[];
  for(let y=camera.ground+layer.offset;y-asset.anchor[1]<camera.height;y+=asset.size[1]) {
    for(const segment of terrainSegments(left,camera.width,asset.size[0]))
      tiles.push({x:segment.x-left,y,flipped:segment.flipped});
    if(!layer.repeatVertical)break;
  }
  return tiles;
}

export function fenceModules(camera) {
  const point=referencePosition(camera,cemeteryFence);
  const railOffset=(cemeteryFence.railWidth+cemeteryFence.gap)/2;
  const endOffset=cemeteryFence.railWidth+cemeteryFence.gap/2;
  return [
    {id:'fence',x:point.x-railOffset,y:point.y},
    {id:'fence',x:point.x+railOffset,y:point.y},
    {id:'fencePillar',x:point.x-endOffset,y:point.y},
    {id:'fencePillar',x:point.x+endOffset,y:point.y},
  ];
}
export const cemeteryPlacements=Object.freeze([
  {id:'crosses-back-1',x:60,offset:-24,parallax:cemeteryParallax,depth:'architecture',row:'back'},
  {id:'crosses-back-2',x:108,offset:-24,parallax:cemeteryParallax,depth:'architecture',row:'back'},
  {id:'crosses-back-3',x:146,offset:-22,parallax:cemeteryParallax,depth:'architecture',row:'back'},
  {id:'crosses-back-4',x:263,offset:-23,parallax:cemeteryParallax,depth:'architecture',row:'back'},
  {id:'crosses-back-5',x:302,offset:-22,parallax:cemeteryParallax,depth:'architecture',row:'back'},
  {id:'crosses-front-1',x:84,offset:-9,parallax:cemeteryParallax,depth:'near',row:'front'},
  {id:'crosses-front-2',x:145,offset:-7,parallax:cemeteryParallax,depth:'near',row:'front'},
  {id:'crosses-front-3',x:290,offset:-10,parallax:cemeteryParallax,depth:'near',row:'front'},
  {id:'crosses-front-4',x:344,offset:-8,parallax:cemeteryParallax,depth:'near',row:'front'},
]);

export function referencePosition(camera, placement) {
  const parallax = placement.parallax ?? 1;
  // Snap a layer's translation once so its individual sprites cannot breathe apart.
  return { x: Math.round(camera.width/2)+Math.round(placement.x*parallax)-Math.round(camera.x*parallax),
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
