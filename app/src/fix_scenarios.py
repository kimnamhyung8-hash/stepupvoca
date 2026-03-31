
import os

path = r'd:\antigravity\stepupvoca\app\src\ConversationScreens.tsx'
with open(path, 'rb') as f:
    lines = f.readlines()

scenarios_code = """export const SCENARIOS: Scenario[] = [
    {
        id: 'airport', emoji: '✈️',
        title_ko: '공항 및 비행', title_en: 'Airport & Flight', title_ja: '空港と飛行', title_zh: '机场与飞行', title_vi: 'Sân bay & Chuyến bay', title_tw: '機場與飛行',
        level_ko: '⭐⭐ 초급', level_en: '⭐⭐ Beginner', level_ja: '⭐⭐ 初級', level_zh: '⭐⭐ 初级', level_vi: '⭐⭐ Sơ cấp', level_tw: '⭐⭐ 初級',
        subScenarios: [
            {
                id: 'airport_checkin',
                title_ko: '체크인', title_en: 'Check-in', title_ja: 'チェックイン', title_zh: '办理登机', title_vi: 'Làm thủ tục', title_tw: '辦理登機',
                description_ko: '티켓 확인 및 수하물 수속', description_en: 'Ticket verification and luggage check', description_ja: 'チケット確認と手荷物手続き', description_zh: '机票确认与行李托运', description_vi: 'Xác nhận vé và thủ tục hành lý', description_tw: '機票確認與行李托運'
            }
        ]
    },
    {
        id: 'restaurant', emoji: '🍴',
        title_ko: '식당에서', title_en: 'At a Restaurant', title_ja: 'レストランで', title_zh: '在餐厅', title_vi: 'Tại nhà hàng', title_tw: '在餐廳',
        level_ko: '⭐⭐ 초급', level_en: '⭐⭐ Beginner', level_ja: '⭐⭐ 初級', level_zh: '⭐⭐ 初级', level_vi: '⭐⭐ Sơ cấp', level_tw: '⭐⭐ 初級',
        subScenarios: [
            {
                id: 'restaurant_order',
                title_ko: '주문하기', title_en: 'Ordering Food', title_ja: '注文する', title_zh: '点餐', title_vi: 'Đặt món', title_tw: '點餐',
                description_ko: '메뉴 추천 및 식사 주문', description_en: 'Menu recommendation and food order', description_ja: 'メニューのおすすめと注文', description_zh: '推荐菜单与点餐', description_vi: 'Gợi ý thực đơn và đặt món', description_tw: '推薦菜單與點餐'
            }
        ]
    },
    {
        id: 'hotel', emoji: '🏨',
        title_ko: '호텔 이용', title_en: 'At a Hotel', title_ja: 'ホテルで', title_zh: '在酒店', title_vi: 'Tại khách sạn', title_tw: '在酒店',
        level_ko: '⭐⭐ 초급', level_en: '⭐⭐ Beginner', level_ja: '⭐⭐ 初級', level_zh: '⭐⭐ 初级', level_vi: '⭐⭐ Sơ cấp', level_tw: '⭐⭐ 初級',
        subScenarios: [
            {
                id: 'hotel_checkin',
                title_ko: '체크인', title_en: 'Check-in', title_ja: 'チェックイン', title_zh: '办理入住', title_vi: 'Nhận phòng', title_tw: '辦理入住',
                description_ko: '예약 확인 및 객실 안내', description_en: 'Reservation check and room info', description_ja: '予約確認とお部屋の案内', description_zh: '确认预约与房间告知', description_vi: 'Xác nhận đặt phòng và thông tin phòng', description_tw: '確認預約與房間告知'
            }
        ]
    },
    {
        id: 'shopping', emoji: '🛍️',
        title_ko: '쇼핑하기', title_en: 'Shopping', title_ja: 'ショッピング', title_zh: '购物', title_vi: 'Mua sắm', title_tw: '購物',
        level_ko: '⭐⭐ 초급', level_en: '⭐⭐ Beginner', level_ja: '⭐⭐ 初級', level_zh: '⭐⭐ 初级', level_vi: '⭐⭐ Sơ cấp', level_tw: '⭐⭐ 初級',
        subScenarios: [
            {
                id: 'shopping_clothes',
                title_ko: '의류 쇼핑', title_en: 'Clothing Store', title_ja: '服の買い物', title_zh: '衣服购物', title_vi: 'Mua sắm quần áo', title_tw: '衣服購物',
                description_ko: '사이즈 문의 및 결제', description_en: 'Asking for size and payment', description_ja: 'サイズ確認と支払い', description_zh: '询问尺寸与支付', description_vi: 'Hỏi về size và thanh toán', description_tw: '詢問尺寸與支付'
            }
        ]
    },
    {
        id: 'business', emoji: '💼',
        title_ko: '비즈니스', title_en: 'Business', title_ja: 'ビジネス', title_zh: '商务', title_vi: 'Kinh doanh', title_tw: '商務',
        level_ko: '⭐⭐⭐ 중급', level_en: '⭐⭐⭐ Intermediate', level_ja: '⭐⭐⭐ 中級', level_zh: '⭐⭐⭐ 中级', level_vi: '⭐⭐⭐ Trung cấp', level_tw: '⭐⭐⭐ 中級',
        subScenarios: [
            {
                id: 'business_meeting',
                title_ko: '미팅 제안', title_en: 'Proposing Meeting', title_ja: '会議の提案', title_zh: '提议会议', title_vi: 'Đề xuất cuộc họp', title_tw: '提議會議',
                description_ko: '파트너십 제안 및 일정 조율', description_en: 'Proposing partnership and scheduling', description_ja: '提携の提案と日程調整', description_zh: '提议合作与日程安排', description_vi: 'Đề xuất hợp tác và lên lịch', description_tw: '提議合作與日程安排'
            }
        ]
    },
    {
        id: 'hospital', emoji: '🏥',
        title_ko: '병원에서', title_en: 'At the Hospital', title_ja: '病院で', title_zh: '在医院', title_vi: 'Tại bệnh viện', title_tw: '在醫院',
        level_ko: '⭐⭐ 초급', level_en: '⭐⭐ Beginner', level_ja: '⭐⭐ 初級', level_zh: '⭐⭐ 初级', level_vi: '⭐⭐ Sơ cấp', level_tw: '⭐⭐ 初級',
        subScenarios: [
            {
                id: 'hospital_visit',
                title_ko: '진료 받기', title_en: 'Doctor Visit', title_ja: '診察を受ける', title_zh: '看医生', title_vi: 'Khám bệnh', title_tw: '看醫生',
                description_ko: '증상 설명 및 처방', description_en: 'Explaining symptoms and prescription', description_ja: '症状の説明と処方', description_zh: '说明症状与处方', description_vi: 'Giải thích triệu chứng và đơn thuốc', description_tw: '說明症狀與處方'
            }
        ]
    },
    {
        id: 'taxi', emoji: '🚕',
        title_ko: '택시 및 교통', title_en: 'Taxi & Transport', title_ja: 'タクシーと交通', title_zh: '出租车与交通', title_vi: 'Taxi & Giao thông', title_tw: '出租車與交通',
        level_ko: '⭐⭐ 초급', level_en: '⭐⭐ Beginner', level_ja: '⭐⭐ 初級', level_zh: '⭐⭐ 初级', level_vi: '⭐⭐ Sơ cấp', level_tw: '⭐⭐ 初級',
        subScenarios: [
            {
                id: 'taxi_dest',
                title_ko: '목적지 말하기', title_en: 'Setting Destination', title_ja: '目的地を伝える', title_zh: '告知目的地', title_vi: 'Nói điểm đến', title_tw: '告知目的地',
                description_ko: '주소 안내 및 요금 확인', description_en: 'Giving address and checking fare', description_ja: '住所案内と料金確認', description_zh: '告知地址与确认费用', description_vi: 'Chỉ địa chỉ và kiểm tra giá cước', description_tw: '告知地址與確認費用'
            }
        ]
    },
    {
        id: 'cafe', emoji: '☕',
        title_ko: '카페에서', title_en: 'At a Cafe', title_ja: 'カフェで', title_zh: '在咖啡店', title_vi: 'Tại quán cà phê', title_tw: '在咖啡店',
        level_ko: '⭐⭐ 초급', level_en: '⭐⭐ Beginner', level_ja: '⭐⭐ 초級', level_zh: '⭐⭐ 初级', level_vi: '⭐⭐ Sơ cấp', level_tw: '⭐⭐ 初級',
        subScenarios: [
            {
                id: 'cafe_order',
                title_ko: '음료 주문', title_en: 'Ordering Drinks', title_ja: '飲み物の注文', title_zh: '点饮料', title_vi: 'Đặt đồ uống', title_tw: '點飲料',
                description_ko: '커피 주문 및 옵션 선택', description_en: 'Coffee order and options', description_ja: 'コーヒーの注文とオプション', description_zh: '咖啡点单与选项', description_vi: 'Đặt cà phê và các tùy chọn', description_tw: '咖啡點單與選項'
            }
        ]
    },
    {
        id: 'phone', emoji: '📞',
        title_ko: '전화 예약', title_en: 'Phone Reservation', title_ja: '電話予約', title_zh: '电话预约', title_vi: 'Đặt chỗ qua điện thoại', title_tw: '電話預約',
        level_ko: '⭐⭐ 중급', level_en: '⭐⭐ Intermediate', level_ja: '⭐⭐ 中級', level_zh: '⭐⭐ 中级', level_vi: '⭐⭐ Trung cấp', level_tw: '⭐⭐ 中級',
        subScenarios: [
            {
                id: 'phone_reserve',
                title_ko: '식당 예약', title_en: 'Restaurant Booking', title_ja: 'レストラン予約', title_zh: '餐厅预订', title_vi: 'Đặt bàn nhà hàng', title_tw: '餐廳預訂',
                description_ko: '날짜 및 인원 예약', description_en: 'Booking date and guests', description_ja: '日付と人数の予約', description_zh: '预订日期与人数', description_vi: 'Đặt ngày và số lượng người', description_tw: '預訂日期與人數'
            }
        ]
    },
    {
        id: 'school', emoji: '🏫',
        title_ko: '학교 생활', title_en: 'School Life', title_ja: '学校生活', title_zh: '学校生活', title_vi: 'Đời sống học đường', title_tw: '學校生活',
        level_ko: '⭐⭐ 초급', level_en: '⭐⭐ Beginner', level_ja: '⭐⭐ 初級', level_zh: '⭐⭐ 初级', level_vi: '⭐⭐ Sơ cấp', level_tw: '⭐⭐ 初級',
        subScenarios: [
            {
                id: 'school_assignment',
                title_ko: '과제 질문', title_en: 'Assignment Questions', title_ja: '課題の質問', title_zh: '作业提问', title_vi: 'Câu hỏi bài tập', title_tw: '作業提問',
                description_ko: '교수님께 과제 문의', description_en: 'Asking professor about assignment', description_ja: '教授に課題について聞く', description_zh: '向教授询问作业', description_vi: 'Hỏi giáo sư về bài tập', description_tw: '向教授詢問作業'
            }
        ]
    }
];
"""

start_pos = -1
end_pos = -1

for i in range(len(lines)):
    try:
        decoded = lines[i].decode('utf-8')
        if "export const SCENARIOS: Scenario[] =" in decoded:
            start_pos = i
        if "export function ConversationListScreen" in decoded:
            end_pos = i
            break
    except:
        continue

if start_pos != -1 and end_pos != -1:
    print(f"Replacing SCENARIOS from line {start_pos+1} to {end_pos}")
    result = lines[:start_pos] + [scenarios_code.encode('utf-8')] + lines[end_pos:]
    with open(path, 'wb') as f:
        f.writelines(result)
else:
    print(f"Could not find boundaries: {start_pos}, {end_pos}")
