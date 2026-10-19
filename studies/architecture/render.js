import manifest from './manifest.json';
import { ReferenceScenery } from '../../src/rendering/ReferenceScenery.js';
import { AssetLibrary, assetManifest } from '../../src/rendering/AssetLibrary.js';
import { drawReferenceScene } from '../../src/rendering/ReferenceScene.js';
import { sampleDaylight, rgb } from '../../src/rendering/Daylight.js';
import { groundContacts, drawContactShadow } from '../../src/rendering/GroundContact.js';
import { terrainSegments } from '../../src/rendering/ReferenceLayout.js';
import { placements, cemeteryPlacements, cemeteryFence, studyCamera, studyPosition, shadeStudyPixels, candleState, wicks, roseGlass } from './model.js';

const urls=import.meta.glob('./assets/native/**/*.png',{eager:true,query:'?url',import:'default'});
const candidates=[...manifest.sprites,...manifest.graveyard];
export class ArchitectureStudy {
  constructor() {
    this.scenery=new ReferenceScenery();this.miga=new AssetLibrary();this.images=new Map();this.surfaces=new Map();
    this.loading=this.load();
  }
  async load() {
    for(const item of candidates) {
      const image=new Image();image.src=urls['./'+item.file];
      await image.decode();this.images.set(item.id,image);
    }
    await this.scenery.loading;
    if(!this.scenery.ready)throw new Error('No se pudieron cargar los recursos del entorno.');
    if(!this.miga.ready)await this.miga.image.decode();
    this.miga.ready=true;
  }
  surface(id,phase) {
    const key=id+':'+phase;if(this.surfaces.has(key))return this.surfaces.get(key);
    const item=candidates.find(s=>s.id===id),image=this.images.get(id);
    if(!image)throw new Error('Missing study asset: '+id);
    const canvas=document.createElement('canvas');[canvas.width,canvas.height]=item.size;
    const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
    const pixels=ctx.getImageData(0,0,...item.size);pixels.data.set(shadeStudyPixels(pixels.data,item,phase));
    ctx.putImageData(pixels,0,0);const result={...item,surface:canvas};this.surfaces.set(key,result);return result;
  }
  drawAsset(ctx,id,x,y,lighting,seconds,original=false) {
    const entry=candidates.find(s=>s.id===id);
    const get=phase=>original?this.scenery.surface(entry.oldId,phase,entry.depth):this.surface(id,phase);
    const item=get(lighting.from),left=x-item.anchor[0],top=y-item.anchor[1];
    ctx.drawImage(item.surface,left,top);
    if(lighting.blend>0) {
      ctx.save();ctx.globalAlpha=lighting.blend;ctx.drawImage(get(lighting.to).surface,left,top);ctx.restore();
    }
    if(!original&&id==='oratory')this.drawCandles(ctx,left,top,lighting,seconds);
    if(!original&&id==='church'&&lighting.lamps>0)this.drawRose(ctx,left,top,lighting,seconds);
  }
  drawCandles(ctx,left,top,lighting,seconds) {
    for(const [index,wick]of wicks.entries()) {
      const {alpha,lean,spill}=candleState(seconds,index),x=left+wick.x,y=top+wick.y;
      ctx.save();ctx.globalAlpha=spill*lighting.lamps;
      const glow=ctx.createRadialGradient(x,y,1,x,y,7);glow.addColorStop(0,'#ffc978');glow.addColorStop(1,'#ffc97800');
      ctx.fillStyle=glow;ctx.fillRect(x-7,y-7,14,14);
      ctx.globalAlpha=alpha*(.72+.28*lighting.lamps);ctx.fillStyle='#e69c3f';ctx.fillRect(x-1,y-3,3,3);
      ctx.fillStyle='#ffe3a1';ctx.fillRect(x,y-3,1,3);ctx.fillRect(x+lean,y-4,1,1);
      ctx.fillStyle='#fff4d0';ctx.fillRect(x,y-2,1,1);ctx.restore();
    }
  }
  drawRose(ctx,left,top,lighting,seconds) {
    const image=this.images.get('church');
    let mask=this.surfaces.get('rose-mask');
    if(!mask) {
      const [width,height]=candidates.find(item=>item.id==='church').size;
      mask=document.createElement('canvas');mask.width=width;mask.height=height;
      const context=mask.getContext('2d');context.drawImage(image,0,0);
      const pixels=context.getImageData(0,0,width,height);
      for(let n=0;n<pixels.data.length;n+=4) {
        const [r,g,b]=pixels.data.subarray(n,n+3);
        if(!roseGlass(n/4%width,Math.floor(n/4/width),r,g,b,width,height))pixels.data.fill(0,n,n+4);
        else pixels.data.set([255,233,170,pixels.data[n+3]],n);
      }
      context.putImageData(pixels,0,0);this.surfaces.set('rose-mask',mask);
    }
    ctx.save();ctx.globalAlpha=lighting.lamps*(.055+Math.sin(seconds*.73)*.012+Math.sin(seconds*1.19+.6)*.008);
    ctx.drawImage(mask,left,top);ctx.restore();
  }
  drawMiga(ctx,x,y,seconds=0) {
    const frame=assetManifest.frames['miga:stand'];
    drawContactShadow(ctx,groundContacts(this.miga.pixelsFor('miga:stand'),frame.anchor),x,y);
    this.miga.drawCharacter(ctx,'miga','idle',seconds,x,y);
  }
  draw(ctx,{hour=12,seconds=0,original=false,view='scene',focus='all',pan=0,width=640,cemetery=true}={}) {
    const lighting=sampleDaylight(hour),camera=studyCamera(width,focus,pan);
    ctx.imageSmoothingEnabled=false;
    if(view==='pieces')return this.drawPieces(ctx,camera,lighting,seconds,original,focus);
    const background=new Set(['uniqueForestFar','uniqueForestMiddle','moon','undergrowth']);
    drawReferenceScene(ctx,camera,hour,seconds,(id,phase,depth)=>background.has(id)?this.scenery.surface(id,phase,depth):null);
    const church=placements[0],churchPoint=studyPosition(camera,church);
    this.drawAsset(ctx,'church',churchPoint.x,churchPoint.y,lighting,seconds,original);
    this.drawContext(ctx,camera,lighting);
    if(!original&&cemetery)for(const placement of cemeteryPlacements) {
      const point=studyPosition(camera,placement);
      this.drawAsset(ctx,placement.id,point.x,point.y,lighting,seconds);
    }
    for(const placement of placements.slice(1)) {
      const point=studyPosition(camera,placement);this.drawAsset(ctx,placement.id,point.x,point.y,lighting,seconds,original);
    }
    // This specimen is isolated from gameplay and never reads or writes a save.
    const focused=placements.find(p=>p.id===focus),subject=focused?studyPosition(camera,focused):null;
    const migaX=subject?subject.x+(focus==='tomb'?-90:88):width/2+(320-camera.pixelX);
    this.drawMiga(ctx,Math.round(migaX),camera.ground,seconds);
    return camera;
  }
  drawContext(ctx,camera,lighting) {
    const draw=(id,x,y,depth='near')=>{
      const a=this.scenery.surface(id,lighting.from,depth);ctx.drawImage(a.surface,x-a.anchor[0],y-a.anchor[1]);
      if(lighting.blend>0){ctx.save();ctx.globalAlpha=lighting.blend;const b=this.scenery.surface(id,lighting.to,depth);ctx.drawImage(b.surface,x-b.anchor[0],y-b.anchor[1]);ctx.restore();}
    };
    const shift=Math.round(camera.width/2-camera.pixelX*cemeteryFence.parallax);
    for(let x=Math.floor(-shift/144)*144+shift;x<camera.width+144;x+=144)
      draw('fence',x,camera.ground+cemeteryFence.offset,'architecture');
    const ground=this.scenery.surface('ground',lighting.from);
    ctx.fillStyle=rgb(lighting.floor.map(v=>v*.65));ctx.fillRect(0,camera.ground,camera.width,camera.height-camera.ground);
    for(const segment of terrainSegments(camera.left,camera.width,ground.size[0])) {
      const x=Math.round(segment.x-camera.left);
      if(segment.flipped){ctx.save();ctx.translate(x+ground.size[0],0);ctx.scale(-1,1);draw('ground',0,camera.ground);ctx.restore();}
      else draw('ground',x,camera.ground);
    }
  }
  drawPieces(ctx,camera,lighting,seconds,original,focus) {
    ctx.fillStyle=rgb(lighting.sky[1]);ctx.fillRect(0,0,camera.width,camera.height);
    ctx.fillStyle=rgb(lighting.floor);ctx.fillRect(0,camera.ground,camera.width,camera.height-camera.ground);
    const positions={church:150,oratory:384,tomb:556};
    const center=positions[focus]??320,offset=camera.width/2-center;
    for(const item of manifest.sprites.filter(item=>focus==='all'||item.id===focus))
      this.drawAsset(ctx,item.id,positions[item.id]+offset,camera.ground,lighting,seconds,original);
    const migaX=focus==='all'?266:positions[focus]+(focus==='tomb'?-92:88);
    this.drawMiga(ctx,Math.round(migaX+offset),camera.ground,seconds);
    return camera;
  }
}

export { manifest as architectureManifest };
