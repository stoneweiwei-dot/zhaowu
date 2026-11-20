import type { InstructionRule } from './instruction-database-base-legacy';

export const OWNER_FIVE_ELEMENT_COGNITION_SOURCE = {
  id: 'OWNER-FIVE-ELEMENT-COGNITION-2026-09-27',
  title: '五行認知／十干性格梗／四庫速查（站主截圖材料）',
  provenance: 'OWNER_MATERIAL',
  authority: 'symbolic-training-only',
  receivedAt: '2026-09-27',
} as const;

export const FIVE_ELEMENT_FIVE_CONSTANTS = {
  metal: { element: '金', virtue: '義', function: ['取捨', '決斷', '邊界', '標準'] },
  wood: { element: '木', virtue: '仁', function: ['生長', '主見', '活力', '疏通'] },
  water: { element: '水', virtue: '智', function: ['智慧', '流動', '變通', '溝通'] },
  fire: { element: '火', virtue: '禮', function: ['禮貌', '熱情', '行動', '表達'] },
  earth: { element: '土', virtue: '信', function: ['信用', '誠信', '穩重', '包容'] },
} as const;

export const PUBLISHED_FIVE_ELEMENT_ABSENCE_EPISODES = {
  wood: {
    episode: 'EP01',
    status: 'published',
    element: '木',
    absenceStems: ['甲', '乙'],
    absenceBranches: ['寅', '卯'],
    virtue: '仁',
    overview: ['生發', '條達', '曲直'],
    traditionalCorrespondence: ['肝膽', '筋骨', '毛髮'],
    direction: '東方',
    colors: ['青', '綠'],
    sourceTendencies: ['剛硬', '直接', '缺乏迂迴', '執行力強', '計劃偏弱', '共情偏少'],
    favorableExamples: ['若木本非所喜，缺木未必是壞事', '若土重而主鏈確實喜木，缺木才可能成為明顯功能缺口'],
    symbolicPractice: ['綠色', '植物', '木質物', '接近溫和包容的人'],
  },
  fire: {
    episode: 'EP02',
    status: 'published',
    element: '火',
    absenceStems: ['丙', '丁'],
    absenceBranches: ['巳', '午'],
    virtue: '禮',
    overview: ['熱情', '行動', '表現', '溫暖'],
    traditionalCorrespondence: ['心', '血液', '視力'],
    direction: '南方',
    colors: ['紅', '橙', '紫'],
    sourceTendencies: ['冷靜理性', '不喜焦點', '情緒較穩', '耐心較強', '偏技術或幕後'],
    favorableExamples: ['冬生或金水偏重時，火的功能缺口可能更值得留意', '夏生或火土已旺時，缺火反而未必是問題'],
    symbolicPractice: ['紅橙紫', '曬太陽', '主動表達', '接近開朗的人'],
  },
  earth: { episode: null, status: 'unpublished', element: '土' },
  metal: { episode: null, status: 'unpublished', element: '金' },
  water: { episode: null, status: 'unpublished', element: '水' },
} as const;

export const TEN_STEM_SOCIAL_SHORTHAND = {
  甲: '道理我都懂，但我就是不改。',
  乙: '什麼都看得出來，就是不肯直說。',
  丙: '情緒一上來，全世界都得聽。',
  丁: '嘴上說沒事，心裡記到下輩子再算。',
  戊: '有意見可以提，但是改不了。',
  己: '太在意別人的看法，最後誰都不滿意。',
  庚: '一句話不合適，直接走人。',
  辛: '表面很精緻，內心已經劃爛一切。',
  壬: '你說得都對，我也有想法。',
  癸: '平時安安靜靜；一爆發是真的，爆完又容易自責。',
} as const;

export const FOUR_TOMB_OWNER_CHEATSHEET = {
  辰: { identity: '水庫', climate: '濕土', hidden: ['戊', '乙', '癸'] },
  丑: { identity: '金庫', climate: '濕寒土', hidden: ['己', '癸', '辛'] },
  未: { identity: '木庫', climate: '燥土', hidden: ['己', '丁', '乙'] },
  戌: { identity: '火庫', climate: '燥土', hidden: ['戊', '辛', '丁'] },
} as const;

export const ownerFiveElementCognitionInstructionRule: InstructionRule = {
  id: 'ZW-OWNER-FIVE-ELEMENT-COGNITION-1.0',
  title: '五行五常／十干性格梗／四庫速查低權重協議',
  status: 'production',
  layer: 'training',
  priority: 27,
  purpose: '把站主提供的五行認知、十干性格梗與四庫速查納入昭梧教學與趣味內容，同時禁止它們越權成為正式命理主判。',
  rules: [
    '五行五常只作文化象義：金可取義與取捨／邊界，木可取仁與生長／主見，水可取智與流動／變通，火可取禮與表達／熱情，土可取信與承載／穩重。',
    '「缺金、缺木、缺水、缺火、缺土」不得按字面缺失直接推人格；只有 CURRENT 主鏈已確認某功能不足時，才可把相關五行詞彙翻成行動訓練語言。',
    '「金／木／水／火／土過旺」也不得由元素數量直接推出性格缺陷；只有結構、十神、位置、制化、病藥、流通與承載共同支持時，才可描述為功能過度。',
    '十干性格梗保留為 social shorthand／趣味文案，可用在社交內容、輕測驗或漫畫翻譯；正式報告不得以單一日干或單一天干直接定人格。',
    '四庫速查採：辰水庫濕土、丑金庫濕寒土、未木庫燥土、戌火庫燥土；藏干以 deterministic calendar 資料為準，速查只作教學標籤，不改動排盤。',
    '四庫「旺為庫、衰為墓」仍以被收納五行在全局／歲運中的狀態為主詞，不是日主強弱；沖庫也只表示可能引動，結果仍由喜忌、病藥、ODL、FC、承載與歲運鏈決定。',
    '材料中的「住所變動、事業轉折、感情糾纏、家庭變動、沖開得用／放禍」只可作候選場景；沒有宮位、十神、原局種子與歲運證據時不得輸出成事件。',
    '五行缺象系列目前只收 EP01 木、EP02 火；土、金、水未發布，正式報告不得自行補寫或類推成作者原意。',
    'EP01／EP02 的「無木／無火」只按作者明示的甲乙寅卯／丙丁巳午可見字面判斷；時辰未知時不得斷言整局確定缺該元素。',
    'EP01／EP02 的性格、事業與補法只能作來源側寫／象義練習；是否為喜忌上的真缺仍交回 CURRENT 主鏈，不得用缺象反推喜用。',
  ],
  guards: [
    '禁止五行缺失＝人格缺陷。',
    '禁止五行過旺＝固定壞性格。',
    '禁止十干一句話梗直接進正式人物判定。',
    '禁止「四庫＝財庫」、開庫必發財、沖庫必凶或沖庫必開。',
    '禁止把 OWNER_MATERIAL 說成古籍原文、科學定律或已被實證驗證。',
    '禁止自行生成尚未發布的土／金／水 EP03–EP05 內容。',
    '禁止把肝膽、心血、視力等傳統對應寫成醫療診斷或治療建議。',
  ],
  outputContract: [
    '教學／趣味輸出可用「象義 → 現實功能 → 過度／不足的條件式表現 → 可執行調整」；正式命理回答仍由 CURRENT 主鏈先下結論。',
    '若使用十干性格梗，明確標示為趣味化翻譯，不當作人格事實。',
  ],
};
