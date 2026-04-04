import React, { useState, useEffect, useRef, useCallback, memo, forwardRef, useImperativeHandle } from 'react';
import {
    X, Send, Mic, MicOff, Search, UserX, RefreshCw, Volume2, Wifi, Globe, MessageSquare, BookOpen,
    AlertTriangle, Video, VideoOff, Play, Clock, StopCircle, Flag, ShieldAlert, Zap, Sparkles, LogOut
} from 'lucide-react';
import { db } from './firebase';
import { t } from './i18n';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { getBestVoiceIndex, TEEN_GIRL_PROFILES } from './utils/ttsUtils';
import { getActiveApiKey, LIGHTWEIGHT_MODEL } from './apiUtils';
import {
    searchUserByNickname,
    getChatLobbyUsers,
    setChatLobbyPresence,
    blockUser,
    type VQUser
} from './userService';
import { getCefrFromLevel, getCefrDescription } from './utils/wordUtils';
import {
    createChatRoom, listenToPublicRooms, listenToMyChatRequests, joinPublicRoom,
    respondToChatRequest, cancelChatRequest, listenToChatRoomStatus, finishChatRoom,
    sendChatMessage, listenToChatMessages, requestRecording, respondToRecording,
    cancelRecordingConsent, requestChatRoom, sendP2PSignaling, listenToP2PSignaling, clearSignalingData
} from './chatService';
import { isSafeText, submitChatReport } from './chatSafetyService';
import type { LiveChatRoom, ChatMessage } from './chatService';
import type { ReportReason } from './chatSafetyService';

const SKIN_EMOJI: Record<string, string> = {
    default: '🐣', ninja: '🥷', wizard: '🧙‍♂️', king: '👑',
    dragon: '🐲', alien: '👽', robot: '🤖',
};

const FLAGS = [
    { code: 'KR', lang: 'ko', label: '한국어' },
    { code: 'US', lang: 'en', label: 'English' },
    { code: 'CN', lang: 'zh', label: '中文' },
    { code: 'VN', lang: 'vi', label: 'Tiếng Việt' },
    { code: 'JP', lang: 'ja', label: '日本語' },
    { code: 'TW', lang: 'tw', label: '繁體中文' },
];

const PRESET_SCENARIOS = [
    { id: 'airport_checkin', label: { ko: '🛫 공항 카운터', en: '🛫 Airport Check-in', ja: '🛫 空港カウンター', zh: '🛫 机场柜台', tw: '🛫 機場櫃檯', vi: '🛫 Quầy thủ tục' }, roles: [{ ko: '승무원', en: 'Airline Staff', ja: '地上係員', zh: '乘务员', tw: '乘務員', vi: 'Nhân viên hàng không' }, { ko: '승객', en: 'Passenger', ja: '乗客', zh: '乘客', tw: '乘客', vi: 'Hành khách' }] },
    { id: 'restaurant', label: { ko: '🍴 식당 주문', en: '🍴 Restaurant', ja: '🍴 レストラン', zh: '🍴 餐厅点餐', tw: '🍴 餐廳點餐', vi: '🍴 Nhà hàng' }, roles: [{ ko: '점원', en: 'Server', ja: '店員', zh: '服务员', tw: '服務員', vi: 'Phục vụ' }, { ko: '손님', en: 'Customer', ja: '客', zh: '顾客', tw: '顧客', vi: 'Khách hàng' }] },
    { id: 'business_meeting', label: { ko: '🤝 비즈니스 미팅', en: '🤝 Business Meeting', ja: '🤝 ビジネス会議', zh: '🤝 商务会议', tw: '🤝 商務會議', vi: '🤝 Họp kinh doanh' }, roles: [{ ko: '발주처(갑)', en: 'Client', ja: '発注者', zh: '客户', tw: '客戶', vi: 'Khách hàng' }, { ko: '영업사원(을)', en: 'Salesperson', ja: '営業担当者', zh: '销售员', tw: '銷售員', vi: 'Nhân viên bán hàng' }] },
    { id: 'job_interview', label: { ko: '💼 취업 면접', en: '💼 Job Interview', ja: '💼 採用面接', zh: '💼 求职面试', tw: '💼 求職面試', vi: '💼 Phỏng vấn xin việc' }, roles: [{ ko: '면접관', en: 'Interviewer', ja: '面接官', zh: '面试官', tw: '面試官', vi: 'Người phỏng vấn' }, { ko: '지원자', en: 'Applicant', ja: '応募者', zh: '应聘者', tw: '申請人', vi: 'Ứng viên' }] },
    { id: 'custom', label: { ko: '✏️ 직접 입력...', en: '✏️ Custom...', ja: '✏️ 直接入力...', zh: '✏️ 自定义...', tw: '✏️ 自定義...', vi: '✏️ Tùy chỉnh...' }, roles: [] }
];

const uiStrings: any = {
    title: { ko: '글로벌 라이브챗', en: 'Live Chat', ja: 'グローバルライブチャット', zh: '全球实时聊天', vi: 'Trò chuyện Toàn cầu', tw: '全球即時聊天' },
    quick_match: { ko: '번개 매칭 시작', en: 'Start Quick Match', ja: 'クリックマッチ開始', zh: '开始快速匹配', vi: 'Bắt đầu ghép hàng nhanh', tw: '開始快速匹配' },
    ai_chat_intro: { ko: 'AI 튜터와 대화를 시작합니다.', en: 'Starting chat with AI Tutor.', ja: 'AIチューターと会話を開始します。', zh: '开始与 AI 导师聊天', vi: 'Bắt đầu trò chuyện với Gia sư AI.', tw: '開始與 AI 導師聊天' },
    subtitle: { ko: '전세계 사람들과 자유롭게 대화하세요!', en: 'Chat globally in real-time!', ja: '世界中の人と自由に会話しましょう！', zh: '与全球用户实时聊天！', vi: 'Trò chuyện toàn cầu theo thời gian thực!', tw: '與全球用戶即時聊天！' },
    auto_trans: { ko: '한국어로 말하면 상대방의 언어로 완벽 번역!', en: 'Auto translation applied in all chats.', ja: '自動翻訳がすべてのチャットに適用されます。', zh: '所有聊天均应用自动翻译', vi: 'Áp dụng dịch tự động trong mọi cuộc trò chuyện.', tw: '所有聊天均應用自動翻譯' },
    chat_req: { ko: '새 대화 요청이 도착했습니다!', en: 'Chat request received!', ja: 'チャットリクエストが届きました！', zh: '收到聊天请求', vi: 'Đã nhận được yêu cầu trò chuyện!', tw: '收到聊天請求' },
    decline: { ko: '거절', en: 'Decline', ja: '拒否', zh: '拒绝', vi: 'Từ chối', tw: '拒絕' },
    accept: { ko: '수락', en: 'Accept', ja: '受諾', zh: '接受', vi: 'Chấp nhận', tw: '接受' },
    tab_roleplay: { ko: '🎮 상황극', en: '🎮 Role-play', ja: '🎮 ロールプレイ', zh: '🎮 角色扮演', vi: '🎮 Nhập vai', tw: '🎮 角色扮演' },
    tab_online: { ko: '🌐 대기자 명단', en: '🌐 Online', ja: '🌐 オンライン', zh: '🌐 在线', vi: '🌐 Trực tuyến', tw: '🌐 在線' },
    tab_search: { ko: '🔍 검색', en: '🔍 Search', ja: '🔍 検索', zh: '🔍 搜索', vi: '🔍 Tìm kiếm', tw: '🔍 Tìm kiếm' },
    create_room_btn: { ko: '새로운 상황극(Role-play) 방 만들기', en: 'Create Role-play Room', ja: '新しいロールプレイ部屋を作る', zh: '创建角色扮演房间', vi: 'Tạo phòng nhập vai', tw: '創建角色扮演房間' },
    no_active_rooms: { ko: '현재 대기중인 방이 없습니다.', en: 'No active rooms.', ja: '現在待機中の部屋がありません。', zh: '当前没有活动房间', vi: 'Không có phòng nào đang chờ', tw: '目前沒有活動房間' },
    your_role: { ko: '나의 역할', en: 'Your Role', ja: 'あなたの役割', zh: '你的角色', vi: 'Vai của bạn', tw: '你的角色' },
    opponent: { ko: '상대방', en: 'Opponent', ja: '相手', zh: '对方', vi: 'Đối thủ', tw: '對方' },
    join_this_role: { ko: '이 역할로 참여하기', en: 'Join as this role', ja: 'この役割で参加する', zh: '以该角色加入', vi: 'Tham gia với vai trò này', tw: '以該角色加入' },
    online_users: { ko: '온라인 접속자', en: 'ONLINE USERS', ja: 'オンラインユーザー', zh: '在线用户', vi: 'NGƯỜI DÙNG TRỰC TUYẾN', tw: '在線用戶' },
    no_users_online: { ko: '현재 접속중인 유저가 없습니다.', en: 'No users online.', ja: '現在オンラインのユーザーがいません。', zh: '当前没有在线用户', vi: 'Không có người dùng trực tuyến.', tw: '目前沒有在線用戶' },
    chat_btn: { ko: '채팅', en: 'Chat', ja: 'チャット', zh: '聊天', vi: 'Trò chuyện', tw: '聊天' },
    username_placeholder: { ko: '닉네임 입력...', en: 'Username...', ja: 'ニックネーム入力...', zh: '输入昵称...', vi: 'Tên người dùng...', tw: '輸入暱稱...' },
    not_found: { ko: '결과가 없습니다', en: 'Not found', ja: '見つかりませんでした', zh: '查找无结果', vi: 'Không tìm thấy', tw: '查找無結果' },
    waiting_answer: { ko: '답장 대기 중...', en: 'Waiting for answer...', ja: '返信待ち...', zh: '等待回复...', vi: 'Đang đợi trả lời...', tw: '等待答覆...' },
    translated: { ko: '도착한 번역', en: 'Translated', ja: '翻訳済み', zh: '已翻译', vi: 'Đã dịch', tw: '已翻譯' },
    chat_started: { ko: '대화가 시작되었습니다.', en: 'Chat started', ja: 'チャットが始まりました。', zh: '聊天已开始', vi: 'Trò chuyện đã bắt đầu', tw: '聊天已開始' },
    create_room_title: { ko: '상황극 방 만들기', en: 'Create Room', ja: '部屋を作る', zh: '创建房间', vi: 'Tạo phòng', tw: '創建房間' },
    scenario: { ko: '상황 선택', en: 'Scenario', ja: '状況選択', zh: '选择场景', vi: 'Kịch bản', tw: '選擇場景' },
    custom_scenario: { ko: '상황 (예: 소개팅)', en: 'Custom Scenario (ex: Blind Date)', ja: '状況 (例: 紹介予定)', zh: '场景 (如：相亲)', vi: 'Kịch bản tùy chỉnh (VD: Hẹn hò mù quáng)', tw: '場景 (如：相親)' },
    create_my_role: { ko: '나의 역할', en: 'My Role', ja: '私の役割', zh: '我的角色', vi: 'Vai trò của tôi', tw: '我的角色' },
    create_opp_role: { ko: '상대방 역할', en: 'Opponent', ja: '相手の役割', zh: '对方角色', vi: 'Vai trò đối thủ', tw: '對方角色' },
    fill_all: { ko: '모든 항목을 입력해 주세요.', en: 'Please fill all fields.', ja: 'すべての項目を入力してください。', zh: '请填写所有选项', vi: 'Vui lòng điền tất cả các trường.', tw: '請填寫所有選項' },
    select_my_role: { ko: '나의 역할 선택', en: 'Select My Role', ja: '自分の役割を選択', zh: '选择你的角色', vi: 'Chọn vai trò của tôi', tw: '選擇你的角色' },
    create_btn: { ko: '방 만들기 🚀', en: 'Create 🚀', ja: '部屋作成 🚀', zh: '创建 🚀', vi: 'Tạo 🚀', tw: '創建 🚀' },
    declined: { ko: '상대방이 거절했습니다.', en: 'The user declined your request.', ja: '相手が拒否しました。', zh: '对方拒绝了请求', vi: 'Đối phương đã từ chối.', tw: '對方拒絕了請求' },
    join_failed: { ko: '방 입장에 실패했습니다.', en: 'Failed to join room.', ja: '部屋への参加に失敗しました。', zh: '加入房间失败', vi: 'Tham gia phòng thất bại.', tw: '加入房間失敗' },
    saved_bible: { ko: '나만의 바이블에 추가되었습니다.', en: 'Saved to My Bible.', ja: '私だけのバイブル」に追加されました', zh: '已保存到我的圣经', vi: 'Đã lưu vào Kinh thánh의 tôi.', tw: '已保存到我的聖經' },
    chat_ended: { ko: '채팅이 종료되었습니다.', en: 'Chat ended.', ja: 'チャットが終了しました', zh: '聊天已结束', vi: 'Trò chuyện đã kết thúc', tw: '聊天已結束' },
    waiting_partner: { ko: '상대방을 기다리는 중...', en: 'Waiting for partner...', ja: '相手を待っています...', zh: '等待对方...', vi: 'Đang chờ đối tác...', tw: '等待對方...' },
    cancel_matching: { ko: '취소하기', en: 'Cancel', ja: 'キャンセル', zh: '取消', vi: 'Hủy', tw: '取消' },
    active_waiting: { ko: '대기 중인 방이 있습니다', en: 'You have a waiting room', ja: '待機中の部屋があります', zh: '有等待中的房间', vi: 'Có phòng đang chờ', tw: '有等待中的房間' },
    reenter_btn: { ko: '입장', en: 'Enter', ja: '入場', zh: '进入', vi: 'Vào', tw: '進入' },
    error_occurred: { ko: '오류가 발생했습니다. 다시 시도해 주세요.', en: 'Error occurred. Please try again.', ja: 'エラーが発生しました。', zh: '发生错误，请重试', vi: 'Đã xảy ra lỗi. Vui lòng thử lại.', tw: '發生錯誤，請重試' },
    saved_bible_btn: { ko: '바이블 저장', en: 'Save', ja: '保存', zh: '保存', vi: 'Lưu', tw: '保存' },
    chat_placeholder: { ko: "한국어/영어 입력...", en: "Type here...", ja: "入力してください...", zh: "输入文字...", vi: "Nhập vào đây...", tw: "輸入文字..." },
    legal_title: { ko: '라이브챗 이용 안내', en: 'Live Chat Terms & Safety', ja: 'ライブチャット利用案内', zh: '实时聊天使用指南', vi: 'Hướng dẫn sử dụng Live Chat', tw: '即時聊天使用指南' },
    legal_age: { ko: '만 13세 이상임을 확인합니다.', en: 'I am 13 years or older.', ja: '13歳以上であることを確認します。', zh: '我已年满13岁', vi: 'Tôi xác nhận mình trên 13 tuổi.', tw: 'Tôi đã đủ 13 tuổi trở lên' },
    legal_data: { ko: '채팅 메시지의 AI 처리 및 번역에 동의합니다.', en: 'Agree to AI processing/translation.', ja: 'チャットメッセージ AI 処理と翻訳に同意します。', zh: '同意AI处理和翻译', vi: 'Đồng ý với xử lý AI và dịch thuật.', tw: '同意AI處理和翻譯' },
    legal_record: { ko: '상대방 동의 하에만 녹화됨을 확인합니다.', en: 'Recording only with mutual consent.', ja: '相互同意の下でのみ録画・録音に同意します。', zh: '仅在双方同意下进行录制', vi: 'Chỉ ghi âm khi có sự đồng ý của cả hai.', tw: '僅在雙方同意下進行錄製' },
    legal_agree_btn: { ko: '동의하고 시작', en: 'Agree and Start', ja: '同意して開始', zh: '同意并开始', vi: 'Đồng ý và bắt đầu', tw: '同意並開始' },
    leave_chat: { ko: '방을 종료하시겠습니까?', en: 'Exit the room?', ja: '退室しますか？', zh: '退出房间？', vi: 'Thoát khỏi phòng?', tw: '退出房間？' },
    exit: { ko: '나가기', en: 'Exit', ja: '終了', zh: '退出', vi: 'Thoát', tw: '退出' },
    report_user: { ko: '사용자 신고', en: 'Report User', ja: 'ユーザー通報', zh: '举报用户', vi: 'Báo cáo người dùng', tw: '舉報用戶' },
    report_reason: { ko: '신고 사유 선택', en: 'Select Reason', ja: '通報理由選択', zh: '选择举报原因', vi: 'Chọn lý do báo cáo', tw: '選擇舉報原因' },
    report_detail: { ko: '상세 설명 (선택사항)', en: 'Detail (Optional)', ja: '詳細説明 (任意)', zh: '详细说明 (可选)', vi: 'Chi tiết (Tùy chọn)', tw: '詳細說明 (可選)' },
    report_submit: { ko: '신고 접수', en: 'Submit Report', ja: '通報する', zh: '提交举报', vi: 'Gửi báo cáo', tw: '提交舉報' },
    report_success: { ko: '신고가 접수되었습니다.', en: 'Report submitted successfully.', ja: '通報が受理されました。', zh: '举报已提交', vi: 'Báo cáo đã được gửi.', tw: '舉報已提交' },
    profanity_warning: { ko: '부적절한 단어가 포함되었습니다.', en: 'No profanity allowed.', ja: '不適切な言葉が含まれています。', zh: '包含不当词汇', vi: 'Chứa từ ngữ không phù hợp.', tw: '包含不當詞彙' },
    rec_viewer_title: { ko: '📼 대화 다시보기', en: 'Recordings', ja: '📼 録画ビューア', zh: '📼 录制内容', vi: '📼 Xem bản ghi', tw: '📼 錄製內容' },
    rec_count: { ko: '개 저장됨', en: 'saved', ja: '個保存済み', zh: '个已保存', vi: 'đã lưu', tw: '個已保存' },
    rec_file_saved: { ko: '영상이 기기에 저장되었습니다', en: 'Video saved to device', ja: '動画がデバイスに保存されました', zh: '视频已保存至设备', vi: 'Đã lưu video vào thiết bị', tw: '影片已保存至設備' },
    rec_back_to_list: { ko: '🔙 목록으로', en: '🔙 Back to List', ja: '🔙 返回列表', zh: '🔙 返回列表', vi: '🔙 Quay lại danh sách', tw: '🔙 返回列表' },
    rec_delete_notice: { ko: '기록만 삭제됩니다. 영상은 기기에서 직접 삭제해 주세요.', en: 'Only metadata deleted. Delete manual video from device.', ja: '記録のみ削除されます。', zh: '仅删除记录。请手动从设备删除视频', vi: 'Chỉ xóa dữ liệu. Hãy xóa video thủ công.', tw: '僅刪除記錄。請手動從設備刪除影片' },
    view_tos: { ko: '이용약관', en: 'Terms', ja: '利用規約', zh: '服务条款', vi: 'Điều khoản', tw: '服務條款' },
    view_privacy: { ko: '개인정보처리방침', en: 'Privacy', ja: 'プライバシーポリシー', zh: '隐私政策', vi: 'Chính sách bảo mật', tw: '隱私政策' },
    perfect_match: { ko: '정확합니다! ✅', en: 'Perfect! ✅', ja: '正確です！ ✅', zh: '非常准确！ ✅', vi: 'Hoàn hảo! ✅', tw: '非常準確！ ✅' },
    better_context_label: { ko: '문맥 추천 💡', en: 'Better for Context 💡', ja: '文脈のおすすめ 💡', zh: '更适合语境 💡', vi: 'Gợi ý ngữ cảnh 💡', tw: '更適合語境 💡' },
    view_translation: { ko: '번역 보기', en: 'Show Translation', ja: '翻訳を表示', zh: '查看翻译', vi: 'Xem bản dịch', tw: '查看翻譯' },
    opponent_left: { ko: '상대방이 대화방을 나갔습니다.', en: 'Opponent left the chat.', ja: '相手が退室しました。', zh: '对方已离开聊天室', vi: 'Đối phương đã rời phòng trò chuyện.', tw: '對方已離開聊天室' },
    connection_lost: { ko: '상대방과의 연결이 끊겼습니다. (네트워크 오류)', en: 'Connection lost with opponent. (Network error)', ja: '相手との接続が切れました。', zh: '与对方的连接已断开', vi: 'Mất kết nối với đối phương.', tw: '與對方的連接已斷開' }
};

const tUI = (lang: string, key: string) => uiStrings[key]?.[lang] || uiStrings[key]?.['en'] || key;
const getSpeechLang = (l: string) => ({ ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN', tw: 'zh-TW', vi: 'vi-VN' }[l] || 'en-US');


export const MemoizedLiveChatScreen = memo(LiveChatScreenContent, (prev, next) => {
    if (prev.setScreen !== next.setScreen) return false;
    if (prev.firebaseUser?.uid !== next.firebaseUser?.uid) return false;
    if (prev.waitingRoomId !== next.waitingRoomId) return false;

    // userInfo의 핵심 필드만 비교
    const pU = prev.userInfo || {};
    const nU = next.userInfo || {};
    if (pU.uid !== nU.uid) return false;
    if (pU.nickname !== nU.nickname) return false;
    if (pU.equippedSkin !== nU.equippedSkin) return false;

    return true; // 그 외(레벨, 포인트 등) 변경 시에는 리렌더링 안함
});

export interface ChatInputRef {
    setText: (t: string) => void;
    getText: () => string;
}

const ChatInputArea = memo(forwardRef<ChatInputRef, any>(({ onSend, isProcessing, placeholder }, ref) => {
    const [text, setText] = useState("");
    useImperativeHandle(ref, () => ({
        setText: (newText: string) => setText(newText),
        getText: () => text
    }));

    const handleLocalSend = () => {
        if (!text.trim() || isProcessing) return;
        onSend(text);
        setText("");
    };

    return (
        <div className="flex-1 flex bg-[#1E1E2C] border border-white/5 rounded-2xl p-1 shadow-inner relative group focus-within:border-emerald-500/50 transition-colors">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent border-none text-white placeholder-slate-500 text-[14px] font-bold h-12 py-3.5 px-4 outline-none resize-none leading-tight"
                onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleLocalSend();
                    }
                }}
            />
            <button
                onClick={handleLocalSend}
                disabled={!text.trim() || isProcessing}
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all ${text.trim() && !isProcessing ? 'bg-emerald-600 text-white shadow-lg active:scale-90' : 'bg-white/5 text-slate-500'}`}
            >
                {isProcessing ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
            </button>
        </div>
    );
}));

function LiveChatScreenContent({ userInfo, firebaseUser, settings, setScreen, setMyPhrases, onRoomCreated, waitingRoomId, playSound, setLegalDocInfo, aiUsage, incrementAiUsage, isPremium, equippedSkin, setShowApiModal }: any) {
    const rawUserInfo = userInfo || {};
    const [lang, setLang] = useState(settings?.lang || 'ko');
    const chatInputRef = useRef<ChatInputRef>(null);
    const [isCameraStarting, setIsCameraStarting] = useState(false);

    const [gameState, setGameState] = useState<'LOBBY' | 'CREATE_ROOM' | 'CHAT'>('LOBBY');
    const [lobbyTab, setLobbyTab] = useState<'public_rooms' | 'online' | 'search'>('public_rooms');

    // Lobby State
    const [publicRooms, setPublicRooms] = useState<LiveChatRoom[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<VQUser[]>([]);
    const [isLoadingOnline, setIsLoadingOnline] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<VQUser[] | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    // Create Room State
    const [createScenarioType, setCreateScenarioType] = useState('airport_checkin');
    const [customScenario, setCustomScenario] = useState('');
    const [createMyRole, setCreateMyRole] = useState(0); // index 0 or 1 for preset, or string for custom
    const [customMyRole, setCustomMyRole] = useState('');
    const [customOpponentRole, setCustomOpponentRole] = useState('');

    // Chat Room State
    const [activeRoom, _setActiveRoom] = useState<LiveChatRoom | null>(null);
    const activeRoomRef = useRef<LiveChatRoom | null>(null);
    const setActiveRoom = (room: LiveChatRoom | null) => {
        _setActiveRoom(room);
        activeRoomRef.current = room;
    };
    const [incomingRequest, setIncomingRequest] = useState<LiveChatRoom | null>(null);
    const [messages, setMessages] = useState<(ChatMessage & { localNative?: string, showNative?: boolean })[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    // Region Filter (Optional UI later)
    const [selectedFlag, setSelectedFlag] = useState<typeof FLAGS[0] | null>(null);
    const [rivalInfo, setRivalInfo] = useState<any>(null);
    const [isWaitingPartner, setIsWaitingPartner] = useState(false);
    // Mic lock: when I'm recording, opponent can't use mic (tracked in Firestore via room)
    const [isMicLocked, setIsMicLocked] = useState(false); // opponent is speaking
    const [isAiSpeaking, setIsAiSpeaking] = useState(false); // Tracks if AI TTS is currently active

    // Media (Camera)
    const videoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const signalingUnsubRef = useRef<(() => void) | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [isWebRTCStarted, setIsWebRTCStarted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // // 📼 세션 녹화 Recording State
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const [isSessionRecording, setIsSessionRecording] = useState(false);
    const [recordingStatus, setRecordingStatus] = useState<'idle' | 'requesting' | 'waiting' | 'recording' | 'declined'>('idle');
    const [recordingTimeMs, setRecordingTimeMs] = useState(0);
    const recordingTimerRef = useRef<number | null>(null);
    // Local saved recordings: { url, duration, transcript, date, scenarioLabel }
    const [savedRecordings, setSavedRecordings] = useState<any[]>(() => {
        try { return JSON.parse(localStorage.getItem('vq_recordings') || '[]'); } catch { return []; }
    });
    const [showRecordings, setShowRecordings] = useState(false);
    const [playingRecordingData, setPlayingRecordingData] = useState<any | null>(null);

    // Track recording consent from opponent in real-time
    const [, setOpponentRecordingConsent] = useState<string | null>(null);
    const [incomingRecordingRequest, setIncomingRecordingRequest] = useState(false);

    // // ⚖️ 법적 고지 Legal Safety State
    // First-time consent: stored in localStorage so user sees it only once
    const [showConsentModal, setShowConsentModal] = useState(
        !localStorage.getItem('vq_livechat_consent_v1')
    );
    const [consentAgeChecked, setConsentAgeChecked] = useState(false);
    const [consentDataChecked, setConsentDataChecked] = useState(false);
    const [consentRecordChecked, setConsentRecordChecked] = useState(false);
    // Report user modal
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState<ReportReason>('inappropriate_language');
    const [reportDetail, setReportDetail] = useState('');

    // Pre-chat Recording Consent
    const [showPreChatRecordModal, setShowPreChatRecordModal] = useState(false);
    const [postConsentAction, setPostConsentAction] = useState<(() => void) | null>(null);
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    // Blocked messages banner (when profanity detected)
    const [blockedMsgWarning, setBlockedMsgWarning] = useState(false);

    // Toast Notification State
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [onExitAction, setOnExitAction] = useState<(() => void) | null>(null);

    // AI & Matching States
    const [isAiMode, setIsAiMode] = useState(false);
    const [isAiTyping, setIsAiTyping] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [matchingTimer, setMatchingTimer] = useState(0);
    const matchingInterval = useRef<any>(null);
    const conversationHistory = useRef<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);

    // [NEW] Role-play Guide States
    const [initialGuide, setInitialGuide] = useState<{ en: string, nat: string } | null>(null);
    const [isGeneratingInitialGuide, setIsGeneratingInitialGuide] = useState(false);
    const [manualSuggestion, setManualSuggestion] = useState<string | null>(null);
    const [manualSuggestionNative, setManualSuggestionNative] = useState<string | null>(null);
    const [isManualLoading, setIsManualLoading] = useState(false);

    // ── [NEW] 무한 루프 서킷 브레이커 (Safety Guard) ──────────
    const breakerRef = useRef<{ [key: string]: { count: number, lastReset: number, isBroken: boolean } }>({});
    const checkBreaker = (label: string, limit = 50, window = 60000) => {
        const now = Date.now();
        if (!breakerRef.current[label]) {
            breakerRef.current[label] = { count: 0, lastReset: now, isBroken: false };
        }
        const b = breakerRef.current[label];
        if (b.isBroken) return false;

        if (now - b.lastReset > window) {
            b.count = 0;
            b.lastReset = now;
        }
        b.count++;
        if (b.count > limit) {
            b.isBroken = true;
            console.error(`[CircuitBreaker] ${label} triggered! Stopping listener to prevent excessive Firestore reads.`);
            alert(lang === 'ko' ? `시스템 보호를 위해 ${label} 연결이 일시 차단되었습니다. 재접속이 필요합니다.` : `Connection for ${label} blocked for system protection. Please refresh.`);
            return false;
        }
        return true;
    };

    const triggerToast = (msg: string) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
    };

    // ───── Media Helper Functions ─────
    const stopMediaStream = useCallback((stream: MediaStream | null, setter?: (s: MediaStream | null) => void) => {
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
                console.log(`[Media] Track stopped: ${track.kind}`);
            });
            if (setter) setter(null);
        }
    }, []);

    const toggleCamera = async (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (isCameraStarting) return; // 중복 요청 방지
        console.log('[Media] toggleCamera called. Current state:', isCameraActive);

        if (isCameraActive) {
            console.log('[Media] Deactivating camera');
            setIsCameraActive(false);
            stopMediaStream(localStream, setLocalStream);
            if (videoRef.current) videoRef.current.srcObject = null;
        } else {
            // HTTPS 또는 localhost 환경 지원 여부 확인
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert(lang === 'ko' ? '이 브라우저/환경에서는 카메라를 지원하지 않습니다 (HTTPS 또는 localhost 필요).' : 'Camera is not supported in this environment (HTTPS or localhost required).');
                return;
            }

            try {
                setIsCameraStarting(true);
                console.log('[Media] Requesting camera access...');
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'user',
                        width: { ideal: 640 },
                        height: { ideal: 480 }
                    },
                    audio: false
                });

                // 스트림 획득 후 바인딩
                setLocalStream(stream);
                setIsCameraActive(true);
            } catch (err: any) {
                console.error('[Media] Camera failed:', err);
                const errorMsg = err?.name === 'NotAllowedError'
                    ? (lang === 'ko' ? '카메라 권한이 거부되었습니다. 기기 설정에서 접근을 허용해 주세요.' : 'Camera permission denied. Please allow it in settings.')
                    : (lang === 'ko' ? `카메라 접근 실패: ${err?.message || '알 수 없는 오류'}` : `Camera failed: ${err?.message || 'Unknown error'}`);
                alert(errorMsg);
                setIsCameraActive(false);
            } finally {
                setIsCameraStarting(false);
            }
        }
    };

    // AI API Setup
    // ... (logic moved)

    // Load Online Users (Lobby only)
    const loadOnlineUsers = async () => {
        setIsLoadingOnline(true);
        try {
            const users = await getChatLobbyUsers(20);
            const filtered = users.filter(u =>
                u.nickname !== rawUserInfo?.nickname &&
                u.uid !== firebaseUser?.uid &&
                !(rawUserInfo?.blockedUids || []).includes(u.uid) // Blocked users filter
            );
            setOnlineUsers(filtered);
        } catch (e) {
            console.warn('getChatLobbyUsers failed:', e);
        } finally {
            setIsLoadingOnline(false);
        }
    };

    // Presence management
    useEffect(() => {
        if (!firebaseUser) return;
        setChatLobbyPresence(firebaseUser.uid, true);

        const handleEscapeCleanup = () => {
            const room = activeRoomRef.current;
            if (!room) return;
            if (room.status === 'PENDING' && room.callerId === firebaseUser.uid) {
                cancelChatRequest(room.id).catch(() => { });
            } else if (room.status === 'ACCEPTED') {
                finishChatRoom(room.id).catch(() => { });
            }
        };

        // App exit cleanup for Capacitor
        let capListener: any = null;
        try {
            import('@capacitor/app').then(({ App: CapApp }) => {
                capListener = CapApp.addListener('appStateChange', ({ isActive }) => {
                    if (!isActive) handleEscapeCleanup();
                });
            });
        } catch (e) { }

        // Browser exit cleanup
        const handleBeforeUnload = () => {
            handleEscapeCleanup();
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            setChatLobbyPresence(firebaseUser.uid, false);
            if (capListener) capListener.remove();
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [firebaseUser?.uid]);

    useEffect(() => {
        if (gameState === 'LOBBY' && lobbyTab === 'online') loadOnlineUsers();
        if (gameState === 'LOBBY' && lobbyTab === 'public_rooms') {
            if (!checkBreaker('PublicRooms')) return;
            const unsub = listenToPublicRooms((rooms) => {
                // [Fix] 혼자서 2대의 기기로 테스트할 수 있도록 내가 만든 방도 목록에 노출되게 필터 제거
                setPublicRooms(rooms);
            });
            return () => unsub();
        }
    }, [gameState, lobbyTab, firebaseUser?.uid]);


    // 1. Remote Signaling Monitor (Wait for Peer)
    // Restore Global Waiting State
    useEffect(() => {
        if (waitingRoomId && gameState === 'LOBBY') {
            if (!checkBreaker('WaitingStatus')) return;
            const unsub = listenToChatRoomStatus(waitingRoomId, (room) => {
                if (!room) {
                    unsub();
                    return;
                }

                if (room.status === 'PENDING') {
                    setActiveRoom(room);
                    // Do not automatically set isWaitingPartner = true here to avoid popping up overlay unexpectedly
                    // Just keep activeRoom in sync
                } else if (room.status === 'ACCEPTED') {
                    unsub();
                    if (playSound) {
                        playSound('alarm');
                        setTimeout(() => playSound('alarm'), 600);
                    }
                    setActiveRoom(room);

                    // Set Rival Info correctly
                    const isCaller = room.callerId === firebaseUser?.uid;
                    setRivalInfo({
                        uid: isCaller ? room.receiverId : room.callerId,
                        name: isCaller ? (room.receiverName || 'Partner') : (room.callerName || 'Partner'),
                        skin: isCaller ? (room.receiverSkin || 'default') : (room.callerSkin || 'default')
                    });

                    setGameState('CHAT');
                    setIsWaitingPartner(false);
                    setIsMatching(false);
                    if (onRoomCreated) onRoomCreated(null); // Wait finished
                } else if (room.status === 'CANCELLED' || room.status === 'DECLINED' || room.status === 'FINISHED') {
                    unsub();
                    setActiveRoom(null);
                    setIsWaitingPartner(false);
                    setIsMatching(false);
                    if (onRoomCreated) onRoomCreated(null);
                }
            });
            return () => unsub();
        }
    }, [waitingRoomId, gameState, firebaseUser?.uid]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setSearchResult(null);
        try {
            const results = await searchUserByNickname(searchQuery.trim());
            const filtered = results.filter(u => u.uid !== firebaseUser?.uid);
            setSearchResult(filtered);
        } catch (e) {
            setSearchResult([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Listen to incoming chat requests
    useEffect(() => {
        const uid = firebaseUser?.uid;
        if (!uid || gameState !== 'LOBBY') return;
        if (!checkBreaker('ChatRequests')) return;
        const unsub = listenToMyChatRequests(uid, (room) => {
            if (room) setIncomingRequest(room);
        });
        return () => unsub();
    }, [firebaseUser?.uid, gameState]);

    // Start Matching / Challenge
    const startChatMatching = async (specificRival: VQUser) => {
        setIsAiMode(false);
        if (!firebaseUser) return;
        setRivalInfo({
            uid: specificRival.uid,
            name: specificRival.nickname,
            skin: SKIN_EMOJI[specificRival.skin] || '',
            region: specificRival.region || ''
        });

        try {
            const rId = await createChatRoom(
                { uid: firebaseUser.uid, nickname: rawUserInfo.nickname || firebaseUser.displayName || 'User', skin: equippedSkin } as any,
                specificRival
            );

            const newRoom: LiveChatRoom = {
                id: rId,
                status: 'ACCEPTED', // Challenge is accepted by my action here
                createdAt: new Date(),
                callerId: firebaseUser.uid,
                callerName: rawUserInfo.nickname || firebaseUser.displayName || 'User',
                callerSkin: equippedSkin,
                receiverId: specificRival.uid,
                receiverName: specificRival.nickname,
                receiverSkin: (specificRival as any).skin || 'default'
            };
            setActiveRoom(newRoom);
            setIsWaitingPartner(false);
            setGameState('CHAT');

            // Automatically attempt to turn on camera when waiting in room
            if (!isCameraActive) {
                setTimeout(() => toggleCamera(), 500);
            }

            // Wait for opponent to accept
            const unsub = listenToChatRoomStatus(rId, (room) => {
                if (room?.status === 'ACCEPTED') {
                    unsub();
                    if (playSound) {
                        playSound('alarm');
                        setTimeout(() => playSound('alarm'), 600);
                    }
                    setActiveRoom(room);
                    setGameState('CHAT');
                    setIsWaitingPartner(false);
                } else if (room?.status === 'DECLINED' || room?.status === 'CANCELLED' || room?.status === 'FINISHED') {
                    unsub();
                    if (room?.status === 'DECLINED') alert(tUI(lang, 'declined'));
                    setGameState('LOBBY');
                    setActiveRoom(null);
                    setIsWaitingPartner(false);
                }
            });
        } catch (e) {
            setGameState('LOBBY');
            setIsWaitingPartner(false);
        }
    };

    const submitCreateRoom = async () => {
        setIsAiMode(false);
        if (!firebaseUser) return;
        const preset = PRESET_SCENARIOS.find(p => p.id === createScenarioType);

        let scenarioStr = '';
        let myRoleStr = '';
        let oppRoleStr = '';
        let scenarioId: string | undefined;
        let callerRoleIdx: number | undefined;
        let receiverRoleIdx: number | undefined;

        if (preset?.id === 'custom') {
            if (!customScenario.trim() || !customMyRole.trim() || !customOpponentRole.trim()) {
                alert(tUI(lang, 'fill_all'));
                return;
            }
            // Profanity filter for custom text 
            if (!isSafeText(customScenario) || !isSafeText(customMyRole) || !isSafeText(customOpponentRole)) {
                alert('부적절한 언어가 포함되어 방을 생성할 수 없습니다.\nNo inappropriate language allowed.');
                return;
            }
            scenarioStr = customScenario.trim();
            myRoleStr = customMyRole.trim();
            oppRoleStr = customOpponentRole.trim();
            scenarioId = 'custom';
            callerRoleIdx = 0;
            receiverRoleIdx = 1;
        } else if (preset) {
            scenarioStr = (preset.label as any)[lang] || preset.label['en'];
            myRoleStr = (preset.roles[createMyRole as number] as any)?.[lang] || preset.roles[createMyRole as number]?.['en'] || 'Role A';
            oppRoleStr = (preset.roles[createMyRole === 0 ? 1 : 0] as any)?.[lang] || preset.roles[createMyRole === 0 ? 1 : 0]?.['en'] || 'Role B';

            scenarioId = preset.id;
            callerRoleIdx = createMyRole as number;
            receiverRoleIdx = createMyRole === 0 ? 1 : 0;
        }

        try {
            // 방 생성 후 게임 상태를 MATCHING으로 바꾸지 않고, 로비에 머물도록
            const roomExtraData: any = {
                scenario: scenarioStr,
                callerRole: myRoleStr,
                receiverRole: oppRoleStr,
                lang: lang
            };
            if (scenarioId) roomExtraData.scenarioId = scenarioId;
            if (callerRoleIdx !== undefined) roomExtraData.callerRoleIdx = callerRoleIdx;
            if (receiverRoleIdx !== undefined) roomExtraData.receiverRoleIdx = receiverRoleIdx;

            const rId = await createChatRoom(
                { uid: firebaseUser.uid, nickname: rawUserInfo.nickname || firebaseUser.displayName || 'User', skin: equippedSkin } as any,
                'public',
                roomExtraData
            );

            if (onRoomCreated) onRoomCreated(rId);

            const newRoom: LiveChatRoom = {
                id: rId,
                status: 'PENDING',
                createdAt: new Date(),
                callerId: firebaseUser.uid,
                callerName: rawUserInfo.nickname || firebaseUser.displayName || 'User',
                receiverId: 'public',
                receiverName: 'Anyone',
                callerSkin: equippedSkin,
                ...roomExtraData
            };
            setActiveRoom(newRoom);
            setRivalInfo({ name: 'Waiting...', skin: 'default' });
            setIsWaitingPartner(true);
            setGameState('CHAT');

            // Automatically attempt to turn on camera when waiting in room
            if (!isCameraActive) {
                setTimeout(() => toggleCamera(), 800);
            }

            const unsub = listenToChatRoomStatus(rId, (room) => {
                if (room?.status === 'ACCEPTED') {
                    unsub();
                    if (playSound) {
                        playSound('alarm');
                        setTimeout(() => playSound('alarm'), 600);
                    }
                    setActiveRoom(room);
                    setGameState('CHAT');
                    setIsWaitingPartner(false);
                    // Update rival info when someone joins our public room
                    if (room.receiverId) {
                        setRivalInfo({
                            uid: room.receiverId,
                            name: room.receiverName || 'Partner',
                            skin: SKIN_EMOJI[room.receiverSkin as keyof typeof SKIN_EMOJI] || SKIN_EMOJI.default,
                            region: ''
                        });
                    }
                    if (onRoomCreated) onRoomCreated(null); // Wait finished
                } else if (room?.status === 'DECLINED' || room?.status === 'CANCELLED' || room?.status === 'FINISHED') {
                    unsub();
                    setGameState('LOBBY');
                    setActiveRoom(null);
                    setIsWaitingPartner(false);
                }
            });
        } catch (e: any) {
            console.error("Room creation error", e);
            alert('방 생성 오오류가 발생했습니다: ' + (e.message || '알 수 없는 오류'));
            setGameState('LOBBY');
            setIsWaitingPartner(false);
        }
    };

    const handleJoinPublicRoom = async (room: LiveChatRoom) => {
        if (!firebaseUser) return;
        setIsAiMode(false);
        try {
            await joinPublicRoom(room.id, { uid: firebaseUser.uid, nickname: rawUserInfo.nickname, skin: equippedSkin } as any);
            setRivalInfo({ name: room.callerName, skin: room.callerSkin || 'default', region: '' });
            setActiveRoom(room);
            setGameState('CHAT');

            // Automatically attempt to turn on camera when joining a room
            if (!isCameraActive) {
                setTimeout(() => toggleCamera(), 500);
            }
        } catch (e) {
            alert(tUI(lang, 'join_failed'));
        }
    };

    // Respond to incoming request
    const handleAcceptRequest = async () => {
        if (!incomingRequest) return;
        try {
            await respondToChatRequest(incomingRequest.id, true);
            setRivalInfo({
                name: incomingRequest.callerName,
                skin: incomingRequest.callerSkin || 'default',
                region: ''
            });
            setActiveRoom(incomingRequest);
            setIncomingRequest(null);
            setGameState('CHAT');

            // Automatically attempt to turn on camera when accepting a request
            if (!isCameraActive) {
                setTimeout(() => toggleCamera(), 500);
            }
        } catch (e) { }
    };

    const handleDeclineRequest = async () => {
        if (!incomingRequest) return;
        await respondToChatRequest(incomingRequest.id, false);
        setIncomingRequest(null);
    };

    const handleCancelMatching = async () => {
        const roomId = activeRoom?.id || waitingRoomId;
        try {
            if (roomId) await cancelChatRequest(roomId);
        } catch (e) {
            console.warn("Cancel matching failed:", e);
        }

        // 카메라 및 스트림 정리
        stopMediaStream(localStream, setLocalStream);
        stopMediaStream(remoteStream, setRemoteStream);
        setIsCameraActive(false);
        if (videoRef.current) videoRef.current.srcObject = null;

        if (onRoomCreated) onRoomCreated(null);
        setGameState('LOBBY');
        setActiveRoom(null);
        setIsWaitingPartner(false);
        setIsMatching(false);
        setIsAiMode(false); // <--- Add this! Clear AI mode when returning to lobby
        if (matchingInterval.current) clearInterval(matchingInterval.current);
    };




    // Chat Room Messaging Logic
    const previousRoomStatusRef = useRef<string | null>(null);

    const lastTranslatedIdRef = useRef<string | null>(null);

    const fetchTranslation = async (msg: ChatMessage) => {
        if (!msg.id || lastTranslatedIdRef.current === msg.id) return;

        const userSavedKey = localStorage.getItem('vq_gemini_key');
        const activeKey = getActiveApiKey(userSavedKey, isPremium, aiUsage);
        if (!activeKey) {
            if (setShowApiModal) setShowApiModal(true);
            return;
        }

        const langMap: any = { ko: 'Korean', en: 'English', ja: 'Japanese', zh: 'Mandarin Chinese', vi: 'Vietnamese', tw: 'Traditional Chinese' };
        const myLang = langMap[lang] || 'Korean';

        try {
            const promptT = `Translate to ${myLang}: "${msg.translatedEn || msg.text}"\nReturn ONLY the translated text.`;
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${LIGHTWEIGHT_MODEL}:generateContent?key=${activeKey}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: promptT }] }] })
            });
            const data = await res.json();
            const translated = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
            if (translated) {
                setMessages(prev => prev.map(m => (m.id && m.id === msg.id) ? { ...m, localNative: translated, showNative: true } : m));
                lastTranslatedIdRef.current = msg.id;
            }
        } catch (err) { console.error('Auto-translation failed', err); }
    };

    useEffect(() => {
        if (gameState !== 'CHAT' || !activeRoom) {
            previousRoomStatusRef.current = null;
            return;
        }

        const unsub = listenToChatMessages(activeRoom.id, (msgs) => {
            setMessages(currentLocalMsgs => {
                const newLocalMsgs = [...currentLocalMsgs];
                msgs.forEach(serverMsg => {
                    const existsIdx = newLocalMsgs.findIndex(m => m.id === serverMsg.id);
                    if (existsIdx === -1) {
                        const isMine = serverMsg.senderId === firebaseUser?.uid;
                        if (!isMine) {
                            // Trigger auto-translation for the new message
                            fetchTranslation(serverMsg);
                        }
                        newLocalMsgs.push(serverMsg);
                    }
                });
                return newLocalMsgs;
            });
        });

        // Also listen to room closure
        const unsubStatus = listenToChatRoomStatus(activeRoom.id, (room) => {
            if (!room) return;
            // Only alert if transitioning to FINISHED/CANCELLED from something else (like ACCEPTED)
            if (previousRoomStatusRef.current && previousRoomStatusRef.current !== room.status) {
                if (room.status === 'FINISHED' || room.status === 'CANCELLED') {
                    // Differentiate between intentional exit and room closure
                    const msg = room.status === 'CANCELLED' ? tUI(lang, 'opponent_left') : tUI(lang, 'chat_ended');
                    alert(msg);
                    // 상대방 퇴장 시에도 카메라 및 상태 정리
                    stopMediaStream(localStream, setLocalStream);
                    stopMediaStream(remoteStream, setRemoteStream);
                    setIsCameraActive(false);
                    setGameState('LOBBY');
                    setActiveRoom(null);
                }
            }
            previousRoomStatusRef.current = room.status;

            // Start WebRTC if status is ACCEPTED
            if (room.status === 'ACCEPTED' && !peerConnectionRef.current && !isAiMode) {
                if (!checkBreaker('WebRTC_Signaling')) return;
                setupPeerConnection(activeRoom.id).then(unsub => {
                    signalingUnsubRef.current = unsub;
                    setIsWebRTCStarted(true);
                });
            }
        });

        return () => {
            unsub();
            unsubStatus();
            if (signalingUnsubRef.current) {
                signalingUnsubRef.current();
                signalingUnsubRef.current = null;
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }
            if (activeRoomRef.current) {
                clearSignalingData(activeRoomRef.current.id).catch(() => { });
                // [Fix] Only cancel if it was still PENDING or it's a real exit to LOBBY
                const rid = activeRoomRef.current.id;
                const status = previousRoomStatusRef.current;
                if (status === 'PENDING') {
                    cancelChatRequest(rid).catch(() => { });
                }
            } else if (waitingRoomId) {
                // 대기 중인 방이 있으면 취소
                cancelChatRequest(waitingRoomId).catch(() => { });
            }
            setIsWebRTCStarted(false);
            stopMediaStream(localStream, setLocalStream);
            stopMediaStream(remoteStream, setRemoteStream);
        };
    }, [gameState, activeRoom?.id, firebaseUser?.uid, isAiMode, waitingRoomId]);

    // TTS 퍼 Capacitor(Android) 선, fallback Web Speech API
    const isNativePlatform = () =>
        typeof (window as any).Capacitor !== 'undefined' &&
        (window as any).Capacitor.isNativePlatform?.() === true;

    const speakText = useCallback(async (text: string, langCode: string = 'en-US') => {
        if (!text) return;
        try {
            setIsAiSpeaking(true);
            
            // 대사 길이에 따라 4가지 목소리를 번갈아가며 사용해 다채롭고 생동감 있는 대화 연출
            const profile = TEEN_GIRL_PROFILES[text.length % TEEN_GIRL_PROFILES.length];

            if (isNativePlatform()) {
                try { await TextToSpeech.stop().catch(() => { }); } catch (_) { }
                const voiceIndex = await getBestVoiceIndex(langCode);
                
                const options: any = {
                    text,
                    lang: langCode,
                    rate: profile.rate,
                    pitch: profile.pitch,
                    volume: 1.0,
                    category: 'playback'
                };
                if (voiceIndex !== undefined) options.voice = voiceIndex;

                await TextToSpeech.speak(options);
                setIsAiSpeaking(false);
            } else {
                window.speechSynthesis.cancel();
                const utter = new SpeechSynthesisUtterance(text);
                
                // Web 환경: 밝은 톤의 여성 목소리 우선 맵핑
                const voices = window.speechSynthesis.getVoices();
                if (voices.length > 0) {
                    const enVoices = voices.filter(v => v.lang.startsWith(langCode.substring(0, 2)));
                    const girlVoice = enVoices.find(v => v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Google US English') || v.name.includes('Karen')) || enVoices[0];
                    if (girlVoice) utter.voice = girlVoice;
                }
                
                utter.lang = langCode;
                utter.rate = profile.rate;
                utter.pitch = profile.pitch;
                utter.onend = () => setIsAiSpeaking(false);
                utter.onerror = () => setIsAiSpeaking(false);
                window.speechSynthesis.speak(utter);
            }
        } catch (e) {
            console.error('TTS failed:', e);
            setIsAiSpeaking(false);
        }
    }, []);

    const stopSpeaking = useCallback(async () => {
        setIsAiSpeaking(false);
        try {
            if (isNativePlatform()) {
                await TextToSpeech.stop().catch(() => { });
            } else {
                window.speechSynthesis.cancel();
            }
        } catch (_) { }
    }, []);

    const handleSpeak = (text: string) => {
        speakText(text, 'en-US');
    };

    useEffect(() => {
        if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const generateInitialGuide = async () => {
        if (!activeRoom || messages.length > 0 || isGeneratingInitialGuide || initialGuide) return;

        const userSavedKey = localStorage.getItem('vq_gemini_key');
        const activeKey = getActiveApiKey(userSavedKey, isPremium, aiUsage);
        if (!activeKey) return;

        setIsGeneratingInitialGuide(true);
        const myRole = amICaller() ? activeRoom.callerRole : activeRoom.receiverRole;
        const langMap: any = { ko: 'Korean', en: 'English', ja: 'Japanese', zh: 'Mandarin Chinese', vi: 'Vietnamese', tw: 'Traditional Chinese' };
        const myLang = langMap[lang] || 'Korean';

        try {
            const prompt = `
            You are a role-play assistant. 
            Scenario: ${activeRoom.scenario}
            User's Role: ${myRole}
            
            Based on this scenario, the user with this role should speak first. 
            Provide a natural greeting or opening sentence in English.
            Also provide the translation in ${myLang}.

            Format strictly as JSON:
            {"en": "Greeting in English", "nat": "Translation in ${myLang}"}
            `;

            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${LIGHTWEIGHT_MODEL}:generateContent?key=${activeKey}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await res.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const parsed = safeParseJson(rawText);
            if (parsed && parsed.en) {
                setInitialGuide({ en: parsed.en, nat: parsed.nat || '' });
            }
        } catch (e) {
            console.error("Initial guide error", e);
        } finally {
            setIsGeneratingInitialGuide(false);
        }
    };

    useEffect(() => {
        if (gameState === 'CHAT' && activeRoom && messages.filter(m => !m.isSystem).length === 0) {
            generateInitialGuide();
        }
    }, [gameState, activeRoom, messages.length]);

    const processAndSendMessage = async (text: string) => {
        if (!text.trim() || !firebaseUser) return;

        const userSavedKey = localStorage.getItem('vq_gemini_key');
        const activeKey = getActiveApiKey(userSavedKey, isPremium, aiUsage);
        if (!activeKey) {
            setShowApiModal(true);
            return;
        }

        // Check Ai Usage if function provided
        if (incrementAiUsage && !incrementAiUsage()) return;

        setIsProcessing(true);
        const langMap: any = { ko: 'Korean', en: 'English', ja: 'Japanese', zh: 'Mandarin Chinese', vi: 'Vietnamese', tw: 'Traditional Chinese' };
        const myLang = langMap[lang] || 'English';

        try {
            // Task 1: Robust detector and multi-language support (Chinese, etc.) -> English
            // Task 2: Correct English grammar and show native translation
            const scenarioInfo = (activeRoom && activeRoom.scenario) ? `
--- ROLE-PLAY CONTEXT ---
Scenario: ${activeRoom.scenario}
User's Role: ${activeRoom.callerId === firebaseUser.uid ? activeRoom.callerRole : activeRoom.receiverRole}
Opponent's Role: ${activeRoom.callerId === firebaseUser.uid ? activeRoom.receiverRole : activeRoom.callerRole}
-------------------------` : '';

            const prompt = `
You are a real-time language translator and correction assistant for a P2P chat app.
The user's native app language is: ${myLang}.
${scenarioInfo}

Input text: "${text}"

⚠️ IMPORTANT: ALL English output (english, nextSpeakerGuide, betterContext) MUST be A2 level English.
A2 level means: short sentences, simple everyday words, no idioms, no complex grammar.
Examples of A2: "How are you?" / "I like coffee." / "Can I help you?" / "That is good."

Rules:
1. Detect input language.
2. IF Input is NOT English: Translate to simple A2 English fitting the scenario.
3. IF Input is English: Check grammar. Provide corrected simple A2 English.
4. Provide the native meaning in ${myLang}.
5. CREATE 1 simple A2 English sentence for the OPPONENT'S NEXT turn.
6. Provide the native meaning of that guide in ${myLang}.
7. JUDGING ISPERFECT: Only set "isPerfect" to true if the English is completely correct with no grammar mistakes. If there are ANY grammar issues, set it to false.
8. betterContext: If there's a simpler or more natural A2 way to say it, provide it. Otherwise null.
9. STRICT: NO grammar explanations. NO extra text.

Format strictly as JSON:
{
 "original": "${text}",
 "english": "Corrected A2 English",
 "native": "Meaning in ${myLang}",
 "nextSpeakerGuide": "Simple A2 English for opponent",
 "nextSpeakerGuideNative": "Translation in ${myLang}",
 "isPerfect": boolean,
 "betterContext": "A simpler A2 way to say it, or null",
 "originalLang": "ISO code"
}
`;

            const userSavedKey = localStorage.getItem('vq_gemini_key');
            const activeKey = getActiveApiKey(userSavedKey, isPremium, aiUsage);
            if (!activeKey) {
                setShowApiModal(true);
                return;
            }
            if (incrementAiUsage) incrementAiUsage();

            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${LIGHTWEIGHT_MODEL}:generateContent?key=${activeKey}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error("Gemini API Error:", res.status, errorData);
                if (res.status === 429) {
                    alert(lang === 'ko' ? 'AI 사용량이 일일 한도를 초과했습니다. 잠시 후 다시 시도하거나 나중에 이용해 주세요.' : 'AI quota exceeded. Please try again later.');
                } else {
                    throw new Error(`API Error ${res.status}: ${errorData?.error?.message || 'Unknown error'}`);
                }
                return; // Stop processing but keep inputText
            }

            const data = await res.json();
            const jsonTarget = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const jsonPart = jsonTarget.match(/\{[\s\S]*?\}/)?.[0];
            if (!jsonPart) {
                console.warn("Gemini response missing JSON:", jsonTarget);
                throw new Error('Invalid JSON from AI');
            }

            const result = JSON.parse(jsonPart);

            const chatMsg: Omit<ChatMessage, 'createdAt'> = {
                senderId: firebaseUser.uid,
                senderName: userInfo.nickname || 'User',
                text: result.original || text, // Fallback to raw text if model failed to echo original
                translatedEn: result.english || text,
                hasError: !result.isPerfect,
                isPerfect: !!result.isPerfect,
                betterContext: result.betterContext || null,
                originalLang: result.originalLang || null,
                localNative: result.native || null,
                suggestion: result.suggestion || null,
                suggestionNative: result.suggestionNative || null,
                showNative: false
            };

            if (isAiMode) {
                setMessages(prev => [...prev, { ...chatMsg, createdAt: new Date() } as ChatMessage]);
                getAiResponse(result.english || text);
            } else if (activeRoom) {
                await sendChatMessage(activeRoom.id, chatMsg);
            }

            chatInputRef.current?.setText(''); // Only clear after success
        } catch (e: any) {
            console.error("Message processing error", e);
            // 에러 메시지 세분화 (이미 처리된 429는 제외)
            if (!e.message?.includes('429')) {
                alert(tUI(lang, 'error_occurred') + (e.message ? ` (${e.message})` : ''));
            }
        } finally {
            setIsProcessing(false);
        }
    };

    // Report handler 
    const handleSubmitReport = async () => {
        if (!activeRoom || !firebaseUser || !rivalInfo) return;
        setIsSubmittingReport(true);
        try {
            await submitChatReport({
                reporterId: firebaseUser.uid,
                reporterName: userInfo?.nickname || 'Unknown',
                reportedUserId: rivalInfo.uid || 'unknown',
                reportedUserName: rivalInfo.name || 'Unknown',
                roomId: activeRoom.id,
                reason: reportReason,
                detail: reportDetail.trim(),
            });

            // 자동 차단 처리 (UGC 권장 사항)
            if (rivalInfo.uid) {
                await blockUser(firebaseUser.uid, rivalInfo.uid);
            }

            setShowReportModal(false);
            setReportDetail('');
            alert(tUI(lang, 'report_success') + " (사용자 차단됨)");

            // 채팅 중이었다면 로비로 이동
            if (gameState === 'CHAT') {
                setGameState('LOBBY');
                setActiveRoom(null);
            }
        } catch (e) {
            alert(tUI(lang, 'error_occurred'));
        } finally {
            setIsSubmittingReport(false);
        }
    };
    const startRecording = async () => {
        // Reset input text immediately when starting a new recording to give feedback
        chatInputRef.current?.setText(''); // Clear input for new speech attempt

        if (isMicLocked) {
            alert(lang === 'ko' ? '상대방이 말하는 중입니다. 잠시 후 다시 시도해 주세요.' : 'Opponent is speaking. Please wait.');
            return;
        }

        if (isRecording) {
            console.log("Stopping recording manually...");
            try { await SpeechRecognition.stop(); } catch (e) { }
            setIsRecording(false);
            return;
        }

        try {
            await stopSpeaking();
            const WebSR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            const mediaStream = mediaRecorderRef.current?.stream;
            const recordingAudioTracks = mediaStream?.getAudioTracks();

            const closeMicJob = () => {
                console.log("Mic job finished: resetting UI state");
                setIsRecording(false);
                recordingAudioTracks?.forEach(t => t.enabled = true);
            };

            // Use Web Speech API if on Web
            if (WebSR && !(window as any).Capacitor?.isNativePlatform?.()) {
                if (isSessionRecording) {
                    recordingAudioTracks?.forEach(t => t.enabled = false);
                }
                setIsRecording(true);
                const rec = new WebSR();
                rec.continuous = false;
                rec.interimResults = false;
                rec.lang = selectedFlag ? getSpeechLang(selectedFlag.lang) : getSpeechLang(lang);

                rec.onresult = (e: any) => {
                    const txt = e.results[0][0].transcript;
                    if (txt) chatInputRef.current?.setText(txt);
                };

                rec.onend = () => {
                    closeMicJob();
                };

                rec.onerror = (err: any) => {
                    console.error("WebSR error:", err);
                    closeMicJob();
                };

                rec.start();

                // Fallback reset after 10 seconds
                setTimeout(() => {
                    if (isRecording) closeMicJob();
                }, 10000);
                return;
            }

            // Fallback to Capacitor Plugin if Native
            const { available } = await SpeechRecognition.available();
            if (available) {
                await SpeechRecognition.requestPermissions();
                setIsRecording(true);
                const micLang = selectedFlag ? getSpeechLang(selectedFlag.lang) : getSpeechLang(lang);
                try {
                    const res: any = await SpeechRecognition.start({
                        language: micLang,
                        partialResults: false,
                        popup: false
                    });
                    if (res.matches?.length > 0) chatInputRef.current?.setText(res.matches[0]);
                } catch (err) {
                    console.error('SpeechRecognition Plugin start error', err);
                } finally {
                    closeMicJob();
                }
            } else {
                alert(lang === 'ko' ? '이 브라우저는 음성인식을 지원하지 않습니다.' : 'Speech recognition not supported.');
            }
        } catch (e) {
            console.error('Mic start error:', e);
            setIsRecording(false);
        }
    };
    // Local Video Sync
    useEffect(() => {
        if (isCameraActive && localStream && videoRef.current) {
            console.log('[Media] Binding local stream to video element');
            if (videoRef.current.srcObject !== localStream) {
                videoRef.current.srcObject = localStream;
            }
            videoRef.current.play().catch(() => { });
        }
    }, [isCameraActive, localStream, gameState]); // UI 렌더링 상태 변경인 gameState 추가하여 확실히 바인딩되도록 개선

    // Remote Video Sync
    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            console.log('[WebRTC] Binding remote stream to video element');
            if (remoteVideoRef.current.srcObject !== remoteStream) {
                remoteVideoRef.current.srcObject = remoteStream;
            }
            remoteVideoRef.current.play().catch(e => console.warn('[WebRTC] Remote play failed:', e));
        }
    }, [remoteStream, gameState]); // remoteVideoRef.current는 deps로서 작동하지 않으므로, 렌더링을 유발하는 gameState 추가

    const setupPeerConnection = async (roomId: string) => {
        if (peerConnectionRef.current) return () => { };
        console.log('[WebRTC] Setting up P2P connection for room:', roomId);

        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        // Politeness flags
        let makingOffer = false;
        let ignoreOffer = false;
        const isPolite = activeRoom?.callerId !== firebaseUser?.uid; // One side is polite, the other is not

        pc.onicecandidate = (e) => {
            if (e.candidate && firebaseUser) {
                console.log('[WebRTC] Sending ICE candidate');
                sendP2PSignaling(roomId, 'ice-candidate', firebaseUser.uid, e.candidate.toJSON());
            }
        };

        pc.ontrack = (e) => {
            console.log('[WebRTC] Remote track received:', e.track.kind);
            setRemoteStream(prevStream => {
                // 기존 스트림 유지 및 새 트랙 추가 (React 상태 업데이트 트리거를 위해 새로운 객체 생성)
                const newStream = prevStream ? new MediaStream(prevStream.getTracks()) : new MediaStream();
                
                if (e.streams && e.streams[0]) {
                    e.streams[0].getTracks().forEach(t => {
                        if (!newStream.getTracks().includes(t)) {
                            newStream.addTrack(t);
                        }
                    });
                } else if (!newStream.getTracks().includes(e.track)) {
                    newStream.addTrack(e.track);
                }
                
                return newStream;
            });
        };

        pc.onnegotiationneeded = async () => {
            try {
                if (firebaseUser) {
                    console.log('[WebRTC] Negotiation needed - creating offer');
                    makingOffer = true;
                    await pc.setLocalDescription();
                    // [Fix] .toJSON() 사용하여 RTCSessionDescription 직렬화 오류 방지
                    await sendP2PSignaling(roomId, 'offer', firebaseUser.uid, (pc.localDescription as any).toJSON());
                }
            } catch (err) {
                console.error('[WebRTC] Negotiation error:', err);
            } finally {
                makingOffer = false;
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log('[WebRTC] ICE Connection State:', pc.iceConnectionState);
            if (pc.iceConnectionState === 'failed') {
                pc.restartIce();
            }
        };

        peerConnectionRef.current = pc;

        const unsubSignaling = listenToP2PSignaling(roomId, async (signal) => {
            if (signal.senderUid === firebaseUser?.uid) return;

            try {
                if (signal.type === 'offer') {
                    const offerCollision = makingOffer || pc.signalingState !== 'stable';
                    ignoreOffer = !isPolite && offerCollision;
                    if (ignoreOffer) {
                        console.log('[WebRTC] Ignoring offer due to collision');
                        return;
                    }

                    console.log('[WebRTC] Received Offer');
                    await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
                    await pc.setLocalDescription();
                    if (firebaseUser) {
                        // [Fix] .toJSON() 사용하여 RTCSessionDescription 직렬화 오류 방지
                        await sendP2PSignaling(roomId, 'answer', firebaseUser.uid, (pc.localDescription as any).toJSON());
                        console.log('[WebRTC] Sent Answer');
                    }
                } else if (signal.type === 'answer') {
                    console.log('[WebRTC] Received Answer');
                    await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
                } else if (signal.type === 'ice-candidate') {
                    console.log('[WebRTC] Received ICE candidate');
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(signal.data));
                    } catch (err) {
                        if (!ignoreOffer) throw err;
                    }
                }
            } catch (err) {
                console.warn('[WebRTC] Signaling error:', err);
            }
        });

        return unsubSignaling;
    };

    // Track state to manage senders for replacement/removal
    const sendersRef = useRef<{ [key: string]: RTCRtpSender }>({});

    // Video element binding effect
    useEffect(() => {
        if (isCameraActive && localStream && videoRef.current) {
            console.log('[Media] Binding localStream to video element');
            if (videoRef.current.srcObject !== localStream) {
                videoRef.current.srcObject = localStream;
                videoRef.current.play().catch(e => console.warn('[Media] Autoplay failed:', e));
            }
        }
    }, [localStream, isCameraActive]);

    // Keep tracks in sync with PeerConnection
    useEffect(() => {
        const pc = peerConnectionRef.current;
        if (!pc || !isWebRTCStarted) return;

        console.log('[WebRTC] Syncing tracks. Stream active:', !!localStream);

        if (!localStream) {
            // If localStream is null, remove all senders
            Object.keys(sendersRef.current).forEach(kind => {
                try {
                    pc.removeTrack(sendersRef.current[kind]);
                    delete sendersRef.current[kind];
                    console.log(`[WebRTC] Removed track from PC: ${kind}`);
                } catch (e) { }
            });
            return;
        }

        const currentTracks = localStream.getTracks();

        // 1. Add or Replace tracks
        currentTracks.forEach(track => {
            const kind = track.kind;
            try {
                if (!sendersRef.current[kind]) {
                    // Safety check: verify if the track is already in any RtpSender
                    const alreadyAdded = pc.getSenders().some(s => s.track === track);
                    if (!alreadyAdded) {
                        console.log(`[WebRTC] Adding new track to PC: ${kind}`);
                        sendersRef.current[kind] = pc.addTrack(track, localStream);
                    } else {
                        console.log(`[WebRTC] Track ${kind} already exists in a sender, skip addTrack`);
                        const existingSender = pc.getSenders().find(s => s.track === track);
                        if (existingSender) sendersRef.current[kind] = existingSender;
                    }
                } else {
                    console.log(`[WebRTC] Replacing existing track: ${kind}`);
                    sendersRef.current[kind].replaceTrack(track);
                }
            } catch (err) {
                console.warn(`[WebRTC] Failed to sync track ${kind}:`, err);
            }
        });

        // 2. Cleanup senders whose tracks are no longer present
        Object.keys(sendersRef.current).forEach(kind => {
            const trackExists = currentTracks.some(t => t.kind === kind);
            if (!trackExists) {
                try {
                    pc.removeTrack(sendersRef.current[kind]);
                    delete sendersRef.current[kind];
                    console.log(`[WebRTC] Cleaned up inactive sender: ${kind}`);
                } catch (e) { }
            }
        });
    }, [localStream, isWebRTCStarted, peerConnectionRef.current]);



    const saveToBible = (msg: ChatMessage) => {
        setMyPhrases((prev: any[]) => {
            const newPhrase = {
                id: Date.now().toString(),
                original: msg.text,
                english: msg.translatedEn || msg.text,
                englishPronunciation: "",
                nativeTranslation: msg.localNative || (t(lang, 'saved_from_live_chat') || 'Live Chat'),
                originalPronunciation: "",
                inputLangCode: msg.originalLang || 'en',
                categoryId: 'live_chat', // Correct category to live_chat
                createdAt: new Date().toLocaleDateString(getSpeechLang(lang))
            };
            return [newPhrase, ...prev];
        });
        triggerToast(tUI(lang, 'saved_bible'));
    };

    // Matching & AI Logic 

    // Mic lock: Lock mic while AI is generating/speaking so user hears the full response
    useEffect(() => {
        if (!isAiTyping) {
            const timer = setTimeout(() => setIsMicLocked(false), 1500);
            return () => clearTimeout(timer);
        } else {
            setIsMicLocked(true);
        }
    }, [isAiTyping]);

    const handleQuickMatch = async () => {
        if (!firebaseUser || !userInfo) return;
        setIsMatching(true);
        setMatchingTimer(0);
        matchingInterval.current = setInterval(() => {
            setMatchingTimer(prev => prev + 1);
        }, 1000);

        try {
            // Find room or create new public
            const room = await requestChatRoom(firebaseUser.uid, userInfo.nickname, lang, userInfo.level, equippedSkin);
            if (room && room.status === 'ACCEPTED') {
                // Matched with someone else's room immediately
                setActiveRoom(room);
                setRivalInfo({
                    uid: room.callerId,
                    name: room.callerName,
                    nickname: room.callerName,
                    skin: room.callerSkin || 'default'
                });
                setGameState('CHAT');
                setIsMatching(false);
                if (matchingInterval.current) clearInterval(matchingInterval.current);

                // Automatically attempt to turn on camera when matched
                if (!isCameraActive) {
                    setTimeout(() => toggleCamera(), 500);
                }
            } else if (room) {
                // Created my own public room, now wait for 10s or fallback to AI
                setActiveRoom(room);
                setTimeout(async () => {
                    if (gameState !== 'CHAT') {
                        // Check if we still haven't been matched
                        const { getDoc, doc } = await import('firebase/firestore');
                        const snap = await getDoc(doc(db, 'live_chats', room.id));
                        if (snap.exists() && snap.data().status === 'PENDING') {
                            // No one joined, go AI
                            await finishChatRoom(room.id);
                            connectToAiBot();
                        }
                    }
                }, 10000);
            }
        } catch (e: any) {
            console.error("Matching error", e);
            setIsMatching(false);
            if (matchingInterval.current) clearInterval(matchingInterval.current);

            // Show alert for Quota Exceeded or other errors
            if (e?.message?.includes('Quota') || e?.code === 'resource-exhausted') {
                alert('서버 일일 사용량(Quota) 초과로 매칭을 시작할 수 없습니다. AI 모드로 즉시 연결합니다.');
                connectToAiBot();
            } else {
                const errorDetail = e.message || '알 수 없는 오류';
                alert(`매칭 오류가 발생했습니다: ${errorDetail}\n다시 시도해 주세요.`);
            }
        }
    };

    const connectToAiBot = () => {
        setIsMatching(false);
        if (matchingInterval.current) clearInterval(matchingInterval.current);

        // AI 모드로 전환하는 로직
        setPostConsentAction(() => () => {
            setIsAiMode(true);
            setActiveRoom(null);
            setGameState('CHAT');
            setRivalInfo({ uid: 'ai', name: 'VocaBot (AI)', nickname: 'VocaBot', skin: 'robot' });
            setMessages([]);
            conversationHistory.current = [];

            // AI 모드 진입 시 카메라 자동 시도 (이미 켜져 있지 않다면)
            if (!isCameraActive) {
                setTimeout(() => toggleCamera(), 500);
            }

            // 정 어영 번역
            const nativeWelcomeMap: Record<string, string> = {
                ko: '안녕하세요! 함께 영어 대화를 연습해봐요 👋',
                ja: 'こんにちは！一緒に英語の会話を練習しましょう 👋',
                zh: '你好！让我们一起练习英语对话吧 👋',
                tw: '你好！讓我們一起練習英語對話吧 👋',
                vi: 'Xin chào! Hãy cùng nhau luyện tập hội thoại tiếng Anh nhé 👋',
                en: "Nice to meet you! Let's have a great conversation!",
            };
            const welcomeEn = "Hello! Let's practice English together.";
            const welcomeNative = nativeWelcomeMap[lang] || nativeWelcomeMap['en'];

            const welcome: ChatMessage = {
                senderId: 'ai', senderName: 'VocaBot',
                text: welcomeEn,
                translatedEn: welcomeEn,
                originalLang: 'en', createdAt: null, isSystem: true,
                localNative: welcomeNative,
                showNative: true
            };
            setMessages([welcome]);
            // 영어 메시지 TTS 자동 재생
            setTimeout(() => speakText(welcomeEn, 'en-US'), 600);
        });
        setShowPreChatRecordModal(true);
    };


    // JSON강건게 싱는 퍼
    const safeParseJson = (text: string): any => {
        if (!text) return null;
        // 1) 마크운 코드블록 거
        let cleaned = text.replace(/```(:json)?.[\s\S]*?```/g, t => t.replace(/```(:json)|```/g, '').trim());
        // 2) 첫 번째 { ... } 블록 추출 (greedy하해 balanced bracket 색)
        let depth = 0, start = -1, end = -1;
        for (let i = 0; i < cleaned.length; i++) {
            if (cleaned[i] === '{') { if (depth === 0) start = i; depth++; }
            else if (cleaned[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
        }
        if (start >= 0 && end >= 0) {
            try { return JSON.parse(cleaned.slice(start, end + 1)); } catch (_) { }
        }
        // 3) 체 스로 도
        try { return JSON.parse(cleaned.trim()); } catch (_) { }
        return null;
    };

    const getAiResponse = async (userEnglishText: string) => {
        const userSavedKey = localStorage.getItem('vq_gemini_key');
        const activeKey = getActiveApiKey(userSavedKey, isPremium, aiUsage);

        if (!activeKey) {
            setShowApiModal(true);
            return;
        }
        if (!firebaseUser) return;

        // 사용 성공 시점에 카운트 증가
        if (incrementAiUsage) incrementAiUsage();
        setIsAiTyping(true);
        const langMap: any = { ko: 'Korean', en: 'English', ja: 'Japanese', zh: 'Mandarin Chinese', vi: 'Vietnamese', tw: 'Traditional Chinese' };
        const myLang = langMap[lang] || 'Korean';

        // 멀턴 해 스리용메지 추
        conversationHistory.current.push({
            role: 'user',
            parts: [{ text: userEnglishText }]
        });

        try {
            const userLevelNum = userInfo?.level || 1;
            const cefr = getCefrFromLevel(userLevelNum);
            const cefrDesc = getCefrDescription(cefr);

            // AI 프롬프트 구성 (CEFR 기반 가변형)
            const systemPrompt = `You are VocaBot, a supportive and intelligent English conversation assistant. 
Your goal is to help the user practice English naturally based on their current skills.

--- LEARNER PROFILE ---
Target Level: ${cefr} (${cefrDesc})
Tone: Encouraging, concise, and helpful.
Content Strategy: Strictly use vocabulary and grammar suitable for ${cefr} level.
For B1-C2 users, introduce one slightly more advanced synonym or idiomatic expression per turn.
-----------------------

Respond in 1-3 sentences. Stay in character as a helpful friend.
Always respond in this EXACT JSON format (no markdown, no preamble):
{"en": "English response", "nat": "${myLang} translation", "suggestion": "Suggested English response for the USER'S next turn", "suggestionNative": "Translation of the suggestion in ${myLang}"}`;

            // 번째 이스메지 prepend
            const contents = conversationHistory.current.length === 1
                ? [
                    { role: 'user', parts: [{ text: systemPrompt }] },
                    { role: 'model', parts: [{ text: '{"en": "Hello! Let\'s practice English together. What would you like to talk about", "nat": "녕세함께 어 대화습봐무엇야기하으요"}' }] },
                    ...conversationHistory.current
                ]
                : conversationHistory.current;

            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${LIGHTWEIGHT_MODEL}:generateContent?key=${activeKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents,
                        generationConfig: {
                            temperature: 0.85,
                            maxOutputTokens: 300,
                            responseMimeType: 'text/plain'
                        }
                    })
                }
            );

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                console.error('Gemini API error:', res.status, errData);
                throw new Error(`API ${res.status}: ${errData?.error?.message || 'Unknown error'}`);
            }

            const data = await res.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            console.log('[VocaBot raw]', rawText);

            let enReply = '';
            let natReply = '';

            const parsed = safeParseJson(rawText);
            if (parsed && parsed.en) {
                enReply = parsed.en;
                natReply = parsed.nat || '';
            } else {
                enReply = rawText.replace(/[{}"\n\\\\]/g, '').trim() || 'Could you tell me more about that';
                natReply = '';
            }

            conversationHistory.current.push({
                role: 'model',
                parts: [{ text: rawText }]
            });

            if (conversationHistory.current.length > 20) {
                conversationHistory.current = conversationHistory.current.slice(-20);
            }

            const aiMsg: ChatMessage = {
                id: `ai_${Date.now()}`,
                senderId: 'ai', senderName: 'VocaBot',
                text: enReply,
                translatedEn: enReply,
                originalLang: 'en',
                createdAt: null,
                localNative: natReply,
                suggestion: parsed?.suggestion || null,
                suggestionNative: parsed?.suggestionNative || null,
                showNative: !!natReply
            };
            setMessages(prev => [...prev, aiMsg]);

            if (enReply) await speakText(enReply, 'en-US');

        } catch (e: any) {
            console.error('AI response error:', e);
            const errMsg: ChatMessage = {
                id: `err_${Date.now()}`,
                senderId: 'ai', senderName: 'VocaBot',
                text: `️ ${e?.message || 'Connection error. Please try again.'}`,
                translatedEn: `️ ${e?.message || 'Connection error. Please try again.'}`,
                originalLang: 'en', createdAt: null
            };
            setMessages(prev => [...prev, errMsg]);
            conversationHistory.current.pop();
        } finally {
            setIsAiTyping(false);
        }
    };

    const handleSendMessage = async (explicitText?: string) => {
        const textToSend = (explicitText || chatInputRef.current?.getText() || '').trim();
        if (!textToSend) return;

        if (!isSafeText(textToSend)) {
            setBlockedMsgWarning(true);
            setTimeout(() => setBlockedMsgWarning(false), 4000);
            return;
        }

        processAndSendMessage(textToSend);
    };

    const handleManualGuideRequest = async () => {
        if (isManualLoading) return;

        // 대화 상대의 마지막 메시지 찾기 (시스템 메시지 제외)
        const lastMsg = [...messages].reverse().find(m => !m.isSystem && m.senderId !== firebaseUser?.uid);
        if (!lastMsg) {
            triggerToast(lang === 'ko' ? '대화 상대의 마지막 메시지가 없습니다.' : 'No message from opponent yet.');
            return;
        }

        const userSavedKey = localStorage.getItem('vq_gemini_key');
        const activeKey = getActiveApiKey(userSavedKey, isPremium, aiUsage);

        if (!activeKey) {
            setShowApiModal(true);
            return;
        }

        setIsManualLoading(true);

        try {
            const scenario = activeRoom?.scenario || 'General English Conversation';
            const myRole = activeRoom?.callerId === firebaseUser?.uid ? activeRoom?.callerRole : activeRoom?.receiverRole;
            const oppRole = activeRoom?.callerId === firebaseUser?.uid ? activeRoom?.receiverRole : activeRoom?.callerRole;

            const langMap: any = { ko: 'Korean', en: 'English', ja: 'Japanese', zh: 'Mandarin Chinese', vi: 'Vietnamese', tw: 'Traditional Chinese' };
            const myLang = langMap[lang] || 'Korean';

            const systemPrompt = `You are an English conversation helper for a language learning app.
            Context: Role-play scenario.
            Scenario: ${scenario}
            My Role: ${myRole}
            Opponent Role: ${oppRole}
            Last Opponent Message: "${lastMsg.text}"

            ⚠️ CRITICAL: Your suggested response MUST be A2 level English.
            A2 level = short, simple sentences with basic everyday words.
            Good A2 examples: "I see. What do you need?" / "Sure, I can help." / "That is a good idea." / "Can you say that again?"
            BAD (too hard): "I was just wondering because you seem like someone who..." ← Do NOT do this.
            
            Suggest ONE simple A2 English sentence for me to say next.
            Respond strictly in this JSON format:
            {"en": "Simple A2 English sentence", "nat": "${myLang} translation"}`;

            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${LIGHTWEIGHT_MODEL}:generateContent?key=${activeKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
                        generationConfig: {
                            temperature: 0.8,
                            maxOutputTokens: 250,
                            responseMimeType: 'text/plain'
                        }
                    })
                }
            );

            if (!res.ok) throw new Error('API failure');

            const data = await res.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const parsed = safeParseJson(rawText);

            if (parsed && parsed.en) {
                setManualSuggestion(parsed.en);
                setManualSuggestionNative(parsed.nat || parsed[lang] || parsed.ko || '');
            } else {
                setManualSuggestion(rawText.replace(/[{}"\n\\\\]/g, '').trim());
            }
        } catch (e) {
            console.error('Manual Guide Error', e);
            triggerToast(lang === 'ko' ? '가이드 생성 중 오류가 발생했습니다.' : 'Error generating guide.');
        } finally {
            setIsManualLoading(false);
        }
    };

    const amICaller = useCallback(() => activeRoom?.callerId === firebaseUser?.uid, [activeRoom, firebaseUser]);

    // Watch opponent consent changes in real-time via room status listener
    useEffect(() => {
        if (gameState !== 'CHAT' || !activeRoom) return;
        const iAmCaller = amICaller();

        return listenToChatRoomStatus(activeRoom.id, (room) => {
            if (!room) return;
            const myConsent = iAmCaller ? room.callerRecordingConsent : room.receiverRecordingConsent;
            const theirConsent = iAmCaller ? room.receiverRecordingConsent : room.callerRecordingConsent;

            setOpponentRecordingConsent(theirConsent || null);

            // Someone requested recording and it wasn't me
            if (activeRoom && room.recordingRequesterId && room.recordingRequesterId !== firebaseUser?.uid) {
                if (theirConsent === 'requested' && myConsent === undefined) {
                    setIncomingRecordingRequest(true);
                }
            }

            // Both accepted start recording
            if (room.callerRecordingConsent === 'accepted' && room.receiverRecordingConsent === 'accepted') {
                if (!isSessionRecording) {
                    startActualRecording();
                }
            }

            // Either declined
            if (theirConsent === 'declined' || myConsent === 'declined') {
                if (isSessionRecording) stopActualRecording(true);
                setRecordingStatus('declined');
                setIncomingRecordingRequest(false);
                setTimeout(() => setRecordingStatus('idle'), 3000);
            }

            // Requester's my own consent shows as 'requested' + opponent accepted
            if (myConsent === 'requested' && theirConsent === 'accepted') {
                // Respond with my own accepted
                respondToRecording(activeRoom.id, true, iAmCaller).then(() => { });
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState, activeRoom?.id]);

    const handleRequestRecording = async () => {
        if (isAiMode) {
            if (recordingStatus === 'recording') {
                handleStopRecording();
            } else {
                startActualRecording();
            }
            return;
        }
        if (!activeRoom || !firebaseUser) return;
        setRecordingStatus('requesting');
        // Set my own consent to 'requested' and signal the room
        await requestRecording(activeRoom.id, firebaseUser.uid, amICaller());
        setRecordingStatus('waiting');
    };

    const handleRespondRecording = async (accept: boolean) => {
        if (!activeRoom || !firebaseUser) return;
        setIncomingRecordingRequest(false);
        if (accept) {
            // Set my consent to accepted; if other already accepted, both are set
            await respondToRecording(activeRoom.id, true, amICaller());
            setRecordingStatus('recording');
        } else {
            await respondToRecording(activeRoom.id, false, amICaller());
            setRecordingStatus('idle');
        }
    };

    const startActualRecording = async () => {
        if (isSessionRecording) return;
        try {
            // 전체 화면 녹화 (Display Media) 요청
            const nav = navigator.mediaDevices as any;
            if (!nav.getDisplayMedia) {
                alert(lang === 'ko' ? "기기에서 전체 화면 녹화를 지원하지 않습니다." : "Screen recording not supported on this device.");
                return;
            }

            // 1. 화면 캡처 트랙 (비디오 + 시스템 오디오)
            const screenStream = await nav.getDisplayMedia({
                video: { cursor: "always" },
                audio: true
            });

            // 2. 목소리 (마이크 트랙)
            let micStream: MediaStream | null = null;
            try {
                micStream = await navigator.mediaDevices.getUserMedia({
                    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
                });
            } catch (err) {
                console.warn("Microphone access failed for screen recording", err);
            }

            // 3. 트랙 합치기 (화면 비디오 + 마이크 오디오 + 시스템 오디오 + 상대방 오디오)
            const tracks = [...screenStream.getVideoTracks()];

            // Audio Context for mixing
            const audioCtx = new AudioContext();
            const destination = audioCtx.createMediaStreamDestination();

            // Source 1: Local Mic
            if (micStream) {
                const micSource = audioCtx.createMediaStreamSource(micStream);
                micSource.connect(destination);
            }

            // Source 2: System/Screen Audio (if available)
            if (screenStream.getAudioTracks().length > 0) {
                const screenAudioSource = audioCtx.createMediaStreamSource(new MediaStream([screenStream.getAudioTracks()[0]]));
                screenAudioSource.connect(destination);
            }

            // Source 3: Remote Audio (Critical for P2P recording)
            if (remoteStream && remoteStream.getAudioTracks().length > 0) {
                const remoteAudioSource = audioCtx.createMediaStreamSource(remoteStream);
                remoteAudioSource.connect(destination);
            }

            // Combine screen video with mixed audio
            const mixedAudioTracks = destination.stream.getAudioTracks();
            const combinedStream = new MediaStream([
                ...tracks,
                ...mixedAudioTracks
            ]);

            recordedChunksRef.current = [];

            // 안드로이드 환경을 위해 mimeType 체크
            let options: any = { mimeType: 'video/webm;codecs=vp8,opus' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: 'video/webm' };
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    options = { mimeType: 'video/mp4' };
                }
            }

            const mr = new MediaRecorder(combinedStream, options);
            mr.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };

            // 브라우저 녹화 UI에서 '공유 중'처리
            screenStream.getVideoTracks()[0].onended = () => {
                if (isSessionRecording) stopActualRecording();
            };

            mr.start(1000);

            mediaRecorderRef.current = mr;
            setIsSessionRecording(true);
            setRecordingStatus('recording');

            // Timer
            const start = Date.now();
            recordingTimerRef.current = window.setInterval(() => setRecordingTimeMs(Date.now() - start), 1000);
        } catch (e: any) {
            console.warn('Screen recording start failed:', e);
            if (e.name !== 'NotAllowedError') { // 사용자가 취소한 게 아니면 알림
                alert(lang === 'ko' ? `녹화 시작 실패: ${e?.message || 'Error'}` : `Failed to start: ${e?.message || 'Error'}`);
            }
            setRecordingStatus('idle');
        }
    };

    const stopActualRecording = async (cancelled = false) => {
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        setIsSessionRecording(false);
        setRecordingStatus('idle');
        const durationSec = Math.round(recordingTimeMs / 1000);
        setRecordingTimeMs(0);

        const mr = mediaRecorderRef.current;
        if (!mr || mr.state === 'inactive') return;

        await new Promise<void>(resolve => {
            mr.onstop = () => resolve();
            mr.stop();
        });
        mr.stream.getTracks().forEach(t => t.stop());
        mediaRecorderRef.current = null;

        if (cancelled || recordedChunksRef.current.length === 0) return;

        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        recordedChunksRef.current = [];
        const id = Date.now().toString();
        const fileName = `VocaQuest_Chat_${new Date().toISOString().slice(0, 10)}_${id.slice(-4)}.webm`;

        const isNativeApp = typeof (window as any).Capacitor !== 'undefined' && (window as any).Capacitor.isNativePlatform?.();

        if (isNativeApp) {
            try {
                const { Filesystem, Directory } = await import('@capacitor/filesystem');
                const base64 = await new Promise<string>((res, rej) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result;
                        if (typeof result === 'string') {
                            res(result.split(',')[1]);
                        } else {
                            rej(new Error('Failed to read as Base64 string'));
                        }
                    };
                    reader.onerror = rej;
                    reader.readAsDataURL(blob);
                });
                await Filesystem.writeFile({
                    path: fileName,
                    data: base64,
                    directory: Directory.Documents,
                    recursive: true,
                });
                alert(lang === 'ko' ? `대화가 [Documents] 저장되었습니다!\n일${fileName}` : `Video saved to [Documents] folder!\nFile: ${fileName}`);
            } catch (e) {
                console.warn('[Recording] Android save failed:', e);
                alert(lang === 'ko' ? '에 실패했습니다. 공간 권한을 확인해 주세요.' : 'Save failed. Please check storage permissions.');
            }
        } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 5000);
        }

        const transcript = messages.map(m => `[${m.senderName}] ${m.translatedEn}${m.text !== m.translatedEn ? ` (${m.text})` : ''}`).join('\n');

        const entry = {
            id,
            fileName,
            date: new Date().toLocaleString(),
            duration: durationSec,
            scenario: activeRoom?.scenario || (isAiMode ? 'AI Bot' : 'Free Chat'),
            myRole: activeRoom ? (activeRoom.callerId === firebaseUser.uid ? activeRoom.callerRole : activeRoom.receiverRole) : 'Student',
            rival: rivalInfo?.name || 'VocaBot',
            transcript,
        };

        setSavedRecordings(prev => {
            const next = [entry, ...prev];
            localStorage.setItem('vq_recordings', JSON.stringify(next));
            return next;
        });

        if (activeRoom) await cancelRecordingConsent(activeRoom.id);
    };

    const handleStopRecording = async () => {
        await stopActualRecording(false);
    };

    const formatRecordingTime = (ms: number) => {
        const s = Math.floor(ms / 1000);
        return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    };

    return (
        <div className="w-full flex-1 bg-[#0A0A0E] flex flex-col overflow-hidden font-sans sm:rounded-[32px] sm:shadow-2xl">
            {/* LOBBY */}
            {/* LOBBY */}
            {gameState === 'LOBBY' && (
                <div className="flex-1 flex flex-col bg-[#0A0A0E] relative overflow-hidden">
                    {/* Header */}
                    <header className="px-6 pt-[calc(16px+env(safe-area-inset-top,24px))] pb-4 flex flex-col gap-4 border-b border-white/5 bg-[#12121A] z-20">
                        <div className="flex items-center justify-between">
                            <button onClick={() => {
                                if (waitingRoomId || activeRoom) {
                                    setOnExitAction(() => () => {
                                        handleCancelMatching();
                                        setScreen('HOME');
                                    });
                                    setShowExitConfirm(true);
                                } else {
                                    setScreen('HOME');
                                }
                            }}
                                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 active:bg-white/10 transition-colors">
                                <X size={20} />
                            </button>
                            <h2 className="text-emerald-500 font-black tracking-tighter text-xl italic uppercase">VQ LIVE</h2>
                            <button onClick={() => setShowRecordings(true)}
                                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 relative">
                                <Play size={18} />
                                {savedRecordings.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full text-[9px] text-white font-black flex items-center justify-center">{savedRecordings.length}</span>}
                            </button>
                        </div>
                        {/* Language Selector in Lobby */}
                        <div className="flex items-center justify-center gap-3 py-1 overflow-x-auto no-scrollbar">
                            {FLAGS.map(f => (
                                <button
                                    key={f.code}
                                    onClick={() => {
                                        setLang(f.lang);
                                        setSelectedFlag(f);
                                    }}
                                    className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${lang === f.lang ? 'border-emerald-400 scale-110 shadow-lg shadow-emerald-500/20' : 'border-white/10 grayscale opacity-60'}`}
                                >
                                    <img src={`https://flagcdn.com/w80/${f.code.toLowerCase()}.png`} className="w-full h-full object-cover" alt={f.label} />
                                </button>
                            ))}
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto pb-24">
                        {/* Hero Section */}
                        <div className="bg-[#12121A] px-6 pt-6 pb-12 rounded-b-[40px] border-b border-white/5 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-[30px] flex items-center justify-center text-4xl border border-emerald-500/20 shadow-lg mb-4">
                                {SKIN_EMOJI[equippedSkin] || ''}
                            </div>
                            <h1 className="text-2xl font-black text-white mb-1 tracking-tight">{tUI(lang, 'title')}</h1>
                            <p className="text-slate-500 font-bold text-xs mb-8 uppercase tracking-widest">{tUI(lang, 'subtitle')}</p>

                            <button
                                onClick={handleQuickMatch}
                                className="w-full max-w-sm py-5 bg-emerald-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                            >
                                <Zap size={22} fill="white" className="group-hover:animate-bounce" />
                                {tUI(lang, 'quick_match')}
                                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                            </button>

                            <div className="mt-6 flex items-center gap-2 text-slate-600 font-black text-[10px] uppercase tracking-widest">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                {tUI(lang, 'auto_trans')}
                            </div>
                        </div>


                        {/* Incoming Request Alert */}
                        {incomingRequest && (
                            <div className="mx-6 mt-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-5 flex items-center justify-between animate-bounce shadow-lg">
                                <div className="flex items-center gap-3">
                                    <div className="text-2xl"></div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-500 uppercase">{tUI(lang, 'chat_req')}</p>
                                        <p className="text-sm font-black text-white">{incomingRequest.callerName}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleDeclineRequest}
                                        className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black text-slate-400">{tUI(lang, 'decline')}</button>
                                    <button onClick={handleAcceptRequest}
                                        className="px-4 py-2 bg-emerald-500 rounded-xl text-[10px] font-black text-white">{tUI(lang, 'accept')}</button>
                                </div>
                            </div>
                        )}

                        {/* Tabs Navigation */}
                        <div className="px-6 mt-8 mb-6">
                            <div className="flex bg-white/5 p-1.5 rounded-[24px] gap-1">
                                <button
                                    onClick={() => setLobbyTab('public_rooms')}
                                    className={`flex-1 py-3 px-2 rounded-2xl text-[11px] font-black transition-all flex items-center justify-center gap-2 ${lobbyTab === 'public_rooms' ? 'bg-[#1E1E2C] text-emerald-400 shadow-lg border border-white/5' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <MessageSquare size={14} />
                                    {tUI(lang, 'tab_roleplay')}
                                </button>
                                <button
                                    onClick={() => setLobbyTab('online')}
                                    className={`flex-1 py-3 px-2 rounded-2xl text-[11px] font-black transition-all flex items-center justify-center gap-2 ${lobbyTab === 'online' ? 'bg-[#1E1E2C] text-emerald-400 shadow-lg border border-white/5' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <Wifi size={14} />
                                    {tUI(lang, 'tab_online')}
                                </button>
                                <button
                                    onClick={() => setLobbyTab('search')}
                                    className={`flex-1 py-3 px-2 rounded-2xl text-[11px] font-black transition-all flex items-center justify-center gap-2 ${lobbyTab === 'search' ? 'bg-[#1E1E2C] text-emerald-400 shadow-lg border border-white/5' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <Search size={14} />
                                    {tUI(lang, 'tab_search')}
                                </button>
                            </div>
                        </div>

                        {/* Tab Content: Public Rooms */}
                        {lobbyTab === 'public_rooms' && (
                            <div className="px-6 space-y-4">
                                <button
                                    onClick={() => setGameState('CREATE_ROOM')}
                                    className="w-full py-4 bg-[#1E1E2C] border border-emerald-500/20 rounded-2xl text-emerald-400 font-black text-xs flex items-center justify-center gap-2 hover:bg-emerald-500/10 transition-all"
                                >
                                    <Zap size={14} fill="currentColor" />
                                    {tUI(lang, 'create_room_btn')}
                                </button>

                                {publicRooms.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <p className="text-slate-600 font-black text-sm">{tUI(lang, 'no_active_rooms')}</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3">
                                        {publicRooms.map(room => {
                                            const isPending = room.status === 'PENDING';
                                            return (
                                                <div key={room.id}
                                                    className={`p-5 rounded-[30px] flex items-center justify-between transition-all border ${isPending ? 'bg-[#12121A] border-white/5 hover:border-emerald-500/30 cursor-pointer active:scale-95' : 'bg-white/5 border-white/5 opacity-60'}`}
                                                    onClick={() => isPending && handleJoinPublicRoom(room)}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${isPending ? 'bg-white/5' : 'bg-black/20 grayscale'}`}>
                                                            {SKIN_EMOJI[room.callerSkin as keyof typeof SKIN_EMOJI] || '👤'}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-[10px] font-black uppercase ${isPending ? 'text-emerald-500' : 'text-slate-500'}`}>
                                                                    {room.scenarioId === 'custom' && room.scenario
                                                                        ? `✏️ ${room.scenario}`
                                                                        : ((PRESET_SCENARIOS.find(p => p.id === room.scenarioId)?.label as any)?.[lang] || room.scenario || 'Free Chat')}
                                                                </span>
                                                                {!isPending && (
                                                                    <span className="text-[8px] font-black text-rose-400 border border-rose-500/20 bg-rose-500/10 px-1 py-0.5 rounded">
                                                                        {lang === 'ko' ? '진행중' : 'ONGOING'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className={`text-sm font-black ${isPending ? 'text-white' : 'text-slate-400'}`}>{room.callerName}</p>
                                                        </div>
                                                    </div>
                                                    {isPending ? (
                                                        <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs shadow-lg shadow-emerald-500/20 uppercase tracking-tighter">
                                                            {lang === 'ko' ? '대기중' : 'WAITING'}
                                                        </button>
                                                    ) : (
                                                        <button disabled className="px-4 py-2.5 bg-white/5 text-slate-500 rounded-xl font-black text-xs uppercase tracking-tighter shrink-0">
                                                            {lang === 'ko' ? '대화중' : 'IN CHAT'}
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab Content: Online Users */}
                        {lobbyTab === 'online' && (
                            <div className="px-6 space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{tUI(lang, 'online_users')}</p>
                                    <button onClick={loadOnlineUsers}
                                        className={`text-slate-500 ${isLoadingOnline ? 'animate-spin' : ''}`}>
                                        <RefreshCw size={14} />
                                    </button>
                                </div>

                                {onlineUsers.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <p className="text-slate-600 font-black text-sm">{tUI(lang, 'no_users_online')}</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-3">
                                        {onlineUsers.map(u => (
                                            <div key={u.uid}
                                                className="bg-[#12121A] border border-white/5 p-4 rounded-[30px] flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 bg-white/5 rounded-2xl flex items-center justify-center text-2xl">
                                                        {SKIN_EMOJI[u.skin] || ''}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-white">{u.nickname}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold">Level {u.level || 1}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => startChatMatching(u)}
                                                    className="px-5 py-2.5 bg-white/5 text-emerald-400 border border-emerald-500/20 rounded-xl font-black text-xs active:scale-95 transition-all"
                                                >
                                                    {tUI(lang, 'chat_btn')}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab Content: Search */}
                        {lobbyTab === 'search' && (
                            <div className="px-6 space-y-6">
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-[#12121A] border border-white/5 rounded-2xl flex items-center px-4 focus-within:border-emerald-500/30 transition-all">
                                        <Search size={18} className="text-slate-500" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                            placeholder={tUI(lang, 'username_placeholder')}
                                            className="flex-1 bg-transparent py-4 px-3 text-sm font-bold text-white outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleSearch}
                                        disabled={isSearching}
                                        className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {isSearching ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
                                    </button>
                                </div>

                                {searchResult && (
                                    <div className="space-y-3">
                                        {searchResult.length === 0 ? (
                                            <div className="flex flex-col items-center py-10 gap-2">
                                                <UserX size={40} className="text-slate-800" />
                                                <p className="text-slate-600 font-black text-sm">{tUI(lang, 'not_found')}</p>
                                            </div>
                                        ) : (
                                            searchResult.map(u => (
                                                <div key={u.uid}
                                                    className="bg-[#12121A] border border-white/5 p-4 rounded-[30px] flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-11 h-11 bg-white/5 rounded-2xl flex items-center justify-center text-2xl">
                                                            {SKIN_EMOJI[u.skin] || ''}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-white">{u.nickname}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold">Level {u.level || 1}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => startChatMatching(u)}
                                                        className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs active:scale-95 transition-all"
                                                    >
                                                        {tUI(lang, 'chat_btn')}
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            )}

            {isMatching && (
                <div className="absolute inset-0 z-[100] bg-[#0A0A0E]/95 flex flex-col items-center justify-center p-8 text-center backdrop-blur-md animate-fade-in">
                    <div className="relative w-48 h-48 flex items-center justify-center mb-12">
                        <div className="absolute inset-0 border-8 border-white/5 rounded-full" />
                        <div className="absolute inset-0 border-8 border-emerald-500 rounded-full border-t-transparent animate-spin" />
                        <div className="text-7xl animate-pulse">
                            {isWaitingPartner ? SKIN_EMOJI[equippedSkin as keyof typeof SKIN_EMOJI] || SKIN_EMOJI.default : '⚡'}
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase mb-3">
                        {isWaitingPartner ? tUI(lang, 'waiting_partner') : 'FINDING RIVAL...'}
                    </h2>
                    <p className="text-slate-400 font-bold text-sm mb-12 uppercase tracking-widest animate-pulse">
                        {isWaitingPartner ? 'Wait for someone to join your room' : `MATCHING TIME: ${matchingTimer}s`}
                    </p>
                    <button
                        onClick={() => {
                            setOnExitAction(() => () => handleCancelMatching());
                            setShowExitConfirm(true);
                        }}
                        className="w-full py-5 bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 rounded-3xl font-black text-sm active:scale-95 transition-all"
                    >
                        {tUI(lang, 'exit')}
                    </button>
                </div>
            )}

            {/* CREATE ROOM */}
            {gameState === 'CREATE_ROOM' && (
                <div className="flex-1 flex flex-col bg-[#0A0A0E] relative overflow-hidden">
                    <header className="px-6 pt-[calc(16px+env(safe-area-inset-top,24px))] pb-4 flex items-center justify-between border-b border-white/5 bg-[#12121A]">
                        <button onClick={() => setGameState('LOBBY')}
                            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                            <X size={20} />
                        </button>
                        <h2 className="text-white font-black text-lg">{tUI(lang, 'create_room_title')}</h2>
                        <div className="w-10" />
                    </header>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Scenario Picker */}
                        <section>
                            <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 block">{tUI(lang, 'scenario')}</label>
                            <div className="grid grid-cols-2 gap-3">
                                {PRESET_SCENARIOS.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setCreateScenarioType(p.id)}
                                        className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${createScenarioType === p.id ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-[#12121A] border-white/5 text-slate-500'}`}
                                    >
                                        <p className="text-sm font-black italic">{(p.label as any)[lang] || (p.label as any)['en']}</p>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Custom Input (if selected) */}
                        {createScenarioType === 'custom' && (
                            <section className="space-y-4 animate-slide-up">
                                <input
                                    type="text"
                                    value={customScenario}
                                    onChange={(e) => setCustomScenario(e.target.value)}
                                    placeholder={tUI(lang, 'custom_scenario')}
                                    className="w-full bg-[#12121A] border border-white/10 rounded-2xl py-4 px-5 text-white font-bold"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        value={customMyRole}
                                        onChange={(e) => setCustomMyRole(e.target.value)}
                                        placeholder={tUI(lang, 'create_my_role')}
                                        className="bg-[#12121A] border border-white/10 rounded-2xl py-4 px-5 text-white font-bold text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={customOpponentRole}
                                        onChange={(e) => setCustomOpponentRole(e.target.value)}
                                        placeholder={tUI(lang, 'create_opp_role')}
                                        className="bg-[#12121A] border border-white/10 rounded-2xl py-4 px-5 text-white font-bold text-sm"
                                    />
                                </div>
                            </section>
                        )}

                        {/* Preset Roles Picker */}
                        {createScenarioType !== 'custom' && (
                            <section>
                                <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 block">{tUI(lang, 'select_my_role')}</label>
                                <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl">
                                    {PRESET_SCENARIOS.find(p => p.id === createScenarioType)?.roles.map((r, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCreateMyRole(i)}
                                            className={`flex-1 py-3 px-2 rounded-xl text-[11px] font-black transition-all ${createMyRole === i ? 'bg-[#1E1E2C] text-emerald-400 shadow-lg' : 'text-slate-500'}`}
                                        >
                                            {(r as any)[lang] || (r as any)['en']}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        <div className="pt-8">
                            <button
                                onClick={submitCreateRoom}
                                className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                {tUI(lang, 'create_btn')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CHAT ROOM */}
            {gameState === 'CHAT' && (activeRoom || isAiMode) && (
                <div className="flex flex-col h-full bg-[#0A0A0E] relative z-0">
                    <header className="px-5 pt-[calc(16px+env(safe-area-inset-top,32px))] pb-3 flex flex-col gap-3 shrink-0 border-b border-white/5 bg-[#12121A] z-20">
                        <div className="flex items-center justify-between">
                            <div className="flex-none">
                                <button onClick={() => { console.log('Exit clicked'); setOnExitAction(() => () => { if (activeRoom) finishChatRoom(activeRoom.id); handleCancelMatching(); }); setShowExitConfirm(true); }}
                                    className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-[11px] font-black flex items-center gap-2 active:scale-90 transition-all z-50">
                                    <LogOut size={14} /> <span className="hidden xs:inline">{tUI(lang, 'exit')}</span>
                                </button>
                            </div>
                            <div className="flex-1 flex flex-col items-center min-w-0">
                                <div className="max-w-full px-3 py-1 bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 overflow-hidden">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <h2 className="text-xs font-black text-white truncate max-w-[120px]">{rivalInfo?.name}</h2>
                                </div>
                                {activeRoom?.scenario && (
                                    <p className="text-[9px] font-bold text-slate-500 mt-1 truncate max-w-full px-2 uppercase tracking-tighter">
                                        {activeRoom?.scenarioId === 'custom' && activeRoom?.scenario
                                            ? `✏️ ${activeRoom.scenario}`
                                            : ((PRESET_SCENARIOS.find(p => p.id === activeRoom?.scenarioId)?.label as any)?.[lang] || activeRoom?.scenario)}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {/* Recordings list button */}
                                <button onClick={() => setShowRecordings(true)}
                                    className="w-10 h-10 rounded-xl bg-white/5 text-slate-400 flex items-center justify-center relative active:scale-90 transition-all">
                                    <Play size={18} />
                                    {savedRecordings.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full text-[9px] text-white font-black flex items-center justify-center">{savedRecordings.length}</span>}
                                </button>
                                {/* Report button */}
                                {!isAiMode && (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setShowReportModal(true)}
                                            className="w-10 h-10 rounded-xl bg-white/5 text-slate-500 flex items-center justify-center active:scale-90 transition-all hover:text-rose-400"
                                            title={tUI(lang, 'safety_report_title')}
                                        >
                                            <Flag size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Video panels + recording button overlay */}
                        <div className="flex gap-2 w-full max-w-sm mx-auto h-28 relative">
                            {/* My video panel (Chick spot) */}
                            <div
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Camera area clicked');
                                    toggleCamera();
                                }}
                                className="flex-1 rounded-2xl bg-[#12121A] overflow-hidden border border-white/10 relative flex items-center justify-center cursor-pointer hover:border-emerald-500/30 transition-all z-20"
                            >
                                {isCameraActive && localStream ? (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center flex-col text-center group-hover:scale-105 transition-transform bg-[#12121A]">
                                        <div className="text-3xl mb-1">{SKIN_EMOJI[equippedSkin as keyof typeof SKIN_EMOJI] || SKIN_EMOJI.default}</div>
                                        <p className="text-[8px] font-black text-white/30 truncate px-1 uppercase tracking-tighter">
                                            {lang === 'ko' ? '탭하여 카메라 켜기' : 'TAP TO ON CAMERA'}
                                        </p>
                                        <div className="mt-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[7px] text-emerald-400 font-black animate-pulse">
                                            {lang === 'ko' ? '카메라 재시도' : 'RETRY CAMERA'}
                                        </div>
                                    </div>
                                )}
                                <div className="absolute bottom-1 right-2 bg-black/60 px-1.5 rounded-md text-[8px] text-white">Me</div>
                                {activeRoom?.scenario && (
                                    <div className="absolute top-2 left-2 bg-indigo-600/80 px-1.5 py-0.5 rounded text-[8px] text-white font-black">
                                        {(() => {
                                            const preset = PRESET_SCENARIOS.find(p => p.id === activeRoom?.scenarioId);
                                            if (preset && preset.id !== 'custom' && typeof activeRoom?.callerRoleIdx === 'number' && typeof activeRoom?.receiverRoleIdx === 'number') {
                                                const uid = firebaseUser?.uid;
                                                const idx = activeRoom.callerId === uid ? activeRoom.callerRoleIdx : activeRoom.receiverRoleIdx;
                                                const role = preset.roles[idx];
                                                if (role) {
                                                    return (role as any)[lang] || (role as any)['en'];
                                                }
                                            }
                                            return (activeRoom?.callerId === firebaseUser?.uid) ? activeRoom?.callerRole : activeRoom?.receiverRole;
                                        })()}
                                    </div>
                                )}
                                {/* Camera indicator */}
                                {isCameraActive && (
                                    <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]]" />
                                )}
                            </div>
                            {/* Rival panel */}
                            <div className="flex-1 rounded-2xl bg-white/5 overflow-hidden border border-white/10 relative flex items-center justify-center flex-col">
                                {/* 항상 video 태그를 DOM에 마운트해두어야 remoteStream 바인딩 타이밍 문제가 없음 */}
                                <video
                                    ref={remoteVideoRef}
                                    autoPlay
                                    playsInline
                                    muted={true}
                                    className={`w-full h-full object-cover ${remoteStream ? 'block' : 'hidden'}`}
                                />
                                {!remoteStream && (
                                    <>
                                        {isAiMode && !isWaitingPartner && (
                                            <>
                                                <img src="/ai_female_avatar.png" alt="AI Agent" className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${isAiSpeaking ? 'scale-105 opacity-90' : 'scale-100 opacity-100'}`} />
                                                {isAiSpeaking && (
                                                    <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay z-0" />
                                                )}
                                                {isAiSpeaking && (
                                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-1.5 h-10 z-10 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]">
                                                        <div className="w-1.5 bg-emerald-400 rounded-full animate-[equalizer_0.6s_ease-in-out_infinite_alternate] shadow-[0_0_8px_rgba(52,211,153,1)]" style={{ animationDelay: '0.1s' }} />
                                                        <div className="w-2 bg-emerald-400 rounded-full animate-[equalizer_0.4s_ease-in-out_infinite_alternate] shadow-[0_0_8px_rgba(52,211,153,1)]" style={{ animationDelay: '0.3s' }} />
                                                        <div className="w-2.5 bg-emerald-300 rounded-full animate-[equalizer_0.7s_ease-in-out_infinite_alternate] shadow-[0_0_12px_rgba(52,211,153,1)]" style={{ animationDelay: '0.0s' }} />
                                                        <div className="w-2 bg-emerald-400 rounded-full animate-[equalizer_0.5s_ease-in-out_infinite_alternate] shadow-[0_0_8px_rgba(52,211,153,1)]" style={{ animationDelay: '0.2s' }} />
                                                        <div className="w-1.5 bg-emerald-400 rounded-full animate-[equalizer_0.8s_ease-in-out_infinite_alternate] shadow-[0_0_8px_rgba(52,211,153,1)]" style={{ animationDelay: '0.4s' }} />
                                                    </div>
                                                )}
                                                {isAiSpeaking && (
                                                    <div className="absolute inset-0 border-[3px] border-emerald-400/70 rounded-2xl animate-pulse shadow-[inset_0_0_20px_rgba(52,211,153,0.4)] pointer-events-none z-10" />
                                                )}
                                            </>
                                        )}
                                        <div className="flex flex-col items-center gap-2 z-10">
                                            <div className={`text-3xl ${isWaitingPartner ? 'animate-pulse scale-110' : ''}`}>
                                                {isWaitingPartner ? '🔍' : (
                                                    isAiMode ? '' : (SKIN_EMOJI[rivalInfo?.skin as keyof typeof SKIN_EMOJI] || rivalInfo?.skin || '👤')
                                                )}
                                            </div>
                                            {isWaitingPartner && (
                                                <p className="text-[8px] font-black text-emerald-500 animate-pulse">WAITING...</p>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 rounded-md text-[8px] text-emerald-400 font-bold">{tUI(lang, 'translated')}</div>
                                {activeRoom?.scenario && (
                                    <div className="absolute top-1 right-1 bg-rose-600/80 px-1.5 py-0.5 rounded text-[8px] text-white font-black">
                                        {(() => {
                                            const preset = PRESET_SCENARIOS.find(p => p.id === activeRoom?.scenarioId);
                                            if (preset && preset.id !== 'custom' && typeof activeRoom?.callerRoleIdx === 'number' && typeof activeRoom?.receiverRoleIdx === 'number') {
                                                const uid = firebaseUser?.uid;
                                                const idx = activeRoom.callerId === uid ? activeRoom.receiverRoleIdx : activeRoom.callerRoleIdx;
                                                const role = preset.roles[idx];
                                                if (role) {
                                                    return (role as any)[lang] || (role as any)['en'];
                                                }
                                            }
                                            return (activeRoom?.callerId === firebaseUser?.uid) ? activeRoom?.receiverRole : activeRoom?.callerRole;
                                        })()}
                                    </div>
                                )}
                                {/* Mic lock indicator */}
                                {isMicLocked && (
                                    <div className="absolute top-1 left-1 bg-rose-600/80 px-1.5 py-0.5 rounded text-[8px] text-white font-black flex items-center gap-0.5">
                                        🗣️ 🗣️ Speaking...
                                    </div>
                                )}
                            </div>

                            {/* 8. Recording button centered above video panels */}
                            <button
                                onClick={recordingStatus === 'idle' ? handleRequestRecording : recordingStatus === 'recording' ? handleStopRecording : undefined}
                                disabled={recordingStatus === 'waiting' || recordingStatus === 'declined'}
                                className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-lg transition-all ${recordingStatus === 'recording' ? 'bg-rose-600 border-rose-500 animate-pulse' : 'bg-black/40 border-white/20 hover:bg-black/60 backdrop-blur-md'}`}
                            >
                                {recordingStatus === 'recording'
                                    ? <><StopCircle size={11} className="text-white" /> <span className="text-[9px] font-black text-white">{formatRecordingTime(recordingTimeMs)}</span></>
                                    : recordingStatus === 'waiting'
                                        ? <><Clock size={11} className="text-indigo-300" /> <span className="text-[9px] font-black text-indigo-300">WAITING</span></>
                                        : <><Video size={11} className="text-white" /> <span className="text-[9px] font-black text-white">REC</span></>
                                }
                            </button>
                        </div>
                    </header>

                    {/* Recording consent banners */}
                    {/* 1. I requested, waiting for opponent */}
                    {recordingStatus === 'waiting' && (
                        <div className="mx-5 mt-3 bg-indigo-900/40 border border-indigo-500/30 rounded-2xl px-4 py-3 flex items-center gap-3 shrink-0">
                            <Video size={16} className="text-indigo-400 animate-pulse shrink-0" />
                            <p className="text-[11px] font-black text-indigo-300 flex-1">{lang === 'ko' ? '상대방의 대화 의기다리는 ?..' : 'Waiting for partner consent...'}</p>
                            <button onClick={async () => { if (activeRoom) await cancelRecordingConsent(activeRoom.id); setRecordingStatus('idle'); }}
                                className="text-[10px] font-black text-slate-400 underline">{lang === 'ko' ? '취소' : 'Cancel'}</button>
                        </div>
                    )}
                    {/* 2. Opponent requested I need to respond */}
                    {incomingRecordingRequest && recordingStatus === 'idle' && (
                        <div className="mx-5 mt-3 bg-amber-900/40 border border-amber-500/30 rounded-2xl px-4 py-3 flex items-center gap-3 shrink-0">
                            <Video size={16} className="text-amber-400 shrink-0" />
                            <p className="text-[11px] font-black text-amber-300 flex-1">{lang === 'ko' ? '방이 대화청습다. 의겠습까' : 'Partner wants to record. Consent?'}</p>
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => handleRespondRecording(false)}
                                    className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-[10px] font-black active:scale-90">{lang === 'ko' ? '거절' : 'No'}</button>
                                <button onClick={() => handleRespondRecording(true)}
                                    className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-[10px] font-black active:scale-90">{lang === 'ko' ? '의' : 'Yes'}</button>
                            </div>
                        </div>
                    )}
                    {/* 3. Declined */}
                    {recordingStatus === 'declined' && (
                        <div className="mx-5 mt-3 bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3 flex items-center gap-3 shrink-0">
                            <VideoOff size={14} className="text-slate-400 shrink-0" />
                            <p className="text-[11px] font-black text-slate-400">{lang === 'ko' ? '대화가 거절었니' : 'Recording declined.'}</p>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-5 scroll-smooth space-y-6">
                        <div className="text-center my-4">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">{tUI(lang, 'chat_started')}</span>
                        </div>

                        {messages.map((msg, i) => {
                            const isMine = msg.senderId === firebaseUser?.uid;
                            const isAiMsg = msg.senderId === 'ai';
                            return (
                                <div key={msg.id || i}
                                    className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                        <div className={`px-5 py-4 rounded-[24px] shadow-sm relative ${isMine ? 'bg-emerald-600 text-white rounded-br-sm'
                                            : isAiMsg ? 'bg-[#1A1A2E] text-slate-200 border border-indigo-500/20 rounded-bl-sm'
                                                : 'bg-[#1E1E2C] text-slate-200 border border-white/5 rounded-bl-sm'
                                            }`}>

                                            {/* 1. Primary English Text (Large) */}
                                            <div className="flex items-start gap-2 mb-1">
                                                <div className="flex-1">
                                                    <p className="text-[16px] font-black leading-tight tracking-tight">
                                                        {msg.translatedEn || msg.text}
                                                        {isMine && msg.isPerfect && msg.originalLang === 'en' && (
                                                            <span className="ml-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 animate-pulse align-middle">
                                                                {tUI(lang, 'perfect_match')}
                                                            </span>
                                                        )}
                                                    </p>

                                                    {/* 2. Secondary Original Text (Always for ME, Toggle for Opponent) */}
                                                    {msg.translatedEn && msg.translatedEn !== msg.text && (
                                                        isMine ? (
                                                            <p className="text-[11px] font-bold text-white/40 mt-1 border-l-2 border-white/10 pl-2 italic leading-tight">
                                                                {msg.text}
                                                            </p>
                                                        ) : (
                                                            msg.showOriginal ? (
                                                                <p className="text-[11px] font-bold text-slate-500 mt-1 border-l-2 border-slate-700 pl-2 italic leading-tight animate-fade-in">
                                                                    {msg.text}
                                                                </p>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setMessages(prev => prev.map(m => (m.id && m.id === msg.id) || (!m.id && m.text === msg.text && m.createdAt === msg.createdAt) ? { ...m, showOriginal: true } : m)); }}
                                                                    className="text-[10px] font-bold text-slate-500 mt-1 flex items-center gap-1 opacity-60 hover:opacity-100 transition-all underline decoration-dotted"
                                                                >
                                                                    <MessageSquare size={10} /> {lang === 'ko' ? '원문 보기' : 'Show Original'}
                                                                </button>
                                                            )
                                                        )
                                                    )}
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleSpeak(msg.translatedEn || msg.text); }}
                                                    className="p-1 text-white/40 hover:text-white transition-colors self-start mt-0.5"
                                                >
                                                    <Volume2 size={15} />
                                                </button>
                                            </div>

                                            {/* 4. Native Translation (Click to See) */}
                                            <div className="mt-2 pt-2 border-t border-white/10">
                                                {msg.localNative && msg.showNative ? (
                                                    <div className="text-[13px] font-black text-white bg-black/20 p-2 rounded-xl border border-white/5 animate-fade-in">
                                                        {msg.localNative}
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={async (e) => {
                                                            e.stopPropagation();
                                                            if (msg.localNative) {
                                                                setMessages(prev => prev.map(m => (m.id && m.id === msg.id) || (!m.id && m.text === msg.text && m.createdAt === msg.createdAt) ? { ...m, showNative: true } : m));
                                                                return;
                                                            }
                                                            const userSavedKey = localStorage.getItem('vq_gemini_key');
                                                            const activeKey = getActiveApiKey(userSavedKey, isPremium, aiUsage);
                                                            if (!activeKey) {
                                                                setShowApiModal(true);
                                                                return;
                                                            }
                                                            if (incrementAiUsage) incrementAiUsage();

                                                            const langMap: any = { ko: 'Korean', en: 'English', ja: 'Japanese', zh: 'Mandarin Chinese', vi: 'Vietnamese', tw: 'Traditional Chinese' };
                                                            const myLang = langMap[lang] || 'Korean';
                                                            try {
                                                                const promptT = `Translate to ${myLang}: "${msg.translatedEn || msg.text}"\nReturn ONLY the translated text.`;
                                                                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${LIGHTWEIGHT_MODEL}:generateContent?key=${activeKey}`, {
                                                                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ contents: [{ parts: [{ text: promptT }] }] })
                                                                });
                                                                const data = await res.json();
                                                                const translated = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
                                                                if (translated) {
                                                                    setMessages(prev => prev.map(m => (m.id && m.id === msg.id) || (!m.id && m.text === msg.text && m.createdAt === msg.createdAt) ? { ...m, localNative: translated, showNative: true } : m));
                                                                }
                                                            } catch (err) { console.error('Translation failed', err); }
                                                        }}
                                                        className="text-[10px] font-black text-white flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg hover:bg-white/10 transition-all opacity-60 hover:opacity-100"
                                                    >
                                                        <Globe size={11} /> {tUI(lang, 'view_translation')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* AI Correction Tip (Outside the bubble, Button-triggered) */}
                                        {isMine && msg.betterContext && (
                                            msg.showHint ? (
                                                <div className="mt-2 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-2xl shadow-sm animate-in slide-in-from-bottom-1 duration-300 w-full max-w-[280px]">
                                                    <div className="flex items-center justify-between mb-1 gap-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <Sparkles size={12} className="text-amber-500" />
                                                            <span className="font-black text-amber-500 text-[10px] uppercase tracking-wider">{lang === 'ko' ? 'AI 교정 팁' : 'AI Tip'}</span>
                                                        </div>
                                                        <button onClick={() => setMessages(prev => prev.map(m => (m.id && m.id === msg.id) || (!m.id && m.text === msg.text && m.createdAt === msg.createdAt) ? { ...m, showHint: false } : m))}>
                                                            <X size={12} className="text-amber-500/40 hover:text-amber-500" />
                                                        </button>
                                                    </div>
                                                    <p className="text-[11px] font-bold text-amber-200/90 leading-snug">{msg.betterContext}</p>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setMessages(prev => prev.map(m => (m.id && m.id === msg.id) || (!m.id && m.text === msg.text && m.createdAt === msg.createdAt) ? { ...m, showHint: true } : m))}
                                                    className="mt-1.5 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 transition-all font-black"
                                                >
                                                    <Sparkles size={12} />
                                                    <span className="text-[10px] uppercase tracking-tight">{lang === 'ko' ? 'AI 교정 팁 보기' : 'AI Correction Tip'}</span>
                                                </button>
                                            )
                                        )}

                                        {/* Suggestion & Bible Save */}
                                        <div className={`mt-1.5 flex flex-col ${isMine ? 'items-end' : 'items-start'} gap-1.5 w-full`}>


                                            <button
                                                onClick={() => saveToBible(msg)}
                                                className="px-2 text-[10px] font-black text-slate-500 flex items-center gap-1 hover:text-emerald-400 transition-colors"
                                            >
                                                <BookOpen size={10} /> {tUI(lang, 'saved_bible_btn')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {isAiTyping && (
                            <div className="flex justify-start animate-fade-in">
                                <div className="bg-[#1E1E2C] px-5 py-4 rounded-[24px] rounded-bl-sm border border-white/5 flex gap-1">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>

                    <div className="px-5 pb-[calc(10px+var(--safe-area-bottom))] sm:pb-5 pt-2 bg-[#12121A] border-t border-white/5 shrink-0 z-20">
                        {/* 10. AI GUIDE AREA (Sequential Role-play Guide) */}
                        {(() => {
                            const lastTalkMsg = [...messages].reverse().find(m => !m.isSystem);
                            const iSpeakNext = !lastTalkMsg || lastTalkMsg.senderId !== firebaseUser?.uid;

                            let guideEn = "";
                            let guideNat = "";

                            if (messages.filter(m => !m.isSystem).length === 0) {
                                // Initial Guide
                                if (initialGuide) {
                                    guideEn = initialGuide.en;
                                    guideNat = initialGuide.nat;
                                }
                            } else if (iSpeakNext && lastTalkMsg?.suggestion) {
                                // Chain Guide from opponent
                                guideEn = lastTalkMsg.suggestion;
                                guideNat = lastTalkMsg.suggestionNative || "";
                            }

                            if (!guideEn) return null;

                            return (
                                <div className="mb-2 animate-fade-in">
                                    <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-2xl p-4 shadow-lg backdrop-blur-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="bg-indigo-500 p-1 rounded-lg">
                                                <Sparkles size={12} className="text-white" />
                                            </div>
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{tUI(lang, 'ai_guide') || 'AI CONVERSATION GUIDE'}</span>
                                        </div>
                                        <button
                                            onClick={() => chatInputRef.current?.setText(guideEn)}
                                            className="w-full text-left active:scale-[0.98] transition-all group"
                                        >
                                            <p className="text-[14px] font-black text-white leading-tight group-hover:text-indigo-300 transition-colors">{guideEn}</p>
                                            {guideNat && <p className="text-[11px] font-bold text-indigo-400 mt-1.5 opacity-80 italic">{guideNat}</p>}
                                        </button>
                                        <div className="mt-2 flex justify-end">
                                            <span className="text-[8px] font-bold text-white/30 tracking-tighter uppercase italic">Click to copy to input</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {blockedMsgWarning && (
                            <div className="mb-3 bg-rose-500/90 backdrop-blur-md rounded-xl px-4 py-2.5 flex items-center gap-3 animate-bounce shadow-lg border border-rose-400/30">
                                <AlertTriangle size={16} className="text-white" />
                                <p className="text-[11px] font-black text-white">{tUI(lang, 'profanity_warning')} (No profanity allowed)</p>
                            </div>
                        )}

                        {/* MANUAL GUIDE BUTTON (✨) - Created as per user request */}
                        <div className="flex flex-col items-center mb-1 animate-in fade-in duration-500">
                            {manualSuggestion && (
                                <div className="mb-2 w-full max-w-[90%] bg-indigo-600/30 border border-indigo-500/40 rounded-2xl p-3 shadow-xl backdrop-blur-lg flex flex-col gap-1 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 animate-pulse" />
                                    <div className="flex justify-between items-start">
                                        <p className="text-[14px] font-black text-white leading-tight pr-6">"{manualSuggestion}"</p>
                                        <button onClick={() => setManualSuggestion(null)} className="text-white/40 hover:text-white"><X size={14} /></button>
                                    </div>
                                    {manualSuggestionNative && <p className="text-[11px] font-bold text-indigo-300 italic">{manualSuggestionNative}</p>}
                                    <button
                                        onClick={() => {
                                            chatInputRef.current?.setText(manualSuggestion);
                                            setManualSuggestion(null);
                                        }}
                                        className="mt-1 self-end text-[10px] font-black bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full transition-all active:scale-95"
                                    >
                                        {lang === 'ko' ? '입력창에 넣기' : 'Apply to Input'}
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={handleManualGuideRequest}
                                disabled={isManualLoading}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg transition-all active:scale-95 text-white font-black text-[12px] group
                                    ${isManualLoading ? 'bg-indigo-900/50 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:shadow-indigo-500/20'}
                                `}
                            >
                                <Sparkles size={16} className={isManualLoading ? 'animate-spin' : 'group-hover:rotate-12 transition-transform'} />
                                <span>{isManualLoading ? (lang === 'ko' ? '생성 중...' : 'Thinking...') : (lang === 'ko' ? '가이드 요청' : 'Get Guide')}</span>
                            </button>
                        </div>

                        {/* MULTI-LANG FLAGS BAR */}
                        <div className="flex items-center justify-center gap-2.5 mb-2.5 bg-white/5 py-2 px-4 rounded-[20px] backdrop-blur-sm self-center">
                            {FLAGS.map(f => {
                                const isActive = selectedFlag?.code === f.code;
                                return (
                                    <button
                                        key={f.code}
                                        onClick={() => {
                                            setSelectedFlag(f);
                                            // setLang(f.lang); // Removed: Only affects speech recognition, not UI language
                                        }}
                                        className={`w-8 h-8 rounded-lg overflow-hidden border-2 active:scale-95 transition-all outline-none ${isActive
                                            ? 'border-emerald-400 ring-2 ring-emerald-400/50 scale-110'
                                            : 'border-white/10 grayscale hover:grayscale-0 hover:border-white/30'
                                            }`}
                                        title={f.label}
                                    >
                                        <img src={`https://flagcdn.com/w80/${f.code.toLowerCase()}.png`} className="w-full h-full object-cover" alt={f.label} />
                                    </button>
                                );
                            })}
                            {/* 택 */}
                            {selectedFlag && (
                                <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                    {selectedFlag.label}
                                </span>
                            )}
                        </div>

                        <div className="flex items-start gap-2 relative mt-1">
                            {/* 9. Mic button locked when opponent speaking */}
                            <button
                                onClick={startRecording}
                                disabled={isProcessing || isMicLocked}
                                title={isMicLocked ? (lang === 'ko' ? '상대방이 말하는 중...' : 'Partner speaking...') : (isRecording ? (lang === 'ko' ? '녹음 중' : 'Stop recording') : (lang === 'ko' ? '말하기' : 'Speak'))}
                                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all border-2 ${isMicLocked ? 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed' :
                                    isRecording ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-110' :
                                        'bg-[#1E1E2C] border-transparent text-emerald-400 active:scale-95'
                                    }`}
                            >
                                {isMicLocked ? <MicOff size={22} /> : isRecording ? (
                                    <div className="flex gap-0.5 items-center">
                                        <div className="w-1 h-3 bg-white animate-pulse" />
                                        <div className="w-1 h-5 bg-white animate-pulse [animation-delay:0.2s]" />
                                        <div className="w-1 h-3 bg-white animate-pulse [animation-delay:0.4s]" />
                                    </div>
                                ) : <Mic size={22} />}
                            </button>
                            <ChatInputArea
                                ref={chatInputRef}
                                onSend={handleSendMessage}
                                isProcessing={isProcessing}
                                lang={lang}
                                placeholder={tUI(lang, 'chat_placeholder')}
                            />
                        </div>
                    </div>

                </div>
            )}


            {/* RECORDINGS VIEWER */}
            {showRecordings && (
                <div className="fixed inset-0 z-[99999] bg-[#08080F] flex flex-col">
                    <header className="px-5 pt-[calc(16px+var(--safe-area-top))] pb-4 flex items-center gap-4 border-b border-white/10">
                        <button onClick={() => { setPlayingRecordingData(null); setShowRecordings(false); }}
                            className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 active:scale-90">
                            <X size={20} />
                        </button>
                        <h2 className="text-lg font-black text-white">{tUI(lang, 'rec_viewer_title')}</h2>
                        <span className="ml-auto text-[10px] font-bold text-slate-500">{savedRecordings.length}{tUI(lang, 'rec_count')}</span>
                    </header>

                    {playingRecordingData ? (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="mx-5 mt-4 bg-emerald-900/30 border border-emerald-500/30 rounded-2xl px-4 py-3 flex items-center gap-3">
                                <div className="text-lg"></div>
                                <div>
                                    <p className="text-xs font-black text-emerald-300">{tUI(lang, 'rec_file_saved')}</p>
                                    <p className="text-[10px] text-emerald-600 mt-0.5 font-mono break-all">{playingRecordingData.fileName}</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5">
                                <div className="flex items-center gap-3 mb-5">
                                    <button onClick={() => setPlayingRecordingData(null)}
                                        className="text-slate-400 text-xs font-black underline">{tUI(lang, 'rec_back_to_list')}</button>
                                    <span className="flex-1" />
                                    <button
                                        onClick={async () => {
                                            if (!confirm(tUI(lang, 'rec_delete_notice'))) return;
                                            setSavedRecordings(prev => {
                                                const next = prev.filter((r: any) => r.id !== playingRecordingData.id);
                                                localStorage.setItem('vq_recordings', JSON.stringify(next));
                                                return next;
                                            });
                                            setPlayingRecordingData(null);
                                        }}
                                        className="w-8 h-8 rounded-xl bg-rose-900/40 text-rose-400 flex items-center justify-center active:scale-90"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-4 mb-5 border border-white/10">
                                    <p className="text-xs font-black text-indigo-400 mb-1"> {playingRecordingData.scenario}</p>
                                    <p className="text-[10px] text-slate-400 font-bold">Role: {playingRecordingData.myRole || '-'} · Rival: {playingRecordingData.rival}</p>
                                    <p className="text-[10px] text-slate-500 mt-1">Time: {Math.floor((playingRecordingData.duration || 0) / 60)}m {(playingRecordingData.duration || 0) % 60}s · {playingRecordingData.date}</p>
                                </div>
                                <h3 className="text-xs font-black text-slate-400 mb-3 uppercase tracking-widest">Chat History</h3>
                                <div className="space-y-2">
                                    {(playingRecordingData.transcript || '').split('\n').filter(Boolean).map((line: string, i: number) => (
                                        <div key={i}
                                            className={`rounded-xl px-3 py-2 border ${line.startsWith(`[${rivalInfo?.name || 'Partner'}]`)
                                                ? 'bg-indigo-900/20 border-indigo-500/10'
                                                : 'bg-white/5 border-white/5'
                                                }`}>
                                            <p className="text-[12px] text-slate-300 font-bold">{line}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-5">
                            {savedRecordings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4">
                                    <Video size={48} className="text-slate-700" />
                                    <p className="text-slate-500 font-bold text-sm">{tUI(lang, 'no_active_rooms')}</p>
                                    <p className="text-slate-600 text-xs text-center px-8">No recordings yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {savedRecordings.map((rec: any) => (
                                        <div key={rec.id}
                                            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/8 active:scale-[0.99] transition-all"
                                            onClick={() => setPlayingRecordingData(rec)}
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-rose-900/30 border border-rose-500/20 flex items-center justify-center shrink-0">
                                                <BookOpen size={20} className="text-rose-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-white truncate"> {rec.scenario || 'Free Chat'}</p>
                                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">vs. {rec.rival} · {Math.floor((rec.duration || 0) / 60)}m {(rec.duration || 0) % 60}s</p>
                                                <p className="text-[9px] text-emerald-700 mt-0.5 font-mono truncate">File: {rec.fileName || 'Pending'}</p>
                                            </div>
                                            <MessageSquare size={16} className="text-slate-500 shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Legal First-time Consent Modal */}
            {showConsentModal && (
                <div className="fixed inset-0 z-[100000] flex items-center justify-center p-6 sm:p-0 ios-p-top ios-p-bottom">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                    <div className="bg-[#12121A] w-full max-w-sm rounded-[32px] overflow-hidden border border-white/10 shadow-2xl animate-scale-in relative">
                        <div className="p-8">
                            <h3 className="text-xl font-black text-white mb-6 tracking-tight flex items-center gap-2">
                                <ShieldAlert size={24} className="text-emerald-500" />
                                {tUI(lang, 'legal_title')}
                            </h3>

                            <div className="space-y-4 mb-8">
                                <label className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer active:bg-white/10 transition-colors">
                                    <input type="checkbox" checked={consentAgeChecked} onChange={e => setConsentAgeChecked(e.target.checked)}
                                        className="mt-1 accent-emerald-500" />
                                    <span className="text-sm font-bold text-slate-300">{tUI(lang, 'legal_age')}</span>
                                </label>
                                <label className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer active:bg-white/10 transition-colors">
                                    <input type="checkbox" checked={consentDataChecked} onChange={e => setConsentDataChecked(e.target.checked)}
                                        className="mt-1 accent-emerald-500" />
                                    <span className="text-sm font-bold text-slate-300">{tUI(lang, 'legal_data')}</span>
                                </label>
                                <label className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 cursor-pointer active:bg-white/10 transition-colors">
                                    <input type="checkbox" checked={consentRecordChecked} onChange={e => setConsentRecordChecked(e.target.checked)}
                                        className="mt-1 accent-emerald-500" />
                                    <span className="text-sm font-bold text-slate-300">{tUI(lang, 'legal_record')}</span>
                                </label>
                            </div>

                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => { setLegalDocInfo({ id: 'terms', title: tUI(lang, 'view_tos') }); setScreen('LEGAL'); }}
                                    className="flex-1 py-3 bg-white/5 rounded-xl text-[10px] font-black text-slate-400 border border-white/5 hover:bg-white/10"
                                >
                                    {tUI(lang, 'view_tos')}
                                </button>
                                <button
                                    onClick={() => { setLegalDocInfo({ id: 'privacy', title: tUI(lang, 'view_privacy') }); setScreen('LEGAL'); }}
                                    className="flex-1 py-3 bg-white/5 rounded-xl text-[10px] font-black text-slate-400 border border-white/5 hover:bg-white/10"
                                >
                                    {tUI(lang, 'view_privacy')}
                                </button>
                            </div>

                            <button
                                disabled={!consentAgeChecked || !consentDataChecked || !consentRecordChecked}
                                onClick={() => {
                                    localStorage.setItem('vq_livechat_consent_v1', 'true');
                                    setShowConsentModal(false);
                                }}
                                className={`w-full py-4 rounded-2xl font-black text-sm transition-all active:scale-95 ${consentAgeChecked && consentDataChecked && consentRecordChecked
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                    : 'bg-white/5 text-slate-600 cursor-not-allowed'
                                    }`}
                            >
                                {tUI(lang, 'legal_agree_btn')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showReportModal && (
                <div className="absolute inset-0 z-[100000] flex items-center justify-center p-6 sm:p-0">

                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setShowReportModal(false)} />
                    <div className="bg-[#12121A] w-full max-w-sm rounded-[32px] overflow-hidden border border-white/10 shadow-2xl animate-scale-in relative">
                        <header className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-lg font-black text-white">{tUI(lang, 'report_user')}</h3>
                            <button onClick={() => setShowReportModal(false)}
                                className="text-slate-500"><X size={20} /></button>
                        </header>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{tUI(lang, 'report_reason')}</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-emerald-500/50 outline-none"
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value as ReportReason)}
                                >
                                    <option value="inappropriate_language">Inappropriate Language</option>
                                    <option value="sexual_content">Sexual Content</option>
                                    <option value="harassment">Harassment</option>
                                    <option value="spam">Spam</option>
                                    <option value="hate_speech">Hate Speech</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{tUI(lang, 'report_detail')}</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-emerald-500/50 outline-none h-24 resize-none"
                                    placeholder="..."
                                    value={reportDetail}
                                    onChange={(e) => setReportDetail(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleSubmitReport}
                                disabled={isSubmittingReport}
                                className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-sm active:scale-95 transition disabled:opacity-50"
                            >
                                {isSubmittingReport ? <RefreshCw size={18} className="animate-spin mx-auto" /> : tUI(lang, 'report_submit')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* RECORDING PRE-CONSENT MODAL */}
            {showPreChatRecordModal && (
                <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                    <div className="bg-[#12121A] w-full max-w-sm rounded-[32px] overflow-hidden border border-white/10 shadow-2xl animate-scale-in relative">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/30">
                                <Video size={32} className="text-rose-500" />
                            </div>
                            <h3 className="text-xl font-black text-white mb-3 tracking-tight">
                                {lang === 'ko' ? '녹화 안내' : 'Session Recording'}
                            </h3>
                            <p className="text-sm font-bold text-slate-400 leading-relaxed mb-8 whitespace-pre-line">
                                {lang === 'ko'
                                    ? '이번 대화 내용을 전체 화면으로 녹화하겠습니까?\n본인 얼굴과 채팅 내용이 모두 기록됩니다.'
                                    : 'Do you want to record this session?\nEntire screen including your face and chat will be recorded.'}
                            </p>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => {
                                        if (postConsentAction) postConsentAction();
                                        setShowPreChatRecordModal(false);
                                        setTimeout(() => startActualRecording(), 1500);
                                    }}
                                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/30 active:scale-95 transition"
                                >
                                    {lang === 'ko' ? '네, 녹화 시작' : 'Yes, Start Recording'}
                                </button>
                                <button
                                    onClick={() => {
                                        if (postConsentAction) postConsentAction();
                                        setShowPreChatRecordModal(false);
                                    }}
                                    className="w-full py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-sm active:bg-white/10 transition"
                                >
                                    {lang === 'ko' ? '아니요, 그냥 시작' : 'No, just start'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Exit Confirmation Modal */}
            {showExitConfirm && (
                <div className="absolute inset-0 z-[11000] flex items-center justify-center p-6 animate-fade-in">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowExitConfirm(false)} />
                    <div className="relative w-full max-w-sm bg-[#12121A] rounded-[40px] border border-white/10 shadow-2xl overflow-hidden animate-slide-up">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/30">
                                <LogOut size={32} className="text-rose-500" />
                            </div>
                            <h3 className="text-xl font-black text-white mb-3 tracking-tight">
                                {tUI(lang, 'exit')}
                            </h3>
                            <p className="text-sm font-bold text-slate-400 leading-relaxed mb-8">
                                {tUI(lang, 'exit_confirm_msg')}
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setShowExitConfirm(false)}
                                    className="w-full py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-sm active:bg-white/10 transition"
                                >
                                    {tUI(lang, 'cancel_matching')}
                                </button>
                                <button
                                    onClick={() => {
                                        if (onExitAction) onExitAction();
                                        setShowExitConfirm(false);
                                    }}
                                    className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-rose-500/30 active:scale-95 transition"
                                >
                                    {tUI(lang, 'exit')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            <div className={`absolute bottom-24 left-1/2 -translate-x-1/2 z-[10000] transition-all duration-500 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <div className="bg-[#1e1e2d] border border-emerald-500/30 text-white px-6 py-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-3 min-w-[280px]">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                        <Sparkles size={16} className="text-white" />
                    </div>
                    <span className="text-sm font-bold tracking-tight">{toastMsg}</span>
                </div>
            </div>

        </div>
    );
}




