import { WORLD_LEFT, WORLD_RIGHT } from '../core/Config.js';
import { lateralPlacements, panoramaPlacements, referencePosition, fitReferencePlacement, terrainSegments, cemeteryPlacements, fenceModules } from './ReferenceLayout.js';
import { roseGlass, drawAltarCandles } from './ArchitectureLighting.js';
import { drawAmbientLife } from './AmbientLife.js';
import { sampleDaylight, daylightGrades, rgb, drawSkyStars, smoothstep } from './Daylight.js';

const clamp=value=>Math.max(0,Math.min(255,Math.round(value)));

export const referencePlacements = [
  {id:'chapel',x:188,offset:-38,parallax:.48,depth:'architecture',fitHeadroom:true},
  {id:'ruin',x:480,offset:-8,depth:'near',fitHeadroom:true},
  {id:'ringCross',x:390,offset:0,depth:'near',fitHeadroom:true},
  {id:'gabledGrave',x:94,offset:0,depth:'near',fitHeadroom:true},
  {id:'roundGrave',x:354,offset:0,depth:'near',fitHeadroom:true},
  {id:'oakLeft',x:17,offset:0,depth:'near'},
  {id:'oakRight',x:547,offset:0,depth:'near'},
  {id:'undergrowth',x:101,offset:1,depth:'near'},
  {id:'undergrowth',x:226,offset:1,depth:'near',scale:.63},
  {id:'undergrowth',x:397,offset:1,depth:'near',scale:.68},
  {id:'undergrowth',x:508,offset:1,depth:'near',scale:.76},
  {id:'mushrooms',x:72,offset:0,depth:'near'},
  {id:'mushrooms',x:376,offset:0,depth:'near'},
  ...lateralPlacements,
  ...cemeteryPlacements,
];

export function isChapelGlass(x,y,width,height,r,g,b) {
  return roseGlass(x,y,r,g,b,width,height);
}

export function shadeReferencePixels(pixels,id,width,height,phase,depth='near') {
  const output=new Uint8ClampedArray(pixels);
  if(id==='moon')return output;
  const grade=daylightGrades[phase]??daylightGrades[sampleDaylight(phase).from];
  const {factor,lift,air}=grade;
  const soilRamp=[.65,1.03,.73];
  const haze=depth==='far'?.12:depth==='middle'?.025:depth==='landmark'?.16:depth==='distant'?.2:depth==='architecture'?.035:depth==='grove'?.06:0;
  const emission={NIGHT:1,DAWN:.25,DAY:0,GOLDEN:0,DUSK:.65}[phase]??sampleDaylight(phase).lamps;
  for(let n=0;n<output.length;n+=4) {
    if(!output[n+3])continue;
    const r=output[n],g=output[n+1],b=output[n+2],x=n/4%width,y=Math.floor(n/4/width);
    const glass=id==='chapel'&&isChapelGlass(x,y,width,height,r,g,b);
    if(glass) {
      const light=(r+g+b)/3,cold=[28+light*.17,43+light*.24,49+light*.27];
      for(let c=0;c<3;c++)output[n+c]=clamp(cold[c]*(1-emission)+output[n+c]*emission);
      continue;
    }
    // Cool distant stone stays chromatic; dark lower foliage reads as forest litter, not fog.
    const soil=(depth==='far'||depth==='middle')?smoothstep(.68,.97,y/height)*.55:0;
    const luma=r*.2126+g*.7152+b*.0722;
    for(let c=0;c<3;c++) {
      const material=output[n+c]*(1-soil)+luma*soilRamp[c]*soil;
      const value=(material*factor[c]+lift[c])*(1-haze)+air[c]*haze;
      output[n+c]=clamp(value<=210?value:210+(value-210)*.38);
    }
  }
  return output;
}

export function candleGlowAt(seconds) {return .075+Math.sin(seconds*.83)*.025+Math.sin(seconds*1.73+.8)*.015;}

export function drawWoodlandSoil(ctx,camera,lighting) {
  ctx.fillStyle=rgb(lighting.floor);
  for(let x=0;x<camera.width;x+=4) {
    const worldX=x-camera.width/2+camera.pixelX*.5;
    const top=Math.round(camera.ground-57+Math.sin(worldX*.025)*4+Math.sin(worldX*.087)*2);
    ctx.fillRect(x,top,Math.min(4,camera.width-x),camera.height-top);
  }
}

export function drawReferenceScene(ctx,camera,time,seconds,get) {
  const {width,height,ground,left}=camera;
  const lighting=sampleDaylight(time);
  ctx.imageSmoothingEnabled=false;
  const sky=ctx.createLinearGradient(0,0,0,Math.max(ground,1));
  sky.addColorStop(0,rgb(lighting.sky[0]));sky.addColorStop(1,rgb(lighting.sky[1]));ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
  drawSkyStars(ctx,camera,seconds,lighting);
  const draw=(id,x,y,depth='near',scale=1)=>{
    const asset=get(id,lighting.from,depth);if(!asset)return;
    const w=Math.round(asset.size[0]*scale),h=Math.round(asset.size[1]*scale);
    const leftEdge=Math.round(x-asset.anchor[0]*scale),top=Math.round(y-asset.anchor[1]*scale);
    if(leftEdge+w<0||leftEdge>width||top+h<0||top>height)return;
    ctx.drawImage(asset.surface,leftEdge,top,w,h);
    if(lighting.blend>0&&id!=='moon'&&id!=='chapel-glass') {
      const other=get(id,lighting.to,depth);
      if(other){ctx.save();ctx.globalAlpha=(ctx.globalAlpha??1)*lighting.blend;ctx.drawImage(other.surface,leftEdge,top,w,h);ctx.restore();}
    }
  };
  if(lighting.moon>0){ctx.save();ctx.globalAlpha=lighting.moon;draw('moon',width*.64-camera.pixelX*.035,Math.max(26,ground-208));ctx.restore();}
  const place=placement=>{
    const asset=get(placement.id,lighting.from,placement.depth);if(!asset)return;
    const point=fitReferencePlacement(camera,placement,asset),scale=point.scale;
    draw(placement.id,point.x,point.y,placement.depth,scale);
    if(asset.emission?.type==='altar-candles')drawAltarCandles(ctx,
      Math.round(point.x-asset.anchor[0]*scale),Math.round(point.y-asset.anchor[1]*scale),lighting,seconds,asset.emission.wicks,scale);
    if(placement.id==='chapel'&&lighting.lamps>0) {
      const light=get('chapel-glass',lighting.from,placement.depth);
      if(light){ctx.save();ctx.globalAlpha=candleGlowAt(seconds)*lighting.lamps;draw('chapel-glass',point.x,point.y,placement.depth,scale);ctx.restore();}
    }
  };
  for(const placement of panoramaPlacements.filter(p=>p.depth==='far'))place(placement);
  const middleParallax=panoramaPlacements.find(p=>p.depth==='middle').parallax;
  for(const placement of referencePlacements.filter(p=>p.depth==='landmark'&&p.parallax<middleParallax))place(placement);
  drawWoodlandSoil(ctx,camera,lighting);
  for(const placement of panoramaPlacements.filter(p=>p.depth==='middle'))place(placement);
  drawAmbientLife(ctx,camera,lighting,seconds,'distant');
  for(const placement of referencePlacements.filter(p=>p.depth==='landmark'&&p.parallax>=middleParallax))place(placement);
  // A planted understory joins the far woodland to the fence, with no opaque mist band.
  for(let x=WORLD_LEFT-40;x<WORLD_RIGHT+60;x+=43) {
    const point=referencePosition(camera,{x,offset:-4,parallax:.76});
    draw('undergrowth',point.x,point.y,'grove',.43+(Math.abs(x)%5)*.025);
  }
  for(const depth of ['distant','grove','architecture'])for(const placement of referencePlacements.filter(p=>p.depth===depth&&!p.row))place(placement);
  for(const module of fenceModules(camera))draw(module.id,module.x,module.y,'architecture');
  for(const placement of cemeteryPlacements.filter(p=>p.row==='back'))place(placement);
  // Terrain establishes the same walkable y as the unchanged creature rig.
  ctx.fillStyle=rgb(lighting.floor.map(v=>v*.65));ctx.fillRect(0,ground,width,height-ground);
  const terrain=get('ground',lighting.from);
  if(terrain)for(const segment of terrainSegments(left,width,terrain.size[0])) {
    const x=Math.round(segment.x-left);
    if(segment.flipped){ctx.save();ctx.translate(x+terrain.size[0],0);ctx.scale(-1,1);draw('ground',0,ground);ctx.restore();}
    else draw('ground',x,ground);
  }
  for(const [x,scale] of [[25,.5],[66,.55],[111,.46],[197,.54],[270,.49],[311,.57],[391,.5],[469,.53],[550,.48]])draw('undergrowth',x-left,ground+1,'near',scale);
  for(const placement of cemeteryPlacements.filter(p=>p.row==='front'))place(placement);
  for(const placement of referencePlacements.filter(p=>p.depth==='near'&&!p.row))place(placement);
  for(const placement of referencePlacements.filter(p=>p.depth==='groundcover'))place(placement);
  // A quieter layer below the path avoids a bare cut-out platform in tall viewports.
  for(const x of [34,185,345,510])draw('undergrowth',x-left,Math.max(ground+76,height+12),'near',1.18);
  drawAmbientLife(ctx,camera,lighting,seconds,'near');
}
