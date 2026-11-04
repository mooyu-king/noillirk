import {projectGlobe} from './projection.mjs';
import {countries} from './data.mjs';
import {pilots} from './pilots.mjs';
import {drawPilot} from './pilot-motion.mjs';
import {createCrowdStage} from './crowd-stage.mjs';
const rad=Math.PI/180,TAU=Math.PI*2;
const palettes=[['#e9a34e','#e7b68a','#70402c'],['#43a69d','#a56743','#342b29'],['#b58bc8','#edc7a5','#61422e'],['#638cce','#c58b63','#242c3e']];
export function shortestTurn(from,to){return ((to-from+540)%360)-180}
export function createScene(canvas,onSelect,onStatus=()=>{}){
 const ctx=canvas.getContext('2d');if(!ctx){onStatus('Map graphics unavailable. Search and all scoring still work.');return {set(){},rotate(){},skip(){},destroy(){}}}
 let angle=0,startAngle=0,target=0,turnAt=0,selected='',pilot=0,phase='question',score=0,history=[],reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,flat=true,frame,points=[],last=0,features=[],hitShapes=[],zoom=1,disposed=false;
 let latitude=0,startLatitude=0,targetLatitude=0,startZoom=1,targetZoom=1;
 const controller=new AbortController();
 const portraits=pilots.map(p=>{const img=new Image();img.src=p.image;return img});
 const crowdStage=createCrowdStage(ctx,portraits);let mode='hot',accepted=false,stageAt=0;
 fetch('atlas.json',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('map');return r.json()}).then(data=>{features=data.features;onStatus('')}).catch(()=>{if(!disposed)onStatus('Map outlines unavailable. Country markers and search remain available.')});
 function project(lat,lon,w,h){if(flat)return {x:(lon+180)/360*w*.94+w*.03,y:(90-lat)/180*h*.69+h*.09,z:1};const r=Math.min(w*.39,h*.32)*zoom,a=(lon-angle)*rad,b=lat*rad;return projectGlobe(lat,lon,angle,latitude,r,w/2,h*.43);}
 function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill()}
 function pill(x,y,w,h,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,Math.min(w,h)/2);ctx.fill()}
 function person(x,y,size,id,t,action='idle'){
  const portrait=portraits[id];
  if(portrait?.complete&&portrait.naturalWidth){
   const height=132*size,feet=y+38*size;ellipse(x,feet+2,22*size,5*size,'#143e4433');drawPilot(ctx,portrait,x,feet,height,id,t,action!=='idle',reduced);return;
  }
  const [suit,skin,hair]=palettes[id%4],bob=reduced?0:Math.sin(t/430+id)*2,cheer=action==='cheer'||action==='win';ctx.save();ctx.translate(x,y+bob);ctx.scale(size,size);
  ellipse(0,39,20,5,'#143e4433');
  ctx.strokeStyle='#243c4b';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-7,16);ctx.lineTo(-9,33);ctx.moveTo(7,16);ctx.lineTo(10,33);ctx.stroke();pill(-16,30,14,8,'#2d303b');pill(4,30,15,8,'#2d303b');
  const body=ctx.createLinearGradient(-16,0,15,0);body.addColorStop(0,suit);body.addColorStop(.55,'#f1dcac');body.addColorStop(1,suit);pill(-15,-6,30,32,body);
  ctx.strokeStyle=suit;ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(-13,0);ctx.lineTo(-25,cheer?-21:14);ctx.moveTo(13,0);ctx.lineTo(25,cheer?-21:14);ctx.stroke();ellipse(-25,cheer?-23:16,5,6,skin);ellipse(25,cheer?-23:16,5,6,skin);
  ellipse(-17,-23,5,7,skin);ellipse(17,-23,5,7,skin);
  const face=ctx.createRadialGradient(-7,-32,2,0,-22,24);face.addColorStop(0,'#ffe0b4');face.addColorStop(1,skin);ellipse(0,-24,id===2?17:19,id===1?21:19,face);
  ctx.fillStyle=hair;ctx.beginPath();ctx.ellipse(0,-34,20,14,0,Math.PI,TAU);ctx.lineTo(20,-24);ctx.quadraticCurveTo(11,-40,-14,-31);ctx.lineTo(-20,-24);ctx.fill();
  if(id===1){for(let i=0;i<6;i++)ellipse(-16+i*6,-39-Math.sin(i)*2,6,6,hair)}
  if(id===2){pill(-23,-40,8,35,hair);pill(15,-40,8,35,hair)}
  if(id===3){pill(-22,-48,43,15,'#e9d3ad');pill(-4,-39,34,6,'#e9d3ad')}
  else{pill(-17,-47,34,14,id===0?'#8c542f':suit)}
  ctx.strokeStyle='#293a42';ctx.lineWidth=3;for(const x of [-9,9]){ellipse(x,-37,8,6,'#a3dce2');ctx.beginPath();ctx.ellipse(x,-37,8,6,0,0,TAU);ctx.stroke()}
  ellipse(-7,-22,2,3,'#302a29');ellipse(7,-22,2,3,'#302a29');ctx.strokeStyle='#8b4937';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-18,6,.1,Math.PI-.1);ctx.stroke();
  pill(-16,-8,32,7,id===2?'#f5cd64':'#fff0be');ctx.fillStyle='#f5cb68';ctx.beginPath();ctx.moveTo(9,-3);ctx.lineTo(29+(reduced?0:Math.sin(t/280)*3),6);ctx.lineTo(17,14);ctx.closePath();ctx.fill();
  if(action==='win'){ctx.fillStyle='#ffe18c';ctx.beginPath();ctx.moveTo(-14,-58);ctx.lineTo(-17,-72);ctx.lineTo(-5,-65);ctx.lineTo(0,-78);ctx.lineTo(7,-65);ctx.lineTo(18,-72);ctx.lineTo(13,-58);ctx.closePath();ctx.fill()}
  ctx.restore();
 }
 function drawLand(w,h){hitShapes=[];for(const f of features){const path=new Path2D();for(const polygon of f.rings){for(const ring of polygon){if(flat){for(const shift of [-360,0,360]){let prev=ring[0][0],pen=false;for(const [rawLon,lat] of ring){let lon=rawLon;while(lon-prev>180)lon-=360;while(lon-prev< -180)lon+=360;prev=lon;const p=project(lat,lon+shift,w,h);if(!pen){path.moveTo(p.x,p.y);pen=true}else path.lineTo(p.x,p.y)}path.closePath()}}else{const projected=ring.map(([lon,lat])=>project(lat,lon,w,h));let clipped=[];for(let i=0;i<projected.length;i++){const a=projected[i],b=projected[(i+1)%projected.length];if(a.z>=0)clipped.push(a);if((a.z>=0)!==(b.z>=0)){const t=a.z/(a.z-b.z);clipped.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t})}}if(clipped.length>2){path.moveTo(clipped[0].x,clipped[0].y);for(const p of clipped.slice(1))path.lineTo(p.x,p.y);path.closePath()}}}}
   ctx.fillStyle=f.code===selected?'#edbd64':countries.some(c=>c.code===f.code)?'#d8dfb0':'#c2d0b4';ctx.fill(path,'evenodd');ctx.strokeStyle=f.code===selected?'#a96522':'#567f7266';ctx.lineWidth=f.code===selected?1.7:.6;ctx.stroke(path);if(countries.some(c=>c.code===f.code))hitShapes.push({path,code:f.code});
  }}
 function draw(t){frame=requestAnimationFrame(draw);if(document.hidden||t-last<33)return;const box=canvas.getBoundingClientRect(),w=box.width,h=box.height;if(w<1||h<1)return;last=t;const dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}ctx.setTransform(dpr,0,0,dpr,0,0);const p=Math.min(1,(t-turnAt)/1000);angle=reduced?target:startAngle+shortestTurn(startAngle,target)*(1-(1-p)**3);const ease=reduced?1:1-(1-p)**3;latitude=startLatitude+(targetLatitude-startLatitude)*ease;zoom=startZoom+(targetZoom-startZoom)*ease;canvas.dataset.longitude=String(angle);canvas.dataset.latitude=String(latitude);canvas.dataset.zoom=String(zoom);ctx.clearRect(0,0,w,h);
  if(phase!=='question'){hitShapes=[];points=[];crowdStage({w,h,t,pilot,score,mode,accepted,reduced,elapsed:Math.max(0,t-stageAt),features,longitude:angle,selected,phase});return;}
  const r=Math.min(w*.39,h*.32)*zoom,cx=w/2,cy=h*.43;
  if(!flat){ellipse(cx,h*.82,r*.85,r*.13,'#244e4922');ellipse(cx,h*.80,r*.43,r*.07,'#8b7751');pill(cx-r*.055,h*.60,r*.11,h*.19,'#b49b6b');ctx.strokeStyle='#baa475';ctx.lineWidth=9;ctx.beginPath();ctx.ellipse(cx,cy,r*1.08,r*1.08,-.3,-1.2,2.1);ctx.stroke()}
  ctx.save();if(flat){ctx.beginPath();ctx.rect(w*.03,h*.09,w*.94,h*.69)}else{ctx.beginPath();ctx.arc(cx,cy,r,0,TAU)}ctx.clip();const ocean=ctx.createLinearGradient(0,0,w,h);ocean.addColorStop(0,'#92d8d4');ocean.addColorStop(1,'#307a94');ctx.fillStyle=ocean;ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='#e8f6e844';ctx.lineWidth=1;for(let lat=-60;lat<=60;lat+=30){ctx.beginPath();let pen=false;for(let lon=-180;lon<=180;lon+=3){const q=project(lat,lon,w,h);if(q.z>=0){pen?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);pen=true}else pen=false}ctx.stroke()}drawLand(w,h);
  points=[];for(const c of countries){const q=project(c.lat,c.lon,w,h);if(q.z<0)continue;points.push({...q,code:c.code});if(selected===c.code){ellipse(q.x,q.y,11,11,'#fff7ce88');ellipse(q.x,q.y,5,5,'#9e592f');ctx.strokeStyle='#fff6cf';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y,8,0,TAU);ctx.stroke()}}
  if(!flat){const shade=ctx.createRadialGradient(cx-r*.4,cy-r*.4,r*.2,cx,cy,r);shade.addColorStop(0,'#ffffff22');shade.addColorStop(.7,'#ffffff00');shade.addColorStop(1,'#16394355');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h)}ctx.restore();
  if(phase==='question'){person(w*.13,h*.81,Math.min(w/650,h/600),pilot,t);ctx.fillStyle='#214e52';ctx.font='600 10px system-ui';ctx.textAlign='center';ctx.fillText('YOUR PILOT',w*.13,h*.93)}

 }
 const click=event=>{const rect=canvas.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;ctx.save();ctx.setTransform(1,0,0,1,0,0);const shape=[...hitShapes].reverse().find(f=>ctx.isPointInPath(f.path,x,y,'evenodd'));ctx.restore();if(shape){onSelect(shape.code);return}const p=points.map(p=>({...p,d:Math.hypot(p.x-x,p.y-y)})).sort((a,b)=>a.d-b.d)[0];if(p&&p.d<12)onSelect(p.code)};
 canvas.addEventListener('click',click);frame=requestAnimationFrame(draw);
 return {renderShare(target,roundScore){createCrowdStage(target.getContext('2d'),portraits)({w:target.width,h:target.height,t:0,pilot,score:roundScore,mode,accepted:roundScore>0,reduced:true,elapsed:6000,features,longitude:angle,phase:'reveal'});},set(s){if(s.phase&&s.phase!==phase){phase=s.phase;stageAt=performance.now();startAngle=target=angle;turnAt=performance.now()}if(s.code!==undefined){selected=s.code;if(!selected){startZoom=zoom;targetZoom=1;startLatitude=latitude;targetLatitude=0;turnAt=performance.now();startAngle=angle}};if(s.focus){const c=countries.find(c=>c.code===selected);if(c){startAngle=angle;target=c.lon;startLatitude=latitude;targetLatitude=c.lat;startZoom=zoom;targetZoom=1.18;turnAt=performance.now()}}if(s.mode)mode=s.mode;if(s.accepted!==undefined)accepted=s.accepted;if(s.score!==undefined)score=s.score;if(s.history)history=s.history;if(s.pilot!==undefined)pilot=s.pilot;if(s.reduced!==undefined)reduced=s.reduced;if(s.flat!==undefined)flat=s.flat;if(s.zoom!==undefined)zoom=s.zoom},rotate(d){startAngle=angle;startLatitude=latitude;startZoom=zoom;target+=d;turnAt=performance.now()},skip(){startAngle=angle=target;latitude=startLatitude=targetLatitude;zoom=startZoom=targetZoom;turnAt=0;stageAt=performance.now()-6000},destroy(){disposed=true;controller.abort();cancelAnimationFrame(frame);canvas.removeEventListener('click',click)}};
}
