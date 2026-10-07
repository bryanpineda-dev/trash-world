const NEED_LABELS = { hunger: 'Saciedad', energy: 'Energia', happiness: 'Felicidad', curiosity: 'Curiosidad', boredom: 'Aburrimiento', fear: 'Miedo' };

export class DebugPanel {
  constructor(game) {
    this.game = game;
    this.panel = document.querySelector('#debug-panel');
    this.toggle = document.querySelector('#debug-toggle');
    this.values = document.querySelector('#debug-values');
    this.message = document.querySelector('#debug-message');
    this.confirm = document.querySelector('#reset-confirm');
    this.metrics = {};
    for (const [key, label] of Object.entries({ fps: 'FPS', state: 'Estado', ...NEED_LABELS, discoveries: 'Descubrimientos', time: 'Hora del mundo', sensor: 'Entrada', tilt: 'Inclinacion', shake: 'Sacudida' })) {
      const term = document.createElement('dt');
      term.textContent = label;
      const value = document.createElement('dd');
      this.metrics[key] = value;
      this.values.append(term, value);
    }
    this.toggle.addEventListener('click', () => this.setOpen(this.panel.hidden));
    document.querySelector('#debug-close').addEventListener('click', () => this.setOpen(false));
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !this.panel.hidden) this.setOpen(false); });
    this.panel.addEventListener('click', event => {
      const action = event.target.closest('button[data-action]')?.dataset.action;
      if (action) this.act(action);
    });
    this.motionToggle = document.querySelector('#ambient-motion');
    this.motionToggle.checked = game.settings.ambientMotion;
    this.motionToggle.addEventListener('change', () => {
      game.settings.ambientMotion = this.motionToggle.checked;
      game.save();
    });
  }

  setOpen(open) {
    this.panel.hidden = !open;
    this.toggle.setAttribute('aria-expanded', String(open));
    this.toggle.setAttribute('aria-label', open ? 'Cerrar depuracion' : 'Abrir depuracion');
    this.confirm.hidden = true;
    if (open) { this.update(); document.querySelector('#debug-close').focus(); }
    else this.toggle.focus();
  }

  update() {
    const { creature: c, world, loop, sensors } = this.game;
    const values = { fps: Math.round(loop.fps), state: c.state, discoveries: world.discoveredObjects.size,
      time: `${String(Math.floor(world.clock.hour)).padStart(2, '0')}:${String(Math.floor(world.clock.hour % 1 * 60)).padStart(2, '0')} / ${world.clock.phase}`,
      sensor: sensors.mode, tilt: '0 / 0', shake: sensors.getShakeIntensity() };
    for (const key of Object.keys(NEED_LABELS)) values[key] = Math.round(c.needs[key]);
    for (const [key, value] of Object.entries(values)) this.metrics[key].textContent = String(value);
  }

  act(action) {
    const { game } = this;
    const c = game.creature;
    let result = null;
    if (action === 'sleep') c.transition('SLEEP', 0);
    if (action === 'wake') c.transition('WAKE', 2.5);
    if (action === 'inspect') game.ai.investigate('can');
    if (action === 'surprise') { c.needs.change('fear', 12); c.transition('SURPRISED', 2.5); }
    if (action === 'feed') c.needs.change('hunger', 20);
    if (action === 'save') result = game.save() ? 'Guardado.' : 'Guardado no disponible.';
    if (action === 'load') result = game.load() ? 'Mundo cargado.' : 'No hay un guardado compatible.';
    if (action === 'reset') { this.confirm.hidden = false; return; }
    if (action === 'cancel-reset') { this.confirm.hidden = true; return; }
    if (action === 'confirm-reset') {
      result = game.reset() ? 'Nuevo mundo.' : 'No se pudo reiniciar.';
      this.confirm.hidden = true;
    }
    if (!['save', 'load'].includes(action)) game.save();
    this.motionToggle.checked = game.settings.ambientMotion;
    this.message.textContent = result ?? '';
    this.update();
  }
}
