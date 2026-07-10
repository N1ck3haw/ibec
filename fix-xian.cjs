const fs = require('fs');
const path = 'C:\\Users\\Dusan Usjak\\Desktop\\ibecv4\\ibecv4\\frontend\\gen-data4.cjs';
let content = fs.readFileSync(path, 'utf-8');
content = content.replace(
  "if (/[\\u4e00-\\u9fff]/.test(s)||s.includes('xi\\\\'an')||s.includes('beijing')||s.includes('shanghai')||s.includes('zhejiang')) return 'China';",
  "if (/[\\u4e00-\\u9fff]/.test(s)||s.includes('xian')||s.includes('beijing')||s.includes('shanghai')||s.includes('zhejiang')) return 'China';"
);
fs.writeFileSync(path, content, 'utf-8');
console.log('Fixed');
