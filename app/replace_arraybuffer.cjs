const fs = require('fs');
let code = fs.readFileSync('src/communityService.ts', 'utf-8');

const regex = /export const uploadCommunityImage = async \([\s\S]*?^};/m;

const newFunc = `export const uploadCommunityImage = async (file: File, uid: string): Promise<string> => {
  console.log('[Upload] Starting ArrayBuffer Fetch...');
  
  const compressPromise = compressImage(file);
  const compressTimeout = new Promise<File>((resolve) => setTimeout(() => resolve(file), 10000));
  const optimizedBlob = await Promise.race([compressPromise, compressTimeout]);
  
  const safeName = file.name || "image";
  const fileName = \`\${Date.now()}_\${safeName.replace(/\\.[^/.]+$/, "")}.jpg\`;
  const filePath = encodeURIComponent(\`community/images/\${uid}/\${fileName}\`);
  
  const currentUser = auth?.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  // Read as ArrayBuffer to bypass Android WebView Blob fetching crashes
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(optimizedBlob);
  });
  
  const token = await currentUser.getIdToken();
  const bucket = "vocaquest-7ebea.firebasestorage.app";
  const uploadUrl = \`https://firebasestorage.googleapis.com/v0/b/\${bucket}/o?name=\${filePath}\`;
  
  console.log('[Upload] Pushing via ArrayBuffer fetch...');
  const uploadTask = async () => {
    try {
      const response = await window.fetch(uploadUrl, {
         method: 'POST',
         headers: {
           'Authorization': \`Bearer \${token}\`,
           'Content-Type': optimizedBlob.type || 'image/jpeg'
         },
         body: arrayBuffer // Pass raw ArrayBuffer instead of Blob
      });
      
      if (!response.ok) {
         const errText = await response.text();
         throw new Error(\`REST ArrayBuffer Upload failed: \${response.status} \${errText}\`);
      }
      
      const data = await response.json();
      const downloadToken = data.downloadTokens;
      return \`https://firebasestorage.googleapis.com/v0/b/\${bucket}/o/\${filePath}?alt=media&token=\${downloadToken}\`;
    } catch(err) {
      console.error('[Upload] Fetch Exception:', err);
      throw err;
    }
  };

  const uploadTimeout = new Promise<string>((_, reject) => setTimeout(() => reject(new Error("UPLOAD_TIMEOUT")), 30000));
  
  try {
     const url = await Promise.race([uploadTask(), uploadTimeout]);
     console.log('[Upload] Fetch Success:', url);
     return url;
  } catch (err: any) {
     if (err?.message === 'UPLOAD_TIMEOUT') {
        alert("업로드 시간이 너무 초과되었습니다 (30초). 인터넷이 원활한지 확인해주세요.");
     } else {
        alert("업로드 오류: " + (err?.message || JSON.stringify(err)));
     }
     throw err;
  }
};`

code = code.replace(regex, newFunc);
fs.writeFileSync('src/communityService.ts', code, 'utf-8');
console.log("REPLACED with ArrayBuffer REST upload!");
