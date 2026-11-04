// 三个独立游戏共用的本地成绩海报；只接受固定站点，不包含答案或凭证。
export function resultUrl(game) {
 let host = ''; try { host = new URL(document.referrer).hostname; } catch {}
 const hub = host === 'farflungnoillirk.com' || host === 'www.farflungnoillirk.com' || new URLSearchParams(location.search).get('shareSite') === 'farflungnoillirk';
 return hub ? 'https://farflungnoillirk.com/' : 'https://noillirk.co/';
}
const icons = {
 YouTube:'<rect x="2" y="5" width="20" height="14" rx="5" fill="currentColor"/><path d="m10 9 6 3-6 3z" fill="#101827"/>',
 X:'<path d="M4 3h5l12 18h-5L4 3Zm16 0L4 21" fill="none" stroke="currentColor" stroke-width="2"/>',
 Instagram:'<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="18" cy="6" r="1" fill="currentColor"/>',
 Reddit:'<g fill="none" stroke="currentColor" stroke-width="1.6"><ellipse cx="12" cy="15" rx="9" ry="6"/><circle cx="3" cy="10" r="2"/><circle cx="21" cy="10" r="2"/><path d="m12 9 2-6 5 1M8 17q4 3 8 0"/><circle cx="20" cy="4" r="2"/></g><circle cx="8" cy="13" r="1.5" fill="currentColor"/><circle cx="16" cy="13" r="1.5" fill="currentColor"/>'
};
// 人数只编码相对热门程度；零分不绘制获奖人物。
export function crowdVisual(score,mode){
 if(!Number.isFinite(score)||score<=0)return {count:0,crown:false};
 const band=Math.min(9,Math.max(1,Math.ceil(score/100*9)));
 const count=mode==='cold'?10-band:band;
 return {count,crown:mode==='cold'&&count===1};
}
let active=false;
export async function openResultShare({game,points,art,detail='',mode=game==='Krillion'?'cold':'hot'}) {
 if(active)return;active=true;
 const trigger=document.activeElement,dialog=document.createElement('dialog');
 dialog.setAttribute('aria-label','Score image');
 dialog.style.cssText='box-sizing:border-box;width:min(920px,96vw);height:min(650px,96dvh);max-width:96vw;max-height:96dvh;padding:8px;border:1px solid #365868;border-radius:18px;background:#0d1b29;color:#eef8ff;overflow:hidden;font:14px system-ui';
 const stage=document.createElement('div');stage.style.cssText='height:100%;display:flex;flex-direction:column;min-height:0';
 const bar=document.createElement('div');bar.style.cssText='display:flex;justify-content:flex-end;gap:8px;flex:none;height:48px';
 const makeButton=(name,icon,action)=>{const b=document.createElement('button');b.type='button';b.title=name;b.setAttribute('aria-label',name);b.style.cssText='box-sizing:border-box;min-width:44px;min-height:44px;border:1px solid #476173;border-radius:12px;background:#193546;color:#d6f6ee;display:flex;align-items:center;justify-content:center;gap:12px;cursor:pointer';b.innerHTML=`<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">${icon}</svg>`;b.onclick=action;return b};
 const line=path=>`<path d="${path}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
 const close=makeButton('Close',line('m6 6 12 12M6 18 18 6'),()=>dialog.close());bar.append(close);
 const status=document.createElement('p');status.setAttribute('role','status');status.textContent='Creating image…';
 stage.append(bar,status);dialog.append(stage);document.body.append(dialog);
 let objectUrl,layer;
 const closeLayer=()=>{layer?.remove();layer=null;stage.style.filter='';stage.inert=false;shareButton?.focus()};
 let shareButton;
 dialog.addEventListener('cancel',e=>{if(layer){e.preventDefault();closeLayer()}});
 dialog.addEventListener('close',()=>{active=false;if(objectUrl)URL.revokeObjectURL(objectUrl);dialog.remove();if(trigger?.isConnected)trigger.focus()},{once:true});dialog.showModal();
 try {
  if(!points.length||points.length>14||points.some(p=>!Number.isFinite(p)||p<0||p>100))throw Error();
  const total=Math.round(points.reduce((a,b)=>a+b,0)*10)/10,url=resultUrl(game);
  const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=720;const c=canvas.getContext('2d');if(!c)throw Error();
  const accent=game==='Krillion'?'#c4b4fa':game==='Farflung'?'#86dfbd':'#9cdbfa';
  const g=c.createLinearGradient(0,0,1200,720);g.addColorStop(0,'#1b424b');g.addColorStop(1,'#101a2a');c.fillStyle=g;c.fillRect(0,0,1200,720);
  const text=(s,x,y,size,color='#eff9f6')=>{c.font=`700 ${size}px system-ui`;c.fillStyle=color;c.fillText(s,x,y)};
  const card=(x,y,w,h)=>{c.fillStyle='#ffffff0e';c.beginPath();c.roundRect(x,y,w,h,14);c.fill()};
  text(game.toUpperCase(),44,65,34,accent);text(`${total}`,44,142,64);text(`/ ${points.length*100} POINTS`,240,138,26);card(730,28,426,110);
  c.save();c.translate(754,47);c.strokeStyle=mode==='cold'?'#cbb3ff':'#ffbd6c';c.fillStyle=c.strokeStyle;c.lineWidth=3;
  if(mode==='cold'){c.beginPath();c.moveTo(0,14);c.lineTo(10,0);c.lineTo(34,0);c.lineTo(44,14);c.lineTo(22,44);c.closePath();c.stroke();c.beginPath();c.moveTo(0,14);c.lineTo(44,14);c.moveTo(10,0);c.lineTo(22,44);c.lineTo(34,0);c.stroke();}
  else{c.beginPath();c.moveTo(24,0);c.bezierCurveTo(37,19,9,17,27,30);c.bezierCurveTo(34,25,36,19,36,14);c.bezierCurveTo(60,45,18,64,7,39);c.bezierCurveTo(0,24,16,19,14,11);c.bezierCurveTo(18,17,18,19,19,22);c.bezierCurveTo(25,15,19,8,24,0);c.fill();}c.restore();
  text(mode==='cold'?'RARE MODE':'POPULAR MODE',818,67,29,accent);text('INDEPENDENT EDITION',818,105,16);
  const picture=new Image();picture.src=art;let timer;try{await Promise.race([picture.decode(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error()),10000)})])}finally{clearTimeout(timer)};
  // Farflung复用游戏本身的地球仪绘制器和地图；其他游戏复用实际场景素材。
  const loadArt=async src=>{const image=new Image();image.src=src;await image.decode();return image};
  let globeStage,globeFeatures=[],globePortraits=[],selectedPilot=0,sceneArt;
  if(game==='Farflung'){
   const [{createCrowdStage},{pilots},atlas]=await Promise.all([import('./globe-crowd/crowd-stage.mjs'),import('./globe-crowd/pilots.mjs'),fetch('/globe-crowd/atlas.json').then(r=>{if(!r.ok)throw Error('Map unavailable');return r.json()})]);
   globeStage=createCrowdStage;globeFeatures=atlas.features;selectedPilot=Math.max(0,pilots.findIndex(p=>art.endsWith(p.image)));
   globePortraits=await Promise.all(pilots.map(p=>loadArt('/globe-crowd/'+p.image)));
  }else sceneArt=await loadArt(game==='Noillirk'?'/game-art/tabletop-stage.webp':'/rare-dive/ocean-reef-v2.webp');
  const cols=Math.min(points.length,7),rows=Math.ceil(points.length/cols),step=1112/cols,rowHeight=rows===1?320:170;
  points.forEach((p,i)=>{
   const col=i%cols,row=Math.floor(i/cols),x=44+col*step,y=180+row*180,w=step-10;card(x,y,w,rowHeight);
   const {count,crown}=crowdVisual(p,mode),floor=y+rowHeight-96;
   const sceneHeight=rowHeight-82;
   c.save();c.beginPath();c.roundRect(x+4,y+4,w-8,sceneHeight,10);c.clip();
   if(game==='Farflung'){
    const tile=document.createElement('canvas');tile.width=400;tile.height=Math.round(400*sceneHeight/(w-8));
    globeStage(tile.getContext('2d'),globePortraits)({w:tile.width,h:tile.height,t:0,pilot:selectedPilot,score:p,mode,accepted:p>0,reduced:true,elapsed:6000,features:globeFeatures,longitude:15,phase:'reveal'});
    c.drawImage(tile,x+4,y+4,w-8,sceneHeight);
    if(crown){const cx=x+w/2,cy=y+sceneHeight*.42;c.fillStyle='#ffd269';c.beginPath();c.moveTo(cx-13,cy);c.lineTo(cx-18,cy-18);c.lineTo(cx-5,cy-10);c.lineTo(cx,cy-24);c.lineTo(cx+5,cy-10);c.lineTo(cx+18,cy-18);c.lineTo(cx+13,cy);c.closePath();c.fill();}
   }else{
    // 与实机场景同图；按cover裁切，保持比例。
    const scaleBg=Math.max((w-8)/sceneArt.width,sceneHeight/sceneArt.height),bw=sceneArt.width*scaleBg,bh=sceneArt.height*scaleBg;
    c.drawImage(sceneArt,x+w/2-bw/2,y+4+sceneHeight/2-bh/2,bw,bh);
    const perRow=Math.min(3,count),numRows=Math.ceil(count/3);
    for(let n=0;n<count;n++){
     const r=Math.floor(n/3),inRow=Math.min(3,count-r*3),pos=n%3;
     const h=count===1?sceneHeight*.46:sceneHeight*.29,scale=Math.min(h/picture.height,(w-24)/(Math.max(1,perRow)*picture.width));
     const dw=picture.width*scale,dh=picture.height*scale,cx=x+w/2+(pos-(inRow-1)/2)*((w-30)/Math.max(1,perRow));
     const foot=game==='Noillirk'?y+sceneHeight*.68-(numRows-1-r)*sceneHeight*.06:y+sceneHeight*(.55+.25*p/100)-(numRows-1-r)*sceneHeight*.06;
     c.drawImage(picture,cx-dw/2,foot-dh,dw,dh);
     if(crown){const cy=foot-dh-3;c.fillStyle='#ffd269';c.beginPath();c.moveTo(cx-12,cy);c.lineTo(cx-16,cy-17);c.lineTo(cx-5,cy-9);c.lineTo(cx,cy-23);c.lineTo(cx+5,cy-9);c.lineTo(cx+16,cy-17);c.lineTo(cx+12,cy);c.closePath();c.fill();}
    }
   }c.restore();
   text('R'+(i+1),x+14,y+rowHeight-65,18,accent);text(String(Math.round(p*10)/10),x+14,y+rowHeight-30,30);
   c.fillStyle='#41616a';c.fillRect(x+14,y+rowHeight-14,step-38,4);c.fillStyle=accent;c.fillRect(x+14,y+rowHeight-14,(step-38)*p/100,4);
  });
  card(44,550,1112,46);text('ROUND SCORES',64,580,18,accent);text(detail.slice(0,65),300,580,18);
  card(44,605,1112,38);text('Visual crowd density · editorial / simulated scores',64,630,17);c.textAlign='right';text('No public ranking',1130,630,17);c.textAlign='center';text(url,600,687,27,accent);c.textAlign='left';
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error()),'image/png'));
  if(!dialog.open)return;
  objectUrl=URL.createObjectURL(blob);status.remove();
  const preview=document.createElement('img');preview.src=objectUrl;preview.alt=`${game}: ${total} points; rounds ${points.join(', ')}`;preview.style.cssText='display:block;width:100%;height:100%;min-height:0;object-fit:contain;flex:1;border-radius:12px';stage.append(preview);
  const save=()=>{const a=document.createElement('a');a.href=objectUrl;a.download=`${game.toLowerCase()}-${total}-score.png`;document.body.append(a);a.click();a.remove()};
  bar.insertBefore(makeButton('Save image',line('M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5'),save),close);
  shareButton=makeButton('Save and share image',line('M12 16V3m-4 4 4-4 4 4M5 13v8h14v-8'),()=>{
   save();if(layer)return;stage.style.filter='blur(7px)';stage.inert=true;
   layer=document.createElement('div');layer.setAttribute('role','group');layer.setAttribute('aria-label','Choose sharing platform');layer.style.cssText='position:absolute;inset:0;background:#07121a99;display:flex;align-items:center;justify-content:center;padding:12px';
   const panel=document.createElement('div');panel.style.cssText='width:min(440px,100%);max-height:100%;overflow:auto;background:#132b3c;border:1px solid #527283;border-radius:18px;padding:12px;box-sizing:border-box';
   const back=makeButton('Back to image',line('m6 6 12 12M6 18 18 6'),closeLayer);back.style.marginLeft='auto';panel.append(back);
   const grid=document.createElement('div');grid.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:10px';
   const caption=`${game}: ${total}/${points.length*100} points ${url}`,targets={YouTube:'https://www.youtube.com/',X:`https://x.com/intent/post?text=${encodeURIComponent(caption)}`,Instagram:'https://www.instagram.com/',Reddit:'https://www.reddit.com/submit'};
   for(const name of Object.keys(targets)){const b=makeButton(name,icons[name],()=>window.open(targets[name],'_blank','noopener,noreferrer'));b.append(document.createTextNode(name));b.style.minHeight='50px';grid.append(b)}
   panel.append(grid);const address=document.createElement('a');address.href=url;address.target='_blank';address.rel='noopener noreferrer';address.textContent=new URL(url).hostname;address.style.cssText='display:block;text-align:center;color:#86dfbd;margin-top:14px;padding:8px';panel.append(address);layer.append(panel);dialog.append(layer);back.focus();
  });bar.insertBefore(shareButton,close);
 } catch (error) {console.error('Score image generation failed', error);if(dialog.open)status.textContent='Image unavailable. Close and try again.'}
}


