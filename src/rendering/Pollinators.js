import {smoothstep} from './Daylight.js';
import {referencePosition,pollinatorStations,cemeteryParallax} from './ReferenceLayout.js';
import {ambientSprites,ambientFrameAt} from './AmbientSprites.js';

export function pollinatorPose(station,seconds) {
  const time=Number.isFinite(seconds)?Math.max(0,seconds):0;
  const duration=station.kind==='bee'?14+station.seed*.19:19+station.seed*.13;
  const age=((time+station.seed*2.31)%duration)/duration;
  const flight=smoothstep(.12,.28,age)*(1-smoothstep(.76,.93,age));
  const radius=station.kind==='bee'?18:35;
  const dx=flight*(Math.sin(time*.73+station.seed)*radius+Math.sin(time*1.17+station.seed*2)*radius*.22);
  const dy=-flight*(7+(.5+.5*Math.sin(time*.58+station.seed))*radius*.65);
  const perched=Boolean(station.perch)&&flight===0;
  return {dx,dy,perched,hovering:flight===0&&!perched,
    direction:perched?(station.seed%2?1:-1):(Math.cos(time*.73+station.seed)>=0?1:-1),
    worldX:station.x+dx,worldY:station.offset+dy,
    frame:ambientFrameAt(ambientSprites[station.kind],time,perched)};
}

export function pollinators(camera,lighting,seconds) {
  const bees=[],dragonflies=[];
  if(!lighting.butterflies)return {bees,dragonflies};
  for(const station of pollinatorStations){
    const pose=pollinatorPose(station,seconds),target=referencePosition(camera,station);
    const point={x:target.x+Math.round(pose.dx*station.parallax),y:target.y+Math.round(pose.dy)};
    if(point.x< -3||point.x>=camera.width+3||point.y<0||point.y>=camera.ground-8)continue;
    const sample={...pose,...point,id:station.id,station:station.id,kind:station.kind,
      layer:station.parallax===cemeteryParallax?'cemetery':'near',alpha:lighting.butterflies*(station.kind==='bee'?.68:.64)};
    (station.kind==='bee'?bees:dragonflies).push(sample);
  }
  return {bees,dragonflies};
}
