const fs = require('fs');
let code = fs.readFileSync('src/communityService.ts', 'utf-8');
code = code.replace("import { CapacitorHttp } from '@capacitor/core';\n", "");
fs.writeFileSync('src/communityService.ts', code, 'utf-8');
console.log("Removed CapacitorHttp import");
