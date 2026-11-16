// 数据与游戏版本必须一起加载，失败时不读取或覆盖旧进度。
export async function loadQuestionBank(categories,version,fetcher=globalThis.fetch){
 const groups=await Promise.all(categories.map(async category=>{
  const response=await fetcher(`./data/${category}.json?v=${encodeURIComponent(version)}`);
  if(!response.ok)throw Error('The question library could not be loaded.');
  const data=await response.json();
  if(!Array.isArray(data)||!data.length||data.some(q=>q?.category!==category))throw Error('The question library is incomplete. Refresh and try again.');
  if(version.startsWith('campus-v3-')){
   const ids=new Set(data.map(q=>q.id));
   if(data.length!==300||ids.size!==300||Array.from({length:300},(_,i)=>`${category}-${String(i+1).padStart(3,'0')}`).some(id=>!ids.has(id)))throw Error('The question library is incomplete. Refresh and try again.');
  }
  return data;
 }));
 const bank=groups.flat();
 if(!version.startsWith('campus-v3-')&&bank.some(q=>q.contentRevision==='editorial-v3'))throw Error('The question library version does not match this game. Refresh and try again.');
 if(version.startsWith('campus-v3-')&&bank.some(q=>q.bankVersion!==version))throw Error('The question library version does not match this game. Refresh and try again.');
 return bank;
}
