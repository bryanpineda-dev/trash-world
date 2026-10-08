import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { assembleBiome, validateBiome, biomePalette, biomePixels, biomeVariants, sceneryFrameAt, sceneryFrameId,
  BIOME_DEPTHS, sceneryPosition, visibleScenery, mistBands, fireflyPoints } from '../src/rendering/BiomeModel.js';
import { compileCatalog, pixelBounds } from '../src/rendering/AssetModel.js';
import { readAssetSource } from '../scripts/asset-source.js';
import { readBiomeSource } from '../scripts/biome-source.js';
import { createBitmap, paintPixels } from '../scripts/png.js';
import { Camera } from '../src/rendering/Camera.js';
import { World } from '../src/world/World.js';

const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const source = readBiomeSource();
const atlas = read('../assets/generated/biome.json');

test('material refinements preserve untouched prop silhouettes and all anchors and animation timelines', () => {
  const catalog = compileCatalog(readAssetSource());
  const geometry = { objects:catalog.objects, frames:Object.fromEntries(
    Object.entries(catalog.frames).filter(([id])=>id.startsWith('object:')&&!id.startsWith('object:lantern:')).map(([id,frame])=>
      [id,{...frame,pixels:frame.pixels.map(row=>row.replace(/[^.]/g,'x'))}])) };
  assert.equal(createHash('sha256').update(JSON.stringify(geometry)).digest('hex'),
    '079177fb22ba9f2ae293d38060c72f4c239705b9d6e13bcdcd5d8eec8420e120');
  for(const [id,frame] of Object.entries(catalog.frames)) if(id.startsWith('object:')) {
    assert.ok(frame.pixels.every(row=>!row.includes('k')),id+': universal dark contour');
  }
});

function componentSizes(pixels) {
  const width=pixels[0].length, remaining=new Set();
  pixels.forEach((row,y)=>[...row].forEach((pixel,x)=>{ if(pixel!=='.') remaining.add(y*width+x); }));
  const sizes=[];
  while(remaining.size) {
    const pending=[remaining.values().next().value]; let size=0;
    while(pending.length) {
      const item=pending.pop();
      if(!remaining.delete(item)) continue;
      size++;
      const x=item%width, y=Math.floor(item/width);
      for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++) {
        if(x+dx<0||x+dx>=width||y+dy<0||y+dy>=pixels.length) continue;
        const neighbor=(y+dy)*width+x+dx;
        if(remaining.has(neighbor)) pending.push(neighbor);
      }
    }
    sizes.push(size);
  }
  return sizes.sort((a,b)=>b-a);
}

test('the redesigned lantern retains world scale, connected metalwork and flame-only animation', () => {
  const art=readAssetSource(), catalog=compileCatalog(art);
  assert.deepEqual(art.parts.lantern.size,[24,40]);
  assert.deepEqual(art.characters.objects.lantern.anchor,[12,39]);
  assert.deepEqual(art.characters.objects.lantern.frames,[['rest',480],['flicker',180]]);
  assert.equal(art.characters.objects.lantern.loop,true);
  const frames=['rest','flicker'].map(id=>catalog.frames['object:lantern:'+id]);
  let changed=0;
  for(const frame of frames) {
    assert.equal(frame.bounds.height,38);
    assert.equal(frame.bounds.y+frame.bounds.height,39);
    assert.ok(frame.bounds.x>=3&&frame.bounds.x+frame.bounds.width<=21);
    assert.equal(frame.pixels.at(-1),'.'.repeat(24));
    assert.equal(componentSizes(frame.pixels).length,1);
  }
  frames[0].pixels.forEach((row,y)=>[...row].forEach((pixel,x)=>{
    const other=frames[1].pixels[y][x];
    assert.equal(pixel==='.',other==='.','flicker must not move the silhouette');
    if(pixel!==other) {
      changed++;
      assert.ok(x>=9&&x<=13&&y>=19&&y<=26,'only the inner flame changes');
      assert.match(pixel,/[fh]/); assert.match(other,/[fh]/);
    }
  }));
  assert.ok(changed>0);
});

test('weathered ruin preserves two grounded masonry sections without detached texture pixels', () => {
  const sprite=source.sprites.ruins;
  assert.deepEqual(sprite.size,[112,80]); assert.deepEqual(sprite.anchor,[56,79]);
  const components=componentSizes(sprite.pixels);
  assert.equal(components.length,2);
  assert.ok(components.every(size=>size>500));
  for(const token of ['A','B','C','z','g','i','j']) assert.ok(sprite.pixels.some(row=>row.includes(token)),token);
  assert.ok(sprite.pixels.slice(24,69).every(row=>row.slice(44,73)==='.'.repeat(29)), 'the open arch remains transparent');
});

test('the cemetery library uses material tones, not a universal dark outline', () => {
  assert.deepEqual(Object.keys(source.sprites).sort(), ['oak','birch','distantOak','twistedTree','cypress',
    'ruins','shrub','fern','mushrooms','flowers','rocks','pointedGrave','wornGrave','ringCross','fence','moon',
    'church','groundA','groundB','groundC','oakHollow','leaningOak','brokenCypress','roundedGrave','brokenGrave',
    'berryLow','berryTall','berryArch'].sort());
  for(const sprite of Object.values(source.sprites)) assert.ok(sprite.pixels.every(row=>!row.includes('k')),sprite.label);
  assert.equal(source.sprites.ringCross.pixels[30][23],'.','ring apertures show the scenery behind');
  assert.ok(source.sprites.pointedGrave.pixels.some(row=>row.includes('C')&&row.includes('A')));
});

test('adult forest trees are drawn at native scale and scenery uses fixed grounded anchors', () => {
  assert.equal(validateBiome(source), true);
  assert.equal(Object.keys(source.sprites).length, 28);
  const adult = pixelBounds(source.sprites.oak.pixels);
  assert.ok(adult.height / 56 >= 3 && adult.height / 56 <= 3.5);
  assert.ok(pixelBounds(source.sprites.birch.pixels).height / 56 > 2.4);
  for (const sprite of Object.values(source.sprites)) {
    const bounds = pixelBounds(sprite.pixels);
    assert.equal(bounds.y + bounds.height, sprite.anchor[1], sprite.label + ': floor contact');
    assert.equal(sprite.pixels.at(-1), '.'.repeat(sprite.size[0]));
  }
});

test('environment ramps have 32 consistent tokens without expanding the approved character palette', () => {
  assert.equal(Object.keys(readAssetSource().style.colors).length,16);
  for (const phase of ['DAY','EVENING','NIGHT']) {
    for (const depth of Object.keys(BIOME_DEPTHS)) {
      const palette = biomePalette(source, phase, depth);
      assert.equal(Object.keys(palette).length, 32);
      assert.ok(Object.values(palette).every(color => /^#[\da-f]{6}$/i.test(color)));
    }
    assert.deepEqual(biomePalette(source, phase, 'near'), source.palettes[phase].colors);
    assert.notDeepEqual(biomePalette(source, phase, 'far'), source.palettes[phase].colors);
  }
});

test('every generated scenery pixel agrees with its phase, depth and editable source', () => {
  const png = readFileSync(new URL('../assets/generated/biome.png', import.meta.url));
  const compressed = [];
  for (let offset = 8; offset < png.length;) {
    const length = png.readUInt32BE(offset), kind = png.toString('ascii', offset + 4, offset + 8);
    if (kind === 'IHDR') {
      assert.equal(png.readUInt32BE(offset + 8), atlas.width);
      assert.equal(png.readUInt32BE(offset + 12), atlas.height);
    }
    if (kind === 'IDAT') compressed.push(png.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  const raw = inflateSync(Buffer.concat(compressed));
  const stride = atlas.width * 4 + 1;
  assert.equal(raw.length, stride * atlas.height);
  assert.equal(Object.keys(atlas.frames).length, Object.values(source.sprites).reduce((sum,sprite)=>sum+biomeVariants(sprite).length*9,0));
  assert.ok(atlas.width<=4096&&atlas.height<=4096,'atlas fits a compact native canvas');
  for (const [id, frame] of Object.entries(atlas.frames)) {
    const [phase, depth, name, variant = 'rest'] = id.split(':');
    const sprite = source.sprites[name];
    assert.deepEqual([frame.width, frame.height], sprite.size);
    assert.deepEqual(frame.anchor, sprite.anchor);
    const expected = createBitmap(frame.width, frame.height);
    paintPixels(expected, biomePixels(sprite,variant), biomePalette(source, phase, depth), 0, 0);
    for (let y = 0; y < frame.height; y++) {
      assert.equal(raw[(frame.y + y) * stride], 0);
      const start = (frame.y + y) * stride + 1 + frame.x * 4;
      assert.deepEqual(raw.subarray(start, start + frame.width * 4),
        Buffer.from(expected.data.subarray(y * frame.width * 4, (y + 1) * frame.width * 4)), id + ': row ' + y);
    }
  }
});

test('parallax moves scenery less than the walking plane and only returns visible native sprites', () => {
  const camera = new Camera(280);
  camera.resize(384, 216);
  for (const layer of source.layers) {
    const placement = layer.placements[0];
    const a = sceneryPosition(camera, layer, placement);
    const b = sceneryPosition({ ...camera, x: camera.x + 100 }, layer, placement);
    assert.ok(Math.abs(a.x - b.x - 100 * layer.parallax) <= 1);
    assert.equal(a.y, camera.ground + placement.at[1]);
    for (const item of visibleScenery(source, camera, layer)) {
      assert.ok(Number.isInteger(item.x) && Number.isInteger(item.y));
      const sprite = source.sprites[item.sprite];
      const left = item.mirror ? item.x + sprite.anchor[0] - sprite.size[0] : item.x - sprite.anchor[0];
      assert.ok(left < camera.width && left + sprite.size[0] > 0);
    }
  }
});

test('the forest covers mobile and desktop at both camera limits without changing world interactions', () => {
  const world = new World({ discoveredObjects: ['can','tree'] });
  const saved = world.serialize();
  for (const [width,height] of [[192,432],[384,216],[384,108]]) {
    for (const x of [32,205,280,458,528]) {
      const camera = new Camera(x);
      camera.resize(width,height);
      assert.ok(camera.ground <= height - 32);
      assert.ok(camera.ground >= 56);
      for (const layer of source.layers.filter(layer=>layer.id!=='architecture')) assert.ok(visibleScenery(source,camera,layer).length > 0, layer.id);
    }
  }
  assert.equal(world.objects.length,3);
  assert.equal(world.objectAt(280,-100),null);
  assert.deepEqual(world.serialize(),saved);
});

test('tree silhouettes have no detached foliage or floating roots in any wind frame', () => {
  for (const {id,path} of source.assetFiles.filter(asset=>asset.path.startsWith('trees/'))) for(const variant of biomeVariants(source.sprites[id])) {
    const sprite = source.sprites[id], width = sprite.size[0];
    const filled = new Set();
    biomePixels(sprite,variant).forEach((row,y)=>[...row].forEach((pixel,x)=>{ if (pixel !== '.') filled.add(y * width + x); }));
    const pending = [[...filled][0]], reached = new Set();
    while (pending.length) {
      const item = pending.pop();
      if (reached.has(item)) continue;
      reached.add(item);
      const x = item % width, y = Math.floor(item / width);
      for (let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++) {
        if(x+dx<0||x+dx>=width||y+dy<0||y+dy>=sprite.size[1]) continue;
        const neighbor = (y+dy)*width+x+dx;
        if(filled.has(neighbor)&&!reached.has(neighbor)) pending.push(neighbor);
      }
    }
    assert.equal(reached.size,filled.size,id+'/'+variant);
  }
});

test('fireflies use deterministic native pixels, stay behind Miga and stop with ambient time', () => {
  for(const [width,height] of [[192,432],[384,216]]) {
    const camera = new Camera(275);
    camera.resize(width,height);
    const points = fireflyPoints(camera,0);
    assert.deepEqual(fireflyPoints(camera,0),points);
    assert.notDeepEqual(fireflyPoints(camera,10),points);
    assert.ok(points.length > 0 && points.length <= 8);
    for(const point of fireflyPoints(camera,10)) {
      assert.ok(Number.isInteger(point.x)&&Number.isInteger(point.y));
      assert.ok(point.x>=0&&point.x<width);
      assert.ok(point.y<camera.ground-20);
    }
  }
});

test('low mist drifts in integer pixels behind Miga and stops with ambient time', () => {
  const camera = new Camera(275);
  camera.resize(384,216);
  for(const plane of ['far','middle']) {
    const initial = mistBands(camera,0,plane);
    assert.deepEqual(mistBands(camera,0,plane),initial);
    assert.notDeepEqual(mistBands(camera,10,plane),initial);
    for(const band of mistBands(camera,10,plane)) {
      assert.ok(Object.values(band).every(Number.isInteger));
      assert.ok(band.y + band.height < camera.ground - 20);
    }
  }
});

test('biome validation rejects corrupt dimensions, off-palette pixels and invalid scene placements', () => {
  for (const corrupt of [
    data => { data.sprites.oak.size[0]=193; },
    data => { data.sprites.oak.pixels[0]='?'+data.sprites.oak.pixels[0].slice(1); },
    data => { data.sprites.oak.anchor[1]=193; },
    data => { data.layers[0].parallax=-1; },
    data => { data.layers[0].placements[0].at[0]=0.5; },
    data => { data.layers[0].placements[0].sprite='missing'; },
    data => { data.layers[0].depth='constructor'; },
    data => { delete data.palettes.NIGHT; },
  ]) {
    const data = structuredClone(source);
    corrupt(data);
    assert.throws(()=>validateBiome(data));
  }
});

test('the folder index validates every path before loading and rejects missing, duplicate or mismatched assets', () => {
  const index = read('../assets/source/biome.json');
  const original = structuredClone(index);
  const load = path=>read('../assets/source/environment/'+path);
  assert.deepEqual(assembleBiome(index,load),source);
  assert.deepEqual(index,original);
  for (const path of ['../parts.json','trees/../../parts.json','C:/secret.json','/secret.json','trees\\oak.json']) {
    const corrupt=structuredClone(index); corrupt.assetFiles.at(-1).path=path;
    let reads=0;
    assert.throws(()=>assembleBiome(corrupt,()=>{reads++;}),/path/);
    assert.equal(reads,0);
  }
  for (const edit of [
    data=>{ data.assetFiles.push(data.assetFiles[0]); },
    data=>{ data.assetFiles[1].path=data.assetFiles[0].path; },
    data=>{ data.assetFiles[0].id='constructor'; },
  ]) {
    const corrupt=structuredClone(index); edit(corrupt);
    assert.throws(()=>assembleBiome(corrupt,load));
  }
  assert.throws(()=>assembleBiome(index,()=>undefined),/missing/);
  assert.throws(()=>assembleBiome(index,path=>({...load(path),id:'other'})),/mismatched/);
});

test('the chapel uses a distant plane, has warm glass and is framed left of Miga at the default position', () => {
  const layer=source.layers.find(layer=>layer.id==='architecture');
  assert.equal(layer.depth,'far');
  assert.ok(layer.parallax<source.layers.find(layer=>layer.id==='middle-wood').parallax);
  assert.ok(source.sprites.church.pixels.some(row=>row.includes('D')));
  for (const [width,height] of [[192,432],[384,216]]) {
    const camera=new Camera(275); camera.resize(width,height);
    const chapel=visibleScenery(source,camera,layer).find(item=>item.sprite==='church');
    assert.ok(chapel);
    assert.ok(chapel.x<camera.toScreen(275).x);
    assert.ok(chapel.y<camera.ground);
  }
});

test('terrain variations share opaque side seams and preserve a flat walking anchor', () => {
  const tiles=['groundA','groundB','groundC'].map(id=>source.sprites[id]);
  for (const tile of tiles) {
    assert.deepEqual(tile.size,[64,32]); assert.deepEqual(tile.anchor,[32,31]);
    assert.ok(tile.pixels.slice(0,31).every(row=>!row.includes('.')));
    for (let y=0;y<31;y++) for (const neighbor of tiles) assert.equal(tile.pixels[y][63],neighbor.pixels[y][0]);
  }
  assert.equal(new Set(tiles.map(tile=>tile.pixels.join(''))).size,3);
});

test('every per-asset PNG export matches each editable animation frame in all three lights', () => {
  for (const {id,path} of source.assetFiles) for (const phase of Object.keys(source.palettes)) for(const variant of biomeVariants(source.sprites[id])) {
    const filename=phase.toLowerCase()+(variant==='rest'?'':'-'+variant)+'.png';
    const png=readFileSync(new URL('../assets/generated/environment/'+path.replace(/\.json$/,'/'+filename),import.meta.url));
    const chunks=[];
    for (let offset=8;offset<png.length;) {
      const length=png.readUInt32BE(offset);
      if (png.toString('ascii',offset+4,offset+8)==='IDAT') chunks.push(png.subarray(offset+8,offset+8+length));
      offset+=length+12;
    }
    const sprite=source.sprites[id], expected=createBitmap(...sprite.size);
    paintPixels(expected,biomePixels(sprite,variant),biomePalette(source,phase,'near'),0,0);
    const raw=inflateSync(Buffer.concat(chunks)),stride=sprite.size[0]*4+1;
    assert.equal(raw.length,stride*sprite.size[1]);
    for (let y=0;y<sprite.size[1];y++) {
      assert.equal(raw[y*stride],0);
      assert.deepEqual(raw.subarray(y*stride+1,(y+1)*stride),Buffer.from(expected.data.subarray(y*(stride-1),(y+1)*(stride-1))));
    }
  }
});

test('localized ambient clips preserve anchors, ground contact and nonmoving materials', () => {
  for(const sprite of Object.values(source.sprites).filter(s=>s.animation)) {
    let changes=0;
    for(const variant of biomeVariants(sprite)) {
      const rows=biomePixels(sprite,variant);
      assert.equal(pixelBounds(rows).y+pixelBounds(rows).height,sprite.anchor[1],sprite.id);
      rows.forEach((row,y)=>[...row].forEach((pixel,x)=>{
        const base=sprite.pixels[y][x];
        if(pixel===base)return;
        changes++;
        assert.ok(sprite.animation.regions.some(([a,b,w,h])=>x>=a&&x<a+w&&y>=b&&y<b+h));
        if(sprite.id==='church') {
          assert.ok('Df'.includes(base)&&'Dfo'.includes(pixel),'only lit glass can flicker');
        } else {
          assert.ok('.digjmnq'.includes(base)&&'.digjmnq'.includes(pixel),'bark and roots stay still');
        }
      }));
    }
    assert.ok(changes>0,sprite.id+': visible ambient animation');
  }
});

test('ambient timeline selection reuses shared looping clips with deterministic independent phases', () => {
  const tree=source.sprites.oak;
  assert.equal(sceneryFrameAt(tree,0),'rest');
  assert.equal(sceneryFrameAt(tree,0.8),'right');
  assert.equal(sceneryFrameAt(tree,1.2),'drift');
  assert.equal(sceneryFrameAt(tree,1.6),'left');
  assert.equal(sceneryFrameAt(tree,3.3),'rest');
  assert.equal(sceneryFrameAt(tree,1.1,0.7),sceneryFrameAt(tree,1.8));
  assert.equal(sceneryFrameAt(source.sprites.groundA,900),'rest');
  assert.equal(sceneryFrameId('oak','NIGHT','near','rest'),'NIGHT:near:oak');
  assert.equal(sceneryFrameId('oak','NIGHT','near','left'),'NIGHT:near:oak:left');
  for(const layer of source.layers)for(const p of layer.placements)if(source.sprites[p.sprite].animation) {
    assert.ok(Number.isFinite(p.animationOffset));
    assert.equal(sceneryFrameAt(source.sprites[p.sprite],4,p.animationOffset),sceneryFrameAt(source.sprites[p.sprite],4,p.animationOffset));
  }
  assert.ok(new Set(source.layers.flatMap(layer=>layer.placements.map(p=>p.animationOffset)).filter(Number.isFinite)).size>2);
});

test('animation validation rejects unknown frames, damaged patches and moving static regions', () => {
  for(const edit of [
    data=>{data.sprites.oak.animation.frames[0].id='missing';},
    data=>{data.sprites.oak.animation.frames[0].duration=0;},
    data=>{data.sprites.oak.variants.right[0].at[0]=-1;},
    data=>{data.sprites.oak.variants.right[0].pixels[0]='?';},
    data=>{data.sprites.oak.animation.regions=[[0,0,1,1]];},
    data=>{data.sprites.oak.animation.regions=[[0,180,176,12]];},
    data=>{data.layers[0].placements[0].animationOffset=NaN;},
  ]) {const corrupt=structuredClone(source);edit(corrupt);assert.throws(()=>validateBiome(corrupt));}
});

test('berry and gravestone variants provide different silhouettes without sprite scaling', () => {
  for(const ids of [['berryLow','berryTall','berryArch'],['pointedGrave','wornGrave','roundedGrave','brokenGrave']]) {
    const masks=ids.map(id=>source.sprites[id].pixels.map(row=>row.replace(/[^.]/g,'x')).join(''));
    assert.equal(new Set(masks).size,ids.length);
    for(const id of ids)assert.ok(source.layers.some(layer=>layer.placements.some(p=>p.sprite===id)),id+': used in scene');
  }
});
