import {sampleJointRig,phaseAtDistance,validateJointRig} from './JointRig.js';
import {jointSkinPixels,validateJointSkin} from './JointSkin.js';
import {pixelBounds,frameBounds} from '../rendering/AssetModel.js';
import {groundContacts,drawContactShadow} from '../rendering/GroundContact.js';
import {drawPixels} from '../rendering/Sprites.js';

export class JointActor {
  constructor(profile,frameCount=64) {
    validateJointRig(profile.rig,profile.motion);validateJointSkin(profile.rig,profile.skin,profile.parts);
    if(!Number.isInteger(frameCount)||frameCount<8||frameCount>256)throw new Error('Invalid native frame count');
    this.profile=profile;this.frameCount=frameCount;this.frames=new Map();this.palette=profile.palette;
  }

  frame(distance) {
    const {rig,motion,skin,parts}=this.profile;
    const index=Math.floor(phaseAtDistance(distance,motion.stride)*this.frameCount);
    if(!this.frames.has(index)){
      const pose=sampleJointRig(rig,motion,index/this.frameCount),pixels=jointSkinPixels(rig,skin,parts,pose);
      this.frames.set(index,{pose,pixels,anchor:rig.anchor,bounds:pixelBounds(pixels),contacts:groundContacts(pixels,rig.anchor)});
    }
    return this.frames.get(index);
  }

  bounds(distance,direction=1) {return frameBounds(this.frame(distance),direction);}

  draw(ctx,distance,x,y,direction=1,debug=false) {
    const frame=this.frame(distance),[ax,ay]=frame.anchor;
    drawContactShadow(ctx,frame.contacts,x,y,direction);
    ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(direction<0?-1:1,1);
    drawPixels(ctx,frame.pixels,this.palette,-ax,-ay);
    if(debug)for(const [id,p]of Object.entries(frame.pose.joints)){
      ctx.fillStyle=id.startsWith('far')?'#6ee7cb':'#f3aa64';ctx.fillRect(Math.round(p.x-ax),Math.round(p.y-ay),2,2);
    }
    ctx.restore();
  }
}
