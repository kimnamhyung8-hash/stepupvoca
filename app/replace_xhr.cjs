const fs = require('fs');
let code = fs.readFileSync('src/communityService.ts', 'utf-8');

const regex = /export const uploadCommunityImage = async \([\s\S]*?^};/m;

const newFunc = `export const uploadCommunityImage = async (file: File, uid: string): Promise<string> => {
  console.log('[Upload] Starting pure XMLHttpRequest upload...');
  
  const compressPromise = compressImage(file);
  const compressTimeout = new Promise<File>((resolve) => setTimeout(() => resolve(file), 10000));
  const optimizedBlob = await Promise.race([compressPromise, compressTimeout]);
  
  const safeName = file.name || "image";
  const fileName = \`\${Date.now()}_\${safeName.replace(/\\.[^/.]+$/, "")}.jpg\`;
  const filePath = encodeURIComponent(\`community/images/\${uid}/\${fileName}\`);
  
  const currentUser = auth?.currentUser;
  if (!currentUser) throw new Error("Not authenticated");
  
  const token = await currentUser.getIdToken();
  const bucket = "vocaquest-7ebea.firebasestorage.app";
  // Added cache buster to force a new CORS preflight check
  const uploadUrl = \`https://firebasestorage.googleapis.com/v0/b/\${bucket}/o?name=\${filePath}&_cb=\${Date.now()}\`;
  
  console.log('[Upload] Pushing via native XMLHttpRequest...');
  const uploadTask = async () => {
    return new Promise<string>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl, true);
      xhr.setRequestHeader('Authorization', \`Bearer \${token}\`);
      xhr.setRequestHeader('Content-Type', optimizedBlob.type || 'image/jpeg');

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            const downloadToken = data.downloadTokens;
            const finalUrl = \`https://firebasestorage.googleapis.com/v0/b/\${bucket}/o/\${filePath.replace(/%2[Ff]/g, '%2F')}?alt=media&token=\${downloadToken}\`;
            resolve(finalUrl);
          } catch(e) {
            reject(new Error("Parse JSON failed: " + xhr.responseText));
          }
        } else {
          reject(new Error(\`XHR Failed: \${xhr.status} \${xhr.responseText}\`));
        }
      };

      xhr.onerror = () => reject(new Error("XHR Network Error (CORS or Disconnect)"));
      xhr.ontimeout = () => reject(new Error("XHR Timeout"));
      
      xhr.send(optimizedBlob);
    });
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
        alert("업로드 오류: " + (err?.message || JSON.stringify(err)));
     }
     throw err;
  }
};`

code = code.replace(regex, newFunc);
fs.writeFileSync('src/communityService.ts', code, 'utf-8');
console.log("REPLACED with pure XMLHttpRequest!");
