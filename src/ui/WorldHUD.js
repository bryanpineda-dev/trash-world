import { DAY_SECONDS, clamp } from '../core/Config.js';

export const ACTIVITIES=Object.freeze({
  IDLE:{label:'Descansando',color:'#d2d6c5'},
  WALK:{label:'Explorando',color:'#b3d29d'},
  LOOK_AROUND:{label:'Observando',color:'#a5ced5'},
  INSPECT:{label:'Investigando',color:'#a5ced5'},
  SLEEP:{label:'Durmiendo',color:'#c0b9dd'},
  WAKE:{label:'Despertando',color:'#e7ce90'},
  SURPRISED:{label:'Sorprendida',color:'#efa98c'},
  HAPPY:{label:'Contenta',color:'#e3b9c7'},
});
const PHASES={DAY:'D\u00eda',EVENING:'Atardecer',NIGHT:'Noche'};
const SAVES={local:'Guardado local',memory:'Sin guardar',future:'Guardado incompatible',recovered:'Mundo recuperado'};

export function needPresentation(value) {
  const amount=clamp(Number.isFinite(value)?value:0,0,100);
  return {amount,rounded:Math.round(amount),level:amount<=25?'low':amount<=55?'medium':'high'};
}

export function clockPresentation(clock) {
  const minutes=Math.floor(clock.hour*60+1e-7)%1440;
  const time=String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');
  // Keep a continuous angle through midnight; the clock is not a looping CSS animation.
  return {time,rotation:clock.elapsed/DAY_SECONDS*360-60,day:clock.day,phase:PHASES[clock.phase],
    label:`${PHASES[clock.phase]}, ${time}, d\u00eda ${clock.day}`};
}

export class WorldHUD {
  constructor(game, root=document) {
    this.game=game;this.root=root;this.elapsed=0;this.lastClockLabel='';this.lastState='';this.lastSave='';
    this.app=root.querySelector('#app');this.activity=root.querySelector('#activity');
    this.status=root.querySelector('#creature-hud');
    this.symbols=[...root.querySelectorAll('[data-state-symbol]')];
    this.clock=root.querySelector('#world-clock');this.time=root.querySelector('#world-time');
    this.phase=root.querySelector('#phase');this.day=root.querySelector('#world-day');
    this.save=root.querySelector('#hud-save');this.saveLabel=root.querySelector('#save-status');
    this.meters=Object.fromEntries(['energy','hunger','happiness'].map(key=>[key,{
      element:root.querySelector(`[data-need="${key}"]`),value:root.querySelector(`[data-need-value="${key}"]`),
    }]));
    this.update(0,true);
  }

  update(dt,force=false) {
    const {creature,world,saves}=this.game,clock=clockPresentation(world.clock);
    this.clock.style.setProperty('--solar-angle',clock.rotation+'deg');
    if(clock.label!==this.lastClockLabel) {
      this.lastClockLabel=clock.label;this.clock.setAttribute('aria-label',clock.label);this.clock.title=clock.label;
      this.time.textContent=clock.time;this.time.dateTime=clock.time;this.phase.textContent=clock.phase;
      this.day.textContent='D\u00eda '+clock.day;
    }
    this.app.dataset.phase=world.clock.phase.toLowerCase();
    this.elapsed+=Math.max(0,dt);
    if(!force&&this.elapsed<.2)return;
    this.elapsed=0;
    if(creature.state!==this.lastState) {
      this.lastState=creature.state;const activity=ACTIVITIES[creature.state]??ACTIVITIES.IDLE;
      this.activity.textContent=activity.label;this.status.style.setProperty('--activity-color',activity.color);
      this.status.dataset.state=creature.state;
      for(const symbol of this.symbols)symbol.hidden=symbol.dataset.stateSymbol!==creature.state;
    }
    for(const [key,{element,value}]of Object.entries(this.meters)) {
      const need=needPresentation(creature.needs[key]);element.dataset.level=need.level;
      element.style.setProperty('--need-fill',need.amount/100);element.setAttribute('aria-valuenow',String(need.rounded));
      value.textContent=String(need.rounded);
    }
    if(saves.status!==this.lastSave) {
      this.lastSave=saves.status;this.save.dataset.save=saves.status;
      this.save.title=SAVES[saves.status]??SAVES.memory;this.saveLabel.textContent=this.save.title;
    }
  }
}
