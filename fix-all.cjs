const fs = require('fs');
const path = 'C:\\Users\\Dusan Usjak\\Desktop\\ibecv4\\ibecv4\\frontend\\gen-data4.cjs';
let content = fs.readFileSync(path, 'utf-8');

// Fix PROV_KW
const correctProvKw = "const PROV_KW = ['北京','天津','上海','重庆','河北','山西','辽宁','吉林','黑龙江','江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','海南','四川','贵州','云南','陕西','甘肃','青海','台湾','内蒙古','广西','西藏','宁夏','新疆'];";
content = content.replace(/const PROV_KW = \[[^\]]+\];/, correctProvKw);

// Fix SCH_PROV
const correctSchProv = "const SCH_PROV = {\n" +
  "  '海南大学':'海南','浙江大学':'浙江','华中农业大学':'湖北','中南大学':'湖南','齐鲁工业大学':'山东',\n" +
  "  '北京协和医学院':'北京','西藏大学':'西藏','兰州大学':'甘肃','深圳理工大学':'广东','四川大学':'四川',\n" +
  "  '昌平实验室':'北京','西湖大学':'浙江','华中科技大学':'湖北','湖北大学':'湖北',\n" +
  "  '南方医科大学':'广东','广东食品药品职业学院':'广东','福建医科大学':'福建',\n" +
  "  '晋中信息学院':'山西','空军军医大学':'陕西','华东师范大学':'上海','华南农业大学':'广东',\n" +
  "  '厦门大学':'福建','上海科技大学':'上海','湘潭大学':'湖南','哈尔滨工业大学':'黑龙江',\n" +
  "  '西北工业大学':'陕西','山东大学':'山东','南昌大学':'江西','南京农业大学':'江苏',\n" +
  "  '浙江海洋大学':'浙江','陕西科技大学':'陕西','中国中医科学院':'北京','中山大学':'广东',\n" +
  "  '中山大学孙逸仙纪念医院':'广东','安徽医科大学':'安徽','安徽医科大学第一附属医院':'安徽',\n" +
  "  '西北农林科技大学':'陕西','山西农业大学':'山西','中南财经政法大学':'湖北',\n" +
  "  '华中科技大学':'湖北','深圳北理莫斯科大学':'广东','长春理工大学':'吉林',\n" +
  "  '中国药科大学':'江苏','长春中医药大学':'吉林','信阳师范大学':'河南',\n" +
  "};";
const schStart = content.indexOf("const SCH_PROV = {");
const schEnd = content.indexOf("};", schStart) + 2;
content = content.substring(0, schStart) + correctSchProv + content.substring(schEnd);

fs.writeFileSync(path, content, 'utf-8');
console.log('Fixed SCH_PROV and PROV_KW');
