import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {Camera} from '../src/rendering/Camera.js';
import {skyStars} from '../src/rendering/Daylight.js';
import {ambientLife,drawAmbientLife} from '../src/rendering/AmbientLife.js';
import {batSprite,batFrameAt,drawBat} from '../src/rendering/AmbientSprites.js';
import {drawReferenceScene} from '../src/rendering/ReferenceScene.js';
const view=(x=280,width=712)=>{const c=new Camera(x);c.resize(width,401);return c;};
const root=new URL('../',import.meta.url),sha=b=>createHash('sha256').update(b).digest('hex');

test('independent sky seeds remove long collinear runs in candidate order',()=>{
  const stars=skyStars(view(),4,22);let aligned=0;
  for(let i=2;i<stars.length;i++){
    const [a,b,c]=stars.slice(i-2,i+1);
    if(Math.abs((b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x))<2)aligned++;
  }
  assert.ok(stars.length>150);assert.ok(aligned<stars.length*.05);
  assert.equal(new Set(stars.map(p=>p.x+':'+p.y)).size,stars.length);
  assert.ok(stars.some(s=>s.warm)&&stars.some(s=>!s.warm));
  assert.ok(Math.min(...stars.map(s=>s.alpha))<.35);assert.ok(Math.max(...stars.map(s=>s.alpha))>.7);
});

test('stars keep world identities under panning and never move with their shimmer',()=>{
  const camera=view(),first=skyStars(camera,4,22),later=skyStars(camera,5,22);
  assert.deepEqual(first.map(({id,x,y})=>[id,x,y]),later.map(({id,x,y})=>[id,x,y]));
  camera.x+=50;
  for(const star of skyStars(camera,4,22)){
    const before=first.find(s=>s.id===star.id);if(!before)continue;
    assert.equal(star.worldX,before.worldX);assert.equal(star.y,before.y);
    assert.ok(Math.abs(before.x-star.x-50*.035)<=1);
  }
});

test('the reusable bat sprite has four bounded native poses and a deterministic closed wing cycle',()=>{
  assert.deepEqual(batSprite.size,[13,9]);assert.equal(batSprite.frames.length,4);
  assert.equal(new Set(batSprite.frames.map(f=>f.join(''))).size,4);
  for(const frame of batSprite.frames){assert.equal(frame.length,9);for(const row of frame){assert.equal(row.length,13);assert.match(row,/^[.dw]+$/);}}
  assert.equal(batFrameAt(0),batFrameAt(.5));assert.equal(batFrameAt(NaN),batFrameAt(0));
  const pixels=[],ctx={fillRect(x,y,w,h){pixels.push({x,y,w,h});}};
  for(let frame=0;frame<4;frame++)drawBat(ctx,40,30,frame);
  for(const p of pixels){assert.equal(p.w,1);assert.equal(p.h,1);assert.ok(Number.isInteger(p.x)&&Number.isInteger(p.y));assert.ok(p.x>=34&&p.x<47&&p.y>=26&&p.y<35);}
});

test('night has at most one occasional bat and long intervals without any bat',()=>{
  const camera=view(280,1680);let present=0,absent=0;
  for(let t=0;t<144;t+=.25){
    const bats=ambientLife(camera,22,t).bats;assert.ok(bats.length<=1);
    if(bats.length)present++;else absent++;
    for(const b of bats){assert.ok(b.alpha>=0&&b.alpha<=.62);assert.ok(b.frame>=0&&b.frame<4);assert.ok(b.worldY<=-240);}
    assert.deepEqual(ambientLife(camera,12,t).bats,[]);
  }
  assert.ok(present>0&&absent>0);
});

test('bat passages are world anchored and fade with twilight without teleporting',()=>{
  const camera=view(-280),night=ambientLife(camera,22,3).bats[0],dusk=ambientLife(camera,19,3).bats[0];
  assert.ok(night&&dusk);assert.equal(night.worldX,dusk.worldX);assert.equal(night.worldY,dusk.worldY);assert.ok(dusk.alpha<night.alpha);
  camera.x+=20;const after=ambientLife(camera,22,3).bats[0];
  assert.equal(after.id,night.id);assert.equal(after.worldX,night.worldX);assert.ok(Math.abs(night.x-after.x-8.4)<=1);
  for(let t=0;t<8;t+=1/60){
    const a=ambientLife(camera,22,t).bats[0],b=ambientLife(camera,22,t+1/60).bats[0];if(!a||!b)continue;
    assert.ok(Math.abs(a.x-b.x)<=1);assert.ok(Math.abs(a.y-b.y)<=1);assert.ok(Math.abs(a.alpha-b.alpha)<.01);
  }
});

test('fireflies have real stationary pauses and independent changing brightness',()=>{
  const camera=view(-280);let held=0;
  for(let t=0;t<30;t+=.1){
    const a=ambientLife(camera,22,t).fireflies,b=ambientLife(camera,22,t+.05).fireflies;
    for(const p of a){const q=b.find(v=>v.id===p.id);if(!q||!p.resting||!q.resting)continue;
      assert.equal(p.worldX,q.worldX);assert.equal(p.worldY,q.worldY);held++;
    }
  }
  assert.ok(held>100);
  const first=ambientLife(camera,22,3).fireflies;
  assert.ok(new Set(first.map(p=>p.alpha.toFixed(3))).size>2);
});

test('ambient layer separation never draws the bat twice and restores canvas state',()=>{
  const calls=[],stack=[],ctx={globalAlpha:.7,fillStyle:'#aaa',save(){stack.push([this.globalAlpha,this.fillStyle]);},restore(){[this.globalAlpha,this.fillStyle]=stack.pop();},fillRect(x,y,w,h){calls.push({x,y,w,h,color:this.fillStyle});}};
  const camera=view(-280);drawAmbientLife(ctx,camera,22,3,'distant');
  assert.ok(calls.some(c=>c.color===batSprite.palette.w));assert.ok(calls.every(c=>Object.values(batSprite.palette).includes(c.color)));
  calls.length=0;drawAmbientLife(ctx,camera,22,3,'near');assert.ok(calls.length);assert.ok(calls.every(c=>!Object.values(batSprite.palette).includes(c.color)));
  assert.equal(ctx.globalAlpha,.7);assert.equal(ctx.fillStyle,'#aaa');
});

test('the bat is drawn after middle woodland but behind nearer architecture and trees',()=>{
  const manifest=JSON.parse(readFileSync(new URL('assets/reference-biome/manifest.json',root))),calls=[];
  const ctx={createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),save(){},restore(){},translate(){},scale(){},fillRect(){if(this.fillStyle===batSprite.palette.w)calls.push('bat');},drawImage(s){calls.push(s.id);}};
  drawReferenceScene(ctx,view(280,1680),22,3,id=>{const a=manifest.sprites.find(s=>s.id===id.replace('-glass',''));return a?{...a,surface:{id}}:null;});
  assert.ok(calls.indexOf('uniqueForestMiddle')<calls.indexOf('bat'));
  for(const id of ['chapel','oakLeft','oakRight'])assert.ok(calls.indexOf('bat')<calls.indexOf(id));
});

test('the architecture study consumes exact canonical assets instead of retaining copies',()=>{
  const study=JSON.parse(readFileSync(new URL('studies/architecture/manifest.json',root)));
  assert.ok(!existsSync(new URL('studies/architecture/assets/',root)));
  for(const entry of [...study.sprites,...study.graveyard])for(const [field,expected]of [['file',entry.sha256],['source',entry.sourceSha256]]){
    const url=new URL(entry[field],new URL('studies/architecture/',root));
    assert.ok(url.pathname.includes('/assets/reference-biome/'));assert.equal(sha(readFileSync(url)),expected);
  }
});
