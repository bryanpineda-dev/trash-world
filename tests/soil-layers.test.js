import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Camera} from '../src/rendering/Camera.js';
import {soilLayers,soilTiles,additionalGraves,cemeteryParallax} from '../src/rendering/ReferenceLayout.js';
import {drawReferenceScene,referencePlacements,shadeReferencePixels} from '../src/rendering/ReferenceScene.js';
const manifest=JSON.parse(readFileSync(new URL('../assets/reference-biome/manifest.json',import.meta.url)));
const items=new Map(manifest.sprites.map(a=>[a.id,a]));

test('soil materials are independent terrain assets and preserve the approved walking surface',()=>{
  for(const layer of soilLayers){const a=items.get(layer.id);assert.equal(a.family,'terrain');assert.equal(a.size[0],560);}
  assert.deepEqual(items.get('ground').anchor,[0,12]);
  assert.equal(items.get('ground').sha256,'c1fdbbdc4925afbb24043a3106c35acfffaed5170c5efa4e9f5bc9d2d94e4d9f');
});

test('buried material is quieter than the surface in every daylight grade without changing alpha',()=>{
  for(const phase of ['DAY','NIGHT','DAWN','DUSK','GOLDEN']){
    const buried=shadeReferencePixels([85,75,65,255],'earthFace',1,1,phase),surface=shadeReferencePixels([85,75,65,255],'ground',1,1,phase);
    assert.equal(buried[3],255);for(let c=0;c<3;c++)assert.ok(buried[c]<surface[c]);
  }
});

test('both soil planes cover every horizontal seam including negative world coordinates',()=>{
  for(const width of [288,712,1680,2048])for(const x of [-528,-280,280,840,1088])for(const layer of soilLayers){
    const camera=new Camera(x);camera.resize(width,401);const a=items.get(layer.id),tiles=soilTiles(camera,layer,a),row=tiles.filter(t=>t.y===tiles[0].y);
    assert.ok(row[0].x<=0);assert.ok(row.at(-1).x+a.size[0]>=width);
    for(let i=1;i<row.length;i++){assert.equal(row[i].x-row[i-1].x,a.size[0]);assert.notEqual(row[i].flipped,row[i-1].flipped);}
  }
});

test('underground fills tall views without stretching the texture or attaching it to the viewport bottom',()=>{
  const layer=soilLayers.find(a=>a.id==='earthFace'),a=items.get(layer.id);
  for(const height of [214,401,648,1600]){
    const camera=new Camera(280);camera.resize(712,height);const tiles=soilTiles(camera,layer,a),rows=[...new Set(tiles.map(t=>t.y))];
    assert.equal(rows[0],camera.ground+20);assert.ok(rows.at(-1)+a.size[1]>=height);
    for(let i=1;i<rows.length;i++)assert.equal(rows[i]-rows[i-1],a.size[1]);
  }
});

test('soil parallax follows one snapped camera with no time smoothing',()=>{
  const camera=new Camera(280);camera.resize(712,401);
  for(const layer of soilLayers){const a=items.get(layer.id),before=soilTiles(camera,layer,a);camera.x+=10;const after=soilTiles(camera,layer,a);camera.x-=10;assert.ok(Math.abs(before[0].x-after[0].x-10*layer.parallax)<=1);assert.deepEqual(soilTiles(camera,layer,a),before);}
});

test('grave infill uses unique silhouettes in continuous world coordinates',()=>{
  assert.ok(additionalGraves.some(p=>p.x<0));assert.ok(additionalGraves.some(p=>p.x>560));assert.ok(additionalGraves.some(p=>p.x>=0&&p.x<=560));
  assert.equal(new Set(referencePlacements.filter(p=>p.row).map(p=>p.id)).size,12);
  for(const p of additionalGraves){assert.ok(p.offset<=-14);assert.equal(p.row,'back');assert.equal(p.parallax,cemeteryParallax);}
});

test('no fern is drawn under the path while existing surface plants remain',()=>{
  const camera=new Camera(280);camera.resize(1680,401);const calls=[];
  const ctx={globalAlpha:1,createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),fillRect(){},save(){},restore(){},translate(){},scale(){},drawImage(s,x,y,w,h){calls.push({id:s.id,y,h});}};
  drawReferenceScene(ctx,camera,12,0,id=>{const a=items.get(id);return a?{...a,surface:{id}}:null;});
  const plants=calls.filter(c=>c.id==='undergrowth');assert.ok(plants.length>0);
  assert.ok(plants.every(p=>p.y+p.h<=camera.ground+2));
});

test('earth and leaf litter sit behind grave feet while underground stays behind the unchanged path',()=>{
  const camera=new Camera(280);camera.resize(1680,401);const calls=[];
  const ctx={globalAlpha:1,createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),fillRect(){},save(){},restore(){},translate(){},scale(){},drawImage(s){calls.push(s.id);}};
  drawReferenceScene(ctx,camera,12,0,id=>{const a=items.get(id);return a?{...a,surface:{id}}:null;});
  const at=id=>calls.indexOf(id);assert.ok(at('uniqueForestMiddle')<at('cemeterySoil'));assert.ok(at('cemeterySoil')<at('fence'));assert.ok(at('cemeterySoil')<at('crosses-back-1'));assert.ok(at('earthFace')<at('ground'));assert.ok(at('ground')<at('crosses-front-1'));
  assert.equal(referencePlacements.filter(p=>p.row).length,12);
});
