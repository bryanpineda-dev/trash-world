export function roseGlass(x,y,r,g,b,width=140,height=208) {
  return ((x/width-57/140)/(9.2/140))**2+((y/height-118/208)/(11.5/208))**2<1&&r>120&&g>75&&r>g*1.06&&g>b*1.18;
}

export function candleState(seconds,index) {
  const t=Number.isFinite(seconds)?Math.max(0,seconds):0,phase=index*2.17;
  return {alpha:.86+.07*Math.sin(t*1.3+phase)+.025*Math.sin(t*2.17+phase*.8),
    lean:Math.sin(t*.92+phase)>.68?1:Math.sin(t*.92+phase)<-.68?-1:0,
    spill:.06+.012*Math.sin(t*.8+phase)+.006*Math.sin(t*1.7+phase)};
}

export const altarWicks=Object.freeze([[47,104],[57,100],[66,104]]);

export function drawAltarCandles(ctx,left,top,lighting,seconds,positions=altarWicks,scale=1) {
  ctx.save();ctx.translate(left,top);ctx.scale(scale,scale);
  for(const [index,[x,y]]of positions.entries()) {
    const {alpha,lean,spill}=candleState(seconds,index);
    ctx.save();
    if(lighting.lamps>0) {
      ctx.globalAlpha=spill*lighting.lamps;
      const glow=ctx.createRadialGradient(x,y,1,x,y,7);glow.addColorStop(0,'#ffc978');glow.addColorStop(1,'#ffc97800');
      ctx.fillStyle=glow;ctx.fillRect(x-7,y-7,14,14);
    }
    ctx.globalAlpha=alpha*(.72+.28*lighting.lamps);ctx.fillStyle='#e69c3f';ctx.fillRect(x-1,y-3,3,3);
    ctx.fillStyle='#ffe3a1';ctx.fillRect(x,y-3,1,3);ctx.fillRect(x+lean,y-4,1,1);
    ctx.fillStyle='#fff4d0';ctx.fillRect(x,y-2,1,1);ctx.restore();
  }
  ctx.restore();
}
