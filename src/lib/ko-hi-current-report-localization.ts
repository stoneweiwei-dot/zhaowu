import type { KoHiLanguage } from "@/lib/ko-hi-localization";

type Table = Record<string, string>;

const KO: Table = {
  "STEP 1 · BIRTH RECORD": "1단계 · 출생 정보",
  "Your birth details": "출생 정보",
  "Saved on this phone so you do not need an account before asking a question.": "질문하기 전에 계정을 만들 필요 없이 이 휴대폰에 출생 정보를 저장합니다.",
  "Birth record ready": "출생 정보 준비 완료",
  "This phone will reuse the same record across personal readings.": "이 휴대폰의 같은 출생 정보를 모든 개인 분석에서 다시 사용합니다.",
  "Continue to your question": "질문으로 계속",
  "Birth record saved on this phone.": "출생 정보가 이 휴대폰에 저장되었습니다.",
  "STEP 2 · YOUR QUESTION": "2단계 · 질문",
  "What do you actually want answered?": "지금 실제로 답을 받고 싶은 질문은 무엇인가요?",
  "Ask one real question in your own words. The answer will lead with the conclusion and only show evidence that helps answer it.": "자신의 말로 실제 질문 하나를 적으세요. 먼저 결론을 제시하고, 답에 필요한 근거만 보여줍니다.",
  "For example: Should I stay in this job or leave? What changes most over the next six months?": "예: 이 일을 계속해야 할까요, 떠나야 할까요? 앞으로 6개월 동안 가장 크게 바뀌는 것은 무엇인가요?",
  "Direct answer": "직접 답변",
  "Relevant evidence": "관련 근거",
  "Practical next step": "현실적인 다음 단계",
  "Analyse this question": "이 질문 분석하기",
  "Best next step": "가장 먼저 할 일",
  "View chart evidence": "명식 근거 보기",
  "Technical chart detail stays secondary. Read the answer first, then expand this only if useful.": "기술적인 명식 세부 내용은 두 번째입니다. 먼저 답을 읽고, 필요할 때만 펼쳐보세요.",
  "Reading note": "해석 메모",
  "View full analysis": "전체 분석 보기",
  "Preparing your full analysis…": "전체 분석 정리 중…",
  "Your full analysis": "전체 분석",
  "Your actual question first, then the reasons, risks, timing and next move.": "실제 질문에 먼저 답한 뒤 이유, 위험, 시기와 다음 행동을 봅니다.",
  "ZHAOWU · PERSONAL ANALYSIS": "ZHAOWU · 개인 분석",
  "YOUR QUESTION": "질문",
  "What you asked": "이번 질문",
  "The answer first": "먼저 답부터",
  "Reading confidence": "판단 신뢰도",
  "Biggest variable": "가장 큰 변수",
  "Why": "이유",
  "What to watch": "주의할 점",
  "When": "시기",
  "What to do now": "지금 할 일",
  "Chart basics": "명식 기초",
  "The chart is the evidence base, not the opening speech. Read the answer first, then expand the technical detail if useful.": "명식은 판단의 근거이지 첫 문장이 아닙니다. 답을 먼저 읽고 필요할 때만 기술 내용을 펼쳐보세요.",
  "Current long cycle": "현재 대운",
  "Birth time unconfirmed": "출생 시간 미확인",
  "Full explanation": "전체 설명",
  "Only question-relevant supporting detail is kept here, without repeating the opening answer.": "첫 답을 반복하지 않고 이번 질문에 필요한 보충 내용만 남깁니다.",
  "How time was read": "시간 계산 방식",
};

const HI: Table = {
  "STEP 1 · BIRTH RECORD": "चरण 1 · जन्म-जानकारी",
  "Your birth details": "आपकी जन्म-जानकारी",
  "Saved on this phone so you do not need an account before asking a question.": "प्रश्न पूछने से पहले खाता बनाने की जरूरत नहीं; जन्म-जानकारी इसी फ़ोन पर सहेजी जाती है।",
  "Birth record ready": "जन्म-जानकारी तैयार",
  "This phone will reuse the same record across personal readings.": "यही फ़ोन सभी व्यक्तिगत विश्लेषण में इसी जन्म-जानकारी का दोबारा उपयोग करेगा।",
  "Continue to your question": "अपने प्रश्न पर जाएँ",
  "Birth record saved on this phone.": "जन्म-जानकारी इस फ़ोन पर सहेजी गई।",
  "STEP 2 · YOUR QUESTION": "चरण 2 · आपका प्रश्न",
  "What do you actually want answered?": "आप वास्तव में किस प्रश्न का उत्तर चाहते हैं?",
  "Ask one real question in your own words. The answer will lead with the conclusion and only show evidence that helps answer it.": "अपने शब्दों में एक वास्तविक प्रश्न लिखें। उत्तर पहले निष्कर्ष देगा और केवल वही आधार दिखाएगा जो प्रश्न के लिए उपयोगी है।",
  "For example: Should I stay in this job or leave? What changes most over the next six months?": "उदाहरण: क्या मुझे इस नौकरी में रहना चाहिए या छोड़ना चाहिए? अगले छह महीनों में सबसे बड़ा बदलाव क्या होगा?",
  "Direct answer": "सीधा उत्तर",
  "Relevant evidence": "संबंधित आधार",
  "Practical next step": "व्यावहारिक अगला कदम",
  "Analyse this question": "इस प्रश्न का विश्लेषण करें",
  "Best next step": "सबसे उपयोगी अगला कदम",
  "View chart evidence": "कुंडली का आधार देखें",
  "Technical chart detail stays secondary. Read the answer first, then expand this only if useful.": "तकनीकी कुंडली विवरण दूसरे स्तर पर है। पहले उत्तर पढ़ें और जरूरत हो तभी इसे खोलें।",
  "Reading note": "विश्लेषण नोट",
  "View full analysis": "पूरा विश्लेषण देखें",
  "Preparing your full analysis…": "पूरा विश्लेषण तैयार किया जा रहा है…",
  "Your full analysis": "आपका पूरा विश्लेषण",
  "Your actual question first, then the reasons, risks, timing and next move.": "पहले आपके वास्तविक प्रश्न का उत्तर, फिर कारण, जोखिम, समय और अगला कदम।",
  "ZHAOWU · PERSONAL ANALYSIS": "ZHAOWU · व्यक्तिगत विश्लेषण",
  "YOUR QUESTION": "आपका प्रश्न",
  "What you asked": "आपने क्या पूछा",
  "The answer first": "पहले उत्तर",
  "Reading confidence": "निर्णय का भरोसा",
  "Biggest variable": "सबसे बड़ा बदलने वाला कारक",
  "Why": "क्यों",
  "What to watch": "किस बात पर ध्यान दें",
  "When": "कब",
  "What to do now": "अभी क्या करें",
  "Chart basics": "कुंडली का आधार",
  "The chart is the evidence base, not the opening speech. Read the answer first, then expand the technical detail if useful.": "कुंडली निर्णय का आधार है, शुरुआती भाषण नहीं। पहले उत्तर पढ़ें, फिर जरूरत होने पर तकनीकी विवरण खोलें।",
  "Current long cycle": "वर्तमान दीर्घ चक्र",
  "Birth time unconfirmed": "जन्म समय अपुष्ट",
  "Full explanation": "पूरा विवरण",
  "Only question-relevant supporting detail is kept here, without repeating the opening answer.": "शुरुआती उत्तर दोहराए बिना केवल इस प्रश्न से जुड़ी सहायक जानकारी यहाँ रखी जाती है।",
  "How time was read": "समय कैसे पढ़ा गया",
};

function preserveSpace(original: string, translated: string) {
  const leading = original.match(/^\s*/)?.[0] ?? "";
  const trailing = original.match(/\s*$/)?.[0] ?? "";
  return `${leading}${translated}${trailing}`;
}

export function translateKoHiCurrentReportText(value: string, language: KoHiLanguage): string {
  if (!value.trim()) return value;
  const core = value.trim();
  const table = language === "ko" ? KO : HI;
  const exact = table[core];
  if (exact) return preserveSpace(value, exact);

  let next = core;
  for (const [english, translated] of Object.entries(table).sort((a, b) => b[0].length - a[0].length)) {
    if (english.length < 5 || !next.includes(english)) continue;
    next = next.split(english).join(translated);
  }
  return preserveSpace(value, next);
}
