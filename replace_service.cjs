const fs = require('fs');
let code = fs.readFileSync('src/communityService.ts', 'utf-8');

const oldFunc = `export const uploadCommunityImage = async (file: File, uid: string): Promise<string> => {
  console.log('[Upload] Starting for:', file.name);
  const optimizedBlob = await compressImage(file);
  const safeName = file.name || "image";
  const fileName = \`\${Date.now()}_\${safeName.replace(/\\.[^/.]+$/, "")}.jpg\`;
  const storageRef = ref(storage, \`community/images/\${uid}/\${fileName}\`);
  
  console.log('[Upload] Converting blob to base64 for Capacitor safety...');
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(optimizedBlob);
  });
  
  console.log('[Upload] Bytes sending...');
  const snapshot = await uploadString(storageRef, base64Data, 'data_url', {
    contentType: optimizedBlob.type || 'image/jpeg',
  });
  
  console.log('[Upload] Getting URL...');
  const url = await getDownloadURL(snapshot.ref);
  console.log('[Upload] Success:', url);
  return url;
};`

const newFunc = `export const uploadCommunityImage = async (file: File, uid: string): Promise<string> => {
  console.log('[Upload] Starting for:', file.name);
  
  // Timeout for compression wrapper
  const compressPromise = compressImage(file);
  const compressTimeout = new Promise<File>((resolve) => setTimeout(() => {
     console.warn('[Upload] compressImage taking > 10s, falling back to original');
     resolve(file);
  }, 10000));
  
  const optimizedBlob = await Promise.race([compressPromise, compressTimeout]);
  const safeName = file.name || "image";
  const fileName = \`\${Date.now()}_\${safeName.replace(/\\.[^/.]+$/, "")}.jpg\`;
  const storageRef = ref(storage, \`community/images/\${uid}/\${fileName}\`);
  
  console.log('[Upload] Converting blob to base64 for Capacitor safety...');
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => {
       console.error('[Upload] FileReader Error:', err);
       reject(err);
    };
    reader.readAsDataURL(optimizedBlob);
  });
  
  console.log('[Upload] Sending to Firebase Storage:', storageRef.fullPath);
  
  // Storage upload timeout wrap
  const uploadTask = async () => {
    try {
      const snapshot = await uploadString(storageRef, base64Data, 'data_url', {
        contentType: optimizedBlob.type || 'image/jpeg',
      });
      console.log('[Upload] Snapshot success, getting URL...');
      return await getDownloadURL(snapshot.ref);
    } catch(err) {
      console.error('[Upload] Firebase upload exception:', err);
      throw err;
    }
  };

  const uploadTimeout = new Promise<string>((_, reject) => 
     setTimeout(() => reject(new Error("UPLOAD_TIMEOUT")), 30000)
  );
  
  try {
     const url = await Promise.race([uploadTask(), uploadTimeout]);
     console.log('[Upload] Success:', url);
     return url;
  } catch (err: any) {
     if (err?.message === 'UPLOAD_TIMEOUT') {
        alert("업로드 시간이 너무 초과되었습니다 (30초 이상). 인터넷 환경이나 권한을 확인해주세요.");
     } else {
        alert("업로드 오류: " + (err?.message || JSON.stringify(err)));
     }
     throw err;
  }
};`

code = code.replace(oldFunc, newFunc);
fs.writeFileSync('src/communityService.ts', code, 'utf-8');
console.log("REPLACED uploadCommunityImage!");
