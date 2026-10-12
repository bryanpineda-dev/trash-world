import test from 'node:test';
import assert from 'node:assert/strict';
import { readBiomeSource } from '../scripts/biome-source.js';
import { raster, curve, woodSurface } from '../scripts/forest-brushes.js';
import { biomePalette, validateBiome, mistBands, mistPixelAlpha, mistSpeed, mistBlendAlpha, sceneryPosition } from '../src/rendering/BiomeModel.js';
import { Camera } from '../src/rendering/Camera.js';

const source=readBiomeSource();
const trees=['oak','oakHollow','leaningOak','birch','twistedTree','cypress','brokenCypress'];
test('every supporting tree fork shares its parent origin and tapers toward its tip',()=>{
  for(const id of trees) {
    const branches=source.sprites[id].woodStructure;
    assert.ok(branches.length>=3);
    const seen=new Map();
    for(const branch of branches) {
      if(branch.parent) {
        const parent=seen.get(branch.parent);assert.ok(parent);
        assert.deepEqual(branch.points[0],curve(parent.points,branch.at));
        assert.ok(branch.radii[0]<=parent.radii[0]*(1-branch.at)+parent.radii[1]*branch.at);
        if(!branch.id.startsWith('root'))assert.ok(branch.points.at(-1)[1]<branch.points[0][1]);
      }
      assert.ok(branch.radii[0]>branch.radii[1]);seen.set(branch.id,branch);
    }
  }
});

test('wood is one union surface regardless of the order in which limbs are authored',()=>{
  const strokes=[{id:'stem',points:[[25,58],[24,38],[26,22],[27,5]],radii:[6,1]},
    {id:'left',points:[[25,30],[18,27],[12,19],[9,11]],radii:[3,1]}];
  const a=raster(64,64),b=raster(64,64);
  woodSurface(a,strokes,3);woodSurface(b,[...strokes].reverse(),3);
  assert.deepEqual(a.grid,b.grid);
  assert.ok(a.grid.flat().filter(token=>token!=='.').length>300);
});

test('asset validation rejects disconnected, oversized, inverted or invalid fork plans',()=>{
  for(const edit of [
    s=>{s.woodStructure[1].points[0][0]+=10;},
    s=>{s.woodStructure[1].radii[0]=90;},
    s=>{s.woodStructure[1].parent='missing';},
    s=>{delete s.woodStructure[1].parent;},
    s=>{s.woodStructure[1].parent='';},
    s=>{s.woodStructure[1].points[3][1]=190;},
    s=>{s.woodStructure[1].radii[1]=-1;},
    s=>{s.woodStructure[1].points[0][0]=NaN;},
    s=>{s.woodStructure[1].id='stem';},
    s=>{s.woodStructure=[];},
  ]) {const copy=structuredClone(source);edit(copy.sprites.oak);assert.throws(()=>validateBiome(copy));}
});

test('atmospheric perspective lightens distant dark materials without washing the foreground',()=>{
  const luma=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).reduce((a,b)=>a+b,0);
  for(const phase of ['DAY','EVENING','NIGHT']) {
    const palettes=['near','middle','far'].map(depth=>biomePalette(source,phase,depth));
    assert.ok(luma(palettes[0].d)<luma(palettes[1].d));assert.ok(luma(palettes[1].d)<luma(palettes[2].d));
    assert.deepEqual(palettes[0],source.palettes[phase].colors);
    const horizon=biomePalette(source,phase,'far',source.sprites.forestBackdrop);
    assert.ok(luma(horizon.d)>luma(palettes[2].d));
  }
  for(const value of [-1,NaN,Infinity,.3]) {const copy=structuredClone(source);copy.sprites.forestBackdrop.haze=value;assert.throws(()=>validateBiome(copy));}
});

test('mist has feathered zero-alpha borders and bounded stepped native density',()=>{
  for(const [width,height] of [[196,64],[176,48]])for(let seed=0;seed<3;seed++) {
    let filled=0;
    for(let y=0;y<height;y++)for(let x=0;x<width;x++) {
      const alpha=mistPixelAlpha(x,y,width,height,seed);
      assert.ok(alpha>=0&&alpha<=.18);
      assert.ok(Math.abs(alpha/.02-Math.round(alpha/.02))<1e-8);
      if(x===0||y===0||x===width-1||y===height-1)assert.equal(alpha,0);
      if(alpha>0)filled++;
    }
    assert.ok(filled>width*height*.2&&filled<width*height*.75);
  }
});

test('mist seeds belong to repeated world banks rather than changing with screen position',()=>{
  const camera=new Camera(275);camera.resize(384,216);
  for(const plane of ['far','middle']) {
    const a=mistBands(camera,2,plane),b=mistBands({...camera,x:camera.x+1},2,plane);
    assert.deepEqual(a.map(p=>p.seed),b.map(p=>p.seed));
    for(const band of a)assert.ok(band.y+band.height<camera.ground-20);
    assert.ok(mistSpeed(plane)>0&&mistSpeed(plane)<1);
    assert.ok(a.every((patch,i)=>i===0||patch.x>a[i-1].x+a[i-1].width),'patches leave open air between them');
  }
});

test('mist samples interpolate alpha once and join exactly at each integer movement boundary',()=>{
  for(const [a,b]of [[0,46],[21,31],[46,0],[46,46]])for(const amount of [.38,.22]) {
    assert.equal(mistBlendAlpha(a,b,0,amount),Math.round(a*amount));
    assert.equal(mistBlendAlpha(a,b,1,amount),Math.round(b*amount));
    let previous=mistBlendAlpha(a,b,0,amount);
    for(let frame=1;frame<=120;frame++) {
      const next=mistBlendAlpha(a,b,frame/120,amount);
      assert.ok(Math.abs(next-previous)<=1);previous=next;
    }
    if(a===b)for(const mix of [.1,.4,.8])assert.equal(mistBlendAlpha(a,b,mix,amount),Math.round(a*amount));
  }
});

test('the two framing trunks remain outside the central character space in the master composition',()=>{
  const camera=new Camera(275);camera.resize(384,216);
  const layer=source.layers.find(l=>l.id==='near-wood'),miga=camera.toScreen(275).x;
  for(const id of ['oak','oakHollow']) {
    const p=layer.placements.find(p=>p.sprite===id),s=source.sprites[id],point=sceneryPosition(camera,layer,p);
    const stemX=s.woodStructure[0].points[0][0];
    const x=point.x+(p.mirror?s.anchor[0]-stemX:stemX-s.anchor[0]);
    assert.ok(Math.abs(x-miga)>140);
  }
});

test('the near cypress leaves both chapel lancets uncovered at the default camera',()=>{
  const camera=new Camera(275);camera.resize(384,216);
  const architecture=source.layers.find(l=>l.id==='architecture'),middle=source.layers.find(l=>l.id==='middle-wood');
  const church=sceneryPosition(camera,architecture,architecture.placements[0]);
  const tree=sceneryPosition(camera,middle,middle.placements.find(p=>p.sprite==='cypress'));
  assert.ok(tree.x+32<church.x-6);
});

test('foreground undergrowth starts below the walking surface and cannot cover Miga or touch targets',()=>{
  const layer=source.layers.find(l=>l.id==='undergrowth');assert.equal(layer.parallax,1);
  for(const [width,height]of [[384,216],[192,304],[384,108]]) {
    const camera=new Camera(275);camera.resize(width,height);
    for(const p of layer.placements) {
      const sprite=source.sprites[p.sprite],point=sceneryPosition(camera,layer,p);
      assert.ok(point.y-sprite.anchor[1]>camera.ground+10);
    }
  }
});

test('sun and moon are separate native assets with stable floor anchors rather than scaled sprites',()=>{
  assert.deepEqual(source.sprites.sun.size,[24,24]);assert.deepEqual(source.sprites.sun.anchor,[12,23]);
  assert.deepEqual(source.sprites.moon.size,[32,32]);assert.deepEqual(source.sprites.moon.anchor,[16,31]);
  for(const id of ['sun','moon'])assert.ok(source.assetFiles.some(a=>a.id===id&&a.path.startsWith('sky/')));
});
