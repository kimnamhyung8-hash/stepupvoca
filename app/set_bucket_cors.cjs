const admin = require("firebase-admin");
const serviceAccount = require("./target_key.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const bucket = admin.storage().bucket('vocaquest-7ebea.firebasestorage.app');

const corsConfig = [
  {
    "origin": ["*"],
    "responseHeader": ["*"],
    "method": ["GET", "HEAD", "DELETE", "POST", "PUT", "OPTIONS"],
    "maxAgeSeconds": 3600
  }
];

bucket.setCorsConfiguration(corsConfig)
  .then(() => {
    console.log("SUCCESS! CORS set globally to bucket");
    process.exit(0);
  })
  .catch((err) => {
    console.error("ERROR setting CORS:", err);
    process.exit(1);
  });
