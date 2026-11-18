import type { DisplayLanguage } from "@/lib/display-language";

/** Static, no-API shared navigation and site-guide language copies. */
export type SiteLocalizedCopy = {
  navigation: { home: string; book: string; reports: string; aria: string; help: string };
  utility: { siteAria: string; music: string; guide: string; close: string; title: string; placeholder: string; ask: string; report: string; today: string; tests: string; history: string; more: string; help: string; notes: string; advanced: string };
  advanced: { ziwei: string; qizheng: string; astrology: string; indian: string; palm: string; numerology: string; knowledge: string; atlas: string };
  journey: { title: string; steps: readonly [string, string, string]; hints: readonly [string, string, string] };
  guide: { analysis: readonly [string, string]; history: readonly [string, string]; account: readonly [string, string]; login: readonly [string, string]; home: readonly [string, string] };
};

export const SITE_LOCALIZATION: Record<DisplayLanguage, SiteLocalizedCopy> = {
  "zh-Hant": {
    "navigation": {
      "home": "首頁",
      "book": "建立命書",
      "reports": "我的報告",
      "aria": "報告與頁面入口",
      "help": "怎麼用"
    },
    "utility": {
      "siteAria": "網站工具",
      "music": "音樂",
      "guide": "導覽",
      "close": "關閉",
      "title": "網站導覽",
      "placeholder": "例如：帶我去看完整報告",
      "ask": "詢問",
      "report": "建立命書",
      "today": "今日黃曆",
      "tests": "趣味測驗",
      "history": "我的報告",
      "more": "更多功能",
      "help": "找不到入口？在這裡問",
      "notes": "文章",
      "advanced": "其他命盤與文化工具"
    },
    "advanced": {
      "ziwei": "紫微斗數",
      "qizheng": "七政四餘",
      "astrology": "西洋占星",
      "indian": "印度占星",
      "palm": "一掌經",
      "numerology": "生命靈數",
      "knowledge": "文化知識",
      "atlas": "吉象圖鑑"
    },
    "journey": {
      "title": "三步開始",
      "steps": [
        "填資料",
        "看命書",
        "問問題"
      ],
      "hints": [
        "填寫出生日期、時間與城市。",
        "先看免費概要，細節按需要展開。",
        "選填想問的事；報告可從「我的報告」重看。"
      ]
    },
    "guide": {
      "analysis": [
        "填寫生辰 → 看免費命書概要 → 按需要提問。完整深讀按頁面標示解鎖。",
        "開始完整分析"
      ],
      "history": [
        "已保存的舊報告可以在「我的報告」重看。",
        "查看我的報告"
      ],
      "account": [
        "您在昭梧的報告與測驗會保存在這台裝置中。如需管理或同步，請前往帳戶頁面。",
        "前往帳戶"
      ],
      "login": [
        "我的報告會保存在這台裝置。點擊即可登入或管理個人帳戶。",
        "前往登入"
      ],
      "home": [
        "先填生辰，看命書概要；有想問的事，再繼續提問。",
        "返回首頁"
      ]
    }
  },
  "zh-Hans": {
    "navigation": {
      "home": "首页",
      "book": "建立命书",
      "reports": "我的报告",
      "aria": "报告与页面入口",
      "help": "怎么用"
    },
    "utility": {
      "siteAria": "网站工具",
      "music": "音乐",
      "guide": "导览",
      "close": "关闭",
      "title": "网站导览",
      "placeholder": "例如：带我去看完整报告",
      "ask": "询问",
      "report": "建立命书",
      "today": "今日黄历",
      "tests": "趣味测验",
      "history": "我的报告",
      "more": "更多功能",
      "help": "找不到入口？在这里问",
      "notes": "文章",
      "advanced": "其他命盘与文化工具"
    },
    "advanced": {
      "ziwei": "紫微斗数",
      "qizheng": "七政四余",
      "astrology": "西洋占星",
      "indian": "印度占星",
      "palm": "一掌经",
      "numerology": "生命灵数",
      "knowledge": "文化知识",
      "atlas": "吉象图鉴"
    },
    "journey": {
      "title": "三步开始",
      "steps": [
        "填资料",
        "看命书",
        "问问题"
      ],
      "hints": [
        "填写出生日期、时间与城市。",
        "先看免费概要，细节按需要展开。",
        "选填想问的事；报告可从“我的报告”重看。"
      ]
    },
    "guide": {
      "analysis": [
        "填写生辰 → 看免费命书概要 → 按需要提问。完整深读按页面标示解锁。",
        "开始完整分析"
      ],
      "history": [
        "已保存的旧报告可以在“我的报告”重看。",
        "查看我的报告"
      ],
      "account": [
        "您在昭梧的报告与测验会保存在这台设备中。如需管理或同步，请前往账户页面。",
        "前往账户"
      ],
      "login": [
        "我的报告会保存在这台设备。点击即可登录或管理个人账户。",
        "前往登录"
      ],
      "home": [
        "先填生辰，看命书概要；有想问的事，再继续提问。",
        "返回首页"
      ]
    }
  },
  "en": {
    "navigation": {
      "home": "Home",
      "book": "Build my book",
      "reports": "My reports",
      "aria": "Reports and navigation",
      "help": "How to use"
    },
    "utility": {
      "siteAria": "Site utilities",
      "music": "Music",
      "guide": "Guide",
      "close": "Close",
      "title": "Site guide",
      "placeholder": "For example: take me to my complete report",
      "ask": "Ask",
      "report": "Create a Destiny Book",
      "today": "Today",
      "tests": "Explore",
      "history": "My reports",
      "more": "More features",
      "help": "Cannot find something? Ask here",
      "notes": "Articles",
      "advanced": "Other charts and cultural tools"
    },
    "advanced": {
      "ziwei": "Zi Wei chart",
      "qizheng": "Seven Luminaries",
      "astrology": "Western astrology",
      "indian": "Indian astrology",
      "palm": "Palm scripture",
      "numerology": "Numerology",
      "knowledge": "Cultural knowledge",
      "atlas": "Artwork atlas"
    },
    "journey": {
      "title": "Start in three steps",
      "steps": [
        "Birth details",
        "Read your chart",
        "Ask a question"
      ],
      "hints": [
        "Enter your birth date, time and city.",
        "Read the free summary; open details when needed.",
        "Ask an optional question. Reopen answers from My reports."
      ]
    },
    "guide": {
      "analysis": [
        "Enter birth details, read the free summary, then ask an optional question. Full readings are unlocked as shown on the page.",
        "Start full analysis"
      ],
      "history": [
        "Your previously saved reports are in My reports.",
        "Open my reports"
      ],
      "account": [
        "Your reports and tests are saved on this device. Go to Account to manage your records.",
        "Go to account"
      ],
      "login": [
        "My reports are saved on this device. Sign in to manage your account.",
        "Sign in"
      ],
      "home": [
        "Enter your birth details, read the chart summary, then ask a question if you wish.",
        "Go home"
      ]
    }
  },
  "ja": {
    "navigation": {
      "home": "ホーム",
      "book": "命書を作成",
      "reports": "私のレポート",
      "aria": "レポートとナビゲーション",
      "help": "使い方"
    },
    "utility": {
      "siteAria": "サイトツール",
      "music": "音楽",
      "guide": "ガイド",
      "close": "閉じる",
      "title": "サイト案内",
      "placeholder": "例：完全版レポートを開く",
      "ask": "質問する",
      "report": "命書を作成",
      "today": "今日の暦",
      "tests": "診断とテスト",
      "history": "私のレポート",
      "more": "その他の機能",
      "help": "見つからない場合はこちらで質問",
      "notes": "記事",
      "advanced": "その他の命式と文化ツール"
    },
    "advanced": {
      "ziwei": "紫微斗数",
      "qizheng": "七政四余",
      "astrology": "西洋占星術",
      "indian": "インド占星術",
      "palm": "一掌経",
      "numerology": "数秘術",
      "knowledge": "文化と基礎知識",
      "atlas": "吉祥図鑑"
    },
    "journey": {
      "title": "3ステップで始める",
      "steps": [
        "出生情報を入力",
        "命書を読む",
        "質問する"
      ],
      "hints": [
        "生年月日・時間・都市を入力します。",
        "無料の概要を読み、必要に応じて詳細を開きます。",
        "必要なら質問を追加できます。レポートは「私のレポート」から見直せます。"
      ]
    },
    "guide": {
      "analysis": [
        "出生情報を入力し、無料の概要を読んだ後、必要なら質問してください。詳細版は画面の案内に従って解放できます。",
        "分析を始める"
      ],
      "history": [
        "保存済みのレポートは「私のレポート」から見直せます。",
        "レポートを見る"
      ],
      "account": [
        "レポートとテスト結果はこの端末に保存されます。管理や同期はアカウント画面で行えます。",
        "アカウントへ"
      ],
      "login": [
        "レポートはこの端末に保存されます。ログインしてアカウントを管理できます。",
        "ログイン"
      ],
      "home": [
        "出生情報を入力して概要を読み、必要なら質問してください。",
        "ホームに戻る"
      ]
    }
  },
  "ko": {
    "navigation": {
      "home": "홈",
      "book": "운명서 만들기",
      "reports": "내 보고서",
      "aria": "보고서 및 페이지 이동",
      "help": "사용 방법"
    },
    "utility": {
      "siteAria": "사이트 도구",
      "music": "음악",
      "guide": "안내",
      "close": "닫기",
      "title": "사이트 안내",
      "placeholder": "예: 전체 보고서로 이동해 줘",
      "ask": "질문하기",
      "report": "운명서 만들기",
      "today": "오늘의 안내",
      "tests": "테스트 둘러보기",
      "history": "내 보고서",
      "more": "더 많은 기능",
      "help": "원하는 메뉴가 없나요? 여기에서 질문하세요",
      "notes": "글",
      "advanced": "기타 명식 및 문화 도구"
    },
    "advanced": {
      "ziwei": "자미두수 명반",
      "qizheng": "칠정사여",
      "astrology": "서양 점성술",
      "indian": "인도 점성술",
      "palm": "일장경",
      "numerology": "수비학",
      "knowledge": "문화 지식",
      "atlas": "길상 도감"
    },
    "journey": {
      "title": "세 단계로 시작",
      "steps": [
        "출생 정보 입력",
        "명식 읽기",
        "질문하기"
      ],
      "hints": [
        "생년월일과 시간, 도시를 입력하세요.",
        "무료 요약을 보고 필요하면 세부 내용을 여세요.",
        "원하면 질문을 추가하세요. 내 보고서에서 다시 볼 수 있습니다."
      ]
    },
    "guide": {
      "analysis": [
        "출생 정보를 입력하고 무료 요약을 확인한 뒤 필요하면 질문하세요. 전체 해설은 페이지 안내에 따라 잠금 해제할 수 있습니다.",
        "분석 시작하기"
      ],
      "history": [
        "저장한 이전 보고서는 내 보고서에서 볼 수 있습니다.",
        "내 보고서 보기"
      ],
      "account": [
        "보고서와 테스트 결과는 이 기기에 저장됩니다. 관리 및 동기화는 계정 페이지에서 하세요.",
        "계정으로 이동"
      ],
      "login": [
        "보고서는 이 기기에 저장됩니다. 로그인해 계정을 관리하세요.",
        "로그인"
      ],
      "home": [
        "출생 정보를 입력하고 명식 요약을 본 다음 필요하면 질문하세요.",
        "홈으로"
      ]
    }
  },
  "hi": {
    "navigation": {
      "home": "होम",
      "book": "अपनी रिपोर्ट बनाएँ",
      "reports": "मेरी रिपोर्टें",
      "aria": "रिपोर्ट और नेविगेशन",
      "help": "उपयोग कैसे करें"
    },
    "utility": {
      "siteAria": "वेबसाइट टूल",
      "music": "संगीत",
      "guide": "मार्गदर्शिका",
      "close": "बंद करें",
      "title": "वेबसाइट मार्गदर्शिका",
      "placeholder": "उदाहरण: मेरी पूरी रिपोर्ट खोलें",
      "ask": "पूछें",
      "report": "जन्म-आधारित रिपोर्ट बनाएँ",
      "today": "आज का पंचांग",
      "tests": "परीक्षण देखें",
      "history": "मेरी रिपोर्टें",
      "more": "अधिक सुविधाएँ",
      "help": "कुछ नहीं मिल रहा? यहाँ पूछें",
      "notes": "लेख",
      "advanced": "अन्य कुंडली और सांस्कृतिक उपकरण"
    },
    "advanced": {
      "ziwei": "ज़ी वेई जन्म-कुंडली",
      "qizheng": "सप्त ग्रह पद्धति",
      "astrology": "पश्चिमी ज्योतिष",
      "indian": "भारतीय ज्योतिष",
      "palm": "एक हथेली का शास्त्र",
      "numerology": "अंक ज्योतिष",
      "knowledge": "सांस्कृतिक ज्ञान",
      "atlas": "शुभ चित्र संग्रह"
    },
    "journey": {
      "title": "तीन चरणों में शुरू करें",
      "steps": [
        "जन्म विवरण",
        "रिपोर्ट पढ़ें",
        "प्रश्न पूछें"
      ],
      "hints": [
        "जन्म तारीख, समय और शहर दर्ज करें।",
        "मुफ़्त सारांश पढ़ें; ज़रूरत पर विवरण खोलें।",
        "चाहें तो प्रश्न पूछें। पुरानी रिपोर्ट 'मेरी रिपोर्टें' में देखें।"
      ]
    },
    "guide": {
      "analysis": [
        "जन्म विवरण भरें, मुफ़्त सारांश पढ़ें और चाहें तो प्रश्न पूछें। पूरी रिपोर्ट पृष्ठ पर बताए अनुसार अनलॉक करें।",
        "विश्लेषण शुरू करें"
      ],
      "history": [
        "पहले सहेजी गई रिपोर्टें 'मेरी रिपोर्टें' में देखें।",
        "मेरी रिपोर्टें खोलें"
      ],
      "account": [
        "आपकी रिपोर्टें और परीक्षण इस डिवाइस पर सहेजे जाते हैं। प्रबंधन के लिए खाता पृष्ठ पर जाएँ।",
        "खाते पर जाएँ"
      ],
      "login": [
        "रिपोर्टें इस डिवाइस पर सहेजी जाती हैं। अपना खाता प्रबंधित करने के लिए साइन इन करें।",
        "साइन इन करें"
      ],
      "home": [
        "जन्म विवरण भरें, सारांश पढ़ें और चाहें तो प्रश्न पूछें।",
        "होम पर लौटें"
      ]
    }
  },
  "th": {
    "navigation": {
      "home": "หน้าแรก",
      "book": "สร้างรายงานดวงชะตา",
      "reports": "รายงานของฉัน",
      "aria": "รายงานและการนำทาง",
      "help": "วิธีใช้งาน"
    },
    "utility": {
      "siteAria": "เครื่องมือเว็บไซต์",
      "music": "เพลง",
      "guide": "คู่มือ",
      "close": "ปิด",
      "title": "คู่มือเว็บไซต์",
      "placeholder": "ตัวอย่าง: พาฉันไปดูรายงานฉบับเต็ม",
      "ask": "ถาม",
      "report": "สร้างรายงานดวงชะตา",
      "today": "ปฏิทินมงคลวันนี้",
      "tests": "แบบทดสอบ",
      "history": "รายงานของฉัน",
      "more": "ฟีเจอร์เพิ่มเติม",
      "help": "หาสิ่งที่ต้องการไม่พบ? ถามที่นี่",
      "notes": "บทความ",
      "advanced": "ผังดวงและเครื่องมือวัฒนธรรมอื่น"
    },
    "advanced": {
      "ziwei": "แผนภูมิจื่อเวย",
      "qizheng": "โหราศาสตร์เจ็ดดวง",
      "astrology": "โหราศาสตร์ตะวันตก",
      "indian": "โหราศาสตร์อินเดีย",
      "palm": "คัมภีร์หนึ่งฝ่ามือ",
      "numerology": "เลขศาสตร์",
      "knowledge": "ความรู้ทางวัฒนธรรม",
      "atlas": "ภาพสัญลักษณ์มงคล"
    },
    "journey": {
      "title": "เริ่มในสามขั้นตอน",
      "steps": [
        "กรอกข้อมูลเกิด",
        "อ่านผลดวง",
        "ถามคำถาม"
      ],
      "hints": [
        "กรอกวัน เวลา และเมืองที่เกิด",
        "อ่านสรุปฟรีก่อน แล้วเปิดรายละเอียดเมื่อต้องการ",
        "ถามคำถามเพิ่มเติมได้ และเปิดรายงานเก่าได้จากรายงานของฉัน"
      ]
    },
    "guide": {
      "analysis": [
        "กรอกข้อมูลเกิด อ่านสรุปฟรี แล้วถามเพิ่มเติมได้ รายงานฉบับเต็มปลดล็อกตามที่หน้าเว็บระบุ",
        "เริ่มวิเคราะห์"
      ],
      "history": [
        "รายงานที่บันทึกไว้เปิดดูอีกครั้งได้ในรายงานของฉัน",
        "เปิดรายงานของฉัน"
      ],
      "account": [
        "รายงานและแบบทดสอบบันทึกไว้ในอุปกรณ์นี้ หากต้องการจัดการหรือซิงก์ให้ไปที่หน้าบัญชี",
        "ไปที่บัญชี"
      ],
      "login": [
        "รายงานจะเก็บไว้ในอุปกรณ์นี้ เข้าสู่ระบบเพื่อจัดการบัญชี",
        "เข้าสู่ระบบ"
      ],
      "home": [
        "กรอกข้อมูลเกิด อ่านสรุปดวง แล้วถามเพิ่มเติมได้",
        "กลับหน้าแรก"
      ]
    }
  },
  "id": {
    "navigation": {
      "home": "Beranda",
      "book": "Buat laporan saya",
      "reports": "Laporan saya",
      "aria": "Laporan dan navigasi",
      "help": "Cara menggunakan"
    },
    "utility": {
      "siteAria": "Alat situs",
      "music": "Musik",
      "guide": "Panduan",
      "close": "Tutup",
      "title": "Panduan situs",
      "placeholder": "Contoh: buka laporan lengkap saya",
      "ask": "Tanya",
      "report": "Buat laporan kelahiran",
      "today": "Panduan hari ini",
      "tests": "Jelajahi kuis",
      "history": "Laporan saya",
      "more": "Fitur lainnya",
      "help": "Tidak menemukan sesuatu? Tanya di sini",
      "notes": "Artikel",
      "advanced": "Bagan lain dan alat budaya"
    },
    "advanced": {
      "ziwei": "Bagan Zi Wei",
      "qizheng": "Tujuh Benda Langit",
      "astrology": "Astrologi Barat",
      "indian": "Astrologi India",
      "palm": "Kitab Satu Telapak",
      "numerology": "Numerologi",
      "knowledge": "Pengetahuan budaya",
      "atlas": "Atlas karya seni"
    },
    "journey": {
      "title": "Mulai dalam tiga langkah",
      "steps": [
        "Isi data lahir",
        "Baca bagan Anda",
        "Ajukan pertanyaan"
      ],
      "hints": [
        "Masukkan tanggal, waktu, dan kota lahir Anda.",
        "Baca ringkasan gratis terlebih dahulu; buka detail bila perlu.",
        "Anda boleh mengajukan pertanyaan. Buka ulang hasil di Laporan saya."
      ]
    },
    "guide": {
      "analysis": [
        "Isi data lahir, baca ringkasan gratis, lalu ajukan pertanyaan bila perlu. Laporan lengkap dapat dibuka sesuai petunjuk halaman.",
        "Mulai analisis"
      ],
      "history": [
        "Laporan yang sudah disimpan dapat dibuka kembali di Laporan saya.",
        "Buka laporan saya"
      ],
      "account": [
        "Laporan dan hasil kuis tersimpan di perangkat ini. Kelola atau sinkronkan melalui halaman Akun.",
        "Ke akun"
      ],
      "login": [
        "Laporan tersimpan di perangkat ini. Masuk untuk mengelola akun Anda.",
        "Masuk"
      ],
      "home": [
        "Isi data lahir, baca ringkasan, lalu ajukan pertanyaan bila ingin.",
        "Kembali ke beranda"
      ]
    }
  },
  "vi": {
    "navigation": {
      "home": "Trang chủ",
      "book": "Tạo bản luận mệnh",
      "reports": "Báo cáo của tôi",
      "aria": "Báo cáo và điều hướng",
      "help": "Cách sử dụng"
    },
    "utility": {
      "siteAria": "Công cụ trang web",
      "music": "Âm nhạc",
      "guide": "Hướng dẫn",
      "close": "Đóng",
      "title": "Hướng dẫn trang web",
      "placeholder": "Ví dụ: mở báo cáo đầy đủ của tôi",
      "ask": "Hỏi",
      "report": "Tạo bản luận mệnh",
      "today": "Lịch ngày hôm nay",
      "tests": "Khám phá bài trắc nghiệm",
      "history": "Báo cáo của tôi",
      "more": "Thêm tính năng",
      "help": "Không tìm thấy? Hãy hỏi tại đây",
      "notes": "Bài viết",
      "advanced": "Lá số khác và công cụ văn hóa"
    },
    "advanced": {
      "ziwei": "Lá số Tử Vi",
      "qizheng": "Thất Chính Tứ Dư",
      "astrology": "Chiêm tinh phương Tây",
      "indian": "Chiêm tinh Ấn Độ",
      "palm": "Kinh Nhất Chưởng",
      "numerology": "Thần số học",
      "knowledge": "Kiến thức văn hóa",
      "atlas": "Bộ sưu tập biểu tượng"
    },
    "journey": {
      "title": "Bắt đầu trong ba bước",
      "steps": [
        "Nhập thông tin sinh",
        "Đọc lá số",
        "Đặt câu hỏi"
      ],
      "hints": [
        "Nhập ngày, giờ và thành phố sinh.",
        "Đọc bản tóm tắt miễn phí; mở chi tiết khi cần.",
        "Bạn có thể đặt câu hỏi. Xem lại trong Báo cáo của tôi."
      ]
    },
    "guide": {
      "analysis": [
        "Nhập thông tin sinh, đọc tóm tắt miễn phí rồi đặt câu hỏi nếu muốn. Bản đầy đủ được mở khóa theo hướng dẫn trên trang.",
        "Bắt đầu phân tích"
      ],
      "history": [
        "Báo cáo đã lưu có thể xem lại trong Báo cáo của tôi.",
        "Mở báo cáo của tôi"
      ],
      "account": [
        "Báo cáo và bài trắc nghiệm lưu trên thiết bị này. Vào trang Tài khoản để quản lý hoặc đồng bộ.",
        "Đến tài khoản"
      ],
      "login": [
        "Báo cáo được lưu trên thiết bị này. Đăng nhập để quản lý tài khoản.",
        "Đăng nhập"
      ],
      "home": [
        "Nhập thông tin sinh, đọc bản tóm tắt, rồi đặt câu hỏi nếu muốn.",
        "Về trang chủ"
      ]
    }
  },
  "fil": {
    "navigation": {
      "home": "Simula",
      "book": "Gumawa ng ulat",
      "reports": "Aking mga ulat",
      "aria": "Mga ulat at nabigasyon",
      "help": "Paano gamitin"
    },
    "utility": {
      "siteAria": "Mga tool ng website",
      "music": "Musika",
      "guide": "Gabay",
      "close": "Isara",
      "title": "Gabay sa website",
      "placeholder": "Halimbawa: buksan ang buo kong ulat",
      "ask": "Magtanong",
      "report": "Gumawa ng ulat sa kapanganakan",
      "today": "Gabay ngayong araw",
      "tests": "Mga pagsusulit",
      "history": "Aking mga ulat",
      "more": "Iba pang tampok",
      "help": "Hindi makita ang hinahanap? Magtanong dito",
      "notes": "Mga artikulo",
      "advanced": "Iba pang chart at pangkulturang tool"
    },
    "advanced": {
      "ziwei": "Zi Wei chart",
      "qizheng": "Seven Luminaries",
      "astrology": "Kanluraning astrolohiya",
      "indian": "Astrolohiyang Indian",
      "palm": "Dharma Palm",
      "numerology": "Numerolohiya",
      "knowledge": "Kaalamang pangkultura",
      "atlas": "Koleksiyon ng sining"
    },
    "journey": {
      "title": "Magsimula sa tatlong hakbang",
      "steps": [
        "Ilagay ang impormasyon ng kapanganakan",
        "Basahin ang iyong chart",
        "Magtanong"
      ],
      "hints": [
        "Ilagay ang petsa, oras at lungsod ng kapanganakan.",
        "Basahin muna ang libreng buod; buksan ang detalye kung kailangan.",
        "Puwede kang magtanong pa. Balikan ang sagot sa Aking mga ulat."
      ]
    },
    "guide": {
      "analysis": [
        "Ilagay ang impormasyon ng kapanganakan, basahin ang libreng buod, at magtanong kung gusto mo. Sundin ang pahina para i-unlock ang buong ulat.",
        "Simulan ang pagsusuri"
      ],
      "history": [
        "Makikita sa Aking mga ulat ang mga na-save mong ulat.",
        "Buksan ang aking mga ulat"
      ],
      "account": [
        "Naka-save ang mga ulat at pagsusulit mo sa device na ito. Pumunta sa Account upang pamahalaan o i-sync ang mga ito.",
        "Pumunta sa account"
      ],
      "login": [
        "Naka-save ang mga ulat sa device na ito. Mag-sign in upang pamahalaan ang account.",
        "Mag-sign in"
      ],
      "home": [
        "Ilagay ang impormasyon ng kapanganakan, basahin ang buod at magtanong kung gusto mo.",
        "Bumalik sa home"
      ]
    }
  }
};
