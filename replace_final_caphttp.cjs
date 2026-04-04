const fs = require('fs');
let code = fs.readFileSync('src/communityService.ts', 'utf-8');

if (!code.includes("import { CapacitorHttp }")) {
   code = "import { CapacitorHttp } from '@capacitor/core';\n" + code;
}

const regex = /export const uploadCommunityImage = async \([\s\S]*?^};/m;

const newFunc = `export const uploadCommunityImage = async (file: File, uid: string): Promise<string> => {
  console.log('[Upload] Starting Native CapacitorHttp upload...');
  
  const compressPromise = compressImage(file);
  const compressTimeout = new Promise<File>((resolve) => setTimeout(() => resolve(file), 10000));
  const optimizedBlob = await Promise.race([compressPromise, compressTimeout]);
  
  const safeName = file.name || "image";
  const fileName = \`\${Date.now()}_\${safeName.replace(/\\.[^/.]+$/, "")}.jpg\`;
  const filePath = encodeURIComponent(\`community/images/\${uid}/\${fileName}\`);
  
  const currentUser = auth?.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  // Read as purely Base64 so Android WebView doesn't crash on Blob streaming.
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
       const result = reader.result as string;
       resolve(result.split(',')[1] || result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(optimizedBlob);
  });
  
  const token = await currentUser.getIdToken();
  const bucket = "vocaquest-7ebea.firebasestorage.app";
  // The cache buster prevents any lingering preflight blocks over native bridge
  const uploadUrl = \`https://firebasestorage.googleapis.com/v0/b/\${bucket}/o?name=\${filePath}&_cb=\${Date.now()}\`;
  
  console.log('[Upload] Pushing via native CapacitorHttp plugin...');
  const uploadTask = async () => {
    try {
      const response = await CapacitorHttp.request({
         method: 'POST',
         url: uploadUrl,
         headers: {
           'Authorization': \`Bearer \${token}\`,
           'Content-Type': optimizedBlob.type || 'image/jpeg'
         },
         // Native Java decodes base64 string to byte[] totally bypassing WebView Network Layer!
         data: base64Data,
         dataType: 'file' 
      });
      
      // Native Plugin HTTP Statuses
      if (response.status < 200 || response.status >= 300) {
         throw new Error(\`Native HTTP Failed: \${response.status} \${JSON.stringify(response.data) || ''}\`);
      }
      
      const downloadToken = response.data?.downloadTokens;
      return \`https://firebasestorage.googleapis.com/v0/b/\${bucket}/o/\${filePath.replace(/%2[Ff]/g, '%2F')}?alt=media&token=\${downloadToken}\`;
    } catch(err: any) {
      console.error('[Upload] Native HTTP Exception:', err);
      throw new Error(\`네이티브 업로드 에러: \${err.message || JSON.stringify(err)}\`);
    }
  };

  const uploadTimeout = new Promise<string>((_, reject) => setTimeout(() => reject(new Error("UPLOAD_TIMEOUT")), 30000));
  
  try {
     const url = await Promise.race([uploadTask(), uploadTimeout]);
     console.log('[Upload] Upload Success:', url);
     return url;
  } catch (err: any) {
     if (err?.message === 'UPLOAD_TIMEOUT') {
        alert("업로드 시간이 너무 초과되었습니다 (30초). 백그라운드 서버 문제일 수 있습니다.");
     } else {
        alert(err?.message || JSON.stringify(err));
     }
     throw err;
  }
};`

code = code.replace(regex, newFunc);
fs.writeFileSync('src/communityService.ts', code, 'utf-8');
console.log("REPLACED with NATIVE CapacitorHttp!");
