import { sampleDaylight, smoothstep } from './Daylight.js';
import { batFrameAt, drawBat } from './AmbientSprites.js';

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
  const fireflies=[],butterflies=[],leaves=[],bats=[];
  if(typeof phase==='string'&&!['DAY','EVENING','NIGHT'].includes(phase))return {fireflies,butterflies,leaves,bats};
  const lighting=sampleDaylight(phase),intensity=lighting.fireflies;
  if(intensity)for(const habitat of habitats)for(let i=0;i<3;i++) {
    const seed=habitat.seed+i*.71;
    const age=((time+seed*11)/(14+i*2+seed*.19))%1;
    const travel=smoothstep(.18,.46,age)-smoothstep(.68,.96,age);
    const resting=age<.18||(age>=.46&&age<.68)||age>=.96;
    const worldX=habitat.x+(i-1)*11-13+travel*(23+Math.sin(seed)*5);
    const worldY=-22-i*15-Math.sin(seed*1.8)*5-travel*(5+Math.cos(seed)*4);
    const point=project(camera,worldX,worldY);
    const glow=(.5+.5*Math.sin(time*(.57+i*.043)+seed*2.3))**3;
    const breath=.8+.2*Math.sin(time*.19+seed*.7);
    const alpha=intensity*(.015+.985*glow*breath);
    if(visible(camera,point)&&fireflies.length<8)fireflies.push({id:'firefly-'+habitat.seed+'-'+i,...point,worldX,worldY,alpha,resting,color:i%2?'#c7d995':'#e5d99c'});
  }
  if(lighting.lamps>0) {
    const passage=Math.floor((time+9)/24),age=(time+9)%24;
    if(age<18) {
      const route=passage%3,progress=age/18,direction=passage%2?-1:1;
      const center=[-300,210,810][route];
      const worldX=center+direction*((progress-.5)*420+Math.sin(progress*Math.PI*2)*7);
      const worldY=-248-Math.sin(progress*Math.PI)*17+Math.sin(time*.71+route)*4;
      const point=project(camera,worldX,worldY,.42);
      const envelope=smoothstep(0,.08,progress)*(1-smoothstep(.92,1,progress));
      if(visible(camera,point))bats.push({id:'bat-'+passage,...point,worldX,worldY,direction,
        frame:batFrameAt(time),alpha:lighting.lamps*.62*envelope});
    }
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
  return {fireflies,butterflies,leaves,bats};
}

export function drawAmbientLife(ctx,camera,phase,seconds,layer='all') {
  const samples=ambientLife(camera,phase,seconds);
  ctx.save();
  if(layer!=='near')for(const bat of samples.bats) {
    ctx.globalAlpha=bat.alpha;drawBat(ctx,bat.x,bat.y,bat.frame);
  }
  if(layer==='distant'){ctx.restore();return;}
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
