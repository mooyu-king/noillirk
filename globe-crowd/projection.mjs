// 正交球面投影，目标经纬度都转向镜头中心。
export function projectGlobe(lat,lon,longitude,latitude,r,cx,cy){
 const k=Math.PI/180,a=(lon-longitude)*k,b=lat*k,p=latitude*k;
 return {x:cx+r*Math.cos(b)*Math.sin(a),y:cy-r*(Math.cos(p)*Math.sin(b)-Math.sin(p)*Math.cos(b)*Math.cos(a)),z:Math.sin(p)*Math.sin(b)+Math.cos(p)*Math.cos(b)*Math.cos(a)};
}
