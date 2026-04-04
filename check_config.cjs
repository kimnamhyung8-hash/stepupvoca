// firebase.ts 원본 설정 확인
const fs = require("fs");
const t = fs.readFileSync("src/firebase.ts", "utf-8");
const match = t.match(/storageBucket:\s*"([^"]+)"/);
console.log("Current storageBucket in firebase.ts:", match ? match[1] : "NOT FOUND");

// Firebase Hosting config 확인
try {
  const fc = JSON.parse(fs.readFileSync("firebase.json", "utf-8"));
  console.log("firebase.json storage:", JSON.stringify(fc.storage || "not set"));
} catch(e) {}

// .firebaserc 확인
try {
  const rc = JSON.parse(fs.readFileSync(".firebaserc", "utf-8"));
  console.log(".firebaserc:", JSON.stringify(rc));
} catch(e) {}
