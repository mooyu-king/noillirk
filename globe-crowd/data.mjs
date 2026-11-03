import {expanded} from './expanded-bank.mjs';
import {countries} from './countries.mjs';
export {countries};
export const VERSION='globe-preview-20261103-v3';
export const SOURCE='https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/';
const bank=[];
// 顺序为本站编辑估计，与国家人口、搜索量和真实玩家选择率无关。
const editorialOrder='US GB FR JP IT CN IN BR ES DE AU CA MX EG GR ZA NZ KR TH AR NO CH KE ID PE PT SE VN MA CL CO FI IE PH PL NG TZ IS AT MY NP CU CR RO HU CZ EC BO NA BW PK BD LK ET UG ZM ZW MG DZ TN GH MZ RW PY UY VE GT PA JM FJ PG SB VU MN KH BT GY SR DK UA'.split(' ');
function add(id,prompt,category,definition,codes,difficulty='standard',source=SOURCE){
 const answers=[...new Set(codes)].filter(code=>countries.some(c=>c.code===code)).sort((a,b)=>editorialOrder.indexOf(a)-editorialOrder.indexOf(b)).map((code,i)=>({code,weight:1000-i}));
 if(answers.length<2||bank.some(q=>q.category===category&&[...q.accepted_answers].sort().join()===answers.map(a=>a.code).sort().join()))return;
 bank.push({id,question_id:id,version:VERSION,locale:'en',prompt,definition,category,difficulty,answers,accepted_answers:answers.map(a=>a.code),eligible_country_codes:countries.map(c=>c.code),aliases:{},editorial_rank:answers.map(a=>a.code),score_version:'average-rank-v1',sources:[{url:source,license:source===SOURCE?'Public domain':'ODbL-1.0',retrieved_at:'2026-11-03'}],source,verified_at:'2026-11-03',reviewer:'automated-set-check; human release review pending',status:'preview',explanation:definition});
}
for(const region of [...new Set(countries.map(c=>c.region))])add(`region-${region}`,`Choose a country in ${region}.`,'Regions',`Use the Natural Earth continental grouping within our ${countries.length}-country atlas. Only supported atlas countries are selectable.`,countries.filter(c=>c.region===region).map(c=>c.code),'easy');
for(const region of [...new Set(countries.map(c=>c.subregion))])add(`subregion-${region}`,`Find a country in ${region}.`,'Regions','Use the regional grouping supplied by the frozen Natural Earth atlas. This is a statistical grouping, not a statement about political identity.',countries.filter(c=>c.subregion===region).map(c=>c.code));
const neighbors={FR:'ES DE IT CH',DE:'FR CH AT CZ PL DK',ES:'FR PT',IT:'FR CH AT',CH:'FR DE IT AT',AT:'DE CH IT CZ HU',PL:'DE CZ UA',CZ:'DE PL AT',HU:'AT RO UA',RO:'HU UA',NO:'SE FI',SE:'NO FI',CN:'IN NP BT PK MN VN',IN:'PK CN NP BT BD',TH:'MY KH',VN:'CN KH',BR:'AR BO CO GY PY PE SR UY VE',AR:'BO BR CL PY UY',PE:'BO BR CL CO EC',BO:'AR BR CL PY PE',CO:'BR EC PE VE',ZA:'BW MZ NA ZW',KE:'ET TZ UG',TZ:'KE MZ RW UG ZM',ZM:'BW MZ NA TZ ZW',ZW:'BW MZ ZA ZM',MA:'DZ',CA:'US',MX:'US GT'};
for(const [code,list] of Object.entries(neighbors))add(`neighbor-${code}`,`Choose a land neighbor of ${countries.find(c=>c.code===code).name}.`,'Borders','A shared land boundary counts; a sea crossing does not. For France, use metropolitan Europe only. Answers are limited to this atlas; other real neighbors may be absent.',list.split(' '));
const landlocked='AT CH CZ HU MN NP BT BO PY BW ZM ZW UG RW';
add('landlocked','Choose a landlocked country.','Geography','Landlocked means having no coastline on the open ocean. Only the supported atlas countries are included.',landlocked.split(' '));
for(const region of ['Europe','Asia','Africa'])add(`landlocked-${region}`,`Choose a landlocked country in ${region}.`,'Geography','Both conditions must hold: the country is in the named atlas region and has no open-ocean coastline.',countries.filter(c=>c.region===region&&landlocked.split(' ').includes(c.code)).map(c=>c.code),'hard');
add('island','Choose a country whose territory is entirely on islands.','Geography','Island countries may occupy several islands or share an island with another country. Australia is excluded because its main landmass is a continent. Only this atlas subset is included.','GB IE IS JP ID PH LK MG CU JM NZ FJ PG SB VU'.split(' '));
for(const [id,label,test] of [['north','north of the Equator',c=>c.lat>0],['south','south of the Equator',c=>c.lat<0],['east','east of the prime meridian',c=>c.lon>0],['west','west of the prime meridian',c=>c.lon<0]])add(`point-${id}`,`Find a country with its atlas marker ${label}.`,'Map reading','This question is about the representative label point on this map, not every part of the country. A country can extend across a meridian or the Equator while its marker is on one side.',countries.filter(test).map(c=>c.code));
for(const q of expanded)add(q.id,q.prompt,q.category,q.definition,q.codes,'standard',q.category==='Map reading'?SOURCE:'https://github.com/mledoze/countries');
export const questions=bank;
