import { batSprite } from '../../assets/source/ambient/bat.js';
import { drawPixels } from './Sprites.js';
export { batSprite };

export function batFrameAt(seconds) {
  const time=Number.isFinite(seconds)?Math.max(0,seconds):0;
  return batSprite.cycle[Math.floor(time*batSprite.fps)%batSprite.cycle.length];
}

export function drawBat(ctx,x,y,frame,scale=1) {
  drawPixels(ctx,batSprite.frames[frame]??batSprite.frames[0],batSprite.palette,
    Math.round(x-batSprite.anchor[0]*scale),Math.round(y-batSprite.anchor[1]*scale),scale);
}
