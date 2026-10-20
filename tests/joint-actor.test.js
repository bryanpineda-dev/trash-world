import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JointActor} from '../src/animation/JointActor.js';
import {groundContacts} from '../src/rendering/GroundContact.js';
import {paletteOf,containsPoint} from '../src/rendering/AssetModel.js';
import {travelState,stepTravel} from '../studies/locomotion/Travel.js';
import {WORLD_LEFT,WORLD_RIGHT,CREATURE_MARGIN} from '../src/core/Config.js';
const json=p=>JSON.parse(readFileSync(new URL(p,import.meta.url)));
const profile={rig:json('../studies/locomotion/rig.json'),motion:json('../studies/locomotion/walk.json'),skin:json('../studies/locomotion/skin.json'),parts:json('../assets/source/parts.json'),palette:paletteOf(json('../assets/source/style.json'))};

test('native actor cache is bounded and reused across complete strides',()=>{
  const actor=new JointActor(profile);
  for(let i=0;i<1000;i++)actor.frame(i*.11);
  assert.equal(actor.frames.size,64);assert.equal(actor.frame(0),actor.frame(profile.motion.stride));
  assert.throws(()=>new JointActor(profile,0));assert.throws(()=>actor.frame(NaN));
});

test('actor contacts are measured from the exact cached pixels that get drawn',()=>{
  const actor=new JointActor(profile);
  for(let i=0;i<64;i++){
    const frame=actor.frame(i/64*profile.motion.stride);
    assert.deepEqual(frame.contacts,groundContacts(frame.pixels,profile.rig.anchor));assert.ok(frame.contacts.length>0);
    assert.equal(frame.bounds.y+frame.bounds.height,profile.rig.anchor[1]);
  }
});

test('candidate hit bounds include all visible pixels in both directions',()=>{
  const actor=new JointActor(profile),[ax,ay]=profile.rig.anchor;
  for(let i=0;i<64;i++)for(const direction of [-1,1]){
    const frame=actor.frame(i/4),bounds=actor.bounds(i/4,direction);
    for(let y=0;y<64;y++)for(let x=0;x<64;x++)if(frame.pixels[y][x]!=='.'){
      const px=direction<0?ax-x-.5:x-ax+.5;assert.ok(containsPoint(bounds,px,y-ay+.5,0));
    }
  }
});

test('actor instances keep separate frames and palettes',()=>{
  const a=new JointActor(profile),b=new JointActor(profile);
  assert.notEqual(a.frame(0),b.frame(0));b.palette={...b.palette,h:'#ffffff'};
  assert.notEqual(a.palette.h,b.palette.h);assert.deepEqual(a.frame(0).pixels,b.frame(0).pixels);
});

test('native actor mirrors around its anchor and restores drawing state',()=>{
  const events=[];const ctx={save(){events.push('save');},restore(){events.push('restore');},translate(...v){events.push(['translate',...v]);},scale(...v){events.push(['scale',...v]);},fillRect(){}};
  new JointActor(profile).draw(ctx,2,30.6,80.3,-1);
  assert.ok(events.some(e=>Array.isArray(e)&&e[0]==='translate'&&e[1]===31&&e[2]===80));
  assert.ok(events.some(e=>Array.isArray(e)&&e[0]==='scale'&&e[1]===-1));
  assert.equal(events.filter(e=>e==='save').length,events.filter(e=>e==='restore').length);
});

test('world preview counts actual displacement when the world boundary blocks a step',()=>{
  const edge=WORLD_RIGHT-CREATURE_MARGIN,state=travelState(edge-.25,1),next=stepTravel(state,.1,16);
  assert.equal(next.x,edge);assert.equal(next.distance,.25);assert.equal(next.direction,-1);
  assert.equal(state.distance,0);
});

test('world preview pause freezes position, direction, animation time and stride',()=>{
  const state=travelState(200,-1);assert.deepEqual(stepTravel(state,0,16),state);
  assert.throws(()=>stepTravel(state,NaN,16));assert.throws(()=>stepTravel(state,.1,-1));
});

test('preview traversal stays inside physical limits without teleporting at either end',()=>{
  let state=travelState(280,1),turns=0;
  for(let i=0;i<10000;i++){
    const next=stepTravel(state,.05,28);
    assert.ok(next.x>=WORLD_LEFT+CREATURE_MARGIN&&next.x<=WORLD_RIGHT-CREATURE_MARGIN);
    assert.ok(Math.abs(next.x-state.x)<=1.400001);
    assert.ok(Math.abs(next.distance-state.distance-Math.abs(next.x-state.x))<1e-10);
    if(next.direction!==state.direction)turns++;
    state=next;
  }
  assert.ok(turns>=5);
});

test('preview motion agrees across frame rates before reaching a boundary',()=>{
  const states=[30,60,120].map(fps=>{let state=travelState();for(let i=0;i<fps*5;i++)state=stepTravel(state,1/fps,19);return state;});
  for(const state of states){assert.ok(Math.abs(state.x-375)<1e-9);assert.ok(Math.abs(state.distance-95)<1e-9);}
});

test('the world preview has no persistence or AI ownership',()=>{
  const source=readFileSync(new URL('../studies/locomotion/WorldPreview.js',import.meta.url),'utf8');
  assert.doesNotMatch(source,/localStorage|SaveManager|CreatureAI|new Game\(/);
});
