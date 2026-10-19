import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WORLD_LEFT, WORLD_RIGHT, WORLD_WIDTH, VIEW_WIDTH, CREATURE_MARGIN } from '../src/core/Config.js';
import { World } from '../src/world/World.js';
import { Creature } from '../src/creature/Creature.js';
import { CreatureAI } from '../src/creature/CreatureAI.js';
import { constrainPosition, moveToward } from '../src/physics/Collision.js';
import { Camera, worldViewSize } from '../src/rendering/Camera.js';
import { cemeteryZones, lateralPlacements, referencePosition, terrainSegments } from '../src/rendering/ReferenceLayout.js';
import { drawReferenceScene } from '../src/rendering/ReferenceScene.js';
import { normalizeSave, newSave } from '../src/persistence/SaveSchema.js';

const manifest = JSON.parse(readFileSync(new URL('../assets/reference-biome/manifest.json', import.meta.url)));
const minimum = WORLD_LEFT + CREATURE_MARGIN, maximum = WORLD_RIGHT - CREATURE_MARGIN;

test('two lateral wings triple the walkable span without moving the original clearing', () => {
  assert.equal(WORLD_WIDTH, 1680);
  assert.equal(VIEW_WIDTH, 560);
  assert.deepEqual([WORLD_LEFT, WORLD_RIGHT], [-560, 1120]);
  assert.deepEqual(manifest.worldBounds, [WORLD_LEFT, WORLD_RIGHT]);
  assert.equal(manifest.worldWidth, WORLD_WIDTH);
  assert.deepEqual(cemeteryZones.map(zone => zone.bounds), [[-560,0],[0,560],[560,1120]]);
  const world = new World();
  assert.deepEqual([world.left, world.right, world.width], [WORLD_LEFT, WORLD_RIGHT, WORLD_WIDTH]);
});

test('architecture integration opens the desktop view without altering phone scale or world bounds', () => {
  for (const [width,height,expected] of [[1280,720,712],[320,720,288],[390,844,288],[1920,1080,712]]) {
    assert.equal(worldViewSize(width,height).width, expected);
  }
});

test('all approved poses retain the same safety margin at both new boundaries', () => {
  assert.equal(constrainPosition(-1e9), minimum);
  assert.equal(constrainPosition(1e9), maximum);
  for (const x of [-500,-100,0,205,560,900,1088]) assert.equal(constrainPosition(x), x);
  assert.equal(moveToward(minimum + 2, -1e9, 20), minimum);
  assert.equal(moveToward(maximum - 2, 1e9, 20), maximum);
});

test('old save coordinates and memories are not shifted to create the left wing', () => {
  for (const x of [32,142,205,528]) {
    const save = newSave(1000, () => .5);
    save.creature.position.x = x;
    save.creature.state = { name:'WALK', elapsed:.4, duration:10, targetX:500, targetObject:null };
    save.world.discoveredObjects = ['tree'];
    const restored = normalizeSave(save,2000);
    assert.equal(restored.version,save.version);
    assert.equal(restored.creature.position.x,x);
    assert.equal(restored.creature.state.targetX,500);
    assert.deepEqual(restored.world.discoveredObjects,['tree']);
  }
});

test('new negative and eastern positions and walk targets survive save normalization', () => {
  for (const x of [-528,-280,-100,700,840,1088]) {
    const save = newSave(1000, () => .5);
    save.creature.position.x = x;
    save.creature.state = { name:'WALK', elapsed:1, duration:10, targetX:-x+300, targetObject:null };
    const restored = normalizeSave(save,2000);
    assert.equal(restored.creature.position.x,x);
    assert.equal(restored.creature.state.targetX,constrainPosition(-x+300));
  }
});

test('autonomous exploration samples the full expanded bounds without inventing objects', () => {
  const targets = [];
  for (const value of [0,.25,.5,.75,.999999]) {
    const creature = new Creature({ needs:{ energy:100, boredom:90 } }, () => .5);
    const world = new World(), ai = new CreatureAI(creature,world,() => value);
    ai.chooseGoal();
    assert.equal(creature.state,'WALK');
    assert.equal(creature.targetObject,null);
    assert.ok(creature.targetX >= minimum && creature.targetX <= maximum);
    targets.push(creature.targetX);
    assert.deepEqual(world.objects,[]);
  }
  assert.ok(targets[0] < 0 && targets.at(-1) > 560);
});

test('Miga walks continuously across both old borders without a teleport or a new state', () => {
  for (const [start,end] of [[10,-30],[550,590]]) {
    const creature = new Creature({ position:{x:start}, needs:{energy:100} }, () => .5);
    const ai = new CreatureAI(creature,new World(),() => .5);
    creature.transition('WALK',10,{x:end});
    for (let i=0;i<600 && creature.state==='WALK';i++) {
      const before = creature.x;
      ai.update(1/30);
      assert.ok(Math.abs(creature.x-before) <= 20/30);
    }
    assert.ok(Math.abs(creature.x-end)<.1);
    assert.equal(creature.state,'LOOK_AROUND');
  }
});

test('camera bounds remain valid at both wings and when a viewport exceeds the world', () => {
  for (const width of [288,560,1000,1680,2048]) for (const x of [-528,-280,205,840,1088]) {
    const camera = new Camera(x);
    camera.resize(width,400);
    camera.update(x,10);
    if (width >= WORLD_WIDTH) assert.equal(camera.x,(WORLD_LEFT+WORLD_RIGHT)/2);
    else assert.ok(camera.left >= WORLD_LEFT-.5 && camera.left+width <= WORLD_RIGHT+.5);
    const point = camera.toScreen(x,-12);
    const bounds = {left:10,top:20,width:width*2,height:800};
    const restored = camera.fromClient(point.x*2+10,point.y*2+20,bounds);
    assert.ok(Math.abs(restored.x-x) <= .5);
    assert.equal(restored.y,-12);
  }
});

test('all depth planes use one snapped camera origin with no independent time delay', () => {
  const camera = new Camera(-280); camera.resize(560,315);
  for (const placement of lateralPlacements) {
    const first = referencePosition(camera,placement);
    assert.ok(Number.isInteger(first.x) && Number.isInteger(first.y));
    camera.x += 100;
    const second = referencePosition(camera,placement);
    assert.ok(Math.abs(first.x-second.x-100*(placement.parallax??1)) <= 1);
    camera.x -= 100;
    assert.deepEqual(referencePosition(camera,placement),first);
  }
  assert.ok(lateralPlacements.some(p=>p.id==='distantCitadel'&&p.parallax===.22));
  assert.ok(lateralPlacements.some(p=>p.parallax===.68));
  assert.ok(lateralPlacements.some(p=>p.parallax===.86));
});

test('alternating terrain covers negative positions and every seam without gaps or random changes', () => {
  for (const left of [-1024,-560,-559,-1,0,559,560,1119]) for (const width of [288,560,2048]) {
    const segments = terrainSegments(left,width);
    assert.ok(segments[0].x <= left);
    assert.ok(segments.at(-1).x+560 >= left+width);
    segments.forEach((segment,index) => {
      assert.equal(segment.flipped,Math.abs(segment.x/560%2)===1);
      if (index) { assert.equal(segment.x-segments[index-1].x,560); assert.notEqual(segment.flipped,segments[index-1].flipped); }
    });
    assert.deepEqual(terrainSegments(left,width),segments);
  }
});

test('five reference-derived assets are independent transparent-source props, not a flattened scene', () => {
  for (const id of ['prayingAngel','mausoleum','cypressGrove','recliningAngel','brokenCross']) {
    const item = manifest.sprites.find(sprite=>sprite.id===id);
    assert.ok(item);
    assert.match(item.provenance,id==='mausoleum'||id==='recliningAngel'?/Architecture study revision 6/:/occluded parts generated/);
    assert.equal(item.anchor[1],item.size[1]);
    assert.ok(lateralPlacements.some(p=>p.id===id));
  }
});

test('architecture and cypresses stay behind the walk plane at both lateral zones', () => {
  const items = new Map(manifest.sprites.map(sprite=>[sprite.id,{...sprite,surface:{id:sprite.id}}]));
  for (const x of [-280,840]) {
    const calls = [], camera = new Camera(x); camera.resize(560,315);
    const ctx = { createLinearGradient:()=>({addColorStop(){}}), createRadialGradient:()=>({addColorStop(){}}),fillRect(){},save(){},restore(){},translate(){},scale(){},
      drawImage(surface){calls.push(surface.id);} };
    drawReferenceScene(ctx,camera,'NIGHT',0,id=>items.get(id==='chapel-glass'?'chapel':id));
    const floor=calls.indexOf('ground');
    for(const id of ['distantCitadel','watchtower','cypressGrove'])if(calls.includes(id))assert.ok(calls.indexOf(id)<floor);
    for(const id of ['prayingAngel','recliningAngel','mausoleum'])if(calls.includes(id))assert.ok(floor<calls.indexOf(id));
    assert.ok(calls.includes(x<0?'distantCitadel':'mausoleum'));
  }
});
