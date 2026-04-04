import { doc, setDoc, updateDoc, collection, query, serverTimestamp, onSnapshot, where, orderBy, getDocs, limit, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { VQUser } from './userService';

export interface ChatMessage {
    id?: string;
    senderId: string;
    senderName: string;
    text: string;
    translatedEn: string;
    originalLang: string;
    createdAt: any;
    isSystem?: boolean;
    hasError?: boolean;
    correctedEnglish?: string;
    localNative?: string; // For AI Mode display
    showNative?: boolean;
    showHint?: boolean;
    showOriginal?: boolean;
    suggestion?: string;
    suggestionNative?: string; // Translated suggestion
    showSuggestionNative?: boolean;
    isPerfect?: boolean;
    betterContext?: string;
    nextSpeakerGuide?: string;
    nextSpeakerGuideNative?: string;
}

export interface LiveChatRoom {
    id: string;
    callerId: string;
    callerName: string;
    receiverId: string; // 'public' for open rooms
    receiverName: string;
    callerLevel?: number;
    receiverLevel?: number;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'FINISHED' | 'CANCELLED';
    createdAt: any;
    lastMessage?: string;
    lastMessageAt?: any;
    scenario?: string;
    scenarioId?: string;
    callerRole?: string;
    callerRoleIdx?: number;
    receiverRole?: string;
    receiverRoleIdx?: number;
    lang?: string;
    callerSkin?: string;
    receiverSkin?: string;
    // Recording consent
    recordingRequesterId?: string;
    callerRecordingConsent?: 'requested' | 'accepted' | 'declined';
    receiverRecordingConsent?: 'requested' | 'accepted' | 'declined';
}

export async function createChatRoom(caller: VQUser, receiver: VQUser | 'public', extraData?: { scenario: string, scenarioId?: string, callerRole: string, callerRoleIdx?: number, receiverRole: string, receiverRoleIdx?: number, lang?: string }): Promise<string> {
    const isPublic = receiver === 'public';
    const rId = isPublic ? 'public' : (receiver as VQUser).uid;
    const rName = isPublic ? 'Anyone' : (receiver as VQUser).nickname;

    const roomId = `${caller.uid}_${rId}_chat_${Date.now()}`;
    // Firestore는 undefined 값을 허용하지 않으므로 모두 제거
    const cleanExtra = extraData
        ? Object.fromEntries(Object.entries(extraData).filter(([, v]) => v !== undefined))
        : {};

    const roomData: LiveChatRoom = {
        id: roomId,
        callerId: caller.uid,
        callerName: caller.nickname,
        receiverId: rId,
        receiverName: rName,
        status: 'PENDING',
        createdAt: serverTimestamp(),
        callerSkin: (caller as any).skin || 'default',
        ...cleanExtra
    };
    await setDoc(doc(db, 'live_chats', roomId), roomData);
    return roomId;
}

export function listenToPublicRooms(callback: (rooms: LiveChatRoom[]) => void) {
    const q = query(
        collection(db, 'live_chats'),
        where('receiverId', '==', 'public'),
        where('status', 'in', ['PENDING', 'ACCEPTED']),
        orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
        const now = Date.now();
        const TTL_MS = 30 * 60 * 1000; // 30분 만료 (유령 방 필터링)
        
        const rooms = snap.docs
            .map(doc => ({ ...doc.data(), id: doc.id } as LiveChatRoom))
            .filter(room => {
                const createdMs = room.createdAt?.seconds 
                    ? room.createdAt.seconds * 1000 
                    : (room.createdAt instanceof Date ? room.createdAt.getTime() : 0);
                if (createdMs > 0 && (now - createdMs) > TTL_MS) return false;
                return true;
            });
            
        callback(rooms);
    }, (err) => {
        console.warn('[chatService] listenToPublicRooms error:', err);
        callback([]);
    });
}

export function listenToMyChatRequests(myUid: string, callback: (room: LiveChatRoom | null) => void) {
    const q = query(
        collection(db, 'live_chats'),
        where('receiverId', '==', myUid),
        where('status', '==', 'PENDING')
    );
    return onSnapshot(q, (snap) => {
        if (snap.empty) callback(null);
        else callback({ ...snap.docs[0].data(), id: snap.docs[0].id } as LiveChatRoom);
    }, (err) => {
        console.warn('[chatService] listenToMyChatRequests error:', err);
        callback(null);
    });
}

export async function joinPublicRoom(roomId: string, me: VQUser) {
    const ref = doc(db, 'live_chats', roomId);
    await updateDoc(ref, {
        receiverId: me.uid,
        receiverName: me.nickname,
        receiverSkin: (me as any).skin || 'default',
        status: 'ACCEPTED'
    });
}

export async function respondToChatRequest(roomId: string, accept: boolean) {
    const ref = doc(db, 'live_chats', roomId);
    await updateDoc(ref, {
        status: accept ? 'ACCEPTED' : 'DECLINED'
    });
}

export async function cancelChatRequest(roomId: string) {
    const ref = doc(db, 'live_chats', roomId);
    await updateDoc(ref, { status: 'CANCELLED' });
}

export function listenToChatRoomStatus(roomId: string, callback: (room: LiveChatRoom | null) => void) {
    const ref = doc(db, 'live_chats', roomId);
    return onSnapshot(ref, (snap) => {
        if (!snap.exists()) callback(null);
        else callback({ ...snap.data(), id: snap.id } as LiveChatRoom);
    }, (err) => {
        console.warn('[chatService] listenToChatRoomStatus error:', err);
        callback(null);
    });
}

export async function finishChatRoom(roomId: string) {
    const ref = doc(db, 'live_chats', roomId);
    await updateDoc(ref, { status: 'FINISHED' });
}

export async function sendChatMessage(roomId: string, msg: Omit<ChatMessage, 'createdAt'>) {
    const messagesRef = collection(db, 'live_chats', roomId, 'messages');
    const newMsgRef = doc(messagesRef);
    // Firestore는 undefined 값을 허용하지 않으므로 모두 제거
    const fullMsg = Object.fromEntries(
        Object.entries({ ...msg, id: newMsgRef.id, createdAt: serverTimestamp() })
            .filter(([, v]) => v !== undefined)
    );
    await setDoc(newMsgRef, fullMsg);

    const roomRef = doc(db, 'live_chats', roomId);
    await updateDoc(roomRef, {
        lastMessage: msg.text.substring(0, 50),
        lastMessageAt: serverTimestamp()
    });
}

export function listenToChatMessages(roomId: string, callback: (messages: ChatMessage[]) => void) {
    const q = query(collection(db, 'live_chats', roomId, 'messages'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => {
        const msgs = snap.docs.map(d => ({ ...d.data(), id: d.id } as ChatMessage));
        callback(msgs);
    }, (err) => {
        console.warn('[chatService] listenToChatMessages error:', err);
        callback([]);
    });
}

export async function requestRecording(roomId: string, requesterUid: string, isCallerRole: boolean) {
    const ref = doc(db, 'live_chats', roomId);
    const myField = isCallerRole ? 'callerRecordingConsent' : 'receiverRecordingConsent';
    await updateDoc(ref, {
        recordingRequesterId: requesterUid,
        [myField]: 'requested',
    });
}

export async function respondToRecording(roomId: string, accept: boolean, isCallerRole: boolean) {
    const ref = doc(db, 'live_chats', roomId);
    const myField = isCallerRole ? 'callerRecordingConsent' : 'receiverRecordingConsent';
    await updateDoc(ref, {
        [myField]: accept ? 'accepted' : 'declined',
    });
}

export async function cancelRecordingConsent(roomId: string) {
    const ref = doc(db, 'live_chats', roomId);
    await updateDoc(ref, {
        recordingRequesterId: null,
        callerRecordingConsent: null,
        receiverRecordingConsent: null,
    });
}

export async function requestChatRoom(myUid: string, myNickname: string, lang: string, level: number, skin: string = 'default'): Promise<LiveChatRoom | null> {
    const q = query(
        collection(db, 'live_chats'),
        where('receiverId', '==', 'public'),
        where('status', '==', 'PENDING'),
        where('lang', '==', lang),
        orderBy('createdAt', 'desc'),
        limit(5)
    );
    
    const snap = await getDocs(q);
    const existing = snap.docs
        .map(d => ({ ...d.data(), id: d.id } as LiveChatRoom))
        .find(r => r.callerId !== myUid);

    if (existing) {
        const ref = doc(db, 'live_chats', existing.id);
        await updateDoc(ref, {
            receiverId: myUid,
            receiverName: myNickname,
            receiverLevel: level,
            receiverSkin: skin,
            status: 'ACCEPTED'
        });
        return { ...existing, receiverId: myUid, receiverName: myNickname, receiverLevel: level, receiverSkin: skin, status: 'ACCEPTED' };
    }

    const roomId = `${myUid}_public_chat_${Date.now()}`;
    const roomData: LiveChatRoom = {
        id: roomId,
        callerId: myUid,
        callerName: myNickname,
        receiverId: 'public',
        receiverName: 'Anyone',
        status: 'PENDING',
        createdAt: serverTimestamp(),
        lang: lang,
        callerLevel: level,
        callerSkin: skin
    };
    await setDoc(doc(db, 'live_chats', roomId), roomData);
    return roomData;
}

export async function sendP2PSignaling(roomId: string, type: 'offer' | 'answer' | 'ice-candidate' | 'renegotiate', senderUid: string, data?: any) {
    const signalingRef = collection(db, 'live_chats', roomId, 'signaling');
    const newDocRef = doc(signalingRef);
    await setDoc(newDocRef, {
        type,
        senderUid,
        data: data ? JSON.stringify(data) : null,
        createdAt: serverTimestamp()
    });
}

export function listenToP2PSignaling(roomId: string, callback: (data: { id: string, type: string, senderUid: string, data: any }) => void) {
    const q = query(collection(db, 'live_chats', roomId, 'signaling'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, (snap) => {
        snap.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const docData = change.doc.data();
                try {
                    callback({
                        id: change.doc.id,
                        type: docData.type,
                        senderUid: docData.senderUid,
                        data: docData.data ? JSON.parse(docData.data) : null
                    });
                } catch (e) {
                    console.warn('[chatService] parse signaling error:', e);
                }
            }
        });
    }, (err) => {
        console.warn('[chatService] listenToP2PSignaling error:', err);
    });
}

export async function clearSignalingData(roomId: string) {
    const signalingRef = collection(db, 'live_chats', roomId, 'signaling');
    const snap = await getDocs(signalingRef);
    const batchPromises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(batchPromises);
}
