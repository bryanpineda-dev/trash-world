import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateJointRig,sampleJointRig,phaseAtDistance} from '../src/animation/JointRig.js';
import {validateJointSkin,jointSkinPixels} from '../studies/locomotion/pixels.js';
import {pixelBounds,expandPart} from '../src/rendering/AssetModel.js';
const json=file=>JSON.parse(readFileSync(new URL(file,import.meta.url)));
const rig=json('../studies/locomotion/rig.json'),motion=json('../studies/locomotion/walk.json'),skin=json('../studies/locomotion/skin.json'),parts=json('../assets/source/parts.json');
const clone=value=>structuredClone(value);

test('joint rig and bitmap attachments have a valid ordered hierarchy',()=>{
  assert.ok(validateJointRig(rig,motion));assert.ok(validateJointSkin(rig,skin,parts));
  const invalid=clone(rig);invalid.bones[2].parent='missing';assert.throws(()=>validateJointRig(invalid,motion),/Parent/);
  const duplicate=clone(rig);duplicate.bones[2].id=duplicate.bones[1].id;assert.throws(()=>validateJointRig(duplicate,motion),/Duplicate/);
  const disconnected=clone(skin);disconnected.layers[0].chain[1]='nearElbow';assert.throws(()=>validateJointSkin(rig,disconnected,parts),/Disconnected/);
});

test('authored angles keep every bone length constant throughout the loop',()=>{
  for(let i=0;i<=512;i++){
    const {joints}=sampleJointRig(rig,motion,i/512);
    for(const bone of rig.bones)if(bone.parent){const a=joints[bone.id],b=joints[bone.parent];assert.ok(Math.abs(Math.hypot(a.x-b.x,a.y-b.y)-Math.hypot(...bone.at))<1e-9);}
  }
});

test('hip sockets follow the pelvis instead of staying at fixed canvas coordinates',()=>{
  for(let i=0;i<128;i++){
    const {joints}=sampleJointRig(rig,motion,i/128);
    assert.ok(Math.abs(joints.nearHip.y-joints.pelvis.y)<1e-9);assert.ok(Math.abs(joints.farHip.y-joints.pelvis.y)<1e-9);
    assert.equal(joints.nearHip.x-joints.pelvis.x,.5);assert.equal(joints.farHip.x-joints.pelvis.x,-.5);
  }
});

test('support ankles stay on one ground plane and contact switches without a loop jump',()=>{
  for(let i=0;i<=512;i++){
    const pose=sampleJointRig(rig,motion,i/512);assert.ok(Math.abs(pose.joints[pose.contact].y-59)<1e-9);
  }
  const a=sampleJointRig(rig,motion,0),b=sampleJointRig(rig,motion,1);assert.deepEqual(a,b);
  const c=sampleJointRig(rig,motion,1-1e-7);assert.ok(Math.abs(a.joints.pelvis.y-c.joints.pelvis.y)<.001);
});

test('locomotion is tied to distance, not frame rate or a hardcoded timer',()=>{
  for(const speed of [8,12,16,19,28]){
    const once=phaseAtDistance(speed*3,motion.stride);
    for(const fps of [30,60,120]){let distance=0;for(let i=0;i<fps*3;i++)distance+=speed/fps;const phase=phaseAtDistance(distance,motion.stride);assert.ok(Math.min(Math.abs(phase-once),1-Math.abs(phase-once))<1e-10);}
  }
  assert.equal(phaseAtDistance(0,motion.stride),0);assert.equal(phaseAtDistance(motion.stride,motion.stride),0);
  assert.throws(()=>phaseAtDistance(-1,16));assert.throws(()=>sampleJointRig(rig,motion,NaN));
});

test('the two contacts have balanced step lengths and a nearly planted support foot',()=>{
  const a=sampleJointRig(rig,motion,0).joints.nearAnkle.x;
  const b=sampleJointRig(rig,motion,.5).joints.farAnkle.x+motion.stride/2;
  const c=a+motion.stride;
  assert.ok(Math.abs((b-a)-(c-b))<=2.01);
  for(let i=0;i<256;i++){
    const phase=i/256,pose=sampleJointRig(rig,motion,phase),support=pose.joints[pose.contact];
    assert.ok(Math.abs(support.x+phase*motion.stride-(phase<.5?a:b))<1);
  }
});

test('the sampler supports other hierarchies without character-specific names',()=>{
  const other={size:[32,32],bones:[{id:'root',parent:null,at:[5,5]},{id:'branch',parent:'root',at:[3,0]}]};
  const movement={stride:7,plants:[],keys:[{phase:0,rise:0,angles:{root:0}},{phase:.5,rise:0,angles:{root:90}}]};
  assert.ok(validateJointRig(other,movement));const p=sampleJointRig(other,movement,.5);
  assert.ok(Math.abs(p.joints.branch.x-5)<1e-9);assert.ok(Math.abs(p.joints.branch.y-8)<1e-9);
});

test('every candidate frame is native palette-only pixel art inside 64x64',()=>{
  for(let i=0;i<256;i++){
    const rows=jointSkinPixels(rig,skin,parts,sampleJointRig(rig,motion,i/256)),bounds=pixelBounds(rows);
    assert.equal(rows.length,64);assert.ok(rows.every(row=>row.length===64&&/^[.khbs]+$/.test(row)));
    assert.ok(bounds.width>10&&bounds.height>=50&&bounds.height<=60);
    assert.ok(bounds.y+bounds.height<=61);
  }
});

test('head and torso remain direct attachments of the existing source pixels',()=>{
  const attachments=skin.layers.filter(l=>l.type==='attachment');
  assert.deepEqual(attachments.map(a=>a.part),['pelvis','ribs','skull']);
  const rows=jointSkinPixels(rig,skin,parts,sampleJointRig(rig,motion,0));
  const head=attachments.at(-1),pixels=expandPart(parts[head.part],head.variant),j=sampleJointRig(rig,motion,0).joints[head.bone],x=Math.round(j.x)+head.offset[0],y=Math.round(j.y)+head.offset[1];
  for(let py=0;py<pixels.length;py++)for(let px=0;px<pixels[py].length;px++)if(pixels[py][px]!=='.')assert.equal(rows[y+py][x+px],pixels[py][px]);
});

test('the candidate is not enabled by the main renderer or asset laboratory',()=>{
  for(const file of ['src/rendering/Renderer.js','src/asset-lab.js','src/main.js']){
    const code=readFileSync(new URL('../'+file,import.meta.url),'utf8');assert.doesNotMatch(code,/JointRig|studies\/locomotion/);
  }
});
