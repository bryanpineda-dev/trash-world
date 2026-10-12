import { readFileSync, writeFileSync } from 'node:fs';
import { readBiomeSource } from './biome-source.js';
import { validateBiome } from '../src/rendering/BiomeModel.js';
import { forestBase } from './forest-base.js';
import { raster, curve, woodSurface, leafMass, vine, wind, barkScars, noise, hash, WOOD, LEAVES } from './forest-brushes.js';

const root = new URL('../assets/source/', import.meta.url);
const index = JSON.parse(readFileSync(new URL('biome.json', root)));
const source = readBiomeSource(), sprites = { ...source.sprites };
const stem = (points, radii) => ({ id: 'stem', points, radii });
function fork(parent, at, controls, radii, id) {
  return { id, parent: parent.id, at, points: [curve(parent.points, at), ...controls], radii };
}
const plans = {
  oak: { label: 'Roble antiguo del claro', seed: 7,
    stem: stem([[66,179],[67,137],[110,107],[131,40]], [14,3]),
    forks: [[.52, [[80,102],[58,86],[35,61]], [7,1.4]], [.74, [[135,78],[151,61],[153,34]], [5,1]],
      [.85, [[113,53],[96,36],[85,16]], [4,1]]],
    rear: [[31,42,28,22,2],[75,32,37,27,4],[131,40,32,29,6],[106,74,43,23,8]],
    front: [[28,25,23,17,12],[65,16,30,15,14],[110,18,35,16,16],[147,37,24,21,18],
      [131,66,32,25,20],[82,55,28,20,22],[35,67,27,25,24]],
    vines: [[25,85,36,2],[56,70,31,-2],[126,88,34,2],[150,82,22,-1]] },
  oakHollow: { label: 'Roble viejo de copa partida', seed: 18,
    stem: stem([[86,179],[80,145],[86,104],[81,38]], [17,4]),
    forks: [[.54, [[65,103],[47,83],[28,56]], [8,1.5]], [.68, [[111,89],[132,63],[144,32]], [6,1.3]],
      [.86, [[81,53],[68,37],[64,15]], [4,1]]],
    rear: [[36,48,29,25,4],[83,26,39,24,6],[134,42,31,27,8],[91,72,45,24,10]],
    front: [[28,31,24,22,13],[62,17,31,16,15],[109,17,34,16,17],[147,37,24,24,19],
      [116,68,35,23,21],[44,70,29,25,23]],
    vines: [[33,89,32,1],[110,89,33,-2],[151,61,25,1]] },
  leaningOak: { label: 'Roble inclinado de ramas ascendentes', seed: 31,
    stem: stem([[53,179],[73,141],[112,104],[130,36]], [13,3]),
    forks: [[.55, [[73,104],[55,87],[35,57]], [7,1.5]], [.74, [[138,73],[149,55],[156,27]], [5,1]],
      [.86, [[112,55],[100,38],[90,17]], [4,1]]],
    rear: [[30,45,24,28,6],[83,29,34,25,8],[136,40,34,25,10],[83,73,41,25,12]],
    front: [[22,32,18,22,17],[60,18,31,17,19],[105,16,31,14,21],[148,32,24,24,23],
      [130,64,30,25,25],[55,63,27,21,27]],
    vines: [[26,84,35,2],[68,83,30,-1],[130,86,35,1]] },
};
for (const [id, plan] of Object.entries(plans)) {
  const d = raster(176, 192), strokes = [plan.stem];
  plan.forks.forEach(([at, controls, radii], i) => strokes.push(fork(plan.stem, at, controls, radii, 'limb-' + i)));
  const base = plan.stem.points[0][0];
  strokes.push(fork(plan.stem,.04,[[base-7,184],[base-23,187],[base-34,189]],[8,1.5],'root-left'));
  strokes.push(fork(plan.stem,.03,[[base+13,183],[base+29,187],[base+41,189]],[8,1.5],'root-right'));
  for (const args of plan.rear) leafMass(d, ...args, -.8);
  woodSurface(d, strokes, plan.seed);
  barkScars(d,plan.stem);
  if (id === 'oakHollow') {
    for (let y = 132; y < 156; y++) for (let x = 76; x <= 91; x++) {
      if (((x - 83) / 6) ** 2 + ((y - 144) / 11) ** 2 < 1) d.pixel(x, y, x < 79 ? 'w' : 'u', WOOD);
    }
  }
  for (const args of plan.front) leafMass(d, ...args, .25);
  plan.vines.forEach(([x,y,length,bend], i) => vine(d,x,y,length,bend,plan.seed+i));
  leafMass(d,base-18,187,17,3,2,-.9); leafMass(d,base+19,187,18,3,5,-.9);
  d.line(base-33,190,base+40,190,'i');
  sprites[id] = wind({ ...d.finish(id,plan.label,[88,191]), woodStructure: strokes });
}

{
  const d = raster(104,146), trunk = stem([[44,136],[42,99],[58,77],[54,21]],[6,1.5]);
  const strokes = [trunk, fork(trunk,.5,[[31,77],[19,61],[12,37]],[3.4,.8],'limb-left'),
    fork(trunk,.74,[[71,52],[83,42],[87,22]],[2.4,.8],'limb-right'),
    fork(trunk,.05,[[32,140],[25,142],[21,144]],[4,1],'root-left'),
    fork(trunk,.04,[[56,139],[68,142],[76,144]],[4,1],'root-right')];
  for(const args of [[25,40,21,26,2],[53,24,28,22,5],[80,47,20,25,7],[40,68,23,20,9]])leafMass(d,...args,-.5);
  woodSurface(d,strokes,13,'zABC');
  for(let y=68;y<132;y+=9) { d.line(44,y,48,y+1,'z','ABC');d.line(51,y+3,57,y+3,'A','BC'); }
  for(const args of [[18,24,15,18,12],[50,17,26,15,14],[78,32,21,20,16],[32,57,21,19,18]])leafMass(d,...args,.1);
  vine(d,22,73,22,1,6);vine(d,70,65,24,-1,8);d.line(20,144,76,144,'i');
  sprites.birch=wind({...d.finish('birch','Abedul de horquillas continuas',[52,145]),woodStructure:strokes});
}

{
  const d=raster(168,176), trunk=stem([[75,162],[65,129],[89,99],[84,52]],[13,3]);
  const strokes=[trunk];
  const left=fork(trunk,.54,[[56,99],[35,72],[26,36]],[7,1.2],'left');
  const right=fork(trunk,.74,[[119,78],[148,68],[157,31]],[5.2,1.2],'right');
  const top=fork(trunk,.94,[[79,47],[87,24],[83,5]],[3.2,1],'top');
  strokes.push(left,right,top,
    fork(left,.57,[[28,69],[17,63],[5,42]],[3,.8],'twig-left'),
    fork(left,.33,[[45,81],[53,62],[45,40]],[3.2,.8],'twig-inner'),
    fork(right,.63,[[130,53],[129,34],[138,18]],[2.4,.8],'twig-right'),
    fork(top,.48,[[69,34],[56,24],[56,11]],[2,.8],'twig-top'),
    fork(trunk,.05,[[60,168],[43,171],[22,174]],[7,1.2],'root-left'),
    fork(trunk,.04,[[88,168],[111,171],[135,174]],[7,1.2],'root-right'));
  woodSurface(d,strokes,21);vine(d,45,90,32,1,10);vine(d,119,80,31,-1,11);vine(d,77,125,27,-1,12);
  d.line(22,174,135,174,'i');sprites.twistedTree={...d.finish('twistedTree','Arbol seco de bifurcaciones naturales',[88,175]),woodStructure:strokes};
}

for (const [id, width, seed, broken] of [['cypress',64,24,false],['brokenCypress',72,37,true]]) {
  const d=raster(width,168), cx=width/2;
  const trunk=stem([[cx,159],[cx-3,108],[cx+1,58],[cx,9]],[5,1]);
  const strokes=[trunk,fork(trunk,.06,[[cx-8,162],[cx-12,164],[cx-20,166]],[4,1],'root-left'),
    fork(trunk,.05,[[cx+8,161],[cx+15,164],[cx+21,166]],[4,1],'root-right')];
  woodSurface(d,strokes,seed);
  for (let y=broken?22:4;y<146;y++) {
    const ny=(y-4)/142, axis=cx+Math.sin(y/37)*2-(broken?3:0);
    const half=2+ny*22+(noise(0,y,11,seed)-.5)*7;
    for (let x=Math.ceil(axis-half);x<=axis+half;x++) {
      const shade=1.1+noise(x,y,12,seed)*2.7+noise(x,y,5,seed+2)*.65-(x-axis)/half*.5;
      d.pixel(x,y,LEAVES[Math.max(1,Math.min(5,Math.floor(shade)))]);
    }
  }
  for(let y=18;y<140;y+=11) {
    const x=cx-3+Math.round(noise(0,y,12,seed)*6);
    d.line(x,y,x+2,y+3,'m',LEAVES);d.line(x-3,y+3,x+1,y+4,'j',LEAVES);
  }
  d.line(cx-20,166,cx+21,166,'i');
  sprites[id]=wind({...d.finish(id,broken?'Cipres de copa vencida':'Cipres de follaje vertical',[cx,167]),woodStructure:strokes});
}

{
  const d=raster(56,84), trunk=stem([[28,79],[26,60],[28,41],[27,18]],[4,1]);
  woodSurface(d,[trunk],5,'tig');
  for(const args of [[15,30,12,18,2],[29,17,17,15,4],[42,32,10,17,6],[29,46,20,15,8]])leafMass(d,...args,-1.4);
  d.line(10,82,48,82,'i');
  const s=d.finish('distantOak','Roble distante de masas simplificadas',[28,83]);
  s.pixels=s.pixels.map(row=>row.replace(/[mnq]/g,'j'));sprites.distantOak=s;
}

for(const [id, lobes, conifers, label]of [
  ['forestBackdrop',[[20,66,30,26,3],[72,52,36,28,5],[126,63,34,30,7],[174,75,31,24,9]],
    [[47,12,13],[108,26,14],[158,19,14]],'Bosque lejano de robles y cipreses'],
  ['forestBackdropEast',[[18,78,30,22,13],[78,66,32,25,17],[135,77,34,27,21],[182,61,28,28,25]],
    [[62,17,12],[141,10,13]],'Bosque lejano de copas abiertas'],
]) {
  const d=raster(192,112);
  for(const [cx,cy,rx,ry,seed] of lobes) {
    d.rect(cx-2,cy,4,111-cy,'t');leafMass(d,cx,cy,rx,ry,seed,-1.3);
  }
  for(const [cx,top,width] of conifers)for(let y=top;y<111;y++) {
    const half=Math.max(.7,.4+(y-top)/(111-top)*width+Math.sin(y*.82+cx)*1.5);
    for(let x=cx-half;x<=cx+half;x++)d.pixel(x,y,noise(x,y,15,cx)>.55?'g':'t');
  }
  for(let x=0;x<192;x++)d.line(x,87+Math.round(Math.sin(x/15)*3),x,110,'t');
  const s={...d.finish(id,label,[96,111]),haze:.16};
  s.pixels=forestBase(s.pixels.map(row=>row.replace(/[mnq]/g,'j')),id==='forestBackdrop'?0:2);sprites[id]=s;
  s.anchor[1]=s.pixels.findLastIndex(row=>[...row].some(token=>token!=='.'))+1;
  if(!index.assetFiles.some(a=>a.id===s.id))index.assetFiles.push({id:s.id,path:'trees/forest-backdrop.json'});
  index.assetFiles.find(a=>a.id===id).path=id==='forestBackdrop'?'trees/forest-backdrop.json':'trees/forest-backdrop-east.json';
}

{
  const d=raster(32,32);
  for(let y=0;y<31;y++)for(let x=0;x<32;x++) {
    const r=Math.hypot(x-15.5,y-15.5);
    if(r<=15)d.pixel(x,y,r>13&&x+y>29?'b':'h');
  }
  for(const [cx,cy,rx,ry,seed]of [[9,8,3,2,3],[23,7,4,3,5],[20,21,3,2,7],[8,21,2,3,9]]) {
    for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<1.05)
      d.pixel(x,y,noise(x,y,3,seed)>.7?'b':'f','hb');
  }
  sprites.moon=d.finish('moon','Luna palida de crateres agrupados',[16,31]);
}

{
  const d=raster(24,24);
  for(let y=0;y<23;y++)for(let x=0;x<24;x++) {
    const r=Math.hypot(x-11.5,y-11.5);
    if(r<=11)d.pixel(x,y,r>9.5&&x+y>22?'s':'b');
  }
  sprites.sun=d.finish('sun','Sol velado del claro',[12,23]);
  if(!index.assetFiles.some(a=>a.id==='sun'))index.assetFiles.push({id:'sun',path:'sky/sun.json'});
}

// Chiselled faces and varied stone courses stay inside the approved masonry silhouettes.
for(const id of ['ruins','church']) {
  const original=sprites[id], d=raster(...original.size);
  original.pixels.forEach((row,y)=>[...row].forEach((token,x)=>d.pixel(x,y,token)));
  for(let y=0;y<d.height-1;y++)for(let x=1;x<d.width-1;x++) {
    const token=original.pixels[y][x];
    if(!'zABC'.includes(token))continue;
    const above=original.pixels[y-1]?.[x]??'.',left=original.pixels[y][x-1],right=original.pixels[y][x+1];
    const cell=Math.floor((x+(Math.floor(y/7)%2)*7)/13),course=Math.floor(y/7);
    const side=id==='church'?x>55:x>28&&x<44||x>96;
    let shade=side?'A':'B';
    if(token==='z')shade='z';
    else if(above==='.'||left==='.')shade='C';
    else if(right==='.')shade='z';
    else if(y%7===0&&hash(cell,course,2)>.2)shade='A';
    else if((x+(course%2)*7)%13===0&&y%7>1)shade='A';
    else if(noise(x,y,4,id==='church'?5:9)>.68)shade='A';
    else if(hash(cell,course,8)>.63&&y%7===2&&(x+course*3)%7<3)shade='C';
    d.pixel(x,y,shade);
  }
  if(id==='church') {
    for(let y=49;y<78;y++) {
      const half=y-43;
      d.line(40-half+2,y,40-half+5,y,'B','zA');d.line(40+half-5,y,40+half-2,y,'A','zA');
    }
    for(const x of [11,16,64,69])d.line(x,81,x,102,x<40?'C':'A','zABC');
    for(const cx of [34,46]) {
      d.line(cx-5,96,cx+5,96,'C');d.line(cx,78,cx,94,'A','Df');
      d.line(cx-3,83,cx+3,83,'A','Df');
    }
    d.line(8,110,72,110,'z');
  }
  sprites[id]={...original,pixels:d.finish(id,original.label,original.anchor).pixels};
}

const palettes={
  DAY:{sky:'#78909a',horizon:'#98afb3',mist:'#a7bcc0',earth:'#263d3e',
    colors:{d:'#183630',i:'#294a38',g:'#405f42',j:'#536e45',m:'#73865b',n:'#95a16c',q:'#b1b479',u:'#263536',v:'#44433c',w:'#625343',o:'#897052',x:'#a78c65',y:'#c3ad82',z:'#3d505a',A:'#60737b',B:'#83928e',C:'#b0b9a3'}},
  EVENING:{sky:'#687e8c',horizon:'#8da3ac',mist:'#a3b8bb',earth:'#23383c',
    colors:{d:'#16332f',i:'#274337',g:'#3b5640',j:'#526745',m:'#758060',n:'#96a073',q:'#b5b07b',u:'#253132',v:'#423e3d',w:'#5d4e43',o:'#846a51',x:'#a58b69',y:'#c1aa83',z:'#394b56',A:'#5a6d77',B:'#7a8c8a',C:'#a8b4a3'}},
  NIGHT:{sky:'#314c5b',horizon:'#607e90',mist:'#8faab6',earth:'#203338',
    colors:{d:'#122e2c',i:'#233f35',g:'#34503c',j:'#465f42',m:'#657853',n:'#869262',q:'#a6a472',u:'#202f32',v:'#3b3c39',w:'#574b40',o:'#7c654e',x:'#a08460',y:'#bba47b',z:'#334752',A:'#526a75',B:'#73898a',C:'#a2b2a0'}},
};
for(const [phase,{colors,...surfaces}]of Object.entries(palettes)) {
  Object.assign(index.palettes[phase],surfaces);Object.assign(index.palettes[phase].colors,colors);
}
const far=index.layers.find(layer=>layer.id==='far-wood');
far.placements=[[-45,-35],[29,-40],[115,-31],[211,-39],[302,-34],[400,-41],[489,-33],[562,-39]]
  .map(([x,y],i)=>({sprite:'distantOak',at:[x,y],...(i%2?{mirror:true}:{})}));
index.layers=index.layers.filter(layer=>layer.id!=='forest-horizon');
index.layers.unshift({id:'forest-horizon',depth:'far',parallax:.09,period:576,
  placements:[{sprite:'forestBackdrop',at:[0,-38]},{sprite:'forestBackdropEast',at:[192,-39]},{sprite:'forestBackdrop',at:[384,-37]}]});
const near=index.layers.find(layer=>layer.id==='near-wood');
near.placements.find(p=>p.sprite==='oak').at=[60,-6];
near.placements.find(p=>p.sprite==='oakHollow').at=[397,-7];
const middle=index.layers.find(layer=>layer.id==='middle-wood');
middle.placements.find(p=>p.sprite==='birch').at=[-78,-23];
middle.placements.find(p=>p.sprite==='cypress').at=[-25,-31];
middle.placements.find(p=>p.sprite==='ruins').at=[133,-24];
index.layers.find(layer=>layer.id==='architecture').placements[0].at=[21,-34];
near.placements.find(p=>p.sprite==='roundedGrave').at=[80,-12];
index.layers=index.layers.filter(layer=>layer.id!=='undergrowth');
index.layers.push({id:'undergrowth',depth:'near',parallax:1,period:560,placements:
  [[30,37],[121,41],[221,39],[328,42],[418,39],[525,40]].map(([x,y],i)=>({sprite:'fern',at:[x,y],...(i%2?{mirror:true}:{})}))});
for(const layer of index.layers)for(const p of layer.placements)if(sprites[p.sprite].animation)p.animationOffset=((p.at[0]%19+19)%19)/5;
validateBiome({...index,sprites});
const changed=['oak','oakHollow','leaningOak','birch','twistedTree','cypress','brokenCypress','distantOak','forestBackdrop','forestBackdropEast','church','ruins','moon','sun'];
for(const {id,path}of index.assetFiles.filter(a=>changed.includes(a.id)))writeFileSync(new URL('environment/'+path,root),JSON.stringify(sprites[id],null,2)+'\n');
writeFileSync(new URL('biome.json',root),JSON.stringify(index,null,2)+'\n');
console.log(JSON.stringify({changed,sourceSprites:index.assetFiles.length,pixelScale:1,characterChanged:false}));
