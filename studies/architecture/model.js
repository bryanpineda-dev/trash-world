import { sampleDaylight } from '../../src/rendering/Daylight.js';
import { shadeReferencePixels } from '../../src/rendering/ReferenceScene.js';
import { roseGlass, candleState, altarWicks } from '../../src/rendering/ArchitectureLighting.js';
export { roseGlass, candleState };

export const placements=Object.freeze([
  {id:'church',x:170,offset:-38,parallax:.48},
  {id:'tomb',x:78,offset:0,parallax:1},
  {id:'oratory',x:470,offset:0,parallax:1},
]);
export const cemeteryPlacements=Object.freeze([
  {id:'crosses-back-1',x:110,offset:-28,parallax:.66},
  {id:'crosses-back-2',x:150,offset:-30,parallax:.66},
  {id:'crosses-back-3',x:190,offset:-26,parallax:.66},
  {id:'crosses-back-4',x:263,offset:-29,parallax:.66},
  {id:'crosses-back-5',x:302,offset:-26,parallax:.66},
  {id:'crosses-front-1',x:151,offset:-9,parallax:.84},
  {id:'crosses-front-2',x:197,offset:-7,parallax:.84},
  {id:'crosses-front-3',x:288,offset:-10,parallax:.84},
  {id:'crosses-front-4',x:330,offset:-8,parallax:.84},
]);
export const cemeteryFence=Object.freeze({parallax:.58,offset:-28});
export const focusPoints=Object.freeze({all:320,church:170,oratory:470,tomb:78});

export function studyCamera(width=640,focus='all',pan=0) {
  const pixelX=focusPoints[focus]??focusPoints.all;
  return {width,height:400,ground:316,pixelX:pixelX+pan,left:pixelX+pan-width/2};
}

export function studyPosition(camera,placement) {
  return {x:Math.round(camera.width/2+(placement.x-camera.pixelX)*placement.parallax),y:camera.ground+placement.offset};
}

export function shadeStudyPixels(pixels,item,phase) {
  const output=shadeReferencePixels(pixels,item.id,...item.size,phase,item.depth);
  if(item.id!=='church')return output;
  const emission=sampleDaylight(phase).lamps;
  for(let n=0;n<output.length;n+=4) {
    const [r,g,b]=pixels.subarray(n,n+3),x=n/4%item.size[0],y=Math.floor(n/4/item.size[0]);
    if(pixels[n+3]&&roseGlass(x,y,r,g,b,...item.size)) {
      const light=(r+g+b)/3,cold=[28+light*.17,43+light*.24,49+light*.27];
      for(let c=0;c<3;c++)output[n+c]=Math.round(cold[c]*(1-emission)+pixels[n+c]*emission);
    }
  }
  return output;
}

export const wicks=Object.freeze(altarWicks.map(([x,y])=>({x,y})));
