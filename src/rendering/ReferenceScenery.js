import manifest from '../../assets/reference-biome/manifest.json';
import { drawReferenceScene, shadeReferencePixels, isChapelGlass } from './ReferenceScene.js';

const files=import.meta.glob('../../assets/reference-biome/native/**/*.png',{eager:true,query:'?url',import:'default'});
export const referenceManifest=manifest;
export const referenceURLs=Object.fromEntries(manifest.sprites.map(s=>[s.id,files['../../assets/reference-biome/'+s.file]]));

export class ReferenceScenery {
  constructor() {
    this.images=new Map();this.surfaces=new Map();this.errors=[];
    this.loading=Promise.all(manifest.sprites.map(item=>new Promise(resolve=>{
      const image=new Image();image.onload=()=>{this.images.set(item.id,image);resolve();};
      image.onerror=()=>{this.errors.push(item.id);console.error('Missing scenery asset: '+item.id);resolve();};
      image.src=referenceURLs[item.id];
    })));
  }
  get ready() {return this.images.size===manifest.sprites.length;}
  surface(id,phase='DAY',depth='near') {
    const key=id+':'+phase+':'+depth;if(this.surfaces.has(key))return this.surfaces.get(key);
    const item=manifest.sprites.find(s=>s.id===(id==='chapel-glass'?'chapel':id));
    const image=this.images.get(item?.id);if(!image)return null;
    const canvas=document.createElement('canvas');canvas.width=item.size[0];canvas.height=item.size[1];
    const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(image,0,0);
    const data=ctx.getImageData(0,0,...item.size);
    if(id==='chapel-glass') {
      for(let n=0;n<data.data.length;n+=4) {
        const [r,g,b]=data.data.slice(n,n+3),x=n/4%item.size[0],y=Math.floor(n/4/item.size[0]);
        if(data.data[n+3]&&isChapelGlass(x,y,...item.size,r,g,b))data.data.set([255,232,165,255],n);
        else data.data.fill(0,n,n+4);
      }
    } else data.data.set(shadeReferencePixels(data.data,id,...item.size,phase,depth));
    ctx.putImageData(data,0,0);const result={...item,surface:canvas};this.surfaces.set(key,result);return result;
  }
  draw(ctx,camera,phase,seconds) {drawReferenceScene(ctx,camera,phase,seconds,this.surface.bind(this));}
}
