import { readFileSync, writeFileSync } from 'node:fs';
import { forestBase } from './forest-base.js';

const root=new URL('../assets/source/environment/trees/',import.meta.url);
for(const [name,seed] of [['forest-backdrop.json',0],['forest-backdrop-east.json',2]]) {
  const path=new URL(name,root),sprite=JSON.parse(readFileSync(path,'utf8'));
  sprite.pixels=forestBase(sprite.pixels,seed);
  sprite.anchor[1]=sprite.pixels.findLastIndex(row=>[...row].some(token=>token!=='.'))+1;
  writeFileSync(path,JSON.stringify(sprite,null,2)+'\n');
}
