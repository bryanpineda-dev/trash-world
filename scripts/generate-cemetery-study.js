import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createStudyAssets, palettes } from '../studies/cemetery/drawings.js';
import { createBitmap, paintPixels, encodePng } from './png.js';

const root=new URL('../assets/studies/cemetery/',import.meta.url),check=process.argv.includes('--check');
const files=new Map([['palettes.json',Buffer.from(JSON.stringify(palettes,null,2)+'\n')]]);
for(const item of Object.values(createStudyAssets())) {
  const family=item.id==='studyOak'?'trees':'gravestones',prefix=family+'/'+item.id;
  files.set(prefix+'.json',Buffer.from(JSON.stringify(item,null,2)+'\n'));
  for(const phase of ['DAY','NIGHT']) {
    const bitmap=createBitmap(...item.size);
    paintPixels(bitmap,item.pixels,palettes[phase],0,0);
    files.set(prefix+'-'+phase.toLowerCase()+'.png',encodePng(bitmap));
  }
}
for(const [path,bytes] of files) {
  const target=new URL(path,root);
  if(check) {
    if(!readFileSync(target).equals(bytes))throw new Error('Outdated study export: '+path);
  } else {
    mkdirSync(new URL('./',target),{recursive:true});writeFileSync(target,bytes);
  }
}
console.log(`Cemetery study: ${files.size} exports ${check?'verified':'written'}; production biome untouched.`);
