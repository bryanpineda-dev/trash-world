import test from 'node:test';
import assert from 'node:assert/strict';
import { Camera } from '../src/rendering/Camera.js';
import { readBiomeSource } from '../scripts/biome-source.js';
import { biomePixels, biomeVariants, biomePalette, sceneryBlendAt, sceneryPosition, candleIntensity, validateBiome } from '../src/rendering/BiomeModel.js';

const source = readBiomeSource();

test('camera follow settles promptly, is frame-rate independent and pauses without drift', () => {
  const cameras = [30,60,120].map(fps => {
    const camera = new Camera(250); camera.resize(192,304);
    for(let i=0;i<fps/2;i++)camera.update(310,1/fps);
    assert.ok(Math.abs(camera.x-310)<1.2,'less than 1.2px of residual lag after half a second');
    const stopped = camera.x;
    camera.update(400,0);camera.update(400,-1);
    assert.equal(camera.x,stopped);
    return camera;
  });
  for(const camera of cameras)assert.ok(Math.abs(camera.x-cameras[0].x)<1e-9);
});

test('terrain, touch projection and all parallax planes share one snapped camera origin', () => {
  const camera=new Camera(275.49);camera.resize(192,304);
  const bounds={left:10,top:20,width:384,height:608};
  for(const x of [275.49,275.51,276.2,276.49]) {
    camera.x=x;
    const screen=camera.toScreen(320);
    assert.equal(screen.x,320-camera.left);
    assert.equal(camera.fromClient(bounds.left+screen.x*2,bounds.top+screen.y*2,bounds).x,320);
    const walkLayer={parallax:1,period:560};
    assert.equal(sceneryPosition(camera,walkLayer,{at:[320,0]}).x,screen.x);
    for(const layer of source.layers)assert.deepEqual(sceneryPosition(camera,layer,layer.placements[0]),
      sceneryPosition({...camera,x:camera.pixelX},layer,layer.placements[0]));
  }
});

test('wind keeps the full silhouette and supporting wood fixed while changing few leaf pixels', () => {
  for(const sprite of Object.values(source.sprites).filter(sprite=>sprite.animation)) {
    assert.equal(sprite.animation.blend,'palette');
    const opaque=sprite.pixels.join('').replaceAll('.','').length;
    for(const variant of biomeVariants(sprite)) {
      let changed=0;
      biomePixels(sprite,variant).forEach((row,y)=>[...row].forEach((token,x)=>{
        const base=sprite.pixels[y][x];
        assert.equal(token==='.',base==='.',sprite.id+': silhouette');
        if(base===token)return;
        changed++;
        assert.match(base,/[digjmnq]/);assert.match(token,/[digjmnq]/);
      }));
      assert.ok(changed/opaque<.025,sprite.id+': restrained wind');
    }
  }
  assert.equal(source.sprites.twistedTree.animation,undefined,'bare supporting wood stays still');
  assert.ok(source.sprites.distantOak.pixels.every(row=>row[0]==='.'&&row.at(-1)==='.'),'distant canopy is not cut at either edge');
});

test('palette wind transitions are continuous through every frame and loop boundary', () => {
  const palette=biomePalette(source,'NIGHT','near');
  const rgb=token=>[1,3,5].map(i=>parseInt(palette[token].slice(i,i+2),16));
  for(const sprite of Object.values(source.sprites).filter(sprite=>sprite.animation)) {
    const value=time=>{
      const sample=sceneryBlendAt(sprite,time);
      assert.ok(sample.mix>=-1e-9&&sample.mix<=1+1e-9);
      const a=biomePixels(sprite,sample.from),b=biomePixels(sprite,sample.to);
      return a.flatMap((row,y)=>[...row].flatMap((token,x)=>token==='.'?[]:rgb(token).map((channel,i)=>channel*(1-sample.mix)+rgb(b[y][x])[i]*sample.mix)));
    };
    let seconds=0;
    for(const frame of sprite.animation.frames) {
      seconds+=frame.duration/1000;
      const before=value(seconds-1e-5),after=value(seconds+1e-5);
      for(let i=0;i<before.length;i++)assert.ok(Math.abs(before[i]-after[i])<.001,sprite.id+': no cut at '+seconds);
    }
  }
});

test('chapel glass remains warm and uses a bounded continuous light, never switched frames', () => {
  const chapel=source.sprites.church;
  assert.equal(chapel.animation,undefined);assert.equal(chapel.variants,undefined);
  assert.deepEqual(chapel.candle,{tokens:['D'],color:'f',amount:.1});
  let previous=candleIntensity(0),minimum=1,maximum=0;
  for(let frame=1;frame<=60*30;frame++) {
    const value=candleIntensity(frame/60);
    minimum=Math.min(minimum,value);maximum=Math.max(maximum,value);
    assert.ok(Math.abs(value-previous)<.006,'no switch-like jumps at 60fps');previous=value;
  }
  assert.ok(minimum>=.3&&maximum<=.8);assert.ok(maximum-minimum>.1);
  const colors=biomePalette(source,'NIGHT','far');
  assert.ok(parseInt(colors.D.slice(1,3),16)>parseInt(colors.D.slice(5,7),16),'warm base glass remains visible');
});

test('chapel roof, tower, cross and ground contact have a coherent symmetric silhouette', () => {
  const chapel=source.sprites.church;
  assert.deepEqual(chapel.size,[80,112]);assert.deepEqual(chapel.anchor,[40,111]);
  for(let y=0;y<112;y++)for(let x=1;x<80;x++)assert.equal(chapel.pixels[y][x]==='.',chapel.pixels[y][80-x]==='.',`silhouette ${x},${y}`);
  assert.equal(chapel.pixels[110][40],'z');
  assert.equal(chapel.pixels[69][34],'D');assert.equal(chapel.pixels[69][46],'D');
});

test('ambient validation rejects silhouette-changing blends and unsafe light declarations', () => {
  for(const edit of [
    data=>{data.sprites.church.candle.amount=.9;},
    data=>{data.sprites.church.candle.tokens=['?'];},
    data=>{data.sprites.church.candle.color='?';},
    data=>{data.sprites.oak.animation.blend='position';},
    data=>{const patch=data.sprites.oak.variants.right[0];patch.pixels[0]='.'+patch.pixels[0].slice(1);},
  ]) {const copy=structuredClone(source);edit(copy);assert.throws(()=>validateBiome(copy));}
});
