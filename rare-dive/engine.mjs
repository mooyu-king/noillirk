import {questions,DATA_VERSION} from './data.mjs';
export {questions,DATA_VERSION};
export const ROUNDS=7,SECONDS=25;
export const normalize=value=>String(value??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'').replace(/[-_]/g,' ').replace(/\s+/g,' ').trim();
export function lookup(question,value){const key=normalize(value);return key?question.answers.find(a=>[a.label,...a.aliases].some(x=>normalize(x)===key))||null:null;}
export function tier(score){return score===0?'No echo':score<30?'Surface':score<60?'Drifter':score<85?'Rare find':score<100?'Deep discovery':'Trench treasure';}
export function hash(text){let n=2166136261;for(const c of text)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;}
export function pickQuestions(mode,date=new Date(),seed=Date.now(),seen=[]){
 let n=hash(mode==='daily'?`${DATA_VERSION}:${date.toISOString().slice(0,10)}`:String(seed));
 const rand=()=>{n^=n<<13;n^=n>>>17;n^=n<<5;return(n>>>0)/4294967296;};
 const pool=[...questions];for(let i=pool.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 if(mode!=='daily')pool.sort((a,b)=>Number(seen.includes(a.id))-Number(seen.includes(b.id)));
 return pool.slice(0,ROUNDS);
}
export function createRun(mode='practice',date=new Date(),seed=Date.now(),seen=[]){return {mode,date:date.toISOString().slice(0,10),questions:pickQuestions(mode,date,seed,seen),index:0,phase:'question',deadline:date.getTime()+SECONDS*1000,results:[],score:0};}
export function remaining(run,now=Date.now()){return Math.max(0,Math.ceil((run.deadline-now)/1000));}
export function answer(run,input,now=Date.now(),finish=false){
 if(run.phase!=='question')return {run,status:'locked'};
 const match=lookup(run.questions[run.index],input),expired=now>=run.deadline;
 if(!match&&!expired&&!finish)return {run,status:normalize(input)?'unlisted':'empty'};
 const result={question:run.questions[run.index],input:String(input).trim(),label:match?.label||null,score:match?.score||0,reason:match?'matched':expired?'timeout':normalize(input)?'unlisted':'empty'};
 return {status:'revealed',run:{...run,phase:'reveal',score:run.score+result.score,results:[...run.results,result]}};
}
export function nextRound(run,now=Date.now()){
 if(run.phase!=='reveal')return run;
 return run.index===ROUNDS-1?{...run,phase:'complete'}:{...run,index:run.index+1,phase:'question',deadline:now+SECONDS*1000};
}
