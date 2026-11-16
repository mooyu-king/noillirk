// 欧洲版自有角色。动作与得分共用状态机，素材与美国版隔离。
export const CAST=[['ines','Ines','Sketchbook companion'],['malik','Malik','Music society regular'],['luca','Luca','Cycling to class'],['freya','Freya','Library explorer'],['amara','Amara','Film society creative'],['theo','Theo','Weekend walker']];
export function person(id='ines',pose='idle',crown=false){
 const known=CAST.some(c=>c[0]===id)||id==='lea'?id:'ines';
 const state=['idle','wave','excellent','very-nice','good','average','poor'].includes(pose)?pose:'idle';
 const asset=known==='lea'?`lea-${state==='idle'?'wave':state}`:`${known}${state==='poor'?'-poor':''}`;
 return `<span class="person person-3d pose-${state} ${known==='lea'?'host':''}" data-avatar="${known}" aria-hidden="true"><img class="character-art" src="./art/${asset}.webp" width="288" height="432" alt="" draggable="false">${crown?'<svg class="crown" viewBox="0 0 64 32"><path d="M8 6l14 9L32 2l10 13 14-9-5 23H13z" fill="#f5cd67" stroke="#a87c2b" stroke-width="2"/><path d="M16 23h32" stroke="#fff2b6" stroke-width="3"/></svg>':''}</span>`;
}
export function confetti(){return `<div class="confetti" aria-hidden="true">${Array.from({length:20},(_,i)=>`<i style="--x:${(i*37)%100}%;--d:${(i%5)*.16}s;--c:${['#d9b15d','#b26b4d','#6c9070','#a18bb0'][i%4]};--r:${i*39}deg"></i>`).join('')}</div>`;}
export function campus(){return '<img src="./art/eurollion-campus.webp" class="campus-art" width="1672" height="941" alt="Fictional European university courtyard with warm stone arches, flowers and bicycles" fetchpriority="high" draggable="false">';}
