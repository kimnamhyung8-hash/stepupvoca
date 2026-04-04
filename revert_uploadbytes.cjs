const fs = require('fs');
let code = fs.readFileSync('src/communityService.ts', 'utf-8');

const regex = /export const uploadCommunityImage = async \([\s\S]*?^};/m;

const newFunc = `export const uploadCommunityImage = async (file: File, uid: string): Promise<string> => {
  console.log('[Upload] Starting pure Firebase SDK upload (Blob)...');
  
  const compressPromise = compressImage(file);
  const compressTimeout = new Promise<File | Blob>((resolve) => setTimeout(() => resolve(file), 15000));
  const optimizedBlob = await Promise.race([compressPromise, compressTimeout]).catch(() => file);
  
  const safeName = file.name || "image";
  const fileName = \`\${Date.now()}_\${safeName.replace(/\\.[^/.]+$/, "")}.jpg\`;
  const filePath = \`community/images/\${uid}/\${fileName}\`;
  
  const currentUser = auth?.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  const storageRef = ref(storage, filePath);
  
  const uploadTask = async () => {
    try {
      console.log('[Upload] Sending Blob to Firebase SDK...');
      // 100% 순정 파이어베이스 업로드 모듈 (메모리 다운 버그 회피 적용)
      await uploadBytes(storageRef, optimizedBlob);
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
// Ensure we have uploadBytes
if (!code.includes("uploadBytes")) {
  code = code.replace("import { ref, uploadString, getDownloadURL } from 'firebase/storage';", "import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';");
} else {
  code = code.replace("uploadString,", "uploadBytes,");
}

fs.writeFileSync('src/communityService.ts', code, 'utf-8');
console.log("REVERTED TO PURE UPLOADBYTES!");
