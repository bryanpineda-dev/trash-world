import { createIcons, Apple, Bug, Maximize, Minimize, Moon, Sun, Search, Sparkles, Save, RotateCcw, Trash2, X } from 'lucide';
import { Game } from './core/Game.js';
import { DebugPanel } from './ui/DebugPanel.js';
import { registerWorker } from './persistence/RegisterWorker.js';
import './style.css';

const icons = { Apple, Bug, Maximize, Minimize, Moon, Sun, Search, Sparkles, Save, RotateCcw, Trash2, X };
createIcons({ icons, attrs: { 'stroke-width': 1.7, 'aria-hidden': 'true' } });

let storage;
try { storage = window.localStorage; } catch { storage = null; }
const game = new Game(document.querySelector('#world'), storage);
const debug = new DebugPanel(game);
const activity = document.querySelector('#activity');
const phase = document.querySelector('#phase');
const saveStatus = document.querySelector('#save-status');
const fullscreen = document.querySelector('#fullscreen');
const STATE_LABELS = { IDLE: 'Descansando', WALK: 'Explorando', LOOK_AROUND: 'Observando', INSPECT: 'Investigando', SLEEP: 'Durmiendo', WAKE: 'Despertando', SURPRISED: 'Sorprendida', HAPPY: 'Contenta' };
const PHASE_LABELS = { DAY: 'D\u00eda', EVENING: 'Atardecer', NIGHT: 'Noche' };
const SAVE_LABELS = { local: 'Guardado local', memory: 'Sin guardar', future: 'Guardado incompatible', recovered: 'Mundo recuperado' };

let uiElapsed = 0;
const render = game.loop.render;
game.loop.render = dt => {
  render(dt);
  uiElapsed += dt;
  if (uiElapsed < 0.25) return;
  uiElapsed = 0;
  activity.textContent = STATE_LABELS[game.creature.state];
  phase.textContent = PHASE_LABELS[game.world.clock.phase];
  saveStatus.textContent = SAVE_LABELS[game.saves.status];
  document.querySelector('#app').dataset.phase = game.world.clock.phase.toLowerCase();
  if (!debug.panel.hidden) debug.update();
};

if (!document.documentElement.requestFullscreen) fullscreen.hidden = true;
fullscreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { fullscreen.hidden = true; }
});
document.addEventListener('fullscreenchange', () => {
  const active = Boolean(document.fullscreenElement);
  fullscreen.setAttribute('aria-label', active ? 'Salir de pantalla completa' : 'Pantalla completa');
  fullscreen.dataset.tooltip = fullscreen.getAttribute('aria-label');
  fullscreen.innerHTML = `<i data-lucide="${active ? 'minimize' : 'maximize'}"></i>`;
  createIcons({ icons, attrs: { 'stroke-width': 1.7, 'aria-hidden': 'true' } });
});

registerWorker();

game.start();
if (import.meta.hot) import.meta.hot.dispose(() => { game.destroy(); window.location.reload(); });
