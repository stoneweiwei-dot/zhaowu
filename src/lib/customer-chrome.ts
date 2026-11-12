import { useDisplayLanguage, type DisplayLanguage } from "@/lib/display-language";

// Offline customer UI copy. Long-form content keeps its existing locale fallback.
export const CUSTOMER_CHROME = {
  "One birth record. One ZHAOWU Destiny Book.": {
    "ja": "一つの生年月日から、あなたの昭梧命書へ。",
    "ko": "하나의 출생 기록으로 읽는 나의 昭梧 명서.",
    "hi": "एक जन्म विवरण से आपकी ZHAOWU जीवन-पुस्तिका।",
    "th": "ข้อมูลเกิดหนึ่งชุด สู่หนังสือชีวิต昭梧ของคุณ",
    "id": "Satu catatan kelahiran, satu buku kehidupan ZHAOWU.",
    "vi": "Một hồ sơ ngày sinh, một cuốn sách cuộc đời ZHAOWU.",
    "fil": "Isang tala ng kapanganakan, isang aklat ng buhay sa ZHAOWU."
  },
  "ZHAOWU · PERSONAL DESTINY BOOK": {
    "ja": "昭梧 · あなたの命書",
    "ko": "昭梧 · 나의 명서",
    "hi": "ZHAOWU · आपकी जीवन-पुस्तिका",
    "th": "昭梧 · หนังสือชีวิตส่วนบุคคล",
    "id": "ZHAOWU · BUKU KEHIDUPAN PRIBADI",
    "vi": "ZHAOWU · SÁCH CUỘC ĐỜI CÁ NHÂN",
    "fil": "ZHAOWU · PERSONAL NA AKLAT NG BUHAY"
  },
  "Heaven counts to forty-nine — and leaves one line open.": {
    "ja": "天は四十九を数え、一つの余地を残す。",
    "ko": "하늘은 마흔아홉을 헤아리고 하나의 여지를 남깁니다.",
    "hi": "आकाश उनचास गिनता है और एक संभावना खुली छोड़ता है।",
    "th": "ฟ้านับถึงสี่สิบเก้า แล้วเหลือช่องทางหนึ่งไว้",
    "id": "Langit menghitung empat puluh sembilan dan menyisakan satu kemungkinan.",
    "vi": "Trời đếm đến bốn mươi chín, để ngỏ một khả năng.",
    "fil": "Bumibilang ang langit hanggang apatnapu't siyam, at nag-iiwan ng isang posibilidad."
  },
  "Start here: enter your birth date": {
    "ja": "ここから：生年月日を入力",
    "ko": "여기서 시작: 생년월일 입력",
    "hi": "यहाँ शुरू करें: जन्मतिथि भरें",
    "th": "เริ่มที่นี่: กรอกวันเกิด",
    "id": "Mulai di sini: isi tanggal lahir",
    "vi": "Bắt đầu tại đây: nhập ngày sinh",
    "fil": "Magsimula rito: ilagay ang petsa ng kapanganakan"
  },
  "Free · no sign-up · about 1 minute": {
    "ja": "無料 · 登録不要 · 約1分",
    "ko": "무료 · 가입 불필요 · 약 1분",
    "hi": "निःशुल्क · पंजीकरण नहीं · लगभग 1 मिनट",
    "th": "ฟรี · ไม่ต้องสมัคร · ประมาณ 1 นาที",
    "id": "Gratis · tanpa mendaftar · sekitar 1 menit",
    "vi": "Miễn phí · không cần đăng ký · khoảng 1 phút",
    "fil": "Libre · walang pagpaparehistro · humigit-kumulang 1 minuto"
  },
  "More features": {
    "ja": "その他の機能",
    "ko": "더 많은 기능",
    "hi": "अन्य सुविधाएँ",
    "th": "คุณสมบัติเพิ่มเติม",
    "id": "Fitur lainnya",
    "vi": "Tính năng khác",
    "fil": "Iba pang tampok"
  },
  "Create report": {
    "ja": "命書を作成",
    "ko": "명서 만들기",
    "hi": "रिपोर्ट बनाएँ",
    "th": "สร้างรายงาน",
    "id": "Buat laporan",
    "vi": "Tạo báo cáo",
    "fil": "Gumawa ng ulat"
  },
  "Today": {
    "ja": "今日",
    "ko": "오늘",
    "hi": "आज",
    "th": "วันนี้",
    "id": "Hari ini",
    "vi": "Hôm nay",
    "fil": "Ngayong araw"
  },
  "Explore": {
    "ja": "探す",
    "ko": "둘러보기",
    "hi": "खोजें",
    "th": "สำรวจ",
    "id": "Jelajahi",
    "vi": "Khám phá",
    "fil": "Tuklasin"
  },
  "Notes": {
    "ja": "記事",
    "ko": "글",
    "hi": "लेख",
    "th": "บทความ",
    "id": "Artikel",
    "vi": "Bài viết",
    "fil": "Mga artikulo"
  },
  "Back to Home": {
    "ja": "ホームへ戻る",
    "ko": "홈으로 돌아가기",
    "hi": "मुखपृष्ठ पर लौटें",
    "th": "กลับหน้าหลัก",
    "id": "Kembali ke beranda",
    "vi": "Về trang chủ",
    "fil": "Bumalik sa pangunahing pahina"
  },
  "almanac, five-element dress and spirit slip": {
    "ja": "暦・五行の装い・おみくじ",
    "ko": "역서, 오행 옷차림, 운세 제비",
    "hi": "पंचांग, पंचतत्व के अनुसार पहनावा और प्रतीकात्मक पर्ची",
    "th": "ปฏิทิน การแต่งกายตามธาตุ และเซียมซี",
    "id": "Almanak, busana lima unsur, dan undian simbolis",
    "vi": "Lịch, trang phục ngũ hành và quẻ biểu tượng",
    "fil": "Kalendaryo, pananamit ayon sa limang elemento, at simbolikong bunot"
  },
  "optional self-discovery tests": {
    "ja": "自分を知るための任意テスト",
    "ko": "선택형 자기 탐색 테스트",
    "hi": "स्वयं को समझने के वैकल्पिक परीक्षण",
    "th": "แบบทดสอบเพื่อรู้จักตนเอง เลือกทำได้",
    "id": "Tes pengenalan diri opsional",
    "vi": "Bài trắc nghiệm tự khám phá, tùy chọn",
    "fil": "Mga opsyonal na pagsusulit para kilalanin ang sarili"
  },
  "Notes on Life": {
    "ja": "暮らしの手帖",
    "ko": "삶의 기록",
    "hi": "जीवन पर विचार",
    "th": "บันทึกชีวิต",
    "id": "Catatan Kehidupan",
    "vi": "Ghi chép cuộc sống",
    "fil": "Mga Tala sa Buhay"
  },
  "essays and editorial archive": {
    "ja": "随筆と記事のアーカイブ",
    "ko": "에세이와 글 모음",
    "hi": "निबंध और लेखों का संग्रह",
    "th": "คลังบทความและข้อเขียน",
    "id": "Arsip esai dan tulisan editorial",
    "vi": "Kho tiểu luận và bài viết",
    "fil": "Kalipunan ng mga sanaysay at artikulo"
  },
  "Five-Element Scent Map": {
    "ja": "五行の香りマップ",
    "ko": "오행 향기 지도",
    "hi": "पंचतत्व सुगंध मानचित्र",
    "th": "แผนที่กลิ่นห้าธาตุ",
    "id": "Peta Aroma Lima Unsur",
    "vi": "Bản đồ hương ngũ hành",
    "fil": "Mapa ng Amoy at Limang Elemento"
  },
  "sensory preference vs. five-element symbolism": {
    "ja": "香りの好みと五行の象徴",
    "ko": "향기 취향과 오행의 상징",
    "hi": "सुगंध की पसंद और पंचतत्व के प्रतीक",
    "th": "ความชอบด้านกลิ่นกับสัญลักษณ์ห้าธาตุ",
    "id": "Preferensi indra dan simbolisme lima unsur",
    "vi": "Sở thích mùi hương và biểu tượng ngũ hành",
    "fil": "Hilig sa amoy at simbolismo ng limang elemento"
  },
  "Divine Affinity Scan": {
    "ja": "神仏との縁テスト",
    "ko": "신불 인연 테스트",
    "hi": "दैवी जुड़ाव परीक्षण",
    "th": "แบบทดสอบสายสัมพันธ์กับเทพ",
    "id": "Tes Kedekatan Spiritual",
    "vi": "Trắc nghiệm duyên với thần Phật",
    "fil": "Pagsusulit ng Espirituwal na Ugnayan"
  },
  "Cultivation Destiny Dossier": {
    "ja": "修仙の資質テスト",
    "ko": "수선 자질 테스트",
    "hi": "साधना प्रवृत्ति परीक्षण",
    "th": "แบบทดสอบเส้นทางบำเพ็ญเพียร",
    "id": "Profil Jalan Kultivasi",
    "vi": "Hồ sơ căn cơ tu luyện",
    "fil": "Tala ng Landas ng Pagsasanay"
  },
  "Twelve Brand Archetypes": {
    "ja": "ブランドの12原型",
    "ko": "브랜드 12원형",
    "hi": "ब्रांड के बारह आदिरूप",
    "th": "ต้นแบบแบรนด์สิบสองแบบ",
    "id": "Dua Belas Arketipe Merek",
    "vi": "Mười hai hình mẫu thương hiệu",
    "fil": "Labindalawang Arketipo ng Tatak"
  },
  "Earth Online · Classics Guide": {
    "ja": "地球オンライン · 古典ガイド",
    "ko": "지구 온라인 · 고전 길잡이",
    "hi": "पृथ्वी ऑनलाइन · शास्त्रीय ग्रंथ मार्गदर्शिका",
    "th": "โลกออนไลน์ · คู่มือคัมภีร์",
    "id": "Bumi Online · Panduan Klasik",
    "vi": "Trái Đất trực tuyến · Hướng dẫn kinh điển",
    "fil": "Daigdig Online · Gabay sa mga Klasiko"
  },
  "Inner Animal × Guardian Beast": {
    "ja": "内なる動物 × 守護獣",
    "ko": "내면 동물 × 수호 동물",
    "hi": "भीतरी पशु-प्रतीक × संरक्षक प्राणी",
    "th": "สัตว์ภายใน × สัตว์ผู้พิทักษ์",
    "id": "Hewan Batin × Hewan Pelindung",
    "vi": "Con vật nội tâm × Linh thú hộ mệnh",
    "fil": "Panloob na Hayop × Tagapagbantay"
  },
  "Five-Element Function Test": {
    "ja": "五行の機能テスト",
    "ko": "오행 기능 테스트",
    "hi": "पंचतत्व कार्य परीक्षण",
    "th": "แบบทดสอบหน้าที่ห้าธาตุ",
    "id": "Tes Fungsi Lima Unsur",
    "vi": "Trắc nghiệm chức năng ngũ hành",
    "fil": "Pagsusulit ng Gawain ng Limang Elemento"
  },
  "Six Realms Habit Test": {
    "ja": "六道の習慣テスト",
    "ko": "육도 습관 테스트",
    "hi": "छह लोकों का आदत परीक्षण",
    "th": "แบบทดสอบนิสัยหกภูมิ",
    "id": "Tes Kebiasaan Enam Alam",
    "vi": "Trắc nghiệm tập khí lục đạo",
    "fil": "Pagsusulit ng Gawi sa Anim na Daigdig"
  },
  "Five-Element Overuse Test": {
    "ja": "五行の強みの使いすぎテスト",
    "ko": "오행 강점 과용 테스트",
    "hi": "पंचतत्व शक्तियों के अति-प्रयोग का परीक्षण",
    "th": "แบบทดสอบการใช้จุดแข็งห้าธาตุมากเกินไป",
    "id": "Tes Penggunaan Berlebih Lima Unsur",
    "vi": "Trắc nghiệm lạm dụng thế mạnh ngũ hành",
    "fil": "Pagsusulit ng Labis na Paggamit ng Limang Elemento"
  },
  "Chronicle of the Yellow Springs": {
    "ja": "黄泉の年代記",
    "ko": "황천 연대기",
    "hi": "अधोलोक का वृत्तांत",
    "th": "พงศาวดารแดนปรโลก",
    "id": "Kronik Alam Baka",
    "vi": "Biên niên Hoàng Tuyền",
    "fil": "Salaysay ng Kabilang Buhay"
  },
  "ZHAOWU artwork carousel": {
    "ja": "昭梧の作品スライド",
    "ko": "昭梧 작품 슬라이드",
    "hi": "ZHAOWU चित्र प्रदर्शनी",
    "th": "ภาพเลื่อนผลงาน昭梧",
    "id": "Galeri bergulir ZHAOWU",
    "vi": "Trình chiếu tác phẩm ZHAOWU",
    "fil": "Palabas ng mga larawang ZHAOWU"
  },
  "Artwork controls": {
    "ja": "作品表示の操作",
    "ko": "작품 표시 제어",
    "hi": "चित्र नियंत्रण",
    "th": "ตัวควบคุมภาพ",
    "id": "Kontrol karya seni",
    "vi": "Điều khiển tác phẩm",
    "fil": "Mga kontrol ng larawan"
  },
  "Previous artwork": {
    "ja": "前の作品",
    "ko": "이전 작품",
    "hi": "पिछला चित्र",
    "th": "ภาพก่อนหน้า",
    "id": "Karya sebelumnya",
    "vi": "Tác phẩm trước",
    "fil": "Nakaraang larawan"
  },
  "Next artwork": {
    "ja": "次の作品",
    "ko": "다음 작품",
    "hi": "अगला चित्र",
    "th": "ภาพถัดไป",
    "id": "Karya berikutnya",
    "vi": "Tác phẩm sau",
    "fil": "Susunod na larawan"
  },
  "Pause artwork rotation": {
    "ja": "作品の自動切替を停止",
    "ko": "작품 자동 전환 일시정지",
    "hi": "चित्रों का स्वतः बदलाव रोकें",
    "th": "หยุดเปลี่ยนภาพอัตโนมัติชั่วคราว",
    "id": "Jeda pergantian karya",
    "vi": "Tạm dừng chuyển tác phẩm",
    "fil": "Ihinto muna ang awtomatikong pagpapalit"
  },
  "Play artwork rotation": {
    "ja": "作品の自動切替を再開",
    "ko": "작품 자동 전환 재생",
    "hi": "चित्रों का स्वतः बदलाव चलाएँ",
    "th": "เริ่มเปลี่ยนภาพอัตโนมัติ",
    "id": "Putar pergantian karya",
    "vi": "Tiếp tục chuyển tác phẩm",
    "fil": "Ituloy ang awtomatikong pagpapalit"
  },
  "Main features": {
    "ja": "主な機能",
    "ko": "주요 기능",
    "hi": "मुख्य सुविधाएँ",
    "th": "คุณสมบัติหลัก",
    "id": "Fitur utama",
    "vi": "Tính năng chính",
    "fil": "Mga pangunahing tampok"
  },
  "FUN TESTS": {
    "ja": "趣味テスト",
    "ko": "재미로 보는 테스트",
    "hi": "मनोरंजक परीक्षण",
    "th": "แบบทดสอบสนุก ๆ",
    "id": "TES RINGAN",
    "vi": "TRẮC NGHIỆM VUI",
    "fil": "MGA MASAYANG PAGSUSULIT"
  },
  "Zhaowu self-tests": {
    "ja": "昭梧の自己理解テスト",
    "ko": "昭梧 자기 이해 테스트",
    "hi": "ZHAOWU स्व-परीक्षण",
    "th": "แบบทดสอบตนเอง昭梧",
    "id": "Tes Diri Zhaowu",
    "vi": "Trắc nghiệm tự tìm hiểu Zhaowu",
    "fil": "Mga Pagsusuri sa Sarili ng Zhaowu"
  },
  "You’ll learn": {
    "ja": "わかること",
    "ko": "알 수 있는 것",
    "hi": "आप जानेंगे",
    "th": "สิ่งที่จะได้เรียนรู้",
    "id": "Yang akan dipelajari",
    "vi": "Bạn sẽ hiểu",
    "fil": "Matututuhan mo"
  },
  "Best for": {
    "ja": "こんなときに",
    "ko": "이럴 때 적합",
    "hi": "किसके लिए उपयोगी",
    "th": "เหมาะสำหรับ",
    "id": "Cocok untuk",
    "vi": "Phù hợp để",
    "fil": "Angkop para sa"
  },
  "Start test": {
    "ja": "テストを始める",
    "ko": "테스트 시작",
    "hi": "परीक्षण शुरू करें",
    "th": "เริ่มแบบทดสอบ",
    "id": "Mulai tes",
    "vi": "Bắt đầu trắc nghiệm",
    "fil": "Simulan ang pagsusulit"
  },
  "Core need": {
    "ja": "中心となる欲求",
    "ko": "핵심 욕구",
    "hi": "मुख्य आवश्यकता",
    "th": "ความต้องการหลัก",
    "id": "Kebutuhan inti",
    "vi": "Nhu cầu cốt lõi",
    "fil": "Pangunahing pangangailangan"
  },
  "Strengths": {
    "ja": "強み",
    "ko": "강점",
    "hi": "खूबियाँ",
    "th": "จุดแข็ง",
    "id": "Kekuatan",
    "vi": "Điểm mạnh",
    "fil": "Mga kalakasan"
  },
  "Watch when overused": {
    "ja": "使いすぎへの注意",
    "ko": "과용 시 주의",
    "hi": "अति-प्रयोग में सावधानी",
    "th": "ระวังเมื่อใช้มากเกินไป",
    "id": "Waspadai jika berlebihan",
    "vi": "Lưu ý khi dùng quá mức",
    "fil": "Bantayan kapag nasosobrahan"
  },
  "Chart guardian beast": {
    "ja": "命盤の守護獣",
    "ko": "명식 수호 동물",
    "hi": "जन्मकुंडली का संरक्षक प्राणी",
    "th": "สัตว์ผู้พิทักษ์ตามดวง",
    "id": "Hewan pelindung bagan lahir",
    "vi": "Linh thú theo lá số",
    "fil": "Tagapagbantay ayon sa tsart"
  },
  "Create my chart": {
    "ja": "命盤を作成",
    "ko": "내 명식 만들기",
    "hi": "मेरी जन्मकुंडली बनाएँ",
    "th": "สร้างดวงของฉัน",
    "id": "Buat bagan saya",
    "vi": "Lập lá số của tôi",
    "fil": "Gumawa ng aking tsart"
  },
  "Take the test again": {
    "ja": "もう一度テストする",
    "ko": "다시 테스트하기",
    "hi": "दोबारा परीक्षण करें",
    "th": "ทำแบบทดสอบอีกครั้ง",
    "id": "Ulangi tes",
    "vi": "Làm lại trắc nghiệm",
    "fil": "Ulitin ang pagsusulit"
  },
  "Back to fun tests": {
    "ja": "趣味テストへ戻る",
    "ko": "재미 테스트로 돌아가기",
    "hi": "मनोरंजक परीक्षणों पर लौटें",
    "th": "กลับไปแบบทดสอบสนุก ๆ",
    "id": "Kembali ke tes ringan",
    "vi": "Về trắc nghiệm vui",
    "fil": "Bumalik sa mga masayang pagsusulit"
  },
  "ZHAOWU · KNOWLEDGE": {
    "ja": "昭梧 · 知識",
    "ko": "昭梧 · 지식",
    "hi": "ZHAOWU · ज्ञान",
    "th": "昭梧 · ความรู้",
    "id": "ZHAOWU · PENGETAHUAN",
    "vi": "ZHAOWU · KIẾN THỨC",
    "fil": "ZHAOWU · KAALAMAN"
  },
  "Articles and teaching notes, clearly separated.": {
    "ja": "記事と学習ノートを分けて読む。",
    "ko": "글과 학습 자료를 나누어 읽으세요.",
    "hi": "लेख और अध्ययन नोट्स अलग-अलग पढ़ें।",
    "th": "แยกอ่านบทความและบันทึกการเรียนรู้",
    "id": "Artikel dan catatan belajar, dipisahkan dengan jelas.",
    "vi": "Bài viết và ghi chú học tập được phân chia rõ ràng.",
    "fil": "Magkahiwalay ang mga artikulo at tala sa pag-aaral."
  },
  "Knowledge sections": {
    "ja": "知識の分類",
    "ko": "지식 분류",
    "hi": "ज्ञान के विभाग",
    "th": "หมวดความรู้",
    "id": "Bagian pengetahuan",
    "vi": "Các mục kiến thức",
    "fil": "Mga seksyon ng kaalaman"
  },
  "ARTICLES": {
    "ja": "記事",
    "ko": "글",
    "hi": "लेख",
    "th": "บทความ",
    "id": "ARTIKEL",
    "vi": "BÀI VIẾT",
    "fil": "MGA ARTIKULO"
  },
  "Essays & reflective notes": {
    "ja": "随筆と思索ノート",
    "ko": "에세이와 성찰 기록",
    "hi": "निबंध और चिंतन",
    "th": "บทความและบันทึกข้อคิด",
    "id": "Esai dan catatan refleksi",
    "vi": "Tiểu luận và ghi chép suy ngẫm",
    "fil": "Mga sanaysay at pagninilay"
  },
  "Editorial writing, research and reflections.": {
    "ja": "記事・研究・暮らしの記録。",
    "ko": "글, 연구와 삶의 성찰.",
    "hi": "लेख, शोध और जीवन पर विचार।",
    "th": "บทความ งานวิจัย และข้อคิด",
    "id": "Tulisan editorial, penelitian, dan refleksi.",
    "vi": "Bài viết, nghiên cứu và suy ngẫm.",
    "fil": "Mga artikulo, pananaliksik, at pagninilay."
  },
  "Methods & teaching cards": {
    "ja": "方法と学習カード",
    "ko": "방법과 학습 카드",
    "hi": "विधियाँ और अध्ययन कार्ड",
    "th": "วิธีการและบัตรความรู้",
    "id": "Metode dan kartu belajar",
    "vi": "Phương pháp và thẻ học tập",
    "fil": "Mga pamamaraan at kard sa pag-aaral"
  },
  "16 questions across Soul Pattern, Celestial Mandate": {
    "ja": "16問で魂の傾向と象徴的な使命を探る",
    "ko": "16문항으로 영혼의 성향과 상징적 소명 탐색",
    "hi": "16 प्रश्नों से आत्म-प्रवृत्ति और प्रतीकात्मक उद्देश्य समझें",
    "th": "16 คำถามสำรวจลักษณะจิตใจและภารกิจเชิงสัญลักษณ์",
    "id": "16 pertanyaan tentang pola jiwa dan panggilan simbolis",
    "vi": "16 câu hỏi về khuynh hướng tâm hồn và sứ mệnh biểu tượng",
    "fil": "16 na tanong tungkol sa hilig ng kaluluwa at simbolikong layunin"
  },
  "spirit root, sect, paths + personal 9:16 dossier image": {
    "ja": "霊根・門派・道筋と個人用9:16画像",
    "ko": "영근, 문파, 수련의 길과 개인 9:16 이미지",
    "hi": "साधना की जड़ें, परंपरा, मार्ग और निजी 9:16 चित्र",
    "th": "รากวิญญาณ สำนัก เส้นทาง และภาพส่วนตัว 9:16",
    "id": "Akar spiritual, aliran, jalan, dan gambar pribadi 9:16",
    "vi": "Linh căn, môn phái, đạo lộ và ảnh cá nhân 9:16",
    "fil": "Ugat ng espiritu, pangkat, landas, at personal na larawang 9:16"
  },
  "12 brand scenarios reveal your primary and supporting archetypes": {
    "ja": "12の場面からブランドの主原型と補助原型を探る",
    "ko": "12가지 브랜드 상황으로 주원형과 보조 원형 탐색",
    "hi": "ब्रांड की 12 स्थितियों से मुख्य और सहायक आदिरूप जानें",
    "th": "12 สถานการณ์ค้นหาต้นแบบหลักและรองของแบรนด์",
    "id": "12 situasi merek mengungkap arketipe utama dan pendukung",
    "vi": "12 tình huống thương hiệu giúp tìm hình mẫu chính và phụ",
    "fil": "12 sitwasyon ng tatak upang tuklasin ang pangunahing at pantulong na arketipo"
  },
  "8 questions to match your stuck point with a Chinese classic": {
    "ja": "8問で今の行き詰まりに合う中国古典を探す",
    "ko": "8문항으로 지금의 막힘에 맞는 중국 고전 찾기",
    "hi": "8 प्रश्नों से अपनी उलझन के लिए चीनी शास्त्रीय ग्रंथ खोजें",
    "th": "8 คำถามเพื่อเลือกคัมภีร์จีนที่เข้ากับจุดติดขัดของคุณ",
    "id": "8 pertanyaan untuk mencocokkan kebuntuan dengan karya klasik Tiongkok",
    "vi": "8 câu hỏi để tìm sách cổ Trung Hoa phù hợp với vướng mắc hiện tại",
    "fil": "8 tanong para itugma ang iyong suliranin sa isang klasikong akdang Tsino"
  },
  "current personality strategy and instinctive response": {
    "ja": "今の行動傾向と本能的な反応",
    "ko": "현재의 성격 전략과 본능적 반응",
    "hi": "वर्तमान व्यवहार शैली और सहज प्रतिक्रिया",
    "th": "แนวทางบุคลิกและการตอบสนองตามสัญชาตญาณ",
    "id": "Strategi kepribadian saat ini dan respons naluriah",
    "vi": "Chiến lược tính cách và phản ứng bản năng hiện tại",
    "fil": "Kasalukuyang paraan ng pagkilos at likas na tugon"
  },
  "which function you currently want to strengthen": {
    "ja": "今、伸ばしたい働きを知る",
    "ko": "지금 강화하고 싶은 기능",
    "hi": "अभी किस कार्यक्षमता को मजबूत करना चाहते हैं",
    "th": "หน้าที่ด้านใดที่คุณอยากเสริมตอนนี้",
    "id": "Fungsi yang ingin Anda perkuat saat ini",
    "vi": "Chức năng bạn muốn củng cố lúc này",
    "fil": "Aling kakayahan ang nais mong palakasin ngayon"
  },
  "which everyday habit pattern is strongest now": {
    "ja": "今、最も強い日常の習慣を知る",
    "ko": "지금 가장 강한 일상 습관",
    "hi": "अभी कौन-सी रोज़मर्रा की आदत सबसे प्रबल है",
    "th": "นิสัยประจำวันใดเด่นที่สุดในตอนนี้",
    "id": "Pola kebiasaan harian yang paling kuat saat ini",
    "vi": "Thói quen hằng ngày nào nổi bật nhất lúc này",
    "fil": "Aling pang-araw-araw na gawi ang pinakamalakas ngayon"
  },
  "10 everyday situations: which strength you overuse into friction": {
    "ja": "日常の10場面から、使いすぎて摩擦になる強みを探る",
    "ko": "10가지 일상 상황으로 마찰을 부르는 강점 과용 탐색",
    "hi": "रोज़मर्रा की 10 स्थितियाँ: किस खूबी का अति-प्रयोग तनाव बढ़ाता है",
    "th": "10 สถานการณ์: จุดแข็งใดที่ใช้เกินจนเกิดความขัดแย้ง",
    "id": "10 situasi harian: kekuatan mana yang berlebihan hingga menimbulkan gesekan",
    "vi": "10 tình huống: thế mạnh nào bị lạm dụng gây mâu thuẫn",
    "fil": "10 sitwasyon: aling kalakasan ang nasosobrahan at nagdudulot ng alitan"
  },
  "Explore twelve original plates, eight lineages and four connected chronicles": {
    "ja": "12の原画、8つの系統、4つのつながる物語を巡る",
    "ko": "원화 12점, 8개 계통과 연결된 4개 이야기 탐색",
    "hi": "बारह मूल चित्र, आठ वंश और चार जुड़ी कथाएँ देखें",
    "th": "สำรวจภาพต้นฉบับสิบสองภาพ แปดสาย และสี่เรื่องที่เชื่อมโยงกัน",
    "id": "Jelajahi dua belas karya asli, delapan garis keturunan, dan empat kisah terkait",
    "vi": "Khám phá mười hai tranh gốc, tám nhánh và bốn truyện liên kết",
    "fil": "Tuklasin ang labindalawang orihinal na larawan, walong angkan, at apat na magkakaugnay na salaysay"
  },
  "Loading Five-Element Scent Map": {
    "ja": "五行の香りマップを読み込み中",
    "ko": "오행 향기 지도 불러오는 중",
    "hi": "पंचतत्व सुगंध मानचित्र लोड हो रहा है",
    "th": "กำลังโหลดแผนที่กลิ่นห้าธาตุ",
    "id": "Memuat Peta Aroma Lima Unsur",
    "vi": "Đang tải bản đồ hương ngũ hành",
    "fil": "Nilo-load ang mapa ng amoy at limang elemento"
  },
  "Loading Notes on Life": {
    "ja": "暮らしの手帖を読み込み中",
    "ko": "삶의 기록 불러오는 중",
    "hi": "जीवन पर विचार लोड हो रहे हैं",
    "th": "กำลังโหลดบันทึกชีวิต",
    "id": "Memuat Catatan Kehidupan",
    "vi": "Đang tải ghi chép cuộc sống",
    "fil": "Nilo-load ang mga tala sa buhay"
  },
  "Automatic artwork rotation is disabled by Reduce Motion": {
    "ja": "動きを減らす設定のため自動切替は無効です",
    "ko": "동작 줄이기 설정으로 자동 전환이 꺼져 있습니다",
    "hi": "कम गति की सेटिंग के कारण चित्रों का स्वतः बदलाव बंद है",
    "th": "การตั้งค่าลดการเคลื่อนไหวปิดการเปลี่ยนภาพอัตโนมัติ",
    "id": "Pergantian otomatis dinonaktifkan oleh pengaturan kurangi gerakan",
    "vi": "Tự chuyển tác phẩm đã tắt theo cài đặt giảm chuyển động",
    "fil": "Naka-off ang awtomatikong pagpapalit dahil sa setting na bawasan ang galaw"
  },
  "My reports": {
    "ja": "マイレポート",
    "ko": "내 보고서",
    "hi": "मेरी रिपोर्टें",
    "th": "รายงานของฉัน",
    "id": "Laporan saya",
    "vi": "Báo cáo của tôi",
    "fil": "Mga ulat ko"
  },
  "Home": {
    "ja": "ホーム",
    "ko": "홈",
    "hi": "मुखपृष्ठ",
    "th": "หน้าหลัก",
    "id": "Beranda",
    "vi": "Trang chủ",
    "fil": "Pangunahing pahina"
  },
  "Sign in": {
    "ja": "ログイン",
    "ko": "로그인",
    "hi": "लॉग इन करें",
    "th": "เข้าสู่ระบบ",
    "id": "Masuk",
    "vi": "Đăng nhập",
    "fil": "Mag-sign in"
  },
  "Sign out": {
    "ja": "ログアウト",
    "ko": "로그아웃",
    "hi": "लॉग आउट करें",
    "th": "ออกจากระบบ",
    "id": "Keluar",
    "vi": "Đăng xuất",
    "fil": "Mag-sign out"
  },
  "Sign up": {
    "ja": "新規登録",
    "ko": "가입",
    "hi": "पंजीकरण करें",
    "th": "สมัครสมาชิก",
    "id": "Daftar",
    "vi": "Đăng ký",
    "fil": "Magparehistro"
  },
  "Create account": {
    "ja": "アカウントを作成",
    "ko": "계정 만들기",
    "hi": "खाता बनाएँ",
    "th": "สร้างบัญชี",
    "id": "Buat akun",
    "vi": "Tạo tài khoản",
    "fil": "Gumawa ng account"
  },
  "My account": {
    "ja": "マイアカウント",
    "ko": "내 계정",
    "hi": "मेरा खाता",
    "th": "บัญชีของฉัน",
    "id": "Akun saya",
    "vi": "Tài khoản của tôi",
    "fil": "Account ko"
  },
  "Working…": {
    "ja": "処理中…",
    "ko": "처리 중…",
    "hi": "प्रक्रिया जारी है…",
    "th": "กำลังดำเนินการ…",
    "id": "Memproses…",
    "vi": "Đang xử lý…",
    "fil": "Pinoproseso…"
  },
  "Signed in as ": {
    "ja": "ログイン中：",
    "ko": "로그인 계정: ",
    "hi": "इस खाते से लॉग इन हैं: ",
    "th": "เข้าสู่ระบบในชื่อ ",
    "id": "Masuk sebagai ",
    "vi": "Đã đăng nhập với ",
    "fil": "Naka-sign in bilang "
  },
  "Nickname (optional)": {
    "ja": "ニックネーム（任意）",
    "ko": "별명 (선택)",
    "hi": "उपनाम (वैकल्पिक)",
    "th": "ชื่อเล่น (ไม่บังคับ)",
    "id": "Nama panggilan (opsional)",
    "vi": "Biệt danh (tùy chọn)",
    "fil": "Palayaw (opsyonal)"
  },
  "Password (8+ characters)": {
    "ja": "パスワード（8文字以上）",
    "ko": "비밀번호 (8자 이상)",
    "hi": "पासवर्ड (कम से कम 8 अक्षर)",
    "th": "รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)",
    "id": "Kata sandi (8 karakter atau lebih)",
    "vi": "Mật khẩu (ít nhất 8 ký tự)",
    "fil": "Password (8 o higit pang karakter)"
  },
  "Confirm new password": {
    "ja": "新しいパスワードを再入力",
    "ko": "새 비밀번호 확인",
    "hi": "नए पासवर्ड की पुष्टि करें",
    "th": "ยืนยันรหัสผ่านใหม่",
    "id": "Konfirmasi kata sandi baru",
    "vi": "Xác nhận mật khẩu mới",
    "fil": "Kumpirmahin ang bagong password"
  },
  "Create account and sign in": {
    "ja": "アカウントを作成してログイン",
    "ko": "계정 만들고 로그인",
    "hi": "खाता बनाकर लॉग इन करें",
    "th": "สร้างบัญชีและเข้าสู่ระบบ",
    "id": "Buat akun dan masuk",
    "vi": "Tạo tài khoản và đăng nhập",
    "fil": "Gumawa ng account at mag-sign in"
  },
  "Set a new password": {
    "ja": "新しいパスワードを設定",
    "ko": "새 비밀번호 설정",
    "hi": "नया पासवर्ड बनाएँ",
    "th": "ตั้งรหัสผ่านใหม่",
    "id": "Tetapkan kata sandi baru",
    "vi": "Đặt mật khẩu mới",
    "fil": "Magtakda ng bagong password"
  },
  "Reset your password": {
    "ja": "パスワードの再設定",
    "ko": "비밀번호 재설정",
    "hi": "पासवर्ड रीसेट करें",
    "th": "รีเซ็ตรหัสผ่าน",
    "id": "Atur ulang kata sandi",
    "vi": "Đặt lại mật khẩu",
    "fil": "I-reset ang password"
  },
  "Update password": {
    "ja": "パスワードを更新",
    "ko": "비밀번호 변경",
    "hi": "पासवर्ड बदलें",
    "th": "อัปเดตรหัสผ่าน",
    "id": "Perbarui kata sandi",
    "vi": "Cập nhật mật khẩu",
    "fil": "Baguhin ang password"
  },
  "Send reset link": {
    "ja": "再設定リンクを送信",
    "ko": "재설정 링크 보내기",
    "hi": "रीसेट लिंक भेजें",
    "th": "ส่งลิงก์รีเซ็ต",
    "id": "Kirim tautan pengaturan ulang",
    "vi": "Gửi liên kết đặt lại",
    "fil": "Ipadala ang link sa pag-reset"
  },
  "Forgot password?": {
    "ja": "パスワードをお忘れですか？",
    "ko": "비밀번호를 잊으셨나요?",
    "hi": "पासवर्ड भूल गए?",
    "th": "ลืมรหัสผ่าน?",
    "id": "Lupa kata sandi?",
    "vi": "Quên mật khẩu?",
    "fil": "Nakalimutan ang password?"
  },
  "Back to sign in": {
    "ja": "ログインへ戻る",
    "ko": "로그인으로 돌아가기",
    "hi": "लॉग इन पर लौटें",
    "th": "กลับไปเข้าสู่ระบบ",
    "id": "Kembali ke masuk",
    "vi": "Về đăng nhập",
    "fil": "Bumalik sa pag-sign in"
  },
  "You can reset your password by email after signing up.": {
    "ja": "登録後はメールでパスワードを再設定できます。",
    "ko": "가입 후 이메일로 비밀번호를 재설정할 수 있습니다.",
    "hi": "पंजीकरण के बाद ईमेल से पासवर्ड रीसेट कर सकते हैं।",
    "th": "หลังสมัครสามารถรีเซ็ตรหัสผ่านทางอีเมลได้",
    "id": "Setelah mendaftar, Anda dapat mengatur ulang kata sandi melalui email.",
    "vi": "Sau khi đăng ký, bạn có thể đặt lại mật khẩu qua email.",
    "fil": "Pagkatapos magparehistro, maaari mong i-reset ang password gamit ang email."
  },
  "That email address looks invalid.": {
    "ja": "メールアドレスの形式を確認してください。",
    "ko": "이메일 주소 형식을 확인해 주세요.",
    "hi": "ईमेल पता सही नहीं लग रहा।",
    "th": "รูปแบบอีเมลไม่ถูกต้อง",
    "id": "Alamat email tampaknya tidak valid.",
    "vi": "Địa chỉ email không hợp lệ.",
    "fil": "Mukhang hindi wasto ang email address."
  },
  "The passwords do not match.": {
    "ja": "パスワードが一致しません。",
    "ko": "비밀번호가 일치하지 않습니다.",
    "hi": "पासवर्ड मेल नहीं खाते।",
    "th": "รหัสผ่านไม่ตรงกัน",
    "id": "Kata sandi tidak cocok.",
    "vi": "Mật khẩu không khớp.",
    "fil": "Hindi magkatugma ang mga password."
  },
  "Password must be 8 to 72 characters.": {
    "ja": "パスワードは8～72文字で入力してください。",
    "ko": "비밀번호는 8~72자여야 합니다.",
    "hi": "पासवर्ड 8 से 72 अक्षरों का होना चाहिए।",
    "th": "รหัสผ่านต้องมี 8 ถึง 72 ตัวอักษร",
    "id": "Kata sandi harus terdiri dari 8 hingga 72 karakter.",
    "vi": "Mật khẩu phải có từ 8 đến 72 ký tự.",
    "fil": "Dapat 8 hanggang 72 karakter ang password."
  },
  "This email is already registered. Please sign in.": {
    "ja": "このメールアドレスは登録済みです。ログインしてください。",
    "ko": "이미 등록된 이메일입니다. 로그인해 주세요.",
    "hi": "यह ईमेल पहले से पंजीकृत है। कृपया लॉग इन करें।",
    "th": "อีเมลนี้ลงทะเบียนแล้ว กรุณาเข้าสู่ระบบ",
    "id": "Email ini sudah terdaftar. Silakan masuk.",
    "vi": "Email này đã được đăng ký. Vui lòng đăng nhập.",
    "fil": "Nakarehistro na ang email na ito. Mag-sign in."
  },
  "Too many attempts. Please try again in an hour.": {
    "ja": "試行回数が多すぎます。1時間後にお試しください。",
    "ko": "시도 횟수가 너무 많습니다. 한 시간 후 다시 시도해 주세요.",
    "hi": "बहुत अधिक प्रयास हुए हैं। एक घंटे बाद फिर कोशिश करें।",
    "th": "ลองหลายครั้งเกินไป กรุณาลองใหม่ในหนึ่งชั่วโมง",
    "id": "Terlalu banyak percobaan. Coba lagi dalam satu jam.",
    "vi": "Quá nhiều lần thử. Vui lòng thử lại sau một giờ.",
    "fil": "Masyadong maraming pagsubok. Subukan muli pagkalipas ng isang oras."
  },
  "Incorrect email or password.": {
    "ja": "メールアドレスまたはパスワードが違います。",
    "ko": "이메일 또는 비밀번호가 올바르지 않습니다.",
    "hi": "ईमेल या पासवर्ड गलत है।",
    "th": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    "id": "Email atau kata sandi salah.",
    "vi": "Email hoặc mật khẩu không đúng.",
    "fil": "Mali ang email o password."
  },
  "Connection failed or timed out. Check your network and try again.": {
    "ja": "接続に失敗したか時間切れです。通信環境を確認して再試行してください。",
    "ko": "연결에 실패했거나 시간이 초과되었습니다. 네트워크를 확인하고 다시 시도해 주세요.",
    "hi": "कनेक्शन विफल हुआ या समय समाप्त हो गया। नेटवर्क जाँचकर फिर कोशिश करें।",
    "th": "เชื่อมต่อล้มเหลวหรือหมดเวลา ตรวจสอบเครือข่ายแล้วลองใหม่",
    "id": "Koneksi gagal atau habis waktu. Periksa jaringan dan coba lagi.",
    "vi": "Kết nối thất bại hoặc hết thời gian. Kiểm tra mạng rồi thử lại.",
    "fil": "Nabigo o nag-time out ang koneksyon. Suriin ang network at subukan muli."
  },
  "Something went wrong. Please try again.": {
    "ja": "問題が発生しました。もう一度お試しください。",
    "ko": "문제가 발생했습니다. 다시 시도해 주세요.",
    "hi": "कुछ गड़बड़ हुई। फिर कोशिश करें।",
    "th": "เกิดข้อผิดพลาด กรุณาลองใหม่",
    "id": "Terjadi kesalahan. Silakan coba lagi.",
    "vi": "Đã xảy ra lỗi. Vui lòng thử lại.",
    "fil": "May nagkaproblema. Subukan muli."
  },
  "This reset link is invalid or has expired. Request a new one.": {
    "ja": "再設定リンクが無効か期限切れです。再発行してください。",
    "ko": "재설정 링크가 유효하지 않거나 만료되었습니다. 새 링크를 요청해 주세요.",
    "hi": "यह रीसेट लिंक अमान्य है या समाप्त हो चुका है। नया लिंक माँगें।",
    "th": "ลิงก์รีเซ็ตไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่",
    "id": "Tautan pengaturan ulang tidak valid atau kedaluwarsa. Minta yang baru.",
    "vi": "Liên kết đặt lại không hợp lệ hoặc đã hết hạn. Hãy yêu cầu liên kết mới.",
    "fil": "Hindi wasto o paso na ang link sa pag-reset. Humiling ng bago."
  },
  "The reset link could not be verified. Request a new one.": {
    "ja": "再設定リンクを確認できませんでした。再発行してください。",
    "ko": "재설정 링크를 확인할 수 없습니다. 새 링크를 요청해 주세요.",
    "hi": "रीसेट लिंक सत्यापित नहीं हो सका। नया लिंक माँगें।",
    "th": "ไม่สามารถยืนยันลิงก์รีเซ็ตได้ กรุณาขอลิงก์ใหม่",
    "id": "Tautan pengaturan ulang tidak dapat diverifikasi. Minta yang baru.",
    "vi": "Không thể xác minh liên kết đặt lại. Hãy yêu cầu liên kết mới.",
    "fil": "Hindi ma-verify ang link sa pag-reset. Humiling ng bago."
  },
  "Your password has been updated, and you are signed in.": {
    "ja": "パスワードを更新し、ログインしました。",
    "ko": "비밀번호가 변경되었으며 로그인되었습니다.",
    "hi": "पासवर्ड बदल गया है और आप लॉग इन हैं।",
    "th": "อัปเดตรหัสผ่านและเข้าสู่ระบบแล้ว",
    "id": "Kata sandi telah diperbarui dan Anda sudah masuk.",
    "vi": "Mật khẩu đã được cập nhật và bạn đã đăng nhập.",
    "fil": "Nabago na ang password at naka-sign in ka na."
  },
  "Charting and previews need no sign-in; deeper content is purchased separately. Cross-device sync is not available yet. Signing up or in does not back up or restore existing reports or purchases. Keep your original browser data. No confirmation email is needed.": {
    "ja": "命盤作成と試読はログイン不要です。詳細は別途購入となります。端末間の同期は未対応です。登録・ログインしても既存のレポートや購入権はバックアップ・復元されません。元のブラウザデータを保持してください。確認メールは不要です。",
    "ko": "명식과 미리보기는 로그인 없이 이용할 수 있으며 상세 내용은 별도 구매입니다. 기기 간 동기화는 아직 지원되지 않습니다. 가입하거나 로그인해도 기존 보고서나 구매 권한이 백업되거나 복원되지 않습니다. 원래 브라우저 데이터를 보관하세요. 확인 이메일은 필요 없습니다.",
    "hi": "जन्मकुंडली और झलक के लिए लॉग इन ज़रूरी नहीं; विस्तृत सामग्री अलग से खरीदी जाती है। उपकरणों के बीच समन्वयन अभी उपलब्ध नहीं है। पंजीकरण या लॉग इन करने से पुरानी रिपोर्टों या खरीद की बैकअप प्रति नहीं बनती और वे बहाल नहीं होतीं। मूल ब्राउज़र का डेटा सुरक्षित रखें। पुष्टि ईमेल की आवश्यकता नहीं है।",
    "th": "สร้างดวงและอ่านตัวอย่างได้โดยไม่เข้าสู่ระบบ เนื้อหาเชิงลึกซื้อแยก ยังไม่รองรับการซิงก์ข้ามอุปกรณ์ การสมัครหรือเข้าสู่ระบบไม่สำรองหรือกู้คืนรายงานและสิทธิ์ซื้อเดิม โปรดเก็บข้อมูลเบราว์เซอร์เดิมไว้ ไม่ต้องยืนยันอีเมล",
    "id": "Bagan dan pratinjau tidak memerlukan masuk; konten mendalam dibeli terpisah. Sinkronisasi antarperangkat belum tersedia. Mendaftar atau masuk tidak mencadangkan atau memulihkan laporan maupun pembelian lama. Simpan data peramban asli Anda. Tidak perlu email konfirmasi.",
    "vi": "Lập lá số và đọc thử không cần đăng nhập; nội dung chuyên sâu được mua riêng. Chưa hỗ trợ đồng bộ giữa các thiết bị. Đăng ký hoặc đăng nhập không sao lưu hay khôi phục báo cáo và quyền mua cũ. Hãy giữ dữ liệu trình duyệt ban đầu. Không cần email xác nhận.",
    "fil": "Hindi kailangan ng pag-sign in para sa tsart at paunang pagbasa; hiwalay na binibili ang mas malalim na nilalaman. Wala pang pag-sync sa iba't ibang device. Hindi bina-backup o ibinabalik ng pagpaparehistro o pag-sign in ang mga dating ulat o pagbili. Panatilihin ang datos ng orihinal mong browser. Hindi kailangan ng email ng kumpirmasyon."
  },
  "If an account exists for that email, a reset link has been sent. Check your inbox and spam folder.": {
    "ja": "そのメールアドレスのアカウントが存在する場合、再設定リンクを送信しました。受信箱と迷惑メールを確認してください。",
    "ko": "해당 이메일로 된 계정이 있다면 재설정 링크를 보냈습니다. 받은편지함과 스팸함을 확인하세요.",
    "hi": "यदि उस ईमेल से खाता है, तो रीसेट लिंक भेज दिया गया है। इनबॉक्स और स्पैम फ़ोल्डर देखें।",
    "th": "หากมีบัญชีสำหรับอีเมลนี้ ระบบได้ส่งลิงก์รีเซ็ตแล้ว ตรวจสอบกล่องจดหมายและโฟลเดอร์สแปม",
    "id": "Jika akun dengan email tersebut ada, tautan pengaturan ulang telah dikirim. Periksa kotak masuk dan folder spam.",
    "vi": "Nếu có tài khoản dùng email đó, liên kết đặt lại đã được gửi. Kiểm tra hộp thư đến và thư rác.",
    "fil": "Kung may account para sa email na iyon, naipadala na ang link sa pag-reset. Tingnan ang inbox at spam folder."
  },
  "Saved on this device only": {
    "ja": "この端末のみに保存",
    "ko": "이 기기에만 저장됨",
    "hi": "केवल इस उपकरण पर सहेजा गया",
    "th": "บันทึกเฉพาะอุปกรณ์นี้",
    "id": "Disimpan hanya di perangkat ini",
    "vi": "Chỉ lưu trên thiết bị này",
    "fil": "Naka-save sa device na ito lamang"
  },
  "No reports yet": {
    "ja": "まだレポートがありません",
    "ko": "아직 보고서가 없습니다",
    "hi": "अभी कोई रिपोर्ट नहीं",
    "th": "ยังไม่มีรายงาน",
    "id": "Belum ada laporan",
    "vi": "Chưa có báo cáo",
    "fil": "Wala pang ulat"
  },
  "Created": {
    "ja": "作成日時",
    "ko": "생성 일시",
    "hi": "बनाया गया",
    "th": "เวลาสร้าง",
    "id": "Dibuat",
    "vi": "Ngày tạo",
    "fil": "Ginawa noong"
  },
  "Open full result": {
    "ja": "結果をすべて開く",
    "ko": "전체 결과 열기",
    "hi": "पूरा परिणाम खोलें",
    "th": "เปิดผลทั้งหมด",
    "id": "Buka hasil lengkap",
    "vi": "Mở toàn bộ kết quả",
    "fil": "Buksan ang buong resulta"
  },
  "Collapse result": {
    "ja": "結果を折りたたむ",
    "ko": "결과 접기",
    "hi": "परिणाम समेटें",
    "th": "ย่อผลลัพธ์",
    "id": "Ciutkan hasil",
    "vi": "Thu gọn kết quả",
    "fil": "Itiklop ang resulta"
  },
  "Run again": {
    "ja": "もう一度実行",
    "ko": "다시 실행",
    "hi": "फिर चलाएँ",
    "th": "ทำอีกครั้ง",
    "id": "Jalankan lagi",
    "vi": "Thực hiện lại",
    "fil": "Gawin muli"
  },
  "Delete": {
    "ja": "削除",
    "ko": "삭제",
    "hi": "हटाएँ",
    "th": "ลบ",
    "id": "Hapus",
    "vi": "Xóa",
    "fil": "Tanggalin"
  },
  "Clear local history": {
    "ja": "端末の履歴を消去",
    "ko": "기기 기록 지우기",
    "hi": "स्थानीय इतिहास मिटाएँ",
    "th": "ล้างประวัติในอุปกรณ์",
    "id": "Hapus riwayat lokal",
    "vi": "Xóa lịch sử trên thiết bị",
    "fil": "Burahin ang lokal na kasaysayan"
  },
  "Delete this history entry?": {
    "ja": "この履歴を削除しますか？",
    "ko": "이 기록을 삭제할까요?",
    "hi": "यह इतिहास प्रविष्टि हटाएँ?",
    "th": "ลบรายการประวัตินี้หรือไม่?",
    "id": "Hapus entri riwayat ini?",
    "vi": "Xóa mục lịch sử này?",
    "fil": "Tatanggalin ang talang ito?"
  },
  "Clear all local history from this device? This cannot be undone.": {
    "ja": "この端末の履歴をすべて消去しますか？元に戻せません。",
    "ko": "이 기기의 모든 기록을 지울까요? 되돌릴 수 없습니다.",
    "hi": "इस उपकरण का सारा स्थानीय इतिहास मिटाएँ? इसे वापस नहीं लाया जा सकता।",
    "th": "ล้างประวัติทั้งหมดในอุปกรณ์นี้หรือไม่? ไม่สามารถยกเลิกได้",
    "id": "Hapus semua riwayat lokal dari perangkat ini? Tindakan ini tidak dapat dibatalkan.",
    "vi": "Xóa toàn bộ lịch sử trên thiết bị này? Không thể hoàn tác.",
    "fil": "Buburahin ang lahat ng lokal na kasaysayan sa device na ito? Hindi ito maibabalik."
  },
  "Create my first chart": {
    "ja": "最初の命盤を作成",
    "ko": "첫 명식 만들기",
    "hi": "मेरी पहली जन्मकुंडली बनाएँ",
    "th": "สร้างดวงแรกของฉัน",
    "id": "Buat bagan pertama saya",
    "vi": "Lập lá số đầu tiên của tôi",
    "fil": "Gumawa ng una kong tsart"
  },
  "Saved birth details": {
    "ja": "保存した出生情報",
    "ko": "저장된 출생 정보",
    "hi": "सहेजा गया जन्म विवरण",
    "th": "ข้อมูลเกิดที่บันทึกไว้",
    "id": "Data kelahiran tersimpan",
    "vi": "Thông tin sinh đã lưu",
    "fil": "Naka-save na detalye ng kapanganakan"
  },
  "Securely backed up": {
    "ja": "安全にバックアップ済み",
    "ko": "안전하게 백업됨",
    "hi": "सुरक्षित बैकअप बना है",
    "th": "สำรองข้อมูลอย่างปลอดภัยแล้ว",
    "id": "Dicadangkan dengan aman",
    "vi": "Đã sao lưu an toàn",
    "fil": "Ligtas na na-backup"
  },
  "Read report": {
    "ja": "レポートを読む",
    "ko": "보고서 읽기",
    "hi": "रिपोर्ट पढ़ें",
    "th": "อ่านรายงาน",
    "id": "Baca laporan",
    "vi": "Đọc báo cáo",
    "fil": "Basahin ang ulat"
  },
  "Back to Zhaowu": {
    "ja": "昭梧へ戻る",
    "ko": "昭梧로 돌아가기",
    "hi": "ZHAOWU पर लौटें",
    "th": "กลับสู่昭梧",
    "id": "Kembali ke Zhaowu",
    "vi": "Về Zhaowu",
    "fil": "Bumalik sa Zhaowu"
  },
  "ZHAOWU · MY HISTORY": {
    "ja": "昭梧 · マイ履歴",
    "ko": "昭梧 · 내 기록",
    "hi": "ZHAOWU · मेरा इतिहास",
    "th": "昭梧 · ประวัติของฉัน",
    "id": "ZHAOWU · RIWAYAT SAYA",
    "vi": "ZHAOWU · LỊCH SỬ CỦA TÔI",
    "fil": "ZHAOWU · AKING KASAYSAYAN"
  },
  "Complete chart record": {
    "ja": "命盤の完全な記録",
    "ko": "전체 명식 기록",
    "hi": "पूर्ण जन्मकुंडली रिकॉर्ड",
    "th": "บันทึกดวงฉบับเต็ม",
    "id": "Catatan bagan lengkap",
    "vi": "Hồ sơ lá số đầy đủ",
    "fil": "Kumpletong tala ng tsart"
  },
  "2012 Reality Patch Archive": {
    "ja": "2012年・現実パッチ資料室",
    "ko": "2012 현실 패치 기록실",
    "hi": "2012 वास्तविकता पैच संग्रह",
    "th": "คลังแฟ้มแพตช์ความจริงปี 2012",
    "id": "Arsip Tambalan Realitas 2012",
    "vi": "Hồ sơ bản vá thực tại 2012",
    "fil": "Arkibo ng Pagbabago sa Realidad noong 2012"
  },
  "BaZi and Zi Wei basics, reading methods and source checks.": {
    "ja": "八字と紫微斗数の基礎・読み方・出典確認。",
    "ko": "사주와 자미두수의 기초, 해석법과 출처 확인.",
    "hi": "बाज़ी और ज़ी वेई की बुनियाद, पढ़ने की विधियाँ और स्रोतों की जाँच।",
    "th": "พื้นฐานปาจื้อและจื่อเวย วิธีอ่านและตรวจสอบแหล่งข้อมูล",
    "id": "Dasar BaZi dan Zi Wei, metode pembacaan, dan pemeriksaan sumber.",
    "vi": "Kiến thức cơ bản về Bát Tự và Tử Vi, cách đọc và kiểm tra nguồn.",
    "fil": "Mga batayan ng BaZi at Zi Wei, paraan ng pagbasa, at pagsusuri ng sanggunian."
  },
  "Beyond Nine Heavens · Four lamps and dependent origination": {
    "ja": "九天の彼方 · 四つの灯と縁起",
    "ko": "구천 너머 · 네 등불과 연기",
    "hi": "नौ आकाशों के पार · चार दीप और प्रतीत्यसमुत्पाद",
    "th": "เหนือเก้าชั้นฟ้า · ประทีปสี่ดวงและปฏิจจสมุปบาท",
    "id": "Melampaui Sembilan Langit · Empat pelita dan kemunculan bergantungan",
    "vi": "Ngoài chín tầng trời · Bốn ngọn đèn và duyên khởi",
    "fil": "Lampas sa Siyam na Langit · Apat na ilawan at magkakaugnay na paglitaw"
  },
  "Choose what you need: Articles for essays and short reflections; Knowledge for methods, terms and reading rules.": {
    "ja": "記事では随筆や短い考察を、知識では方法・用語・読み方を探せます。",
    "ko": "글에서는 에세이와 짧은 성찰을, 지식에서는 방법·용어·해석 원칙을 찾아보세요.",
    "hi": "अपनी ज़रूरत चुनें: निबंध और छोटे चिंतन के लिए लेख; विधियों, शब्दों और व्याख्या के नियमों के लिए ज्ञान।",
    "th": "เลือกตามต้องการ: บทความสำหรับข้อเขียนและข้อคิดสั้น ๆ ส่วนความรู้สำหรับวิธีการ คำศัพท์ และหลักการอ่าน",
    "id": "Pilih sesuai kebutuhan: Artikel untuk esai dan refleksi singkat; Pengetahuan untuk metode, istilah, dan aturan pembacaan.",
    "vi": "Chọn nội dung bạn cần: Bài viết dành cho tiểu luận và suy ngẫm ngắn; Kiến thức dành cho phương pháp, thuật ngữ và quy tắc luận giải.",
    "fil": "Piliin ang kailangan: Mga Artikulo para sa sanaysay at maikling pagninilay; Kaalaman para sa pamamaraan, mga termino, at tuntunin sa pagbasa."
  },
  "Create complete chart": {
    "ja": "命盤を作成",
    "ko": "전체 명식 만들기",
    "hi": "पूरी जन्मकुंडली बनाएँ",
    "th": "สร้างดวงฉบับเต็ม",
    "id": "Buat bagan lengkap",
    "vi": "Lập lá số đầy đủ",
    "fil": "Gumawa ng kumpletong tsart"
  },
  "Essays, research notes and short reflections": {
    "ja": "随筆・研究ノート・短い考察",
    "ko": "에세이, 연구 기록과 짧은 성찰",
    "hi": "निबंध, शोध नोट्स और छोटे चिंतन",
    "th": "บทความ บันทึกวิจัย และข้อคิดสั้น ๆ",
    "id": "Esai, catatan penelitian, dan refleksi singkat",
    "vi": "Tiểu luận, ghi chép nghiên cứu và suy ngẫm ngắn",
    "fil": "Mga sanaysay, tala ng pananaliksik, at maikling pagninilay"
  },
  "Five Elements, colours, tones and qi": {
    "ja": "五行・五色・五音と気",
    "ko": "오행, 색, 음과 기",
    "hi": "पंचतत्व, रंग, स्वर और ची",
    "th": "ห้าธาตุ สี เสียง และชี่",
    "id": "Lima Unsur, warna, nada, dan qi",
    "vi": "Ngũ hành, màu sắc, âm và khí",
    "fil": "Limang elemento, kulay, tono, at qi"
  },
  "HOW IT IS CALCULATED": {
    "ja": "計算のしくみ",
    "ko": "계산 방법",
    "hi": "गणना कैसे होती है",
    "th": "วิธีคำนวณ",
    "id": "CARA PERHITUNGAN",
    "vi": "CÁCH TÍNH",
    "fil": "PAANO KINAKALKULA"
  },
  "How true solar time is calculated: longitude, equation of time and DST": {
    "ja": "真太陽時の計算：経度差・均時差・夏時間",
    "ko": "진태양시 계산: 경도, 균시차와 서머타임",
    "hi": "वास्तविक सौर समय की गणना: देशांतर, समय-समीकरण और ग्रीष्मकालीन समय",
    "th": "วิธีคำนวณเวลาสุริยะจริง: ลองจิจูด สมการเวลา และเวลาออมแสง",
    "id": "Cara menghitung waktu matahari sejati: bujur, persamaan waktu, dan waktu musim panas",
    "vi": "Cách tính giờ mặt trời thật: kinh độ, phương trình thời gian và giờ mùa hè",
    "fil": "Pagkalkula ng tunay na oras ng araw: longhitud, equation of time, at daylight saving time"
  },
  "Interactive timeline, self-reflection and glitch files. Story and fact stay distinct.": {
    "ja": "対話型年表・自己考察・異常現象ファイル。物語と事実を区別します。",
    "ko": "대화형 연표, 자기 성찰과 오류 기록. 이야기와 사실을 구분합니다.",
    "hi": "संवादी समयरेखा, आत्मचिंतन और गड़बड़ी की फ़ाइलें। कहानी और तथ्य अलग रखे जाते हैं।",
    "th": "เส้นเวลาแบบโต้ตอบ การทบทวนตนเอง และแฟ้มความผิดปกติ แยกเรื่องเล่ากับข้อเท็จจริง",
    "id": "Linimasa interaktif, refleksi diri, dan berkas gangguan. Cerita dan fakta tetap terpisah.",
    "vi": "Dòng thời gian tương tác, tự suy ngẫm và hồ sơ bất thường. Phân biệt câu chuyện với sự thật.",
    "fil": "Interaktibong tala ng panahon, pagninilay, at mga tala ng anomalya. Hiwalay ang kuwento sa katotohanan."
  },
  "Knowledge articles": {
    "ja": "知識の記事",
    "ko": "지식 글",
    "hi": "ज्ञान संबंधी लेख",
    "th": "บทความความรู้",
    "id": "Artikel pengetahuan",
    "vi": "Bài viết kiến thức",
    "fil": "Mga artikulong pangkaalaman"
  },
  "NOTES ON LIFE · EDITORIAL": {
    "ja": "暮らしの手帖 · 記事",
    "ko": "삶의 기록 · 글",
    "hi": "जीवन पर विचार · लेख",
    "th": "บันทึกชีวิต · บทความ",
    "id": "CATATAN KEHIDUPAN · EDITORIAL",
    "vi": "GHI CHÉP CUỘC SỐNG · BÀI VIẾT",
    "fil": "MGA TALA SA BUHAY · MGA ARTIKULO"
  },
  "NOTES ON LIFE · SPECIAL FEATURE": {
    "ja": "暮らしの手帖 · 特集",
    "ko": "삶의 기록 · 특집",
    "hi": "जीवन पर विचार · विशेषांक",
    "th": "บันทึกชีวิต · เรื่องพิเศษ",
    "id": "CATATAN KEHIDUPAN · FITUR KHUSUS",
    "vi": "GHI CHÉP CUỘC SỐNG · CHUYÊN ĐỀ",
    "fil": "MGA TALA SA BUHAY · NATATANGING PAKSA"
  },
  "Southern Hemisphere BaZi: solar terms, true solar time and seasonal calibration": {
    "ja": "南半球の八字：節気・真太陽時・季節の補正",
    "ko": "남반구 사주: 절기, 진태양시와 계절 보정",
    "hi": "दक्षिणी गोलार्ध में बाज़ी: सौर ऋतुबिंदु, वास्तविक सौर समय और मौसमी समायोजन",
    "th": "ปาจื้อในซีกโลกใต้: สารท เวลาสุริยะจริง และการปรับฤดูกาล",
    "id": "BaZi Belahan Selatan: penanda musim, waktu matahari sejati, dan kalibrasi musim",
    "vi": "Bát Tự ở Nam bán cầu: tiết khí, giờ mặt trời thật và hiệu chỉnh mùa",
    "fil": "BaZi sa Timog Hemispero: mga solar term, tunay na oras ng araw, at pagsasaayos sa panahon"
  },
  "The boundary of the divination arts": {
    "ja": "術数で扱える範囲",
    "ko": "술수의 해석 범위",
    "hi": "भविष्यकथन कलाओं की सीमाएँ",
    "th": "ขอบเขตของศาสตร์พยากรณ์",
    "id": "Batas seni ramalan",
    "vi": "Ranh giới của thuật số",
    "fil": "Mga hangganan ng mga sining ng panghuhula"
  },
  "The formula, Sydney / Taipei / Beijing examples, what it changes in a chart, and its error limits.": {
    "ja": "計算式、シドニー・台北・北京の例、命盤への影響と誤差の限界。",
    "ko": "공식, 시드니·타이베이·베이징 사례, 명식에 미치는 영향과 오차 한계.",
    "hi": "सूत्र, सिडनी / ताइपे / बीजिंग के उदाहरण, जन्मकुंडली पर प्रभाव और त्रुटि की सीमाएँ।",
    "th": "สูตร ตัวอย่างซิดนีย์ / ไทเป / ปักกิ่ง ผลต่อดวง และขีดจำกัดความคลาดเคลื่อน",
    "id": "Rumus, contoh Sydney / Taipei / Beijing, perubahan pada bagan, dan batas kesalahannya.",
    "vi": "Công thức, ví dụ Sydney / Đài Bắc / Bắc Kinh, tác động lên lá số và giới hạn sai số.",
    "fil": "Ang pormula, mga halimbawa sa Sydney / Taipei / Beijing, epekto sa tsart, at limitasyon ng kamalian."
  },
  "This list contains editorial content only. Long-form pieces are labelled Article; shorter reflections are labelled Short note. Teaching cards do not enter this list.": {
    "ja": "この一覧は記事のみです。長文は「記事」、短い考察は「短札」と表示します。学習カードは含みません。",
    "ko": "이 목록에는 글만 있습니다. 긴 글은 기사, 짧은 성찰은 짧은 기록으로 표시합니다. 학습 카드는 포함되지 않습니다.",
    "hi": "इस सूची में केवल संपादकीय सामग्री है। लंबे लेखों पर लेख और छोटे चिंतन पर संक्षिप्त टिप्पणी का लेबल है। अध्ययन कार्ड इस सूची में नहीं हैं।",
    "th": "รายการนี้มีเฉพาะบทความ งานยาวระบุว่าบทความ ข้อคิดสั้นระบุว่าบันทึกสั้น ไม่รวมบัตรความรู้",
    "id": "Daftar ini hanya berisi tulisan editorial. Tulisan panjang ditandai Artikel; refleksi singkat ditandai Catatan singkat. Kartu belajar tidak termasuk.",
    "vi": "Danh sách này chỉ gồm bài viết biên tập. Bài dài được ghi là Bài viết; suy ngẫm ngắn là Ghi chú ngắn. Không bao gồm thẻ học tập.",
    "fil": "Mga artikulo lamang ang nasa listahang ito. Ang mahahabang akda ay Artikulo; ang maiikling pagninilay ay Maikling tala. Hindi kasama ang mga kard sa pag-aaral."
  },
  "ZHAOWU · BAZI KNOWLEDGE": {
    "ja": "昭梧 · 八字の知識",
    "ko": "昭梧 · 사주 지식",
    "hi": "ZHAOWU · बाज़ी ज्ञान",
    "th": "昭梧 · ความรู้ปาจื้อ",
    "id": "ZHAOWU · PENGETAHUAN BAZI",
    "vi": "ZHAOWU · KIẾN THỨC BÁT TỰ",
    "fil": "ZHAOWU · KAALAMAN SA BAZI"
  },
  "Zhaowu system capability map": {
    "ja": "昭梧の機能マップ",
    "ko": "昭梧 시스템 기능 지도",
    "hi": "ZHAOWU प्रणाली क्षमता मानचित्र",
    "th": "แผนที่ความสามารถระบบ昭梧",
    "id": "Peta kemampuan sistem Zhaowu",
    "vi": "Bản đồ khả năng hệ thống Zhaowu",
    "fil": "Mapa ng mga kakayahan ng Zhaowu"
  },
  "Charts and question reports are encrypted in this browser. Return using the same device and browser; clearing site data or ending private browsing may erase them.": {
    "ja": "命盤と質問レポートはこのブラウザに暗号化して保存されます。同じ端末・ブラウザで開いてください。サイトデータの消去やプライベート閲覧の終了で失われる場合があります。",
    "ko": "명식과 질문 보고서는 이 브라우저에 암호화되어 저장됩니다. 같은 기기와 브라우저로 다시 접속하세요. 사이트 데이터 삭제나 비공개 탐색 종료 시 기록이 사라질 수 있습니다.",
    "hi": "जन्मकुंडलियाँ और प्रश्न रिपोर्टें इस ब्राउज़र में एन्क्रिप्ट करके रखी जाती हैं। उसी उपकरण और ब्राउज़र से लौटें; साइट डेटा मिटाने या निजी ब्राउज़िंग बंद करने से वे मिट सकती हैं।",
    "th": "ดวงและรายงานคำถามเข้ารหัสไว้ในเบราว์เซอร์นี้ โปรดกลับมาโดยใช้อุปกรณ์และเบราว์เซอร์เดิม การล้างข้อมูลเว็บไซต์หรือจบโหมดส่วนตัวอาจทำให้ข้อมูลหาย",
    "id": "Bagan dan laporan pertanyaan dienkripsi di peramban ini. Kembali dengan perangkat dan peramban yang sama; menghapus data situs atau menutup penjelajahan pribadi dapat menghapusnya.",
    "vi": "Lá số và báo cáo câu hỏi được mã hóa trong trình duyệt này. Hãy dùng lại cùng thiết bị và trình duyệt; xóa dữ liệu trang hoặc kết thúc duyệt riêng tư có thể làm mất chúng.",
    "fil": "Naka-encrypt sa browser na ito ang mga tsart at ulat sa tanong. Bumalik gamit ang parehong device at browser; maaaring mabura ang mga ito kapag nilinis ang datos ng site o tinapos ang pribadong pagba-browse."
  },
  "Continue to your chart or ask a new question using these details.": {
    "ja": "この出生情報で命盤を開くか、新しい質問ができます。",
    "ko": "이 출생 정보로 명식을 보거나 새 질문을 할 수 있습니다.",
    "hi": "इन विवरणों से अपनी जन्मकुंडली देखें या नया प्रश्न पूछें।",
    "th": "ดูดวงต่อหรือถามคำถามใหม่โดยใช้ข้อมูลนี้",
    "id": "Lanjutkan ke bagan atau ajukan pertanyaan baru dengan data ini.",
    "vi": "Xem tiếp lá số hoặc đặt câu hỏi mới bằng thông tin này.",
    "fil": "Tingnan ang tsart o magtanong muli gamit ang mga detalyeng ito."
  },
  "Create your first chart and its report will be saved on this device.": {
    "ja": "最初の命盤を作成すると、この端末にレポートが保存されます。",
    "ko": "첫 명식을 만들면 보고서가 이 기기에 저장됩니다.",
    "hi": "पहली जन्मकुंडली बनाएँ; उसकी रिपोर्ट इस उपकरण पर सहेजी जाएगी।",
    "th": "สร้างดวงแรกแล้วรายงานจะบันทึกไว้ในอุปกรณ์นี้",
    "id": "Buat bagan pertama dan laporannya akan disimpan di perangkat ini.",
    "vi": "Lập lá số đầu tiên, báo cáo sẽ được lưu trên thiết bị này.",
    "fil": "Gumawa ng unang tsart at mase-save ang ulat sa device na ito."
  },
  "Created or paid for a report before?": {
    "ja": "以前作成・購入したレポートが見つからない場合",
    "ko": "이전에 만들거나 구매한 보고서가 있나요?",
    "hi": "पहले रिपोर्ट बनाई या खरीदी थी?",
    "th": "เคยสร้างหรือซื้อรายงานมาก่อนหรือไม่?",
    "id": "Pernah membuat atau membeli laporan sebelumnya?",
    "vi": "Đã từng tạo hoặc mua báo cáo trước đây?",
    "fil": "Dati ka na bang gumawa o bumili ng ulat?"
  },
  "Open chart / ask a question": {
    "ja": "命盤を開く／質問する",
    "ko": "명식 열기 / 질문하기",
    "hi": "जन्मकुंडली खोलें / प्रश्न पूछें",
    "th": "เปิดดวง / ถามคำถาม",
    "id": "Buka bagan / ajukan pertanyaan",
    "vi": "Mở lá số / đặt câu hỏi",
    "fil": "Buksan ang tsart / magtanong"
  },
  "Return to the device and browser used for purchase, including an in-app browser if applicable. Do not pay again. Signing in does not currently sync or restore reports. Keep your receipt and original report link for purchase verification.": {
    "ja": "購入時の端末とブラウザ（アプリ内ブラウザを含む）で開いてください。再購入しないでください。現在、ログインでレポートの同期や復元はできません。購入確認のため領収書と元のレポートリンクを保管してください。",
    "ko": "구매 당시의 기기와 브라우저를 사용하세요. 앱 내 브라우저를 썼다면 그것으로 돌아가세요. 다시 결제하지 마세요. 현재 로그인으로 보고서가 동기화되거나 복원되지 않습니다. 구매 확인을 위해 영수증과 원래 보고서 링크를 보관하세요.",
    "hi": "खरीद के समय इस्तेमाल किए गए उपकरण और ब्राउज़र पर लौटें, ऐप के भीतर का ब्राउज़र भी शामिल है। दोबारा भुगतान न करें। लॉग इन से अभी रिपोर्टें समन्वयित या बहाल नहीं होतीं। खरीद सत्यापन के लिए रसीद और मूल रिपोर्ट लिंक रखें।",
    "th": "กลับไปใช้อุปกรณ์และเบราว์เซอร์ที่ใช้ซื้อ รวมถึงเบราว์เซอร์ในแอปถ้ามี อย่าชำระเงินซ้ำ ขณะนี้การเข้าสู่ระบบไม่ซิงก์หรือกู้คืนรายงาน เก็บใบเสร็จและลิงก์รายงานเดิมไว้ตรวจสอบสิทธิ์ซื้อ",
    "id": "Kembali ke perangkat dan peramban saat membeli, termasuk peramban dalam aplikasi jika digunakan. Jangan membayar lagi. Masuk saat ini tidak menyinkronkan atau memulihkan laporan. Simpan kuitansi dan tautan laporan asli untuk verifikasi pembelian.",
    "vi": "Quay lại thiết bị và trình duyệt đã dùng khi mua, kể cả trình duyệt trong ứng dụng nếu có. Đừng thanh toán lại. Đăng nhập hiện không đồng bộ hay khôi phục báo cáo. Giữ biên lai và liên kết báo cáo gốc để xác minh quyền mua.",
    "fil": "Bumalik sa device at browser na ginamit sa pagbili, kabilang ang browser sa loob ng app kung iyon ang ginamit. Huwag magbayad muli. Hindi pa nagsi-sync o nagbabalik ng ulat ang pag-sign in. Itago ang resibo at orihinal na link ng ulat para sa pagpapatunay ng pagbili."
  },
  "Aligned patterns": {
    "ja": "似た傾向",
    "ko": "비슷한 성향",
    "hi": "मिलते-जुलते ढाँचे",
    "th": "แนวโน้มสอดคล้องกัน",
    "id": "Pola selaras",
    "vi": "Khuynh hướng tương đồng",
    "fil": "Magkatugmang mga padron"
  },
  "Complementary patterns": {
    "ja": "補い合う傾向",
    "ko": "상호 보완 성향",
    "hi": "पूरक ढाँचे",
    "th": "แนวโน้มเกื้อหนุนกัน",
    "id": "Pola saling melengkapi",
    "vi": "Khuynh hướng bổ trợ",
    "fil": "Magkatuwang na mga padron"
  },
  "Different patterns": {
    "ja": "異なる傾向",
    "ko": "서로 다른 성향",
    "hi": "अलग-अलग ढाँचे",
    "th": "แนวโน้มต่างกัน",
    "id": "Pola berbeda",
    "vi": "Khuynh hướng khác biệt",
    "fil": "Magkaibang mga padron"
  },
  "Five-Element Function Test · current 1–3 months": {
    "ja": "五行の機能テスト · 最近1～3か月",
    "ko": "오행 기능 테스트 · 최근 1~3개월",
    "hi": "पंचतत्व कार्य परीक्षण · पिछले 1–3 महीने",
    "th": "แบบทดสอบหน้าที่ห้าธาตุ · ช่วง 1–3 เดือนที่ผ่านมา",
    "id": "Tes Fungsi Lima Unsur · 1–3 bulan terakhir",
    "vi": "Trắc nghiệm chức năng ngũ hành · 1–3 tháng gần đây",
    "fil": "Pagsusulit ng Limang Elemento · nakaraang 1–3 buwan"
  },
  "More tests": {
    "ja": "その他のテスト",
    "ko": "다른 테스트",
    "hi": "और परीक्षण",
    "th": "แบบทดสอบเพิ่มเติม",
    "id": "Tes lainnya",
    "vi": "Trắc nghiệm khác",
    "fil": "Iba pang pagsusulit"
  },
  "Short self-tests about how you are behaving and coping right now. They are not substitutes for a birth-chart reading.": {
    "ja": "今の行動や対処のしかたを振り返る短いテストです。命盤の鑑定に代わるものではありません。",
    "ko": "현재의 행동과 대처 방식을 돌아보는 짧은 자기 테스트입니다. 명식 해석을 대신하지 않습니다.",
    "hi": "अभी के व्यवहार और सामना करने के तरीकों पर छोटे स्व-परीक्षण। ये जन्मकुंडली की व्याख्या का विकल्प नहीं हैं।",
    "th": "แบบทดสอบสั้น ๆ เกี่ยวกับพฤติกรรมและการรับมือของคุณตอนนี้ ไม่ใช้แทนการอ่านดวง",
    "id": "Tes singkat tentang perilaku dan cara Anda menghadapi keadaan saat ini. Bukan pengganti pembacaan bagan lahir.",
    "vi": "Trắc nghiệm ngắn về cách bạn hành động và ứng phó hiện tại. Không thay thế việc luận lá số.",
    "fil": "Maiikling pagsusuri tungkol sa pagkilos at pagharap mo sa mga bagay ngayon. Hindi kapalit ng pagbasa ng tsart ng kapanganakan."
  },
  "The personality strategy you use most now and your instinctive response under pressure.": {
    "ja": "今よく使う行動方略と、プレッシャー下での本能的な反応。",
    "ko": "지금 가장 자주 쓰는 성격 전략과 압박 속 본능적 반응.",
    "hi": "अभी सबसे अधिक अपनाई जाने वाली व्यवहार शैली और दबाव में सहज प्रतिक्रिया।",
    "th": "แนวทางบุคลิกที่ใช้บ่อยที่สุดตอนนี้ และการตอบสนองตามสัญชาตญาณเมื่อกดดัน",
    "id": "Strategi kepribadian yang paling sering digunakan sekarang dan respons naluriah saat tertekan.",
    "vi": "Chiến lược tính cách thường dùng nhất hiện tại và phản ứng bản năng khi chịu áp lực.",
    "fil": "Paraan ng pagkilos na pinakamadalas mong gamitin ngayon at likas na tugon kapag may presyon."
  },
  "Learned behaviour, decision style and—when a chart exists—how that compares with your guardian-beast pattern.": {
    "ja": "身につけた行動や判断のしかたを振り返り、命盤があれば守護獣の傾向と比べます。",
    "ko": "학습된 행동과 의사결정 방식을 살펴보고, 명식이 있으면 수호 동물 성향과 비교합니다.",
    "hi": "सीखा हुआ व्यवहार, निर्णय शैली और जन्मकुंडली होने पर संरक्षक प्राणी के ढाँचे से तुलना।",
    "th": "พฤติกรรมที่เรียนรู้ รูปแบบตัดสินใจ และเมื่อมีดวงแล้วจึงเทียบกับแนวโน้มสัตว์ผู้พิทักษ์",
    "id": "Perilaku yang dipelajari, gaya mengambil keputusan, dan perbandingannya dengan pola hewan pelindung jika bagan tersedia.",
    "vi": "Hành vi học được, cách ra quyết định và so sánh với khuynh hướng linh thú khi có lá số.",
    "fil": "Mga natutuhang gawi, paraan ng pagpapasya, at paghahambing sa padron ng tagapagbantay kung may tsart na."
  },
  "Whether you currently need more growth, activation, follow-through, boundaries or recovery.": {
    "ja": "今必要なのは成長・始動・実行・境界線・回復のどれか。",
    "ko": "지금 성장, 시작, 실행, 경계 또는 회복 중 무엇이 더 필요한지.",
    "hi": "अभी विकास, पहल, काम पूरा करने, सीमाएँ बनाने या उबरने में से किसकी अधिक ज़रूरत है।",
    "th": "ตอนนี้คุณต้องการการเติบโต การเริ่มต้น การทำให้สำเร็จ ขอบเขต หรือการฟื้นฟู",
    "id": "Apakah saat ini Anda lebih membutuhkan pertumbuhan, dorongan awal, tindak lanjut, batasan, atau pemulihan.",
    "vi": "Lúc này bạn cần phát triển, khởi động, thực hiện đến cùng, ranh giới hay phục hồi.",
    "fil": "Kung mas kailangan mo ngayon ng paglago, pagsisimula, pagtupad, hangganan, o pagbangon."
  },
  "Turning your current 1–3 month bottleneck into one practical function to train.": {
    "ja": "最近1～3か月の行き詰まりを、今から練習できる一つの働きに整理します。",
    "ko": "최근 1~3개월의 막힘을 지금 연습할 수 있는 하나의 기능으로 정리합니다.",
    "hi": "पिछले 1–3 महीनों की रुकावट को अभ्यास करने योग्य एक क्षमता में बदलना।",
    "th": "เปลี่ยนจุดติดขัดช่วง 1–3 เดือนให้เป็นหน้าที่หนึ่งด้านที่ฝึกได้จริง",
    "id": "Mengubah hambatan 1–3 bulan terakhir menjadi satu fungsi praktis untuk dilatih.",
    "vi": "Chuyển vướng mắc trong 1–3 tháng gần đây thành một chức năng có thể luyện tập.",
    "fil": "Gawing isang kakayahang maaaring sanayin ang suliranin sa nakaraang 1–3 buwan."
  },
  "To compare this with your guardian beast, you still need a BaZi chart.": {
    "ja": "守護獣と比べるには、八字の命盤が必要です。",
    "ko": "수호 동물과 비교하려면 사주 명식이 필요합니다.",
    "hi": "संरक्षक प्राणी से तुलना के लिए अभी बाज़ी जन्मकुंडली चाहिए।",
    "th": "หากจะเทียบกับสัตว์ผู้พิทักษ์ คุณยังต้องมีดวงปาจื้อ",
    "id": "Untuk membandingkan dengan hewan pelindung, Anda masih memerlukan bagan BaZi.",
    "vi": "Để so sánh với linh thú, bạn cần có lá số Bát Tự.",
    "fil": "Kailangan mo pa ng tsart ng BaZi upang ihambing ito sa iyong tagapagbantay."
  },
  "Run a BaZi analysis on the home page first. Once the chart exists, come back—you will not need to retake the questions.": {
    "ja": "まずホームで八字を分析してください。命盤ができたら、質問に答え直さずに戻れます。",
    "ko": "먼저 홈에서 사주 분석을 진행하세요. 명식 생성 후 돌아오면 질문에 다시 답할 필요가 없습니다.",
    "hi": "पहले मुखपृष्ठ पर बाज़ी विश्लेषण करें। जन्मकुंडली बनने पर लौटें; प्रश्न दोबारा नहीं भरने होंगे।",
    "th": "วิเคราะห์ปาจื้อที่หน้าหลักก่อน เมื่อได้ดวงแล้วกลับมาได้โดยไม่ต้องตอบคำถามใหม่",
    "id": "Lakukan analisis BaZi di beranda terlebih dahulu. Setelah bagan tersedia, kembali tanpa perlu menjawab ulang.",
    "vi": "Hãy phân tích Bát Tự ở trang chủ trước. Khi có lá số, quay lại mà không cần làm lại câu hỏi.",
    "fil": "Magsagawa muna ng pagsusuri ng BaZi sa pangunahing pahina. Kapag may tsart na, bumalik nang hindi na kailangang ulitin ang mga tanong."
  },
  "Your current behaviour strategy is close to the underlying pattern represented by your chart guardian beast. Strengths are reinforced, so watch the same pattern when it becomes excessive.": {
    "ja": "今の行動方略は、命盤の守護獣が表す傾向に近いものです。強みが重なるため、使いすぎにも注意してください。",
    "ko": "현재의 행동 전략은 명식 수호 동물이 나타내는 바탕 성향과 가깝습니다. 강점이 강화되므로 지나치게 쓰는 경우를 주의하세요.",
    "hi": "आपकी वर्तमान व्यवहार शैली जन्मकुंडली के संरक्षक प्राणी के मूल ढाँचे के करीब है। खूबियाँ मजबूत होती हैं, इसलिए अति होने पर ध्यान दें।",
    "th": "แนวทางพฤติกรรมปัจจุบันใกล้กับพื้นฐานที่สัตว์ผู้พิทักษ์แทน จุดแข็งยิ่งเด่น จึงควรระวังเมื่อใช้มากเกินไป",
    "id": "Strategi perilaku Anda saat ini dekat dengan pola dasar hewan pelindung bagan. Kekuatan diperkuat, jadi waspadai saat pola itu berlebihan.",
    "vi": "Chiến lược hành vi hiện tại gần với khuynh hướng nền do linh thú đại diện. Thế mạnh được củng cố, nên chú ý khi trở nên quá mức.",
    "fil": "Malapit ang kasalukuyang paraan ng pagkilos mo sa padron ng tagapagbantay sa tsart. Lalong tumitibay ang mga kalakasan, kaya bantayan kapag nasosobrahan."
  },
  "Your learned behaviour and underlying chart pattern use different strengths, but they can support each other—one moves, while the other calibrates or carries.": {
    "ja": "身につけた行動と命盤の傾向は異なる強みを使いますが、互いに補えます。一方が進め、他方が整えたり支えたりします。",
    "ko": "학습된 행동과 명식의 바탕 성향은 서로 다른 강점을 쓰지만 보완할 수 있습니다. 한쪽이 나아가면 다른 쪽이 조율하거나 지탱합니다.",
    "hi": "आपका सीखा व्यवहार और जन्मकुंडली का मूल ढाँचा अलग खूबियाँ अपनाते हैं, पर एक-दूसरे को सहारा दे सकते हैं: एक आगे बढ़ाता है, दूसरा संतुलित करता या संभालता है।",
    "th": "พฤติกรรมที่เรียนรู้กับพื้นฐานดวงใช้จุดแข็งต่างกัน แต่เกื้อหนุนกันได้ ด้านหนึ่งพาเดินหน้า อีกด้านปรับสมดุลหรือรองรับ",
    "id": "Perilaku yang dipelajari dan pola dasar bagan memakai kekuatan berbeda, tetapi dapat saling mendukung: satu bergerak, yang lain menyelaraskan atau menopang.",
    "vi": "Hành vi học được và nền lá số dùng các thế mạnh khác nhau nhưng có thể bổ trợ: một bên mở đường, bên kia điều chỉnh hoặc nâng đỡ.",
    "fil": "Magkaiba ang kalakasang gamit ng natutuhan mong gawi at ng padron ng tsart, ngunit maaari silang magtulungan: ang isa ay kumikilos, ang isa ay nag-aayos o sumusuporta."
  },
  "Your everyday strategy and underlying chart pattern take different routes. This suggests a learned way of coping; it does not mean one side is more 'real' than the other.": {
    "ja": "日常の方略と命盤の傾向は異なる道筋です。身につけた対処法を示すもので、どちらかがより「本当」という意味ではありません。",
    "ko": "일상의 전략과 명식의 바탕 성향은 다른 길을 갑니다. 이는 학습된 대처 방식이며 어느 쪽이 더 진짜라는 뜻은 아닙니다.",
    "hi": "आपकी रोज़मर्रा की शैली और जन्मकुंडली का मूल ढाँचा अलग रास्ते लेते हैं। यह सीखा हुआ सामना करने का तरीका दर्शाता है; कोई पक्ष दूसरे से अधिक असली नहीं है।",
    "th": "แนวทางประจำวันกับพื้นฐานดวงต่างกัน แสดงว่าคุณเรียนรู้วิธีรับมือขึ้นมา ไม่ได้หมายความว่าด้านใดจริงกว่า",
    "id": "Strategi harian dan pola dasar bagan menempuh jalur berbeda. Ini menunjukkan cara menghadapi keadaan yang dipelajari, bukan berarti satu sisi lebih nyata.",
    "vi": "Chiến lược hằng ngày và nền lá số đi theo hướng khác nhau. Điều này gợi ý cách ứng phó học được, không có nghĩa bên nào thật hơn.",
    "fil": "Magkaiba ang landas ng pang-araw-araw mong paraan at ng padron ng tsart. Ipinahihiwatig nito ang natutuhang pagharap; hindi ibig sabihing mas tunay ang isang panig."
  },
  "Daily dress | Five-element colour": {
    "ja": "毎日の装い · 五行の色",
    "ko": "오늘의 옷차림 · 오행 색상",
    "hi": "दैनिक पहनावा · पंचतत्व के रंग",
    "th": "แต่งกายประจำวัน · สีห้าธาตุ",
    "id": "Busana harian · Warna lima unsur",
    "vi": "Trang phục hằng ngày · Màu ngũ hành",
    "fil": "Pananamit araw-araw · Kulay ng limang elemento"
  },
  "Five states, five colours. Choose the colour that fits the week you want.": {
    "ja": "五つの状態、五つの色。過ごしたい一週間に合う色を選びましょう。",
    "ko": "다섯 상태, 다섯 색. 원하는 한 주에 맞는 색을 골라보세요.",
    "hi": "पाँच स्थितियाँ, पाँच रंग। अपने मनचाहे सप्ताह के अनुरूप रंग चुनें।",
    "th": "ห้าสภาวะ ห้าสี เลือกสีที่เหมาะกับสัปดาห์ที่คุณต้องการ",
    "id": "Lima keadaan, lima warna. Pilih warna yang sesuai dengan minggu yang Anda inginkan.",
    "vi": "Năm trạng thái, năm màu. Chọn màu phù hợp với tuần bạn mong muốn.",
    "fil": "Limang kalagayan, limang kulay. Piliin ang kulay na angkop sa linggong nais mo."
  },
  "Today leans toward": {
    "ja": "今日の参考",
    "ko": "오늘의 참고",
    "hi": "आज का संकेत",
    "th": "แนวโน้มวันนี้",
    "id": "Kecenderungan hari ini",
    "vi": "Gợi ý hôm nay",
    "fil": "Hilig ng araw na ito"
  },
  "Element": {
    "ja": "五行",
    "ko": "오행",
    "hi": "तत्व",
    "th": "ธาตุ",
    "id": "Unsur",
    "vi": "Hành",
    "fil": "Elemento"
  },
  "Today's state": {
    "ja": "今日の状態",
    "ko": "오늘의 상태",
    "hi": "आज की स्थिति",
    "th": "สภาวะวันนี้",
    "id": "Keadaan hari ini",
    "vi": "Trạng thái hôm nay",
    "fil": "Kalagayan ngayong araw"
  },
  "Suggested colours": {
    "ja": "おすすめの色",
    "ko": "추천 색상",
    "hi": "सुझाए गए रंग",
    "th": "สีที่แนะนำ",
    "id": "Warna yang disarankan",
    "vi": "Màu gợi ý",
    "fil": "Mga mungkahing kulay"
  },
  "See the full guide": {
    "ja": "詳しいガイドを見る",
    "ko": "전체 안내 보기",
    "hi": "पूरी मार्गदर्शिका देखें",
    "th": "ดูคำแนะนำทั้งหมด",
    "id": "Lihat panduan lengkap",
    "vi": "Xem hướng dẫn đầy đủ",
    "fil": "Tingnan ang buong gabay"
  },
  "Or choose the state you want right now": {
    "ja": "今ほしい状態を選んでもかまいません",
    "ko": "지금 원하는 상태를 선택해도 됩니다",
    "hi": "या अभी अपनी मनचाही स्थिति चुनें",
    "th": "หรือเลือกสภาวะที่คุณต้องการตอนนี้",
    "id": "Atau pilih keadaan yang Anda inginkan saat ini",
    "vi": "Hoặc chọn trạng thái bạn muốn lúc này",
    "fil": "O piliin ang kalagayang gusto mo ngayon"
  },
  "“Today leans toward” only uses today's day-stem element as a light timing cue.": {
    "ja": "「今日の参考」は当日の日干の五行だけを使った軽い時間の目安です。",
    "ko": "오늘의 참고는 당일 일간의 오행만을 활용한 가벼운 시간 참고입니다.",
    "hi": "आज का संकेत केवल आज के दिन-स्तंभ के तने के तत्व पर आधारित एक हल्का समय-संकेत है।",
    "th": "แนวโน้มวันนี้อ้างอิงเฉพาะธาตุของก้านฟ้าประจำวัน เป็นเพียงคำแนะนำด้านเวลาแบบเบา ๆ",
    "id": "Kecenderungan hari ini hanya memakai unsur batang hari ini sebagai petunjuk waktu ringan.",
    "vi": "Gợi ý hôm nay chỉ dựa trên hành của thiên can ngày, như một chỉ dẫn thời điểm nhẹ nhàng.",
    "fil": "Batay lamang sa elemento ng tangkay ng araw ang hilig ng araw na ito bilang banayad na pahiwatig ng panahon."
  },
  "You can change the state at any time. You are not required to follow the daily cue.": {
    "ja": "いつでも好きな状態に変えられます。今日の参考に従う必要はありません。",
    "ko": "언제든 원하는 상태로 바꿀 수 있습니다. 오늘의 참고를 따를 필요는 없습니다.",
    "hi": "आप स्थिति कभी भी बदल सकते हैं। दैनिक संकेत का पालन ज़रूरी नहीं है।",
    "th": "เปลี่ยนสภาวะได้ทุกเมื่อ ไม่จำเป็นต้องทำตามแนวโน้มประจำวัน",
    "id": "Anda dapat mengubah keadaan kapan saja. Tidak perlu mengikuti petunjuk harian.",
    "vi": "Bạn có thể đổi trạng thái bất cứ lúc nào, không cần theo gợi ý hằng ngày.",
    "fil": "Maaari mong baguhin ang kalagayan anumang oras. Hindi kailangang sundin ang pahiwatig ng araw."
  },
  "This is a five-element culture × colour × daily-state guide. It does not promise luck, wealth, or an ancient dress rule. Personal BaZi colour use is judged separately.": {
    "ja": "五行文化・色・日々の状態をつなぐガイドです。開運や財運を保証せず、古典の服装規則でもありません。個人の八字に合う色は別途判断します。",
    "ko": "오행 문화·색·일상 상태를 연결하는 안내입니다. 행운이나 재물을 보장하지 않으며 고대 복장 규칙도 아닙니다. 개인 사주에 맞는 색은 별도로 판단합니다.",
    "hi": "यह पंचतत्व संस्कृति, रंग और दैनिक स्थिति की मार्गदर्शिका है। यह भाग्य या धन का वादा या प्राचीन पहनावे का नियम नहीं है। व्यक्तिगत बाज़ी के रंग अलग से तय होते हैं।",
    "th": "นี่คือคำแนะนำวัฒนธรรมห้าธาตุ สี และสภาวะประจำวัน ไม่รับประกันโชคหรือทรัพย์ และไม่ใช่กฎการแต่งกายโบราณ สีตามดวงปาจื้อส่วนบุคคลต้องพิจารณาแยก",
    "id": "Ini panduan budaya lima unsur, warna, dan keadaan harian. Tidak menjanjikan keberuntungan, kekayaan, atau aturan busana kuno. Warna BaZi pribadi dinilai terpisah.",
    "vi": "Đây là hướng dẫn văn hóa ngũ hành, màu sắc và trạng thái hằng ngày. Không hứa hẹn may mắn, tài lộc hay quy tắc trang phục cổ. Màu theo Bát Tự cá nhân được xét riêng.",
    "fil": "Gabay ito sa kultura ng limang elemento, kulay, at kalagayan araw-araw. Hindi ito pangako ng suwerte o yaman, o sinaunang tuntunin sa pananamit. Hiwalay na sinusuri ang kulay ayon sa personal na BaZi."
  },
  "Today's dress colour": {
    "ja": "今日の装いの色",
    "ko": "오늘의 옷 색상",
    "hi": "आज के पहनावे का रंग",
    "th": "สีเสื้อผ้าวันนี้",
    "id": "Warna busana hari ini",
    "vi": "Màu trang phục hôm nay",
    "fil": "Kulay ng pananamit ngayon"
  },
  "Choose a different five-element colour": {
    "ja": "別の五行の色を選ぶ",
    "ko": "다른 오행 색상 선택",
    "hi": "पंचतत्व का दूसरा रंग चुनें",
    "th": "เลือกสีห้าธาตุอื่น",
    "id": "Pilih warna lima unsur lainnya",
    "vi": "Chọn màu ngũ hành khác",
    "fil": "Pumili ng ibang kulay ng limang elemento"
  },
  "Loading Today Guide": {
    "ja": "今日のガイドを読み込み中",
    "ko": "오늘의 안내 불러오는 중",
    "hi": "आज की मार्गदर्शिका लोड हो रही है",
    "th": "กำลังโหลดคำแนะนำวันนี้",
    "id": "Memuat panduan hari ini",
    "vi": "Đang tải hướng dẫn hôm nay",
    "fil": "Nilo-load ang gabay ngayong araw"
  },
  "Your report is ready": {
    "ja": "レポートができました",
    "ko": "보고서가 준비되었습니다",
    "hi": "आपकी रिपोर्ट तैयार है",
    "th": "รายงานของคุณพร้อมแล้ว",
    "id": "Laporan Anda siap",
    "vi": "Báo cáo của bạn đã sẵn sàng",
    "fil": "Handa na ang ulat mo"
  },
  "Create your report": {
    "ja": "レポートを作成",
    "ko": "보고서 만들기",
    "hi": "अपनी रिपोर्ट बनाएँ",
    "th": "สร้างรายงานของคุณ",
    "id": "Buat laporan Anda",
    "vi": "Tạo báo cáo của bạn",
    "fil": "Gumawa ng iyong ulat"
  },
  "My saved reports": {
    "ja": "保存したレポート",
    "ko": "저장한 보고서",
    "hi": "मेरी सहेजी गई रिपोर्टें",
    "th": "รายงานที่บันทึกไว้",
    "id": "Laporan tersimpan saya",
    "vi": "Báo cáo đã lưu của tôi",
    "fil": "Mga naka-save kong ulat"
  },
  "Read this answer": {
    "ja": "今回の回答を読む",
    "ko": "이번 답변 읽기",
    "hi": "यह उत्तर पढ़ें",
    "th": "อ่านคำตอบนี้",
    "id": "Baca jawaban ini",
    "vi": "Đọc câu trả lời này",
    "fil": "Basahin ang sagot na ito"
  },
  "Birth details and question": {
    "ja": "出生情報と質問",
    "ko": "출생 정보와 질문",
    "hi": "जन्म विवरण और प्रश्न",
    "th": "ข้อมูลเกิดและคำถาม",
    "id": "Data kelahiran dan pertanyaan",
    "vi": "Thông tin sinh và câu hỏi",
    "fil": "Detalye ng kapanganakan at tanong"
  },
  "STONE · ARTICLES": {
    "ja": "STONE · 記事",
    "ko": "STONE · 글",
    "hi": "STONE · लेख",
    "th": "STONE · บทความ",
    "id": "STONE · ARTIKEL",
    "vi": "STONE · BÀI VIẾT",
    "fil": "STONE · MGA ARTIKULO"
  },
  "Zhaowu · Articles": {
    "ja": "昭梧 · 記事",
    "ko": "昭梧 · 글",
    "hi": "ZHAOWU · लेख",
    "th": "昭梧 · บทความ",
    "id": "Zhaowu · Artikel",
    "vi": "Zhaowu · Bài viết",
    "fil": "Zhaowu · Mga artikulo"
  },
  "Essays and reflective short notes live here. BaZi teaching cards are kept separately under Zhaowu · BaZi Knowledge.": {
    "ja": "随筆や短い考察を集めています。八字の学習カードは「昭梧 · 八字の知識」にあります。",
    "ko": "에세이와 짧은 성찰을 모았습니다. 사주 학습 카드는 昭梧 · 사주 지식에 따로 있습니다.",
    "hi": "निबंध और छोटे चिंतन यहाँ हैं। बाज़ी के अध्ययन कार्ड ZHAOWU · बाज़ी ज्ञान में अलग रखे गए हैं।",
    "th": "รวมบทความและข้อคิดสั้น ๆ ไว้ที่นี่ บัตรความรู้ปาจื้อแยกไว้ใน昭梧 · ความรู้ปาจื้อ",
    "id": "Esai dan catatan refleksi singkat ada di sini. Kartu belajar BaZi terpisah di Zhaowu · Pengetahuan BaZi.",
    "vi": "Tiểu luận và ghi chép suy ngẫm ngắn nằm ở đây. Thẻ học Bát Tự được để riêng trong Zhaowu · Kiến thức Bát Tự.",
    "fil": "Narito ang mga sanaysay at maikling pagninilay. Hiwalay ang mga kard sa pag-aaral ng BaZi sa Zhaowu · Kaalaman sa BaZi."
  },
  "Latest piece first. Open Articles for the full archive of essays and short notes.": {
    "ja": "まず最新記事を表示します。すべての随筆と短札は記事一覧へ。",
    "ko": "최신 글부터 표시합니다. 전체 에세이와 짧은 기록은 글 목록에서 보세요.",
    "hi": "सबसे नया लेख पहले। सभी निबंध और छोटे नोट्स के लिए लेख खोलें।",
    "th": "แสดงงานล่าสุดก่อน เปิดบทความเพื่อดูคลังข้อเขียนและบันทึกสั้นทั้งหมด",
    "id": "Tulisan terbaru ditampilkan lebih dahulu. Buka Artikel untuk arsip lengkap esai dan catatan singkat.",
    "vi": "Hiển thị bài mới nhất trước. Mở Bài viết để xem toàn bộ tiểu luận và ghi chú ngắn.",
    "fil": "Pinakabagong akda muna. Buksan ang Mga Artikulo para sa buong kalipunan ng sanaysay at maiikling tala."
  },
  "Latest": {
    "ja": "最新",
    "ko": "최신",
    "hi": "नवीनतम",
    "th": "ล่าสุด",
    "id": "Terbaru",
    "vi": "Mới nhất",
    "fil": "Pinakabago"
  },
  "All essays & short notes": {
    "ja": "すべての随筆と短札",
    "ko": "모든 에세이와 짧은 기록",
    "hi": "सभी निबंध और छोटे नोट्स",
    "th": "บทความและบันทึกสั้นทั้งหมด",
    "id": "Semua esai dan catatan singkat",
    "vi": "Tất cả tiểu luận và ghi chú ngắn",
    "fil": "Lahat ng sanaysay at maiikling tala"
  },
  "Show less": {
    "ja": "折りたたむ",
    "ko": "접기",
    "hi": "कम दिखाएँ",
    "th": "แสดงน้อยลง",
    "id": "Tampilkan lebih sedikit",
    "vi": "Thu gọn",
    "fil": "Ipakita ang mas kaunti"
  },
  "Read": {
    "ja": "読む",
    "ko": "읽기",
    "hi": "पढ़ें",
    "th": "อ่าน",
    "id": "Baca",
    "vi": "Đọc",
    "fil": "Basahin"
  },
  "Open Articles": {
    "ja": "記事一覧を開く",
    "ko": "글 목록 열기",
    "hi": "लेख खोलें",
    "th": "เปิดบทความ",
    "id": "Buka Artikel",
    "vi": "Mở Bài viết",
    "fil": "Buksan ang Mga Artikulo"
  },
  "Article": {
    "ja": "記事",
    "ko": "글",
    "hi": "लेख",
    "th": "บทความ",
    "id": "Artikel",
    "vi": "Bài viết",
    "fil": "Artikulo"
  },
  "Short note": {
    "ja": "短札",
    "ko": "짧은 기록",
    "hi": "संक्षिप्त टिप्पणी",
    "th": "บันทึกสั้น",
    "id": "Catatan singkat",
    "vi": "Ghi chú ngắn",
    "fil": "Maikling tala"
  },
  "Take the Five-Element Strength Overdrive test": {
    "ja": "五行の強みの使いすぎテストを受ける",
    "ko": "오행 강점 과용 테스트 하기",
    "hi": "पंचतत्व शक्तियों के अति-प्रयोग का परीक्षण करें",
    "th": "ทำแบบทดสอบการใช้จุดแข็งห้าธาตุมากเกินไป",
    "id": "Ikuti tes penggunaan berlebih kekuatan lima unsur",
    "vi": "Làm trắc nghiệm lạm dụng thế mạnh ngũ hành",
    "fil": "Sagutan ang pagsusulit ng labis na paggamit ng limang elemento"
  },
  "Articles will be added here over time.": {
    "ja": "記事は順次追加されます。",
    "ko": "글은 계속 추가됩니다.",
    "hi": "यहाँ समय के साथ लेख जोड़े जाएँगे।",
    "th": "จะเพิ่มบทความที่นี่อย่างต่อเนื่อง",
    "id": "Artikel akan ditambahkan di sini secara berkala.",
    "vi": "Bài viết sẽ được bổ sung dần tại đây.",
    "fil": "Unti-unting magdaragdag ng mga artikulo rito."
  },
  "Articles are temporarily unavailable.": {
    "ja": "現在、記事を読み込めません。",
    "ko": "지금은 글을 불러올 수 없습니다.",
    "hi": "लेख अस्थायी रूप से उपलब्ध नहीं हैं।",
    "th": "บทความไม่พร้อมใช้งานชั่วคราว",
    "id": "Artikel sementara tidak tersedia.",
    "vi": "Bài viết tạm thời không khả dụng.",
    "fil": "Pansamantalang hindi makuha ang mga artikulo."
  },
  "Loading articles…": {
    "ja": "記事を読み込み中…",
    "ko": "글 불러오는 중…",
    "hi": "लेख लोड हो रहे हैं…",
    "th": "กำลังโหลดบทความ…",
    "id": "Memuat artikel…",
    "vi": "Đang tải bài viết…",
    "fil": "Nilo-load ang mga artikulo…"
  },
  "Open original full-size image": {
    "ja": "原寸の画像を開く",
    "ko": "원본 크기 이미지 열기",
    "hi": "मूल पूर्ण आकार का चित्र खोलें",
    "th": "เปิดภาพต้นฉบับขนาดเต็ม",
    "id": "Buka gambar asli ukuran penuh",
    "vi": "Mở ảnh gốc đầy đủ kích thước",
    "fil": "Buksan ang orihinal na buong laki ng larawan"
  },
  "views": {
    "ja": "閲覧",
    "ko": "조회",
    "hi": "बार देखा गया",
    "th": "ครั้งที่อ่าน",
    "id": "kali dilihat",
    "vi": "lượt xem",
    "fil": "pagtingin"
  },
  "Member": {
    "ja": "会員",
    "ko": "회원",
    "hi": "सदस्य",
    "th": "สมาชิก",
    "id": "Anggota",
    "vi": "Thành viên",
    "fil": "Miyembro"
  },
  "Account": {
    "ja": "アカウント",
    "ko": "계정",
    "hi": "खाता",
    "th": "บัญชี",
    "id": "Akun",
    "vi": "Tài khoản",
    "fil": "Aking account"
  },
  "Chart": {
    "ja": "命盤",
    "ko": "명식",
    "hi": "जन्मकुंडली",
    "th": "ดวง",
    "id": "Bagan",
    "vi": "Lá số",
    "fil": "Tsart"
  },
  "Discover more of ZHAOWU": {
    "ja": "昭梧をもっと知る",
    "ko": "昭梧 더 알아보기",
    "hi": "ZHAOWU को और जानें",
    "th": "สำรวจ昭梧เพิ่มเติม",
    "id": "Temukan lebih banyak tentang ZHAOWU",
    "vi": "Khám phá thêm về ZHAOWU",
    "fil": "Tuklasin pa ang ZHAOWU"
  },
  "EASTERN TIME CULTURE · PERSONAL DESTINY BOOK": {
    "ja": "東洋の時間文化 · あなたの命書",
    "ko": "동양의 시간 문화 · 나의 명서",
    "hi": "पूर्वी समय संस्कृति · आपकी जीवन-पुस्तिका",
    "th": "วัฒนธรรมเวลาแห่งตะวันออก · หนังสือชีวิตส่วนบุคคล",
    "id": "BUDAYA WAKTU TIMUR · BUKU KEHIDUPAN PRIBADI",
    "vi": "VĂN HÓA THỜI GIAN PHƯƠNG ĐÔNG · SÁCH CUỘC ĐỜI CÁ NHÂN",
    "fil": "KULTURA NG PANAHON SA SILANGAN · PERSONAL NA AKLAT NG BUHAY"
  },
  "Give time a form.": {
    "ja": "時の流れを、形に。",
    "ko": "시간의 흐름을 눈에 보이게.",
    "hi": "समय को आकार दें।",
    "th": "ให้กาลเวลามีรูปร่าง",
    "id": "Memberi bentuk pada waktu.",
    "vi": "Cho thời gian một hình hài.",
    "fil": "Bigyan ng anyo ang panahon."
  },
  "Make destiny readable.": {
    "ja": "命理を、読み解けるものに。",
    "ko": "운명의 이치를 읽기 쉽게.",
    "hi": "जीवन के संकेतों को समझने योग्य बनाएँ।",
    "th": "ให้อ่านความหมายแห่งชะตาได้",
    "id": "Membuat takdir dapat dipahami.",
    "vi": "Để mệnh lý trở nên dễ hiểu.",
    "fil": "Gawing nauunawaan ang mga pahiwatig ng buhay."
  },
  "Page navigation": {
    "ja": "ページの案内",
    "ko": "페이지 탐색",
    "hi": "पृष्ठ नेविगेशन",
    "th": "การนำทางหน้า",
    "id": "Navigasi halaman",
    "vi": "Điều hướng trang",
    "fil": "Pag-navigate sa pahina"
  },
  "Start my free chart": {
    "ja": "無料で命盤を作成",
    "ko": "무료 명식 만들기",
    "hi": "मेरी जन्मकुंडली निःशुल्क बनाएँ",
    "th": "เริ่มสร้างดวงฟรี",
    "id": "Mulai bagan gratis saya",
    "vi": "Lập lá số miễn phí",
    "fil": "Simulan ang libreng tsart ko"
  },
  "View a sample report": {
    "ja": "レポートの例を見る",
    "ko": "예시 보고서 보기",
    "hi": "नमूना रिपोर्ट देखें",
    "th": "ดูตัวอย่างรายงาน",
    "id": "Lihat contoh laporan",
    "vi": "Xem báo cáo mẫu",
    "fil": "Tingnan ang halimbawang ulat"
  },
  "Start with your birth details to create a chart without signing in and read your free core insights. Then explore ZHAOWU’s essays, original art collections and daily guide.": {
    "ja": "出生情報だけで、ログインせずに命盤を作成し、無料の基本解読を読めます。その後、昭梧の記事・原画集・日々のガイドをご覧ください。",
    "ko": "출생 정보로 로그인 없이 명식을 만들고 무료 핵심 해석을 읽어보세요. 이어서 昭梧의 글, 원화 모음과 일일 안내를 둘러보세요.",
    "hi": "जन्म विवरण से बिना लॉग इन जन्मकुंडली बनाएँ और मुख्य जानकारी निःशुल्क पढ़ें। फिर ZHAOWU के निबंध, मूल चित्र-संग्रह और दैनिक मार्गदर्शिका देखें।",
    "th": "เริ่มจากข้อมูลเกิด สร้างดวงโดยไม่เข้าสู่ระบบและอ่านคำอธิบายหลักฟรี แล้วค่อยสำรวจบทความ ภาพต้นฉบับ และคำแนะนำประจำวันของ昭梧",
    "id": "Mulai dengan data kelahiran untuk membuat bagan tanpa masuk dan membaca wawasan inti gratis. Lalu jelajahi esai, koleksi seni asli, dan panduan harian ZHAOWU.",
    "vi": "Bắt đầu bằng thông tin sinh để lập lá số không cần đăng nhập và đọc luận giải cốt lõi miễn phí. Sau đó khám phá bài viết, bộ sưu tập tranh gốc và hướng dẫn hằng ngày của ZHAOWU.",
    "fil": "Magsimula sa detalye ng kapanganakan upang gumawa ng tsart nang walang pag-sign in at basahin nang libre ang pangunahing paliwanag. Pagkatapos, tuklasin ang mga sanaysay, orihinal na sining, at pang-araw-araw na gabay ng ZHAOWU."
  },
  "Traditional Chinese seasonal names; existing artwork follows approximate hemisphere when available, not local weather.": {
    "ja": "中国の伝統的な節気名です。位置がわかる場合、画作はおおよその半球に合わせます。現地の天気予報ではありません。",
    "ko": "중국 전통 절기 명칭입니다. 위치를 알 수 있으면 대략적인 반구에 맞춰 기존 그림을 표시하며 현지 일기예보가 아닙니다.",
    "hi": "ये पारंपरिक चीनी ऋतु-नाम हैं। स्थान उपलब्ध होने पर चित्र अनुमानित गोलार्ध के अनुसार दिखते हैं, स्थानीय मौसम के अनुसार नहीं।",
    "th": "ชื่อฤดูกาลตามประเพณีจีน ภาพเดิมปรับตามซีกโลกโดยประมาณเมื่อมีข้อมูล ไม่ใช่พยากรณ์อากาศท้องถิ่น",
    "id": "Nama musim tradisional Tiongkok; karya yang ada mengikuti perkiraan belahan bumi jika tersedia, bukan cuaca setempat.",
    "vi": "Tên tiết khí truyền thống Trung Hoa; tranh có sẵn được chọn theo bán cầu ước tính khi có thông tin, không phải dự báo thời tiết địa phương.",
    "fil": "Mga tradisyonal na pangalang Tsino ng panahon; pinipili ang umiiral na sining ayon sa tinatayang hemispero kung may datos, hindi ayon sa lokal na panahon."
  },
  "Frost’s Descent": {
    "ja": "霜降",
    "ko": "상강",
    "hi": "पाले का अवतरण",
    "th": "น้ำค้างแข็งลง",
    "id": "Turunnya Embun Beku",
    "vi": "Sương giáng",
    "fil": "Pagdating ng Hamog na Nagyelo"
  },
  "My chart": {
    "ja": "マイ命盤",
    "ko": "내 명식",
    "hi": "मेरी जन्मकुंडली",
    "th": "ดวงของฉัน",
    "id": "Bagan saya",
    "vi": "Lá số của tôi",
    "fil": "Tsart ko"
  },
  "Today’s guide": {
    "ja": "今日のガイド",
    "ko": "오늘의 안내",
    "hi": "आज की मार्गदर्शिका",
    "th": "คำแนะนำวันนี้",
    "id": "Panduan hari ini",
    "vi": "Hướng dẫn hôm nay",
    "fil": "Gabay ngayong araw"
  },
  "Quizzes": {
    "ja": "テスト",
    "ko": "테스트",
    "hi": "प्रश्नोत्तरी",
    "th": "แบบทดสอบ",
    "id": "Kuis",
    "vi": "Trắc nghiệm",
    "fil": "Mga pagsusulit"
  },
  "Who you are": {
    "ja": "自分を知る",
    "ko": "나는 누구인가",
    "hi": "आप कौन हैं",
    "th": "คุณเป็นใคร",
    "id": "Siapa diri Anda",
    "vi": "Bạn là ai",
    "fil": "Sino ka"
  },
  "Character and affinity": {
    "ja": "性格と縁",
    "ko": "성격과 인연",
    "hi": "स्वभाव और जुड़ाव",
    "th": "บุคลิกและสายสัมพันธ์",
    "id": "Karakter dan kedekatan",
    "vi": "Tính cách và duyên",
    "fil": "Pagkatao at ugnayan"
  },
  "How you are now": {
    "ja": "今の自分",
    "ko": "지금의 나",
    "hi": "अभी आप कैसे हैं",
    "th": "คุณในตอนนี้",
    "id": "Diri Anda saat ini",
    "vi": "Bạn lúc này",
    "fil": "Ikaw sa kasalukuyan"
  },
  "Where you are stuck, what you need": {
    "ja": "行き詰まりと必要なこと",
    "ko": "막힌 지점과 필요한 것",
    "hi": "कहाँ अटके हैं, क्या चाहिए",
    "th": "จุดที่ติดขัดและสิ่งที่ต้องการ",
    "id": "Hambatan dan kebutuhan Anda",
    "vi": "Vướng mắc và điều bạn cần",
    "fil": "Saan ka nahihirapan, ano ang kailangan mo"
  },
  "Everyday": {
    "ja": "日々の暮らし",
    "ko": "일상",
    "hi": "दैनिक जीवन",
    "th": "ชีวิตประจำวัน",
    "id": "Keseharian",
    "vi": "Đời thường",
    "fil": "Araw-araw"
  },
  "Scent and tea, just for fun": {
    "ja": "香りとお茶を楽しむ",
    "ko": "향기와 차를 가볍게",
    "hi": "सुगंध और चाय, केवल आनंद के लिए",
    "th": "กลิ่นและชา เพื่อความสนุก",
    "id": "Aroma dan teh, untuk bersenang-senang",
    "vi": "Hương và trà, để thư giãn",
    "fil": "Amoy at tsaa, para sa kasiyahan"
  },
  "Find your tea": {
    "ja": "自分に合うお茶",
    "ko": "나에게 맞는 차 찾기",
    "hi": "अपनी चाय खोजें",
    "th": "ค้นหาชาที่เหมาะกับคุณ",
    "id": "Temukan teh Anda",
    "vi": "Tìm loại trà của bạn",
    "fil": "Hanapin ang iyong tsaa"
  },
  "Seven questions, one tea": {
    "ja": "7問で一つのお茶に",
    "ko": "일곱 질문으로 찾는 차 한 잔",
    "hi": "सात प्रश्न, एक चाय",
    "th": "เจ็ดคำถาม ชาหนึ่งชนิด",
    "id": "Tujuh pertanyaan, satu teh",
    "vi": "Bảy câu hỏi, một loại trà",
    "fil": "Pitong tanong, isang tsaa"
  },
  "Articles & knowledge": {
    "ja": "記事と知識",
    "ko": "글과 지식",
    "hi": "लेख और ज्ञान",
    "th": "บทความและความรู้",
    "id": "Artikel dan pengetahuan",
    "vi": "Bài viết và kiến thức",
    "fil": "Mga artikulo at kaalaman"
  },
  "Slow reading: essays, notes and short explainers.": {
    "ja": "ゆっくり読む随筆・短札・解説。",
    "ko": "천천히 읽는 에세이, 기록과 짧은 해설.",
    "hi": "धीरे पढ़ें: निबंध, नोट्स और संक्षिप्त व्याख्याएँ।",
    "th": "ค่อย ๆ อ่านบทความ บันทึก และคำอธิบายสั้น ๆ",
    "id": "Bacaan santai: esai, catatan, dan penjelasan singkat.",
    "vi": "Đọc chậm: tiểu luận, ghi chú và giải thích ngắn.",
    "fil": "Marahang pagbabasa: mga sanaysay, tala, at maikling paliwanag."
  },
  "Short explainers": {
    "ja": "短い解説",
    "ko": "짧은 해설",
    "hi": "संक्षिप्त व्याख्याएँ",
    "th": "คำอธิบายสั้น ๆ",
    "id": "Penjelasan singkat",
    "vi": "Giải thích ngắn",
    "fil": "Maiikling paliwanag"
  },
  "Methods, terms and how to read them.": {
    "ja": "方法・用語・読み解き方。",
    "ko": "방법, 용어와 해석법.",
    "hi": "विधियाँ, शब्द और उन्हें समझने के तरीके।",
    "th": "วิธีการ คำศัพท์ และแนวทางอ่าน",
    "id": "Metode, istilah, dan cara memahaminya.",
    "vi": "Phương pháp, thuật ngữ và cách đọc.",
    "fil": "Mga pamamaraan, termino, at paraan ng pag-unawa."
  },
  "Tales of the Three Realms": {
    "ja": "三界の物語",
    "ko": "삼계 이야기",
    "hi": "तीन लोकों की कथाएँ",
    "th": "เรื่องเล่าสามภพ",
    "id": "Kisah Tiga Alam",
    "vi": "Chuyện Tam Giới",
    "fil": "Mga Kuwento ng Tatlong Daigdig"
  },
  "Hidden & Manifest": {
    "ja": "幽と明の万象",
    "ko": "숨은 세계와 드러난 세계",
    "hi": "अदृश्य और प्रकट",
    "th": "เร้นลับและประจักษ์",
    "id": "Tersembunyi dan Nyata",
    "vi": "U Minh và Vạn Tượng",
    "fil": "Nakatago at Hayag"
  },
  "Twelve original artworks and their connected mythology.": {
    "ja": "12の原画とつながる神話。",
    "ko": "원화 열두 점과 연결된 신화.",
    "hi": "बारह मूल चित्र और उनसे जुड़ी पौराणिक कथाएँ।",
    "th": "ภาพต้นฉบับสิบสองภาพและตำนานที่เชื่อมโยงกัน",
    "id": "Dua belas karya asli dan mitologi yang saling terkait.",
    "vi": "Mười hai tranh gốc và thần thoại liên kết.",
    "fil": "Labindalawang orihinal na larawan at magkakaugnay na mitolohiya."
  },
  "Full series index, zodiac mythology and chronicles.": {
    "ja": "全巻目次・十二支の神話・年代記。",
    "ko": "전체 시리즈 목차, 십이지 신화와 연대기.",
    "hi": "पूरी शृंखला की सूची, राशिचक्र की पौराणिक कथाएँ और वृत्तांत।",
    "th": "สารบัญทั้งชุด ตำนานนักษัตร และพงศาวดาร",
    "id": "Indeks seri lengkap, mitologi zodiak, dan kronik.",
    "vi": "Mục lục toàn bộ, thần thoại con giáp và biên niên.",
    "fil": "Buong talaan ng serye, mitolohiya ng zodiac, at mga salaysay."
  },
  "About ZHAOWU": {
    "ja": "昭梧について",
    "ko": "昭梧 소개",
    "hi": "ZHAOWU के बारे में",
    "th": "เกี่ยวกับ昭梧",
    "id": "Tentang ZHAOWU",
    "vi": "Về ZHAOWU",
    "fil": "Tungkol sa ZHAOWU"
  },
  "The ideas, artwork and methods behind ZHAOWU.": {
    "ja": "昭梧の考え方・作品・方法。",
    "ko": "昭梧의 생각, 작품과 방법.",
    "hi": "ZHAOWU के विचार, चित्र और विधियाँ।",
    "th": "แนวคิด ภาพ และวิธีการของ昭梧",
    "id": "Gagasan, karya seni, dan metode di balik ZHAOWU.",
    "vi": "Ý tưởng, tác phẩm và phương pháp của ZHAOWU.",
    "fil": "Mga ideya, sining, at pamamaraan sa likod ng ZHAOWU."
  },
  "Site guide": {
    "ja": "サイトの使い方",
    "ko": "사이트 안내",
    "hi": "साइट मार्गदर्शिका",
    "th": "คู่มือเว็บไซต์",
    "id": "Panduan situs",
    "vi": "Hướng dẫn trang",
    "fil": "Gabay sa site"
  },
  "What’s new": {
    "ja": "更新情報",
    "ko": "새 소식",
    "hi": "नया क्या है",
    "th": "อัปเดตใหม่",
    "id": "Yang baru",
    "vi": "Có gì mới",
    "fil": "Mga bago"
  },
  "What changed on the site recently.": {
    "ja": "サイトの最近の変更点。",
    "ko": "사이트의 최근 변경 사항.",
    "hi": "साइट पर हाल के बदलाव।",
    "th": "สิ่งที่เปลี่ยนแปลงล่าสุดในเว็บไซต์",
    "id": "Perubahan terbaru pada situs.",
    "vi": "Những thay đổi gần đây trên trang.",
    "fil": "Mga kamakailang pagbabago sa site."
  },
  "Ten life chapters": {
    "ja": "人生の十章",
    "ko": "인생 열 장",
    "hi": "जीवन के दस अध्याय",
    "th": "สิบบทแห่งชีวิต",
    "id": "Sepuluh bab kehidupan",
    "vi": "Mười chương cuộc đời",
    "fil": "Sampung kabanata ng buhay"
  },
  "Ten life chapters. Which one feels like yours right now?": {
    "ja": "人生の十章。今のあなたはどの章でしょう？",
    "ko": "인생의 열 장, 지금 나는 어느 장에 있나요?",
    "hi": "जीवन के दस अध्याय। अभी कौन-सा आपका लगता है?",
    "th": "ชีวิตสิบบท บทไหนเหมือนคุณตอนนี้?",
    "id": "Sepuluh bab kehidupan. Bab mana yang terasa seperti Anda saat ini?",
    "vi": "Mười chương cuộc đời. Chương nào giống bạn lúc này?",
    "fil": "Sampung kabanata ng buhay. Alin ang tila tungkol sa iyo ngayon?"
  },
  "Every report you have made, kept in one place.": {
    "ja": "作成したレポートを一か所に。",
    "ko": "만든 보고서를 한곳에.",
    "hi": "आपकी बनाई सभी रिपोर्टें, एक जगह।",
    "th": "รวมรายงานที่คุณสร้างไว้ในที่เดียว",
    "id": "Semua laporan yang Anda buat, di satu tempat.",
    "vi": "Mọi báo cáo bạn đã tạo, ở cùng một nơi.",
    "fil": "Lahat ng ulat na ginawa mo, nasa isang lugar."
  },
  "A fictional case showing the depth and boundaries.": {
    "ja": "架空の事例で、解読の深さと限界を確認。",
    "ko": "가상 사례로 살펴보는 해석의 깊이와 한계.",
    "hi": "एक काल्पनिक उदाहरण जो गहराई और सीमाएँ दिखाता है।",
    "th": "กรณีสมมติที่แสดงความลึกและขอบเขต",
    "id": "Kasus fiktif yang menunjukkan kedalaman dan batasan.",
    "vi": "Ví dụ hư cấu cho thấy độ sâu và ranh giới.",
    "fil": "Isang kathang-isip na kaso na nagpapakita ng lalim at hangganan."
  },
  "Almanac, today’s sky and colours, clearly grouped.": {
    "ja": "暦・今日の星空・色をわかりやすく。",
    "ko": "역서, 오늘의 하늘과 색상을 한눈에.",
    "hi": "पंचांग, आज का आकाश और रंग, साफ़ समूहों में।",
    "th": "รวมปฏิทิน ท้องฟ้าวันนี้ และสีไว้อย่างชัดเจน",
    "id": "Almanak, langit hari ini, dan warna, dikelompokkan jelas.",
    "vi": "Lịch, bầu trời hôm nay và màu sắc, phân nhóm rõ ràng.",
    "fil": "Kalendaryo, langit ngayon, at mga kulay na malinaw na nakapangkat."
  },
  "Open today’s almanac": {
    "ja": "今日の暦を見る",
    "ko": "오늘의 역서 보기",
    "hi": "आज का पंचांग खोलें",
    "th": "เปิดปฏิทินวันนี้",
    "id": "Buka almanak hari ini",
    "vi": "Mở lịch hôm nay",
    "fil": "Buksan ang kalendaryo ngayon"
  },
  "Dos and don’ts, solar terms and daily guidance": {
    "ja": "宜忌・節気・日々のヒント",
    "ko": "길흉, 절기와 일일 안내",
    "hi": "क्या करें, क्या न करें, सौर ऋतुबिंदु और दैनिक मार्गदर्शन",
    "th": "สิ่งควรทำและควรเลี่ยง สารท และคำแนะนำรายวัน",
    "id": "Anjuran, larangan, penanda musim, dan panduan harian",
    "vi": "Nên làm, nên tránh, tiết khí và hướng dẫn hằng ngày",
    "fil": "Mga dapat at hindi dapat gawin, solar term, at gabay araw-araw"
  },
  "Today’s sky & astrology": {
    "ja": "今日の星空と占星術",
    "ko": "오늘의 하늘과 점성술",
    "hi": "आज का आकाश और ज्योतिष",
    "th": "ท้องฟ้าและโหราศาสตร์วันนี้",
    "id": "Langit dan astrologi hari ini",
    "vi": "Bầu trời và chiêm tinh hôm nay",
    "fil": "Langit at astrolohiya ngayon"
  },
  "Sky events, weekly outlook and astrology in one tap": {
    "ja": "天文現象・今週の見通し・占星術へ",
    "ko": "천문 현상, 주간 전망과 점성술을 한 번에",
    "hi": "आकाशीय घटनाएँ, साप्ताहिक दृष्टि और ज्योतिष एक स्पर्श में",
    "th": "ปรากฏการณ์ท้องฟ้า แนวโน้มรายสัปดาห์ และโหราศาสตร์ในครั้งเดียว",
    "id": "Peristiwa langit, tinjauan mingguan, dan astrologi dalam satu ketukan",
    "vi": "Thiên tượng, dự báo tuần và chiêm tinh chỉ một chạm",
    "fil": "Mga pangyayari sa langit, lingguhang pananaw, at astrolohiya sa isang pindot"
  },
  "Colour of the day": {
    "ja": "今日の色",
    "ko": "오늘의 색",
    "hi": "आज का रंग",
    "th": "สีประจำวัน",
    "id": "Warna hari ini",
    "vi": "Màu của ngày",
    "fil": "Kulay ng araw"
  },
  "Which colour to wear today.": {
    "ja": "今日の装いに合う色。",
    "ko": "오늘 입기 좋은 색.",
    "hi": "आज किस रंग के कपड़े पहनें।",
    "th": "วันนี้ใส่สีอะไรดี",
    "id": "Warna yang dikenakan hari ini.",
    "vi": "Hôm nay mặc màu gì.",
    "fil": "Anong kulay ang isusuot ngayon."
  },
  "A few minutes to meet another side of you.": {
    "ja": "数分で、まだ知らない自分に出会う。",
    "ko": "몇 분 만에 만나는 나의 다른 모습.",
    "hi": "कुछ मिनटों में अपना एक और पहलू जानें।",
    "th": "ไม่กี่นาทีเพื่อรู้จักอีกด้านของคุณ",
    "id": "Beberapa menit untuk mengenal sisi lain diri Anda.",
    "vi": "Vài phút để gặp một khía cạnh khác của bạn.",
    "fil": "Ilang minuto para makilala ang ibang bahagi ng sarili."
  },
  "Find a clear brand voice": {
    "ja": "ブランドの声を明確に",
    "ko": "명확한 브랜드 목소리 찾기",
    "hi": "ब्रांड की स्पष्ट आवाज़ खोजें",
    "th": "ค้นหาน้ำเสียงแบรนด์ที่ชัดเจน",
    "id": "Temukan suara merek yang jelas",
    "vi": "Tìm tiếng nói thương hiệu rõ ràng",
    "fil": "Hanapin ang malinaw na tinig ng tatak"
  },
  "Free · no sign-in · begin in about 1 minute": {
    "ja": "無料 · 登録不要 · 約1分",
    "ko": "무료 · 가입 불필요 · 약 1분",
    "hi": "निःशुल्क · पंजीकरण नहीं · लगभग 1 मिनट",
    "th": "ฟรี · ไม่ต้องสมัคร · ประมาณ 1 นาที",
    "id": "Gratis · tanpa mendaftar · sekitar 1 menit",
    "vi": "Miễn phí · không cần đăng ký · khoảng 1 phút",
    "fil": "Libre · walang pagpaparehistro · humigit-kumulang 1 minuto"
  },
  "Free · no sign-in · about 1 minute": {
    "ja": "無料 · 登録不要 · 約1分",
    "ko": "무료 · 가입 불필요 · 약 1분",
    "hi": "निःशुल्क · पंजीकरण नहीं · लगभग 1 मिनट",
    "th": "ฟรี · ไม่ต้องสมัคร · ประมาณ 1 นาที",
    "id": "Gratis · tanpa mendaftar · sekitar 1 menit",
    "vi": "Miễn phí · không cần đăng ký · khoảng 1 phút",
    "fil": "Libre · walang pagpaparehistro · humigit-kumulang 1 minuto"
  },
  "Divine affinity quiz": {
    "ja": "神仏との縁テスト",
    "ko": "신불 인연 테스트",
    "hi": "दैवी जुड़ाव परीक्षण",
    "th": "แบบทดสอบสายสัมพันธ์กับเทพ",
    "id": "Tes Kedekatan Spiritual",
    "vi": "Trắc nghiệm duyên với thần Phật",
    "fil": "Pagsusulit ng Espirituwal na Ugnayan"
  },
  "Cultivation destiny": {
    "ja": "修仙の資質テスト",
    "ko": "수선 자질 테스트",
    "hi": "साधना प्रवृत्ति परीक्षण",
    "th": "แบบทดสอบเส้นทางบำเพ็ญเพียร",
    "id": "Profil Jalan Kultivasi",
    "vi": "Hồ sơ căn cơ tu luyện",
    "fil": "Tala ng Landas ng Pagsasanay"
  },
  "Brand archetypes": {
    "ja": "ブランドの12原型",
    "ko": "브랜드 12원형",
    "hi": "ब्रांड के बारह आदिरूप",
    "th": "ต้นแบบแบรนด์สิบสองแบบ",
    "id": "Dua Belas Arketipe Merek",
    "vi": "Mười hai hình mẫu thương hiệu",
    "fil": "Labindalawang Arketipo ng Tatak"
  },
  "Earth Online": {
    "ja": "地球オンライン · 古典ガイド",
    "ko": "지구 온라인 · 고전 길잡이",
    "hi": "पृथ्वी ऑनलाइन · शास्त्रीय ग्रंथ मार्गदर्शिका",
    "th": "โลกออนไลน์ · คู่มือคัมภีร์",
    "id": "Bumi Online · Panduan Klasik",
    "vi": "Trái Đất trực tuyến · Hướng dẫn kinh điển",
    "fil": "Daigdig Online · Gabay sa mga Klasiko"
  },
  "Inner animal": {
    "ja": "内なる動物 × 守護獣",
    "ko": "내면 동물 × 수호 동물",
    "hi": "भीतरी पशु-प्रतीक × संरक्षक प्राणी",
    "th": "สัตว์ภายใน × สัตว์ผู้พิทักษ์",
    "id": "Hewan Batin × Hewan Pelindung",
    "vi": "Con vật nội tâm × Linh thú hộ mệnh",
    "fil": "Panloob na Hayop × Tagapagbantay"
  },
  "Five-element function quiz": {
    "ja": "五行の機能テスト",
    "ko": "오행 기능 테스트",
    "hi": "पंचतत्व कार्य परीक्षण",
    "th": "แบบทดสอบหน้าที่ห้าธาตุ",
    "id": "Tes Fungsi Lima Unsur",
    "vi": "Trắc nghiệm chức năng ngũ hành",
    "fil": "Pagsusulit ng Gawain ng Limang Elemento"
  },
  "Six habits quiz": {
    "ja": "六道の習慣テスト",
    "ko": "육도 습관 테스트",
    "hi": "छह लोकों का आदत परीक्षण",
    "th": "แบบทดสอบนิสัยหกภูมิ",
    "id": "Tes Kebiasaan Enam Alam",
    "vi": "Trắc nghiệm tập khí lục đạo",
    "fil": "Pagsusulit ng Gawi sa Anim na Daigdig"
  },
  "Strength overuse quiz": {
    "ja": "五行の強みの使いすぎテスト",
    "ko": "오행 강점 과용 테스트",
    "hi": "पंचतत्व शक्तियों के अति-प्रयोग का परीक्षण",
    "th": "แบบทดสอบการใช้จุดแข็งห้าธาตุมากเกินไป",
    "id": "Tes Penggunaan Berlebih Lima Unsur",
    "vi": "Trắc nghiệm lạm dụng thế mạnh ngũ hành",
    "fil": "Pagsusulit ng Labis na Paggamit ng Limang Elemento"
  },
  "Scent map": {
    "ja": "五行の香りマップ",
    "ko": "오행 향기 지도",
    "hi": "पंचतत्व सुगंध मानचित्र",
    "th": "แผนที่กลิ่นห้าธาตุ",
    "id": "Peta Aroma Lima Unsur",
    "vi": "Bản đồ hương ngũ hành",
    "fil": "Mapa ng Amoy at Limang Elemento"
  },
  "Scent preferences and their cultural meaning": {
    "ja": "香りの好みと五行の象徴",
    "ko": "향기 취향과 오행의 상징",
    "hi": "सुगंध की पसंद और पंचतत्व के प्रतीक",
    "th": "ความชอบด้านกลิ่นกับสัญลักษณ์ห้าธาตุ",
    "id": "Preferensi indra dan simbolisme lima unsur",
    "vi": "Sở thích mùi hương và biểu tượng ngũ hành",
    "fil": "Hilig sa amoy at simbolismo ng limang elemento"
  },
  "16 questions — which sacred figure feels closest": {
    "ja": "16問で魂の傾向と象徴的な使命を探る",
    "ko": "16문항으로 영혼의 성향과 상징적 소명 탐색",
    "hi": "16 प्रश्नों से आत्म-प्रवृत्ति और प्रतीकात्मक उद्देश्य समझें",
    "th": "16 คำถามสำรวจลักษณะจิตใจและภารกิจเชิงสัญลักษณ์",
    "id": "16 pertanyaan tentang pola jiwa dan panggilan simbolis",
    "vi": "16 câu hỏi về khuynh hướng tâm hồn và sứ mệnh biểu tượng",
    "fil": "16 na tanong tungkol sa hilig ng kaluluwa at simbolikong layunin"
  },
  "Your spirit root, sect and path": {
    "ja": "霊根・門派・道筋と個人用9:16画像",
    "ko": "영근, 문파, 수련의 길과 개인 9:16 이미지",
    "hi": "साधना की जड़ें, परंपरा, मार्ग और निजी 9:16 चित्र",
    "th": "รากวิญญาณ สำนัก เส้นทาง และภาพส่วนตัว 9:16",
    "id": "Akar spiritual, aliran, jalan, dan gambar pribadi 9:16",
    "vi": "Linh căn, môn phái, đạo lộ và ảnh cá nhân 9:16",
    "fil": "Ugat ng espiritu, pangkat, landas, at personal na larawang 9:16"
  },
  "Twelve brand scenarios, primary and supporting archetypes": {
    "ja": "12の場面からブランドの主原型と補助原型を探る",
    "ko": "12가지 브랜드 상황으로 주원형과 보조 원형 탐색",
    "hi": "ब्रांड की 12 स्थितियों से मुख्य और सहायक आदिरूप जानें",
    "th": "12 สถานการณ์ค้นหาต้นแบบหลักและรองของแบรนด์",
    "id": "12 situasi merek mengungkap arketipe utama dan pendukung",
    "vi": "12 tình huống thương hiệu giúp tìm hình mẫu chính và phụ",
    "fil": "12 sitwasyon ng tatak upang tuklasin ang pangunahing at pantulong na arketipo"
  },
  "The instincts you lean on most": {
    "ja": "今の行動傾向と本能的な反応",
    "ko": "현재의 성격 전략과 본능적 반응",
    "hi": "वर्तमान व्यवहार शैली और सहज प्रतिक्रिया",
    "th": "แนวทางบุคลิกและการตอบสนองตามสัญชาตญาณ",
    "id": "Strategi kepribadian saat ini dan respons naluriah",
    "vi": "Chiến lược tính cách và phản ứng bản năng hiện tại",
    "fil": "Kasalukuyang paraan ng pagkilos at likas na tugon"
  },
  "Which function you most want to build": {
    "ja": "今、伸ばしたい働きを知る",
    "ko": "지금 강화하고 싶은 기능",
    "hi": "अभी किस कार्यक्षमता को मजबूत करना चाहते हैं",
    "th": "หน้าที่ด้านใดที่คุณอยากเสริมตอนนี้",
    "id": "Fungsi yang ingin Anda perkuat saat ini",
    "vi": "Chức năng bạn muốn củng cố lúc này",
    "fil": "Aling kakayahan ang nais mong palakasin ngayon"
  },
  "Your most visible everyday habit": {
    "ja": "今、最も強い日常の習慣を知る",
    "ko": "지금 가장 강한 일상 습관",
    "hi": "अभी कौन-सी रोज़मर्रा की आदत सबसे प्रबल है",
    "th": "นิสัยประจำวันใดเด่นที่สุดในตอนนี้",
    "id": "Pola kebiasaan harian yang paling kuat saat ini",
    "vi": "Thói quen hằng ngày nào nổi bật nhất lúc này",
    "fil": "Aling pang-araw-araw na gawi ang pinakamalakas ngayon"
  },
  "10 scenes — which strength you overuse": {
    "ja": "日常の10場面から、使いすぎて摩擦になる強みを探る",
    "ko": "10가지 일상 상황으로 마찰을 부르는 강점 과용 탐색",
    "hi": "रोज़मर्रा की 10 स्थितियाँ: किस खूबी का अति-प्रयोग तनाव बढ़ाता है",
    "th": "10 สถานการณ์: จุดแข็งใดที่ใช้เกินจนเกิดความขัดแย้ง",
    "id": "10 situasi harian: kekuatan mana yang berlebihan hingga menimbulkan gesekan",
    "vi": "10 tình huống: thế mạnh nào bị lạm dụng gây mâu thuẫn",
    "fil": "10 sitwasyon: aling kalakasan ang nasosobrahan at nagdudulot ng alitan"
  },
  "8 questions on where you are stuck": {
    "ja": "8問で今の行き詰まりに合う中国古典を探す",
    "ko": "8문항으로 지금의 막힘에 맞는 중국 고전 찾기",
    "hi": "8 प्रश्नों से अपनी उलझन के लिए चीनी शास्त्रीय ग्रंथ खोजें",
    "th": "8 คำถามเพื่อเลือกคัมภีร์จีนที่เข้ากับจุดติดขัดของคุณ",
    "id": "8 pertanyaan untuk mencocokkan kebuntuan dengan karya klasik Tiongkok",
    "vi": "8 câu hỏi để tìm sách cổ Trung Hoa phù hợp với vướng mắc hiện tại",
    "fil": "8 tanong para itugma ang iyong suliranin sa isang klasikong akdang Tsino"
  },
  "Today Guide": {
    "ja": "今日のガイド",
    "ko": "오늘의 안내",
    "hi": "आज की मार्गदर्शिका",
    "th": "คำแนะนำวันนี้",
    "id": "Panduan hari ini",
    "vi": "Hướng dẫn hôm nay",
    "fil": "Gabay ngayong araw"
  },
  "Local time · weather · almanac rhythm": {
    "ja": "現地時刻 · 天気 · 暦の流れ",
    "ko": "현지 시간 · 날씨 · 역서의 흐름",
    "hi": "स्थानीय समय · मौसम · पंचांग की लय",
    "th": "เวลาท้องถิ่น · อากาศ · จังหวะปฏิทิน",
    "id": "Waktu setempat · cuaca · ritme almanak",
    "vi": "Giờ địa phương · thời tiết · nhịp lịch",
    "fil": "Lokal na oras · panahon · ritmo ng kalendaryo"
  },
  "Daily Almanac": {
    "ja": "今日の暦",
    "ko": "오늘의 역서",
    "hi": "दैनिक पंचांग",
    "th": "ปฏิทินประจำวัน",
    "id": "Almanak harian",
    "vi": "Lịch hằng ngày",
    "fil": "Pang-araw-araw na kalendaryo"
  },
  "Daily Dress · Five Elements": {
    "ja": "毎日の装い · 五行",
    "ko": "오늘의 옷차림 · 오행",
    "hi": "दैनिक पहनावा · पंचतत्व",
    "th": "แต่งกายประจำวัน · ห้าธาตุ",
    "id": "Busana Harian · Lima Unsur",
    "vi": "Trang phục hằng ngày · Ngũ hành",
    "fil": "Pananamit araw-araw · Limang elemento"
  },
  "Daily Spirit Slip": {
    "ja": "今日のおみくじ",
    "ko": "오늘의 운세 제비",
    "hi": "दैनिक प्रतीकात्मक पर्ची",
    "th": "เซียมซีประจำวัน",
    "id": "Undian simbolis harian",
    "vi": "Quẻ biểu tượng hằng ngày",
    "fil": "Simbolikong bunot ng araw"
  },
  "Location & weather": {
    "ja": "所在地と天気",
    "ko": "위치와 날씨",
    "hi": "स्थान और मौसम",
    "th": "ตำแหน่งและอากาศ",
    "id": "Lokasi dan cuaca",
    "vi": "Vị trí và thời tiết",
    "fil": "Lokasyon at panahon"
  },
  "Sacred day": {
    "ja": "聖日",
    "ko": "성일",
    "hi": "पावन दिन",
    "th": "วันสำคัญทางศาสนา",
    "id": "Hari suci",
    "vi": "Ngày lễ thiêng",
    "fil": "Banal na araw"
  },
  "Stems & branches": {
    "ja": "干支",
    "ko": "간지",
    "hi": "तने और शाखाएँ",
    "th": "ก้านฟ้าและกิ่งดิน",
    "id": "Batang dan cabang",
    "vi": "Can chi",
    "fil": "Mga tangkay at sanga"
  },
  "Core dynamic": {
    "ja": "中心となる流れ",
    "ko": "핵심 흐름",
    "hi": "मुख्य प्रवाह",
    "th": "พลวัตหลัก",
    "id": "Dinamika inti",
    "vi": "Động lực cốt lõi",
    "fil": "Pangunahing daloy"
  },
  "Good for": {
    "ja": "向いていること",
    "ko": "하기 좋은 일",
    "hi": "अनुकूल कार्य",
    "th": "เหมาะกับ",
    "id": "Baik untuk",
    "vi": "Nên làm",
    "fil": "Angkop sa"
  },
  "Avoid": {
    "ja": "避けたいこと",
    "ko": "피할 일",
    "hi": "बचें",
    "th": "ควรเลี่ยง",
    "id": "Hindari",
    "vi": "Nên tránh",
    "fil": "Iwasan"
  },
  "Combine · clash · penalty": {
    "ja": "合・冲・刑",
    "ko": "합 · 충 · 형",
    "hi": "मेल · टकराव · दंड-संबंध",
    "th": "ประสาน · ปะทะ · ลงทัณฑ์",
    "id": "Gabungan · benturan · hukuman",
    "vi": "Hợp · xung · hình",
    "fil": "Pagsasama · banggaan · ugnayang parusa"
  },
  "Supportive hours": {
    "ja": "追い風の時間",
    "ko": "도움이 되는 시간",
    "hi": "सहायक समय",
    "th": "เวลาส่งเสริม",
    "id": "Waktu yang mendukung",
    "vi": "Giờ thuận lợi",
    "fil": "Mga oras na nakatutulong"
  },
  "Caution hours": {
    "ja": "注意したい時間",
    "ko": "주의할 시간",
    "hi": "सावधानी का समय",
    "th": "เวลาที่ควรระวัง",
    "id": "Waktu untuk berhati-hati",
    "vi": "Giờ cần thận trọng",
    "fil": "Mga oras na mag-ingat"
  },
  "Colours": {
    "ja": "色",
    "ko": "색상",
    "hi": "रंग",
    "th": "สี",
    "id": "Warna",
    "vi": "Màu sắc",
    "fil": "Mga kulay"
  },
  "Jewellery": {
    "ja": "装身具",
    "ko": "장신구",
    "hi": "आभूषण",
    "th": "เครื่องประดับ",
    "id": "Perhiasan",
    "vi": "Trang sức",
    "fil": "Alahas"
  },
  "Persona mask": {
    "ja": "ペルソナの仮面",
    "ko": "페르소나 가면",
    "hi": "व्यक्तित्व का मुखौटा",
    "th": "หน้ากากบุคลิก",
    "id": "Topeng persona",
    "vi": "Mặt nạ tính cách",
    "fil": "Maskara ng pagkatao"
  },
  "Open today guide": {
    "ja": "今日のガイドを開く",
    "ko": "오늘의 안내 열기",
    "hi": "आज की मार्गदर्शिका खोलें",
    "th": "เปิดคำแนะนำวันนี้",
    "id": "Buka panduan hari ini",
    "vi": "Mở hướng dẫn hôm nay",
    "fil": "Buksan ang gabay ngayong araw"
  }
} as const satisfies Record<string, Record<"ja" | "ko" | "hi" | "th" | "id" | "vi" | "fil", string>>;

export function translateCustomerChrome(language: DisplayLanguage, english: string): string {
  if (language === "zh-Hant" || language === "zh-Hans" || language === "en") return english;
  return CUSTOMER_CHROME[english as keyof typeof CUSTOMER_CHROME]?.[language] ?? english;
}

export function customerChrome(hant: string, hans: string, english: string): string {
  const language = useDisplayLanguage.getState().language;
  if (language === "zh-Hant") return hant;
  if (language === "zh-Hans") return hans;
  return translateCustomerChrome(language, english);
}

/** Translate only UI data, preserving hrefs, functions and article content. */
export function translateChromeObject<T>(language: DisplayLanguage, value: T): T {
  if (typeof value === "string") return translateCustomerChrome(language, value) as T;
  if (Array.isArray(value)) return value.map((item) => translateChromeObject(language, item)) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, translateChromeObject(language, item)])) as T;
  return value;
}
