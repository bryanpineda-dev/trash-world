import { moveToward } from '../physics/Collision.js';

export class CreatureAI {
  constructor(creature, world, random = Math.random) {
    this.creature = creature;
    this.world = world;
    this.random = random;
  }

  update(dt) {
    const c = this.creature;
    c.age += dt;
    c.stateElapsed += dt;
    c.needs.update(dt, c.state);
    if (c.state === 'SLEEP') {
      if (c.needs.energy >= 92 && c.stateElapsed >= 5) c.transition('WAKE', 2);
      return;
    }
    if (c.needs.energy <= 22 && !['WAKE', 'SURPRISED'].includes(c.state)) {
      c.transition('SLEEP', 0);
      return;
    }
    if (c.state === 'WALK') {
      if (c.targetX === null) { c.transition('IDLE', 2); return; }
      c.direction = Math.sign(c.targetX - c.x) || c.direction;
      c.x = moveToward(c.x, c.targetX, dt * (12 + c.personality.playfulness * 7));
      if (Math.abs(c.x - c.targetX) < 0.1) {
        const object = this.world.objects.find(item => item.id === c.targetObject);
        if (object) {
          c.direction = object.x < c.x ? -1 : 1;
          c.transition('INSPECT', 4.5, object);
        }
        else c.transition('LOOK_AROUND', 2.5);
      }
      return;
    }
    if (c.stateElapsed < c.stateDuration) return;
    if (c.state === 'INSPECT') this.finishInspection();
    this.chooseGoal();
  }

  chooseGoal() {
    const c = this.creature;
    if (c.needs.energy < 30 || (this.world.clock.phase === 'NIGHT' && c.needs.energy < 65)) {
      c.transition('SLEEP', 0);
      return;
    }
    if (c.needs.hunger < 38) {
      this.investigate('plant');
      return;
    }
    const interest = c.needs.curiosity / 100 * c.personality.curiosity;
    if (c.needs.boredom > 25 || this.random() < 0.25 + interest * 0.65) {
      const candidates = this.world.objects.filter(object => object.id !== c.memory.lastObject);
      candidates.sort((a, b) => {
        const score = object => Math.abs(c.x - object.x) + (this.world.discoveredObjects.has(object.id) ? 100 : 0);
        return score(a) - score(b);
      });
      this.investigate(candidates[this.random() < 0.8 ? 0 : Math.min(1, candidates.length - 1)].id);
    } else if (this.random() < 0.55 - c.personality.laziness * 0.2) {
      c.transition('WALK', 10, { x: 30 + this.random() * (this.world.width - 60) });
    } else {
      c.transition(this.random() < 0.5 ? 'IDLE' : 'LOOK_AROUND', 2 + this.random() * 5);
    }
  }

  investigate(id) {
    const object = this.world.objects.find(item => item.id === id);
    if (!object) return;
    const approach = { id: object.id, x: object.x + (this.creature.x < object.x ? -19 : 19) };
    if (Math.abs(approach.x - this.creature.x) < 1) {
      this.creature.direction = object.x < this.creature.x ? -1 : 1;
      this.creature.transition('INSPECT', 4.5, object);
    }
    else this.creature.transition('WALK', 12, approach);
  }

  finishInspection() {
    const c = this.creature;
    if (!c.targetObject) return;
    this.world.discover(c.targetObject);
    c.memory.lastObject = c.targetObject;
    c.needs.change('happiness', 5);
    c.needs.change('boredom', -15);
    if (c.targetObject === 'plant' && c.needs.hunger < 60) c.needs.change('hunger', 35);
  }

  touch(kind, target) {
    const c = this.creature;
    if (c.state === 'SLEEP') {
      c.transition('WAKE', 2.5);
      return;
    }
    if (kind === 'object') {
      if (c.needs.energy > 25 && Math.abs(c.x - target.x) < 180) this.investigate(target.id);
      else c.transition('LOOK_AROUND', 2);
      return;
    }
    if (kind === 'pet' || kind === 'creature') {
      c.memory.interactions += 1;
      c.needs.change('happiness', kind === 'pet' ? 8 : 3);
      c.transition(kind === 'pet' || c.personality.sociability > 0.55 ? 'HAPPY' : 'SURPRISED', 2);
      return;
    }
    c.direction = target.x < c.x ? -1 : 1;
    c.transition('LOOK_AROUND', 2.2);
    c.needs.change('curiosity', 5);
  }
}
