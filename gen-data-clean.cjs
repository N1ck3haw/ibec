const { parse } = require('csv-parse/sync');
const fs = require('fs');
const buf = fs.readFileSync('C:\\Users\\Dusan Usjak\\Desktop\\ibecv4\\ibecv4\\frontend\\ibec_teams_original.csv');
const text = buf.toString('utf-8');
const records = parse(text, { columns: true, skip_empty_lines: true, relax_column_count: true, relax_quotes: true });

const NORM = {
  '浙江大学生命科学学院':'浙江大学','西湖大学/北京中关村学院':'西湖大学',
  '西北农林科技大学动物医学院':'西北农林科技大学','西藏大学生态环境学院':'西藏大学',
  '吉林省长春中医药大学':'长春中医药大学','齐鲁工业大学（山东省科学院）':'齐鲁工业大学',
  'PUMC':'北京协和医学院','university of california, davis':'University of California, Davis',
};
function normalize(s) { return NORM[s] || s; }
function cleanSchool(s) {
  const c = (s||'').replace(/^[\s?']+|[\s?']+$/g,'').trim();
  if (!c || c.length < 3) return null;
  if (/^[a-zA-Z0-9\s]{1,2}$/.test(c)) return null;
  return normalize(c);
}

function guessCountry(addr, school, nat) {
  const a = (addr||'').toLowerCase();
  const s = (school||'').toLowerCase();
  if (a.includes('thailand')||a.includes('bangkok')) return 'Thailand';
  if (a.includes('japan')||a.includes('tokyo')) return 'Japan';
  if (a.includes('sri lanka')) return 'Sri Lanka';
  if (a.includes('california')||a.includes('davis')||a.includes('san diego')||a.includes('purdue')||s.includes('purdue')||s.includes('california')||s.includes('san diego')) return 'United States';
  if (/[\u4e00-\u9fff]/.test(s)||s.includes('xian')||s.includes('beijing')||s.includes('shanghai')||s.includes('zhejiang')) return 'China';
  if (/[\u4e00-\u9fff]/.test(a)||a.includes('china')) return 'China';
  return nat || 'Unknown';
}

const PROV_KW = ['北京','天津','上海','重庆','河北','山西','辽宁','吉林','黑龙江','江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','海南','四川','贵州','云南','陕西','甘肃','青海','台湾','内蒙古','广西','西藏','宁夏','新疆'];
function getProvince(addr) { if (!addr) return null; for (const pk of PROV_KW) { if (addr.includes(pk)) return pk; } return null; }

const SCH_PROV = {
  '海南大学':'海南','浙江大学':'浙江','华中农业大学':'湖北','中南大学':'湖南','齐鲁工业大学':'山东',
  '北京协和医学院':'北京','西藏大学':'西藏','兰州大学':'甘肃','深圳理工大学':'广东','四川大学':'四川',
  '昌平实验室':'北京','西湖大学':'浙江','华中科技大学':'湖北','湖北大学':'湖北',
  '南方医科大学':'广东','广东食品药品职业学院':'广东','福建医科大学':'福建',
  '晋中信息学院':'山西','空军军医大学':'陕西','华东师范大学':'上海','华南农业大学':'广东',
  '厦门大学':'福建','上海科技大学':'上海','湘潭大学':'湖南','哈尔滨工业大学':'黑龙江',
  '西北工业大学':'陕西','山东大学':'山东','南昌大学':'江西','南京农业大学':'江苏',
  '浙江海洋大学':'浙江','陕西科技大学':'陕西','中国中医科学院':'北京','中山大学':'广东',
  '中山大学孙逸仙纪念医院':'广东','安徽医科大学':'安徽','安徽医科大学第一附属医院':'安徽',
  '西北农林科技大学':'陕西','山西农业大学':'山西','中南财经政法大学':'湖北',
  '华中科技大学':'湖北','深圳北理莫斯科大学':'广东','长春理工大学':'吉林',
  '中国药科大学':'江苏','长春中医药大学':'吉林','信阳师范大学':'河南',
};
function provinceFromSchool(s) { if(!s) return null; for(const [k,p] of Object.entries(SCH_PROV)) { if(s.includes(k)) return p; } return null; }

const worldTeams = {}, worldSchools = {}, provTeams = {}, provSchools = {};
records.forEach((r, idx) => {
  const addr = r.leader_address || '';
  const nat = r.leader_nationality || 'Unknown';
  const leaderSchool = cleanSchool(r.leader_school_unit);
  const country = guessCountry(addr, leaderSchool||'', nat);
  if (!worldTeams[country]) worldTeams[country] = new Set();
  worldTeams[country].add(idx);
  if (leaderSchool) {
    if (!worldSchools[country]) worldSchools[country] = {};
    worldSchools[country][leaderSchool] = (worldSchools[country][leaderSchool]||0)+1;
  }
  if (country === 'China') {
    const pSchool = provinceFromSchool(leaderSchool);
    const pAddr = getProvince(addr);
    const province = pSchool || pAddr;
    if (province) {
      if (!provTeams[province]) provTeams[province] = new Set();
      provTeams[province].add(idx);
      if (leaderSchool) {
        if (!provSchools[province]) provSchools[province] = {};
        provSchools[province][leaderSchool] = (provSchools[province][leaderSchool]||0)+1;
      }
    }
  }
});

function fmt(obj) {
  const r = {};
  Object.entries(obj).forEach(([k,v]) => { r[k] = { count: v.size, schools: [] }; });
  Object.entries(obj).forEach(([k,v]) => {});
  return r;
}
const worldOutput = fmt(worldTeams);
Object.entries(worldSchools).forEach(([c,ss]) => { if(worldOutput[c]) worldOutput[c].schools = Object.entries(ss).sort((a,b)=>b[1]-a[1]).map(([n,c])=>({name:n,count:c})); });
const chinaOutput = {};
Object.entries(provTeams).forEach(([p,set]) => {
  chinaOutput[p] = { count: set.size, schools: (provSchools[p]?Object.entries(provSchools[p]).sort((a,b)=>b[1]-a[1]).map(([n,c])=>({name:n,count:c})):[]) };
});
chinaOutput['南海诸岛'] = { count: 0, schools: [] };

const output = { world: worldOutput, china: chinaOutput, total: records.length };
fs.writeFileSync('C:\\Users\\Dusan Usjak\\Desktop\\ibecv4\\ibecv4\\frontend\\public\\team-data.json', JSON.stringify(output, null, 2));
console.log('Generated!');
Object.entries(output.world).forEach(([c,d]) => console.log('  '+c+': '+d.count+' teams'));
console.log('Province sum:', Object.values(provTeams).reduce((a,s)=>a+s.size,0));
