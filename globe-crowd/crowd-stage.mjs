import {countries} from './data.mjs';
import {pilots} from './pilots.mjs';
import {drawPilot,moves} from './pilot-motion.mjs';
const TAU=Math.PI*2,rad=Math.PI/180;
export function stagePlan(mode,score,pilot,accepted=true){
 const others=pilots.map((_,id)=>id).filter(id=>id!==pilot),count=accepted?Math.round(Math.max(0,Math.min(100,score))/100*15):0;
 return {mode,hero:pilot,joined:mode==='hot'?others.slice(0,count):[],distant:mode==='cold'?Array.from({length:3},(_,i)=>others.filter((_,j)=>j%3===i)):[],celebrate:accepted};
}
export function createCrowdStage(ctx,portraits){
 const cache=new Map();let selectedCode='';
 function disc(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill()}
 function globe(x,y,r,features,lon,tone=0){
  const key=`${Math.round(r)}-${Math.round(lon/5)*5}-${features.length}-${tone}-${selectedCode}`;let img=cache.get(key);
  if(!img){img=document.createElement('canvas');img.width=img.height=384;const c=img.getContext('2d'),R=180,C=192;
   c.beginPath();c.arc(C,C,R,0,TAU);c.clip();const ocean=c.createRadialGradient(125,95,10,C,C,220);ocean.addColorStop(0,'#9ce2df');ocean.addColorStop(.55,'#4cacae');ocean.addColorStop(1,'#23556e');c.fillStyle=ocean;c.fillRect(0,0,384,384);
   const project=(lat,lng)=>{const a=(lng-Math.round(lon/15)*15)*rad,b=lat*rad;return {x:C+R*Math.cos(b)*Math.sin(a),y:C-R*Math.sin(b),z:Math.cos(b)*Math.cos(a)}};
   c.strokeStyle='#ecf7d844';c.lineWidth=1;for(let lat=-60;lat<=60;lat+=30){c.beginPath();let pen=false;for(let lng=-180;lng<=180;lng+=3){const p=project(lat,lng);if(p.z>=0){pen?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);pen=true}else pen=false}c.stroke()}
   for(const f of features){c.beginPath();for(const poly of f.rings)for(const ring of poly){const ps=ring.map(([lng,lat])=>project(lat,lng)),out=[];for(let i=0;i<ps.length;i++){const a=ps[i],b=ps[(i+1)%ps.length];if(a.z>=0)out.push(a);if((a.z>=0)!==(b.z>=0)){const k=a.z/(a.z-b.z);out.push({x:a.x+(b.x-a.x)*k,y:a.y+(b.y-a.y)*k})}}if(out.length>2){c.moveTo(out[0].x,out[0].y);for(const p of out.slice(1))c.lineTo(p.x,p.y);c.closePath()}}c.fillStyle=f.code===selectedCode?'#ffc456':tone?'#cedeb5':'#e2e6b7';c.fill('evenodd');c.strokeStyle='#638d6e55';c.lineWidth=.7;c.stroke()}
   const country=countries.find(v=>v.code===selectedCode);if(country){const p=project(country.lat,country.lon);if(p.z>0){c.fillStyle='#fff5c3';c.beginPath();c.arc(p.x,p.y,8,0,TAU);c.fill();c.fillStyle='#b34128';c.beginPath();c.arc(p.x,p.y,4,0,TAU);c.fill()}}
   const shade=c.createRadialGradient(140,110,70,192,192,190);shade.addColorStop(0,'#fffce01c');shade.addColorStop(.6,'#ffffff00');shade.addColorStop(1,'#17384f80');c.fillStyle=shade;c.fillRect(0,0,384,384);cache.set(key,img);if(cache.size>24)cache.delete(cache.keys().next().value);
  }
  disc(x,y+r*1.06,r*.8,r*.15,'#244c4620');
  ctx.strokeStyle='#c9ae74';ctx.lineWidth=Math.max(2,r*.045);ctx.beginPath();ctx.ellipse(x,y,r*1.045,r*1.045,-.3,-1.25,2);ctx.stroke();
  ctx.drawImage(img,x-r*1.067,y-r*1.067,r*2.134,r*2.134);
 }
 function actor(id,x,feet,height,t,active,reduced,hero=false){
  disc(x,feet+1,height*.23,height*.045,hero?'#344c4350':'#344c4330');const img=portraits[id];
  if(img?.complete&&img.naturalWidth)drawPilot(ctx,img,x,feet,height,id,t,active,reduced);
  else{disc(x,feet-height*.7,height*.13,height*.16,'#d9b58c');disc(x,feet-height*.3,height*.16,height*.24,'#5d9291')}
  if(hero){ctx.font='700 9px system-ui';ctx.textAlign='center';ctx.fillStyle='#ffe5a0';ctx.beginPath();ctx.roundRect(x-18,feet+5,36,15,7);ctx.fill();ctx.fillStyle='#24494a';ctx.fillText('YOU',x,feet+16)}
 }
 return function draw(s){const {w,h,t,pilot,score,mode,accepted,reduced,elapsed,features,longitude,phase}=s,plan=stagePlan(mode,score,pilot,accepted),small=h<300;
  selectedCode=s.selected||'';
  const progress=reduced?1:Math.min(1,elapsed/1100),ease=1-(1-progress)**3;
  ctx.clearRect(0,0,w,h);const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#e8eee0');bg.addColorStop(1,'#b8d8cf');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  // 远处星点和航线建立景深，避免抢占角色与操作区。
  ctx.strokeStyle='#fff9df77';ctx.setLineDash([3,7]);ctx.beginPath();ctx.ellipse(w*.5,h*.57,w*.44,h*.22,-.12,Math.PI,TAU);ctx.stroke();ctx.setLineDash([]);
  const base=Math.min(w,h),heroH=Math.min(base*.27,130);
  if(mode==='cold'){
   const positions=[[.18,.35,.12],[.51,.27,.10],[.82,.39,.13]];
   plan.distant.forEach((ids,g)=>{const [px,py,pr]=positions[g],r=base*pr,cx=w*px,cy=h*py;globe(cx,cy,r,features,longitude+g*70,1);ids.forEach((id,j)=>{const foot=cy-r*.65+(j>2?r*.19:0),x=cx+((j%3)-1)*r*.45;actor(id,x,foot,Math.min(r*.9,46),t+id*170,true,reduced)})});
   const r=Math.min(w*.27,h*.22),cx=w*.5,cy=h*.75;globe(cx,cy,r,features,longitude);actor(pilot,cx+(1-ease)*w*.24,cy-r*.70-Math.sin(progress*Math.PI)*heroH*.7,heroH,t,plan.celebrate,reduced,true);
   label(cx,Math.min(h-36,cy+r+14),accepted?'YOUR OWN DISCOVERY':'NO AWARD THIS STOP');
  }else{
   const r=Math.min(w*.40,h*.29),cx=w*.5,cy=h*.62;globe(cx,cy,r,features,longitude);
   plan.joined.forEach((id,i)=>{const row=Math.floor(i/5),col=i%5,x=cx+(col-2)*r*.32,y=cy-r*.87+row*r*.23+Math.abs(col-2)*r*.035;
    const delay=i*.026,p=reduced?1:Math.max(0,Math.min(1,(progress-delay)/(1-delay))),a=1-(1-p)**3;
    actor(id,x+(1-a)*(i%2?1:-1)*w*.44,y-Math.sin(p*Math.PI)*r*.35,Math.min(r*.50,72)*(1+row*.08),t+id*170,plan.celebrate,reduced);
   });
   actor(pilot,cx,cy-r*.12-Math.sin(progress*Math.PI)*heroH*.4,heroH,t,plan.celebrate,reduced,true);
   label(cx,Math.min(h-36,cy+r+19),accepted?`${plan.joined.length+1} EXPLORERS · ONE WORLD`:'NO AWARD THIS STOP');
  }
  // 个人标记和动作名是说明性文案，不把装饰伙伴称为在线玩家。
  ctx.font=`600 ${small?10:12}px system-ui`;ctx.fillStyle='#315c5a';ctx.textAlign='center';ctx.fillText(`${pilots[pilot].name} · ${moves[pilot].name}`,w/2,h-5);
  if(phase==='complete'&&!reduced&&elapsed<5000){for(let i=0;i<40;i++){ctx.fillStyle=['#edbe60','#a887be','#399a90'][i%3];ctx.save();ctx.translate((i*73)%w,((elapsed/13+i*19)%h));ctx.rotate(i+t/850);ctx.fillRect(-2,-3,4,7);ctx.restore()}}
  function label(x,y,text){ctx.font=`700 ${small?9:11}px system-ui`;const tw=ctx.measureText(text).width;ctx.fillStyle='#fff2cb';ctx.beginPath();ctx.roundRect(x-tw/2-10,y-13,tw+20,21,10);ctx.fill();ctx.fillStyle='#274c50';ctx.textAlign='center';ctx.fillText(text,x,y+1)}
 };
}
