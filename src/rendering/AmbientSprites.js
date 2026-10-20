import { batSprite } from '../../assets/source/ambient/bat.js';
import { beeSprite,dragonflySprite } from '../../assets/source/ambient/pollinators.js';
import { drawPixels } from './Sprites.js';
export { batSprite };
export { beeSprite,dragonflySprite };
export const ambientSprites=Object.freeze({bat:batSprite,bee:beeSprite,dragonfly:dragonflySprite});

export function ambientFrameAt(sprite,seconds,perched=false) {
  if(perched)return sprite.restFrame??0;
  const time=Number.isFinite(seconds)?Math.max(0,seconds):0;
  return sprite.cycle[Math.floor(time*sprite.fps)%sprite.cycle.length];
}

export function drawAmbientSprite(ctx,sprite,x,y,frame,scale=1,direction=1) {
  const rows=sprite.frames[frame]??sprite.frames[0];
  const pixels=direction<0?rows.map(row=>[...row].reverse().join('')):rows;
  drawPixels(ctx,pixels,sprite.palette,Math.round(x-sprite.anchor[0]*scale),Math.round(y-sprite.anchor[1]*scale),scale);
}

export function batFrameAt(seconds) {
  const time=Number.isFinite(seconds)?Math.max(0,seconds):0;
  return batSprite.cycle[Math.floor(time*batSprite.fps)%batSprite.cycle.length];
}

export function drawBat(ctx,x,y,frame,scale=1) {
  drawPixels(ctx,batSprite.frames[frame]??batSprite.frames[0],batSprite.palette,
    Math.round(x-batSprite.anchor[0]*scale),Math.round(y-batSprite.anchor[1]*scale),scale);
}
