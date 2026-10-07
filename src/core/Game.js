import { SAVE_VERSION } from './Config.js';
import { GameLoop } from './GameLoop.js';
import { offlineSeconds } from './Time.js';
import { Creature } from '../creature/Creature.js';
import { CreatureAI } from '../creature/CreatureAI.js';
import { World } from '../world/World.js';
import { SaveManager } from '../persistence/SaveManager.js';
import { newSave } from '../persistence/SaveSchema.js';
import { advanceOffline } from '../persistence/OfflineProgress.js';
import { SensorManager } from '../sensors/SensorManager.js';
import { TouchInput } from '../sensors/TouchInput.js';
import { Renderer } from '../rendering/Renderer.js';

export class Game {
  constructor(canvas, storage, now = Date.now) {
    this.now = now;
    this.saves = new SaveManager(storage, now);
    this.sensors = new SensorManager();
    this.restore(this.saves.load() ?? newSave(now()));
    this.renderer = new Renderer(canvas, this.creature.x);
    this.input = new TouchInput(canvas, this.renderer.camera, (point, long) => this.touch(point, long));
    this.saveElapsed = 0;
    this.hiddenAt = null;
    this.loop = new GameLoop(dt => this.update(dt), dt => this.renderer.render(this, dt));
    this.visibility = () => { if (document.hidden) this.suspend(); else this.resume(); };
    this.pageHide = () => this.suspend();
    this.pageShow = () => { if (!document.hidden) this.resume(); };
    document.addEventListener('visibilitychange', this.visibility);
    window.addEventListener('pagehide', this.pageHide);
    window.addEventListener('pageshow', this.pageShow);
  }

  restore(save) {
    this.creature = new Creature(save.creature);
    this.world = new World(save.world);
    this.ai = new CreatureAI(this.creature, this.world);
    this.settings = { ...save.settings };
    this.meta = { ...save.meta };
    advanceOffline(this.creature, this.world, offlineSeconds(this.meta.lastActiveAt, this.now()));
    this.meta.lastActiveAt = this.now();
    if (this.renderer) this.renderer.camera.x = this.creature.x;
  }

  start() {
    this.save();
    if (!document.hidden) this.loop.start();
    else this.hiddenAt = this.now();
  }

  update(dt) {
    this.world.clock.update(dt);
    this.ai.update(dt);
    this.meta.totalPlayTime += dt;
    this.saveElapsed += dt;
    if (this.saveElapsed >= 5) { this.save(); this.saveElapsed = 0; }
  }

  touch(point, long = false) {
    this.renderer.markTouch(point);
    const c = this.creature;
    if (this.renderer.hitCreature(c, point)) {
      this.ai.touch(long ? 'pet' : 'creature', point);
    } else {
      const object = this.world.objectAt(point.x, point.y);
      this.ai.touch(object ? 'object' : 'world', object ?? point);
    }
    this.save();
  }

  snapshot() {
    return { version: SAVE_VERSION, creature: this.creature.serialize(), world: this.world.serialize(),
      settings: { ...this.settings }, meta: { ...this.meta, lastActiveAt: this.now() } };
  }

  save() { return this.saves.save(this.snapshot()); }

  load() {
    const data = this.saves.load();
    if (!data) return false;
    this.restore(data);
    this.saveElapsed = 0;
    return true;
  }

  reset() {
    if (!this.saves.reset()) return false;
    this.restore(newSave(this.now()));
    this.saveElapsed = 0;
    return this.save();
  }

  suspend() {
    if (this.hiddenAt !== null) return;
    this.hiddenAt = this.now();
    this.loop.stop();
    this.save();
  }

  resume() {
    if (this.hiddenAt !== null) {
      advanceOffline(this.creature, this.world, offlineSeconds(this.hiddenAt, this.now()));
      this.hiddenAt = null;
      this.saveElapsed = 0;
      this.save();
    }
    this.loop.start();
  }

  destroy() {
    this.loop.stop();
    this.save();
    this.input.destroy();
    this.renderer.destroy();
    document.removeEventListener('visibilitychange', this.visibility);
    window.removeEventListener('pagehide', this.pageHide);
    window.removeEventListener('pageshow', this.pageShow);
  }
}
