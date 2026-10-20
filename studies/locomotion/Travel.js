import {constrainPosition} from '../../src/physics/Collision.js';
import {WORLD_LEFT,WORLD_RIGHT,CREATURE_MARGIN} from '../../src/core/Config.js';

export function travelState(x=280,direction=1) {
  return {x:constrainPosition(x),direction:direction<0?-1:1,distance:0,elapsed:0};
}

export function stepTravel(state,dt,speed) {
  if(!Number.isFinite(dt)||dt<0||!Number.isFinite(speed)||speed<0)throw new Error('Invalid preview step');
  const x=constrainPosition(state.x+state.direction*dt*speed);
  let direction=state.direction;
  if(dt>0&&speed>0){if(x>=WORLD_RIGHT-CREATURE_MARGIN)direction=-1;else if(x<=WORLD_LEFT+CREATURE_MARGIN)direction=1;}
  return {x,direction,distance:state.distance+Math.abs(x-state.x),elapsed:state.elapsed+dt};
}
