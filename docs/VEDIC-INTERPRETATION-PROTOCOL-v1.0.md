# 昭梧｜印度吠陀占星解释协议 v1.0

状态：`INTERPRETATION_READY / CALCULATION_GATE_REQUIRED`

适用范围：昭梧内部研究、未来 Jyotish 专题、站主明确要求的印度占星分析。

上位规则：`AGENTS.md` → `docs/INSTRUCTION-REGISTRY.md` → `docs/STONE-R6.2.1-CURRENT-MASTER.md` → 本协议。

> 本协议把此前分散在「Vedic Deep Karma Matrix v4.0」及后续补丁中的有效内容整合为一个当前版本。它是**解释规则**，不是计算公式。当前 `main` 未发现独立、确定性、版本化的 Jyotish/Vedic calculation engine，因此在计算层正式接入前，本协议不得让网站伪装成已经能可靠计算 D1/D9/D60 等分盘。

## 1. 体系定位

1. 子平八字继续是昭梧主判体系；印度占星只能作为独立专题／旁证，不得反向覆盖子平月令、格局、病药、流通、承载与岁运主判。
2. Jyotish 内部坚持 `D1 为根、Dasha 定阶段、分盘细化`。任何 Vargas 都不能制造 D1 完全不存在的主题。
3. 结构、事件与主观体验必须分层：Rasi 看结构；Bhava 看事件宫位落点；Moon Chart 看主观体验；Dasha 看阶段启动；Transit 看触发；分盘看领域细节。
4. 灵魂、业力、前世等语言只可作传统／象征性解释，不写成已证实历史事实。
5. 禁止 Starseed／星际种子身份、银河种族、高维神族等客户结论；这些旧 v4.0 内容已退出昭梧 active scope。

## 2. Calculation Truth Gate

解释前必须先有同一份确定性 engine snapshot。AI 不得自行重算星位、宫位、Nakshatra、Varga、Dasha 或 Transit。

正式计算层未来接入时必须版本化并有确定性测试，至少记录：

- 出生日期、当地钟表时间、出生地；
- 时区与夏令时；
- 使用的 ayanamsha；
- house / Bhava 计算口径；
- Dasha 系统与起算规则；
- Vargas 计算 profile；
- Transit 时间点；
- calculation profile / source provenance。

在没有上述计算真值时，只能讨论方法，不得生成具体盘面结论。

## 3. 出生时间可靠度 Gate

所有高阶分盘先检查时间可靠度。

- 时间未知或仅粗略时段：D9、D40、D45、D60 等敏感分盘不得作确定判断。
- 时区、DST、出生地或换算存在未解决冲突：先停止高阶分盘。
- D60 只在出生时间达到足够分钟级精度、且换算后结果稳定时使用；若合理误差范围足以改变 D60 分段，必须标 `不作判定`。
- 禁止用 D60 自己去证明／微调一个本来不确定的出生时间，再把调整后的 D60 当证据；考时定刻必须另走独立证据流程，避免循环论证。

## 4. 固定执行顺序

1. 资料与时间可靠度
2. Rasi D1
3. Bhava Chart
4. Moon Chart / Chandra Lagna
5. D9 Navamsha
6. Dasha
7. Transit / Gochar
8. 与问题有关的专项分盘
9. 交叉验证与反证
10. 白话结论、限制与现实行动

不得因为用户要求“深度”而一次把所有分盘全部倾倒出来。

## 5. Rasi D1｜本命星座盘

Rasi 是所有判断的根基，负责行星所在星座、尊贵／受损状态、相位／合相、整体结构与主题是否存在。

必须检查：
- Lagna 与 Lagna lord；
- Moon、Sun；
- Rahu / Ketu；
- 与当前问题有关的 house / house lord；
- 主要 yogas（仅保留具备成立条件者）；
- 行星尊贵、自宫、友敌宫、逆行、燃烧等状态（依 calculation profile）。

任何 D9、D10、D60、Dasha、Transit 结论都必须回到 D1 验证。

## 6. Bhava Chart｜宫位盘

Bhava 用于判断事件落在哪个生活领域，不修改 Rasi 的星座性质与尊贵状态。

- Rasi 看星座力量；Bhava 看事件宫位。
- 两者不一致时，明确写“星座性质不变，事件落点改变”。
- 不得用 Bhava 推翻 Rasi 的基础行星状态。

## 7. Moon Chart｜Chandra Lagna

Moon Chart 观察心理体验、主观安全感、情绪压力及 Transit 的感受方式。

- Lagna 盘偏现实结构；Moon 盘偏主观体验。
- Lagna 强、Moon 受压：可表述为现实承载较强但主观压力更重。
- Moon 强、Lagna 弱：可表述为内在体验较稳定，但现实兑现仍受客观结构限制。
- Moon Chart 不得取代 Lagna 盘。

## 8. D9 Navamsha

D9 是 D1 之后的核心长期验证层，用于观察长期稳定性、关系／婚姻结构、dharma 与行星内在力量。

D9 只能细化 D1 已出现的主题；不得因为 D9 强就制造 D1 不存在的现实承诺。

## 9. Dasha｜阶段启动器

Dasha 决定结构何时进入主要人生阶段。

固定原则：
- D1 有主题 + 分盘支持，但 Dasha 未启动：只作潜力／背景。
- D1 有主题 + Dasha 启动 + 分盘同向：结论强度才可提高。
- Dasha 与 Transit 冲突时，以 Dasha 作为阶段背景，Transit 只作短期触发／感受。

## 10. Transit / Gochar｜触发层

Transit 不可单独断事。

优先观察慢行星及节点（如 Saturn、Jupiter、Rahu、Ketu），同时从 Lagna 与 Moon 视角核对。

固定顺序：

`D1 结构是否存在 → Dasha 是否启动 → Transit 是否触发 → Moon Chart 感受强弱`

仅有 Transit、没有 D1 / Dasha 支持时，不升级为重大现实事件。

## 11. 专项分盘调用表

### 核心／高权重领域分盘

- `D2 Hora`：财富、资源、收入与保存方式。必须先核对 D1 二／十一／九／十宫及相关 lord、Jupiter、Venus；不得单凭 D2 断富贵、暴富或阶层跃迁。
- `D10 Dashamsha`：职业、社会角色、事业兑现。
- `D12 Dwadashamsha`：父母、祖源、家族背景。
- `D20 Vimshamsha`：精神、信仰、修行路径；不得把宗教／灵性倾向写成超自然事实。
- `D24 Chaturvimshamsha`：教育、知识、技能、学习系统。
- `D30 Trimshamsha`：逆境、困难与压力模式；慎用，不作疾病／灾祸恐吓。

### 中权重分盘

- `D3 Drekkana`：手足、勇气、行动力、短途与开拓能力；结合 D1 三宫、三宫主、Mars、Mercury。
- `D4 Chaturthamsha`：房产、居所、固定资产、根基；结合 D1 四宫、四宫主、Moon、Venus。
- `D7 Saptamsha`：子女、创造力、作品／学生／传承等“由自身延伸出去”的成果；结合 D1 五宫、五宫主、Jupiter，并检查 Dasha。不得只凭 D7 断有没有子女。
- `D16 Shodashamsha`：交通、车辆、舒适享受。
- `D27 Bhamsa`：力量、体质与承压能力；只可表达传统体质／压力倾向，不作医疗诊断。

### 低到中权重

- `D5 Panchamsha`：名声、权威、创造表达；低于 D10 / D9 / D24。
- `D6 Shashthamsha`：竞争、债务、劳动压力与疾病主题；不得单独断疾病。
- `D40 Khavedamsha`：母系／母族背景；需 D1 四宫、Moon、D12 同向。
- `D45 Akshavedamsha`：父系／父族、根性与祖源背景；需 D1 九宫、Sun、D12 同向。

### 极慎用

- `D8`：突变／隐藏压力，只作低权重辅助。
- `D11`：破坏／强烈转化主题，禁止死亡直断。
- `D60 Shashtiamsha`：高敏感度深层旁证；只有时间 Gate 通过后才能调用。

## 12. D60 专用规则

D60 用于传统意义上的深层背景／业力底色，不是事件发动机，也不是“前世身份证”。

必须同时满足：
1. 出生时间可靠度 Gate 通过；
2. D1 已有相关结构；
3. D9 与 Dasha 没有形成明显反证；
4. 计算 profile 已确定；
5. 只作细化／旁证。

解释可涉及：重复性心理惯性、深层恐惧／执念、长期反复主题、传统业力象征。

禁止：
- “你前世一定是某人”；
- 神佛转世；
- 冤亲债主／业障确定论；
- 以 D60 单独预测重大事件；
- 用 D60 反向覆盖 D1 / D9 / Dasha；
- 时间不可靠仍强行输出。

## 13. 冲突裁决

- Rasi vs Bhava：星座性质看 Rasi；事件领域看 Bhava。
- Lagna vs Moon：现实结构看 Lagna；主观体验看 Moon。
- D1 vs 专项分盘：D1 决定主题能否成立；分盘只决定细节与兑现方式。
- Dasha vs Transit：Dasha 定阶段；Transit 定触发。
- 分盘强但 Dasha 未启动：潜力，不作当前事件。
- D60 与 D1/D9 强冲突：优先检查出生时间、计算 profile 与 D60 可靠性，不用 D60 推翻主结构。

若仍无法决胜，执行 R6.2.1 Tie Procedure，保留 `UNRESOLVED TIE`。

## 14. 历史人物／精神原型

如果使用历史人物类比，只能写“精神／心理／行为结构在某些方面相似”，必须同时说明像在哪里、不像在哪里。

不得写成前世身份认证，也不得用名人相似度提高命理可信度。

## 15. 输出契约

默认只回答用户实际问到的主题。建议顺序：

1. 1–3 句直接答案；
2. 当前可靠度／计算条件；
3. D1 相关结构；
4. Dasha / Transit（若问题涉及时间）；
5. 仅调用与问题有关的专项分盘；
6. 支持证据与反证；
7. 风险／限制；
8. 一个现实可执行下一步。

英文输出使用自然、简明的澳洲日常英语；术语可放在括号或专业展开层，不用大量梵文／拼音挡住答案。

## 16. QA

输出前必须确认：
- 是否有真实 deterministic calculation snapshot；
- 出生时间是否足以支持所用 Varga；
- 是否先看 D1；
- 是否把 Bhava 与 Rasi 混用；
- 是否把 Moon Chart 当成现实主盘；
- 是否把 Transit 当事件发动机；
- 是否检查 Dasha；
- 专项分盘是否真的与本题有关；
- D60 是否通过时间 Gate；
- 是否出现 Starseed／高维身份／前世身份确定论；
- 是否出现医疗／死亡／灾祸直断；
- 是否把象征语言写成事实；
- 是否保留 UNKNOWN／反证；
- 是否遵守 R6.2.1 No Silent Reinterpretation 与双轴证据。

任一项失败，修正后才可输出。

## 17. 当前接线状态

本协议已经可以作为昭梧的**解释层规范**使用；但当前 `main` 未发现独立 Jyotish/Vedic deterministic calculation engine 或客户专题 route。

因此现阶段状态固定为：

`INTERPRETATION READY — CALCULATION NOT WIRED`

后续若要正式产品化，必须另做 calculation truth implementation + test vectors + source profile + route/UI/release gate；不得只凭本协议宣布网站已经有印度占星功能。