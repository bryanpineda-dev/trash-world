import { createIcons, ArrowLeft, Trees, LayoutGrid, Sun, Moon, Play, Pause, Download } from 'lucide';
import { ArchitectureStudy } from './render.js';
import './style.css';

const icons={ArrowLeft,Trees,LayoutGrid,Sun,Moon,Play,Pause,Download};
const refreshIcons=()=>createIcons({icons,attrs:{'aria-hidden':'true','stroke-width':1.7}});
refreshIcons();
const $=selector=>document.querySelector(selector),canvas=$('#study'),ctx=canvas.getContext('2d');
const params=new URLSearchParams(location.search),focus=$('#focus'),revision=$('#revision'),hour=$('#hour'),pan=$('#pan'),cemetery=$('#cemetery');
cemetery.checked=params.get('graves')!=='0';
function option(control,value) {if([...control.options].some(o=>o.value===value))control.value=value;}
option(focus,params.get('focus'));option(revision,params.get('revision'));
if(params.has('hour')&&Number.isFinite(Number(params.get('hour'))))hour.value=String(((Number(params.get('hour'))%24)+24)%24);
if(params.has('pan')&&Number.isFinite(Number(params.get('pan'))))pan.value=params.get('pan');
let view=params.get('view')==='pieces'?'pieces':'scene',seconds=Math.max(0,Number(params.get('seconds'))||0),ready=false;
let playing=params.get('paused')==='0'&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
const study=new ArchitectureStudy();
function sync() {
  const minutes=Math.round(Number(hour.value)*60)%1440;
  $('#time').value=String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0');
  for(const button of document.querySelectorAll('[data-view]'))button.setAttribute('aria-pressed',String(button.dataset.view===view));
  $('#day').setAttribute('aria-pressed',String(Number(hour.value)===12));$('#night').setAttribute('aria-pressed',String(Number(hour.value)===22));
  const label=playing?'Pausar':'Reproducir';$('#play').title=label;$('#play').setAttribute('aria-label',label);
  $('#play').innerHTML=`<i data-lucide="${playing?'pause':'play'}"></i>`;refreshIcons();
  const name=focus.selectedOptions[0].textContent;
  $('#caption').value=revision.selectedOptions[0].textContent+' / '+name;
  pan.disabled=view==='pieces';
  cemetery.disabled=view==='pieces'||revision.value==='original';
  canvas.setAttribute('aria-label',`${view==='scene'?'Escena':'Piezas'} / ${name} / ${$('#time').value} / ${revision.selectedOptions[0].textContent}`);
  history.replaceState(null,'','?'+new URLSearchParams({view,focus:focus.value,revision:revision.value,hour:hour.value,pan:pan.value,graves:cemetery.checked?'1':'0',paused:playing?'0':'1'}));
}
function render() {
  if(!ready)return;
  study.draw(ctx,{hour:Number(hour.value),seconds,view,original:revision.value==='original',focus:focus.value,pan:Number(pan.value),width:canvas.width,cemetery:cemetery.checked});
}
function resize() {
  const available=$('.viewport').clientWidth;
  const mobile=available<600;
  canvas.width=mobile?320:640;canvas.height=400;
  const height=Math.max(400,innerHeight-$('.viewport').getBoundingClientRect().top-document.querySelector('footer').getBoundingClientRect().height);
  const scale=Math.max(1,Math.floor(Math.min(available/canvas.width,height/400)));
  const displayWidth=Math.min(available,canvas.width*scale);
  canvas.style.width=displayWidth+'px';canvas.style.height=displayWidth/canvas.width*400+'px';
  $('#dimensions').value=canvas.width+' x 400';render();
}
document.querySelector('.toolbar').addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.view)view=button.dataset.view;
  if(button.id==='day')hour.value='12';
  if(button.id==='night')hour.value='22';
  if(button.id==='play')playing=!playing;
  sync();render();
});
for(const input of [focus,revision,hour,pan,cemetery])input.addEventListener(input.type==='range'?'input':'change',()=>{sync();render();});
$('#download').addEventListener('click',()=>{
  const a=document.createElement('a');a.download=`trash-world-architecture-${revision.value}-${focus.value}-${hour.value}.png`;a.href=canvas.toDataURL('image/png');a.click();
});
let previous=performance.now();
function tick(now) {
  if(playing&&ready&&!document.hidden){seconds+=Math.min(.05,(now-previous)/1000);render();}
  previous=now;requestAnimationFrame(tick);
}
new ResizeObserver(resize).observe($('.viewport'));sync();resize();requestAnimationFrame(tick);
window.addEventListener('resize',resize);
study.loading.then(()=>{ready=true;$('#status').textContent='Sandbox';render();}).catch(error=>{
  $('#status').textContent='Error';$('#error').hidden=false;$('#error').textContent=error.message;console.error(error);
});
