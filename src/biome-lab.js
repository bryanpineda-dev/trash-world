import { createIcons, Earth, Grid2x2, Shapes, X, Pause, Play } from 'lucide';
import { Renderer } from './rendering/Renderer.js';
import { referenceManifest } from './rendering/ReferenceScenery.js';
import { Creature } from './creature/Creature.js';
import { World } from './world/World.js';
import './biome-lab.css';

const icons = { Earth, Grid2x2, Shapes, X, Pause, Play };
const refreshIcons = () => createIcons({ icons, attrs: { 'aria-hidden': 'true', 'stroke-width': 1.7 } });
refreshIcons();
const phase = document.querySelector('#biome-phase');
const pose = document.querySelector('#biome-pose');
const position = document.querySelector('#biome-position');
const output = document.querySelector('#position-output');
const play = document.querySelector('#biome-play');
document.querySelector('#app').dataset.phase = phase.value.toLowerCase();
const creature = new Creature({ position: { x: Number(position.value) }, state: { name: 'IDLE' } });
const world = new World();
const renderer = new Renderer(document.querySelector('#world'), creature.x);
const preview = { creature, world, settings: { ambientMotion: true } };
const library = document.querySelector('#biome-library');
const family = document.querySelector('#library-family');
const families = { trees:'Arboles', vegetation:'Vegetacion', gravestones:'Lapidas', backgrounds:'Fondos',
  terrain:'Terreno', sky:'Cielo', architecture:'Arquitectura' };
for (const [id,label] of Object.entries(families)) {
  const option = document.createElement('option');
  option.value = id; option.textContent = label; family.append(option);
}
const paths = Object.fromEntries(referenceManifest.sprites.map(({id,file})=>[id,file.replace('native/','')]));
const tiles = [];
for (const [id, sprite] of [['miga',{label:'Miga',size:[64,64]}],...referenceManifest.sprites.map(sprite=>[sprite.id,sprite])]) {
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
    else {
      const item=renderer.scenery.surface(id,phase.value);
      if(item) {
        const scale=Math.min(1,192/item.size[0],176/item.size[1]);
        const width=Math.round(item.size[0]*scale),height=Math.round(item.size[1]*scale);
        ctx.drawImage(item.surface,Math.round((208-width)/2),200-height,width,height);
      }
    }
  }
}
document.querySelector('#library-open').addEventListener('click',()=>{ drawLibrary(); library.showModal(); });
renderer.scenery.loading.then(()=>{if(library.open)drawLibrary();});
document.querySelector('#library-close').addEventListener('click',()=>library.close());
let playing = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let previous = performance.now();
let request;
function refreshPlay() {
  const label = playing ? 'Pausar' : 'Reproducir';
  play.setAttribute('aria-label', label);
  play.dataset.tooltip = label;
  play.innerHTML = `<i data-lucide="${playing ? 'pause' : 'play'}"></i>`;
  refreshIcons();
}
phase.addEventListener('change', () => {
  document.querySelector('#app').dataset.phase = phase.value.toLowerCase();
});
pose.addEventListener('change', () => creature.transition(pose.value));
function syncPosition() {
  creature.x = Number(position.value);
  renderer.camera.x = creature.x;
  renderer.camera.resize(renderer.camera.width, renderer.camera.height);
  output.value = position.value;
}
position.addEventListener('input', syncPosition);
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
  world.clock.elapsed = { DAY: 120, EVENING: 600, NIGHT: 840 }[phase.value];
  creature.stateElapsed += dt;
  if (creature.state === 'WALK') {
    creature.x += creature.direction * dt * 18;
    if (creature.x >= 490) { creature.x = 490; creature.direction = -1; }
    if (creature.x <= 70) { creature.x = 70; creature.direction = 1; }
    position.value = String(Math.round(creature.x));
    output.value = position.value;
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
