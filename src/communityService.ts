import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  increment, 
  serverTimestamp, 
  limit, 
  startAfter,
  arrayUnion
} from 'firebase/firestore';
import { db, storage } from './firebase';

export interface CommunityPost {
  id?: string;
  category: string;
  title: string;
  content: string;
  title_en?: string;
  content_en?: string;
  mediaUrls: string[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
  originalLang?: string;
  createdAt: any;
  viewCount: number;
  commentCount: number;
  isHidden?: boolean;
}

export interface CommunityComment {
  id?: string;
  postId: string;
  content: string;
  content_en?: string;
  originalLang?: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: any;
}

const POSTS_COLLECTION = 'community_posts';
const COMMENTS_COLLECTION = 'community_comments';

/**
 * ?롪퍓???삳닱?嶺뚮ㅄ維뽨빳??브퀗???(?곸궠??誘ㅒ?μ쪚?怨?돦? ??瑜곷턄嶺?嶺뚯솘???
 */
export const getPostsByCategory = async (category: string, pageSize: number = 20, lastVisibleDoc?: any) => {
  let q;
  if (category === 'HOT') {
    // ??????곕뻣???뺢퀣伊??? order by viewCount
    q = query(
      collection(db, POSTS_COLLECTION),
      orderBy('viewCount', 'desc'),
      limit(pageSize)
    );
  } else {
    // Normal query
    q = query(
      collection(db, POSTS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    if (category !== 'ALL') {
      q = query(q, where('category', '==', category));
    }
  }

  if (lastVisibleDoc) {
    q = query(q, startAfter(lastVisibleDoc));
  }

  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CommunityPost));
  const lastDoc = snapshot.docs[snapshot.docs.length - 1];

  return { posts, lastDoc };
};

/**
 * ????븐뻼?????ル맧??洹먮뜆???袁㏃댉 ??⑥щ턄???브퀗??? * ?낅슣?섇젆源띿????類ｌ┣ ??怨룻뱺??嶺뚣끉裕???リ섣??β돦裕녻떋?????筌? ?띠럾??筌? ?곸궠??誘ㅒ?μ쪚?怨?돦熬곣뫁夷??β돦裕뉛쭚??????잙갭梨띄쳥??됀?????덈펲.
 */
export const getAggregatedHomePosts = async (limitCount: number = 30) => {
  const q = query(
    collection(db, POSTS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CommunityPost));
  
  const aggregated: Record<string, CommunityPost[]> = {};
  posts.forEach(post => {
    if (!aggregated[post.category]) {
      aggregated[post.category] = [];
    }
    aggregated[post.category].push(post);
  });
  
  return aggregated;
};

/**
 * ?롪퍓???삳닱???⑤㈇???브퀗??? */
export const getPostsByAuthor = async (authorId: string, limitCount: number = 50) => {
  const q = query(
    collection(db, POSTS_COLLECTION),
    where('authorId', '==', authorId),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityPost));
  return posts.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
};

export const getPostDetail = async (postId: string) => {
  const docRef = doc(db, POSTS_COLLECTION, postId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    // ?브퀗????嶺뚯빘鍮? (???х뙴?꾨Ь?嶺뚳퐣瑗??
    updateDoc(docRef, { viewCount: increment(1) });
    return { id: docSnap.id, ...docSnap.data() } as CommunityPost;
  }
  return null;
};

/**
 * Create Post
 */
export const createPost = async (postData: Omit<CommunityPost, 'id' | 'createdAt' | 'viewCount' | 'commentCount'>) => {
  const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
    ...postData,
    createdAt: serverTimestamp(),
    viewCount: 0,
    commentCount: 0
  });
  return docRef.id;
};

const compressImage = (file: File, maxWidth: number = 1024, quality: number = 0.7): Promise<Blob | File> => {
  console.log('[Compress] Start:', file.name, 'Size:', (file.size / 1024).toFixed(1), 'KB');
  return new Promise((resolve) => {
    if (file.type === 'image/gif' || file.type === 'image/webp' || file.size < 200 * 1024) {
      console.log('[Compress] Skip optimization (too small or GIF/WebP)');
      return resolve(file);
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    const timer = setTimeout(() => {
       console.warn('[Compress] Timeout triggered');
       URL.revokeObjectURL(url);
       resolve(file);
    }, 15000);

    const finish = (result: Blob | File) => {
       clearTimeout(timer);
       URL.revokeObjectURL(url);
       resolve(result);
    };

    img.onload = () => {
      console.log('[Compress] Dimensions:', img.width, 'x', img.height);
      try {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
           console.warn('[Compress] Context failed');
           return finish(file);
        }
        ctx.drawImage(img, 0, 0, width, height);
        console.log('[Compress] Converting to blob...');
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('[Compress] Done, New size:', (blob.size / 1024).toFixed(1), 'KB');
            finish(blob);
          } else {
            console.warn('[Compress] Blob null, fallback');
            finish(file);
          }
        }, 'image/jpeg', quality);
      } catch (e) {
        console.error('[Compress] Canvas error:', e);
        finish(file);
      }
    };

    img.onerror = (err) => {
      console.error('[Compress] Image load error:', err);
      finish(file);
    };

    img.src = url;
  });
};

export const uploadCommunityImage = async (file: File, uid: string): Promise<string> => {
  console.log('[Upload] Starting Firebase SDK upload...');
  
  // 압축 시도 (15초 제한, 실패 시 원본 사용)
  const optimizedBlob = await Promise.race([
    compressImage(file),
    new Promise<File>((resolve) => setTimeout(() => resolve(file), 15000))
  ]).catch(() => file);
  
  const safeName = file.name || 'image';
  const fileName = `${Date.now()}_${safeName.replace(/\.[^/.]+$/, '')}.jpg`;
  const filePath = `community/images/${uid}/${fileName}`;
  const storageRef = ref(storage, filePath);

  const doUpload = async (): Promise<string> => {
    const metadata = {
      contentType: optimizedBlob.type || 'image/jpeg',
    };
    await uploadBytes(storageRef, optimizedBlob, metadata);
    return getDownloadURL(storageRef);
  };

  const timeoutPromise = new Promise<string>((_, reject) =>
    setTimeout(() => reject(new Error('UPLOAD_TIMEOUT')), 60000)
  );

  try {
    const url = await Promise.race([doUpload(), timeoutPromise]);
    console.log('[Upload] Success:', url);
    return url;
  } catch (err: any) {
    const msg = err?.message || JSON.stringify(err);
    if (msg === 'UPLOAD_TIMEOUT') {
      alert('업로드 시간이 초과되었습니다 (60초). 인터넷 연결을 확인해주세요.');
    } else {
      alert('업로드 오류: ' + msg);
    }
    throw err;
  }
};
export const getCommentsByPost = async (postId: string) => {
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    where('postId', '==', postId),
    orderBy('createdAt', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CommunityComment));
};

/**
 * ?癰? ??얜??? */
export const createComment = async (postId: string, commentData: Omit<CommunityComment, 'id' | 'postId' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), {
    ...commentData,
    postId,
    createdAt: serverTimestamp()
  });
  
  // ???沅??롪퍓???삳닱?源녿꺄 ?癰???嶺뚯빘鍮?
  const postRef = doc(db, POSTS_COLLECTION, postId);
  await updateDoc(postRef, { commentCount: increment(1) });
  
  try {
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const postData = postSnap.data() as CommunityPost;
      const postAuthorId = postData.authorId;
      
      // If the commenter is NOT the post author, notify the author
      if (commentData.authorId !== postAuthorId && postAuthorId) {
        // 1. Create a notification doc
        const notifRef = collection(db, 'users', postAuthorId, 'notifications');
        await addDoc(notifRef, {
          type: 'COMMENT',
          postId,
          postTitle: postData.title || '',
          commentAuthorName: commentData.authorName || 'Guest',
          isRead: false,
          createdAt: serverTimestamp()
        });
        
        // 2. Increment unreadCommunityNotif counter
        const userRef = doc(db, 'users', postAuthorId);
        await updateDoc(userRef, {
          unreadCommunityNotif: increment(1)
        });
      }
    }
  } catch (err) {
    console.warn('[CommunityNotif] Failed to create notification:', err);
  }
  
  return docRef.id;
};

/**
 * ?リ섣??β돦裕녻떋?嶺?嶺뚣끉裕??臾? ?브퀗???(?곸궠??誘ㅒ?μ쪚????쒕뼬?)
 */
export const getGlobalLatestPosts = async (count: number = 5) => {
  const q = query(
    collection(db, POSTS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CommunityPost));
};

/**
 * 嶺뚣끉裕????戮?뎽???브퀗???꾨ご??熬곥굥由??곸궠??誘ㅒ?μ쪚?怨?돦??リ섣? ?띠룇裕??(嶺뚣끉裕??24??蹂?뜟 ?リ옇??)
 */
export const getActiveCategoryStats = async () => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const q = query(
    collection(db, POSTS_COLLECTION),
    where('createdAt', '>=', yesterday),
    orderBy('createdAt', 'desc'),
    limit(500)
  );
  
  const snapshot = await getDocs(q);
  
  // ???됱Ŧ ?띠룇裕????곸궠??誘ㅒ?μ쪚???洹먮봾裕??(HOT, ALL ???띠럾????곸궠??誘ㅒ?μ쪚????戮곕뇶)
  const allCategories = [
    'FREE', 'STUDY', 'MEDIA', 'EXCHANGE', 'PROMO'
  ];
  
  const stats: Record<string, number> = {};
  allCategories.forEach(cat => stats[cat] = 0);
  
  snapshot.docs.forEach(d => {
    const cat = d.data().category;
    if (stats[cat] !== undefined) {
      stats[cat] = (stats[cat] || 0) + 1;
    }
  });
  
  return stats;
};

/**
 * ?リ섣??β돦裕녻떋??筌롫챶?쏁뼨瑗꼲 ?브퀗???(?브퀗?????リ옇??)
 */
export const getGlobalPopularPosts = async (count: number = 5) => {
  const q = query(
    collection(db, POSTS_COLLECTION),
    orderBy('viewCount', 'desc'),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CommunityPost));
};

/**
 * ?롪퍓???룸Ь? ??瑜곸젧
 */
export const updatePost = async (postId: string, updateData: Partial<CommunityPost>) => {
  const docRef = doc(db, POSTS_COLLECTION, postId);
  await updateDoc(docRef, updateData);
};

/**
 * ?롪퍓???룸Ь? ???? */
export const deletePost = async (postId: string) => {
  const docRef = doc(db, POSTS_COLLECTION, postId);
  await deleteDoc(docRef);
};

export const hidePost = async (postId: string, isHidden: boolean) => {
  const docRef = doc(db, POSTS_COLLECTION, postId);
  await updateDoc(docRef, { isHidden });
};

/**
 * ?癰? ???? */
export const deleteComment = async (postId: string, commentId: string) => {
  const docRef = doc(db, COMMENTS_COLLECTION, commentId);
  await deleteDoc(docRef);
  
  // Update comment count
    const postRef = doc(db, POSTS_COLLECTION, postId);
  await updateDoc(postRef, { commentCount: increment(-1) });
};

export const reportPost = async (postId: string, userId: string) => {
  const docRef = doc(db, POSTS_COLLECTION, postId);
  // Add userId to reports array. In a real app we might count reports and hide dynamically.
  await updateDoc(docRef, { reports: arrayUnion(userId) });
};

export const reportComment = async (commentId: string, userId: string) => {
  const docRef = doc(db, COMMENTS_COLLECTION, commentId);
  await updateDoc(docRef, { reports: arrayUnion(userId) });
};

export interface CommunityNotification {
  id?: string;
  type: string;
  postId: string;
  postTitle: string;
  commentAuthorName: string;
  isRead: boolean;
  createdAt: any;
}

export const getCommunityNotifications = async (userId: string, limitCount: number = 20) => {
  const q = query(
    collection(db, 'users', userId, 'notifications'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CommunityNotification));
};

export const markCommunityNotificationsAsRead = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'users', userId, 'notifications'),
      where('isRead', '==', false)
    );
    const snapshot = await getDocs(q);
    
    // Batch update all unread to read
    const promises = snapshot.docs.map(d => 
      updateDoc(doc(db, 'users', userId, 'notifications', d.id), { isRead: true })
    );
    await Promise.all(promises);
    
    // Reset unread count on user doc
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { unreadCommunityNotif: 0 });
  } catch (err) {
    console.error('Failed to mark notifications as read', err);
  }
};



