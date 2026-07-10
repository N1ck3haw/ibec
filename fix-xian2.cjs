const fs = require('fs');
const path = 'C:\\Users\\Dusan Usjak\\Desktop\\ibecv4\\ibecv4\\frontend\\gen-data4.cjs';
let content = fs.readFileSync(path, 'utf-8');
content = content.replace("||s.includes('xian')", "||s.includes('xian')||s.includes(\"xi'an\")");
fs.writeFileSync(path, content, 'utf-8');
console.log('Done');
