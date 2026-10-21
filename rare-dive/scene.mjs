// 原创插画＋独立Canvas动效；素材失败时保留渐变背景，不阻断判分。
export function createOcean(canvas){
 const ctx=canvas.getContext('2d');if(!ctx)return {set(){},destroy(){}};
 const reef=new Image(),explorer=new Image();
 let target=0,depth=0,phase='menu',reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let raf=0,last=0,burst=0,dirty=true,width=0,height=0;
 reef.onload=()=>{dirty=true;canvas.dataset.art='loaded'};reef.onerror=()=>{dirty=true;canvas.dataset.art='fallback'};
 explorer.onload=()=>{dirty=true};
 reef.src=new URL('./ocean-reef-v2.webp',import.meta.url).href;
 explorer.src=new URL('./diver-v2.webp',import.meta.url).href;
 const resize=()=>{const rect=canvas.getBoundingClientRect();width=rect.width;height=rect.height;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);dirty=true};
 const observer=new ResizeObserver(resize);observer.observe(canvas);resize();
 function frame(now){
  raf=requestAnimationFrame(frame);if(now-last<33||!width||!height)return;
  const dt=Math.min((now-last)/1000,.1);last=now;
  if(reduced&&!dirty)return;dirty=false;
  depth=reduced?target:depth+(target-depth)*Math.min(1,dt*3);
  const t=reduced?0:now/1000,deep=Math.min(1,depth/7000);
  ctx.clearRect(0,0,width,height);
  const background=ctx.createLinearGradient(0,0,0,height);background.addColorStop(0,'#11697b');background.addColorStop(1,'#04182e');ctx.fillStyle=background;ctx.fillRect(0,0,width,height);
  if(reef.complete&&reef.naturalWidth){const scale=Math.max(width/reef.width,height/reef.height)*1.06,w=reef.width*scale,h=reef.height*scale;ctx.drawImage(reef,(width-w)/2,(height-h)/2-deep*height*.025,w,h);}
  // 深度改变光照，不替换得分或题目；中部保持清晰文字对比度。
  ctx.fillStyle='rgba(2,15,34,'+(0.12+deep*.48)+')';ctx.fillRect(0,0,width,height);
  const shade=ctx.createRadialGradient(width*.5,height*.4,20,width*.5,height*.4,Math.max(width,height)*.7);shade.addColorStop(0,'rgba(2,20,35,.13)');shade.addColorStop(1,'rgba(1,12,29,.44)');ctx.fillStyle=shade;ctx.fillRect(0,0,width,height);
  // 细小气泡沿边缘上浮，避免从正文前经过。
  for(let i=0;i<26;i++){const side=i%2?0.04:0.83,x=width*(side+(i%5)*.025)+Math.sin(t*.5+i)*4,y=height-((t*(12+i%4*3)+i*37)%(height+20));ctx.strokeStyle='rgba(178,242,248,'+(.12+i%3*.07)+')';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,1.4+i%3*.7,0,Math.PI*2);ctx.stroke();}
  const narrow=width<600,size=narrow?68:Math.min(118,width*.095),x=width*(narrow?.06:.12),y=phase==='menu'?height*.42:height*(.2+deep*.55);
  if(explorer.complete&&explorer.naturalWidth){ctx.save();ctx.translate(x+size*.5,y+size*.5+(reduced?0:Math.sin(t*1.5)*5));ctx.rotate(reduced?0:Math.sin(t*.8)*.035);ctx.drawImage(explorer,-size*.5,-size*.5,size,size*explorer.height/explorer.width);ctx.restore();}
  if(!narrow){const rx=width*.95,top=height*.24,bottom=height*.85;ctx.strokeStyle='#8bc2cc77';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(rx,top);ctx.lineTo(rx,bottom);ctx.stroke();ctx.font='10px monospace';ctx.textAlign='right';const base=Math.floor(depth/100)*100;for(let i=-2;i<5;i++){const value=base+i*100,y=height*.52+(value-depth)*height*.0007;if(value<0||y<top||y>bottom)continue;ctx.fillStyle='#b6dfe3';ctx.fillText(value+' m',rx-12,y+3);ctx.fillRect(rx-7,y,7,1)}ctx.fillStyle='#ffd582';ctx.fillRect(rx-9,height*.52,12,3);}
  if(burst>now&&!reduced){for(let i=0;i<45;i++){const angle=i*2.4,progress=1-(burst-now)/2000,travel=progress*height*.4;ctx.fillStyle=['#92e8df','#ffdf90','#f59f9a'][i%3];ctx.fillRect(width*.5+Math.cos(angle)*travel,height*.35+Math.sin(angle)*travel*.6+travel*.2,3,5);}}
 }
 raf=requestAnimationFrame(frame);
 return {set(options){if(options.depth!==undefined)target=options.depth;if(options.phase)phase=options.phase;if(options.reduced!==undefined)reduced=options.reduced;if(options.celebrate)burst=performance.now()+2000;dirty=true},destroy(){cancelAnimationFrame(raf);observer.disconnect();}};
}
