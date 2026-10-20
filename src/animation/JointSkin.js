import {expandPart} from '../rendering/AssetModel.js';

export function validateJointSkin(rig,skin,parts) {
  const names=new Set(rig.bones.map(b=>b.id));
  const check=(ok,message)=>{if(!ok)throw new Error(message);};
  for(const layer of skin.layers) {
    const offset=layer.type==='limb'?layer.tip?.offset:layer.offset;
    check(Array.isArray(offset)&&offset.length===2&&offset.every(Number.isInteger),'Invalid attachment offset');
    if(layer.type==='attachment')check(names.has(layer.bone)&&parts[layer.part]?.variants[layer.variant],'Invalid bitmap attachment');
    else if(layer.type==='limb'){
      check(layer.chain?.length===3&&layer.chain.every(id=>names.has(id)),'Invalid limb chain');
      for(let i=1;i<layer.chain.length;i++)check(rig.bones.find(b=>b.id===layer.chain[i]).parent===layer.chain[i-1],'Disconnected limb');
      const pattern=skin.patterns[layer.tip.pattern];
      check(pattern?.length>0&&pattern.every(row=>row.length===pattern[0].length),'Invalid limb tip');
    }else throw new Error('Unknown skin layer');
  }
  return true;
}

function line(a,b) {
  const out=[];
  let x=Math.round(a.x),y=Math.round(a.y);
  const tx=Math.round(b.x),ty=Math.round(b.y),dx=Math.abs(tx-x),dy=-Math.abs(ty-y),sx=x<tx?1:-1,sy=y<ty?1:-1;
  let error=dx+dy;
  for(;;){out.push([x,y]);if(x===tx&&y===ty)break;const e=2*error;if(e>=dy){error+=dy;x+=sx;}if(e<=dx){error+=dx;y+=sy;}}
  return out;
}

export function jointSkinPixels(rig,skin,parts,pose) {
  const rows=Array.from({length:rig.size[1]},()=>Array(rig.size[0]).fill('.')),j=pose.joints;
  const pixel=(x,y,color,remap={})=>{
    x=Math.round(x);y=Math.round(y);
    if(color==='.')return;
    if(x<0||y<0||x>=rig.size[0]||y>=rig.size[1])throw new Error('Joint skin clips outside its canvas');
    rows[y][x]=remap[color]??color;
  };
  const bitmap=(pixels,x,y,remap)=>pixels.forEach((row,dy)=>[...row].forEach((color,dx)=>pixel(x+dx,y+dy,color,remap)));
  const limb=(ids,remap={})=>{
    const points=ids.slice(1).flatMap((id,i)=>line(j[ids[i]],j[id]));
    for(const [x,y]of points)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=2;dx++)pixel(x+dx,y+dy,skin.ink.outline,remap);
    for(const [x,y]of points){pixel(x,y,skin.ink.light,remap);pixel(x+1,y,skin.ink.shade,remap);}
    const joint=j[ids[1]];pixel(joint.x,joint.y,skin.ink.shade,remap);
  };
  for(const layer of skin.layers) {
    if(layer.type==='attachment')bitmap(expandPart(parts[layer.part],layer.variant),Math.round(j[layer.bone].x)+layer.offset[0],Math.round(j[layer.bone].y)+layer.offset[1],layer.remap);
    else if(layer.type==='limb'){
      limb(layer.chain,layer.remap);
      const tip=j[layer.chain.at(-1)];
      bitmap(skin.patterns[layer.tip.pattern],Math.round(tip.x)+layer.tip.offset[0],Math.round(tip.y)+layer.tip.offset[1],layer.remap);
    }else throw new Error('Unknown skin layer: '+layer.type);
  }
  return rows.map(row=>row.join(''));
}
