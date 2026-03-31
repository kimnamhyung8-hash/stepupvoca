// src/conversationScripts.ts
// 시나리오별 5-6턴 스크립트 정의

export interface GuideTemplate {
    template: string;
    answer: string;
    options: string[];
    hint_ko: string;
    hint_loc?: Record<string, string>;
}

export interface ScriptTurn {
    ai: string;
    ai_ko?: string;
    ai_ja?: string;
    ai_zh?: string;
    ai_tw?: string;
    ai_vi?: string;
    guide: GuideTemplate;
}

export const SCENARIO_SCRIPTS: Record<string, ScriptTurn[]> = {
    airport: [
        {
            ai: "Good morning! Welcome to our airline counter. May I see your passport and booking reference, please? 🛂",
            ai_ko: "좋은 아침입니다! 저희 항공 카운터에 오신 것을 환영합니다. 여권과 예약 번호를 보여주시겠습니까?",
            guide: {
                template: "Here is my [BLANK] and booking reference.", answer: "passport", options: ["passport", "ID card", "boarding pass", "ticket"],
                hint_ko: "여기 제 여권과 예약 번호입니다.",
                hint_loc: { ja: "こちらが私のパスポートと予約番号です。", zh: "这是我的护照和预约编号。", vi: "Đây là hộ chiếu và mã đặt chỗ của tôi.", tw: "這是我的護照和預約編號。" }
            }
        },
        {
            ai: "Thank you! Are you checking any luggage today, or just carry-on? 🧳",
            guide: {
                template: "I have [BLANK] bag to check, please.", answer: "one", options: ["one", "two", "no", "one large"],
                hint_ko: "위탁 수하물 1개 있습니다.",
                hint_loc: { ja: "預け入れ手荷物が1つあります。", zh: "我有一件托运行李。", vi: "Tôi có một kiện hành lý ký gửi.", tw: "我有一件託運行李。" }
            }
        },
        {
            ai: "Got it! Would you prefer a window seat or an aisle seat?",
            guide: {
                template: "I'd prefer a [BLANK] seat, please.", answer: "window", options: ["window", "aisle", "middle", "front"],
                hint_ko: "창가 좌석으로 주세요.",
                hint_loc: { ja: "窓側の席をお願いします。", zh: "请给我靠窗的座位。", vi: "Cho tôi ghế gần cửa sổ.", tw: "請給我靠窗的座位。" }
            }
        },
        {
            ai: "Perfect! Your boarding gate is Gate B12. Boarding starts in about 45 minutes. ✈️",
            guide: {
                template: "Which [BLANK] is Gate B12 located in?", answer: "terminal", options: ["terminal", "floor", "building", "section"],
                hint_ko: "B12 게이트는 어느 터미널에 있나요?",
                hint_loc: { ja: "ゲートB12はどのターミナルにありますか？", zh: "B12登机口在哪个航站楼？", vi: "Cửa B12 nằm ở nhà ga nào?", tw: "B12登機口在哪个航站樓？" }
            }
        },
        {
            ai: "It's in Terminal 2, just a short walk from here. Is there anything else I can help you with?",
            guide: {
                template: "Is there a [BLANK] shop near the gate?", answer: "duty-free", options: ["duty-free", "souvenir", "coffee", "food"],
                hint_ko: "게이트 근처에 면세점이 있나요?",
                hint_loc: { ja: "ゲートの近くに免税店はありますか？", zh: "登机口附近有免税店吗？", vi: "Có cửa hàng miễn thuế nào gần cửa lên máy bay không?", tw: "登機口附近有免稅店嗎？" }
            }
        },
        {
            ai: "Yes! There's a duty-free shop right next to Gate B12. Have a wonderful flight! 🌟",
            ai_ko: "네! B12 게이트 바로 옆에 면세점이 있습니다. 즐거운 비행 되세요! 🌟",
            guide: {
                template: "Thank you so much! Have a [BLANK] day!", answer: "great", options: ["great", "wonderful", "nice", "good"],
                hint_ko: "감사합니다! 좋은 하루 되세요!",
                hint_loc: { ja: "ありがとうございます！良い一日を！", zh: "谢谢！祝你有美好的一天！", vi: "Cảm ơn rất nhiều! Chúc một ngày tốt lành!", tw: "謝謝！祝你有美好的一天！" }
            }
        },
    ],

    restaurant: [
        {
            ai: "Hello! Welcome to The Garden Bistro! 🌿 Can I start you off with something to drink?",
            ai_ko: "안녕하세요! 가든 비스트로에 오신 것을 환영합니다! 마실 것부터 준비해 드릴까요?",
            ai_ja: "こんにちは！ガーデンビストロへようこそ！最初にお飲み物はいかがですか？",
            ai_zh: "你好！欢迎来到花园小馆！我可以先为您准备点喝的吗？",
            ai_tw: "你好！歡迎來到花園小館！我可以先為您準備點喝的嗎？",
            ai_vi: "Xin chào! Chào mừng bạn đến với Garden Bistro! Tôi có thể mời bạn dùng đồ uống trước được không?",
            guide: {
                template: "Can I have a [BLANK] of water, please?", answer: "glass", options: ["glass", "bottle", "cup", "jug"],
                hint_ko: "물 한 잔 주세요.",
                hint_loc: { ja: "お水を一杯ください。", zh: "请给我一杯水。", vi: "Cho tôi một ly nước.", tw: "請給我一杯水。" }
            }
        },
        {
            ai: "Of course! Here's your water. Are you ready to order, or would you like a few more minutes?",
            guide: {
                template: "What do you [BLANK] today?", answer: "recommend", options: ["recommend", "suggest", "serve", "offer"],
                hint_ko: "오늘 추천 메뉴가 무엇인가요?",
                hint_loc: { ja: "今日のおすすめは何ですか？", zh: "今天的推荐菜单是什么？", vi: "Gợi ý của bạn hôm nay là gì?", tw: "今天的推薦菜單是什麼？" }
            }
        },
        {
            ai: "Our special today is the grilled salmon with herb butter. It's very popular! Ready to order?",
            guide: {
                template: "I'll have the [BLANK], please.", answer: "grilled salmon", options: ["grilled salmon", "steak", "pasta", "burger"],
                hint_ko: "연어 구이로 주세요.",
                hint_loc: { ja: "サーモンのグリルをお願いします。", zh: "我要一份烤三文鱼。", vi: "Cho tôi món cá hồi nướng.", tw: "我要一份烤三文魚。" }
            }
        },
        {
            ai: "Excellent choice! How would you like it cooked? And any side dishes? 🍽️",
            guide: {
                template: "I'd like it [BLANK], with a side salad please.", answer: "medium", options: ["medium", "well-done", "medium rare", "rare"],
                hint_ko: "미디엄으로, 사이드 샐러드도 주세요.",
                hint_loc: { ja: "ミディアムで、サイドサラダもお願いします。", zh: "我要五分熟，再加一份侧菜沙拉。", vi: "Cho tôi chín vừa, kèm một phần salad bên cạnh.", tw: "我要五分熟，再加一份側菜沙拉。" }
            }
        },
        {
            ai: "Perfect! Your food will be ready in about 20 minutes. Anything else I can bring you?",
            guide: {
                template: "Could we get the [BLANK] when you're ready?", answer: "bill", options: ["bill", "check", "menu", "dessert menu"],
                hint_ko: "준비되면 계산서 주세요.",
                hint_loc: { ja: "準備ができたらお会計をお願いします。", zh: "准备好了请给我账单。", vi: "Khi nào sẵn sàng cho tôi xin hóa đơn.", tw: "準備好了請給我帳單。" }
            }
        },
        {
            ai: "Of course! Will you be paying by cash or card today?",
            ai_ko: "물론이죠! 오늘은 현금으로 결제하시겠어요, 아니면 카드로 하시겠어요?",
            guide: {
                template: "I'll pay by [BLANK], please.", answer: "card", options: ["card", "cash", "credit card", "mobile pay"],
                hint_ko: "카드로 결제할게요.",
                hint_loc: { ja: "カードで払います。", zh: "我用卡支付。", vi: "Tôi sẽ thanh toán bằng thẻ.", tw: "我用卡支付。" }
            }
        },
    ],

    hotel: [
        {
            ai: "Good evening! Welcome to The Grand Hotel! 🏨 Do you have a reservation with us?",
            ai_ko: "안녕하세요! 그랜드 호텔에 오신 것을 환영합니다! 🏨 예약하셨나요?",
            guide: {
                template: "Yes, I have a [BLANK] under my name.", answer: "reservation", options: ["reservation", "booking", "room", "appointment"],
                hint_ko: "네, 제 이름으로 예약이 되어 있습니다.",
                hint_loc: { ja: "はい、私の名前で予約があります。", zh: "是的，我有名义下的预约。", vi: "Vâng, tôi có đặt phòng dưới tên mình.", tw: "是的，我有名義下的預約。" }
            }
        },
        {
            ai: "What name is the reservation under, please?",
            guide: {
                template: "It's under [BLANK], first name James.", answer: "Kim", options: ["Kim", "Smith", "Johnson", "(your name)"],
                hint_ko: "김이라는 성, 이름은 제임스입니다.",
                hint_loc: { ja: "キムという名字で、名前はジェームスです。", zh: "姓金，名字是詹姆斯。", vi: "Họ Kim, tên là James.", tw: "姓金，名字是詹姆斯。" }
            }
        },
        {
            ai: "Found it! We have a Deluxe room for you. Do you have a floor preference?",
            guide: {
                template: "I'd like a room on a [BLANK] floor if possible.", answer: "high", options: ["high", "low", "middle", "quiet"],
                hint_ko: "가능하면 높은 층으로 주세요.",
                hint_loc: { ja: "できれば高い階の部屋をお願いします。", zh: "如果可能的话，我想要高层的房间。", vi: "Nếu có thể, tôi muốn phòng ở tầng cao.", tw: "如果可能的話，我想要高層的房間。" }
            }
        },
        {
            ai: "We can give you room 1502 on the 15th floor. It has a lovely city view! 🌆",
            guide: {
                template: "Does the room have [BLANK]?", answer: "free Wi-Fi", options: ["free Wi-Fi", "a bathtub", "a kitchenette", "a safe"],
                hint_ko: "방에 무료 와이파이가 있나요?",
                hint_loc: { ja: "部屋で無料Wi-Fiは使えますか？", zh: "房间里有免费Wi-Fi吗？", vi: "Phòng có Wi-Fi miễn phí không?", tw: "房間裡有免費Wi-Fi嗎？" }
            }
        },
        {
            ai: "Yes! All rooms include free high-speed Wi-Fi. What time will you be checking out?",
            guide: {
                template: "I'll be staying for [BLANK] nights.", answer: "three", options: ["two", "three", "four", "one"],
                hint_ko: "3박 머물 예정입니다.",
                hint_loc: { ja: "3泊する予定です。", zh: "我打算住三个晚上。", vi: "Tôi sẽ ở lại 3 đêm.", tw: "我打算住三個晚上。" }
            }
        },
        {
            ai: "Perfect! Here's your key card. Checkout is at 11 AM. Breakfast is in the lobby from 7-10 AM. 🗝️",
            ai_ko: "완벽합니다! 여기 키 카드입니다. 체크아웃은 오전 11시이고, 조식은 로비에서 오전 7시부터 10시까지 제공됩니다. 🗝️",
            guide: {
                template: "Thank you! Could someone help with my [BLANK]?", answer: "luggage", options: ["luggage", "bags", "suitcase", "belongings"],
                hint_ko: "짐 옮기는 것 도와주실 수 있나요?",
                hint_loc: { ja: "荷物を運ぶのを手伝っていただけますか？", zh: "能帮我搬一下行李吗？", vi: "Có ai giúp tôi chuyển hành lý được không?", tw: "能幫我搬一下行李嗎？" }
            }
        },
    ],

    shopping: [
        {
            ai: "Hi there! Welcome! 👗 Are you looking for anything in particular today?",
            ai_ko: "안녕하세요! 어서 오세요! 👗 오늘 특별히 찾으시는 물건이 있으신가요?",
            guide: {
                template: "I'm looking for a [BLANK] in medium size.", answer: "shirt", options: ["shirt", "jacket", "dress", "sweater"],
                hint_ko: "미디엄 사이즈 셔츠를 찾고 있어요.",
                hint_loc: { ja: "Mサイズのシャツを探しています。", zh: "我正在找中码的衬衫。", vi: "Tôi đang tìm một chiếc áo sơ mi size M.", tw: "我正在找中碼的襯衫。" }
            }
        },
        {
            ai: "Great! We have lots of options. Do you have a color preference?",
            guide: {
                template: "Do you have this in [BLANK]?", answer: "blue", options: ["blue", "black", "white", "navy"],
                hint_ko: "파란색 있나요?",
                hint_loc: { ja: "これの青色はありますか？", zh: "这个有蓝色的吗？", vi: "Cái này có màu xanh dương không?", tw: "這個有藍色的嗎？" }
            }
        },
        {
            ai: "Yes, we do! Here are a few options in blue. Would you like to try one on?",
            guide: {
                template: "Yes, can I [BLANK] this one on?", answer: "try", options: ["try", "wear", "check", "test"],
                hint_ko: "네, 이걸 입어봐도 될까요?",
                hint_loc: { ja: "はい、これを試着してもいいですか？", zh: "好的，我可以试穿这件吗？", vi: "Vâng, tôi có thể thử chiếc này không?", tw: "好的，我可以試穿這件嗎？" }
            }
        },
        {
            ai: "Of course! The fitting room is right over there. How does it fit?",
            guide: {
                template: "It's a little [BLANK]. Do you have a larger size?", answer: "tight", options: ["tight", "small", "short", "snug"],
                hint_ko: "좀 끼네요. 더 큰 사이즈 있나요?",
                hint_loc: { ja: "少しきついです。もっと大きいサイズはありますか？", zh: "有点紧。有大一点的尺寸吗？", vi: "Nó hơi chật. Bạn có size lớn hơn không?", tw: "有點緊。有大一點的尺寸嗎？" }
            }
        },
        {
            ai: "Let me check... Yes! Here's a large. Much better right? Would you like to get it?",
            guide: {
                template: "Yes! How much does this [BLANK]?", answer: "cost", options: ["cost", "price", "sell for", "go for"],
                hint_ko: "얼마인가요?",
                hint_loc: { ja: "はい！これはいくらですか？", zh: "好的！这个多少钱？", vi: "Vâng! Cái này giá bao nhiêu?", tw: "好的！這個多少錢？" }
            }
        },
    ],

    business: [
        {
            ai: "Good morning! Thank you for coming in today. 💼 Could you briefly introduce yourself?",
            ai_ko: "좋은 아침입니다! 오늘 와주셔서 감사합니다. 💼 자기소개를 간단히 부탁드려도 될까요?",
            guide: {
                template: "My name is [BLANK] and I represent Korea Tech Solutions.", answer: "David Kim", options: ["David Kim", "Sarah Park", "James Lee", "(your name)"],
                hint_ko: "저는 코리아 테크 솔루션을 대표하는 김다윗입니다.",
                hint_loc: { ja: "私はコリア・テック・ソリューションズの代表のキム・デビッドです。", zh: "我叫大卫·金，代表韩国科技解决方案公司。", vi: "Tên tôi là David Kim và tôi đại diện cho Korea Tech Solutions.", tw: "我叫大衛·金，代表韓國科技解決方案公司。" }
            }
        },
        {
            ai: "Great to meet you! What brings you in today? What would you like to discuss?",
            guide: {
                template: "We'd like to [BLANK] a business partnership with your company.", answer: "propose", options: ["propose", "discuss", "offer", "suggest"],
                hint_ko: "귀사와의 비즈니스 파트너십을 제안드리고 싶습니다.",
                hint_loc: { ja: "御社とのビジネスパートナーシップを提案したいと考えています。", zh: "我们想提议与贵公司建立业务合作伙伴关系。", vi: "Chúng tôi muốn đề xuất mối quan hệ hợp tác kinh doanh với công ty của bạn.", tw: "我們想提議與貴公司建立業務合作夥伴關係。" }
            }
        },
        {
            ai: "That sounds interesting! What does your company specialize in?",
            guide: {
                template: "We [BLANK] in developing AI-powered language learning solutions.", answer: "specialize", options: ["specialize", "focus", "work", "excel"],
                hint_ko: "저희는 AI 기반 언어 학습 솔루션 개발을 전문으로 합니다.",
                hint_loc: { ja: "弊社はAIを活用した言語学習ソリューションの開発を専門としています。", zh: "我们专门开发AI驱动的语言学习解决方案。", vi: "Chúng tôi chuyên phát triển các giải pháp học ngôn ngữ bằng AI.", tw: "我們專門開發AI驅動的語言學習解決方案。" }
            }
        },
        {
            ai: "Impressive! What kind of partnership are you looking for exactly?",
            guide: {
                template: "We're looking for a [BLANK] distribution agreement in Asia.", answer: "joint", options: ["joint", "mutual", "shared", "co-"],
                hint_ko: "아시아 지역 공동 유통 계약을 원합니다.",
                hint_loc: { ja: "アジア地域での共同販売代理店契約を検討しています。", zh: "我们正在寻求在亚洲的共同分销协议。", vi: "Chúng tôi đang tìm kiếm một thỏa thuận phân phối chung tại Châu Á.", tw: "我們正在尋求在亞洲的共同分銷協議。" }
            }
        },
        {
            ai: "I see. And what would be the proposed timeline and budget for this?",
            guide: {
                template: "We're hoping to [BLANK] this within the next six months.", answer: "launch", options: ["launch", "start", "begin", "implement"],
                hint_ko: "향후 6개월 내 시작하기를 바랍니다.",
                hint_loc: { ja: "今後6か月以内に開始したいと考えています。", zh: "我们希望在接下来的六个月内启动这个项目。", vi: "Chúng tôi hy vọng sẽ khởi động việc này trong vòng sáu tháng tới.", tw: "我們希望在接下來的六個月內啟動這個項目。" }
            }
        },
        {
            ai: "Thank you for the overview. We'll need to review this internally. What are the next steps?",
            guide: {
                template: "Can we [BLANK] a follow-up meeting next week?", answer: "schedule", options: ["schedule", "arrange", "plan", "set up"],
                hint_ko: "다음 주에 후속 미팅을 잡을 수 있을까요?",
                hint_loc: { ja: "来週、フォローアップのミーティングを予定できますか？", zh: "我们下周可以安排一次跟进会议吗？", vi: "Chúng ta có thể lên lịch một cuộc họp tiếp theo vào tuần tới không?", tw: "我們下週可以安排一次跟進會議嗎？" }
            }
        },
    ],

    hospital: [
        {
            ai: "Hello! I'm Dr. Smith. 🩺 What brings you in today?",
            ai_ko: "안녕하세요! 스미스 박사입니다. 🩺 오늘 어떻게 오셨나요?",
            guide: {
                template: "I have a bad [BLANK] and I feel very tired.", answer: "headache", options: ["headache", "stomachache", "fever", "pain"],
                hint_ko: "두통이 심하고 피로감이 느껴집니다.",
                hint_loc: { ja: "ひどい頭痛があり、とても疲れを感じます。", zh: "我头疼得很厉害，感到非常疲倦。", vi: "Tôi bị đau đầu dữ dội và cảm thấy rất mệt mỏi.", tw: "我頭疼得很厲害，感到非常疲倦。" }
            }
        },
        {
            ai: "I see. How long have you been feeling this way?",
            guide: {
                template: "It started [BLANK] morning.", answer: "yesterday", options: ["yesterday", "two days ago", "this", "last"],
                hint_ko: "어제 아침부터 시작됐어요.",
                hint_loc: { ja: "昨日の朝から始まりました。", zh: "是从昨天早上开始的。", vi: "Nó bắt đầu từ sáng hôm qua.", tw: "是從昨天早上開始的。" }
            }
        },
        {
            ai: "Any other symptoms? Sore throat, cough, or runny nose perhaps?",
            ai_ko: "다른 증상은 없나요? 목이 아프거나 기침, 콧물 같은 거요?",
            guide: {
                template: "Yes, I also have a [BLANK] throat.", answer: "sore", options: ["sore", "dry", "scratchy", "painful"],
                hint_ko: "네, 목도 아파요.",
                hint_loc: { ja: "はい、のども痛いです。", zh: "是的，我喉咙也疼。", vi: "Vâng, tôi cũng bị đau họng.", tw: "是的，我喉嚨也疼。" }
            }
        },
        {
            ai: "Let me take your temperature... It's 38.5°C. You have a mild fever.",
            guide: {
                template: "Is it [BLANK]? Should I be worried?", answer: "serious", options: ["serious", "bad", "dangerous", "contagious"],
                hint_ko: "심각한 건가요? 걱정해야 할까요?",
                hint_loc: { ja: "深刻なことですか？心配すべきでしょうか？", zh: "严重吗？我需要担心吗？", vi: "Nó có nghiêm trọng không? Tôi có nên lo lắng không?", tw: "嚴重嗎？我需要擔心嗎？" }
            }
        },
        {
            ai: "Nothing serious. Looks like a mild viral infection. Are you allergic to any medications?",
            guide: {
                template: "I'm [BLANK] to penicillin.", answer: "allergic", options: ["allergic", "sensitive", "intolerant", "reactive"],
                hint_ko: "페니실린 알레르기가 있습니다.",
                hint_loc: { ja: "ペニシリンのアレルギーがあります。", zh: "我对青霉素过敏。", vi: "Tôi bị dị ứng với penicillin.", tw: "我對青黴素過敏。" }
            }
        },
        {
            ai: "Thank you for telling me. I'll prescribe a different antibiotic. Take it with food and rest well. 💊",
            guide: {
                template: "How many [BLANK] a day should I take this?", answer: "times", options: ["times", "pills", "doses", "tablets"],
                hint_ko: "하루에 몇 번 먹어야 하나요?",
                hint_loc: { ja: "1日に何回これを飲めばいいですか？", zh: "我一天应该吃几次？", vi: "Tôi nên uống thuốc này mấy lần một ngày?", tw: "我一天應該吃幾次？" }
            }
        },
    ],

    taxi: [
        {
            ai: "Hey, welcome! 🚕 Where can I take you today?",
            ai_ko: "안녕하세요, 어서 오세요! 🚕 오늘은 어디로 모실까요?",
            guide: {
                template: "Please take me to the [BLANK] Hotel downtown.", answer: "Grand", options: ["Grand", "City", "Hilton", "Holiday Inn"],
                hint_ko: "시내 그랜드 호텔로 가주세요.",
                hint_loc: { ja: "中心街のグランドホテルまでお願いします。", zh: "请带我去市中心的格兰德酒店。", vi: "Làm ơn đưa tôi đến khách sạn Grand ở trung tâm thành phố.", tw: "請帶我去市中心的格蘭德酒店。" }
            }
        },
        {
            ai: "The Grand Hotel — got it! Do you know the exact address, or should I look it up?",
            guide: {
                template: "It's on [BLANK] Avenue, I believe.", answer: "Main", options: ["Main", "Park", "Central", "First"],
                hint_ko: "메인 애비뉴에 있는 걸로 알아요.",
                hint_loc: { ja: "メイン・アベニューにあると思います。", zh: "我相信是在主干道上。", vi: "Tôi tin rằng nó nằm trên Đại lộ Chính.", tw: "我相信是在主幹道上。" }
            }
        },
        {
            ai: "Found it! Should I take the expressway or the local route? Expressway is faster but there's a toll.",
            guide: {
                template: "Please use the [BLANK], I'm in a bit of a hurry.", answer: "expressway", options: ["expressway", "highway", "freeway", "fastest route"],
                hint_ko: "고속도로 이용해 주세요. 조금 급해서요.",
                hint_loc: { ja: "高速道路を使ってください。少し急いでいます。", zh: "请走高速公路，我有点赶时间。", vi: "Làm ơn đi đường cao tốc, tôi đang hơi vội.", tw: "請走高速公路，我有點趕時間。" }
            }
        },
        {
            ai: "No problem! We should be there in about 20 minutes. Is this your first time visiting?",
            guide: {
                template: "Yes, it's my first time. Can you [BLANK] any good restaurants?", answer: "recommend", options: ["recommend", "suggest", "tell me about", "point me to"],
                hint_ko: "네, 처음이에요. 맛집 추천해 주실 수 있나요?",
                hint_loc: { ja: "はい、初めてです。どこかおすすめのレストランはありますか？", zh: "是的，这是我第一次来。你能推荐一些好餐馆吗？", vi: "Vâng, đây là lần đầu tiên của tôi. Bạn có thể gợi ý nhà hàng nào ngon không?", tw: "是的，這是我第一次來。你能推薦一些好餐館嗎？" }
            }
        },
        {
            ai: "Oh you must try the night market! Amazing local food there. We've arrived — here's The Grand Hotel! 🏨",
            guide: {
                template: "Thank you! How much is the [BLANK]?", answer: "fare", options: ["fare", "total", "bill", "charge"],
                hint_ko: "감사합니다! 요금이 얼마예요?",
                hint_loc: { ja: "ありがとうございます！料金はいくらですか？", zh: "谢谢！费用是多少？", vi: "Cảm ơn! Giá cước là bao nhiêu?", tw: "謝謝！費用是多少？" }
            }
        },
    ],

    cafe: [
        {
            ai: "Hey! Welcome! ☕ What can I get started for you today?",
            ai_ko: "환영합니다! ☕ 오늘은 어떤 걸로 준비해 드릴까요?",
            guide: {
                template: "I'd like a [BLANK], please.", answer: "latte", options: ["latte", "cappuccino", "americano", "flat white"],
                hint_ko: "라떼 주세요.",
                hint_loc: { ja: "ラテをお願いします。", zh: "我想要一杯拿铁。", vi: "Cho tôi một ly latte.", tw: "我想要一杯拿鐵。" }
            }
        },
        {
            ai: "Great choice! What size would you like — small, medium, or large?",
            guide: {
                template: "A [BLANK] size, please.", answer: "medium", options: ["small", "medium", "large", "grande"],
                hint_ko: "미디엄 사이즈로 주세요.",
                hint_loc: { ja: "Mサイズでおねがいします。", zh: "请给我中杯。", vi: "Cho tôi size vừa.", tw: "請給我中杯。" }
            }
        },
        {
            ai: "Would you like that hot or iced?",
            guide: {
                template: "I'll have it [BLANK], please.", answer: "iced", options: ["iced", "hot", "warm", "cold"],
                hint_ko: "아이스로 주세요.",
                hint_loc: { ja: "アイスでお願いします。", zh: "我要冰的。", vi: "Cho tôi uống lạnh (đá).", tw: "我要冰的。" }
            }
        },
        {
            ai: "Any special requests? Extra shot, oat milk, less sugar?",
            guide: {
                template: "Can I get [BLANK] milk instead?", answer: "oat", options: ["oat", "almond", "soy", "skim"],
                hint_ko: "오트 밀크로 바꿔주실 수 있나요?",
                hint_loc: { ja: "代わりにオーツミルクにできますか？", zh: "可以换成燕麦奶吗？", vi: "Tôi có thể đổi sang sữa yến mạch không?", tw: "可以換成燕麥奶嗎？" }
            }
        },
        {
            ai: "Of course! Name for the order?",
            guide: {
                template: "The name is [BLANK].", answer: "Jamie", options: ["Jamie", "Alex", "Sam", "(your name)"],
                hint_ko: "이름은 제이미예요.",
                hint_loc: { ja: "名前はジェイミーです。", zh: "名字是杰米。", vi: "Tên tôi là Jamie.", tw: "名字是傑米。" }
            }
        },
        {
            ai: "One iced oat latte for Jamie! Anything else — a pastry or snack? 🥐",
            guide: {
                template: "Can I also get a [BLANK]?", answer: "croissant", options: ["croissant", "muffin", "cookie", "brownie"],
                hint_ko: "크루아상도 하나 더 주세요.",
                hint_loc: { ja: "クロワッサンも1ついただけますか？", zh: "我还能再要一个牛角面包吗？", vi: "Tôi có thể lấy thêm một cái bánh sừng bò không?", tw: "我還能再要一個牛角麵包嗎？" }
            }
        },
    ],

    phone: [
        {
            ai: "Thank you for calling Golden Restaurant, this is Emily speaking! 📞 How may I help you?",
            ai_ko: "골든 레스토랑입니다, 에밀리입니다! 📞 무엇을 도와드릴까요?",
            guide: {
                template: "Hi, I'd like to [BLANK] a table for dinner.", answer: "reserve", options: ["reserve", "book", "make", "get"],
                hint_ko: "저녁 식사 테이블을 예약하고 싶습니다.",
                hint_loc: { ja: "夕食のテーブルを予約したいのですが。", zh: "你好，我想预订一张晚餐桌子。", vi: "Chào bạn, tôi muốn đặt bàn ăn tối.", tw: "你好，我想預訂一張晚餐桌子。" }
            }
        },
        {
            ai: "Of course! What date and time were you thinking?",
            guide: {
                template: "This [BLANK], at around 7 PM.", answer: "Friday", options: ["Friday", "Saturday", "Sunday", "tonight"],
                hint_ko: "이번 금요일 저녁 7시쯤이요.",
                hint_loc: { ja: "今週の金曜日の午後7時ごろです。", zh: "这周五晚上7点左右。", vi: "Thứ Sáu này, vào khoảng 7 giờ tối.", tw: "這週五晚上7點左右。" }
            }
        },
        {
            ai: "Let me check availability... Friday at 7 PM looks good! How many guests?",
            guide: {
                template: "A table for [BLANK] people, please.", answer: "four", options: ["two", "four", "six", "three"],
                hint_ko: "4명 자리로 부탁드려요.",
                hint_loc: { ja: "4名のテーブルをお願いします。", zh: "请给我一张四人的桌子。", vi: "Làm ơn cho một bàn 4 người.", tw: "請給我一張四人的桌子。" }
            }
        },
        {
            ai: "Perfect! Any special requests or preferences?",
            guide: {
                template: "Could we have a [BLANK] table if possible?", answer: "window", options: ["window", "quiet", "corner", "private"],
                hint_ko: "가능하면 창가 테이블로 부탁드려요.",
                hint_loc: { ja: "可能であれば、窓際の席をお願いできますか？", zh: "如果可能的话，我们能要一张靠窗的桌子吗？", vi: "Nếu có thể, chúng tôi có thể ngồi bàn gần cửa sổ không?", tw: "如果可能的話，我們能要一張靠窗的桌子嗎？" }
            }
        },
        {
            ai: "We'll do our best! May I get a name for the reservation?",
            guide: {
                template: "The reservation is under [BLANK].", answer: "Park", options: ["Park", "Kim", "Lee", "(your name)"],
                hint_ko: "박으로 예약해 주세요.",
                hint_loc: { ja: "パクで予約をお願いします。", zh: "预订人姓朴（Park）。", vi: "Vui lòng đặt dưới tên Park.", tw: "預訂人姓朴（Park）。" }
            }
        },
        {
            ai: "Got it! And a contact number in case we need to reach you?",
            guide: {
                template: "My [BLANK] number is 010-1234-5678.", answer: "phone", options: ["phone", "mobile", "cell", "contact"],
                hint_ko: "제 전화번호는 010-1234-5678입니다.",
                hint_loc: { ja: "電話番号は010-1234-5678です。", zh: "我的电话号码是010-1234-5678。", vi: "Số điện thoại của tôi là 010-1234-5678.", tw: "我的電話號碼是010-1234-5678。" }
            }
        },
    ],

    school: [
        {
            ai: "Welcome! Please have a seat. 🎓 What can I help you with today?",
            ai_ko: "환영합니다! 앉으세요. 🎓 오늘 무엇을 도와드릴까요?",
            guide: {
                template: "I have a question about the [BLANK] assignment.", answer: "midterm", options: ["midterm", "homework", "essay", "final project"],
                hint_ko: "중간고사 과제에 대해 질문이 있어요.",
                hint_loc: { ja: "中間試験の課題について質問があります。", zh: "我有一个关于期中作业的问题。", vi: "Tôi có câu hỏi về bài tập giữa kỳ.", tw: "我有一個關於期中作業的問題。" }
            }
        },
        {
            ai: "Of course! What specifically are you struggling with?",
            guide: {
                template: "I'm a bit confused about [BLANK] five.", answer: "chapter", options: ["chapter", "unit", "section", "module"],
                hint_ko: "5장이 좀 헷갈려요.",
                hint_loc: { ja: "第5章が少し混乱しています。", zh: "我对第五章有点困惑。", vi: "Tôi hơi bối rối về chương 5.", tw: "我對第五章有點困惑。" }
            }
        },
        {
            ai: "Chapter five covers photosynthesis and cellular respiration. Which part is unclear?",
            guide: {
                template: "I don't quite understand how [BLANK] works.", answer: "photosynthesis", options: ["photosynthesis", "respiration", "the cycle", "it all"],
                hint_ko: "광합성이 어떻게 작동하는지 이해가 안 가요.",
                hint_loc: { ja: "光合成がどのように機能するのかよくわかりません。", zh: "我不完全明白光合作用是如何运作的。", vi: "Tôi không hiểu rõ lắm về cách thức hoạt động của quá trình quang hợp.", tw: "我不完全明白光合作用是如何運作的。" }
            }
        },
        {
            ai: "No problem! Simply put, plants convert sunlight into energy... Does that make more sense?",
            guide: {
                template: "Yes, thank you! Could you give me a real-world [BLANK]?", answer: "example", options: ["example", "analogy", "case", "illustration"],
                hint_ko: "감사해요! 실제 예시를 들어주실 수 있나요?",
                hint_loc: { ja: "はい、ありがとうございます！実際の例を挙げていただけますか？", zh: "是的，谢谢！你能给我一个现实世界的例子吗？", vi: "Vâng, cảm ơn bạn! Bạn có thể cho tôi một ví dụ thực tế không?", tw: "是的，謝謝！你能給我一個現實世界的例子嗎？" }
            }
        },
        {
            ai: "Sure! Think of it like solar panels on a house — plants do the same thing naturally. Will this be on the midterm?",
            guide: {
                template: "Will this be on the [BLANK] exam?", answer: "final", options: ["final", "midterm", "next", "upcoming"],
                hint_ko: "기말고사에 나오나요?",
                hint_loc: { ja: "これは期末試験に出ますか？", zh: "这会出现在期末考试中吗？", vi: "Cái này có trong kỳ thi cuối kỳ không?", tw: "這會出現在期末考試中嗎？" }
            }
        },
        {
            ai: "Very likely — it's a core concept. I'd review chapters 4 through 6. Any other questions?",
            guide: {
                template: "Can I come to your [BLANK] hours this week?", answer: "office", options: ["office", "open", "consultation", "free"],
                hint_ko: "이번 주 교수님 면담 시간에 찾아뵐 수 있나요?",
                hint_loc: { ja: "今週、オフィスアワーに伺ってもよろしいですか？", zh: "这周我可以去您的办公时间吗？", vi: "Tôi có thể đến giờ hành chính của bạn trong tuần này không?", tw: "這週我可以去您的辦公時間嗎？" }
            }
        },
    ],

    interview: [
        {
            ai: "Good afternoon! Welcome to Global Tech. I'm Sarah, the HR manager. 👔 Are you ready to begin the interview?",
            ai_ko: "안녕하세요! 글로벌 테크에 오신 것을 환영합니다. 인사 담당자 사라입니다. 👔 면접을 시작할 준비가 되셨나요?",
            guide: {
                template: "Yes, I'm [BLANK] and ready.", answer: "excited", options: ["excited", "nervous", "prepared", "pleased"],
                hint_ko: "네, 기대됩니다. 준비됐습니다.",
                hint_loc: { ja: "はい、楽しみです。準備はできています。", zh: "是的，我很兴奋，准备好了。", vi: "Vâng, tôi rất hào hứng và đã sẵn sàng.", tw: "是的，我很興奮，準備好了。" }
            }
        },
        {
            ai: "Great! First, can you tell me why you applied for this position?",
            guide: {
                template: "I've always wanted to work for a [BLANK] company like yours.", answer: "leading", options: ["leading", "top", "global", "dynamic"],
                hint_ko: "귀사와 같은 선도적인 기업에서 일하고 싶었습니다.",
                hint_loc: { ja: "御社のようなトップクラスの企業で働きたいとずっと思っていました。", zh: "我一直想在像贵公司这样领先的公司工作。", vi: "Tôi luôn muốn làm việc cho một công ty hàng đầu như của bạn.", tw: "我一直想在像貴公司這樣領先的公司工作。" }
            }
        },
        {
            ai: "I see. What would you say is your greatest strength as a developer?",
            ai_ko: "그렇군요. 개발자로서 본인의 가장 큰 강점은 무엇이라고 생각하시나요?",
            guide: {
                template: "I think my greatest [BLANK] is my ability to solve complex problems.", answer: "strength", options: ["strength", "skill", "talent", "asset"],
                hint_ko: "저의 가장 큰 강점은 복잡한 문제를 해결하는 능력입니다.",
                hint_loc: { ja: "私の最大の強みは、複雑な問題を解決する能力だと思います。", zh: "我认为我最大的优势是我解决复杂问题的能力。", vi: "Tôi nghĩ thế mạnh lớn nhất của mình là khả năng giải quyết các vấn đề phức tạp.", tw: "我認為我最大的優勢是我解決複雜問題的能力。" }
            }
        },
        {
            ai: "Excellent. And how do you handle working under pressure or tight deadlines?",
            ai_ko: "좋습니다. 압박감이 심하거나 마감이 촉박한 상황에서 업무를 어떻게 처리하시나요?",
            guide: {
                template: "I try to [BLANK] my tasks and stay focused.", answer: "prioritize", options: ["prioritize", "organize", "manage", "rank"],
                hint_ko: "업무의 우선순위를 정하고 집중하려고 노력합니다.",
                hint_loc: { ja: "タスクの優先順位を付け、集中力を維持するようにしています。", zh: "我努力设定任务的优先级并保持专注。", vi: "Tôi cố gắng ưu tiên các nhiệm vụ và tập trung.", tw: "我努力設定任務的優先順序並保持專注。" }
            }
        },
        {
            ai: "Good to hear. Do you have any questions for us about the company or the team?",
            guide: {
                template: "What is the [BLANK] like here?", answer: "culture", options: ["culture", "atmosphere", "environment", "vibe"],
                hint_ko: "이곳의 기업 문화는 어떤가요?",
                hint_loc: { ja: "ここの社風はどのようなものですか？", zh: "这里的文化怎么样？", vi: "Văn hóa ở đây như thế nào?", tw: "這裡的文化怎麼樣？" }
            }
        },
        {
            ai: "We have a very collaborative and innovative culture. Thank you for your time today! We'll be in touch.",
            ai_ko: "저희는 매우 협력적이고 혁신적인 문화를 가지고 있습니다. 오늘 시간 내주셔서 감사합니다! 연락드리겠습니다.",
            guide: {
                template: "Thank you! I look forward to [BLANK] from you.", answer: "hearing", options: ["hearing", "news", "updates", "feedback"],
                hint_ko: "감사합니다! 소식 기다리겠습니다.",
                hint_loc: { ja: "ありがとうございます！ご連絡をお待ちしております。", zh: "谢谢！期待您的回复。", vi: "Cảm ơn bạn! Tôi mong nhận được hồi âm từ bạn.", tw: "謝謝！期待您的回覆。" }
            }
        }
    ],

    directions: [
        {
            ai: "Excuse me! 🗺️ I'm a bit lost. Could you tell me how to get to the Central Station?",
            ai_ko: "실례합니다! 🗺️ 길을 좀 잃어서요. 중앙역까지 어떻게 가는지 알려주실 수 있나요?",
            guide: {
                template: "Sure! Just go [BLANK] for two blocks.", answer: "straight", options: ["straight", "ahead", "forward", "along"],
                hint_ko: "물론이죠! 두 블록 직진하세요.",
                hint_loc: { ja: "もちろんです！このまま2ブロック直進してください。", zh: "当然！直走两个街区。", vi: "Chắc chắn rồi! Cứ đi thẳng hai dãy nhà.", tw: "當然！直走兩個街區。" }
            }
        },
        {
            ai: "Two blocks straight... and then what? Do I need to turn?",
            guide: {
                template: "Yes, then turn [BLANK] at the corner.", answer: "left", options: ["left", "right", "west", "north"],
                hint_ko: "네, 그다음 모퉁이에서 왼쪽으로 가세요.",
                hint_loc: { ja: "はい、それから角を左に曲がってください。", zh: "是的，然后在转角处向左转。", vi: "Vâng, sau đó rẽ trái ở góc đường.", tw: "是的，然後在轉角處向左轉。" }
            }
        },
        {
            ai: "Okay, turn left at the corner. Is it far from there?",
            guide: {
                template: "No, it's about a [BLANK] walk.", answer: "five-minute", options: ["five-minute", "ten-minute", "short", "quick"],
                hint_ko: "아뇨, 걸어서 5분 정도 걸려요.",
                hint_loc: { ja: "いいえ、歩いて5分ほどです。", zh: "不，步行大约五分钟。", vi: "Không, đi bộ khoảng năm phút.", tw: "不，步行大約五分鐘。" }
            }
        },
        {
            ai: "That's not far at all. Will I see a big sign or a landmark?",
            guide: {
                template: "Yes, it's [BLANK] to the big library.", answer: "next", options: ["next", "opposite", "across", "beside"],
                hint_ko: "네, 큰 도서관 옆에 있어요.",
                hint_loc: { ja: "はい、大きな図書館의 隣にあります。", zh: "是的，它就在那座大图书馆旁边。", vi: "Vâng, nó nằm cạnh thư viện lớn.", tw: "是的，它就在那座大圖書館旁邊。" }
            }
        },
        {
            ai: "Great, next to the library. Thank you so much for your help!",
            ai_ko: "좋네요, 도서관 옆이군요. 도와주셔서 정말 감사합니다!",
            guide: {
                template: "You're [BLANK]! Have a nice day.", answer: "welcome", options: ["welcome", "most welcome", "no problem", "anytime"],
                hint_ko: "천만에요! 좋은 하루 되세요.",
                hint_loc: { ja: "どういたしまして！良い一日を。", zh: "不客气！祝你今天愉快。", vi: "Không có gì! Chúc một ngày tốt lành.", tw: "不客氣！祝你今天愉快。" }
            }
        }
    ],

    emergency: [
        {
            ai: "911 emergency, what is the nature of your emergency? 🚨",
            ai_ko: "911 긴급 센터입니다, 어떤 비상 상황인가요? 🚨",
            guide: {
                template: "I'd like to report a [BLANK].", answer: "car accident", options: ["car accident", "fire", "theft", "medical emergency"],
                hint_ko: "교통사고를 신고하고 싶습니다.",
                hint_loc: { ja: "交通事故を報告したいのですが。", zh: "我想报告一起车祸。", vi: "Tôi muốn báo cáo một vụ tai nạn xe hơi.", tw: "我想報告一起車禍。" }
            }
        },
        {
            ai: "A car accident. Where is your location? Are there any injuries?",
            guide: {
                template: "I'm at the [BLANK] of Main Street and 5th Avenue. Some people are hurt.", answer: "intersection", options: ["intersection", "corner", "crossing", "junction"],
                hint_ko: "메인 스트리트와 5번가의 교차로입니다. 다친 사람들이 있어요.",
                hint_loc: { ja: "メイン・ストリートと5番街の交差点です。怪我人がいます。", zh: "我在主街（Main Street）和第五大道（5th Avenue）의 交界處。有人受傷了。", vi: "Tôi đang ở ngã tư đường Main 및 Đại lộ số 5. Có một số người bị thương.", tw: "我在主街（Main Street）和第五大道（5th Avenue）的交界處。有人受傷了。" }
            }
        },
        {
            ai: "Help is on the way. Please stay on the line. How many vehicles are involved?",
            guide: {
                template: "There are [BLANK] cars involved.", answer: "two", options: ["two", "three", "four", "several"],
                hint_ko: "차량 두 대가 연루되었습니다.",
                hint_loc: { ja: "2台の車が関係しています。", zh: "涉及两辆车。", vi: "Có hai chiếc xe liên quan.", tw: "涉及兩輛車。" }
            }
        },
        {
            ai: "Understood. The police and an ambulance have been dispatched. What's your name and phone number?",
            guide: {
                template: "My name is [BLANK] and my number is 555-0199.", answer: "Chris", options: ["Chris", "Alex", "Jordan", "(your name)"],
                hint_ko: "제 이름은 크리스이고 번호는 555-0199입니다.",
                hint_loc: { ja: "私の名前はクリスで、電話番号は555-0199です。", zh: "我叫克里斯，我的电话号码是555-0199。", vi: "Tên tôi là Chris 및 số điện thoại의 tôi là 555-0199.", tw: "我叫克里斯，我的電話號碼是555-0199。" }
            }
        },
        {
            ai: "Thank you, Chris. Stay where you are and try to remain calm. Help will be there shortly.",
            ai_ko: "감사합니다, 크리스. 그 자리에 계시고 침착함을 유지해 주세요. 곧 도움의 손길이 도착할 것입니다.",
            guide: {
                template: "Thank you. I'll stay [BLANK].", answer: "here", options: ["here", "on the line", "safe", "close by"],
                hint_ko: "감사합니다. 여기서 기다릴게요.",
                hint_loc: { ja: "ありがとうございます。ここで待ちます。", zh: "谢谢。我会待在这里。", vi: "Cảm ơn. Tôi sẽ ở đây.", tw: "謝謝。我會待在這裡。" }
            }
        }
    ],

    hobbies: [
        {
            ai: "So, what do you usually do in your free time? 🎬 Any favorite hobbies?",
            ai_ko: "평소에 여가 시간에는 보통 무엇을 하시나요? 🎬 좋아하는 취미가 있나요?",
            guide: {
                template: "I really enjoy [BLANK] in my spare time.", answer: "watching movies", options: ["watching movies", "reading books", "playing sports", "traveling"],
                hint_ko: "남는 시간에 영화 보는 걸 정말 좋아해요.",
                hint_loc: { ja: "空いた時間に映画を見るのが本当に好きです。", zh: "我空余时间真的很喜欢看电影。", vi: "Tôi thực sự thích xem phim vào thời gian rảnh.", tw: "我空餘時間真的很喜歡看電影。" }
            }
        },
        {
            ai: "Watching movies! That's cool. What kind of movies do you like best?",
            ai_ko: "영화 보기요! 멋지네요. 어떤 장르의 영화를 제일 좋아하시나요?",
            guide: {
                template: "I'm a big fan of [BLANK] movies.", answer: "action", options: ["action", "comedy", "romance", "horror"],
                hint_ko: "액션 영화를 아주 좋아해요.",
                hint_loc: { ja: "アクション映画の大ファンです。", zh: "我是动作片的忠实粉丝。", vi: "Tôi là fan cuồng của phim hành động.", tw: "我是動作片的忠實粉絲。" }
            }
        },
        {
            ai: "Action movies are great! Have you seen any good ones lately?",
            guide: {
                template: "Yes, I [BLANK] a really good one last weekend.", answer: "saw", options: ["saw", "watched", "viewed", "caught"],
                hint_ko: "네, 지난주말에 아주 괜찮은 걸 하나 봤어요.",
                hint_loc: { ja: "はい、先週末にとても良いものを見ました。", zh: "是的，我上周末看了一部非常棒的片子。", vi: "Vâng, tôi đã xem một bộ phim rất hay vào cuối tuần trước.", tw: "是的，我上週末看了一部非常棒的片子。" }
            }
        },
        {
            ai: "Nice! Do you prefer watching them at the cinema or at home?",
            guide: {
                template: "I prefer the [BLANK] because of the big screen.", answer: "cinema", options: ["cinema", "theater", "big screen", "imax"],
                hint_ko: "큰 화면 때문에 영화관을 더 선호해요.",
                hint_loc: { ja: "大きなスクリーンがあるから、映画館の方が好きです。", zh: "我更喜欢电影院，因为屏幕大。", vi: "Tôi thích rạp chiếu phim hơn vì có màn hình lớn.", tw: "我更喜歡電影院，因為屏幕大。" }
            }
        },
        {
            ai: "I agree, nothing beats the cinema experience! Maybe we can catch a movie sometime.",
            ai_ko: "동감이에요, 영화관 경험을 따라올 건 없죠! 언제 한번 우리 같이 영화 봐도 좋겠네요.",
            guide: {
                template: "That sounds [BLANK]! Let's do that.", answer: "great", options: ["great", "fun", "lovely", "awesome"],
                hint_ko: "좋아요! 그렇게 해요.",
                hint_loc: { ja: "それは素晴らしいですね！そうしましょう。", zh: "听起来太棒了！我们就这么办吧。", vi: "Nghe tuyệt đấy! Làm vậy đi.", tw: "聽起來太棒了！我們就這麼辦吧。" }
            }
        }
    ],

    appointments: [
        {
            ai: "The weather is so nice today, isn't it? 📅 Do you have any plans for the afternoon?",
            ai_ko: "오늘 날씨가 정말 좋네요, 그렇죠? 📅 오후에 무슨 계획 있으신가요?",
            guide: {
                template: "Not really. I'm [BLANK] today.", answer: "free", options: ["free", "available", "empty", "open"],
                hint_ko: "딱히요. 오늘 한가해요.",
                hint_loc: { ja: "特にありません。今日は暇です。", zh: "没什计划。我今天有空。", vi: "Cũng không hẳn. Hôm nay tôi rảnh.", tw: "沒什麼計劃。我今天有空。" }
            }
        },
        {
            ai: "Perfect! Would you like to meet up for coffee or something?",
            guide: {
                template: "That's a [BLANK] idea! Where should we meet?", answer: "good", options: ["good", "great", "wonderful", "brilliant"],
                hint_ko: "좋은 생각이에요! 어디서 만날까요?",
                hint_loc: { ja: "それは良い考えですね！どこで会いましょうか？", zh: "好主意！我们在哪儿见面？", vi: "Ý kiến hay đấy! Chúng ta nên gặp nhau ở đâu?", tw: "好主意！我們在哪兒見面？" }
            }
        },
        {
            ai: "How about that new cafe near the park? Around 3 PM?",
            guide: {
                template: "Three o'clock is [BLANK] for me.", answer: "perfect", options: ["perfect", "good", "fine", "okay"],
                hint_ko: "3시면 딱 좋아요.",
                hint_loc: { ja: "3時は私にとって完璧です。", zh: "三点对我来说很完美。", vi: "3 giờ là hoàn hảo đối với tôi.", tw: "三點對我來說很完美。" }
            }
        },
        {
            ai: "Great. Oh, wait... I just checked the forecast. It might rain later. Should we meet indoors?",
            guide: {
                template: "Yes, let's [BLANK] safe and stay inside.", answer: "play it", options: ["play it", "be", "stay", "keep"],
                hint_ko: "네, 안전하게 실내에 있죠.",
                hint_loc: { ja: "はい、念のため室内に入りましょう。", zh: "是的，保险起见，我们待在室内吧。", vi: "Vâng, hãy cứ cẩn thận 및 ở trong nhà.", tw: "是的，保險起見，我們待在室內吧。" }
            }
        },
        {
            ai: "Good thinking. I'll see you at the cafe at 3 PM then! See you soon!",
            ai_ko: "좋은 생각이에요. 그럼 3시에 카페에서 봐요! 이따 봐요!",
            guide: {
                template: "See you [BLANK]!", answer: "then", options: ["then", "soon", "later", "there"],
                hint_ko: "그때 봐요!",
                hint_loc: { ja: "またその時に！", zh: "到时候见！", vi: "Hẹn gặp lại lúc đó!", tw: "到時候見！" }
            }
        }
    ],
};
