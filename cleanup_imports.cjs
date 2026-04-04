const fs = require('fs');
let code = fs.readFileSync('src/communityService.ts', 'utf-8');

code = code.replace("import { storage } from './firebase';\n", "");
code = code.replace("import { ref, uploadString, getDownloadURL } from 'firebase/storage';\n", "");

fs.writeFileSync('src/communityService.ts', code, 'utf-8');
console.log("Cleaned up unused imports.");
