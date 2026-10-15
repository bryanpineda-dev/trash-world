const clamp=value=>Math.max(0,Math.min(255,Math.round(value)));

export const referencePlacements = [
  {id:'chapel',x:188,offset:-25,depth:'architecture'},
  {id:'gabledGrave',x:91,offset:-25,depth:'distant',scale:.57},
  {id:'roundGrave',x:290,offset:-24,depth:'distant',scale:.6},
  {id:'ringCross',x:386,offset:-27,depth:'distant',scale:.54},
  {id:'gabledGrave',x:521,offset:-21,depth:'distant',scale:.57},
  {id:'ruin',x:250,offset:-8,depth:'near'},
  {id:'ringCross',x:441,offset:0,depth:'near'},
  {id:'gabledGrave',x:154,offset:0,depth:'near'},
  {id:'roundGrave',x:354,offset:0,depth:'near'},
  {id:'oakLeft',x:17,offset:0,depth:'near'},
  {id:'oakRight',x:547,offset:0,depth:'near'},
  {id:'undergrowth',x:101,offset:1,depth:'near'},
  {id:'undergrowth',x:226,offset:1,depth:'near',scale:.63},
  {id:'undergrowth',x:397,offset:1,depth:'near',scale:.68},
  {id:'undergrowth',x:508,offset:1,depth:'near',scale:.76},
  {id:'mushrooms',x:72,offset:0,depth:'near'},
  {id:'mushrooms',x:376,offset:0,depth:'near'},
];

export function isChapelGlass(x,y,width,height,r,g,b) {
  return x>width*.22&&x<width*.57&&y>height*.46&&y<height*.9&&r>115&&g>75&&r>g*1.06&&g>b*1.18;
}

export function shadeReferencePixels(pixels,id,width,height,phase,depth='near') {
  const output=new Uint8ClampedArray(pixels);
  const factor=phase==='DAY'?[1.02,1.02,.98]:phase==='EVENING'?[.98,.94,.92]:[.8,.88,.96];
  const haze=id==='forestFar'?.25:id==='forestMiddle'?.04:depth==='distant'?.32:depth==='architecture'?.17:0;
  const air=phase==='DAY'?[143,169,148]:phase==='EVENING'?[130,153,143]:[106,144,147];
  for(let n=0;n<output.length;n+=4) {
    if(!output[n+3])continue;
    const [r,g,b]=output.slice(n,n+3),x=n/4%width,y=Math.floor(n/4/width);
    const glass=id==='chapel'&&isChapelGlass(x,y,width,height,r,g,b);
    if(glass) {
      if(phase==='DAY') {
        const light=(r+g+b)/3;output[n]=clamp(28+light*.17);output[n+1]=clamp(43+light*.24);output[n+2]=clamp(49+light*.27);
      }
      continue;
    }
    for(let c=0;c<3;c++)output[n+c]=clamp(output[n+c]*factor[c]*(1-haze)+air[c]*haze);
  }
  return output;
}

export function candleGlowAt(seconds) {return .075+Math.sin(seconds*.83)*.025+Math.sin(seconds*1.73+.8)*.015;}

const skies={DAY:['#355952','#a3b7a2'],EVENING:['#304a4e','#8d9b85'],NIGHT:['#102b34','#6f9090']};
export function drawReferenceScene(ctx,camera,phase,seconds,get) {
  const {width,height,ground,left}=camera;
  ctx.imageSmoothingEnabled=false;
  const sky=ctx.createLinearGradient(0,0,0,Math.max(ground,1));
  sky.addColorStop(0,skies[phase][0]);sky.addColorStop(1,skies[phase][1]);ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
  const draw=(id,x,y,depth='near',scale=1)=>{
    const asset=get(id,phase,depth);if(!asset)return;
    const w=Math.round(asset.size[0]*scale),h=Math.round(asset.size[1]*scale);
    ctx.drawImage(asset.surface,Math.round(x-asset.anchor[0]*scale),Math.round(y-asset.anchor[1]*scale),w,h);
  };
  if(phase!=='DAY')draw('moon',234-left*.12,Math.max(24,ground-177));
  // The forest floor connects tree roots to the path without a pale fog stripe.
  ctx.fillStyle=phase==='DAY'?'#2a493e':'#203b39';ctx.fillRect(0,ground-27,width,height-ground+27);
  for(const [id,offset,factor] of [['forestFar',-23,.12],['forestMiddle',-17,.34]]) {
    const item=get(id,phase);if(!item)continue;
    const span=item.size[0],base=280-left*factor;
    for(let x=base-span-Math.ceil((base-span)/span)*span;x<width+span;x+=span)draw(id,x,ground+offset);
  }
  const chapel=referencePlacements[0];draw(chapel.id,chapel.x-left,ground+chapel.offset,chapel.depth);
  if(phase!=='DAY') {
    const light=get('chapel-glass',phase);
    if(light){ctx.save();ctx.globalAlpha=candleGlowAt(seconds);ctx.drawImage(light.surface,Math.round(chapel.x-left-light.anchor[0]),Math.round(ground+chapel.offset-light.anchor[1]));ctx.restore();}
  }
  for(const placement of referencePlacements.slice(1).filter(p=>p.depth==='distant'))draw(placement.id,placement.x-left,ground+placement.offset,placement.depth,placement.scale);
  for(const x of [5,149,293,437,581])draw('fence',x-left,ground-9,'architecture');
  // Terrain establishes the same walkable y as the unchanged creature rig.
  ctx.fillStyle=phase==='DAY'?'#182a2b':'#102024';ctx.fillRect(0,ground,width,height-ground);
  for(let x=Math.floor(left/560)*560;x<left+width;x+=560)draw('ground',x-left,ground);
  for(const [x,scale] of [[25,.5],[66,.55],[111,.46],[197,.54],[270,.49],[311,.57],[391,.5],[469,.53],[550,.48]])draw('undergrowth',x-left,ground+1,'near',scale);
  for(const placement of referencePlacements.filter(p=>p.depth==='near'))draw(placement.id,placement.x-left,ground+placement.offset,placement.depth,placement.scale??1);
  // A quieter layer below the path avoids a bare cut-out platform in tall viewports.
  for(const x of [34,185,345,510])draw('undergrowth',x-left,Math.max(ground+76,height+12),'near',1.18);
  if(phase!=='DAY')for(const [i,x] of [112,207,333,478].entries()) {
    ctx.fillStyle=i%2?'#d6ce84':'#9fb786';
    ctx.fillRect(Math.round(x-left*.8+Math.sin(seconds*.3+i)*3),Math.round(ground-49-i*12+Math.sin(seconds*.4+i)*2),1,1);
  }
}
