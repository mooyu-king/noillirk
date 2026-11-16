// 原创生成角色；素材随项目保存，角色与评分层分离。
export const CAST=[['avery','Avery','Varsity spirit'],['jordan','Jordan','Court regular'],['casey','Casey','Always exploring'],['morgan','Morgan','Library favorite'],['riley','Riley','Campus creative'],['taylor','Taylor','Team captain']];
export function person(id='avery',pose='idle',crown=false){
 const known=CAST.some(c=>c[0]===id)||id==='mia'?id:'avery';
 const state=['idle','wave','excellent','very-nice','good','average','poor'].includes(pose)?pose:'idle';
 const asset=known==='mia'?`mia-${state==='idle'?'wave':state}`:`${known}${state==='poor'?'-poor':''}`;
 return `<span class="person person-3d pose-${state} ${known==='mia'?'host':''}" data-avatar="${known}" aria-hidden="true"><img class="character-art" src="./art/${asset}.webp" width="288" height="384" alt="" draggable="false">${crown?'<svg class="crown" viewBox="0 0 64 32"><path d="M8 6l14 9L32 2l10 13 14-9-5 23H13z" fill="#f5cd67" stroke="#a87c2b" stroke-width="2"/><path d="M16 23h32" stroke="#fff2b6" stroke-width="3"/></svg>':''}</span>`;
}
export function confetti(){return `<div class="confetti" aria-hidden="true">${Array.from({length:20},(_,i)=>`<i style="--x:${(i*37)%100}%;--d:${(i%5)*.16}s;--c:${['#ffc75e','#bd514a','#60a998','#9781c2'][i%4]};--r:${i*39}deg"></i>`).join('')}</div>`;}
export function campus(){return '<img src="./art/campus-quad-v2.webp" class="campus-art" width="1440" height="810" alt="Sunlit red-brick university quad with a clock tower, leafy trees and a sandstone plaza" fetchpriority="high" draggable="false">';}
