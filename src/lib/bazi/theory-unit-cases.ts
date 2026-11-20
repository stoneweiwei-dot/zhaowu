export const THEORY_UNIT_CASE_VERSION = '0.1' as const;

export const THEORY_UNIT_CASE_SOURCE = {
  title: '易經智慧盲派理論',
  provenance: 'OWNER_MATERIAL',
  role: 'regression-only',
  note: '只作理論單元測試與條件性規則補充，不升格為古籍權威，也不取代 R6.2.2 子平主鏈。',
} as const;

export type TheoryUnitCase = {
  id: string;
  name: string;
  sourcePages: readonly number[];
  setup: readonly string[];
  expected: readonly string[];
  failIf: readonly string[];
};

export const THEORY_UNIT_CASES: readonly TheoryUnitCase[] = [
  {
    id: 'TUC-01',
    name: '宮位優先',
    sourcePages: [3, 4, 5, 16],
    setup: ['同一十神落在不同宮位。'],
    expected: ['先由宮位定事件領域，再以十神描述該領域中的功能。'],
    failIf: ['把同一十神直接合併成單一事件或單純以數量判吉凶。'],
  },
  {
    id: 'TUC-02',
    name: '虛實與根氣',
    sourcePages: [8],
    setup: ['A 十神有根有力；B 十神透而無根且受制。'],
    expected: ['A 可進入有效作用；B 只能降級為虛或有條件可用。'],
    failIf: ['只因十神出現就給 A、B 同等權重。'],
  },
  {
    id: 'TUC-03',
    name: '賓主與體用',
    sourcePages: [6, 7],
    setup: ['外部資源為賓；命主自身結構為主／體。'],
    expected: ['外物需與主體建立有效作用且可承載，才可轉為可用資源。'],
    failIf: ['把所有財官或外部資源自動判為命主所得。'],
  },
  {
    id: 'TUC-04',
    name: '合來／合絆／合閉',
    sourcePages: [13],
    setup: ['同為相合，但分別造成引入、滯留、閉塞。'],
    expected: ['先辨合的功能結果，再判吉凶與做功。'],
    failIf: ['見合即吉、見合即得、見合即化。'],
  },
  {
    id: 'TUC-05',
    name: '沖庫真假',
    sourcePages: [14],
    setup: ['同樣沖庫，一例沖後可用，一例沖後破壞原結構。'],
    expected: ['先看庫中所藏、歸主與沖後功能，再判是否有效。'],
    failIf: ['逢沖必開庫、沖庫必發。'],
  },
  {
    id: 'TUC-06',
    name: '婚姻宮星歲運鏈',
    sourcePages: [18],
    setup: ['配偶星存在，配偶宮受作用，大運先動，流年再觸發。'],
    expected: ['宮位、關係、歲運至少形成同向鏈才提高事件判斷。'],
    failIf: ['見財／官直接斷婚期。'],
  },
  {
    id: 'TUC-07',
    name: '遷移與職業變動',
    sourcePages: [20],
    setup: ['遠方、住宅、單位三種場域中只有部分被歲運引動。'],
    expected: ['先辨被觸發的場域；證據不足時保留合理推論或 UNKNOWN。'],
    failIf: ['見動象即固定斷搬家或換工作。'],
  },
  {
    id: 'TUC-08',
    name: '傷病災三級觸發',
    sourcePages: [21, 22],
    setup: ['原局有象，大運加重，流年再觸發。'],
    expected: ['只在原局→大運→流年鏈成立時提高風險窗口；不作醫療診斷。'],
    failIf: ['原局單一刑沖或流年單點直接斷疾病／災禍。'],
  },
  {
    id: 'TUC-09',
    name: '無原局種子不得硬斷',
    sourcePages: [24],
    setup: ['原局與大運都缺少某重大事件基礎，只有流年一次強作用。'],
    expected: ['降級為短期波動／歲運觸發，不作重大事件確斷。'],
    failIf: ['只有流年單點就斷離婚、破產等重大事件。'],
  },
  {
    id: 'TUC-10',
    name: '反過度確定',
    sourcePages: [1, 24, 25],
    setup: ['主判鏈部分同向，但存在同級反證，且無 A/B 級驗證。'],
    expected: ['最高為較高概率或合理推論；保留反證。'],
    failIf: ['為了完整感硬升級為確定結構。'],
  },
  {
    id: 'TUC-11',
    name: '十神與宮位衝突',
    sourcePages: [3, 4, 16, 19],
    setup: ['財星落在關係宮位，財的功能與宮位領域可能不同。'],
    expected: ['宮位先定領域，十神再描述功能；財不自動等於金錢事件。'],
    failIf: ['看到財星就直接判發財。'],
  },
  {
    id: 'TUC-12',
    name: '做功效率高於字面吉凶',
    sourcePages: [9, 12, 16, 19],
    setup: ['A 名義上偏吉但無根無路；B 壓力性十神有根有制且形成有效作用。'],
    expected: ['優先採用真實做功鏈，不按十神名稱預設吉凶。'],
    failIf: ['只因十神名稱好聽就提高結論權重。'],
  },
] as const;
