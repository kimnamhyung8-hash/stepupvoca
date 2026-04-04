
const admin = require('firebase-admin');
const serviceAccount = require('./target_key.json');

// merge_accounts.cjs와 동일한 인증 방식 적용
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'vocaquest-7ebea.appspot.com'
    });
}

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
    console.log('Attempting to set CORS for: vocaquest-7ebea.appspot.com');
    await bucket.setMetadata({ cors: corsConfiguration });
    console.log('SUCCESS: CORS configuration applied!');
    process.exit(0);
  } catch (error) {
    console.error('FAILURE: Error setting CORS:', error);
    process.exit(1);
  }
}

setCors();
