import { initializeApp } from "firebase/app";
import { initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, browserPopupRedirectResolver, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Capacitor } from '@capacitor/core';

const firebaseConfig = {
    apiKey: "AIzaSyBillXmxfj_vSWODqO-21uBgEuoi_1drGA",
    authDomain: "vocaquest-7ebea.firebaseapp.com",
    projectId: "vocaquest-7ebea",
    storageBucket: "vocaquest-7ebea.firebasestorage.app",
    messagingSenderId: "806999527929",
    appId: "1:806999527929:web:da34566d0b4cd1b4b12d28",
    measurementId: "G-HBEEWQH8SZ"
};

const app = initializeApp(firebaseConfig);
const isNative = typeof window !== 'undefined' && Capacitor && Capacitor.isNativePlatform();

// indexedDB를 우선 사용 (Android WebView 안정성 향상), localStorage를 fallback으로 유지
// native 환경에서는 popupRedirectResolver 불필요
const authOptions: any = {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
};
if (!isNative) {
  authOptions.popupRedirectResolver = browserPopupRedirectResolver;
}

export const auth = initializeAuth(app, authOptions);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
