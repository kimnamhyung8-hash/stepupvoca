const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf-8');
code = code.replace('"vocaquest-7ebea.firebasestorage.app"', '"vocaquest-7ebea.appspot.com"');
fs.writeFileSync('src/firebase.ts', code, 'utf-8');
console.log("Reverted bucket name in firebase.ts to .appspot.com");
