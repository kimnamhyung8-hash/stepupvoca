const fs = require('fs');
let code = fs.readFileSync('src/communityService.ts', 'utf-8');

// Insert the imports back if missing
if (!code.includes("firebase/storage")) {
   code = "import { ref, uploadString, getDownloadURL } from 'firebase/storage';\nimport { storage } from './firebase';\n" + code;
}

const regex = /export const uploadCommunityImage = async \([\s\S]*?^};/m;

const newFunc = `export const uploadCommunityImage = async (file: File, uid: string): Promise<string> => {
  console.log('[Upload] Starting pure Firebase SDK upload with Base64 fix...');
  
  const compressPromise = compressImage(file);
  const compressTimeout = new Promise<File | Blob>((resolve) => setTimeout(() => resolve(file), 10000));
  const optimizedBlob = await Promise.race([compressPromise, compressTimeout]);
  
  const safeName = file.name || "image";
  const fileName = \`\${Date.now()}_\${safeName.replace(/\\.[^/.]+$/, "")}.jpg\`;
  const filePath = \`community/images/\${uid}/\${fileName}\`;
  
  const currentUser = auth?.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  // Capacitor Firebase fix: Convert Blob to Data URL (base64) so SDK doesn't use buggy Blob chunking
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(optimizedBlob);
  });
  
  const storageRef = ref(storage, filePath);
  
  const uploadTask = async () => {
    try {
      console.log('[Upload] Pushing base64 chunk to Firebase Storage SDK...');
      await uploadString(storageRef, dataUrl, 'data_url');
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch(err: any) {
      console.error('[Upload] SDK Exception:', err);
      throw new Error(\`Firebase SDK 에러: \${err.message || JSON.stringify(err)}\`);
    }
  };

  const uploadTimeout = new Promise<string>((_, reject) => setTimeout(() => reject(new Error("UPLOAD_TIMEOUT")), 30000));
  
  try {
     const url = await Promise.race([uploadTask(), uploadTimeout]);
     console.log('[Upload] Upload Success:', url);
     return url;
  } catch (err: any) {
     if (err?.message === 'UPLOAD_TIMEOUT') {
        alert("업로드 시간이 너무 초과되었습니다 (30초). 인터넷이 원활한지 확인해주세요.");
     } else {
        alert(err?.message || JSON.stringify(err));
     }
     throw err;
  }
};`

code = code.replace(regex, newFunc);
fs.writeFileSync('src/communityService.ts', code, 'utf-8');
console.log("REVERTED TO FIREBASE SDK WITH DATA_URL!");
