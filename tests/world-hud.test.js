import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIVITIES, needPresentation, clockPresentation, WorldHUD } from '../src/ui/WorldHUD.js';
import { STATES, Creature } from '../src/creature/Creature.js';
import { World } from '../src/world/World.js';
import { WorldTime } from '../src/core/Time.js';
import { DAY_SECONDS } from '../src/core/Config.js';
import { groundContacts, drawContactShadow } from '../src/rendering/GroundContact.js';
import { readAssetSource } from '../scripts/asset-source.js';
import { compileCatalog } from '../src/rendering/AssetModel.js';

test('all approved states have a visible label and a bounded, distinct activity palette',()=>{
  assert.deepEqual(Object.keys(ACTIVITIES),STATES);
  for(const activity of Object.values(ACTIVITIES)){assert.ok(activity.label.length>0);assert.match(activity.color,/^#[0-9a-f]{6}$/);}
  assert.ok(new Set(Object.values(ACTIVITIES).map(s=>s.color)).size>=6);
});

test('need colors represent remaining reserves and clamp invalid or out-of-range values',()=>{
  for(const value of [NaN,Infinity,-5])assert.deepEqual(needPresentation(value),{amount:0,rounded:0,level:'low'});
  assert.equal(needPresentation(25).level,'low');assert.equal(needPresentation(25.1).level,'medium');
  assert.equal(needPresentation(55).level,'medium');assert.equal(needPresentation(55.1).level,'high');
  assert.equal(needPresentation(200).amount,100);assert.equal(needPresentation(81.7).rounded,82);
});

test('the world dial reflects the simulation hour, phase and day rather than wall-clock time',()=>{
  for(const [elapsed,time,phase]of [[0,'08:00','D\u00eda'],[120,'10:00','D\u00eda'],[600,'18:00','Atardecer'],[840,'22:00','Noche'],[960,'00:00','Noche'],[1320,'06:00','D\u00eda']]) {
    const clock=new WorldTime(elapsed),view=clockPresentation(clock);
    assert.equal(view.time,time);assert.equal(view.phase,phase);assert.equal(view.day,clock.day);assert.ok(view.label.includes(time));
  }
});

test('the sun completes one forward orbit per world day without rotating backwards at midnight',()=>{
  const before=clockPresentation(new WorldTime(959.999)),after=clockPresentation(new WorldTime(960));
  assert.equal(before.time,'23:59');assert.equal(after.time,'00:00');assert.ok(after.rotation>before.rotation);
  assert.ok(after.rotation-before.rotation<.001);
  const a=clockPresentation(new WorldTime(0)),b=clockPresentation(new WorldTime(DAY_SECONDS));
  assert.equal(b.rotation-a.rotation,360);assert.equal(b.time,a.time);assert.equal(b.day,a.day+1);
});

class Element {
  constructor(){this.dataset={};this.attributes={};this.properties={};this.hidden=false;this.textContent='';this.style={setProperty:(key,value)=>{this.properties[key]=value;}};}
  setAttribute(key,value){this.attributes[key]=value;}
}
function fixture() {
  const elements=new Map(),get=selector=>{if(!elements.has(selector))elements.set(selector,new Element());return elements.get(selector);};
  const symbols=STATES.map(state=>{const element=new Element();element.dataset.stateSymbol=state;return element;});
  const root={querySelector:get,querySelectorAll:()=>symbols};
  const game={creature:new Creature({},()=>.5),world:new World(),saves:{status:'local'}};
  return {game,elements,symbols,hud:new WorldHUD(game,root),get};
}

test('HUD initializes readable meters and shows only the current state symbol',()=>{
  const {get,symbols,game}=fixture();
  assert.equal(get('#activity').textContent,ACTIVITIES[game.creature.state].label);
  assert.equal(symbols.filter(s=>!s.hidden).length,1);
  assert.equal(get('[data-need="energy"]').attributes['aria-valuenow'],'84');
  assert.equal(get('[data-need-value="hunger"]').textContent,'82');
  assert.equal(get('#world-clock').attributes['aria-label'],'D\u00eda, 08:00, d\u00eda 1');
});

test('a state change updates color, icon, text and reserve levels without changing simulation data',()=>{
  const {game,hud,get,symbols}=fixture();game.creature.transition('SLEEP');game.creature.needs.energy=20;game.creature.needs.hunger=40;
  const before={creature:game.creature.serialize(),world:game.world.serialize()};hud.update(.2);
  assert.equal(get('#creature-hud').properties['--activity-color'],ACTIVITIES.SLEEP.color);
  assert.equal(get('#activity').textContent,'Durmiendo');assert.equal(symbols.find(s=>!s.hidden).dataset.stateSymbol,'SLEEP');
  assert.equal(get('[data-need="energy"]').dataset.level,'low');assert.equal(get('[data-need="hunger"]').dataset.level,'medium');
  assert.deepEqual({creature:game.creature.serialize(),world:game.world.serialize()},before);
});

test('the dial follows clock progression even between throttled meter refreshes',()=>{
  const {game,hud,get}=fixture();const before=get('#world-clock').properties['--solar-angle'];
  game.world.clock.update(1/30);hud.update(1/30);
  assert.notEqual(get('#world-clock').properties['--solar-angle'],before);
  game.world.clock.elapsed=840;hud.update(0);assert.equal(get('#phase').textContent,'Noche');assert.equal(get('#world-time').dateTime,'22:00');
});

test('save failures remain explicit instead of retaining a successful check label',()=>{
  const {game,hud,get}=fixture();game.saves.status='memory';hud.update(.2);
  assert.equal(get('#hud-save').dataset.save,'memory');assert.equal(get('#save-status').textContent,'Sin guardar');
  game.saves.status='future';hud.update(.2);assert.equal(get('#save-status').textContent,'Guardado incompatible');
  game.saves.status='local';hud.update(.2);assert.equal(get('#save-status').textContent,'Guardado local');
});

test('contact shadows use separate runs of pixels close to the floor, not the full body width',()=>{
  const rows=['a......','aa.....','..aa.a.','...a.aa'],copy=[...rows];
  assert.deepEqual(groundContacts(rows,[3,4]),[{x:-2,width:4},{x:1,width:4}]);assert.deepEqual(rows,copy);
  assert.deepEqual(groundContacts(['aaaaa','.....','.....','.....'],[2,4]),[]);
});

test('the shadow is two native-pixel rows below the soles, mirrored and always translucent',()=>{
  const calls=[],ctx={save(){},restore(){},fillRect(x,y,w,h){calls.push({x,y,w,h,alpha:this.globalAlpha});}};
  drawContactShadow(ctx,[{x:4,width:8}],100,200,-1);
  assert.deepEqual(calls,[{x:88,y:200,w:8,h:1,alpha:.16},{x:89,y:201,w:6,h:1,alpha:.06}]);
});

test('every approved Miga pose can generate bounded floor contacts without editing its pixels',()=>{
  const catalog=compileCatalog(readAssetSource());let frames=0;
  for(const [id,frame]of Object.entries(catalog.frames).filter(([id])=>id.startsWith('miga:'))) {
    const before=JSON.stringify(frame),contacts=groundContacts(frame.pixels,frame.anchor);
    for(const run of contacts){assert.ok(Number.isInteger(run.x)&&Number.isInteger(run.width));assert.ok(run.width>0&&run.width<=frame.pixels[0].length+2,id);}
    assert.equal(JSON.stringify(frame),before);frames++;
  }
  assert.ok(frames>30);
  assert.equal(groundContacts(catalog.frames['miga:stand'].pixels,catalog.frames['miga:stand'].anchor).length,2);
});
