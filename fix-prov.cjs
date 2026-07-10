const fs = require('fs');
const path = 'C:\\Users\\Dusan Usjak\\Desktop\\ibecv4\\ibecv4\\frontend\\gen-data4.cjs';
let content = fs.readFileSync(path, 'utf-8');
const correctLine = "const PROV_KW = ['北京','天津','上海','重庆','河北','山西','辽宁','吉林','黑龙江','江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','海南','四川','贵州','云南','陕西','甘肃','青海','台湾','内蒙古','广西','西藏','宁夏','新疆'];";
content = content.replace(/const PROV_KW = \[[^\]]+\];/, correctLine);
fs.writeFileSync(path, content, 'utf-8');
console.log('Fixed PROV_KW');
