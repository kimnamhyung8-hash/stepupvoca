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
    "origin": [
       "http://localhost",
       "https://localhost",
       "capacitor://localhost",
       "ionic://localhost",
       "file://",
       "*" // fallback
    ],
    "responseHeader": ["Content-Type", "Authorization", "x-goog-resumable", "Accept"],
    "method": ["GET", "HEAD", "DELETE", "POST", "PUT", "OPTIONS"],
    "maxAgeSeconds": 3600
  }
];

bucket.setCorsConfiguration(corsConfig)
  .then(() => {
    console.log("SUCCESS! EXACT ORIGIN CORS set globally to bucket");
    process.exit(0);
  })
  .catch((err) => {
    console.error("ERROR setting CORS:", err);
    process.exit(1);
  });
