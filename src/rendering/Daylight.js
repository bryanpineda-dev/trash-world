const saturate = value => Math.max(0, Math.min(1, value));
export const smoothstep = (low, high, value) => {
  const t=saturate((value-low)/(high-low));return t*t*(3-2*t);
};
const mix = (a,b,t) => a+(b-a)*t;

// Canvas blends a small, finite set of native-size grades.
export const daylightGrades = Object.freeze({
  NIGHT: { factor:[.59,.73,.94], lift:[0,2,6], air:[43,78,102], sky:[[8,21,40],[42,73,93]], floor:[12,31,29] },
  DAWN: { factor:[1.05,1.03,1.08], lift:[8,6,9], air:[142,153,157], sky:[[90,123,157],[218,182,145]], floor:[26,49,36] },
  DAY: { factor:[1.18,1.24,1.12], lift:[8,10,7], air:[115,164,153], sky:[[94,155,181],[186,211,178]], floor:[26,56,34] },
  GOLDEN: { factor:[1.19,1.09,.88], lift:[9,6,3], air:[155,151,123], sky:[[76,117,144],[219,160,105]], floor:[33,48,29] },
  DUSK: { factor:[.83,.87,1.02], lift:[3,3,8], air:[89,110,141], sky:[[39,54,92],[119,112,143]], floor:[20,35,33] },
});

const stops = [
  [0,'NIGHT'],[4.5,'NIGHT'],[6.5,'DAWN'],[9,'DAY'],[15,'DAY'],
  [18,'GOLDEN'],[19.5,'DUSK'],[21,'NIGHT'],[24,'NIGHT'],
];
const phaseHours={DAY:12,EVENING:18.5,NIGHT:0,DAWN:6.5,GOLDEN:18,DUSK:19.5};
export function sampleDaylight(value='DAY') {
  if(value&&typeof value==='object'&&value.from&&value.to)return value;
  const input=typeof value==='number'?value:(phaseHours[value]??12);
  const hour=((Number.isFinite(input)?input:12)%24+24)%24;
  const index=stops.findIndex((stop,i)=>i<stops.length-1&&hour>=stop[0]&&hour<stops[i+1][0]);
  const [start,from]=stops[index], [end,to]=stops[index+1];
  const blend=from===to?0:smoothstep(start,end,hour);
  const a=daylightGrades[from],b=daylightGrades[to];
  const night=1-smoothstep(4.8,7,hour)+smoothstep(18,20.8,hour);
  const day=smoothstep(6.5,8.5,hour)*(1-smoothstep(16.5,19,hour));
  return {hour,from,to,blend,sky:a.sky.map((color,i)=>color.map((v,c)=>mix(v,b.sky[i][c],blend))),
    floor:a.floor.map((v,c)=>mix(v,b.floor[c],blend)),
    stars:1-smoothstep(4.8,6.5,hour)+smoothstep(18.8,21,hour),
    moon:night,lamps:night,fireflies:night*.68,butterflies:day,leaves:day};
}

export const rgb = color => 'rgb('+color.map(value=>Math.round(value)).join(',')+')';

export function skyStars(camera,seconds,lighting) {
  const light=sampleDaylight(lighting),stars=[];
  if(light.stars<=0)return stars;
  const time=Number.isFinite(seconds)?Math.max(0,seconds):0;
  // Fixed world-space cells keep the sky stable as the camera pans or time advances.
  for(let i=0;i<840;i++) {
    const seed=(i*16807+71)%2147483647;
    const x=Math.round((seed*131%4093)/4093*2200-800-camera.pixelX*.035+camera.width/2);
    const y=Math.round(5+(seed*47%997)/997*Math.max(1,camera.ground-55));
    const brightness=.34+(seed%17)/25;
    const alpha=light.stars*brightness*(.91+.09*Math.sin(time*.35+i*2.3));
    if(x>=0&&x<camera.width&&y<camera.ground-42)stars.push({id:i,x,y,alpha,size:1});
  }
  return stars;
}

export function drawSkyStars(ctx,camera,seconds,lighting) {
  ctx.save();
  for(const star of skyStars(camera,seconds,lighting)) {
    ctx.globalAlpha=star.alpha;ctx.fillStyle=star.id%7?'#d7e5dc':'#ead5aa';ctx.fillRect(star.x,star.y,1,1);
  }
  ctx.restore();
}
