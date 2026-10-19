import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStudyAssets, palettes } from '../studies/cemetery/drawings.js';
import { createBitmap, paintPixels, encodePng } from './png.js';

export function cemeteryStudyExports() {
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
  return files;
}

export function exportCemeteryStudy(root=new URL('../.cache/legacy-assets/cemetery/',import.meta.url),check=false) {
  const files=cemeteryStudyExports();
  for(const [path,bytes] of files) {
    const target=new URL(path,root);
    if(check) {
      if(!readFileSync(target).equals(bytes))throw new Error('Outdated study export: '+path);
    } else {
      mkdirSync(new URL('./',target),{recursive:true});writeFileSync(target,bytes);
    }
  }
  console.log(`Cemetery study: ${files.size} exports ${check?'verified':'written'} in ${root.href}; production biome untouched.`);
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))exportCemeteryStudy(undefined,process.argv.includes('--check'));
