import { createIcons, ArrowLeftRight, FileDown, ImageDown, Pause, Play, RotateCcw, ZoomIn } from 'lucide';
import { AssetLibrary, assetManifest, atlasUrl } from './rendering/AssetLibrary.js';
import { animationsForCharacter, clipTime, frameAt, resolvePose, rigForCharacter } from './rendering/AssetModel.js';
import sourceParts from '../assets/source/parts.json';
import sourceCharacters from '../assets/source/characters.json';
import sourceAnimations from '../assets/source/animations.json';
import style from '../assets/source/style.json';
import { registerWorker } from './persistence/RegisterWorker.js';
import './asset-lab.css';

const icons = { ArrowLeftRight, FileDown, ImageDown, Pause, Play, RotateCcw, ZoomIn };
const updateIcons = () => createIcons({ icons, attrs: { 'stroke-width': 1.7, 'aria-hidden': 'true' } });
const $ = selector => document.querySelector(selector);
const assets = new AssetLibrary();
const canvas = $('#preview');
const ctx = canvas.getContext('2d');
const characterSelect = $('#character');
const clipSelect = $('#clip');
const timeline = $('#timeline');
let playing = true;
let elapsed = 0;
let comparisonElapsed = 0;
let direction = 1;
let view = 'body';
let previous = null;
const objectPreviews = [];
const partPreviews = [];
const comparisonPreviews = [];
const facePreviews = [];
const sourceCatalog = { style, parts: sourceParts, characters: sourceCharacters, animations: sourceAnimations };

function options(select, entries) {
  select.replaceChildren(...entries.map(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    return option;
  }));
}

options(characterSelect, Object.entries(assetManifest.characters).map(([id, character]) => [id, character.label]));
characterSelect.disabled = characterSelect.options.length === 1;
function updateClips() {
  const previousClip = clipSelect.value;
  const clips = assetManifest.characters[characterSelect.value].clips;
  options(clipSelect, Object.entries(clips).map(([id, clip]) => [id, clip.label]));
  clipSelect.value = clips[previousClip] ? previousClip : 'idle';
}
const query = new URLSearchParams(location.search);
if (assetManifest.characters[query.get('character')]) characterSelect.value = query.get('character');
updateClips();
if ([...clipSelect.options].some(option => option.value === query.get('clip'))) clipSelect.value = query.get('clip');
if (query.get('view') === 'face') {
  view = 'face';
  $('input[name="view"][value="face"]').checked = true;
  $('#zoom').max = 16;
  $('#zoom').value = 10;
}
const currentClip = () => assetManifest.characters[characterSelect.value].clips[clipSelect.value];
const totalSeconds = () => currentClip().frames.reduce((total, frame) => total + frame.duration, 0) / 1000;

function setPlaying(value) {
  playing = value;
  const button = $('#playback');
  button.setAttribute('aria-label', value ? 'Pausar' : 'Reproducir');
  button.setAttribute('aria-pressed', String(value));
  button.dataset.tooltip = button.getAttribute('aria-label');
  button.innerHTML = `<i data-lucide="${value ? 'pause' : 'play'}"></i>`;
  updateIcons();
}

function updatePreviewLabel() {
  canvas.setAttribute('aria-label', `${characterSelect.selectedOptions[0].textContent}: ${clipSelect.selectedOptions[0].textContent} / ${view === 'face' ? 'Rostro' : 'Cuerpo'}`);
  $('#baseline').disabled = view === 'face';
  $('#rig-label').textContent = `${rigForCharacter(sourceCatalog, characterSelect.value).size.join(' x ')} px`;
}

function updateZoom() {
  const dimensions = view === 'face' ? sourceParts[sourceCharacters.characters[characterSelect.value].parts.head].size
    : rigForCharacter(sourceCatalog, characterSelect.value).size;
  const limit = Math.max(1, Math.min(view === 'face' ? 16 : 8,
    Math.floor((canvas.width - 24) / dimensions[0]), Math.floor((canvas.height - 32) / dimensions[1])));
  const zoom = $('#zoom');
  zoom.min = Math.min(2, limit);
  zoom.max = limit;
  zoom.value = Math.min(Number(zoom.value), limit);
  $('#zoom-value').textContent = `${zoom.value}x`;
}

function reset() {
  elapsed = 0;
  comparisonElapsed = 0;
  timeline.value = 0;
  updatePreviewLabel();
  updateZoom();
}
characterSelect.addEventListener('change', () => { updateClips(); reset(); });
clipSelect.addEventListener('change', reset);
$('#playback').addEventListener('click', () => {
  if (!playing && !currentClip().loop && elapsed >= totalSeconds()) elapsed = 0;
  setPlaying(!playing);
});
$('#restart').addEventListener('click', reset);
$('#direction').addEventListener('click', () => {
  direction *= -1;
  $('#direction').setAttribute('aria-label', direction === 1 ? 'Mirar a la izquierda' : 'Mirar a la derecha');
});
$('#zoom').addEventListener('input', () => { $('#zoom-value').textContent = `${$('#zoom').value}x`; });
$('#speed').addEventListener('input', () => { $('#speed-value').textContent = `${$('#speed').value}%`; });
for (const radio of document.querySelectorAll('input[name="view"]')) {
  radio.addEventListener('change', () => {
    const value = Number($('#zoom').value);
    view = radio.value;
    $('#zoom').max = view === 'face' ? 16 : 8;
    $('#zoom').value = view === 'face' ? value * 2 : Math.max(2, Math.floor(value / 2));
    updateZoom();
    updatePreviewLabel();
  });
}
timeline.addEventListener('input', () => {
  setPlaying(false);
  elapsed = Number(timeline.value) / 1000 * totalSeconds();
  if (currentClip().loop && timeline.value === '1000') elapsed = Math.max(0, elapsed - 0.001);
  comparisonElapsed = elapsed;
});
document.addEventListener('visibilitychange', () => { previous = null; });

function resizePreview() {
  const bounds = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(bounds.width));
  canvas.height = Math.max(1, Math.round(bounds.height));
  updateZoom();
}
const observer = new ResizeObserver(resizePreview);
observer.observe(canvas);
resizePreview();

for (const [token, color] of Object.entries(style.colors)) {
  const swatch = document.createElement('div');
  swatch.className = 'swatch';
  swatch.title = `${color.name}: ${color.hex}`;
  const sample = document.createElement('span');
  sample.style.backgroundColor = color.hex;
  const text = document.createElement('span');
  text.textContent = color.hex.toUpperCase();
  swatch.append(sample, text);
  $('#palette').append(swatch);
}

function previewTile(id, label, target, width, height) {
  const figure = document.createElement('figure');
  const preview = document.createElement('canvas');
  preview.width = width;
  preview.height = height;
  preview.setAttribute('role', 'img');
  preview.setAttribute('aria-label', label);
  const caption = document.createElement('figcaption');
  caption.textContent = label;
  figure.append(preview, caption);
  $(target).append(figure);
  return { id, canvas: preview, ctx: preview.getContext('2d') };
}
for (const [clip, label] of [['idle', 'Reposo'], ['walk', 'Caminar'], ['sleep', 'Dormir']]) {
  comparisonPreviews.push({ ...previewTile('miga', label, '#study-characters', 192, 204), clip });
}
for (const [variant, label] of [['rest', 'Cerrada'], ['mouth-small', 'Entreabierta'], ['mouth-open', 'Abierta']]) {
  facePreviews.push({ ...previewTile(variant, label, '#study-faces', 144, 154), variant });
}
for (const [id, object] of Object.entries(assetManifest.objects)) {
  objectPreviews.push(previewTile(id, object.label, '#objects', 160, 100));
}
for (const [id, part] of Object.entries(sourceParts)) {
  const preview = previewTile(id, part.label ?? id, '#parts', 100, 90);
  const variants = document.createElement('select');
  variants.setAttribute('aria-label', `Variante de ${part.label ?? id}`);
  options(variants, Object.keys(part.variants).map(value => [value, value]));
  variants.disabled = Object.keys(part.variants).length === 1;
  preview.canvas.parentElement.append(variants);
  partPreviews.push({ ...preview, variants, size: part.size });
}

$('#download-atlas').href = atlasUrl;
const metadataUrl = URL.createObjectURL(new Blob([JSON.stringify(assetManifest, null, 2)], { type: 'application/json' }));
$('#download-json').href = metadataUrl;
window.addEventListener('pagehide', event => { if (!event.persisted) URL.revokeObjectURL(metadataUrl); });
updateIcons();
reset();

function render(now) {
  const dt = previous === null ? 0 : Math.min(0.05, (now - previous) / 1000);
  previous = now;
  const clip = currentClip();
  const total = totalSeconds();
  if (playing) {
    const step = dt * Number($('#speed').value) / 100;
    elapsed += step;
    comparisonElapsed += step;
    if (clip.loop) elapsed = clipTime(clip, elapsed);
    else if (elapsed >= total) { elapsed = total; setPlaying(false); }
  }
  const scale = Number($('#zoom').value);
  const ground = canvas.height - 32;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if ($('#baseline').checked && view === 'body') {
    ctx.fillStyle = '#abbcb4';
    ctx.fillRect(0, ground, canvas.width, 1);
    ctx.fillStyle = '#ccd9d2';
    ctx.fillRect(Math.round(canvas.width / 2), 16, 1, ground - 16);
  }
  const frame = frameAt(clip, elapsed);
  if (view === 'face') {
    const partId = sourceCharacters.characters[characterSelect.value].parts.head;
    const pose = resolvePose(animationsForCharacter(sourceCatalog, characterSelect.value).poses, frame.id.split(':')[1]);
    const [width, height] = sourceParts[partId].size;
    assets.drawFrame(ctx, `part:${partId}:${pose.variants.head}`,
      (canvas.width - width * scale * direction) / 2, (canvas.height - height * scale) / 2, direction, scale);
  } else {
    assets.drawCharacter(ctx, characterSelect.value, clipSelect.value, elapsed, canvas.width / 2, ground, direction, scale);
  }
  timeline.value = Math.round(elapsed / total * 1000);
  $('#time-value').textContent = `${elapsed.toFixed(2)} s`;
  $('#frame-name').textContent = frame.id;
  $('#frame-duration').textContent = `${frame.duration} ms`;
  for (const preview of comparisonPreviews) {
    preview.ctx.clearRect(0, 0, preview.canvas.width, preview.canvas.height);
    const rig = rigForCharacter(sourceCatalog, preview.id);
    const comparisonScale = Math.min(3, Math.floor(preview.canvas.width / rig.size[0]), Math.floor(190 / rig.size[1]));
    const comparisonClip = assetManifest.characters[preview.id].clips[preview.clip];
    preview.canvas.dataset.frame = frameAt(comparisonClip, comparisonElapsed).id;
    assets.drawCharacter(preview.ctx, preview.id, preview.clip, comparisonElapsed, preview.canvas.width / 2, 190, direction, comparisonScale);
  }
  for (const preview of facePreviews) {
    preview.ctx.clearRect(0, 0, preview.canvas.width, preview.canvas.height);
    const partId = sourceCharacters.characters[characterSelect.value].parts.head;
    const [width, height] = sourceParts[partId].size;
    const faceScale = Math.min(6, Math.floor(preview.canvas.width / width), Math.floor(preview.canvas.height / height));
    assets.drawFrame(preview.ctx, `part:${partId}:${preview.variant}`,
      (preview.canvas.width - width * faceScale) / 2, (preview.canvas.height - height * faceScale) / 2, 1, faceScale);
  }
  for (const preview of objectPreviews) {
    preview.ctx.clearRect(0, 0, preview.canvas.width, preview.canvas.height);
    assets.drawObject(preview.ctx, preview.id, now / 1000, preview.canvas.width / 2, 84, 2);
  }
  for (const preview of partPreviews) {
    preview.ctx.clearRect(0, 0, preview.canvas.width, preview.canvas.height);
    assets.drawFrame(preview.ctx, `part:${preview.id}:${preview.variants.value}`,
      (preview.canvas.width - preview.size[0] * 2) / 2, (preview.canvas.height - preview.size[1] * 2) / 2, 1, 2);
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
registerWorker();
