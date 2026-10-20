import {Renderer} from '../../src/rendering/Renderer.js';
import {JointActor} from '../../src/animation/JointActor.js';
import {travelState,stepTravel} from './Travel.js';

export class CandidateRenderer extends Renderer {
  constructor(canvas,x,profile){super(canvas,x);this.actor=new JointActor(profile);this.distance=0;this.debugJoints=false;}
  creatureBounds(c){return this.actor.bounds(this.distance,c.direction);}
  drawCreature(c){const p=this.camera.toScreen(c.x);this.actor.draw(this.ctx,this.distance,p.x,p.y,c.direction,this.debugJoints);}
}

export class WorldPreview {
  constructor(beforeCanvas,afterCanvas,profile) {
    this.before=new Renderer(beforeCanvas,280);this.after=new CandidateRenderer(afterCanvas,280,profile);
    this.after.scenery=this.before.scenery;this.after.assets=this.before.assets;
    this.reset();
  }
  reset(direction=1){this.travel=travelState(280,direction);for(const r of [this.before,this.after]){r.camera.x=280;r.animationTime=0;}this.after.distance=0;}
  step(dt,speed){this.travel=stepTravel(this.travel,dt,speed);}
  draw(dt,hour,debug=false,palette=this.after.actor.profile.palette) {
    const {x,direction,elapsed,distance}=this.travel;
    const game={creature:{x,direction,state:'WALK',stateElapsed:elapsed},world:{clock:{hour}},settings:{ambientMotion:true}};
    this.after.distance=distance;this.after.debugJoints=debug;this.after.actor.palette=palette;
    this.before.render(game,dt);this.after.render(game,dt);
  }
  destroy(){this.before.destroy();this.after.destroy();}
}
