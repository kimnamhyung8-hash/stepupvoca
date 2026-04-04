const fs = require('fs');
let code = fs.readFileSync('src/communityService.ts', 'utf-8');

const regex = /const uploadUrl = `https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/\$\{bucket\}\/o\?name=\$\{filePath\}`;/g;
const replacement = "const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?name=${filePath}&_cb=${Date.now()}`;";

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/communityService.ts', code, 'utf-8');
  console.log("Added cache buster to uploadUrl.");
} else {
  console.log("Could not find uploadUrl to replace.");
}
