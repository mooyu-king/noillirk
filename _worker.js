// Pages 同源入口；在 Cloudflare Pages 配置 GAME_API 服务绑定。
export default {
 async fetch(request,env){
  if(new URL(request.url).pathname.startsWith('/api/')){
   if(!env.GAME_API)return Response.json({error:'SERVICE_NOT_CONFIGURED',message:'The game service is not connected yet. Please try again later.'},{status:503,headers:{'Cache-Control':'no-store'}});
   return env.GAME_API.fetch(request);
  }
  return env.ASSETS.fetch(request);
 }
};
