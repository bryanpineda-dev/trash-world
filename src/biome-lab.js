import { createIcons, Earth, Grid2x2, Shapes, X, Pause, Play, ChevronLeft, ChevronRight } from 'lucide';
import { Renderer } from './rendering/Renderer.js';
import { referenceManifest } from './rendering/ReferenceScenery.js';
import { Creature } from './creature/Creature.js';
import { World } from './world/World.js';
import { WORLD_LEFT, WORLD_RIGHT, CREATURE_MARGIN, DAY_SECONDS } from './core/Config.js';
import { cemeteryZones } from './rendering/ReferenceLayout.js';
import { sampleDaylight } from './rendering/Daylight.js';
import { ambientSprites,drawAmbientSprite } from './rendering/AmbientSprites.js';
import './biome-lab.css';

const icons = { Earth, Grid2x2, Shapes, X, Pause, Play, ChevronLeft, ChevronRight };
const refreshIcons = () => createIcons({ icons, attrs: { 'aria-hidden': 'true', 'stroke-width': 1.7 } });
refreshIcons();
const phase = document.querySelector('#biome-phase');
const hour = document.querySelector('#biome-hour');
const hourOutput = document.querySelector('#hour-output');
const momentHours = { DAWN:6.5, DAY:12, EVENING:18, DUSK:19.5, NIGHT:0 };
const pose = document.querySelector('#biome-pose');
const position = document.querySelector('#biome-position');
const output = document.querySelector('#position-output');
const play = document.querySelector('#biome-play');
position.min = String(WORLD_LEFT + CREATURE_MARGIN);
position.max = String(WORLD_RIGHT - CREATURE_MARGIN);
const zone = document.querySelector('#biome-zone');
for (const item of cemeteryZones) {
  const option = document.createElement('option');
  option.value = item.id; option.textContent = item.label; zone.append(option);
}
const params = new URLSearchParams(window.location.search);
zone.value = cemeteryZones.some(item => item.id === params.get('zone')) ? params.get('zone') : 'clearing';
if (params.has('zone')) position.value = String(cemeteryZones.find(item => item.id === zone.value).center);
if (Object.hasOwn(momentHours,params.get('phase'))) phase.value = params.get('phase');
hour.value = String(momentHours[phase.value]);
if(params.has('hour')&&Number.isFinite(Number(params.get('hour'))))hour.value=String(((Number(params.get('hour'))%24)+24)%24);
document.querySelector('#app').dataset.phase = phase.value.toLowerCase();
const creature = new Creature({ position: { x: Number(position.value) }, state: { name: 'IDLE' } });
const world = new World();
const renderer = new Renderer(document.querySelector('#world'), creature.x);
const preview = { creature, world, settings: { ambientMotion: true } };
const library = document.querySelector('#biome-library');
const family = document.querySelector('#library-family');
const families = { trees:'Arboles', vegetation:'Vegetacion', gravestones:'Lapidas', backgrounds:'Fondos',
  terrain:'Terreno', sky:'Cielo', architecture:'Arquitectura',fauna:'Fauna' };
for (const [id,label] of Object.entries(families)) {
  const option = document.createElement('option');
  option.value = id; option.textContent = label; family.append(option);
}
const paths = Object.fromEntries(referenceManifest.sprites.map(({id,file})=>[id,file.replace('native/','')]));
for(const [id,sprite]of Object.entries(ambientSprites))paths[id]='fauna/'+sprite.id;
const tiles = [];
for (const [id, sprite] of [['miga',{label:'Miga',size:[64,64]}],...Object.entries(ambientSprites).map(([id,sprite])=>[id,{...sprite,label:sprite.label??'Murcielago del bosque'}]),...referenceManifest.sprites.map(sprite=>[sprite.id,sprite])]) {
  const figure = document.createElement('figure');
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 208;
  canvas.setAttribute('role','img');
  canvas.setAttribute('aria-label',sprite.label);
  const caption = document.createElement('figcaption');
  const name = document.createElement('strong');
  name.textContent = sprite.label;
  const size = document.createElement('span');
  size.textContent = sprite.size.join(' x ') + ' px';
  const location = document.createElement('span');
  location.textContent = id === 'miga' ? 'Personaje / referencia de escala' : paths[id];
  caption.append(name,size,location);
  figure.append(canvas,caption);
  document.querySelector('#library-grid').append(figure);
  tiles.push({id,canvas,figure});
}
function syncFamily() {
  for (const {id,figure} of tiles) figure.hidden = id !== 'miga' && family.value !== 'all' && !paths[id].startsWith(family.value+'/');
  library.scrollTop = 0;
}
family.addEventListener('change',syncFamily);
function drawLibrary() {
  for(const {id,canvas} of tiles) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = phase.value==='DAY'?'#819a88':'#2c4a4d';
    ctx.fillRect(0,0,208,208);
    ctx.fillStyle = '#395b47';
    ctx.fillRect(0,200,208,8);
    if(id === 'miga') renderer.assets.drawCharacter(ctx,'miga','idle',0,104,200,1);
    else if(ambientSprites[id])drawAmbientSprite(ctx,ambientSprites[id],104,104,0,8);
    else {
      const lighting=sampleDaylight(Number(hour.value));
      const item=renderer.scenery.surface(id,lighting.from);
      if(item) {
        const scale=Math.min(1,192/item.size[0],176/item.size[1]);
        const width=Math.round(item.size[0]*scale),height=Math.round(item.size[1]*scale);
        ctx.drawImage(item.surface,Math.round((208-width)/2),200-height,width,height);
        if(lighting.blend>0) {
          const next=renderer.scenery.surface(id,lighting.to);
          ctx.globalAlpha=lighting.blend;ctx.drawImage(next.surface,Math.round((208-width)/2),200-height,width,height);ctx.globalAlpha=1;
        }
      }
    }
  }
}
document.querySelector('#library-open').addEventListener('click',()=>{ drawLibrary(); library.showModal(); });
renderer.scenery.loading.then(()=>{if(library.open)drawLibrary();});
document.querySelector('#library-close').addEventListener('click',()=>library.close());
let playing = params.get('paused') !== '1' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let previous = performance.now();
let request;
function refreshPlay() {
  const label = playing ? 'Pausar' : 'Reproducir';
  play.setAttribute('aria-label', label);
  play.dataset.tooltip = label;
  play.innerHTML = `<i data-lucide="${playing ? 'pause' : 'play'}"></i>`;
  refreshIcons();
}
function syncHour() {
  const value=Number(hour.value),minutes=Math.round(value*60)%1440;
  hourOutput.value=String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');
  phase.value=value<5||value>=21?'NIGHT':value<8?'DAWN':value<16.5?'DAY':value<18.8?'EVENING':'DUSK';
  document.querySelector('#app').dataset.phase = phase.value.toLowerCase();
  if(library.open)drawLibrary();
}
phase.addEventListener('change',()=>{hour.value=String(momentHours[phase.value]);syncHour();});
hour.addEventListener('input',syncHour);
syncHour();
pose.addEventListener('change', () => creature.transition(pose.value));
function syncZone() {
  zone.value = cemeteryZones.find(item => creature.x >= item.bounds[0] && creature.x < item.bounds[1])?.id ?? 'east';
  document.querySelector('#zone-previous').disabled = zone.value === 'west';
  document.querySelector('#zone-next').disabled = zone.value === 'east';
}
function syncPosition() {
  creature.x = Number(position.value);
  renderer.camera.x = creature.x;
  renderer.camera.resize(renderer.camera.width, renderer.camera.height);
  output.value = position.value;
  syncZone();
}
position.addEventListener('input', syncPosition);
zone.addEventListener('change', () => {
  position.value = String(cemeteryZones.find(item => item.id === zone.value).center);
  syncPosition();
});
for (const [id, direction] of [['zone-previous', -1], ['zone-next', 1]]) document.querySelector('#' + id).addEventListener('click', () => {
  const index = cemeteryZones.findIndex(item => item.id === zone.value);
  position.value = String(cemeteryZones[Math.max(0, Math.min(cemeteryZones.length - 1, index + direction))].center);
  syncPosition();
});
syncPosition();
window.addEventListener('pageshow', () => {
  syncPosition();
  syncFamily();
  if (creature.state !== pose.value) creature.transition(pose.value);
  document.querySelector('#app').dataset.phase = phase.value.toLowerCase();
  previous = performance.now();
});
play.addEventListener('click', () => { playing = !playing; refreshPlay(); });
document.querySelector('form').addEventListener('submit', event => event.preventDefault());
function frame(now) {
  const dt = document.hidden || library.open || !playing ? 0 : Math.min((now - previous) / 1000, 0.05);
  previous = now;
  world.clock.elapsed = ((Number(hour.value)-8+24)%24)/24*DAY_SECONDS;
  creature.stateElapsed += dt;
  if (creature.state === 'WALK') {
    creature.x += creature.direction * dt * 18;
    if (creature.x >= WORLD_RIGHT-CREATURE_MARGIN) { creature.x = WORLD_RIGHT-CREATURE_MARGIN; creature.direction = -1; }
    if (creature.x <= WORLD_LEFT+CREATURE_MARGIN) { creature.x = WORLD_LEFT+CREATURE_MARGIN; creature.direction = 1; }
    position.value = String(Math.round(creature.x));
    output.value = position.value;
    syncZone();
  }
  // The preview uses the production renderer but never reads or writes a saved life.
  renderer.render(preview, dt);
  request = requestAnimationFrame(frame);
}
refreshPlay();
request = requestAnimationFrame(frame);
if (import.meta.hot) import.meta.hot.dispose(() => {
  cancelAnimationFrame(request);
  renderer.destroy();
  window.location.reload();
});
