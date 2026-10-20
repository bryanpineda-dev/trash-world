const finite=value=>typeof value==='number'&&Number.isFinite(value);
const fail=(ok,message)=>{if(!ok)throw new Error(message);};
const radians=degrees=>degrees*Math.PI/180;
const wrap=value=>((value%1)+1)%1;

export function validateJointRig(rig,motion) {
  fail(Array.isArray(rig.size)&&rig.size.every(n=>Number.isInteger(n)&&n>0),'Invalid rig dimensions');
  fail(Array.isArray(rig.bones)&&rig.bones.length>0,'Missing bones');
  const names=new Set();
  let roots=0;
  for(const bone of rig.bones) {
    fail(typeof bone.id==='string'&&!names.has(bone.id),'Duplicate bone');
    fail(bone.parent===null||names.has(bone.parent),'Parent must precede child: '+bone.id);
    fail(Array.isArray(bone.at)&&bone.at.length===2&&bone.at.every(finite),'Invalid bone offset');
    if(bone.parent===null)roots++;
    names.add(bone.id);
  }
  fail(roots===1,'A rig needs one root');
  fail(finite(motion.stride)&&motion.stride>0,'Invalid stride');
  fail(motion.keys.length>=2&&motion.keys[0].phase===0,'Missing loop origin');
  for(const [i,key]of motion.keys.entries()) {
    fail(finite(key.phase)&&key.phase>=0&&key.phase<1&&(i===0||key.phase>motion.keys[i-1].phase),'Unordered keyframes');
    for(const [id,angle]of Object.entries(key.angles))fail(names.has(id)&&finite(angle),'Unknown or invalid keyed bone: '+id);
    fail(finite(key.rise),'Invalid root rise');
  }
  for(const plant of motion.plants)fail(names.has(plant.bone)&&finite(plant.y)&&plant.start>=0&&plant.end<=1&&plant.start<plant.end,'Invalid foot contact');
  return true;
}

export function phaseAtDistance(distance,stride) {
  fail(finite(distance)&&distance>=0&&finite(stride)&&stride>0,'Invalid locomotion distance');
  return wrap(distance/stride);
}

function sampleKeys(motion,phase) {
  const index=motion.keys.findLastIndex(key=>key.phase<=phase);
  const a=motion.keys[index],b=motion.keys[(index+1)%motion.keys.length];
  const end=b.phase>a.phase?b.phase:b.phase+1;
  return {a,b,mix:(phase-a.phase)/(end-a.phase)};
}

function angleBetween(a,b,mix) {
  const delta=((b-a+540)%360)-180;
  return a+delta*mix;
}

export function sampleJointRig(rig,motion,progress) {
  fail(finite(progress),'Invalid animation phase');
  const phase=wrap(progress),{a,b,mix}=sampleKeys(motion,phase),joints={};
  for(const bone of rig.bones) {
    const parent=joints[bone.parent],localAngle=angleBetween(a.angles[bone.id]??0,b.angles[bone.id]??0,mix);
    const angle=(parent?.angle??0)+localAngle,c=Math.cos(radians(parent?.angle??0)),s=Math.sin(radians(parent?.angle??0));
    joints[bone.id]={x:(parent?.x??0)+bone.at[0]*c-bone.at[1]*s,
      y:(parent?.y??0)+bone.at[0]*s+bone.at[1]*c+(parent?0:a.rise+(b.rise-a.rise)*mix),angle};
  }
  // The support leg fixes the root height; every descendant follows the same correction.
  const plant=motion.plants.find(p=>phase>=p.start&&phase<p.end);
  if(plant){const dy=plant.y-joints[plant.bone].y;for(const joint of Object.values(joints))joint.y+=dy;}
  return {phase,joints,contact:plant?.bone??null};
}
