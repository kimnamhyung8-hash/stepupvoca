const fs = require('fs');
let code = fs.readFileSync('src/communityService.ts', 'utf-8');

const regex = /export const uploadCommunityImage = async \(file: File, uid: string\): Promise<string> => \{[\s\S]*?^};/m;

const newFunc = `export const uploadCommunityImage = async (file: File, uid: string): Promise<string> => {
  console.log('[Upload] REST Starting for:', file.name);
  
  const compressPromise = compressImage(file);
  const compressTimeout = new Promise<File>((resolve) => setTimeout(() => {
     console.warn('[Upload] compressImage taking > 10s, falling back to original');
     resolve(file);
  }, 10000));
  
  const optimizedBlob = await Promise.race([compressPromise, compressTimeout]);
  const safeName = file.name || "image";
  const fileName = \`\${Date.now()}_\${safeName.replace(/\\.[^/.]+$/, "")}.jpg\`;
  const filePath = encodeURIComponent(\`community/images/\${uid}/\${fileName}\`);
  
  const { auth } = require('./firebase');
  const currentUser = auth?.currentUser;
  
  if (!currentUser) {
     alert("로그인이 필요합니다.");
     throw new Error("Not authenticated");
  }
  
  const token = await currentUser.getIdToken();
  const bucket = "vocaquest-7ebea.appspot.com";
  const uploadUrl = \`https://firebasestorage.googleapis.com/v0/b/\${bucket}/o?name=\${filePath}\`;
  
  console.log('[Upload] Fetching REST API...');
  
  const uploadTask = async () => {
    try {
      const response = await fetch(uploadUrl, {
         method: 'POST',
         headers: {
           'Authorization': \`Bearer \${token}\`,
           'Content-Type': optimizedBlob.type || 'image/jpeg'
         },
         body: optimizedBlob
      });
      
      if (!response.ok) {
         const errText = await response.text();
         throw new Error(\`REST Upload failed: \${response.status} \${errText}\`);
      }
      
      const data = await response.json();
      const downloadToken = data.downloadTokens;
      return \`https://firebasestorage.googleapis.com/v0/b/\${bucket}/o/\${filePath}?alt=media&token=\${downloadToken}\`;
    } catch(err) {
      console.error('[Upload] REST upload exception:', err);
      throw err;
    }
  };

  const uploadTimeout = new Promise<string>((_, reject) => 
     setTimeout(() => reject(new Error("UPLOAD_TIMEOUT")), 30000)
  );
  
  try {
     const url = await Promise.race([uploadTask(), uploadTimeout]);
     console.log('[Upload] REST Success:', url);
     return url;
  } catch (err: any) {
     if (err?.message === 'UPLOAD_TIMEOUT') {
        alert("업로드 시간이 너무 초과되었습니다 (30초 이상). 인터넷 환경을 확인해주세요.");
     } else {
        alert("업로드 오류: " + (err?.message || JSON.stringify(err)));
     }
     throw err;
  }
};`

code = code.replace(regex, newFunc);
fs.writeFileSync('src/communityService.ts', code, 'utf-8');
console.log("REPLACED uploadCommunityImage with REST approach!");
