const fs = require('fs');
const admin = require('firebase-admin');

const keyPath = 'd:/antigravity/stepupvoca/app/target_key.json';
console.log('Reading key from:', keyPath);
const raw = fs.readFileSync(keyPath, 'utf8');
const serviceAccount = JSON.parse(raw);

// 개인키 파싱 보강: 이미 줄바꿈이 포함되어 있을 수 있으므로 더 정교하게 처리
let pkey = serviceAccount.private_key;
// 만약 이스케이프된 \n이 문자열로 들어있다면 실제 개행으로 변환
if (pkey.includes('\\n')) {
  pkey = pkey.replace(/\\n/g, '\n');
}
serviceAccount.private_key = pkey.trim() + '\n';

console.log('Initializing Firebase Admin...');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'vocaquest-7ebea.appspot.com'
});

const bucket = admin.storage().bucket();

const corsConfiguration = [
  {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'https://voca-quest.web.app'],
    method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
    responseHeader: ['Content-Type', 'Authorization', 'x-goog-resumable'],
    maxAgeSeconds: 3600
  }
];

async function setCors() {
  try {
    console.log('Setting CORS for bucket: vocaquest-7ebea.appspot.com');
    await bucket.setMetadata({ cors: corsConfiguration });
    console.log('CORS configuration updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting CORS:', error);
    process.exit(1);
  }
}

setCors();
