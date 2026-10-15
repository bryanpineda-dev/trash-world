import { createIcons, ArrowLeft, Sun, Moon, Trees, LayoutGrid, Scan, Maximize, Download } from 'lucide';
import { createStudyAssets } from './drawings.js';
import { drawScene, drawSheet } from './render.js';
import { biomeSource } from '../../src/rendering/BiomeSource.js';
import style from '../../assets/source/style.json';
import parts from '../../assets/source/parts.json';
import characters from '../../assets/source/characters.json';
import animations from '../../assets/source/animations.json';
import './style.css';

createIcons({icons:{ArrowLeft,Sun,Moon,Trees,LayoutGrid,Scan,Maximize,Download},attrs:{'aria-hidden':'true','stroke-width':1.7}});
const canvas=document.querySelector('#study'),ctx=canvas.getContext('2d'),viewport=document.querySelector('.viewport');
const assets=createStudyAssets(),catalog={style,parts,characters,animations};
const params=new URLSearchParams(location.search);
let phase=params.get('phase')==='DAY'?'DAY':'NIGHT';
let view=['scene','sheet','silhouette'].includes(params.get('view'))?params.get('view'):'scene';
let zoom=['1','2','3'].includes(params.get('zoom'))?params.get('zoom'):'fit';
function size() {
  const scale=zoom==='fit'?Math.min(2,viewport.clientWidth/560):Number(zoom);
  canvas.style.width=560*scale+'px';canvas.style.height=248*scale+'px';
  viewport.dataset.overflow=String(560*scale>viewport.clientWidth);
}
function render() {
  if(view==='scene')drawScene(ctx,assets,biomeSource,catalog,phase);else drawSheet(ctx,assets,phase,view==='silhouette');
  for(const button of document.querySelectorAll('[data-phase]'))button.setAttribute('aria-pressed',String(button.dataset.phase===phase));
  for(const button of document.querySelectorAll('[data-view]'))button.setAttribute('aria-pressed',String(button.dataset.view===view));
  for(const button of document.querySelectorAll('[data-zoom]'))button.setAttribute('aria-pressed',String(button.dataset.zoom===zoom));
  const label=({scene:'Escena',sheet:'Assets',silhouette:'Siluetas'})[view]+' / '+(phase==='DAY'?'Dia':'Noche');
  document.querySelector('#caption').textContent=label;canvas.setAttribute('aria-label',label);
  history.replaceState(null,'','?'+new URLSearchParams({phase,view,zoom}));
  size();
}
document.querySelector('.toolbar').addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.phase)phase=button.dataset.phase;
  if(button.dataset.view)view=button.dataset.view;
  if(button.dataset.zoom)zoom=button.dataset.zoom;
  render();
});
document.querySelector('#download').addEventListener('click',()=>{
  const link=document.createElement('a');link.download='trash-world-study-'+view+'-'+phase.toLowerCase()+'.png';link.href=canvas.toDataURL('image/png');link.click();
});
new ResizeObserver(size).observe(viewport);
render();
