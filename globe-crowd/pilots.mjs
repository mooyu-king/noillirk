// 原创飞行员；顺序兼容已有存档，身份不影响分数。
export const pilots=[
 ['pip','Pip','Amber quiff'],['mika','Mika','Sage curls'],['jo','Jo','Plum bob'],['ari','Ari','Blue helmet'],
 ['nova','Nova','Coral buns'],['otto','Otto','Silver beard'],['mei','Mei','Teal bob'],['ruby','Ruby','Copper braid'],
 ['lumi','Lumi','Red beret'],['kai','Kai','Cobalt crew'],['hugo','Hugo','Rust moustache'],['ida','Ida','Silver waves'],
 ['cleo','Cleo','Peach ponytail'],['jax','Jax','Burgundy locks'],['finn','Finn','Ginger curls'],['zuri','Zuri','Golden helmet']
].map(([id,name,detail])=>({id,name,detail,image:`pilot-${id}-v3.webp`}));
