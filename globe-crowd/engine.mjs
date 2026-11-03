import {pilots} from './pilots.mjs';
export function grade(q,code,mode){
 if(!['hot','cold'].includes(mode))throw new Error('Invalid mode');
 const a=q.answers.find(x=>x.code===code);if(!a)return {score:0,tier:0,accepted:false};
 const n=q.answers.length;if(n===1)return {score:100,tier:mode==='hot'?1:20,accepted:true,rank:1,p:0};
 const above=q.answers.filter(x=>x.weight>a.weight).length,equal=q.answers.filter(x=>x.weight===a.weight).length;
 const rank=above+(equal+1)/2,p=(rank-1)/(n-1),hotTier=Math.min(20,Math.floor(p*20)+1);
 return {score:Math.round((mode==='hot'?100-99*p:1+99*p)*10)/10,tier:mode==='hot'?hotTier:21-hotTier,accepted:true,rank,p};
}
export function order(bank,kind,date=new Date(),random=Math.random,recent=[]){
 const result=[...bank];let seed=[...`${date.toISOString().slice(0,10)}:${bank[0]?.version||''}`].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,0);
 const next=kind==='daily'?()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296}:random;
 for(let i=result.length-1;i>0;i--){const j=Math.floor(next()*(i+1));[result[i],result[j]]=[result[j],result[i]]}
 const seen=new Set(kind==='daily'?[]:recent),fresh=result.filter(q=>!seen.has(q.id)),repeats=result.filter(q=>seen.has(q.id));
 const selected=[];for(const pool of [fresh,repeats]){while(pool.length&&selected.length<5){const counts=new Map();for(const q of selected)counts.set(q.category,(counts.get(q.category)||0)+1);pool.sort((a,b)=>(counts.get(a.category)||0)-(counts.get(b.category)||0));selected.push(pool.shift())}}
 return selected;
}
export function createRun(bank,kind,mode,pilot,date=new Date(),recent=[],random=Math.random){
 if(!['daily','practice'].includes(kind)||!['hot','cold'].includes(mode))throw new Error('Invalid expedition');
 return {version:bank[0].version,date:date.toISOString().slice(0,10),kind,mode,pilot:Math.max(0,Math.min(pilots.length-1,Math.floor(Number(pilot)||0))),ids:order(bank,kind,date,random,recent).map(q=>q.id),results:[],phase:'question',picked:''};
}
export function submit(run,bank,code){
 if(run.phase!=='question'||run.results.length>=run.ids.length)return run;
 const q=bank.find(q=>q.id===run.ids[run.results.length]);if(!q)throw new Error('Unknown frozen question');
 if(code&&!q.eligible_country_codes.includes(code))throw new Error('Unsupported country');
 return {...run,phase:'reveal',picked:code,results:[...run.results,{id:q.id,code,...grade(q,code,run.mode)}]};
}
export function advance(run){return run.phase==='reveal'?{...run,phase:run.results.length===run.ids.length?'complete':'question',picked:''}:run}
export function restoreRun(raw,bank){
 try{const s=JSON.parse(raw);if(!s||s.version!==bank[0].version||!['daily','practice'].includes(s.kind)||!['hot','cold'].includes(s.mode)||!['question','reveal','complete'].includes(s.phase)||!/^\d{4}-\d{2}-\d{2}$/.test(s.date)||!Number.isInteger(s.pilot)||s.pilot<0||s.pilot>=pilots.length||!Array.isArray(s.ids)||s.ids.length!==5||new Set(s.ids).size!==5||!s.ids.every(id=>bank.some(q=>q.id===id))||!Array.isArray(s.results)||s.results.length>5)return null;
 const results=s.results.map((r,i)=>{const q=bank.find(q=>q.id===s.ids[i]);if(r.id!==q.id||typeof r.code!=='string'||r.code&&!q.eligible_country_codes.includes(r.code))throw Error('Invalid answer');return {id:q.id,code:r.code,...grade(q,r.code,s.mode)}});
 if(s.phase==='complete'&&results.length!==5||s.phase==='question'&&results.length===5||s.phase==='reveal'&&!results.length)return null;
 return {...s,results,picked:''};
 }catch{return null}
}

export function rememberQuestions(bank,recent,ids){
 const allowed=new Set(bank.map(q=>q.id));const all=[...new Set([...recent,...ids])].filter(id=>allowed.has(id));
 return all.length>=bank.length?[...ids]:all;
}
