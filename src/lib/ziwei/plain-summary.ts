import type { Locale } from '@/lib/i18n';
import { mod12, palaceIndexOf, type ZiweiCoreChart } from './core';
import type { ZiweiDecadal, ZiweiMutagenEvent, ZiweiTruthExtension } from './horoscope';

export type ZiweiPlainEvidence = {
  source: 'natal' | 'work' | 'money' | 'relationship' | 'inner' | 'decadal' | 'yearly';
  signal: string;
};

export type ZiweiPlainSummary = {
  version: 'zhaowu_ziwei_plain_summary_v1';
  locale: Locale;
  title: string;
  paragraphs: string[];
  closing: string;
  internalEvidence: ZiweiPlainEvidence[];
};

type SummaryInput = {
  chart: ZiweiCoreChart;
  extension: ZiweiTruthExtension;
  locale: Locale;
  activeDecadalIndex: number | null;
  targetYear: number;
};

type ToneKey =
  | 'authority' | 'strategy' | 'visibility' | 'practical' | 'ease' | 'intensity' | 'stability'
  | 'sensitivity' | 'appetite' | 'analysis' | 'coordination' | 'responsibility' | 'decisive' | 'reinvention';

const STAR_TONE: Record<string, ToneKey> = {
  紫微: 'authority', 天機: 'strategy', 太陽: 'visibility', 武曲: 'practical', 天同: 'ease', 廉貞: 'intensity',
  天府: 'stability', 太陰: 'sensitivity', 貪狼: 'appetite', 巨門: 'analysis', 天相: 'coordination', 天梁: 'responsibility',
  七殺: 'decisive', 破軍: 'reinvention',
};

type ToneCopy = { core: string; second: string; work: string; money: string; relation: string; pressure: string };

const HANT: Record<ToneKey, ToneCopy> = {
  authority: {
    core: '你做事需要先看清方向，不喜歡長期被別人牽著走。',
    second: '你對品質和秩序有自己的標準，遇到沒人做決定的局面，常會自然接手。',
    work: '工作上你比較適合有判斷權、能自己排優先順序的環境；被過度微管會很快失去耐心。',
    money: '你希望財務由自己掌控，越能看懂收入來源和支出結構，心裡越安定。',
    relation: '關係裡你不喜歡被控制，也很難接受完全沒有主見的人；兩個人都能站穩自己會更舒服。',
    pressure: '真正耗你的往往是失控、沒標準和規則反覆改變，這類環境會快速消耗耐心。',
  },
  strategy: {
    core: '你腦子轉得快，通常會先觀察、比較，再決定怎麼走。',
    second: '你的優勢是能看見不同可能，但選項一多時也容易在腦中反覆推演。',
    work: '工作上你適合分析、規劃和需要快速調整的事情，不適合每天只做完全重複的流程。',
    money: '你會比較不同方案再下手，適合有規劃地配置資源，而不是被短期情緒帶著走。',
    relation: '你在關係裡會觀察很多細節，真正適合你的人要願意把事情說清楚，不讓你一直猜。',
    pressure: '最容易讓你累的不是事情本身，而是腦子一直沒停，所有可能性同時在裡面跑。',
  },
  visibility: {
    core: '你在真正需要承擔責任或站到前面時，往往比自己想像中更能撐住場面。',
    second: '你在意事情最後有沒有做出效果，也容易把別人的期待一起扛在身上。',
    work: '工作上你在需要對外、承擔責任或讓成果被看見的位置更容易建立自己的存在感。',
    money: '你的收入更適合和成果、影響力或可被看見的價值連在一起，而不是一直做無法累積的隱形工作。',
    relation: '你希望重要關係裡彼此都願意表態和投入，長期冷淡或沒有回應會讓你慢慢失去熱度。',
    pressure: '你容易把「我要把事情做好」和「不能讓別人失望」綁在一起，久了會比表面看起來更累。',
  },
  practical: {
    core: '你做事偏實際，會看結果、效率，以及投入到底值不值得。',
    second: '你對資源和現實條件的敏感度高，不太喜歡只談理想卻沒有落地方法。',
    work: '你的工作價值來自把事情做實、做準、做出可衡量結果，專業能力比表面熱鬧更重要。',
    money: '你對投入回報很敏感，錢最好來自可以重複的專業能力，而不是模糊承諾。',
    relation: '你看關係不只看感覺，也看對方是否可靠、是否說到做到，以及現實裡能不能互相配合。',
    pressure: '你最容易被低效率、反覆返工和沒有結果的消耗拖累，事情越模糊越容易煩。',
  },
  ease: {
    core: '你其實很重視生活能不能過得舒服、順暢，不喜歡長期處在高衝突裡。',
    second: '你通常不難相處，但有時會因為不想把事情搞僵而延後真正需要處理的問題。',
    work: '你更適合人際正常、節奏可持續的工作；長期高壓和內耗會明顯降低你的狀態。',
    money: '你花錢通常希望換來更舒服、更省心的生活，真正要守的是別為了一時輕鬆忽略長期安排。',
    relation: '你希望關係是舒服而有善意的，不愛長期爭吵；但真正有問題時還是要直接說，不要一直拖。',
    pressure: '你習慣先把衝突壓低，短期看起來平靜，長期卻可能把不舒服累積在心裡。',
  },
  intensity: {
    core: '你對人和事有明確喜惡，邊界一旦被踩到，態度會變得很清楚。',
    second: '你不是沒有彈性，而是很難長期忍受模糊、反覆或不真誠。',
    work: '你適合規則和責任清楚的工作，最受不了權責模糊、反覆改口和低效率。',
    money: '你在資源分配上容易走得很乾脆：認為值得就投入，不值得時也會迅速收手。',
    relation: '你不喜歡曖昧不清和反覆拉扯；一旦信任下降，你會很快收回原本的投入。',
    pressure: '真正消耗你的是長期忍耐；如果邊界一直被踩，你往往先壓住，最後一次性爆掉。',
  },
  stability: {
    core: '你真正擅長的是把事情慢慢做穩，而不是靠一時衝動取勝。',
    second: '你對安全感、資源和可持續性有自然判斷，越有自主空間越能發揮。',
    work: '你適合能累積口碑、客戶、資源或專業壁壘的工作，越做越穩比一直換題目更有利。',
    money: '你更適合先建立穩定現金流和可累積的資產，再去做更大的選擇。',
    relation: '你真正要的是可靠、能長期相處的人，穩定投入比一開始很熱烈更重要。',
    pressure: '環境長期不穩或生活一直沒有底，你會比別人更容易疲憊；先把基本盤整理好很重要。',
  },
  sensitivity: {
    core: '你對氣氛、細節和人的情緒變化很敏銳，很多東西不用說明你也會先感覺到。',
    second: '你需要一定的安靜和安全感，外界太吵或變動太快時會比別人更耗能。',
    work: '你對品質、審美和細節有優勢，環境太粗糙時容易消耗，精細型工作反而能拉開差距。',
    money: '你花錢常和品質、安全感、環境舒適度有關，比起便宜，你更在意值不值得。',
    relation: '你很容易感覺到對方語氣和態度的變化，所以安全感和清楚溝通對你特別重要。',
    pressure: '外界氣氛、人際變化和生活品質會直接影響你的狀態，你比自己以為的更需要恢復空間。',
  },
  appetite: {
    core: '你對新東西、人和體驗的接受度高，人生不能一直只有同一種節奏。',
    second: '你很會感受機會和可能性，但選擇太多時也要避免把注意力分得太散。',
    work: '你適合有變化、有互動、有新題目的工作，完全封閉而沒有成長空間的環境很難讓你久待。',
    money: '你願意為體驗、興趣或新機會花錢，真正要守的是不要因為選擇太多而分散資源。',
    relation: '你需要關係裡仍有新鮮感和共同體驗，太沉悶或限制太多容易讓你慢慢失去興趣。',
    pressure: '你容易同時被很多可能性吸引，真正累的時候往往不是沒有路，而是每條路都想顧。',
  },
  analysis: {
    core: '你很容易看見問題裡不合理的地方，也不會因為大家都這樣做就直接接受。',
    second: '你的判斷力來自追問和比較，但壓力大時容易把一句話、一件事想得過深。',
    work: '你適合需要判斷、拆問題、談判或把複雜事情說清楚的工作，但別把時間都耗在證明誰對誰錯。',
    money: '你通常不會完全憑感覺做財務決定，會希望先把風險和邏輯想明白。',
    relation: '你會反覆想一句話背後的意思；真正適合你的人要能直接溝通，減少不必要的猜測。',
    pressure: '遇到說不清、沒答案的事情時，你容易一直追問到底，精神消耗會因此放大。',
  },
  coordination: {
    core: '你很重視公平、分寸和彼此配合，擅長在不同立場之間找到可行做法。',
    second: '你不喜歡粗暴推進，環境越有秩序、合作對象越成熟，你越能發揮。',
    work: '你的強項是把人、流程和需求接起來，合作品質會直接決定你的工作效率。',
    money: '資源如果能和可靠的人、清楚的合作條件綁在一起，你通常更容易把價值放大。',
    relation: '你很重視尊重、分寸和互相配合，關係一旦長期失衡，你會越來越累。',
    pressure: '你很容易先照顧整體平衡，久了可能忘記自己其實也有不願意接受的部分。',
  },
  responsibility: {
    core: '你很容易成為那個幫忙收尾、照顧整體的人，責任感通常比表面看起來更重。',
    second: '你能扛事，但要小心把別人的問題也默默變成自己的責任。',
    work: '你容易被交付重要或棘手的事，長期要避免成為團隊裡永遠替別人補洞的人。',
    money: '你對錢的壓力常和責任綁在一起，替別人承擔之前要先確定自己的底線。',
    relation: '你在關係裡容易多做一些、多照顧一些，但真正健康的關係不能永遠只有你收尾。',
    pressure: '你太容易把「這件事總要有人處理」變成自己的責任，久了會覺得什麼都壓在自己身上。',
  },
  decisive: {
    core: '真正到了要做決定的時候，你其實比很多人更敢切斷、重排和承擔後果。',
    second: '你不適合長期被困在拖延的環境裡，有清楚權限和明確目標時反而更有效率。',
    work: '你適合目標清楚、允許快速決策的工作，真正需要轉向時你比想像中果斷。',
    money: '你的財務決策一旦想清楚往往很乾脆，關鍵是決定前把風險邊界先定好。',
    relation: '你可以給關係機會，但如果重要問題長期沒有改善，你也有能力真正做出選擇。',
    pressure: '高壓時你會變得很硬、很任務導向，需要記得替自己留下恢復空間。',
  },
  reinvention: {
    core: '你的人生很難完全照一條固定路線走到底，到了不合適的階段會有很強的重整衝動。',
    second: '你的能力不是守住所有舊東西，而是知道什麼時候該拆掉重來。',
    work: '你很適合改革、重整、創新或從零建立新流程，職涯不必強迫自己永遠維持同一種形式。',
    money: '你的收入模式也可能經歷幾次重整，真正重要的是每次轉向都保留能帶走的能力和資源。',
    relation: '你不太適合只有形式、沒有成長的關係；到了真的不合適時，你會希望重新定義相處方式。',
    pressure: '你在不適合的環境裡可以撐一段時間，但撐到臨界點會想全部推翻，所以最好提早做小幅調整。',
  },
};

const HANS: Record<ToneKey, ToneCopy> = {
  authority: { core:'你做事需要先看清方向，不喜欢长期被别人牵着走。', second:'你对品质和秩序有自己的标准，遇到没人做决定的局面，常会自然接手。', work:'工作上你比较适合有判断权、能自己排优先顺序的环境；被过度微管会很快失去耐心。', money:'你希望财务由自己掌控，越能看懂收入来源和支出结构，心里越安定。', relation:'关系里你不喜欢被控制，也很难接受完全没有主见的人；两个人都能站稳自己会更舒服。', pressure:'真正耗你的往往是失控、没标准和规则反复改变，这类环境会快速消耗耐心。' },
  strategy: { core:'你脑子转得快，通常会先观察、比较，再决定怎么走。', second:'你的优势是能看见不同可能，但选项一多时也容易在脑中反复推演。', work:'工作上你适合分析、规划和需要快速调整的事情，不适合每天只做完全重复的流程。', money:'你会比较不同方案再下手，适合有规划地配置资源，而不是被短期情绪带着走。', relation:'你在关系里会观察很多细节，真正适合你的人要愿意把事情说清楚，不让你一直猜。', pressure:'最容易让你累的不是事情本身，而是脑子一直没停，所有可能性同时在里面跑。' },
  visibility: { core:'你在真正需要承担责任或站到前面时，往往比自己想象中更能撑住场面。', second:'你在意事情最后有没有做出效果，也容易把别人的期待一起扛在身上。', work:'工作上你在需要对外、承担责任或让成果被看见的位置更容易建立自己的存在感。', money:'你的收入更适合和成果、影响力或可被看见的价值连在一起，而不是一直做无法积累的隐形工作。', relation:'你希望重要关系里彼此都愿意表态和投入，长期冷淡或没有回应会让你慢慢失去热度。', pressure:'你容易把“我要把事情做好”和“不能让别人失望”绑在一起，久了会比表面看起来更累。' },
  practical: { core:'你做事偏实际，会看结果、效率，以及投入到底值不值得。', second:'你对资源和现实条件的敏感度高，不太喜欢只谈理想却没有落地方法。', work:'你的工作价值来自把事情做实、做准、做出可衡量结果，专业能力比表面热闹更重要。', money:'你对投入回报很敏感，钱最好来自可以重复的专业能力，而不是模糊承诺。', relation:'你看关系不只看感觉，也看对方是否可靠、是否说到做到，以及现实里能不能互相配合。', pressure:'你最容易被低效率、反复返工和没有结果的消耗拖累，事情越模糊越容易烦。' },
  ease: { core:'你其实很重视生活能不能过得舒服、顺畅，不喜欢长期处在高冲突里。', second:'你通常不难相处，但有时会因为不想把事情搞僵而延后真正需要处理的问题。', work:'你更适合人际正常、节奏可持续的工作；长期高压和内耗会明显降低你的状态。', money:'你花钱通常希望换来更舒服、更省心的生活，真正要守的是别为了一时轻松忽略长期安排。', relation:'你希望关系是舒服而有善意的，不爱长期争吵；但真正有问题时还是要直接说，不要一直拖。', pressure:'你习惯先把冲突压低，短期看起来平静，长期却可能把不舒服积累在心里。' },
  intensity: { core:'你对人和事有明确喜恶，边界一旦被踩到，态度会变得很清楚。', second:'你不是没有弹性，而是很难长期忍受模糊、反复或不真诚。', work:'你适合规则和责任清楚的工作，最受不了权责模糊、反复改口和低效率。', money:'你在资源分配上容易走得很干脆：认为值得就投入，不值得时也会迅速收手。', relation:'你不喜欢暧昧不清和反复拉扯；一旦信任下降，你会很快收回原本的投入。', pressure:'真正消耗你的是长期忍耐；如果边界一直被踩，你往往先压住，最后一次性爆掉。' },
  stability: { core:'你真正擅长的是把事情慢慢做稳，而不是靠一时冲动取胜。', second:'你对安全感、资源和可持续性有自然判断，越有自主空间越能发挥。', work:'你适合能积累口碑、客户、资源或专业壁垒的工作，越做越稳比一直换题目更有利。', money:'你更适合先建立稳定现金流和可积累的资产，再去做更大的选择。', relation:'你真正要的是可靠、能长期相处的人，稳定投入比一开始很热烈更重要。', pressure:'环境长期不稳或生活一直没有底，你会比别人更容易疲惫；先把基本盘整理好很重要。' },
  sensitivity: { core:'你对气氛、细节和人的情绪变化很敏锐，很多东西不用说明你也会先感觉到。', second:'你需要一定的安静和安全感，外界太吵或变动太快时会比别人更耗能。', work:'你对品质、审美和细节有优势，环境太粗糙时容易消耗，精细型工作反而能拉开差距。', money:'你花钱常和品质、安全感、环境舒适度有关，比起便宜，你更在意值不值得。', relation:'你很容易感觉到对方语气和态度的变化，所以安全感和清楚沟通对你特别重要。', pressure:'外界气氛、人际变化和生活品质会直接影响你的状态，你比自己以为的更需要恢复空间。' },
  appetite: { core:'你对新东西、人和体验的接受度高，人生不能一直只有同一种节奏。', second:'你很会感受机会和可能性，但选择太多时也要避免把注意力分得太散。', work:'你适合有变化、有互动、有新题目的工作，完全封闭而没有成长空间的环境很难让你久待。', money:'你愿意为体验、兴趣或新机会花钱，真正要守的是不要因为选择太多而分散资源。', relation:'你需要关系里仍有新鲜感和共同体验，太沉闷或限制太多容易让你慢慢失去兴趣。', pressure:'你容易同时被很多可能性吸引，真正累的时候往往不是没有路，而是每条路都想顾。' },
  analysis: { core:'你很容易看见问题里不合理的地方，也不会因为大家都这样做就直接接受。', second:'你的判断力来自追问和比较，但压力大时容易把一句话、一件事想得过深。', work:'你适合需要判断、拆问题、谈判或把复杂事情说清楚的工作，但别把时间都耗在证明谁对谁错。', money:'你通常不会完全凭感觉做财务决定，会希望先把风险和逻辑想明白。', relation:'你会反复想一句话背后的意思；真正适合你的人要能直接沟通，减少不必要的猜测。', pressure:'遇到说不清、没答案的事情时，你容易一直追问到底，精神消耗会因此放大。' },
  coordination: { core:'你很重视公平、分寸和彼此配合，擅长在不同立场之间找到可行做法。', second:'你不喜欢粗暴推进，环境越有秩序、合作对象越成熟，你越能发挥。', work:'你的强项是把人、流程和需求接起来，合作品质会直接决定你的工作效率。', money:'资源如果能和可靠的人、清楚的合作条件绑在一起，你通常更容易把价值放大。', relation:'你很重视尊重、分寸和互相配合，关系一旦长期失衡，你会越来越累。', pressure:'你很容易先照顾整体平衡，久了可能忘记自己其实也有不愿意接受的部分。' },
  responsibility: { core:'你很容易成为那个帮忙收尾、照顾整体的人，责任感通常比表面看起来更重。', second:'你能扛事，但要小心把别人的问题也默默变成自己的责任。', work:'你容易被交付重要或棘手的事，长期要避免成为团队里永远替别人补洞的人。', money:'你对钱的压力常和责任绑在一起，替别人承担之前要先确定自己的底线。', relation:'你在关系里容易多做一些、多照顾一些，但真正健康的关系不能永远只有你收尾。', pressure:'你太容易把“这件事总要有人处理”变成自己的责任，久了会觉得什么都压在自己身上。' },
  decisive: { core:'真正到了要做决定的时候，你其实比很多人更敢切断、重排和承担后果。', second:'你不适合长期被困在拖延的环境里，有清楚权限和明确目标时反而更有效率。', work:'你适合目标清楚、允许快速决策的工作，真正需要转向时你比想象中果断。', money:'你的财务决策一旦想清楚往往很干脆，关键是决定前把风险边界先定好。', relation:'你可以给关系机会，但如果重要问题长期没有改善，你也有能力真正做出选择。', pressure:'高压时你会变得很硬、很任务导向，需要记得替自己留下恢复空间。' },
  reinvention: { core:'你的人生很难完全照一条固定路线走到底，到了不合适的阶段会有很强的重整冲动。', second:'你的能力不是守住所有旧东西，而是知道什么时候该拆掉重来。', work:'你很适合改革、重整、创新或从零建立新流程，职业不必强迫自己永远维持同一种形式。', money:'你的收入模式也可能经历几次重整，真正重要的是每次转向都保留能带走的能力和资源。', relation:'你不太适合只有形式、没有成长的关系；到了真的不合适时，你会希望重新定义相处方式。', pressure:'你在不适合的环境里可以撑一段时间，但撑到临界点会想全部推翻，所以最好提早做小幅调整。' },
};

const EN: Record<ToneKey, ToneCopy> = {
  authority:{core:'You prefer to understand the direction for yourself rather than being led indefinitely by someone else.',second:'You have clear standards, and when a situation lacks structure you often end up taking responsibility for it.',work:'At work, you do better when you are trusted to make judgement calls and set priorities; constant micromanagement drains you.',money:'You feel calmer when you understand and control your own financial structure rather than leaving it vague.',relation:'You dislike being controlled and also struggle with people who have no direction of their own; mutual independence works better.',pressure:'Loss of control, poor standards and constantly changing rules are particularly draining for you.'},
  strategy:{core:'You think quickly, compare options and usually prefer to understand the moving parts before committing.',second:'That adaptability is useful, although too many open possibilities can keep your mind running long after the decision is due.',work:'Work that involves analysis, planning and adjustment suits you better than endless repetition.',money:'You tend to compare options before committing, which helps when it leads to a plan rather than endless delay.',relation:'You read details closely and can replay conversations in your head, so direct communication matters a great deal.',pressure:'What drains you is often not the task itself but a mind that keeps running through every possible version of it.'},
  visibility:{core:'You often handle responsibility better once you are actually in the position than while standing on the sidelines imagining it.',second:'Results and usefulness matter to you, and you can end up carrying more of other people’s expectations than you intended.',work:'You can build a stronger position in roles where responsibility, client contact or visible outcomes matter.',money:'Income tends to feel more worthwhile when it is connected to visible results or recognised value rather than invisible effort.',relation:'You need important relationships to feel responsive and engaged; prolonged indifference gradually cools your investment.',pressure:'You can quietly combine doing a good job with not wanting to disappoint anyone, which becomes heavier than it looks.'},
  practical:{core:'You are practical about effort, resources and whether something is actually worth doing.',second:'You tend to respect methods that produce a real result rather than ideas that never become usable.',work:'Your value comes from making things work in practice: accuracy, efficiency and measurable results matter more than noise.',money:'Reliable, repeatable skill is a better financial foundation for you than vague promises.',relation:'You judge relationships by reliability and follow-through as much as by chemistry.',pressure:'Repeated rework, poor efficiency and problems with no clear outcome drain you faster than hard work itself.'},
  ease:{core:'You function better when daily life is reasonably calm and cooperative rather than permanently confrontational.',second:'You usually have a softer way with people, although avoiding conflict for too long can postpone a necessary conversation.',work:'A sustainable pace and sane working relationships matter more to your performance than constant pressure.',money:'You often spend to make life easier or more comfortable, so the useful discipline is keeping short-term ease aligned with longer plans.',relation:'You want a relationship to feel liveable and kind, but avoiding every difficult conversation can create a bigger problem later.',pressure:'Keeping the peace can work in the short term, but unspoken frustration still accumulates.'},
  intensity:{core:'You have definite likes, dislikes and personal boundaries, even if you do not announce them immediately.',second:'You can adapt, but prolonged ambiguity, inconsistency or insincerity wears you down quickly.',work:'Clear rules and clean responsibility lines suit you; vague ownership and repeated reversals are especially frustrating.',money:'Once you decide something is worthwhile you can commit strongly, and when it is not, you can cut spending or effort quickly.',relation:'You have little patience for prolonged mixed signals. Once trust drops, you tend to pull your investment back quickly.',pressure:'Long periods of swallowing frustration are harder on you than one direct conversation would be.'},
  stability:{core:'You are better at making something steadily stronger than relying on one burst of momentum.',second:'Security, resources and sustainability matter, and you usually perform best when you have enough control over the pace.',work:'You benefit from work that compounds over time through reputation, repeat clients, resources or specialist skill.',money:'You generally benefit from securing dependable cash flow and a solid base before taking bigger financial risks.',relation:'In close relationships, reliability and consistent effort matter more to you than an intense beginning.',pressure:'A life with no stable base costs you more energy than you may realise, so foundations matter.'},
  sensitivity:{core:'You pick up atmosphere, detail and shifts in other people faster than you may realise.',second:'You need a certain level of calm and security; noisy or unstable environments cost you more energy than they appear to.',work:'Your eye for quality and detail can become a real advantage when the work rewards precision rather than speed alone.',money:'Quality, comfort and security influence your spending more than simply finding the cheapest option.',relation:'You notice small changes in tone and behaviour, so clear communication and emotional safety matter a lot.',pressure:'Atmosphere, interpersonal tension and the quality of your surroundings affect your energy more than you may admit.'},
  appetite:{core:'You need some variety, discovery and movement in life rather than the same rhythm indefinitely.',second:'You are good at noticing possibilities, but too many interesting options can split your attention and resources.',work:'You need enough variety and growth to stay engaged; completely closed roles with no room to evolve become stale quickly.',money:'You are willing to spend on experiences, interests or new possibilities, so the main discipline is not scattering resources across too many options.',relation:'You need some freshness and shared experience in a relationship; too much restriction or stagnation can make you disengage.',pressure:'Too many attractive possibilities can be just as tiring as too few, especially when you try to keep every door open.'},
  analysis:{core:'You notice contradictions and weak logic quickly and are unlikely to accept something simply because everyone else does.',second:'That critical thinking is valuable, but under stress you can spend too long examining a single conversation or problem.',work:'You are well suited to work that requires judgement, problem diagnosis, negotiation or explaining complexity clearly.',money:'You usually want to understand risk and logic before making a financial decision rather than acting on mood alone.',relation:'You can replay conversations in your head, so the right partner for you needs to communicate directly.',pressure:'Unclear problems and unresolved conversations can occupy more mental space than they deserve.'},
  coordination:{core:'Fairness, proportion and good cooperation matter to you, and you are often good at connecting different people or needs.',second:'You work best with mature collaborators and clear processes rather than force and unnecessary drama.',work:'A major strength is connecting people, process and expectations; the quality of collaborators matters greatly.',money:'Resources tend to work better for you when agreements and shared responsibilities are clear.',relation:'Respect, fairness and mutual effort are central for you; a relationship that stays one-sided becomes exhausting.',pressure:'You can spend so much effort keeping the whole system balanced that your own limits become easy to overlook.'},
  responsibility:{core:'You easily become the person who notices what still needs to be finished or looked after.',second:'You can carry responsibility well, but you need to notice when somebody else’s problem has quietly become yours.',work:'You are often trusted with difficult work, but should avoid becoming the permanent person who repairs everyone else’s mistakes.',money:'Financial pressure can become tied to responsibility for other people, so your own limits need to remain visible.',relation:'You often give practical support and carry extra weight, but a healthy relationship cannot depend on you doing all the repair work.',pressure:'You can turn “somebody has to deal with this” into your personal responsibility too easily.'},
  decisive:{core:'When a real decision has to be made, you can be much more decisive than people expect.',second:'You work better with clear authority and clear goals than in environments where everything is delayed indefinitely.',work:'Clear goals and genuine decision-making authority bring out your efficiency.',money:'Once the facts are clear you can make financial decisions quickly, so defining risk limits beforehand helps.',relation:'You can give a relationship time, but if an important issue never changes you are capable of making a real decision.',pressure:'Under prolonged pressure you can become very hard and task-focused, so recovery time matters.'},
  reinvention:{core:'Your life is unlikely to stay in one fixed form forever; when a structure stops fitting, you feel a strong need to rebuild it.',second:'One of your real strengths is knowing when improving the old system is no longer enough.',work:'You can be effective in rebuilding systems, launching new approaches or changing a structure that has stopped working.',money:'Your income model may be rebuilt more than once; the useful strategy is carrying transferable skill and resources into each change.',relation:'You do not thrive in relationships that survive only as a formality; when something no longer fits, you want the relationship itself to evolve.',pressure:'You can tolerate a poor fit for a while, then suddenly want to replace the whole structure; smaller earlier adjustments are usually easier.'},
};

const PHASE_HANT: Record<string, string> = {
  命:'這個十年重點是重新定義自己：哪些事還值得做、哪些角色已經不必再維持。',兄弟:'這個十年會更明顯地篩選同輩、團隊和合作方式，誰能一起走比認識多少人更重要。',夫妻:'這個十年關係與合作是重要主題，重點不是有沒有關係，而是關係本身是否成熟、平衡。',子女:'這個十年更適合把想法變成作品、項目或能留下來的成果。',財帛:'這個十年現實資源與收入結構會成為主題，適合把能力變成更穩定、可重複的價值。',疾厄:'這個十年需要重新安排生活節奏與恢復方式，避免一直靠硬撐維持輸出。',遷移:'這個十年外部環境、移動與新圈子的影響更大，很多機會不會只在原本的位置出現。',交友:'這個十年人脈與合作品質很重要，真正有用的是可靠關係，而不是社交數量。',官祿:'這個十年事業位置與責任感會被放大，適合把專業做成更清楚的位置，而不是什麼都接。',田宅:'這個十年更重視生活根基、居住與長期安全感，先把底盤整理好會讓其他選擇更穩。',福德:'這個十年真正要整理的是內在節奏與優先順序，外面做得再多，也要確認自己還願不願意這樣過。',父母:'這個十年會更常碰到家庭、長輩、制度或責任傳承的議題，需要把自己的邊界也一起立起來。',
};
const PHASE_HANS: Record<string, string> = {
  命:'这个十年重点是重新定义自己：哪些事还值得做、哪些角色已经不必再维持。',兄弟:'这个十年会更明显地筛选同辈、团队和合作方式，谁能一起走比认识多少人更重要。',夫妻:'这个十年关系与合作是重要主题，重点不是有没有关系，而是关系本身是否成熟、平衡。',子女:'这个十年更适合把想法变成作品、项目或能留下来的成果。',財帛:'这个十年现实资源与收入结构会成为主题，适合把能力变成更稳定、可重复的价值。',疾厄:'这个十年需要重新安排生活节奏与恢复方式，避免一直靠硬撑维持输出。',遷移:'这个十年外部环境、移动与新圈子的影响更大，很多机会不会只在原本的位置出现。',交友:'这个十年人脉与合作品质很重要，真正有用的是可靠关系，而不是社交数量。',官祿:'这个十年事业位置与责任感会被放大，适合把专业做成更清楚的位置，而不是什么都接。',田宅:'这个十年更重视生活根基、居住与长期安全感，先把底盘整理好会让其他选择更稳。',福德:'这个十年真正要整理的是内在节奏与优先顺序，外面做得再多，也要确认自己还愿不愿意这样过。',父母:'这个十年会更常碰到家庭、长辈、制度或责任传承的议题，需要把自己的边界也一起立起来。',
};
const PHASE_EN: Record<string, string> = {
  命:'This longer phase is about redefining your own direction and deciding which roles still belong in your life.',兄弟:'This longer phase puts more emphasis on peers, teams and collaboration. Who you build with matters more than how many people you know.',夫妻:'Partnership is a major theme in this phase. The real question is whether important relationships are mature, balanced and workable.',子女:'This longer phase favours turning ideas into projects or tangible work that can continue beyond the initial inspiration.',財帛:'Income structure and practical resources are a major theme now. It is a good period for turning skill into more repeatable value.',疾厄:'This phase asks for a more sustainable pace and better recovery habits rather than relying on endurance alone.',遷移:'External change, movement and new environments matter more in this phase; not every opportunity will come from your existing setting.',交友:'Networks and collaborators matter now, but quality and reliability are more useful than social volume.',官祿:'Career position and responsibility are amplified in this phase. The priority is to make your expertise clearer rather than simply taking on more.',田宅:'This phase puts more weight on your home base, stability and long-term foundations. A stronger base makes other decisions easier.',福德:'The deeper task of this phase is to reset your internal pace and priorities, not simply keep increasing output.',父母:'Family, authority, institutions or inherited responsibilities become more noticeable in this phase, making boundaries especially important.',
};

const YEAR_AREA_HANT: Record<string, string> = { 命:'自己的方向',兄弟:'同輩與合作',夫妻:'關係與合作',子女:'作品與新項目',財帛:'收入與資源',疾厄:'生活節奏',遷移:'外部環境與移動',交友:'人脈與團隊',官祿:'工作與位置',田宅:'生活根基',福德:'內在狀態',父母:'家庭與責任' };
const YEAR_AREA_HANS: Record<string, string> = { 命:'自己的方向',兄弟:'同辈与合作',夫妻:'关系与合作',子女:'作品与新项目',財帛:'收入与资源',疾厄:'生活节奏',遷移:'外部环境与移动',交友:'人脉与团队',官祿:'工作与位置',田宅:'生活根基',福德:'内在状态',父母:'家庭与责任' };
const YEAR_AREA_EN: Record<string, string> = { 命:'your personal direction',兄弟:'peers and collaboration',夫妻:'partnerships',子女:'projects and output',財帛:'income and resources',疾厄:'pace and recovery',遷移:'movement and external change',交友:'networks and teams',官祿:'work and position',田宅:'home base and foundations',福德:'inner priorities',父母:'family and responsibility' };

function majorStarsAt(chart: ZiweiCoreChart, palaceName: string): string[] {
  const palace = chart.palaces.find((item) => item.name === palaceName);
  if (!palace) return [];
  return Object.entries(chart.majorStars).filter(([, branch]) => branch === palace.branch).map(([star]) => star);
}
function supportingMajorStars(chart: ZiweiCoreChart, palaceName: string): string[] {
  const palace = chart.palaces.find((item) => item.name === palaceName);
  if (!palace) return [];
  const p = palaceIndexOf(palace.branch);
  const targets = new Set([p, mod12(p + 4), mod12(p + 6), mod12(p + 8)]);
  return Object.entries(chart.majorStars).filter(([, branch]) => targets.has(palaceIndexOf(branch))).map(([star]) => star);
}
function tonesFor(chart: ZiweiCoreChart, palaceName: string, max = 2): ToneKey[] {
  const exact = majorStarsAt(chart, palaceName);
  const source = exact.length ? exact : supportingMajorStars(chart, palaceName);
  return source.map((star) => STAR_TONE[star]).filter(Boolean).slice(0, max);
}
function firstTone(chart: ZiweiCoreChart, palaceName: string): ToneKey { return tonesFor(chart, palaceName, 1)[0] ?? 'stability'; }
function activeDecadal(extension: ZiweiTruthExtension, index: number | null): ZiweiDecadal | null { return index == null ? null : extension.decadals[index] ?? null; }
function natalPalaceNameForBranch(chart: ZiweiCoreChart, branch: string): string | null { return chart.palaces.find((item) => item.branch === branch)?.name ?? null; }
function yearlySignal(events: ZiweiMutagenEvent[] | undefined, transformation: '祿' | '忌'): ZiweiMutagenEvent | null { return events?.find((item) => item.transformation === transformation) ?? null; }
function evidenceForStars(chart: ZiweiCoreChart, palaceName: string, source: ZiweiPlainEvidence['source']): ZiweiPlainEvidence {
  const stars = majorStarsAt(chart, palaceName);
  const fallback = stars.length ? stars : supportingMajorStars(chart, palaceName);
  return { source, signal: `${palaceName}:${fallback.join('+') || 'no-major-star'}` };
}

export function buildZiweiPlainSummary(input: SummaryInput): ZiweiPlainSummary {
  const { chart, extension, locale, activeDecadalIndex, targetYear } = input;
  const lifeTones = tonesFor(chart, '命', 2);
  const lifePrimary = lifeTones[0] ?? 'stability';
  const bodyPalaceName = chart.palaces.find((item) => item.isBodyPalace)?.name ?? '福德';
  const lifeSecondary = lifeTones[1] ?? firstTone(chart, bodyPalaceName);
  const workTone = firstTone(chart, '官祿');
  const moneyTone = firstTone(chart, '財帛');
  const relationTone = firstTone(chart, '夫妻');
  const innerTone = firstTone(chart, '福德');
  const decadal = activeDecadal(extension, activeDecadalIndex);
  const decadalNatalName = decadal ? natalPalaceNameForBranch(chart, decadal.branch) : null;
  const yearGood = yearlySignal(extension.yearly?.mutagens, '祿');
  const yearPressure = yearlySignal(extension.yearly?.mutagens, '忌');

  const internalEvidence: ZiweiPlainEvidence[] = [
    evidenceForStars(chart, '命', 'natal'), evidenceForStars(chart, '官祿', 'work'), evidenceForStars(chart, '財帛', 'money'),
    evidenceForStars(chart, '夫妻', 'relationship'), evidenceForStars(chart, '福德', 'inner'),
  ];
  if (decadal) internalEvidence.push({ source:'decadal', signal:`${decadal.ageStart}-${decadal.ageEnd}:${decadal.branch}:${decadalNatalName ?? 'unknown'}` });
  if (extension.yearly) internalEvidence.push({ source:'yearly', signal:`${targetYear}:${extension.yearly.stem}${extension.yearly.branch}:祿→${yearGood?.natalPalaceName ?? 'none'};忌→${yearPressure?.natalPalaceName ?? 'none'}` });

  if (locale === 'en') {
    const phase = decadalNatalName ? PHASE_EN[decadalNatalName] : 'Your current longer phase is more about consolidating what works than adding commitments automatically.';
    const goodArea = yearGood?.natalPalaceName ? YEAR_AREA_EN[yearGood.natalPalaceName] : null;
    const pressureArea = yearPressure?.natalPalaceName ? YEAR_AREA_EN[yearPressure.natalPalaceName] : null;
    const paragraphs = [
      `${EN[lifePrimary].core} ${EN[lifeSecondary].second}`,
      EN[workTone].work,
      EN[moneyTone].money,
      EN[relationTone].relation,
      `The part most likely to wear you down is this: ${EN[innerTone].pressure}`,
      [phase, `For ${targetYear}, that longer theme becomes more immediate.`, goodArea ? `There is easier movement around ${goodArea}, so concentrate effort where momentum is already visible.` : '', pressureArea ? `The pressure point is more likely to show up around ${pressureArea}; clearer limits, timing and responsibilities will stop it becoming a long drain.` : ''].filter(Boolean).join(' '),
    ];
    return { version:'zhaowu_ziwei_plain_summary_v1', locale, title:'Your Zi Wei Summary', paragraphs, closing:'Your best results come from choosing fewer things deliberately, then making those choices difficult to replace.', internalEvidence };
  }

  const isHans = locale === 'zh-Hans';
  const copy = isHans ? HANS : HANT;
  const phaseMap = isHans ? PHASE_HANS : PHASE_HANT;
  const yearArea = isHans ? YEAR_AREA_HANS : YEAR_AREA_HANT;
  const goodArea = yearGood?.natalPalaceName ? yearArea[yearGood.natalPalaceName] : null;
  const pressureArea = yearPressure?.natalPalaceName ? yearArea[yearPressure.natalPalaceName] : null;
  const phase = decadalNatalName ? phaseMap[decadalNatalName] : isHans
    ? '现在这个十年更适合先把已经有效的东西做稳，不必为了变化而增加更多承诺。'
    : '現在這個十年更適合先把已經有效的東西做穩，不必為了變化而增加更多承諾。';
  const yearly = isHans
    ? [phase, `${targetYear} 年会把这个十年的主题拉近到眼前。`, goodArea ? `今年在${goodArea}上相对更容易形成推进感，适合把已经有效的方法做得更集中。` : '', pressureArea ? `同时，${pressureArea}更需要主动处理；越早把责任、期限或边界说清楚，越不容易拖成长时间的消耗。` : ''].filter(Boolean).join('')
    : [phase, `${targetYear} 年會把這個十年的主題拉近到眼前。`, goodArea ? `今年在${goodArea}上相對更容易形成推進感，適合把已經有效的方法做得更集中。` : '', pressureArea ? `同時，${pressureArea}更需要主動處理；越早把責任、期限或邊界說清楚，越不容易拖成長時間的消耗。` : ''].filter(Boolean).join('');

  return {
    version:'zhaowu_ziwei_plain_summary_v1', locale,
    title:isHans ? '紫微白话总解' : '紫微白話總解',
    paragraphs:[`${copy[lifePrimary].core}${copy[lifeSecondary].second}`, copy[workTone].work, copy[moneyTone].money, copy[relationTone].relation, copy[innerTone].pressure, yearly],
    closing:isHans ? '真正对你有利的，不是把所有可能都抓住，而是把最值得的那几件事做深、做稳。' : '真正對你有利的，不是把所有可能都抓住，而是把最值得的那幾件事做深、做穩。',
    internalEvidence,
  };
}
