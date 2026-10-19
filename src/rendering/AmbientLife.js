import { sampleDaylight } from './Daylight.js';

const habitats = [
  { x:-430, seed:1 }, { x:-160, seed:4 }, { x:170, seed:7 },
  { x:420, seed:10 }, { x:755, seed:13 }, { x:990, seed:16 },
];

const project = (camera,x,y,parallax=.94) => ({
  x:Math.round(camera.width/2+(x-camera.pixelX)*parallax), y:Math.round(camera.ground+y),
});
const visible = (camera,point) => point.x>=-3&&point.x<camera.width+3&&point.y>=0&&point.y<camera.ground-8;

export function ambientLife(camera,phase,seconds) {
  const time=Number.isFinite(seconds)?Math.max(0,seconds):0;
  const fireflies=[],butterflies=[],leaves=[];
  if(typeof phase==='string'&&!['DAY','EVENING','NIGHT'].includes(phase))return {fireflies,butterflies,leaves};
  const lighting=sampleDaylight(phase),intensity=lighting.fireflies;
  if(intensity)for(const habitat of habitats)for(let i=0;i<3;i++) {
    const seed=habitat.seed+i*.71;
    const worldX=habitat.x+Math.sin(time*(.22+i*.027)+seed)*17+Math.sin(time*.49+seed*1.7)*5;
    const worldY=-30-i*16+Math.sin(time*.31+seed*2.1)*9;
    const point=project(camera,worldX,worldY);
    const glow=.5+.5*Math.sin(time*(.67+i*.09)+seed*2.3);
    const alpha=intensity*(.08+.92*glow*glow);
    if(visible(camera,point)&&fireflies.length<8)fireflies.push({id:'firefly-'+habitat.seed+'-'+i,...point,worldX,worldY,alpha,color:i%2?'#c7d995':'#e5d99c'});
  }
  if(lighting.butterflies>0||lighting.leaves>0) {
    for(const [i,center]of [-300,925].entries()) {
      const worldX=center+Math.sin(time*.23+i*2.1)*28+Math.sin(time*.7+i)*6;
      const worldY=-27-Math.sin(time*.41+i)**2*17;
      const point=project(camera,worldX,worldY,.98);
      if(visible(camera,point))butterflies.push({id:'butterfly-'+i,...point,worldX,worldY,
        alpha:.62*lighting.butterflies,wing:.5+.5*Math.sin(time*12+i),color:i?'#d9c68f':'#a9cbd2'});
    }
    for(const [i,center]of [-505,1085].entries()) {
      const age=(time+i*13)%(34+i*7),duration=9;
      if(age>=duration)continue;
      const progress=age/duration,worldX=center+progress*28+Math.sin(age*1.2+i)*7;
      const worldY=-177+progress*145;
      const point=project(camera,worldX,worldY);
      if(visible(camera,point))leaves.push({id:'leaf-'+i,...point,worldX,worldY,alpha:Math.sin(progress*Math.PI)*.38*lighting.leaves,color:'#b4a073'});
    }
  }
  return {fireflies,butterflies,leaves};
}

export function drawAmbientLife(ctx,camera,phase,seconds) {
  const samples=ambientLife(camera,phase,seconds);
  ctx.save();
  for(const particle of samples.fireflies) {
    ctx.fillStyle=particle.color;
    ctx.globalAlpha=particle.alpha*.07;ctx.fillRect(particle.x-1,particle.y-1,3,3);
    ctx.globalAlpha=particle.alpha;ctx.fillRect(particle.x,particle.y,1,1);
  }
  for(const particle of samples.butterflies) {
    const wing=particle.wing>.5?2:1;
    ctx.globalAlpha=particle.alpha*(.5+particle.wing*.5);ctx.fillStyle=particle.color;
    ctx.fillRect(particle.x-wing,particle.y-1,wing,1);
    ctx.fillRect(particle.x+1,particle.y-1,wing,1);
    ctx.globalAlpha=particle.alpha;ctx.fillStyle='#43534d';ctx.fillRect(particle.x,particle.y-1,1,2);
  }
  for(const particle of samples.leaves) {
    ctx.globalAlpha=particle.alpha;ctx.fillStyle=particle.color;ctx.fillRect(particle.x,particle.y,2,1);
  }
  ctx.restore();
}
