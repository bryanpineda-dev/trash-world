import { palettes } from './drawings.js';
import { composePose, paletteOf } from '../../src/rendering/AssetModel.js';
import { drawPixels } from '../../src/rendering/Sprites.js';

export const sceneSize = [560,248];
const props={
  DAY:{sky:'#8ca9a0',haze:'#9ebbb0',earth:'#193c36',path:'#899b78',floor:'#385f49',moon:'#e7e5bc'},
  NIGHT:{sky:'#2b4c58',haze:'#6f9690',earth:'#102b2d',path:'#718468',floor:'#244e3f',moon:'#e8d899'},
};
export function sprite(ctx,item,palette,x,ground,scale=1) {
  drawPixels(ctx,item.pixels,palette,Math.round(x-item.anchor[0]*scale),Math.round(ground-item.anchor[1]*scale),scale);
}
export function materialPalette(phase,plane='near') {
  const p=palettes[phase];
  const map={k:p.o,b:p.t,h:p.u,s:p.q,t:p.C,c:p.e,e:p.h,g:p.d,m:p.f,a:p.q,r:p.r,l:p.s,w:p.k,o:p.l,f:p.A,p:p.D,
    d:p.a,i:p.b,j:p.c,n:p.g,q:p.h,u:p.i,v:p.j,x:p.m,y:p.n,z:p.o,A:p.p,B:p.q,C:p.s,D:p.A,E:p.C,F:p.q};
  if(plane==='far')Object.assign(map,phase==='DAY'
    ? {d:'#6d9584',i:'#719b87',g:'#7ba58a',j:'#88ae91',m:'#9cbb9d',n:'#aac6a4',q:'#bcd1ad',u:'#658d82',v:'#709488',w:'#7f9c87',o:'#8ea58d',x:'#a3b59b',y:'#bbc7a7'}
    : {d:'#426f6a',i:'#49766f',g:'#548477',j:'#649282',m:'#7aab92',n:'#8db69b',q:'#a7c4a6',u:'#396560',v:'#47736a',w:'#5a8070',o:'#71947e',x:'#8daa8c',y:'#a7b99a'});
  if(plane==='middle')Object.assign(map,phase==='DAY'
    ? {d:'#2b5149',i:'#3d6854',g:'#507d5d',j:'#668d64',m:'#7e9e70',n:'#9db783',q:'#bdc892',u:'#344b43',v:'#4a5c48',w:'#64714f',o:'#7c855c',x:'#9c9c6e',y:'#b9b68a'}
    : {d:'#1d423f',i:'#2c5948',g:'#3f7153',j:'#5a865d',m:'#739869',n:'#96ad7a',q:'#b7c18d',u:'#2b4340',v:'#445447',w:'#5b654a',o:'#79825b',x:'#97996b',y:'#b5b286'});
  if(plane==='architecture')Object.assign(map,phase==='DAY'
    ? {z:'#446269',A:'#627d7e',B:'#81988d',C:'#a8b49a',a:'#647d79',r:'#83998e',l:'#a8b49a',D:'#4e716e',f:'#5a7d76'}
    : {z:'#2e515c',A:'#496e76',B:'#648a87',C:'#8fa79a',a:'#496e76',r:'#648a87',l:'#8fa79a',D:p.A,f:p.B});
  return map;
}

function polygon(ctx,points,color) {
  // Integer row spans keep silhouette edges on the same grid as the sprites.
  ctx.fillStyle=color;
  for(let y=Math.floor(Math.min(...points.map(p=>p[1])));y<=Math.ceil(Math.max(...points.map(p=>p[1])));y++) {
    const edges=[];
    for(let i=0;i<points.length;i++) {
      const a=points[i],b=points[(i+1)%points.length];
      if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))edges.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));
    }
    edges.sort((a,b)=>a-b);
    for(let i=0;i<edges.length;i+=2)ctx.fillRect(Math.ceil(edges[i]),y,Math.floor(edges[i+1])-Math.ceil(edges[i])+1,1);
  }
}
function fill(ctx,color,x,y,w,h) {ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}

export function drawScene(ctx,assets,biome,catalog,phase='NIGHT',{character=true}={}) {
  const [width,height]=sceneSize,p=palettes[phase],c=props[phase],ground=218;
  ctx.imageSmoothingEnabled=false;
  fill(ctx,c.sky,0,0,width,height);
  sprite(ctx,biome.sprites[phase==='DAY'?'sun':'moon'],{...materialPalette(phase),b:c.moon,h:'#f7edc2',s:'#c3b77e',f:'#c5b880'},410,59);
  const far=materialPalette(phase,'far');
  for(const x of [14,196,378,560])sprite(ctx,biome.sprites.forestBackdrop,far,x,190);
  const middle=materialPalette(phase,'middle');
  for(const [id,x,y] of [['distantOak',110,199],['distantOak',348,194],['distantOak',523,198]])
    sprite(ctx,biome.sprites[id],middle,x,y);
  polygon(ctx,[[0,192],[37,187],[78,194],[112,188],[151,192],[187,185],[224,191],[267,189],[315,196],[360,189],[406,194],[454,186],[503,190],[560,185],[560,220],[0,220]],c.floor);
  sprite(ctx,biome.sprites.church,materialPalette(phase,'architecture'),233,194);
  const near=materialPalette(phase);
  for(const x of [185,281,377,473,569])sprite(ctx,biome.sprites.fence,{...near,k:p.C,t:p.C,a:p.p,r:p.q,l:p.r},x,211);
  sprite(ctx,biome.sprites.ruins,{...materialPalette(phase,'architecture'),g:p.w,m:p.x},326,214);
  fill(ctx,c.path,0,ground,width,6);
  fill(ctx,phase==='DAY'?'#586b51':'#3e5747',0,ground+6,width,9);
  fill(ctx,c.earth,0,ground+15,width,height-ground-15);
  for(const x of [0,64,128,192,256,320,384,448,512])sprite(ctx,biome.sprites.groundA,near,x+32,ground+31);
  sprite(ctx,assets.studyOak,p,40,ground);
  sprite(ctx,assets.studyGabledGrave,p,192,ground);
  sprite(ctx,assets.studyRoundGrave,p,399,ground);
  sprite(ctx,assets.studyBrokenGrave,p,484,ground);
  for(const [id,x,y] of [['shrub',113,ground],['fern',151,ground],['shrub',535,ground],['fern',445,ground],
    ['mushrooms',138,ground],['mushrooms',420,ground],['flowers',227,ground],['flowers',372,ground],['rocks',453,ground]])
    sprite(ctx,biome.sprites[id],near,x,y);
  const lamp=catalog.parts[catalog.characters.objects.lantern.part];
  // The approved object remains context, not one of the four redrawn assets.
  const object=catalog.characters.objects.lantern;
  const lampRows=lamp.pixels;
  const lampPalette=paletteOf(catalog.style);
  if(phase==='DAY')Object.assign(lampPalette,{f:p.r,h:p.t,b:p.s});
  if(object && lampRows)drawPixels(ctx,lampRows,lampPalette,153-object.anchor[0],ground-object.anchor[1]);
  for(const x of [3,17,39,77,91,128,143,160,215,232,255,345,369,393,422,439,465,499,527,546]) {
    fill(ctx,p.v,x,ground-4,1,5);fill(ctx,p.w,x+1,ground-3,1,3);fill(ctx,p.x,x+1,ground-3,1,1);
  }
  for(const [x,y,w] of [[6,221,5],[42,219,8],[91,223,4],[127,220,7],[179,224,6],[223,221,8],[262,219,7],[293,224,5],[329,221,5],[374,224,8],[430,220,6],[474,222,8],[515,219,7],[549,223,6]])fill(ctx,p.p,x,y,w,1);
  if(character)drawPixels(ctx,composePose(catalog,'miga',catalog.animations.clips.idle.frames[0][0]),paletteOf(catalog.style),280-32,ground-61);
}

export function drawSheet(ctx,assets,phase='NIGHT',silhouette=false) {
  const p=palettes[phase];
  fill(ctx,phase==='NIGHT'?'#304c52':'#a9b7a5',0,0,560,248);
  fill(ctx,p.p,0,218,560,1);
  const colors=silhouette?Object.fromEntries(Object.keys(p).map(t=>[t,'#162e31'])):p;
  for(const [id,x] of [['studyOak',47],['studyGabledGrave',261],['studyRoundGrave',371],['studyBrokenGrave',481]])sprite(ctx,assets[id],colors,x,218);
}
