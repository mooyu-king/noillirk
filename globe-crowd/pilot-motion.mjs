// 每位飞行员有独立编排。单位为角色高度比例；减弱动态时完全静止。
export const moves=[
 ['Wing wave',2.7,.08,.00,.04,.22,0],['Double bounce',2.3,.03,.10,.01,.14,.16],
 ['Map-side sway',3.6,.06,.01,.09,.04,.16],['Captain nod',3.1,.01,.02,.00,.10,.04],
 ['Star greeting',2.6,.07,.03,.05,.23,.06],['Gentle bow',4.2,.02,.01,.00,.04,.04],
 ['Cloud step',3.2,.02,.04,.13,.08,.17],['Scarf swing',2.9,.09,.02,.06,.16,.08],
 ['Compass hello',3.4,.04,.02,.02,.05,.24],['Victory pulse',2.1,.02,.12,.00,.19,.19],
 ['Navigator shuffle',3.8,.10,.02,.11,.07,.12],['Graceful nod',4.5,.05,.01,.04,.12,.03],
 ['Sky dance',2.5,.10,.07,.12,.21,.10],['Orbit groove',3.3,.12,.03,.08,.14,.22],
 ['Spring hop',1.9,.04,.15,.02,.10,.17],['Horizon salute',3.7,.03,.02,.03,.22,.02]
].map(([name,period,lean,hop,step,left,right])=>({name,period,lean,hop,step,left,right}));
export function pose(id,time,active=true,reduced=false){
 const m=moves[id]||moves[0];
 if(reduced)return {x:0,y:0,rotation:0,sx:1,sy:1,left:0,right:0,head:0};
 const q=time/1000/m.period*Math.PI*2+id*.73,s=Math.sin(q),c=Math.cos(q),strength=active?1:.24;
 const hop=id===1?Math.max(0,Math.sin(q*2)):Math.max(0,s);
 return {x:m.step*s*strength,y:-m.hop*hop*strength,rotation:m.lean*s*strength,
 sx:1+(id===9?.05:.015)*c*strength,sy:1-(id===5?.09: .025)*Math.max(0,c)*strength,
 left:m.left*Math.sin(q*(id===0||id===15?2:1))*strength,right:m.right*Math.cos(q*(id===8?2:1))*strength,
 head:(id===3||id===11?.035:.012)*s*strength};
}

// 连续网格变形：肩外侧、头部独立移动，不把整张角色只当成上下弹跳贴纸。
export function drawPilot(ctx,img,x,feet,height,id,time,active,reduced){
 const p=pose(id,time,active,reduced),width=height*img.naturalWidth/img.naturalHeight;
 ctx.save();ctx.translate(x+p.x*height,feet+p.y*height);ctx.rotate(p.rotation);ctx.scale(p.sx,p.sy);
 // 远景小于90px时保留各人身体编排，省去不可辨识的细网格，避免缩小锯齿。
 if(reduced||height<90){ctx.drawImage(img,-width/2,-height,width,height);ctx.restore();return}
 const cols=6,rows=8,verts=[];
 for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
  const u=i/cols,v=j/rows,arm=Math.exp(-(((v-.55)/.14)**2)),edge=Math.max(0,(Math.abs(u-.5)-.18)/.32);
  const lift=(u<.5?p.left:p.right)*arm*edge;
  verts.push({sx:u*img.naturalWidth,sy:v*img.naturalHeight,x:(u-.5)*width+Math.sin(v*Math.PI)*p.head*height,y:(v-1)*height-lift*height});
 }
 function tri(a,b,c){const det=a.sx*(b.sy-c.sy)+b.sx*(c.sy-a.sy)+c.sx*(a.sy-b.sy);if(!det)return;
  const ax=(a.x*(b.sy-c.sy)+b.x*(c.sy-a.sy)+c.x*(a.sy-b.sy))/det,bx=(a.x*(c.sx-b.sx)+b.x*(a.sx-c.sx)+c.x*(b.sx-a.sx))/det;
  const ay=(a.y*(b.sy-c.sy)+b.y*(c.sy-a.sy)+c.y*(a.sy-b.sy))/det,by=(a.y*(c.sx-b.sx)+b.y*(a.sx-c.sx)+c.y*(b.sx-a.sx))/det;
  // 相邻三角形覆盖半像素，防止Canvas抗锯齿产生网格白缝。
  const mx=(a.x+b.x+c.x)/3,my=(a.y+b.y+c.y)/3;
  const expand=v=>{const dx=v.x-mx,dy=v.y-my,k=.65/Math.hypot(dx,dy);return {x:v.x+dx*k,y:v.y+dy*k}};
  const aa=expand(a),bb=expand(b),cc=expand(c);
  ctx.save();ctx.beginPath();ctx.moveTo(aa.x,aa.y);ctx.lineTo(bb.x,bb.y);ctx.lineTo(cc.x,cc.y);ctx.closePath();ctx.clip();ctx.transform(ax,ay,bx,by,a.x-ax*a.sx-bx*a.sy,a.y-ay*a.sx-by*a.sy);ctx.drawImage(img,0,0);ctx.restore();
 }
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=verts[j*(cols+1)+i],b=verts[j*(cols+1)+i+1],c=verts[(j+1)*(cols+1)+i],d=verts[(j+1)*(cols+1)+i+1];tri(a,b,c);tri(b,d,c)}
 ctx.restore();
}
