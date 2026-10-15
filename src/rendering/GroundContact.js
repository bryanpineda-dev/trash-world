export function groundContacts(rows, anchor) {
  const columns=new Set();
  for(let y=Math.max(0,anchor[1]-2);y<Math.min(rows.length,anchor[1]);y++) {
    for(let x=0;x<rows[y].length;x++)if(rows[y][x]!=='.')columns.add(x);
  }
  const runs=[];
  for(const x of [...columns].sort((a,b)=>a-b)) {
    const previous=runs.at(-1);
    if(previous&&x===previous.end+1)previous.end=x;
    else runs.push({start:x,end:x});
  }
  return runs.map(({start,end})=>({x:start-anchor[0]-1,width:end-start+3}));
}

export function drawContactShadow(ctx, contacts, x, y, direction=1) {
  ctx.save();ctx.fillStyle='#10171a';
  for(const contact of contacts) {
    const left=direction<0?-contact.x-contact.width:contact.x;
    ctx.globalAlpha=.16;ctx.fillRect(Math.round(x+left),Math.round(y),contact.width,1);
    ctx.globalAlpha=.06;ctx.fillRect(Math.round(x+left+1),Math.round(y+1),Math.max(1,contact.width-2),1);
  }
  ctx.restore();
}
