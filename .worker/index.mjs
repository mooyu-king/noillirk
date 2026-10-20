// Workers主站入口；只代理同源API，其他路径交给静态资源绑定。
const unavailable=()=>Response.json({error:'SERVICE_NOT_CONFIGURED',message:'The game service is temporarily unavailable. Please retry later.'},{status:503,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export default {
 async fetch(request,env){
  const path=new URL(request.url).pathname;
  if(path==='/api'||path.startsWith('/api/')){
   if(!env.GAME_API)return unavailable();
   try{return await env.GAME_API.fetch(request);}catch{return unavailable();}
  }
  return env.ASSETS.fetch(request);
 }
};
