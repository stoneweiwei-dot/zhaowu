# 昭梧｜Parashari Jyotish 通用運算與報告規範 v1.1

狀態：`ACTIVE INTERPRETATION CONTRACT / D1 CALCULATION NOT YET VERIFIED`

範圍：`/indian-astrology` 及日後印度占星專項的計算、知識展示與報告生成。使用者提供的「Parashari Jyotish 通用規則」屬 `OWNER_MATERIAL`，是需求來源，不等於古籍逐字引文、天文計算證據或科學實證。不得照抄其中未經核實的死亡、疾病或父母業力斷言。

上位約束：`AGENTS.md` → `docs/CURRENT-STATE.md` → `docs/INSTRUCTION-REGISTRY.md` → `docs/STONE-R6.2.2-CURRENT-MASTER.md` → `docs/VEDIC-INTERPRETATION-PROTOCOL-v1.0.md` → 本規範。子平八字仍是昭梧跨系統主判；Parashari 僅在獨立印度占星專卷內主導其內部判讀，不得覆寫子平事實。

## 1. 分清目前真實能力

已查核現行 `src/routes/indian-astrology.tsx` 由 `SpecialistSystemPage id="indian"` 顯示。`buildIndianReading()` 尚無 D1、D12、Vimshottari Dasha、Shadbala、SAV、IshtaPhala、KashtaPhala 確定性快照；現有 `D60ReliabilityGate` 僅檢查出生分鐘及一項 D60 上升細分的 ±2 分鐘穩定性，並由瀏覽器載入 Astronomy Engine。**D60 局部輔助功能不代表 Parashari 全套主盤與精準時間算法已接通。**

目前頁面可以公開展示方法、知識、資料完整度及計算可用性。不得用「已完成完整 D1/D12/Dasha」、「已算出 Shadbala/SAV」或個人化父母健康結論吸引用戶付費。未接通的模組必須顯示 `NOT_COMPUTED`；不可讓 AI 填空。

## 2. 必要輸入及版本

出生輸入：當地年月日時分、`IANA timeZone`、出生地經緯度（度數）、出生時間可信度（證件分鐘／估算／區間／未知）、用戶明示的時間誤差區間。不可單憑經度猜測時區，必須考慮歷史時區與 DST gap/fold。未提供時間時不可用中午偽裝已確認出生時辰。

計算設定：`ephemeris_engine_version`、`timezone_db_version`、`ayanamsa_profile`（Lahiri 預設；Raman/KP 必須獨立聲明）、`house_profile`（Parashari Rashi D1 整宮；Bhava Chalit 另列）、`node_profile`（真／平均交點）、`dasha_year_basis`、`varga_profile`、`rule_set_version = ZW-JYOTISH-PARASHARI-1.1`。

時間與地點是可複核資料，不是故事素材。每張盤保存其計算設定；更換 Ayanamsa、時區或出生時間時，必須重算並標示版本。

## 3. 確定性計算順序（禁止語言模型補算）

1. 用 IANA 時區、DST 與出生地把當地民用時間映射為唯一 UTC instant；遇到重疊／不存在時間，先請使用者確認，不默默猜。
2. 從可驗證星曆取得太陽、月亮、水星、金星、火星、木星、土星與 Rahu/Ketu 的黃經及必要運動狀態；記錄星曆版本、節點口徑。
3. 依所選 Ayanamsa 做恆星黃道換算：`siderealLongitude = mod360(tropicalLongitude - ayanamsa)`；不能把西洋熱帶黃道結果直接寫成印度恆星黃道。
4. 同時計算 Lagna 的恆星黃經，D1 Rashi 整宮制：上升所在星座為第一宮，其後逐星座遞進；若需 Bhava Chalit，獨立呈現，不混淆 Rashi 星座與事件宮位。
5. 建 D1 Graha、house lord、Graha Drishti、尊貴／落陷、敵友、逆行、燃燒、功能吉凶及 Yoga；每一項保留觸發規則、證據、反證。不能只憑「12 宮主落某宮」斷事件。
6. Nakshatra 以 Moon 恆星黃經計算：`index = floor(mod360(moonLongitude)/(360/27))`；還須判交界誤差。Vimshottari 起運依月宿主星與宿內餘度，九星次序 `Ketu → Venus → Sun → Moon → Mars → Rahu → Jupiter → Saturn → Mercury`，年限 `7/20/6/10/7/18/16/19/17`；年月與第三層子運只能在星曆、Dasha year basis 與計算向量通過後輸出。
7. 依需要生成 D9、D12；D12 每個星座分十二份、每份 2.5°，須由選定且經 golden vectors 驗證的 varga profile 計算。D6、D30、D60 等各有傳統變體，不得只按等分自行套用錯誤落宮映射。
8. Shadbala（rupas/分量）、Sarvashtakavarga（每宮 bindu）、IshtaPhala/KashtaPhala 僅在完整公式與校驗向量齊備後可標 `COMPUTED`。不得由一般行星強弱形容詞反推數值。
9. 依 `D1 → 相應 D12／D9 等 → Dasha → Gochara` 推出限定範圍的判讀，AI 只翻譯現有 facts，不造星位、不推算失落數據。

## 4. 十二宮主入宮的通用提示，不作單條斷語

使用者原稿本節實際指「**第十二宮主落在第 1–12 宮**」，不是所有十二個宮主的統一判法。通用主題按落宮：
1 自我、獨處、精力分配；2 金錢、家族資源與支出；3 手足、努力、幕後溝通；4 家宅、居所與內在安定；5 子女、創造、研究、投入；6 勞務、債務、競爭與 Viparita Raja Yoga 候選；7 伴侶、遠方與私密性；8 共享財產、突變與深度轉化；9 遠行、父輩、信念及進修；10 幕後工作、跨境與服務；11 收益、社群、志向與支出；12 休息、退隱、遠方、慈善與解脫。

上述是 `OWNER_MATERIAL` 的**研究主題索引**，不是已成立的死亡、疾病、婚姻失敗、子女損失等命題。判讀仍須看 Lagna、宮主星功能吉凶、尊貴、宮位類型（Kendra、Trikona、Dusthana、Upachaya）、合照、Yoga、D9/D12、Dasha 與 Gochara；缺乏對應盤面則不得個人化輸出。

## 5. 其他專項規則的證據邊界

- D6 Shashtamsa：健康、勞務、債務、競爭的傳統象徵參考；用戶原文列舉「命主星在八宮＋土星」「金星／火星／木星入廟」屬待檢驗條件示例，不能無條件推為心理或疾病事實。
- 第六宮主入第五宮、第八宮主入第十宮、第十二宮主入第十二宮：僅標為用戶提供的議題張力範例，不作自動結論。
- 身體與行星的對應表屬 Jyotish/Ayurveda 文化象徵，無醫療診斷效力；禁止輸出骨折、感染、癌症、父母健康危機、孕期精神狀態等個人確定性判斷。
- Balarishta、Pitra Dosha、Matru Dosha 為傳統術語，不能叫「詛咒」並推斷親子關係、責任歸屬或現實創傷。若呈現，應附「傳統象徵／不可證實」並列出具體判定條件與反證。
- Vimshottari Dasha 不是「僅弱星會觸發」。須按運星宮主身份、尊貴、相關宮與 Yogas 等判斷，分清階段象徵與事實事件。
- 任何「資源供給率」「心理壓抑度」「誰絕對掌控」等百分比或直接人格指控，除非有獨立、明示的非占星量表，否則禁止輸出客觀數值或確定結論。

## 6. 出生時間精度 Gate

輸入可信度不能以「填到秒、分、5 分鐘」單獨判定；必須以可信的實際誤差範圍，對每一項結果做 `t - Δt`、`t`、`t + Δt` 邊界重算，若掃描區間跨多個格界則加密取樣：
- 時辰未知：不輸出確定 Lagna、宮位、D12、D60 以及依時間推定的個人事件；若 Moon Nakshatra 和 Dasha 起始也在區間內不穩則暫不輸出。
- 分鐘填寫但無可核對來源：不可宣稱是證件分鐘；D60 需用戶確認時間來源，±2 分鐘檢查通過才可作局部旁證，仍不等於全盤可靠。
- Dasha/Nakshatra：依 Moon 真實速度與距宿界計算；不是每 24 小時必換一宿，也不是一律可精確到月。
- D60：0.5° 細分高敏；若時間區間跨界或星曆不可信，降為弱旁證或不作判定，不得用它反向自行修正出生時間。
- 每項輸出附 `COMPUTED | UNSTABLE | NOT_COMPUTED`、可信輸入和計算依據。缺件時要保留基本已知資料，不擋全站。

## 7. 原生家庭報告模組（僅在真值接線後啟用）

按用戶材料保留以下結構，但改為證據限制版本：
1. **基礎盤面概覽**：D1 Lagna、第2／4／9宮、Sun／Moon、當前 Dasha；缺資料標明。
2. **童年資源與關係模式**：2宮／Jupiter、4宮／Moon、9宮／Sun，僅討論傳統象徵和可供反思的情境；不得推斷母親孕期情緒、父母真實行為或把父母的限制歸咎「業力」。
3. **歷史事件核實**：最多提出若干待用戶核對的年代窗口，前提是有效的 Dasha/分盤計算；禁捏造童年事故、父母危機或以生活事件循環「驗證」出生時間。
4. **父母、祖源與財產專題**：檢查 D1、D12、相關宮主及傳統 Yoga/Dosha，寫明成立條件與不成立理由。Shadbala、SAV、Ishta/Kashta 缺少數值時整塊省略，不以「零」替代。

報告輸出次序固定為：`一句白話答案 → 有哪些確實算到的依據 → 尚缺哪些資料 → 可能的其他解釋 → 一項現實可行選擇`。不以恐嚇、宿命論、疾病或金融保證促成消費。英文使用自然、易懂用字，技術術語只在專業展開層中英／梵文對照。

## 8. 可供未來引擎接線的事實契約

```ts
type EvidenceState = "COMPUTED" | "UNSTABLE" | "NOT_COMPUTED";
type JyotishFact<T> = {
  status: EvidenceState;
  value?: T;
  calculationVersion?: string;
  precisionNote?: string;
};
type ParashariSnapshot = {
  ruleSetVersion: "ZW-JYOTISH-PARASHARI-1.1";
  source: "deterministic-engine";
  input: { birthLocalIso: string; timezone: string; latitude: number; longitude: number; timeUncertaintyMinutes: number | null };
  profile: { ephemerisVersion: string; ayanamsa: "Lahiri" | "Raman" | "KP"; houseSystem: "whole-sign"; dashaYearBasis: string; vargaProfile: string };
  d1: JyotishFact<unknown>;
  d12: JyotishFact<unknown>;
  vimshottari: JyotishFact<unknown>;
  shadbala: JyotishFact<unknown>;
  sav: JyotishFact<unknown>;
  ishtaKashta: JyotishFact<unknown>;
};
```

以上為**接口契約，不是假裝已有的結果**。任何解析器不得把缺失的 value 補為 0、空陣列或看似真實的盤。計算與報告必須共用同一份可追溯快照。未來引擎需對典型地區、不同 DST、節點／Ayanamsa、宿界、整宮制、D12、Dasha 餘度、D60 交界及缺時情況提供 golden test vectors（附來源和容差）。

## 9. 現行網站可發布範圍與完成界線

目前立即可發布：此方法規範、`/indian-astrology` 公開知識摘要、出生時間可靠度說明、已算／未算的能力顯示、現有 D60 gate 的獨立維持；不碰付款、Supabase schema、其他專項或八字核心。

**不在本次假裝完成**：獨立且經驗證的完整 D1/九曜、D12、Nakshatra+完整 Vimshottari、Shadbala/SAV/Ishta-Kashta，及以這些未接線數據生成的父母業力深度個人報告。後續須獨立工程與原典/星曆核驗，不可用一段 Prompt 代替。

驗收：三語知識同義；無出生資料時不虛構個人盤；未知出生時間不輸出 D60；有記錄分鐘仍先要求本人確認；缺 D1/D12/Dasha 時頁面明示不能提供這些個人計算；基本閱讀與收費既有流程不受影響；Production 維持唯一 GitHub main/Vercel 對應。
