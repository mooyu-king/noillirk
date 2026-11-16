// 在逐题答案弹窗公开具体解释与评分口径；不将编辑权重写成观测概率。
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderAnswerLibrary(q,mode){
 const scope=q.coverage==='complete-set'?'This edition includes the complete set defined in the question.':'These are accepted examples, not every possible valid answer.';
 return `<p>${esc(scope)}</p><p class="fine">${esc(q.scoreBasis||'Scores are provisional editorial game weights, not a student survey.')}</p><ul class="detail-list">${[...q.answers].sort((a,b)=>mode==='rare'?a.popularity-b.popularity:b.popularity-a.popularity).map(a=>`<li><details><summary>${esc(a.text)} · ${a.popularity}</summary><p>${esc(a.explanation)}</p>${a.scoreRationale?`<p><strong>Why this score:</strong> ${esc(a.scoreRationale)}</p>`:''}${a.aliases?.length?`<p class="fine">Also accepted: ${a.aliases.map(esc).join(', ')}.</p>`:''}</details></li>`).join('')}</ul>`;
}
