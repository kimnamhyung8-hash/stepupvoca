const fs = require('fs');

// 1. Fix capacitor.config.ts
let capConfig = fs.readFileSync('capacitor.config.ts', 'utf-8');
capConfig = capConfig.replace(/    CapacitorHttp: \{\s*enabled: true,\s*\},/m, '');
fs.writeFileSync('capacitor.config.ts', capConfig, 'utf-8');
console.log("Fixed capacitor.config.ts");

// 2. Fix firebase.ts
let firebaseTs = fs.readFileSync('src/firebase.ts', 'utf-8');
firebaseTs = firebaseTs.replace('vocaquest-7ebea.appspot.com', 'vocaquest-7ebea.firebasestorage.app');
fs.writeFileSync('src/firebase.ts', firebaseTs, 'utf-8');
console.log("Fixed firebase.ts");

