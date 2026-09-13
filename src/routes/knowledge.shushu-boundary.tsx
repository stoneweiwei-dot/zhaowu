import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n, type Locale } from "@/lib/i18n";

export const Route = createFileRoute("/knowledge/shushu-boundary")({ component: ShushuBoundaryArticle });

function tr(locale: Locale, hant: string, hans: string, en: string) {
  return locale === "en" ? en : locale === "zh-Hans" ? hans : hant;
}

function ShushuBoundaryArticle() {
  const { locale } = useI18n();
  const layers = [
    {
      no: "01",
      title: tr(locale, "事實求真", "事实求真", "Facts must be checked"),
      text: tr(locale, "出生時間、時區、經緯度、節氣時刻、天文位置與氣候紀錄，都屬可由外部資料校驗的事實層。它們不因人的期待而改寫。", "出生时间、时区、经纬度、节气时刻、天文位置与气候记录，都属可由外部资料校验的事实层。它们不因人的期待而改写。", "Birth time, time zone, coordinates, solar-term timing, astronomical positions and climate records belong to the externally checkable factual layer. They do not change with a person's wishes."),
    },
    {
      no: "02",
      title: tr(locale, "模型守則", "模型守则", "Models must follow their rules"),
      text: tr(locale, "月令、十神、格局、調候、病藥、流通與刑沖合害，是傳統術數模型內的推演規則。能夠一致重算，只證明模型內部可操作，不等於模型已被自然科學證實。", "月令、十神、格局、调候、病药、流通与刑冲合害，是传统术数模型内的推演规则。能够一致重算，只证明模型内部可操作，不等于模型已被自然科学证实。", "Seasonal command, Ten Gods, structure, climate adjustment, remedy logic, flow and stem-branch interactions are rules inside a traditional model. Reproducible calculation shows internal operability, not scientific validation of the model itself."),
    },
    {
      no: "03",
      title: tr(locale, "效力求證", "效力求证", "Claims of efficacy need evidence"),
      text: tr(locale, "輸入資料客觀，不代表模型輸出也因此客觀。任何關於預測力、因果力或固定命運的主張，都需要獨立證據；未經驗證者只能標為推論、傳統判法或假設。", "输入资料客观，不代表模型输出也因此客观。任何关于预测力、因果力或固定命运的主张，都需要独立证据；未经验证者只能标为推论、传统判法或假设。", "Objective inputs do not make a model's outputs objective by default. Claims about predictive power, causal force or fixed destiny require independent evidence; otherwise they remain inference, traditional interpretation or hypothesis."),
    },
    {
      no: "04",
      title: tr(locale, "決策自主", "决策自主", "Decision remains with the person"),
      text: tr(locale, "術可以辨條件、察結構、見趨勢、知代價；但價值選擇與行動責任不能外包。『境如此』不能直接偷換成『我必如此』。", "术可以辨条件、察结构、见趋势、知代价；但价值选择与行动责任不能外包。‘境如此’不能直接偷换成‘我必如此’。", "A method may distinguish conditions, inspect structure, describe trends and expose costs. It cannot outsource value choice or personal responsibility. 'The conditions are like this' does not entail 'I must therefore be like this.'"),
    },
  ];

  const six = [
    [tr(locale,"問心","问心","Question the intention"), tr(locale,"起念之時先辨誠偽。先問自己真正想知道什麼，也問是否只是在尋找一個迎合欲望的答案。","起念之时先辨诚伪。先问自己真正想知道什么，也问是否只是在寻找一个迎合欲望的答案。","At the moment of asking, distinguish sincerity from self-deception: what do you truly want to know, and are you merely seeking an answer that confirms desire?")],
    [tr(locale,"歸真","归真","Return to what is true"), tr(locale,"繁法盡處仍不以術蔽實。資料與現實若與推演不合，先校正推演，而不是改寫事實。","繁法尽处仍不以术蔽实。资料与现实若与推演不合，先校正推演，而不是改写事实。","When method reaches its limit, do not let method cover reality. If evidence conflicts with an interpretation, revise the interpretation rather than the facts.")],
    [tr(locale,"自省","自省","Self-examination"), tr(locale,"斷吉凶之前先察自身之欲。恐懼、執著與期待，都可能把『可能』讀成『必然』。","断吉凶之前先察自身之欲。恐惧、执着与期待，都可能把‘可能’读成‘必然’。","Before judging favorable or unfavorable, inspect fear, attachment and expectation; each can turn possibility into imagined inevitability.")],
    [tr(locale,"守靜","守静","Remain still"), tr(locale,"觀萬象而不因所得之象妄起執取。所見可以重要，但不必立刻變成身份、宿命或命令。","观万象而不因所得之象妄起执取。所见可以重要，但不必立刻变成身份、宿命或命令。","Observe without immediately turning what is seen into identity, fate or command. A signal may matter without ruling the person who sees it.")],
    [tr(locale,"無悔","无悔","Own the choice"), tr(locale,"推演既盡之後，仍由自己承擔選擇。無悔不是拒絕修正，而是不把後果推回給盤、課、卦、局。","推演既尽之后，仍由自己承担选择。无悔不是拒绝修正，而是不把后果推回给盘、课、卦、局。","After analysis ends, the choice is still yours. Owning a choice does not forbid revision; it means not blaming the chart, lesson or hexagram for the consequence.")],
    [tr(locale,"誠正","诚正","Stand upright"), tr(locale,"一切術數退場之後，仍有可以立身之本。技術不能替代倫理，判斷不能替代人格。","一切术数退场之后，仍有可以立身之本。技术不能替代伦理，判断不能替代人格。","When every technique leaves the stage, a basis for conduct must remain. Technique cannot replace ethics, and judgement cannot replace character.")],
  ];

  return (
    <main className="mx-auto max-w-4xl space-y-5 pb-16">
      <article className="seal-border overflow-hidden rounded-2xl bg-paper">
        <img src="/article-shushu-boundary.svg" alt={tr(locale,"遠山晨光前的靜坐人物，昭梧文章《術數的邊界》主圖","远山晨光前的静坐人物，昭梧文章《术数的边界》主图","A seated figure before distant mountains at dawn, hero image for The Boundary of Divination")} className="aspect-video w-full object-cover" />
        <header className="p-5 sm:p-8">
          <p className="text-xs tracking-[0.26em] text-cinnabar">{tr(locale,"昭梧方法論 · 研究札記","昭梧方法论 · 研究札记","ZHAOWU METHODOLOGY · FIELD NOTE")}</p>
          <h1 className="mt-3 font-display text-3xl leading-tight text-ink sm:text-4xl">{tr(locale,"術數的邊界：事實求真，模型求證，認知去執，決策自主","术数的边界：事实求真，模型求证，认知去执，决策自主","The boundary of divination: verify facts, test models, release fixation, keep agency")}</h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-ink-soft">{tr(locale,"從《荀子》「善為易者不占」出發，重新區分事實、模型、證據與選擇。術數可以作為分析工具，但不應被升格成替人決定人生的主人。","从《荀子》“善为易者不占”出发，重新区分事实、模型、证据与选择。术数可以作为分析工具，但不应被升格成替人决定人生的主人。","Starting from Xunzi's line about the skilled student of the Changes not relying on divination, this essay separates facts, models, evidence and choice. A divinatory system may serve as an analytical tool; it should not become the owner of a person's decisions.")}</p>
        </header>
      </article>

      <section className="seal-border rounded-2xl bg-cream p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">{tr(locale,"真正需要防止的，不只是算錯","真正需要防止的，不只是算错","The main danger is not merely a wrong calculation")}</h2>
        <div className="mt-4 space-y-4 text-[15px] leading-8 text-ink-soft">
          <p>{tr(locale,"術數最常見的錯誤，未必發生在排盤那一刻。更深的錯誤，是把不同性質的東西混成同一層：把可測量的資料等同於模型的真實性，把模型內部的一致性等同於外部世界的因果證明，再把一個趨勢判斷直接變成人生指令。","术数最常见的错误，未必发生在排盘那一刻。更深的错误，是把不同性质的东西混成同一层：把可测量的资料等同于模型的真实性，把模型内部的一致性等同于外部世界的因果证明，再把一个趋势判断直接变成人生指令。","The most serious error often occurs after the chart has been calculated. It happens when different categories are collapsed: measurable data are treated as proof of the model, internal consistency is treated as external causal evidence, and a trend judgement becomes a command for life.")}</p>
          <p className="font-medium text-ink">{tr(locale,"所以，境有結構，但術對境的描述未必為真。事實不是幻影，模型也不是事實。","所以，境有结构，但术对境的描述未必为真。事实不是幻影，模型也不是事实。","Conditions have structure, but a method's description of that structure may still be wrong. Facts are not illusions; models are not facts.")}</p>
        </div>
      </section>

      <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">{tr(locale,"一、荀子那句話，究竟說了什麼","一、荀子那句话，究竟说了什么","1. What did Xunzi actually say?")}</h2>
        <blockquote className="mt-5 rounded-xl border border-earth/30 bg-cream px-5 py-4 font-display text-lg leading-8 text-ink">善為詩者不說，善為易者不占，善為禮者不相，其心同也。</blockquote>
        <div className="mt-4 space-y-4 text-[15px] leading-8 text-ink-soft">
          <p>{tr(locale,"《荀子·大略》的局部語境，首先是在說真正掌握其義者，不以外在操作形式取代理解本身。單憑這一句，不宜直接倒推成後世的心學命題，更不能說荀子原本就在主張「內心具足、外境為鏡」。","《荀子·大略》的局部语境，首先是在说真正掌握其义者，不以外在操作形式取代理解本身。单凭这一句，不宜直接倒推成后世的心学命题，更不能说荀子原本就在主张“内心具足、外境为镜”。","In the immediate context of Xunzi's Great Digest, the line first says that genuine understanding is not replaced by external procedure. The sentence alone does not license a later Neo-Confucian or Chan reading about an all-sufficient inner mind.")}</p>
          <p>{tr(locale,"但若與《天論》合讀，荀子的立場會清楚許多。他說：「卜筮然後決大事，非以為得求也，以文之也。」在那個脈絡裡，卜筮被放回禮文與程序，而不是被當成取得超自然答案的可靠管道。","但若与《天论》合读，荀子的立场会清楚许多。他说：“卜筮然后决大事，非以为得求也，以文之也。”在那个脉络里，卜筮被放回礼文与程序，而不是被当成取得超自然答案的可靠管道。","Read together with the Discourse on Heaven, the position is clearer: divination is treated as patterned ritual and procedure rather than a reliable channel for acquiring supernatural answers.")}</p>
          <p>{tr(locale,"因此，今天若要借用「善為易者不占」來說明術數的邊界，最誠實的寫法是：借其精神，而不冒充荀子原義。真正理解變易之理的人，不把最終裁決權外包給占筮。","因此，今天若要借用“善为易者不占”来说明术数的边界，最诚实的写法是：借其精神，而不冒充荀子原义。真正理解变易之理的人，不把最终裁决权外包给占筮。","If the phrase is borrowed today to describe methodological restraint, the honest wording is explicit: we borrow its spirit without claiming this later formulation as Xunzi's original doctrine. Final judgement is not outsourced to divination.")}</p>
        </div>
      </section>

      <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">{tr(locale,"二、為什麼「外求只是鏡，內求才是燈」仍不夠準","二、为什么“外求只是镜，内求才是灯”仍不够准","2. Why the mirror-and-lamp metaphor is still too loose")}</h2>
        <div className="mt-4 space-y-4 text-[15px] leading-8 text-ink-soft">
          <p>{tr(locale,"這句話有文學力量，卻可能讓人誤以為外境只是心的投影，於是術數不必求真。問題就在這裡：如果出生時間、經緯度、天文位置、氣候資料都可以被主觀心念推翻，那麼所有資料校驗與分層驗證都失去必要性。","这句话有文学力量，却可能让人误以为外境只是心的投影，于是术数不必求真。问题就在这里：如果出生时间、经纬度、天文位置、气候资料都可以被主观心念推翻，那么所有资料校验与分层验证都失去必要性。","The metaphor is elegant but can suggest that external conditions are merely projections of mind. If time, coordinates, astronomical positions and climate data could be overturned by subjective intention, factual validation would become meaningless.")}</p>
          <p>{tr(locale,"反過來，也不能借唯識「依他起性」替客觀外境或術數模型背書。依他起性是佛教三性論中的專門概念，涉及依因待緣而起的現象與認識結構；它不是現代科學實在論的同義詞，更不能被拿來證明某套命理模型已獲科學支持。","反过来，也不能借唯识“依他起性”替客观外境或术数模型背书。依他起性是佛教三性论中的专门概念，涉及依因待缘而起的现象与认识结构；它不是现代科学实在论的同义词，更不能被拿来证明某套命理模型已获科学支持。","Nor should Yogacara's dependent nature be used as a certificate of modern objective realism or as scientific support for a divinatory model. It is a technical Buddhist concept about dependently arisen phenomena and cognition, not a synonym for scientific realism.")}</p>
          <p className="font-medium text-ink">{tr(locale,"更穩妥的地基，不是借宗教術語替模型背書，而是把可驗證資料、模型推演、效力證據與人生裁決分開。","更稳妥的地基，不是借宗教术语替模型背书，而是把可验证资料、模型推演、效力证据与人生裁决分开。","A stronger foundation is not religious vocabulary used as validation, but a disciplined separation of facts, model inference, evidence of efficacy and personal decision.")}</p>
        </div>
      </section>

      <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">{tr(locale,"三、術數研究的四層方法","三、术数研究的四层方法","3. A four-layer method for studying divination")}</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">{layers.map((layer) => <article key={layer.no} className="rounded-xl border border-line bg-cream p-5"><span className="font-display text-xl text-cinnabar">{layer.no}</span><h3 className="mt-2 font-display text-xl text-ink">{layer.title}</h3><p className="mt-2 text-sm leading-7 text-ink-soft">{layer.text}</p></article>)}</div>
        <p className="mt-5 rounded-xl border border-cinnabar/20 bg-cream px-5 py-4 font-medium leading-7 text-ink">{tr(locale,"核心鏈條：事實求真 → 模型守則 → 效力求證 → 決策自主。","核心链条：事实求真 → 模型守则 → 效力求证 → 决策自主。","Core chain: verify facts → apply model rules consistently → test efficacy claims → keep decision agency.")}</p>
      </section>

      <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">{tr(locale,"四、六個終點，最後都回到人","四、六个终点，最后都回到人","4. Six endpoints that return to the person")}</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">{six.map(([title,text], index) => <article key={title} className="rounded-xl border border-line bg-cream p-5"><span className="text-xs tracking-[0.2em] text-cinnabar">{String(index+1).padStart(2,"0")}</span><h3 className="mt-2 font-display text-xl text-ink">{title}</h3><p className="mt-2 text-sm leading-7 text-ink-soft">{text}</p></article>)}</div>
      </section>

      <section className="seal-border rounded-2xl bg-cream p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">{tr(locale,"五、術能做什麼，也必須知道不能做什麼","五、术能做什么，也必须知道不能做什么","5. What a method may do — and what it must not do")}</h2>
        <div className="mt-4 space-y-4 text-[15px] leading-8 text-ink-soft">
          <p>{tr(locale,"術數可以辨條件、察結構、見趨勢、知代價。這四個動詞是分析功能，不是四個固定技術模組的同義詞：格局也涉及結構，刑沖合害也能成為條件，大運流年會重寫局部結構，病藥更不能直接等同現實成本。","术数可以辨条件、察结构、见趋势、知代价。这四个动词是分析功能，不是四个固定技术模块的同义词：格局也涉及结构，刑冲合害也能成为条件，大运流年会重写局部结构，病药更不能直接等同现实成本。","A system may distinguish conditions, inspect structure, describe trends and surface costs. These are functions, not one-to-one synonyms for fixed technical modules; the modules overlap and interact.")}</p>
          <p>{tr(locale,"真正的邊界，是不要把「資料為真」偷換成「模型必真」，不要把「模型如此」偷換成「人生必然如此」，也不要把「可能如此」偷換成「所以我必須如此」。每一次偷換，都讓工具多拿走一部分本來屬於人的判斷權。","真正的边界，是不要把“资料为真”偷换成“模型必真”，不要把“模型如此”偷换成“人生必然如此”，也不要把“可能如此”偷换成“所以我必须如此”。每一次偷换，都让工具多拿走一部分本来属于人的判断权。","The boundary is violated when true data are turned into an infallible model, a model result into inevitable life, or a possibility into an obligation. Each substitution transfers human judgement to a tool without sufficient warrant.")}</p>
        </div>
      </section>

      <section className="seal-border rounded-2xl bg-paper p-5 sm:p-8">
        <h2 className="font-display text-2xl text-ink">{tr(locale,"六、儒、道、佛可以相參，但不必偽造統一","六、儒、道、佛可以相参，但不必伪造统一","6. Confucian, Daoist and Buddhist resources may converse without being collapsed")}</h2>
        <p className="mt-4 text-[15px] leading-8 text-ink-soft">{tr(locale,"「返璞歸真、誠正守靜、問心無愧」本來就跨越不同傳統。公開使用時，不必硬說三教本來就是同一套理論。更嚴謹的說法是：本文不是建立儒道佛的教義統一，而是擷取三者在自然觀、倫理自律與去執工夫上可以相容的部分，作為術數方法論的規範性資源。這是方法上的整合，不是歷史上的同源證明。","“返璞归真、诚正守静、问心无愧”本来就跨越不同传统。公开使用时，不必硬说三教本来就是同一套理论。更严谨的说法是：本文不是建立儒道佛的教义统一，而是撷取三者在自然观、伦理自律与去执工夫上可以相容的部分，作为术数方法论的规范性资源。这是方法上的整合，不是历史上的同源证明。","The closing vocabulary crosses traditions. It need not imply that Confucianism, Daoism and Buddhism were historically one theory. This essay selectively uses compatible resources concerning nature, ethical self-discipline and release from fixation. It is a methodological synthesis, not a claim of doctrinal identity or common origin.")}</p>
      </section>

      <section className="seal-border rounded-2xl bg-cream p-5 sm:p-8">
        <p className="font-display text-2xl leading-9 text-ink">{tr(locale,"事實求真，模型求證；認知去執，決策自主。","事实求真，模型求证；认知去执，决策自主。","Verify facts, test models; release fixation, keep agency.")}</p>
        <div className="mt-4 space-y-4 text-[15px] leading-8 text-ink-soft">
          <p>{tr(locale,"術數萬千，終歸心性。不是因為外境不重要，也不是因為一切皆由心造，而是因為當資料、規則與推演都做到盡處之後，仍有一件事不能由任何盤、課、卦、局代替：人必須自己選擇，並為自己的選擇負責。","术数万千，终归心性。不是因为外境不重要，也不是因为一切皆由心造，而是因为当资料、规则与推演都做到尽处之后，仍有一件事不能由任何盘、课、卦、局代替：人必须自己选择，并为自己的选择负责。","Divinatory traditions may be many, yet the final question returns to character and agency. Not because external conditions are unimportant, nor because mind creates everything, but because no chart or hexagram can replace the final human act of choosing and taking responsibility.")}</p>
          <p className="font-display text-xl leading-8 text-cinnabar">{tr(locale,"返璞歸真，誠正守靜；落子無悔，問心無愧。","返璞归真，诚正守静；落子无悔，问心无愧。","Return to simplicity and truth; stand sincere and still. Choose without evasion, and answer to conscience.")}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-paper p-5 sm:p-8">
        <h2 className="font-display text-xl text-ink">{tr(locale,"方法聲明與參考","方法声明与参考","Method note and references")}</h2>
        <p className="mt-3 text-sm leading-7 text-ink-soft">{tr(locale,"本文討論的是術數研究與使用的認識論邊界，不宣稱八字、紫微、卦術或其他傳統預測模型的效力已獲現代自然科學證實。可驗證的天文、時間、地理與氣候資料，和建立在這些資料之上的傳統象徵推演，必須分層陳述。","本文讨论的是术数研究与使用的认识论边界，不宣称八字、紫微、卦术或其他传统预测模型的效力已获现代自然科学证实。可验证的天文、时间、地理与气候资料，和建立在这些资料之上的传统象征推演，必须分层陈述。","This essay concerns epistemic boundaries in the study and use of traditional divinatory systems. It does not claim that BaZi, Ziwei, hexagram methods or other predictive systems have been scientifically validated. Verifiable astronomical, temporal, geographical and climate data must be kept distinct from symbolic inference built upon them.")}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          <a className="rounded-full border border-line bg-cream px-3 py-2 text-ink-soft" href="https://zh.wikisource.org/zh-hant/%E8%8D%80%E5%AD%90/%E5%A4%A7%E7%95%A5%E7%AF%87" target="_blank" rel="noreferrer">《荀子·大略》</a>
          <a className="rounded-full border border-line bg-cream px-3 py-2 text-ink-soft" href="https://zh.wikisource.org/zh-hant/%E8%8D%80%E5%AD%90/%E5%A4%A9%E8%AB%96%E7%AF%87" target="_blank" rel="noreferrer">《荀子·天論》</a>
          <a className="rounded-full border border-line bg-cream px-3 py-2 text-ink-soft" href="https://news.gmw.cn/2019-09/07/content_33142787.htm" target="_blank" rel="noreferrer">李華：數與德</a>
          <a className="rounded-full border border-line bg-cream px-3 py-2 text-ink-soft" href="https://plato.stanford.edu/entries/yogacara/" target="_blank" rel="noreferrer">SEP: Yogācāra</a>
        </div>
      </section>

      <Link to="/knowledge" className="seal-border flex min-h-14 items-center justify-between rounded-2xl bg-cream px-5 py-4 text-sm text-ink"><span>{tr(locale,"返回昭梧知識圖鑑","返回昭梧知识图鉴","Back to Zhaowu Field Notes")}</span><span className="text-cinnabar">→</span></Link>
    </main>
  );
}
