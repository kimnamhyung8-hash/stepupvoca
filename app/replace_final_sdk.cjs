const fs = require('fs');
let code = fs.readFileSync('src/communityService.ts', 'utf-8');

// Insert imports
code = code.replace("import { db } from './firebase';", "import { db } from './firebase';\nimport { storage } from './firebase';\nimport { ref, uploadString, getDownloadURL } from 'firebase/storage';");

const regex = /export const uploadCommunityImage = async \(file: File, uid: string\): Promise<string> => \{[\s\S]*?^};/m;

const newFunc = `export const uploadCommunityImage = async (file: File, uid: string): Promise<string> => {
  console.log('[Upload] Starting Firebase SDK with data_url...');
  
  const compressPromise = compressImage(file);
  const compressTimeout = new Promise<File>((resolve) => setTimeout(() => resolve(file), 10000));
  const optimizedBlob = await Promise.race([compressPromise, compressTimeout]);
  
  const safeName = file.name || "image";
  const fileName = \`\${Date.now()}_\${safeName.replace(/\\.[^/.]+$/, "")}.jpg\`;
  const storageRef = ref(storage, \`community/images/\${uid}/\${fileName}\`);
  
  const currentUser = auth?.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  // Read as base64 data url for SDK upload (bypasses direct blob fetch chunking bugs in Capacitor)
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(optimizedBlob);
  });
  
  console.log('[Upload] Pushing via uploadString...');
  const uploadTask = async () => {
    try {
      // CORS is fixed globally now, so this will perfectly succeed without silent preflight drops
      const snapshot = await uploadString(storageRef, base64Data, 'data_url', {
        contentType: optimizedBlob.type || 'image/jpeg'
      });
      return await getDownloadURL(snapshot.ref);
    } catch(err) {
      console.error('[Upload] SDK Exception:', err);
      throw err;
    }
  };

  const uploadTimeout = new Promise<string>((_, reject) => setTimeout(() => reject(new Error("UPLOAD_TIMEOUT")), 30000));
  
  try {
     const url = await Promise.race([uploadTask(), uploadTimeout]);
     console.log('[Upload] SDK Success:', url);
     return url;
  } catch (err: any) {
     if (err?.message === 'UPLOAD_TIMEOUT') {
        alert("업로드 시간이 너무 초과되었습니다. 용량이 크거나 인터넷 환경이 불안정합니다.");
     } else {
        alert("업로드 오류: " + (err?.message || JSON.stringify(err)));
     }
     throw err;
  }
};`

code = code.replace(regex, newFunc);
fs.writeFileSync('src/communityService.ts', code, 'utf-8');
console.log("REPLACED with SDK Base64 upload!");
