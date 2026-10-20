import {createIcons,Pause,Play,RotateCcw,ArrowLeftRight} from 'lucide';
import {AssetLibrary} from '../../src/rendering/AssetLibrary.js';
import {drawPixels} from '../../src/rendering/Sprites.js';
import {paletteOf} from '../../src/rendering/AssetModel.js';
import {phaseAtDistance,sampleJointRig,validateJointRig} from '../../src/animation/JointRig.js';
import {jointSkinPixels,validateJointSkin} from './pixels.js';
import {WorldPreview} from './WorldPreview.js';
import rig from './rig.json';
import motion from './walk.json';
import skin from './skin.json';
import parts from '../../assets/source/parts.json';
import style from '../../assets/source/style.json';
import './style.css';

validateJointRig(rig,motion);
validateJointSkin(rig,skin,parts);
const $=id=>document.getElementById(id),assets=new AssetLibrary(),palette=paletteOf(style);
const icons=()=>createIcons({icons:{Pause,Play,RotateCcw,ArrowLeftRight},attrs:{'stroke-width':1.7,'aria-hidden':'true'}});
let playing=true,elapsed=0,distance=0,direction=1,previous=null;
let worldPreview=null;
const profile={rig,motion,skin,parts,palette};
function playback(value){playing=value;$('play').innerHTML=`<i data-lucide="${value?'pause':'play'}"></i>`;$('play').setAttribute('aria-label',value?'Pausar':'Reproducir');$('play').title=value?'Pausar':'Reproducir';icons();}
$('play').onclick=()=>playback(!playing);
$('reset').onclick=()=>{distance=0;elapsed=0;worldPreview?.reset(direction);};
$('direction').onclick=()=>{direction*=-1;if(worldPreview)worldPreview.travel.direction=direction;};
$('speed').oninput=()=>{$('speed-value').textContent=$('speed').value+' px/s';};
$('phase').oninput=()=>{playback(false);distance=Number($('phase').value)/1000*motion.stride;elapsed=distance/Number($('speed').value);if(worldPreview)Object.assign(worldPreview.travel,{distance,elapsed});};
function changeView(){
  worldPreview?.destroy();worldPreview=null;distance=0;elapsed=0;previous=null;
  const world=$('view').value==='world';$('views').classList.toggle('world',world);$('zoom').disabled=world;$('hour').disabled=!world;
  for(const id of ['before','after']){$(id).width=world?640:320;$(id).height=world?400:192;}
  if(world){worldPreview=new WorldPreview($('before'),$('after'),profile);worldPreview.reset(direction);}
}
$('view').onchange=changeView;
const query=new URLSearchParams(location.search);
if(query.get('view')==='world')$('view').value='world';
if(query.get('hour')==='22')$('hour').value='22';
changeView();
document.addEventListener('visibilitychange',()=>{previous=null;});
icons();
function stage(canvas,travel) {
  const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.fillStyle='#27393c';ctx.fillRect(0,0,320,192);
  ctx.fillStyle='#394c4a';ctx.fillRect(0,174,320,18);ctx.fillStyle='#8c9d7b';ctx.fillRect(0,174,320,1);
  const shift=Math.round(travel*Number($('zoom').value))*direction;
  ctx.fillStyle='#607465';for(let x=-32;x<352;x+=32)ctx.fillRect(x-((shift%32)+32)%32,180,8,2);
  return ctx;
}
function render(now) {
  const dt=previous===null?0:Math.min(.05,(now-previous)/1000);previous=now;
  const colors=$('skin').value==='cool'?{...palette,h:'#dbebdf',b:'#96c0b7',s:'#597b80'}:palette;
  if(worldPreview){
    worldPreview.step(playing?dt:0,Number($('speed').value));
    ({elapsed,distance,direction}=worldPreview.travel);
    worldPreview.draw(playing?dt:0,Number($('hour').value),$('joints').checked,colors);
  }else if(playing){elapsed+=dt;distance+=dt*Number($('speed').value);}
  const phase=phaseAtDistance(distance,motion.stride),pose=sampleJointRig(rig,motion,phase),zoom=Number($('zoom').value);
  if(!worldPreview){
  const old=stage($('before'),distance),current=stage($('after'),distance);
  assets.drawCharacter(old,'miga','walk',elapsed,160,174,direction,zoom);
  current.save();current.translate(160,174);current.scale(direction,1);
  drawPixels(current,jointSkinPixels(rig,skin,parts,pose),colors,-rig.anchor[0]*zoom,-rig.anchor[1]*zoom,zoom);
  if($('joints').checked)for(const bone of rig.bones){const joint=pose.joints[bone.id];current.fillStyle=bone.id.startsWith('far')?'#6ee7cb':'#f3aa64';current.fillRect(Math.round((joint.x-rig.anchor[0])*zoom)-1,Math.round((joint.y-rig.anchor[1])*zoom)-1,3,3);}
  current.restore();
  }
  $('phase').value=Math.round(phase*1000);$('phase-value').textContent=Math.round(phase*100)+'%';
  $('contact').textContent=pose.contact==='nearAnkle'?'Apoyo cercano':'Apoyo lejano';
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
