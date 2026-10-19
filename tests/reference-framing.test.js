import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { Camera,worldViewSize } from '../src/rendering/Camera.js';
import { referencePlacements,drawReferenceScene } from '../src/rendering/ReferenceScene.js';
import { fitReferencePlacement,referencePosition } from '../src/rendering/ReferenceLayout.js';

const root=new URL('../assets/reference-biome/',import.meta.url),manifest=JSON.parse(readFileSync(new URL('manifest.json',root)));
const items=new Map(manifest.sprites.map(item=>[item.id,item]));
const protectedPlacements=referencePlacements.filter(p=>p.fitHeadroom);
const sizes=[[320,720],[390,844],[1280,720],[1920,1080],[844,390],[1920,260],[3440,360],[3840,260],[3840,180]];
function camera(w,h,x=280) {const size=worldViewSize(w,h),view=new Camera(x);view.resize(size.width,size.height);return view;}
function drawCalls(view,hour=0) {
  const calls=[],stack=[],ctx={globalAlpha:1,createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),fillRect(){},translate(){},scale(){},
    save(){stack.push(this.globalAlpha);},restore(){this.globalAlpha=stack.pop();},
    drawImage(surface,x,y,w,h){calls.push({id:surface.id,x,y,w,h});}};
  drawReferenceScene(ctx,view,hour,3,(id)=>{const item=items.get(id.replace('-glass',''));return item?{...item,surface:{id}}:null;});
  return calls;
}

test('pillar and undergrowth exports preserve source proportions at their approved heights',()=>{
  for(const [id,width,height]of [['ruin',85,142],['undergrowth',79,42]]) {
    const item=items.get(id);assert.deepEqual(item.size,[width,height]);
    assert.ok(Math.abs(width/height/(item.sourceRect.width/item.sourceRect.height)-1)<.005);
  }
});

test('proportional exports retain the base height and horizontal source anchor within half a native pixel',()=>{
  for(const [id,oldWidth,oldAnchor]of [['ruin',72,26],['undergrowth',70,35]]) {
    const item=items.get(id);
    assert.equal(item.anchor[1],item.size[1]);assert.ok(Math.abs(item.anchor[0]-oldAnchor*item.size[0]/oldWidth)<=.5);
  }
});

test('the two reexports retain the exact approved source originals',()=>{
  for(const [id,sha]of [['ruin','4f038bc59ab528e0c809ab8e80f53f79adfbf80e833437b9d3966dc0d1ce2c4a'],
    ['undergrowth','3ea41d899546302c86c2305c6ba0d3ebb8f9f90541c7c415b156203c85635255']]) {
    assert.equal(createHash('sha256').update(readFileSync(new URL(items.get(id).source,root))).digest('hex'),sha);
  }
});

test('desktop opens a global 400px view while phone projection and ground anchors remain coherent',()=>{
  for(const [w,h,width]of [[1280,720,712],[1920,1080,712],[320,720,288],[390,844,288]]) {
    const view=camera(w,h);assert.equal(view.width,width);
    assert.equal(view.ground,Math.min(view.height-32,Math.round(view.height*.79)));
  }
});

test('short panoramas retain floor pixels and give tall scenery more headroom without increasing the width cap',()=>{
  const view=camera(3440,360);assert.deepEqual([view.width,view.height],[2048,214]);assert.equal(view.ground,190);
  for(const [w,h]of sizes) {
    const c=camera(w,h);assert.ok(c.width<=2048);assert.ok(c.ground>=0&&c.ground<=c.height-12);
    assert.ok(Math.abs(c.height-c.width*h/w)<=.5||c.height===100);
  }
});

test('every fitted building and monument retains its complete top at all supported aspect extremes',()=>{
  for(const [w,h]of sizes)for(const x of [-528,-280,280,840,1088]) {
    const view=camera(w,h,x);
    for(const placement of protectedPlacements) {
      const item=items.get(placement.id),point=fitReferencePlacement(view,placement,item);
      assert.ok(Math.round(point.y-item.anchor[1]*point.scale)>=7,`${w}x${h}: ${placement.id}`);
      assert.ok(point.scale>0&&point.scale<=(placement.scale??1));
    }
  }
});

test('the cypress crown stays intact in landscape without reducing its ordinary desktop size',()=>{
  const placement=protectedPlacements.find(p=>p.id==='cypressGrove'),item=items.get(placement.id);
  const desktop=camera(1280,720),normal=fitReferencePlacement(desktop,placement,item);
  assert.equal(normal.scale,.9);assert.deepEqual({x:normal.x,y:normal.y},referencePosition(desktop,placement));
  const short=camera(844,390),fitted=fitReferencePlacement(short,placement,item);
  assert.equal(fitted.scale,.9);assert.ok(Math.round(fitted.y-item.anchor[1]*fitted.scale)>=7);
});

test('background distance and ground anchors scale together rather than lifting an asset away from its plane',()=>{
  const view=camera(3840,260);
  for(const placement of protectedPlacements) {
    const item=items.get(placement.id),point=fitReferencePlacement(view,placement,item),ratio=point.scale/(placement.scale??1);
    assert.equal(point.y,Math.round(view.ground+placement.offset*ratio));
    if(!placement.offset)assert.equal(point.y,view.ground);
  }
});

test('framing uses the same snapped horizontal projection and parallax as the original layout',()=>{
  const view=camera(3840,260);
  for(const placement of protectedPlacements) {
    const item=items.get(placement.id),before=fitReferencePlacement(view,placement,item);
    assert.equal(before.x,referencePosition(view,placement).x);
    view.x+=10;const after=fitReferencePlacement(view,placement,item);view.x-=10;
    assert.ok(Math.abs(before.x-after.x-10*(placement.parallax??1))<=1);assert.equal(before.scale,after.scale);
  }
});

test('frame trees keep their native framing and are not silently shrunk with the protected monuments',()=>{
  const view=camera(3840,260);
  for(const id of ['oakLeft','oakRight','bareOak','silverAsh']) {
    const placement=referencePlacements.find(p=>p.id===id),point=fitReferencePlacement(view,placement,items.get(id));
    assert.ok(!placement.fitHeadroom);assert.equal(point.scale,1);assert.deepEqual({x:point.x,y:point.y},referencePosition(view,placement));
  }
});

test('resizing away and back produces the same framing without temporal state',()=>{
  const placement=protectedPlacements.find(p=>p.id==='mausoleum'),item=items.get(placement.id),view=camera(3440,360);
  const before=fitReferencePlacement(view,placement,item);view.resize(560,315);view.resize(2048,214);
  assert.deepEqual(fitReferencePlacement(view,placement,item),before);
});

test('production draw rectangles retain every fitted top in all three zones and hours',()=>{
  const ids=new Set(protectedPlacements.map(p=>p.id));
  for(const [w,h]of sizes)for(const x of [-280,280,840])for(const hour of [0,6.5,12,19.5]) {
    const view=camera(w,h,x);
    for(const call of drawCalls(view,hour))if(ids.has(call.id)||call.id==='chapel-glass')assert.ok(call.y>=0,`${w}x${h}: ${call.id}`);
  }
});

test('chapel masonry and candle mask use exactly the same fitted rectangle',()=>{
  for(const [w,h]of [[3440,360],[3840,260]]) {
    const calls=drawCalls(camera(w,h)),body=calls.find(c=>c.id==='chapel'),glass=calls.find(c=>c.id==='chapel-glass');
    assert.ok(body&&glass);for(const key of ['x','y','w','h'])assert.equal(body[key],glass[key]);
  }
});

test('touch coordinates round-trip after the adjusted floor line and extreme camera bounds',()=>{
  for(const [w,h]of sizes) {
    const view=camera(w,h),bounds={left:13,top:21,width:w,height:h};
    for(const x of [-280,188,280,840]) {
      const point=view.toScreen(x,-12),world=view.fromClient(bounds.left+point.x*w/view.width,bounds.top+point.y*h/view.height,bounds);
      assert.ok(Math.abs(world.x-x)<=.5);assert.ok(Math.abs(world.y+12)<=.5);
    }
  }
});
