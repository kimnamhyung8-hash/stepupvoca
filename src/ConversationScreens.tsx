import { useState, useRef, useEffect } from 'react';
import { getActiveApiKey, LIGHTWEIGHT_MODEL } from './apiUtils';
import {
    X, Send, ChevronRight, Volume2, Eye, RotateCcw, Mic, Lightbulb, ChevronDown, Trophy, BookOpen, Bot, ShieldCheck, Globe, EyeOff, Sparkles, Plus
} from 'lucide-react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { playNaturalTTS, stopTTS as ttsStop } from './utils/ttsUtils';
import { SCENARIO_SCRIPTS } from './conversationScripts';
import { t as globalT } from './i18n';

// ─── Interfaces ────────────────────────────────────────────────────────
interface ChatMsg {
    role: 'user' | 'model';
    text: string;
    isSaved?: boolean;
    showTrans?: boolean;
    translation?: string;
    guide?: any;
    correctedText?: string;
    correctedTrans?: string;
    explanation?: string;
    showExplanation?: boolean;
    recommendedSentence?: string;
}

export interface Scenario {
    id: string; emoji: string;
    title_ko: string; title_en: string;
    title_ja?: string; title_zh?: string; title_vi?: string; title_tw?: string;
    description_ko?: string; description_en?: string;
    color: string; border: string;
    level?: string; turns?: number;
    subScenarios?: any[];
    subScSelected?: any;
    [key: string]: any;
}

// ─── Constants ─────────────────────────────────────────────────────────
const CEFR_LEVELS = [
    { code: 'A1', label: 'Beginner' },
    { code: 'A2', label: 'Elementary' },
    { code: 'B1', label: 'Intermediate' },
    { code: 'B2', label: 'Upper-Int' },
    { code: 'C1', label: 'Advanced' },
    { code: 'C2', label: 'Proficient' },
];

const INPUT_LANGS = [
    { id: 'ko', flag: 'https://flagcdn.com/w80/kr.png', label: 'KO' },
    { id: 'en', flag: 'https://flagcdn.com/w80/us.png', label: 'EN' },
    { id: 'ja', flag: 'https://flagcdn.com/w80/jp.png', label: 'JA' },
    { id: 'zh', flag: 'https://flagcdn.com/w80/cn.png', label: 'ZH' },
    { id: 'tw', flag: 'https://flagcdn.com/w80/tw.png', label: 'TW' },
    { id: 'vi', flag: 'https://flagcdn.com/w80/vn.png', label: 'VI' },
];

const SCENARIOS: Scenario[] = [
    {
        id: 'airport', emoji: '✈️',
        title_ko: '공항 체크인', title_en: 'Airport Check-in',
        title_ja: '空港チェックイン', title_zh: '机场登机', title_tw: '機場登機', title_vi: 'Check-in tại sân bay',
        description_ko: '수하물, 좌석 요청, 탑승 게이트', description_en: 'Baggage, seat requests, boarding gate',
        description_ja: '手荷物、座席リクエスト、搭乗ゲート', description_zh: '行李，座位请求，登机口', description_tw: '行李，座位請求，登機口', description_vi: 'Hành lý, yêu cầu chỗ ngồi, cửa lên máy bay',
        color: 'from-blue-900/40 to-blue-600/20', border: 'border-blue-500/30',
        level: '입문', level_key: 'beginner', turns: 15,
        subScenarios: [
            { 
                id: 'counter', title_ko: '티켓 카운터 체크인', title_en: 'Counter Check-in', 
                title_ja: 'チケットカウンターでチェックイン', title_zh: '柜台登机', title_tw: '櫃檯登機', title_vi: 'Check-in tại quầy',
                description_ko: '번호표 뽑기, 수하물 부치기', description_en: 'Tickets and baggage',
                description_ja: '番号札、荷物預け', description_zh: '取号，托运行李', description_tw: '取號，托運行李', description_vi: 'Lấy số, gửi hành lý'
            },
            { 
                id: 'seat', title_ko: '좌석 변경 요청', title_en: 'Seat Change Request', 
                title_ja: '座席変更のリクエスト', title_zh: '请求更改座位', title_tw: '請求更改座位', title_vi: 'Yêu cầu đổi chỗ ngồi',
                description_ko: '창가/복도 좌석 요청, 업그레이드', description_en: 'Window/aisle and upgrades',
                description_ja: '窓側/通路側、アップグレード', description_zh: '靠窗/靠走廊，升舱', description_tw: '靠窗/靠走廊，升艙', description_vi: 'Chỗ ngồi gần cửa sổ/lối đi và nâng hạng'
            },
            { 
                id: 'gate', title_ko: '탑승구 찾기/지연', title_en: 'Finding Gate/Delays', 
                title_ja: '搭乗口の確認/遅延', title_zh: '查找登机口/延误', title_tw: '查找登機口/延誤', title_vi: 'Tìm cửa lên máy bay/Hoãn chuyến',
                description_ko: '게이트 위치 묻기, 지연 확인', description_en: 'Gate location and schedule',
                description_ja: 'ゲートの場所、スケジュールの確認', description_zh: '登机口位置，查询进度', description_tw: '登機口位置，查詢進度', description_vi: 'Vị trí cửa và lịch trình'
            }
        ]
    },
    {
        id: 'restaurant', emoji: '🍴',
        title_ko: '레스토랑 주문', title_en: 'Restaurant Ordering',
        title_ja: 'レストランでの注文', title_zh: '餐厅点餐', title_tw: '餐廳點餐', title_vi: 'Gọi món tại nhà hàng',
        description_ko: '예약 확인, 메뉴 주문, 결제하기', description_en: 'Reservation, ordering, payment',
        description_ja: '予約確認、注文、支払い', description_zh: '确认预约，点餐，支付', description_tw: '確認預約，點餐，支付', description_vi: 'Xác nhận đặt bàn, gọi món, thanh toán',
        color: 'from-orange-900/40 to-orange-600/20', border: 'border-orange-500/30',
        level: '입문', level_key: 'beginner', turns: 15,
        subScenarios: [
            { 
                id: 'order', title_ko: '메뉴 주문하기', title_en: 'Ordering Food', 
                title_ja: '料理を注文する', title_zh: '点菜', title_tw: '點菜', title_vi: 'Đặt món ăn',
                description_ko: '오늘의 추천 메뉴, 알레르기 안내', description_en: 'Recommendations and allergies',
                description_ja: '本日のおすすめ、アレルギー対応', description_zh: '今日推荐，过敏告知', description_tw: '今日推薦，過敏告知', description_vi: 'Gợi ý món và dị ứng'
            },
            { 
                id: 'complaint', title_ko: '컴플레인/요구사항', title_en: 'Complaints/Requests', 
                title_ja: 'クレーム/リクエスト', title_zh: '投诉/要求', title_tw: '投訴/要求', title_vi: 'Khiếu nại/Yêu cầu',
                description_ko: '음식이 늦을 때, 식기 교체', description_en: 'Delays and utensils',
                description_ja: '料理の遅れ、カトラリーの交換', description_zh: '上菜慢，更换餐具', description_tw: '上菜慢，更換餐具', description_vi: 'Chậm trễ và dụng cụ ăn uống'
            },
            { 
                id: 'bill', title_ko: '계산서 요청/결제', title_en: 'Bill & Payment', 
                title_ja: 'お会計/支払い', title_zh: '账单与支付', title_tw: '帳單與支付', title_vi: 'Hóa đơn & Thanh toán',
                description_ko: '더치페이 요청, 영수증 받기', description_en: 'Splitting bill and receipts',
                description_ja: '割り勘、領収書', description_zh: 'AA制，发票/小票', description_tw: 'AA制，發票/收據', description_vi: 'Chia hóa đơn và biên lai'
            }
        ]
    },
    {
        id: 'hotel', emoji: '🏨',
        title_ko: '호텔 체크인/아웃', title_en: 'Hotel Services',
        title_ja: 'ホテル サービス', title_zh: '酒店服务', title_tw: '酒店服務', title_vi: 'Dịch vụ khách sạn',
        description_ko: '객실 체크인, 시설 이용, 체크아웃', description_en: 'Check-in, facilities, check-out',
        description_ja: 'チェックイン、施設利用、チェックアウト', description_zh: '入住，设施，退房', description_tw: '入住，設施，退房', description_vi: 'Nhận phòng, cơ sở vật chất, trả phòng',
        color: 'from-indigo-900/40 to-indigo-600/20', border: 'border-indigo-500/30',
        level: '입문', turns: 15,
        subScenarios: [
            { id: 'checkin', title_ko: '객실 체크인', title_en: 'Checking In', title_ja: 'チェックイン', title_zh: '办理入住', title_tw: '辦理入住', title_vi: 'Nhận phòng', description_ko: '예약 번호 확인, 조식 안내', description_en: 'Reservation and breakfast', description_ja: '予約番号、朝食の案内', description_zh: '确认预约，早餐说明', description_tw: '確認預約，早餐說明', description_vi: 'Mã đặt phòng và bữa sáng' },
            { id: 'roomservice', title_ko: '룸서비스/수건 요청', title_en: 'Room Service', title_ja: 'ルームサービス', title_zh: '客房服务', title_tw: '客房服務', title_vi: 'Dịch vụ phòng', description_ko: '야식 주문, 추가 수건 요청', description_en: 'Food and amenities', description_ja: '夜食、タオルの追加', description_zh: '点餐，加毛巾', description_tw: '點餐，加毛巾', description_vi: 'Đồ ăn và tiện nghi' },
            { id: 'checkout', title_ko: '체크아웃/벨보이', title_en: 'Checking Out', title_ja: 'チェックアウト', title_zh: '办理退房', title_tw: '辦理退房', title_vi: 'Trả phòng', description_ko: '짐 보관 요청, 택시 호출', description_en: 'Luggage and transport', description_ja: '荷物預かり、タクシー配車', description_zh: '行李寄存，叫车', description_tw: '行李寄存，叫車', description_vi: 'Hành lý và vận chuyển' }
        ]
    },
    {
        id: 'shopping', emoji: '🛍️',
        title_ko: '쇼핑하기', title_en: 'Shopping',
        title_ja: 'ショッピング', title_zh: '购物', title_tw: '購物', title_vi: 'Mua sắm',
        description_ko: '옷 고르기, 가격 흥정, 환불 및 교환', description_en: 'Clothing, bargaining, and refunds',
        description_ja: '洋服選び、価格交渉、返品・交換', description_zh: '挑选衣服，讨价还价，退款和更换', description_tw: '挑選衣服，討價還價，退款和更換', description_vi: 'Quần áo, mặc cả và hoàn tiền',
        color: 'from-pink-900/40 to-pink-600/20', border: 'border-pink-500/30',
        level: '입문', turns: 15,
        subScenarios: [
            { id: 'select', title_ko: '옷 고르기/사이즈 문의', title_en: 'Choosing Clothes', title_ja: 'サイズ確認', title_zh: '挑选衣服', title_tw: '挑選衣服', title_vi: 'Chọn quần áo', description_ko: '사이즈 확인, 피팅룸 이용', description_en: 'Sizes and fitting rooms', description_ja: 'サイズ、試着室', description_zh: '尺寸，试衣间', description_tw: '尺寸，試衣間', description_vi: 'Kích cỡ và phòng thử đồ' },
            { id: 'bargain', title_ko: '가격 흥정/할인 요청', title_en: 'Bargaining', title_ja: '価格交渉', title_zh: '讨价还价', title_tw: '討價還價', title_vi: 'Mặc cả', description_ko: '할인 가능 여부, 예산 조율', description_en: 'Discounts and budget', description_ja: '割引、予算', description_zh: '折扣，预算', description_tw: '折扣，預算', description_vi: 'Giảm giá và ngân sách' },
            { id: 'refund', title_ko: '환불 및 교환', title_en: 'Refunds & Exchanges', title_ja: '返品・交換', title_zh: '退款与更换', title_tw: '退款與更換', title_vi: 'Hoàn tiền & Đổi hàng', description_ko: '영수증 제시, 제품 결함 설명', description_en: 'Receipts and defects', description_ja: '領収書、不具合', description_zh: '收据，质量问题', description_tw: '收據，質量問題', description_vi: 'Biên lai và lỗi sản phẩm' }
        ]
    },
    {
        id: 'business', emoji: '💼',
        title_ko: '비즈니스 미팅', title_en: 'Business Meeting',
        title_ja: 'ビジネスミーティング', title_zh: '商务会议', title_tw: '商務會議', title_vi: 'Họp kinh doanh',
        description_ko: '자기 소개, 발표, 계약 협상', description_en: 'Introductions, presentations, and contracts',
        description_ja: '自己紹介、プレゼン、交渉', description_zh: '自我介绍，演示，合同谈判', description_tw: '自我介紹，演示，合同談判', description_vi: 'Giới thiệu, thuyết trình và hợp đồng',
        color: 'from-slate-900/40 to-slate-600/20', border: 'border-slate-500/30',
        level: '초급', turns: 15,
        subScenarios: [
            { id: 'intro', title_ko: '자기 소개 및 인사', title_en: 'Introductions', title_ja: '自己紹介', title_zh: '自我介绍', title_tw: '自我介紹', title_vi: 'Giới thiệu', description_ko: '명함 교환, 직함 소개', description_en: 'Cards and titles', description_ja: '名刺交換、肩書き', description_zh: '换名片，职位介绍', description_tw: '換名片，職位介紹', description_vi: 'Danh thiếp và chức danh' },
            { id: 'presentation', title_ko: '프로젝트 발표/브리핑', title_en: 'Presentation', title_ja: 'プレゼンテーション', title_zh: '演示', title_tw: '演示', title_vi: 'Thuyết trình', description_ko: '개요 설명, 질의응답', description_en: 'Overview and Q&A', description_ja: '概要、質疑応答', description_zh: '概要，问答', description_tw: '概要，問答', description_vi: 'Tổng quan và Hỏi đáp' },
            { id: 'closing', title_ko: '계약 협상 및 마감', title_en: 'Negotiation', title_ja: '交渉・契約', title_zh: '谈判', title_tw: '談判', title_vi: 'Đàm phán', description_ko: '조건 조율, 최종 서명', description_en: 'Terms and signing', description_ja: '条件調整、署名', description_zh: '条款，签署', description_tw: '條款，簽署', description_vi: 'Điều khoản và ký kết' }
        ]
    },
    {
        id: 'hospital', emoji: '🏥',
        title_ko: '병원 방문', title_en: 'Hospital Visit',
        title_ja: '病院訪問', title_zh: '医院就诊', title_tw: '醫院就診', title_vi: 'Khám bệnh',
        description_ko: '증상 설명, 처방전, 응급실', description_en: 'Symptoms, prescriptions, and ER',
        description_ja: '症状の説明、処方箋、救급室', description_zh: '说明症状，处方，急诊室', description_tw: '說明症狀，處方，急診室', description_vi: 'Triệu chứng, đơn thuốc và phòng cấp cứu',
        color: 'from-emerald-900/40 to-emerald-600/20', border: 'border-emerald-500/30',
        level: '초급', turns: 15,
        subScenarios: [
            { id: 'diagnosis', title_ko: '증상 설명/진료', title_en: 'Explaining Symptoms', title_ja: '症状の説明', title_zh: '说明症状', title_tw: '說明症狀', title_vi: 'Mô tả triệu chứng', description_ko: '통증 부위, 발병 시기 설명', description_en: 'Pain and duration', description_ja: '痛みの部位、時期', description_zh: '疼痛部位，发病时间', description_tw: '疼痛部位，發病時間', description_vi: 'Cơn đau và thời gian' },
            { id: 'pharmacy', title_ko: '처방전 및 약국', title_en: 'Pharmacy', title_ja: '処方箋と薬局', title_zh: '处方与药店', title_tw: '處方與藥局', title_vi: 'Đơn thuốc & Tiệm thuốc', description_ko: '복용법 지시, 보험 확인', description_en: 'Dosage and insurance', description_ja: '服用方法、保険', description_zh: '服药方法，保险确认', description_tw: '服藥方法，保險確認', description_vi: 'Liều lượng và bảo hiểm' },
            { id: 'er', title_ko: '응급실 방문', title_en: 'Emergency Room', title_ja: '救急室', title_zh: '急诊室', title_tw: '急診室', title_vi: 'Phòng cấp cứu', description_ko: '긴급 조치 요청, 사고 상황', description_en: 'Urgent care and accidents', description_ja: '緊急措置、事故状況', description_zh: '请求急救，事故描述', description_tw: '請求急救，事故描述', description_vi: 'Chăm sóc khẩn cấp và tai nạn' }
        ]
    },
    {
        id: 'taxi', emoji: '🚕',
        title_ko: '택시/교통', title_en: 'Transportation',
        title_ja: 'タクシー/交通', title_zh: '出租车/交通', title_tw: '出租車/交通', title_vi: 'Taxi/Giao thông',
        description_ko: '목적지 설명, 노선 문의, 티켓', description_en: 'Destinations, routes, and tickets',
        description_ja: '目的地、路線案内、チケット', description_zh: '说明目的地，路线咨询，门票', description_tw: '說明目的地，路線諮詢，門票', description_vi: 'Điểm đến, lộ trình và vé',
        color: 'from-yellow-900/40 to-yellow-600/20', border: 'border-yellow-500/30',
        level: '입문', turns: 15,
        subScenarios: [
            { id: 'destination', title_ko: '택시 타기/목적지', title_en: 'Taking a Taxi', title_ja: 'タクシーに乗る', title_zh: '打出租车/目的地', title_tw: '搭出租車/目的地', title_vi: 'Đi taxi', description_ko: '주소 설명, 소요 시간 확인', description_en: 'Address and time', description_ja: '住所、所要時間', description_zh: '说明地址，确认时间', description_tw: '說明地址，確認時間', description_vi: 'Địa chỉ và thời gian' },
            { id: 'subway', title_ko: '지하철/버스 노선', title_en: 'Public Transport', title_ja: '公共交通機関', title_zh: '公共交通', title_tw: '公共交通', title_vi: 'Giao thông công cộng', description_ko: '환승역 묻기, 막차 시간', description_en: 'Transfers and last bus', description_ja: '乗り換え、終電', description_zh: '咨询换乘，末班车', description_tw: '諮詢換乘', description_vi: 'Chuyển tuyến và xe cuối' },
            { id: 'booking', title_ko: '기차/버스 예매', title_en: 'Ticket Booking', title_ja: 'チケット予約', title_zh: '订票', title_tw: '訂票', title_vi: 'Đặt vé', description_ko: '편도/왕복, 좌석 등급', description_en: 'One-way and classes', description_ja: '片道/往復、座席等級', description_zh: '单程/往返，等级', description_tw: '單程/往返，等級', description_vi: 'Một chiều/Khứ hồi và hạng ghế' }
        ]
    },
    {
        id: 'cafe', emoji: '☕',
        title_ko: '카페에서', title_en: 'At a Cafe',
        title_ja: 'カフェで', title_zh: '在咖啡馆', title_tw: '在咖啡館', title_vi: 'Tại quán cà phê',
        description_ko: '음료 주문, 와이파이, 좌석', description_en: 'Ordering, Wi-Fi, and seating',
        description_ja: '注文、Wi-Fi、座席', description_zh: '点餐，Wi-Fi，座位', description_tw: '點餐，Wi-Fi，座位', description_vi: 'Gọi món, Wi-Fi và chỗ ngồi',
        color: 'from-amber-900/40 to-amber-600/20', border: 'border-amber-500/30',
        level: '입문', turns: 15,
        subScenarios: [
            { id: 'order', title_ko: '음료/디저트 주문', title_en: 'Ordering', title_ja: '注文', title_zh: '点餐', title_tw: '點餐', title_vi: 'Gọi món', description_ko: '커스텀 옵션(샷 추가, 우유)', description_en: 'Customizations', description_ja: 'オプション（ショット、ミルク）', description_zh: '定制选项（加浓，牛奶）', description_tw: '定制選項（加濃，牛奶）', description_vi: 'Tùy chỉnh' },
            { id: 'wifi', title_ko: '와이파이 비번 묻기', title_en: 'Asking for Wi-Fi', title_ja: 'Wi-Fiパスワード', title_zh: '咨询Wi-Fi密码', title_tw: '諮詢Wi-Fi密碼', title_vi: 'Hỏi mật khẩu Wi-Fi', description_ko: '비밀번호 확인, 연결 도움', description_en: 'Password and help', description_ja: 'パスワード、接続', description_zh: '确认密码，连接帮助', description_tw: '確認密碼，連接幫助', description_vi: 'Mật khẩu và trợ giúp' },
            { id: 'seat', title_ko: '콘센트/좌석 확인', title_en: 'Finding Seats', title_ja: '座席確認', title_zh: '找座位', title_tw: '找座位', title_vi: 'Tìm chỗ ngồi', description_ko: '충전 가능 좌석 찾기', description_en: 'Plugs and availability', description_ja: '電源、座席', description_zh: '找电源插头，座位情况', description_tw: '找電源插頭，座位情況', description_vi: 'Phích cắm và tình trạng' }
        ]
    },
    {
        id: 'phone', emoji: '📞',
        title_ko: '전화 통화', title_en: 'Phone Call',
        title_ja: '電話通話', title_zh: '电话通话', title_tw: '電話通話', title_vi: 'Gọi điện thoại',
        description_ko: '전화 걸기, 메시지, 연결', description_en: 'Making calls, messages, and transfers',
        description_ja: '電話、メッセージ、転送', description_zh: '打电话，留言，转接', description_tw: '打電話，留言', description_vi: 'Gọi điện, gửi tin nhắn',
        color: 'from-violet-900/40 to-violet-600/20', border: 'border-violet-500/30',
        level: '초급', turns: 15,
        subScenarios: [
            { id: 'call', title_ko: '전화 걸기/바꿔주기', title_en: 'Connecting Calls', title_ja: '電話を繋ぐ', title_zh: '打电话/转接', title_tw: '打電話/轉接', title_vi: 'Kết nối cuộc gọi', description_ko: '상대방 찾기, 연결 요청', description_en: 'Finding people', description_ja: '担当者、繋いでもらう', description_zh: '找人，请求转接', description_tw: '找人，請求轉接', description_vi: 'Tìm người' },
            { id: 'message', title_ko: '메시지 남기기', title_en: 'Leaving Messages', title_ja: 'メッセージを残す', title_zh: '留言', title_tw: '留言', title_vi: 'Để lại lời nhắn', description_ko: '용건 전달, 회신 요청', description_en: 'Purpose and callbacks', description_ja: '用件、折り返し', description_zh: '传达内容，请求回访', description_tw: '傳達內容', description_vi: 'Mục đích và gọi lại' },
            { id: 'wrong', title_ko: '잘못 걸린 전화', title_en: 'Wrong Number', title_ja: '間違い電話', title_zh: '打错电话', title_tw: '打錯電話', title_vi: 'Nhầm số', description_ko: '정중한 거절, 사실 확인', description_en: 'Polite refusals', description_ja: '丁寧な断り、確認', description_zh: '礼貌拒绝', description_tw: '禮貌拒絕', description_vi: 'Từ chối lịch sự' }
        ]
    },
    {
        id: 'school', emoji: '🏫',
        title_ko: '학교/수업', title_en: 'School Life',
        title_ja: '学校/授業', title_zh: '学校/课堂', title_tw: '學校/課堂', title_vi: 'Trường học',
        description_ko: '수강 신청, 숙제 질문, 도서관', description_en: 'Enrollment, homework, and library',
        description_ja: '履修登録、宿題、図書館', description_zh: '选课，作业，图书馆', description_tw: '選課，作業，圖書館', description_vi: 'Đăng ký, bài tập và thư viện',
        color: 'from-rose-900/40 to-rose-600/20', border: 'border-rose-500/30',
        level: '초급', turns: 15,
        subScenarios: [
            { id: 'enrollment', title_ko: '수강 신청 문의', title_en: 'Enrollment', title_ja: '履修登録', title_zh: '咨询选课', title_tw: '諮詢選課', title_vi: 'Đăng ký học', description_ko: '과목 선택, 선수 과목 확인', description_en: 'Classes and prerequisites', description_ja: '科目・前提条件', description_zh: '选课，先修课', description_tw: '選課', description_vi: 'Lớp học và điều kiện' },
            { id: 'homework', title_ko: '숙제/시험 질문', title_en: 'Academic Help', title_ja: '宿題・試験', title_zh: '学业帮助', title_tw: '學業幫助', title_vi: 'Hỗ trợ học tập', description_ko: '과제 제출일, 시험 범위', description_en: 'Deadlines and scope', description_ja: '締切、試験範囲', description_zh: '截止日期，范围', description_tw: '截止日期', description_vi: 'Hạn chót và phạm vi' },
            { id: 'library', title_ko: '도서관 이용', title_en: 'Library Services', title_ja: '図書館利用', title_zh: '图书馆服务', title_tw: '圖書館服務', title_vi: 'Dịch vụ thư viện', description_ko: '도서 대출, 연체료 확인', description_en: 'Borrowing and late fees', description_ja: '貸出、延滞料金', description_zh: '借书，罚金', description_tw: '借書', description_vi: 'Mượn sách và phí trễ' }
        ]
    },
    {
        id: 'interview', emoji: '👔',
        title_ko: '취업 면접', title_en: 'Job Interview',
        title_ja: '採用面接', title_zh: '面试', title_tw: '面試', title_vi: 'Phỏng vấn xin việc',
        description_ko: '자기소개, 경력 질문, 연봉', description_en: 'Introductions, experience, and salary',
        description_ja: '自己紹介、キャリア、年収', description_zh: '自我介绍，经验，薪资', description_tw: '自我介紹，經驗，薪資', description_vi: 'Giới thiệu, kinh nghiệm và lương',
        color: 'from-cyan-900/40 to-cyan-600/20', border: 'border-cyan-500/30',
        level: '중급', turns: 15,
        subScenarios: [
            { id: 'me', title_ko: '자기소개/강점', title_en: 'Self-Intro', title_ja: '自己紹介', title_zh: '自我介绍', title_tw: '自我介紹', title_vi: 'Giới thiệu bản thân', description_ko: '핵심 역량, 지원 동기', description_en: 'Core skills and motivation', description_ja: '強み、志望動機', description_zh: '核心竞争力，动机', description_tw: '核心競爭力', description_vi: 'Kỹ năng cốt lõi và động lực' },
            { id: 'experience', title_ko: '경력 및 기술 질문', title_en: 'Past Experience', title_ja: '経歴・スキル', title_zh: '经验与技能', title_tw: '經驗與技能', title_vi: 'Kinh nghiệm cũ', description_ko: '과거 프로젝트 성과', description_en: 'Project achievements', description_ja: 'プロジェクトの実績', description_zh: '项目成果', description_tw: '項目成果', description_vi: 'Thành tựu dự án' },
            { id: 'salary', title_ko: '연봉 및 복지 논의', title_en: 'Terms & Benefits', title_ja: '条件・福利厚生', title_zh: '薪资与福利', title_tw: '薪資與福利', title_vi: 'Điều khoản & Phúc lợi', description_ko: '최종 처우 협상', description_en: 'Final negotiations', description_ja: '最終交渉', description_zh: '最终谈判', description_tw: '最終談判', description_vi: 'Đàm phán cuối cùng' }
        ]
    },
    {
        id: 'directions', emoji: '🗺️',
        title_ko: '길찾기', title_en: 'Finding Ways',
        title_ja: '道案内', title_zh: '问路', title_tw: '問路', title_vi: 'Chỉ đường',
        description_ko: '길 묻기, 소요 시간, 랜드마크', description_en: 'Directions, time, and landmarks',
        description_ja: '道を聞く、所要時間、目印', description_zh: '问路，时间，地标', description_tw: '問路，時間，地標', description_vi: 'Chỉ đường, thời gian và địa标',
        color: 'from-lime-900/40 to-lime-600/20', border: 'border-lime-500/30',
        level: '입문', turns: 15,
        subScenarios: [
            { id: 'asking', title_ko: '길 묻기/위치 찾기', title_en: 'Asking Directions', title_ja: '道を聞く', title_zh: '问路', title_tw: '問路', title_vi: 'Hỏi đường', description_ko: '가장 가까운 역/상점', description_en: 'Nearest station/shop', description_ja: '最寄り駅、店', description_zh: '最近的车站/商店', description_tw: '最近的車站', description_vi: 'Ga/Cửa hàng gần nhất' },
            { id: 'time', title_ko: '소요 시간/방법', title_en: 'Method & Time', title_ja: '移動手段・時間', title_zh: '交通手段与时间', title_tw: '交通手段與時間', title_vi: 'Phương thức & Thời gian', description_ko: '도보 vs 대중교통', description_en: 'Walking vs Transport', description_ja: '徒歩 vs 公共交通機関', description_zh: '步行 vs 公共交通', description_tw: '步行', description_vi: 'Đi bộ vs Giao thông' },
            { id: 'landmark', title_ko: '랜드마크 추천', title_en: 'Landmarks', title_ja: '目印の案内', title_zh: '地标推荐', title_tw: '地標推薦', title_vi: 'Điểm tham quan', description_ko: '관광지 가는 법', description_en: 'Tourist spots', description_ja: '観光地への行き方', description_zh: '景点路线', description_tw: '景點路線', description_vi: 'Địa điểm du lịch' }
        ]
    },
    {
        id: 'emergency', emoji: '🚨',
        title_ko: '비상 상황', title_en: 'Emergency',
        title_ja: '緊急事態', title_zh: '紧急情况', title_tw: '緊急情況', title_vi: 'Tình huống khẩn cấp',
        description_ko: '분실물, 사고 신고, 대사관', description_en: 'Lost items, accidents, and embassy',
        description_ja: '紛失物、事故報告、大使館', description_zh: '丢失物品，报警，大使馆', description_tw: '丟失物品，報警，大使館', description_vi: 'Mất đồ, tai nạn và đại sứ quán',
        color: 'from-red-900/40 to-red-600/20', border: 'border-red-500/30',
        level: '초급', turns: 15,
        subScenarios: [
            { id: 'lost', title_ko: '분실물 신고', title_en: 'Lost Item', title_ja: '紛失物届', title_zh: '丢失物品', title_tw: '丟失物品', title_vi: 'Mất đồ', description_ko: '지급한 물건 인상착의', description_en: 'Item description', description_ja: '持ち物の説明', description_zh: '物品描述', description_tw: '物品描述', description_vi: 'Mô tả đồ mẩt' },
            { id: 'accident', title_ko: '사고/범죄 신고', title_en: 'Accident/Crime', title_ja: '事故・犯罪報告', title_zh: '事故/犯罪报告', title_tw: '事故/犯罪報告', title_vi: 'Tai nạn/Tội phạm', description_ko: '도움 요청, 상황 설명', description_en: 'Help and details', description_ja: '助け、状況説明', description_zh: '寻求帮助，描述详情', description_tw: '尋求幫助', description_vi: 'Trợ giúp và chi tiết' },
            { id: 'embassy', title_ko: '대사관 도움 요청', title_en: 'Embassy Help', title_ja: '大使館への連絡', title_zh: '寻求大使馆帮助', title_tw: '尋求大使館幫助', title_vi: 'Hỗ trợ đại sứ quán', description_ko: '여권 분실 시 연락', description_en: 'Passport loss', description_ja: 'パスポート紛失', description_zh: '护照丢失', description_tw: '護照丟失', description_vi: 'Mất hộ chiếu' }
        ]
    },
    {
        id: 'hobbies', emoji: '🎬',
        title_ko: '취미/영화', title_en: 'Hobbies & Media',
        title_ja: '趣味/映画', title_zh: '兴趣/电影', title_tw: '興趣/電影', title_vi: 'Sở thích/Phim ảnh',
        description_ko: '취미 공유, 영화 예매, 공연', description_en: 'Hobbies, movies, and shows',
        description_ja: '趣味、映画予約、公演', description_zh: '分享兴趣，订电影票，演出', description_tw: '分享興趣，訂電影票', description_vi: 'Sở thích, phim ảnh và show diễn',
        color: 'from-fuchsia-900/40 to-fuchsia-600/20', border: 'border-fuchsia-500/30',
        level: '입문', turns: 15,
        subScenarios: [
            { id: 'sharing', title_ko: '취미 공유하기', title_en: 'Sharing Hobbies', title_ja: '趣味を共有する', title_zh: '分享兴趣', title_tw: '分享興趣', title_vi: 'Chia sẻ sở thích', description_ko: '좋아하는 활동 토크', description_en: 'Favorite activities', description_ja: '好きな活動', description_zh: '喜欢的活动', description_tw: '喜歡的活動', description_vi: 'Hoạt động yêu thích' },
            { id: 'movie', title_ko: '영화 예매 및 추천', title_en: 'Movies', title_ja: '映画予約', title_zh: '电影', title_tw: '電影', title_vi: 'Phim ảnh', description_ko: '장르 선택, 상영 시간', description_en: 'Genres and timing', description_ja: 'ジャンル、上映時間', description_zh: '类型，排片', description_tw: '類型，排片', description_vi: 'Thể loại và thời gian' },
            { id: 'performance', title_ko: '공연/스포츠 관람', title_en: 'Performances', title_ja: '公演/スポーツ観戦', title_zh: '演出', title_tw: '演出', title_vi: 'Nghệ thuật biểu diễn', description_ko: '티켓 등급, 입장 안내', description_en: 'Tickets and entry', description_ja: 'チケット、入場案内', description_zh: '票务，入场', description_tw: '票務，入場', description_vi: 'Vé và cổng vào' }
        ]
    },
    {
        id: 'appointments', emoji: '📅',
        title_ko: '날씨와 약속', title_en: 'Schedule & Weather',
        title_ja: '天気と約束', title_zh: '天气与预约', title_tw: '天氣與預約', title_vi: 'Thời tiết và Hẹn gặp',
        description_ko: '날씨 확인, 시간/장소 약속', description_en: 'Weather and appointments',
        description_ja: '天気、時間/場所の約束', description_zh: '查看天气，约定时间/地点', description_tw: '查看天氣', description_vi: 'Thời tiết và hẹn gặp',
        color: 'from-teal-900/40 to-teal-600/20', border: 'border-teal-500/30',
        level: '입문', turns: 15,
        subScenarios: [
            { id: 'weather', title_ko: '날씨 묻기/답하기', title_en: 'Weather Talk', title_ja: '天気の話題', title_zh: '谈论天气', title_tw: '談論天氣', title_vi: 'Trò chuyện thời tiết', description_ko: '오늘의 기온, 외출 복장', description_en: 'Temperature and clothes', description_ja: '気温、服装', description_zh: '温度，着装', description_tw: '溫度，著裝', description_vi: 'Nhiệt độ và trang phục' },
            { id: 'setting', title_ko: '시간/장소 정하기', title_en: 'Setting Meeting', title_ja: '日時/場所の設定', title_zh: '预定会议', title_tw: '預定會議', title_vi: 'Đặt cuộc hẹn', description_ko: '만남 시간 조율', description_en: 'Coordinate time', description_ja: '時間の調整', description_zh: '协调时间', description_tw: '協調時間', description_vi: 'Điều phối thời gian' },
            { id: 'rescheduling', title_ko: '약속 변경/취소', title_en: 'Rescheduling', title_ja: '時間の変更/再開', title_zh: '重新安排', title_tw: '重新安排', title_vi: 'Thay đổi lịch hẹn', description_ko: '불참 통보, 사과하기', description_en: 'Cancellations and apologies', description_ja: 'キャンセル、謝罪', description_zh: '取消，道歉', description_tw: '取消，道歉', description_vi: 'Hủy hẹn và xin lỗi' }
        ]
    }
];

const globalStyles = `
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
`;

export function ConversationListScreen({ settings, setScreen, setActiveScenario, convLevel, setConvLevel, setAiReportMode }: any) {
    const lang = settings?.lang || 'ko';
    const t = (key: string) => globalT(lang, key) || key;
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const checkHasResult = (scId: string, subId: string) => {
        const saved = localStorage.getItem(`vq_rep_${scId}_${subId}`);
        if (!saved) return null;
        try {
            return JSON.parse(saved);
        } catch { return null; }
    };

    return (
        <div className="w-full flex-1 animate-fade-in bg-[#0A0A0E] flex flex-col sm:max-h-[720px] sm:rounded-[32px] sm:shadow-2xl">
            <style>{globalStyles}</style>
            <header className="flex items-center justify-between px-5 py-2 sticky top-0 bg-[#0A0A0E]/90 backdrop-blur-md z-10 border-b border-white/5" style={{ paddingTop: 'var(--safe-area-top)' }}>
                <button onClick={() => setScreen('HOME')} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full text-slate-400"><X size={16} /></button>
                <div className="text-center">
                    <h2 className="text-[15px] font-black text-white flex items-center justify-center gap-2 italic">
                        {t('conv_ai_header')}
                    </h2>
                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">{t('conv_feedback_desc')}</p>
                </div>
                <div className="w-8" />
            </header>

            <div className="px-5 py-4 bg-[#0A0A0E] flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
                {CEFR_LEVELS.map(lvl => (
                    <button key={lvl.code} onClick={() => setConvLevel(lvl.code)}
                        className={`min-w-[80px] py-2.5 rounded-2xl border transition-all font-black text-xs ${convLevel === lvl.code ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                        {lvl.code}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-2 space-y-4 scrollbar-hide pb-20">
                {SCENARIOS.map((sc: Scenario) => {
                    const isExpanded = expandedId === sc.id;
                    const subCount = sc.subScenarios?.length || 0;

                    return (
                        <div key={sc.id} className="space-y-3">
                            {/* MAIN CARD */}
                            <div
                                onClick={() => setExpandedId(isExpanded ? null : sc.id)}
                                className={`relative p-4 rounded-[28px] bg-gradient-to-br ${sc.color} border ${sc.border} transition-all duration-300 ${isExpanded ? 'ring-2 ring-indigo-500/50 shadow-2xl scale-[1.01]' : 'opacity-90'}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 flex items-center justify-center text-3xl drop-shadow-md">
                                        {sc.emoji}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="bg-sky-400 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                                <Sparkles size={8} /> {t(`level_${sc.level_key || 'beginner'}`)}
                                            </span>
                                            <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest">{t('conv_turns_suffix').replace('{n}', (sc.turns || 15).toString())}</span>
                                        </div>
                                        <h3 className="font-black text-white text-[16px] tracking-tight mb-0.5">
                                            {String(sc[`title_${settings.lang}`] || sc.title_en)}
                                        </h3>
                                        <p className="text-[10px] font-bold text-white/50 leading-tight">
                                            {String(sc[`description_${settings.lang}`] || sc.description_en)}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="text-[8px] font-black text-white/40">{subCount} SUB</div>
                                        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                            <ChevronDown size={16} className="text-white/40" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SUB SCENARIOS */}
                            {isExpanded && (
                                <div className="space-y-2 animate-slide-down">
                                    {sc.subScenarios?.map((sub: any) => {
                                        const resultBundle = checkHasResult(sc.id, sub.id);
                                        return (
                                            <div
                                                key={sub.id}
                                                className="bg-[#16161D] rounded-[24px] p-5 border border-white/5 shadow-lg flex items-center justify-between group active:scale-[0.98] transition-all">
                                                <div
                                                    onClick={() => {
                                                        setActiveScenario({ ...sc, subScSelected: sub });
                                                        setScreen('CONVERSATION');
                                                    }}
                                                    className="flex-1 cursor-pointer">
                                                    <h4 className="text-white text-[15px] font-black tracking-tight mb-1">{sub[`title_${lang}`] || sub.title_ko}</h4>
                                                    <p className="text-slate-500 text-[11px] font-bold italic">{sub[`description_${lang}`] || sub.description_ko}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {resultBundle && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="bg-indigo-600/10 text-indigo-400 px-2 py-1 rounded-lg text-[9px] font-black border border-indigo-500/20 uppercase tracking-tighter">
                                                                {resultBundle.level || 'B1'}
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    setAiReportMode('CONVERSATION');
                                                                    setActiveScenario({ ...sc, subScSelected: sub });
                                                                    setScreen('AI_REPORT');
                                                                }}
                                                                className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-[10px] font-black shadow-lg shadow-indigo-600/20 active:scale-95 transition-all">
                                                                {t('conv_check_result')}
                                                            </button>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setActiveScenario({ ...sc, subScSelected: sub });
                                                            setScreen('CONVERSATION');
                                                        }}
                                                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-active:text-white group-active:bg-indigo-600 transition-all">
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function ConversationScreen({ settings, setScreen, activeScenario, convLevel, aiUsage, incrementAiUsage, isPremium, setMyPhrases, setAiReportMode, setShowApiModal }: any) {
    const sc: Scenario = activeScenario;
    const MAX_TURNS = 15;
    const lang = settings?.lang || 'ko';
    const t = (key: string) => globalT(lang, key) || key;

    const [messages, setMessages] = useState<ChatMsg[]>([]);
    const [turnCount, setTurnCount] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [inputLang, setInputLang] = useState('en');
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const isStarting = useRef(false);

    const triggerToast = (msg: string) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
    };

    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const webRecognitionRef = useRef<any>(null); // 웹 음성 인식 인스턴스 관리용 추가

    // 메시지 변경 시 스크롤 처리
    useEffect(() => { 
        if (scrollContainerRef.current) {
            // 웹 환경에서 전체 페이지 스크롤을 유발하는 scrollIntoView 대신 scrollTo 사용
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        } else {
            // fallback
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); 
        }
    }, [messages]);

    useEffect(() => {
        if (messages.length === 0 && !isLoading && !isStarting.current) {
            isStarting.current = true;
            startAiConversation();
        }

        return () => { 
            stopTTS();
            SpeechRecognition.removeAllListeners().catch(() => {});
        };
    }, []);

    const startAiConversation = async () => {
        setIsLoading(true);
        const scenarioId = sc.id;
        const subScenarioId = sc.subScSelected?.id;
        const subScriptKey = subScenarioId ? `${scenarioId}_${subScenarioId}` : null;
        const scriptedTurns = subScriptKey ? (SCENARIO_SCRIPTS as any)[subScriptKey] : (sc.subScSelected ? null : (SCENARIO_SCRIPTS as any)[scenarioId]);

        if (scriptedTurns && scriptedTurns.length > 0) {
            const first = scriptedTurns[0];
            // Use ai_ko for AI text translation, NOT guide.hint_ko
            const newMsg: ChatMsg = {
                role: 'model',
                text: first.ai,
                guide: first.guide,
                translation: (first as any)[`ai_${lang}`] || first.ai_ko || ""
            };
            setMessages([newMsg]);
            playTTS(newMsg.text);
            setIsLoading(false);
        } else {
            const scenarioContext = sc.subScSelected 
                ? `${sc.title_en} (${sc.subScSelected.title_en}: ${sc.subScSelected.description_en})`
                : sc.title_en;
            const prompt = `Start the roleplay as a professional staff in the following situation: ${scenarioContext}. Be welcoming and start the conversation naturally.`;
            await callGemini(prompt, [], true);
            setIsLoading(false);
        }
    };

    const callGemini = async (_promptText: string, history: any[], autoSpeak: boolean = true) => {
        const userSavedKey = localStorage.getItem('vq_gemini_key');
        const activeKey = getActiveApiKey(userSavedKey, isPremium, aiUsage);

        if (!activeKey) {
            if (setShowApiModal) setShowApiModal(true);
            return;
        }

        // 사용 성공 시점에 카운트 증가
        if (incrementAiUsage && !incrementAiUsage()) return;

        // AI가 상황에 더 몰입하고 창의적으로 답변하도록 프롬프트 대폭 강화
        // ─── MASTER PROMPT DESIGN (As per User Confirmation) ───
        const getCulturalHint = (lang: string) => {
            switch (lang) {
                case 'ko': return "Korean student: Focus on honorifics and polite workplace English. Address common Konglish mistakes.";
                case 'ja': return "Japanese student: Focus on natural rhythm/intonation and overcoming 'Katakana English' pronunciation patterns.";
                case 'zh': return "Chinese student: Focus on accurate tense usage and varied sentence structures beyond subject-verb-object.";
                case 'tw': return "Taiwanese student: Focus on natural idiomatic expressions and colloquial business English.";
                case 'vi': return "Vietnamese student: Focus on final consonant sounds and plural/singular distinction in English.";
                default: return "International student: Focus on general fluency and natural phrasing.";
            }
        };

        const getLevelInstruction = (level: string) => {
            switch (level) {
                case 'A1': return "LEVEL A1: Use EXTREMELY SHORT sentences (max 5-7 words). Simple nouns/verbs only. Be repetitive and very slow.";
                case 'A2': return "LEVEL A2: Use short sentences (max 10 words). Basic past/future tenses. Clear, daily vocabulary.";
                case 'B1': return "LEVEL B1: Use standard sentences with basic conjunctions. Natural but avoid complex idioms.";
                case 'B2': return "LEVEL B2: Use natural variety, advanced words, and common idiomatic expressions. Fluent pace.";
                case 'C1': return "LEVEL C1: Professional/Academic nuance. Suble emotional cues and high-level idioms. Intellectual peer style.";
                case 'C2': return "LEVEL C2: Mastery level. Use complex sentence structures, rare idioms, and academic field-specific jargon naturally.";
                default: return "Natural conversation matching user's pace.";
            }
        };

        // Retrieve self-learning memory from previous sessions
        const scId = sc.id;
        const subId = sc.subScSelected?.id || 'default';
        const memoryKey = `vq_reflection_${scId}_${subId}`;
        const lessonsLearned = localStorage.getItem(memoryKey) || "No previous focus. Lead a natural start.";

        const langMap: any = { ko: 'Korean', ja: 'Japanese', zh: 'Chinese', tw: 'Traditional Chinese', vi: 'Vietnamese' };
        const targetLangName = langMap[lang] || 'Korean';

        const subSc = sc.subScSelected;
        const identityContext = subSc 
            ? `${sc.title_en} / Situation: ${subSc.title_en}`
            : sc.title_en;
        const missionGoal = subSc 
            ? `Your specific goal is to handle: "${subSc.description_en}".`
            : `Handle the general situation of ${sc.title_en} professionally.`;

        const systemInstruction = `You are a professional ${identityContext} staff. You MUST follow these 5 Fundamental Rules:
        1. IDENTITY: Fully embody your role at ${identityContext}. Use industry-specific terminology and etiquette.
        2. CONSISTENCY: Never break character. If the user goes off-topic, politely guide them back.
        3. MISSION: ${missionGoal} Lead the conversation educationally with natural questions and hints.
        4. TURN STRATEGY: This is turn ${turnCount + 1} of 15. Manage the flow logically: [Intro -> Core Interaction -> Closing].
        5. CULTURAL SENSITIVITY: ${getCulturalHint(lang)}

        LEARNER LEVEL: ${convLevel}
        ${getLevelInstruction(convLevel)}

        SELF-LEARNING (Lessons from previous sessions): ${lessonsLearned}

        MISSION: Lead a natural, engaging conversation. Return ONLY valid JSON:
        {
          "ai_text": "Your natural response (context-aware)",
          "translation": "${targetLangName} translation of ai_text",
          "user_correction": "A better version of the user's last message (Always provide this)",
          "correction_trans": "${targetLangName} translation of user_correction",
          "user_original_trans": "${targetLangName} translation of the user's original raw input",
          "explanation": "Brief coach tip in ${targetLangName} explaining HOW the user should answer your(AI's) latest question naturally and strategically.",
          "recommended_sentence": "One natural English sentence the user can say in this situation",
          "is_complete": "Set to true ONLY if the conversation has naturally reached its conclusion (e.g., goodbye, thank you after a finished task). Otherwise false."
        }`;

        try {
            let normalizedHistory = history.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: (typeof m.text === 'string' ? m.text : (m.parts?.[0]?.text || "")) }]
            })).filter(h => h.parts[0].text.trim() !== "");

            if (normalizedHistory.length === 0) {
                normalizedHistory.push({ role: 'user', parts: [{ text: _promptText || "Hello" }] });
            } else if (normalizedHistory[0].role === 'model') {
                normalizedHistory.unshift({ role: 'user', parts: [{ text: `Hello, I am at ${sc.title_en} for ${sc.subScSelected?.title_en || 'a conversation'}.` }] });
            }

            const finalHistory: any[] = [];
            normalizedHistory.forEach((msg, idx) => {
                if (idx > 0 && finalHistory[finalHistory.length - 1].role === msg.role) {
                    finalHistory[finalHistory.length - 1].parts[0].text += " " + msg.parts[0].text;
                } else {
                    finalHistory.push(msg);
                }
            });

            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${LIGHTWEIGHT_MODEL}:generateContent?key=${activeKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: finalHistory,
                    system_instruction: { parts: [{ text: systemInstruction }] },
                    generationConfig: {
                        response_mime_type: "application/json",
                        temperature: 0.8,
                        topP: 0.95
                    }
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                console.error("Gemini API Error:", res.status, errData);
                // Inform user about the specific error if it's a quote limit or key issue
                const errMsg = errData?.error?.message || t('connection_error');
                setMessages(prev => [...prev.filter(m => m.text !== "..."), {
                    role: 'model',
                    text: `I'm sorry, I encountered an error: ${errMsg}`,
                    translation: t('connection_error_ko')
                }]);
                return;
            }

            const data = await res.json();
            const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            let parsed: any = {};
            try {
                parsed = JSON.parse(raw);
            } catch (e) {
                const jsonMatch = raw.match(/\{[\s\S]*\}/);
                parsed = JSON.parse(jsonMatch ? jsonMatch[0] : "{}");
            }

            // AI가 멍청하게 보이지 않도록 기본 메시지도 상황에 맞춰 변경
            const aiText = parsed.ai_text || parsed.ai || parsed.text || "That's interesting! What else can you tell me?";
            
            const newMsg: ChatMsg = {
                role: 'model', text: aiText,
                translation: parsed.translation || parsed.trans || "",
                explanation: parsed.explanation || "",
                recommendedSentence: parsed.recommended_sentence || ""
            };

            if (parsed.user_correction) {
                setMessages(prev => {
                    const next = [...prev.filter(m => m.text !== "...")];
                    for (let i = next.length - 1; i >= 0; i--) {
                        if (next[i].role === 'user') {
                            next[i] = { 
                                ...next[i], 
                                translation: parsed.user_original_trans || next[i].translation || "",
                                correctedText: parsed.user_correction, 
                                correctedTrans: parsed.correction_trans || "" 
                            };
                            break;
                        }
                    }
                    return [...next, newMsg];
                });
            } else {
                setMessages(prev => [...prev.filter(m => m.text !== "..."), newMsg]);
            }

            if (parsed.is_complete === true || parsed.is_complete === 'true') {
                setTimeout(() => {
                    setIsComplete(true);
                    performReflection([...history, { role: 'model', text: aiText } as any]);
                }, 3000);
            }

            if (autoSpeak) playTTS(aiText);
        } catch (e) {
            console.error("Call Gemini Failed:", e);
            setMessages(prev => [...prev.filter(m => m.text !== "..."), { role: 'model', text: t('gemini_error_fallback'), translation: t('gemini_error_fallback_ko') }]);
        }
    };

    const performReflection = async (history: ChatMsg[]) => {
        const userSavedKey = localStorage.getItem('vq_gemini_key');
        const activeKey = getActiveApiKey(userSavedKey, isPremium, aiUsage);
        if (!activeKey) return;

        const reflectionPrompt = `You are a professional AI English Coach analyzing the session you just completed.
        - ROLE: ${sc.title_en}
        - STUDENT LEVEL: ${convLevel}
        - DIALOGUE LOG: ${history.map(m => `[${m.role}] ${m.text}`).join('\n')}

        TASK: Reflect on this session. What was the most effective educational strategy used? What could be improved for the next student of this same level and scenario?
        Return a single, concise sentence in English (max 25 words) that will be used as your 'memory' for the next session.
        Example: "Prioritize explaining check-in terminology more simply, as the student struggled with the word 'reservation'."`;

        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${LIGHTWEIGHT_MODEL}:generateContent?key=${activeKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: reflectionPrompt }] }] })
            });
            const data = await res.json();
            const reflection = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

            if (reflection) {
                const scId = sc.id;
                const subId = sc.subScSelected?.id || 'default';
                localStorage.setItem(`vq_reflection_${scId}_${subId}`, reflection.trim());
                console.log("Self-reflection saved:", reflection);
            }
        } catch (e) {
            console.error("Reflection failed:", e);
        }
    };

    const appendMessage = (text: string) => {
        if (!text.trim() || isLoading) return;
        const userMsg: ChatMsg = { role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        // No turnCount increment here as it's not a complete turn yet
    };

    const sendMessage = async (text: string) => {
        const trimmedText = text.trim();
        if (isLoading) return;

        // 메시지 전송 시 마이크가 켜져있다면 중지 및 상태 초기화 (fire-and-forget, 블로킹 방지)
        const isWeb = typeof (window as any).Capacitor === 'undefined' || (window as any).Capacitor.getPlatform() === 'web';
        if (!isWeb && isListening) {
            SpeechRecognition.stop().catch(() => {});
            setIsListening(false);
        }
        
        // input이 있고 아직 추가되지 않았다면 추가 (사용자가 +를 안누르고 바로 보내기를 눌렀을 경우 대비)
        let finalHistory = [...messages];
        if (trimmedText) {
            const userMsg: ChatMsg = { role: 'user', text: trimmedText };
            finalHistory = [...finalHistory, userMsg];
            setMessages(finalHistory);
            setInput('');
        }

        if (finalHistory.length === 0 || finalHistory[finalHistory.length - 1].role !== 'user') return;

        setTurnCount(prev => prev + 1);

        if (turnCount + 1 >= MAX_TURNS) {
            setIsLoading(true);
            try {
                await callGemini(trimmedText || finalHistory[finalHistory.length-1].text, finalHistory);
                setTimeout(() => {
                    setIsComplete(true);
                    performReflection([...finalHistory, { role: 'model', text: 'Finalizing...' } as any]);
                }, 3000);
            } finally {
                setIsLoading(false);
            }
            return;
        }

        setIsLoading(true);
        try {
            await callGemini(trimmedText || finalHistory[finalHistory.length-1].text, finalHistory);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSpeech = async () => {
        if (isLoading) return; // AI 답변 중에는 마이크 작동 방지

        try {
            const isWeb = typeof (window as any).Capacitor === 'undefined' || (window as any).Capacitor.getPlatform() === 'web';
            const WebSR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            // 1. Web 환경일 경우
            if (isWeb && WebSR) {
                if (isListening) {
                    if (webRecognitionRef.current) {
                        try { webRecognitionRef.current.stop(); } catch (e) { }
                        webRecognitionRef.current = null;
                    }
                    setIsListening(false);
                    return;
                }

                setIsListening(true);
                const recognition = new WebSR();
                webRecognitionRef.current = recognition;

                const langMap: any = { ko: 'ko-KR', en: 'en-US', ja: 'ja-JP', zh: 'zh-CN', tw: 'zh-TW', vi: 'vi-VN' };
                recognition.lang = langMap[inputLang] || 'en-US';
                recognition.interimResults = true;
                recognition.continuous = false;

                recognition.onresult = (e: any) => {
                    const transcript = Array.from(e.results).map((result: any) => result[0].transcript).join('');
                    setInput(transcript);
                };
                recognition.onerror = (e: any) => {
                    console.error('Web SR Error:', e);
                    setIsListening(false);
                    webRecognitionRef.current = null;
                };
                recognition.onend = () => {
                    setIsListening(false);
                    webRecognitionRef.current = null;
                };
                recognition.start();
                return;
            }

            // 2. Native (Capacitor) 환경일 경우
            if (!isWeb) {
                let isNativeSupport = false;
                try {
                    const { available } = await SpeechRecognition.available();
                    isNativeSupport = available;
                } catch (e: any) {
                    console.warn("Speech plugin error (likely UNIMPLEMENTED on iOS):", e);
                    isNativeSupport = false; // 안전하게 fallback 모드로 우회
                }

                if (!isNativeSupport) {
                    // Native 지원 안될 경우 WebSR 시도 (하이브리드 지원용 또는 알림 창)
                    if (WebSR && !(window as any).Capacitor?.isNativePlatform?.()) {
                        if (isListening) {
                            if (webRecognitionRef.current) {
                                try { webRecognitionRef.current.stop(); } catch (e) { }
                                webRecognitionRef.current = null;
                            }
                            setIsListening(false);
                            return;
                        }
                        setIsListening(true);
                        const rec = new WebSR();
                        webRecognitionRef.current = rec;
                        rec.lang = (inputLang === 'ko' ? 'ko-KR' : 'en-US');
                        rec.onresult = (e: any) => {
                            const txt = e.results[0][0].transcript;
                            if (txt) setInput(txt);
                        };
                        rec.onend = () => {
                            setIsListening(false);
                            webRecognitionRef.current = null;
                        };
                        rec.start();
                    } else {
                        const plat = typeof (window as any).Capacitor !== 'undefined' ? (window as any).Capacitor.getPlatform() : 'web';
                        if (plat === 'ios') {
                            alert("현재 iOS 기기에서는 플러그인 업데이트 대기로 인해 마이크 기능을 잠시 사용할 수 없습니다. 텍스트로 입력해 주세요! 📝");
                        } else {
                            alert("기기에서 마이크 기능을 지원하지 않습니다. 텍스트로 입력해 주세요.");
                        }
                        setIsListening(false);
                    }
                    return;
                }

                // 권한 요청 및 체크
                const permissions = await SpeechRecognition.checkPermissions();
                if (permissions.speechRecognition !== 'granted') {
                    const requestResult = await SpeechRecognition.requestPermissions();
                    if (requestResult.speechRecognition !== 'granted') {
                        setIsListening(false);
                        alert('마이크 사용 권한이 거부되었습니다. 앱 설정에서 [음성 인식] 및 [마이크] 권한을 허용해 주세요.');
                        return;
                    }
                }

                if (isListening) {
                    try { await SpeechRecognition.stop(); } catch(e){}
                    setIsListening(false);
                    return;
                }

                // 매번 리스너를 새로 등록하여 안정성 확보
                await SpeechRecognition.removeAllListeners();
                await SpeechRecognition.addListener('partialResults', (data: any) => {
                    if (data.matches && data.matches.length > 0) {
                        setInput(data.matches[0]);
                    }
                });
                await SpeechRecognition.addListener('listeningState', (data: any) => {
                    if (data.status === 'stopped') {
                        setIsListening(false);
                    }
                });

                setIsListening(true);

                // 15초 안전 타임아웃: listeningState 이벤트가 안 올 경우 대비
                setTimeout(() => {
                    setIsListening(prev => {
                        if (prev) {
                            SpeechRecognition.stop().catch(() => {});
                            return false;
                        }
                        return prev;
                    });
                }, 15000);

                try {
                    await SpeechRecognition.start({
                        language: (inputLang === 'ko' ? 'ko-KR' : 'en-US'),
                        partialResults: true,
                        popup: false
                    });
                } catch (startErr: any) {
                    console.error("SR Start Error:", startErr);
                    setIsListening(false);
                    try { await SpeechRecognition.stop(); } catch(e){}
                    alert("마이크 실행에 실패했습니다.\\n아이폰 [설정 > 일반 > 키보드 > 받아쓰기 활성화]가 켜져 있는지 확인해주세요.");
                }
            } else if (!WebSR) {
                alert(t('sr_not_supported'));
            }

        } catch (e: any) {
            console.warn("Microphone Top-level Error intercepted:", e);
            setIsListening(false);
            const plat = typeof (window as any).Capacitor !== 'undefined' ? (window as any).Capacitor.getPlatform() : 'web';
            if (e && e.message && e.message.includes("implemented") && plat === 'ios') {
                alert("현재 버전에서는 마이크 플러그인이 로드되지 않았습니다. 앱을 업데이트해 주세요.");
            } else {
                alert("마이크 실행 오류입니다.\\n아이폰 [설정 > 일반 > 키보드 > 받아쓰기 활성화] 기능이 켜져 있는지 확인해 주세요.");
            }
        }
    };

    if (isComplete) return <CompletionScreen messages={messages} totalTurns={turnCount} onRestart={() => window.location.reload()} onHome={() => setScreen('CONVERSATION_LIST')} setScreen={setScreen} sc={sc} settings={settings} setAiReportMode={setAiReportMode} />;

    return (
        <div className="w-full flex-1 bg-[#0A0A0E] flex flex-col overflow-hidden sm:max-h-[720px] sm:rounded-[32px] sm:shadow-2xl">
            <style>{globalStyles}</style>

            <header className="flex items-center justify-between px-5 py-2 border-b border-white/5 bg-[#0A0A0E]/80 backdrop-blur-md z-20" style={{ paddingTop: 'var(--safe-area-top)' }}>
                <button onClick={() => setScreen('CONVERSATION_LIST')} className="bg-white/5 text-slate-400 rounded-full p-1.5 active:scale-90 transition shadow-sm"><X size={18} /></button>
                <div className="flex flex-col items-center flex-1 mx-4">
                    <div className="flex items-center gap-1.5 mb-1 justify-center w-full">
                        <span className="text-lg">{sc.emoji}</span>
                        <h3 className="text-white font-black text-xs tracking-tight">
                            {sc.subScSelected 
                                ? (sc.subScSelected[`title_${lang}`] || sc.subScSelected.title_ko) 
                                : (sc[`title_${lang}`] || sc.title_ko)}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 w-full max-w-[160px]">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                style={{ width: `${(turnCount / MAX_TURNS) * 100}%` }}></div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 tabular-nums">{turnCount}/{MAX_TURNS}</span>
                    </div>
                </div>
                <button onClick={() => window.location.reload()} className="bg-white/5 text-slate-400 rounded-full p-1.5 active:scale-90 transition shadow-sm"><RotateCcw size={16} /></button>
            </header>

            {/* Toast Notification */}
            <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <div className="bg-[#1e1e2d] border border-indigo-500/30 text-white px-6 py-3 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                        <BookOpen size={16} className="text-white" />
                    </div>
                    <span className="text-sm font-bold tracking-tight">{toastMsg}</span>
                </div>
            </div>

            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-5 space-y-8 scrollbar-hide">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-3 animate-fade-in`}>
                        <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} max-w-[92%]`}>
                            {msg.role === 'model' && (
                                <div className="w-10 h-10 rounded-full bg-[#1e1e2d] border border-white/10 flex items-center justify-center text-xl shrink-0 mt-2 shadow-lg">
                                    {sc.emoji}
                                </div>
                            )}
                            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-3`}>
                                <div className={`px-4 py-3 rounded-[24px] shadow-xl transition-all ${msg.role === 'user' ? 'bg-[#5046e5] text-white rounded-tr-none' : 'bg-[#1e1e2d] text-white border border-white/10 rounded-tl-none'}`}>
                                    <p className="text-[14px] font-bold leading-relaxed">{msg.text}</p>
                                </div>

                                {msg.role === 'model' && (
                                    <div className="flex gap-1.5 ml-1">
                                        <button onClick={() => playTTS(msg.text)} 
                                            disabled={msg.text === '...'}
                                            className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1e1e2d] text-slate-300 border border-white/5 disabled:opacity-30 active:scale-95 transition-all">
                                            <Volume2 size={16} />
                                        </button>
                                        <button onClick={() => setMessages(prev => prev.map((m, i) => i === idx ? { ...m, showTrans: !m.showTrans } : m))}
                                            disabled={msg.text === '...'}
                                            className={`flex items-center justify-center w-9 h-9 rounded-full transition-all border ${msg.showTrans ? 'bg-white text-black' : 'bg-[#1e1e2d] text-slate-300'} border-white/5 disabled:opacity-30 active:scale-95`}>
                                            {msg.showTrans ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                        <button onClick={() => setMessages(prev => prev.map((m, i) => i === idx ? { ...m, showExplanation: !m.showExplanation } : m))}
                                            disabled={msg.text === '...'}
                                            className={`flex items-center justify-center gap-1 px-2.5 h-9 rounded-full transition-all border ${msg.showExplanation ? 'bg-amber-500 text-black' : 'bg-[#1e1e2d] text-amber-500 border-amber-500/30'} disabled:opacity-30 active:scale-95`}>
                                            <Lightbulb size={16} /> <ChevronDown size={12} />
                                        </button>
                                        <button onClick={() => {
                                            const newPhrase = {
                                                id: Date.now(),
                                                original: msg.text,
                                                english: msg.text,
                                                englishPronunciation: "",
                                                nativeTranslation: msg.translation || "",
                                                nativeTranslationLoc: { [lang]: msg.translation || "" },
                                                originalPronunciation: "",
                                                inputLangCode: "en",
                                                categoryId: 'ai_conv',
                                                createdAt: new Date().toLocaleDateString(lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : 'en-US')
                                            };
                                            setMyPhrases((p: any) => Array.isArray(p) ? [newPhrase, ...p] : [newPhrase]);
                                            triggerToast(t('toast_saved_ko'));
                                        }} 
                                            disabled={msg.text === '...'}
                                            className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1e1e2d] text-indigo-400 border border-white/5 disabled:opacity-30 active:scale-95 transition-all">
                                            <BookOpen size={16} />
                                        </button>
                                    </div>
                                )}

                                {msg.role === 'user' && (
                                    <div className="flex gap-4 pr-3 opacity-60">
                                        <button onClick={() => playTTS(msg.text)} className="text-white"><Volume2 size={16} /></button>
                                        <button onClick={() => setMessages(prev => prev.map((m, i) => i === idx ? { ...m, showTrans: !m.showTrans } : m))} className="text-white"><Eye size={16} /></button>
                                        <button onClick={() => {
                                            const newPhrase = {
                                                id: Date.now(),
                                                original: msg.text,
                                                english: msg.correctedText || msg.text,
                                                englishPronunciation: "",
                                                nativeTranslation: msg.correctedTrans || msg.translation || "",
                                                nativeTranslationLoc: { [lang]: msg.correctedTrans || msg.translation || "" },
                                                originalPronunciation: "",
                                                inputLangCode: inputLang,
                                                categoryId: 'ai_conv',
                                                createdAt: new Date().toLocaleDateString(lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : 'en-US')
                                            };
                                            setMyPhrases((p: any) => Array.isArray(p) ? [newPhrase, ...p] : [newPhrase]);
                                            triggerToast(t('toast_saved_ko'));
                                        }} className="text-white active:scale-90 transition"><BookOpen size={16} /></button>
                                    </div>
                                )}

                                {msg.role === 'user' && msg.correctedText && (
                                    <div className="mr-1 mt-1 p-5 rounded-[28px] bg-[#1e1e2d] border border-emerald-500/20 self-end max-w-[95%] shadow-xl relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2 text-emerald-400">
                                                <ShieldCheck size={14} /> <span className="text-[10px] font-black uppercase">{t('ai_correction_label')}</span>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const newPhrase = {
                                                        id: Date.now(),
                                                        original: msg.text,
                                                        english: msg.correctedText,
                                                        englishPronunciation: "",
                                                        nativeTranslation: msg.correctedTrans || "",
                                                        nativeTranslationLoc: { [lang]: msg.correctedTrans || "" },
                                                        originalPronunciation: "",
                                                        inputLangCode: inputLang,
                                                        categoryId: 'ai_conv',
                                                        createdAt: new Date().toLocaleDateString(lang === 'ko' ? 'ko-KR' : lang === 'ja' ? 'ja-JP' : lang === 'zh' ? 'zh-CN' : 'en-US')
                                                    };
                                                    setMyPhrases((p: any) => Array.isArray(p) ? [newPhrase, ...p] : [newPhrase]);
                                                    triggerToast(t('toast_saved_ko'));
                                                }}
                                                className="text-emerald-400 p-1 hover:bg-emerald-500/10 rounded-lg transition-all active:scale-90"
                                            >
                                                <BookOpen size={16} />
                                            </button>
                                        </div>
                                        <p className="text-[15px] text-white font-bold mb-1">{msg.correctedText}</p>
                                        {msg.correctedTrans && <p className="text-[12px] text-slate-400">{msg.correctedTrans}</p>}
                                    </div>
                                )}

                                {msg.showTrans && msg.translation && (
                                    <div className="ml-1 mt-1 p-5 bg-[#1e1e2d] rounded-[24px] border border-white/5 shadow-xl text-xs font-bold text-[#a5b4fc] max-w-[90%]">
                                        {msg.translation}
                                    </div>
                                )}

                                {msg.showExplanation && (
                                    <div className="mt-2 w-full max-w-[340px] space-y-3">
                                        {msg.explanation && (
                                            <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-[24px] text-[13px] font-bold text-amber-100/90 leading-relaxed animate-fade-in">
                                                <div className="flex items-center gap-2 mb-2.5 text-amber-500">
                                                    <Lightbulb size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">{t('coach_tip_label')}</span>
                                                </div>
                                                <p>{msg.explanation}</p>

                                                {msg.recommendedSentence && (
                                                    <div className="mt-4 pt-4 border-t border-amber-500/20">
                                                        <div className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest mb-2">Recommended Sentence</div>
                                                        <div className="flex items-start gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                                                            <p className="flex-1 text-[14px] text-white font-bold leading-snug">{msg.recommendedSentence}</p>
                                                            <button 
                                                                onClick={() => playTTS(msg.recommendedSentence || "")}
                                                                className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 active:scale-90 transition-transform"
                                                            >
                                                                <Volume2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1e1e2d] flex items-center justify-center shrink-0">
                            <Bot size={20} className="text-indigo-400" />
                        </div>
                        <div className="bg-[#1e1e2d]/50 p-4 rounded-2xl flex items-center justify-center gap-1.5 min-w-[60px]">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <div className="bg-[#0D0D15] border-t border-white/5 px-4 pt-1 pb-1 sm:pb-5" style={{ paddingBottom: 'var(--safe-area-bottom)' }}>
                <div className="flex items-center gap-3 mb-0 overflow-x-auto scrollbar-hide py-1">
                    <div className="flex items-center gap-1.5 opacity-40 shrink-0">
                        <Globe size={10} className="text-slate-400" />
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">LANG</span>
                    </div>
                    <div className="flex gap-1.5 flex-1 justify-between">
                        {INPUT_LANGS.map(lang => (
                            <button key={lang.id} onClick={() => setInputLang(lang.id)}
                                className={`flex flex-col items-center justify-center w-10 h-11 rounded-xl transition-all border-2 ${inputLang === lang.id ? 'bg-[#1e1e2d] border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.4)] scale-105' : 'bg-white/2 border-transparent opacity-30 grayscale'}`}>
                                <img src={lang.flag} alt={lang.label} className="w-6 h-4 rounded-sm object-cover mb-1" />
                                <span className={`text-[8px] font-black ${inputLang === lang.id ? 'text-white' : 'text-slate-500'}`}>{lang.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2.5 items-center">
                    <button onClick={handleSpeech} className={`w-12 h-12 rounded-[20px] flex items-center justify-center transition-all ${isListening ? 'bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)] animate-pulse' : 'bg-[#1e1e2d] text-slate-400'}`}>
                        <Mic size={20} />
                    </button>
                    <div className="flex-1 bg-[#1e1e2d] border border-white/10 rounded-[24px] flex items-center px-4 py-0.5 shadow-inner">
                        <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={t('conv_input_placeholder')}
                            className="flex-1 bg-transparent py-3 text-[14px] text-white outline-none resize-none font-bold placeholder:text-slate-600" rows={1}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }} />
                    </div>
                    <div className="flex gap-1.5">
                        <button onClick={() => appendMessage(input)} disabled={!input.trim() || isLoading}
                            className={`w-[34px] h-12 rounded-[16px] flex items-center justify-center transition-all ${input.trim() ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10' : 'bg-[#1e1e2d] text-slate-700 opacity-50'}`}>
                            <Plus size={18} />
                        </button>
                        <button onClick={() => sendMessage(input)} disabled={(messages.length === 0 && !input.trim()) || isLoading}
                            className={`w-[34px] h-12 rounded-[16px] flex items-center justify-center transition-all ${(input.trim() || messages.length > 0) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-[#1e1e2d] text-slate-700 opacity-50'}`}>
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}


function CompletionScreen({ messages = [], totalTurns, onRestart, onHome, setScreen, sc, settings, setAiReportMode }: any) {
    const lang = settings?.lang || 'ko';
    const t = (key: string) => globalT(lang, key) || key;
    return (
        <div className="screen bg-[#0A0A0E] flex flex-col items-center justify-center p-8 text-center animate-fade-in relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px]"></div>

            <div className="relative z-10 w-full flex flex-col items-center">
                <div className="w-40 h-40 bg-[#1e1e2d] rounded-full border-4 border-white/10 flex items-center justify-center text-7xl shadow-2xl mb-8 relative">
                    {sc.emoji}
                </div>

                <Trophy size={48} className="text-amber-400 mb-6 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />

                <h2 className="text-4xl font-black text-white mb-2 tracking-tighter">{t('conv_complete_title')}</h2>

                <div className="mb-8">
                    <p className="text-slate-400 font-bold text-lg mb-1">{sc[`title_${lang}`] || sc.title_ko}</p>
                    <p className="text-indigo-400 font-black text-sm uppercase tracking-widest">- {(sc.subScSelected?.[`title_${lang}`] || sc.subScSelected?.title_ko) || sc.subject}</p>
                </div>

                <p className="text-slate-500 font-bold mb-12">
                    {t('conv_complete_desc')?.replace('{n}', totalTurns.toString()) || `${totalTurns}턴 대화를 성공적으로 마쳤습니다!`}
                </p>

                <div className="w-full space-y-4 max-w-[320px]">
                    <button
                        onClick={() => {
                                try {
                                    const logEntry = {
                                        scenario: sc.id,
                                        subScenario: sc.subScSelected?.id || 'default',
                                        messages: messages,
                                        date: new Date().toISOString()
                                    };
                                    // Save to scenario-specific key for reliable analysis
                                    localStorage.setItem(`vq_logs_${sc.id}_${sc.subScSelected?.id || 'default'}`, JSON.stringify(messages));
                                    // Also keep it in vq_conv_logs as the most recent session fallback
                                    localStorage.setItem('vq_conv_logs', JSON.stringify([logEntry]));
                                    // Clear the old report so it auto-regenerates for the new session
                                    localStorage.removeItem(`vq_rep_${sc.id}_${sc.subScSelected?.id || 'default'}`);
                                } catch (e) { console.error(e); }
                            
                            setAiReportMode('CONVERSATION');
                            setScreen('AI_REPORT');
                        }}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-[28px] font-black shadow-[0_8px_20px_rgba(79,70,229,0.3)] active:scale-95 transition-all text-lg flex items-center justify-center gap-3 border border-white/10"
                    >
                        <Sparkles size={20} /> {t('conv_report_button')}
                    </button>

                    <button
                        onClick={onRestart}
                        className="w-full bg-[#1e1e2d] text-slate-200 py-5 rounded-[28px] font-black border border-white/10 active:scale-95 transition-all text-lg flex items-center justify-center gap-3 shadow-xl"
                    >
                        <RotateCcw size={20} /> {t('conv_restart_button')}
                    </button>
                    <button
                        onClick={onHome}
                        className="w-full bg-white/5 text-slate-500 py-5 rounded-[28px] font-black active:scale-95 transition-all text-sm uppercase tracking-widest hover:text-slate-400"
                    >
                        {t('conv_select_other_scenario')}
                    </button>
                </div>
            </div>
        </div>
    );
}

const stopTTS = () => {
    ttsStop();
};

const playTTS = (text: string) => {
    playNaturalTTS(text, 'en');
};
