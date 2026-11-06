import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useI18n, type Locale } from "@/lib/i18n";

type Copy = [string, string, string];
type Kind = "real" | "mystery" | "legend";
type Filter = "all" | Kind;

const copy = (locale: Locale, value: Copy) =>
  locale === "en" ? value[2] : locale === "zh-Hans" ? value[1] : value[0];

const kindLabel: Record<Kind, Copy> = {
  real: ["真實事件", "真实事件", "Recorded event"],
  mystery: ["未解之謎", "未解之谜", "Unresolved"],
  legend: ["網路傳說", "网络传说", "Internet lore"],
};

const timeline: Array<{
  year: string;
  kind: Kind;
  title: Copy;
  summary: Copy;
  events: Copy[];
  story: Copy;
  fact: Copy;
}> = [
  { year:"2012", kind:"real", title:["長曆結束，上帝粒子出現","长历结束，上帝粒子出现","The Long Count ends; Higgs boson confirmed"], summary:["瑪雅長曆結束，世界並未終止","玛雅长历结束，世界并未终止","The Maya Long Count cycle ends; the world continues"], events:[["瑪雅長曆完成一個週期","玛雅长历完成一个周期","The Maya Long Count completes a cycle"],["CERN 宣布發現希格斯玻色子","CERN 宣布发现希格斯玻色子","CERN announces the Higgs boson discovery"]], story:["舊歷跑完最後一格，系統只好先打補丁續命。","旧历跑完最后一格，系统只好先打补丁续命。","The old calendar reaches its last cell; the system applies a temporary patch."], fact:["長曆換輪不是末日預言；希格斯玻色子的發現是獨立的物理成果。","长历换轮不是末日预言；希格斯玻色子的发现是独立的物理成果。","A calendar cycle ending was not a doomsday prediction; the Higgs discovery is a separate scientific result."] },
  { year:"2013", kind:"real", title:["天空火球與稜鏡門","天空火球与棱镜门","Fireball and the Snowden disclosures"], summary:["車里雅賓斯克隕石、斯諾登揭露監控","车里雅宾斯克陨石、斯诺登揭露监控","Chelyabinsk meteor and Snowden disclosures"], events:[["俄羅斯車里雅賓斯克隕石形成明亮火球","俄罗斯车里雅宾斯克陨石形成明亮火球","A meteor creates a bright fireball over Chelyabinsk"],["斯諾登披露大規模監控計畫","斯诺登披露大规模监控计划","Edward Snowden discloses mass-surveillance programmes"]], story:["天上炸出一道口子，地上的人第一次發現自己一直被看著。","天上炸出一道口子，地上的人第一次发现自己一直被看着。","A rupture in the sky; people discover they may have been watched all along."], fact:["兩件事都有公開紀錄。監控疑慮來自真實披露，不是宇宙在偷看。","两件事都有公开记录。监控疑虑来自真实披露，不是宇宙在偷看。","Both events are documented. Surveillance concerns came from real disclosures, not a cosmic watcher."] },
  { year:"2014", kind:"mystery", title:["MH370 失蹤","MH370 失踪","The disappearance of MH370"], summary:["航班失蹤成為沉重的未解事件","航班失踪成为沉重的未解事件","A flight's disappearance remains a grave unresolved event"], events:[["馬來西亞航空 MH370 失蹤","马来西亚航空 MH370 失踪","Malaysia Airlines Flight MH370 disappears"],["網路用「被刪除」形容無法接受的空白","网络用“被删除”形容无法接受的空白","Online stories describe the absence as if the flight were deleted"]], story:["不是墜毀，是檔案從現實資料夾裡被刪掉了。","不是坠毁，是档案从现实文件夹里被删掉了。","Not a crash, but a file erased from reality's folder."], fact:["失蹤是事實；「被刪除」是比喻，不能當成事件結論。","失踪是事实；“被删除”是比喻，不能当成事件结论。","The disappearance is real; “deleted” is a metaphor, not an explanation."] },
  { year:"2015", kind:"legend", title:["裙子與曼德拉效應","裙子与曼德拉效应","The dress and the Mandela effect"], summary:["藍黑或白金？集體記憶開始流行","蓝黑或白金？集体记忆开始流行","Blue and black or white and gold? Memory becomes a meme"], events:[["裙子照片引發不同顏色感知的爭論","裙子照片引发不同颜色感知的争论","A dress photo sparks disagreement about perceived colours"],["曼德拉效應成為網路熱詞","曼德拉效应成为网络热词","The Mandela effect becomes a popular online term"]], story:["同一張圖出現兩種版本，像舊檔與新檔正在打架。","同一张图出现两种版本，像旧档与新档正在打架。","One image, two versions—old and new files fighting for the screen."], fact:["裙子涉及光線與色彩感知；曼德拉效應可由記憶重構與傳播放大解釋。","裙子涉及光线与色彩感知；曼德拉效应可由记忆重构与传播放大解释。","The dress concerns colour perception; memory reconstruction and social spread can amplify shared misremembering."] },
  { year:"2016", kind:"legend", title:["預言梗與集體錯亂感","预言梗与集体错乱感","Prediction memes and shared confusion"], summary:["事後剪輯讓巧合看起來像預言","事后剪辑让巧合看起来像预言","Hindsight edits make coincidences look like predictions"], events:[["辛普森預言梗廣泛傳播","辛普森预言梗广泛传播","The “Simpsons predicted it” meme spreads"],["哈拉姆貝事件成為全球網路話題","哈拉姆贝事件成为全球网络话题","The Harambe story becomes a global online topic"]], story:["梗越傳越真，補丁開始出現大面積貼圖錯誤。","梗越传越真，补丁开始出现大面积贴图错误。","Memes harden into memory; the patch begins to misrender its textures."], fact:["多數「預言」是事後剪輯與巧合拼接，不能把後來的敘事當成原始證據。","多数“预言”是事后剪辑与巧合拼接，不能把后来的叙事当成原始证据。","Many “predictions” are retrospective edits or coincidences, not evidence of foresight."] },
  { year:"2017", kind:"mystery", title:["奧陌陌來訪","奥陌陌来访","ʻOumuamua passes through"], summary:["首個確認的星際天體之一引發討論","首个确认的星际天体之一引发讨论","An early confirmed interstellar object prompts debate"], events:[["天文學家觀測到星際天體 ʻOumuamua","天文学家观测到星际天体 ʻOumuamua","Astronomers observe the interstellar object ʻOumuamua"],["形狀與加速特徵引發研究討論","形状与加速特征引发研究讨论","Its shape and acceleration prompt scientific debate"]], story:["一個不屬於太陽系的來客，像別的伺服器派來的巡檢程式。","一个不属于太阳系的来客，像别的服务器派来的巡检程序。","A visitor from beyond the Solar System, like an inspection process from another server."], fact:["它是真實觀測到的星際天體；現象仍有研究討論，不等於外星飛船證據。","它是真实观测到的星际天体；现象仍有研究讨论，不等于外星飞船证据。","It is a real interstellar object; scientific debate is not evidence of an alien craft."] },
  { year:"2018", kind:"legend", title:["時間流速變快梗","时间流速变快梗","The “time is speeding up” meme"], summary:["愈來愈多人說一年比一年過得快","越来越多人说一年比一年过得快","More people say each year feels shorter"], events:[["「一年像幾個月」成為常見說法","“一年像几个月”成为常见说法","“A year feels like a few months” becomes common"],["生活重複與資訊密度改變時間感","生活重复与信息密度改变时间感","Routine and information density shape time perception"]], story:["補丁為了省算力，把一年壓縮成幾個滑過去的片段。","补丁为了省算力，把一年压缩成几个滑过去的片段。","The patch saves compute by compressing a year into a few passing frames."], fact:["主觀時間感受會受生活節奏與注意力影響；日曆本身沒有加速。","主观时间感受会受生活节奏与注意力影响；日历本身没有加速。","Subjective time can shift with routine and attention; the calendar itself has not sped up."] },
  { year:"2019", kind:"real", title:["黑洞照片與暫停前一秒","黑洞照片与暂停前一秒","The first black-hole image"], summary:["科研里程碑與網路玩笑被串成同一故事","科研里程碑与网络玩笑被串成同一故事","A scientific milestone and an internet prank enter one story"], events:[["事件視界望遠鏡公布首張黑洞影像","事件视界望远镜公布首张黑洞影像","The Event Horizon Telescope releases the first black-hole image"],["「風暴 51 區」成為大型網路玩笑","“风暴 51 区”成为大型网络玩笑","“Storm Area 51” becomes a large online joke"]], story:["人類第一次拍到黑洞，接著現實像被按下暫停鍵。","人类第一次拍到黑洞，接着现实像被按下暂停键。","Humanity images a black hole, then reality seems to hit pause."], fact:["黑洞影像是科研成果；51 區事件是網路動員與玩笑。把它們連起來是敘事，不是因果。","黑洞影像是科研成果；51 区事件是网络动员与玩笑。把它们连起来是叙事，不是因果。","The black-hole image is a research milestone; Area 51 was an online event. Their link is a story, not causation."] },
  { year:"2020", kind:"real", title:["封鎖與斷裂的一年","封锁与断裂的一年","Lockdowns and a disrupted year"], summary:["全球疫情打斷日常節奏","全球疫情打断日常节奏","The pandemic disrupts ordinary routines"], events:[["全球 COVID-19 疫情與封鎖措施","全球 COVID-19 疫情与封锁措施","COVID-19 and lockdown measures around the world"],["人們形容這一年像從日曆中消失","人们形容这一年像从日历中消失","People describe the year as if it vanished from the calendar"]], story:["伺服器進入維護模式，街道清空，玩家全部下線。","服务器进入维护模式，街道清空，玩家全部下线。","The server enters maintenance; streets empty and all players log off."], fact:["生活節奏被打斷會改變記憶與時間感；這不代表某一年被現實刪除。","生活节奏被打断会改变记忆与时间感；这不代表某一年被现实删除。","Disrupted routines can alter memory and time perception; it does not mean a year was erased."] },
  { year:"2021", kind:"real", title:["元宇宙概念爆發","元宇宙概念爆发","The metaverse boom"], summary:["虛擬與現實的邊界成為熱門議題","虚拟与现实的边界成为热门议题","The boundary between virtual and physical worlds becomes a hot topic"], events:[["元宇宙成為科技與商業熱詞","元宇宙成为科技与商业热词","The metaverse becomes a technology and business buzzword"],["現實與虛擬世界的關係受到討論","现实与虚拟世界的关系受到讨论","People debate the relationship between virtual and physical life"]], story:["補丁同時運行兩個世界，哪一個是主線已經說不清。","补丁同时运行两个世界，哪一个是主线已经说不清。","The patch runs two worlds at once; no one knows which is the main quest."], fact:["這是真實的商業與技術熱潮；討論邊界不代表兩種世界已互相替換。","这是真实的商业与技术热潮；讨论边界不代表两种世界已互相替换。","It was a real commercial and technical trend; debate does not mean one world replaced the other."] },
  { year:"2022", kind:"legend", title:["既視感短影片爆紅","既视感短视频爆红","Déjà vu goes viral"], summary:["私人感受變成公開接龍的網路梗","私人感受变成公开接龙的网络梗","Private experiences become a shared online meme"], events:[["既視感短影片廣泛流傳","既视感短视频广泛流传","Déjà-vu videos circulate widely"],["留言區聚集相似經驗","留言区聚集相似经验","Comments gather similar experiences"]], story:["短影片像回放，補丁用舊素材填滿新的一天。","短视频像回放，补丁用旧素材填满新的一天。","Short videos feel like replays; the patch fills today with yesterday's footage."], fact:["既視感是常見體驗；社群平台讓相似描述更容易彼此看見。","既视感是常见体验；社交平台让相似描述更容易彼此看见。","Déjà vu is a common experience; social platforms make similar accounts easier to find."] },
  { year:"2023", kind:"real", title:["AI 大爆發與 UAP 聽證會","AI 大爆发与 UAP 听证会","AI boom and UAP hearings"], summary:["生成影像真假難辨；聽證會討論不明現象","生成影像真假难辨；听证会讨论不明现象","Synthetic media blurs images; hearings discuss unexplained phenomena"], events:[["生成式 AI 快速普及","生成式 AI 快速普及","Generative AI spreads rapidly"],["美國國會舉行不明異常現象聽證會","美国国会举行不明异常现象听证会","The US Congress holds hearings on unidentified anomalous phenomena"]], story:["圖片可以現編，證詞可以上桌，現實的防偽標籤開始失效。","图片可以现编，证词可以上桌，现实的防伪标签开始失效。","Images can be invented and testimony can be heard; reality's verification tag begins to fail."], fact:["聽證會討論未識別現象，不等於承認外星來訪；AI 影像問題也需要逐件核驗。","听证会讨论未识别现象，不等于承认外星来访；AI 影像问题也需要逐件核验。","Hearings about unidentified phenomena do not confirm extraterrestrials; synthetic media still needs case-by-case verification."] },
  { year:"2024", kind:"mystery", title:["無人機、光柱與怪聲","无人机、光柱与怪声","Drones, light columns and strange sounds"], summary:["不同來源的目擊被放進同一神秘資料夾","不同来源的目击被放进同一神秘文件夹","Reports from different sources are grouped as one mystery"], events:[["各地出現神秘無人機目擊報告","各地出现神秘无人机目击报告","Reports of mysterious drone sightings appear"],["網路流傳光柱與怪聲影像","网络流传光柱与怪声影像","Videos of light columns and strange sounds circulate online"]], story:["夜空出現不屬於任何航班的光點，像是補丁在後台更新。","夜空出现不属于任何航班的光点，像是补丁在后台更新。","Lights appear outside familiar flight paths, as if the patch updates in the background."], fact:["目擊來源各異，可能涉及無人機、光學現象與城市噪音；需要分開核對。","目击来源各异，可能涉及无人机、光学现象与城市噪声；需要分开核对。","Reports have different sources—drones, optical effects or urban noise—and should be checked separately."] },
  { year:"2025", kind:"legend", title:["時間滑移故事","时间滑移故事","Time-slip stories"], summary:["短影片流傳「路上少了幾分鐘」的經歷","短视频流传“路上少了几分钟”的经历","Videos describe losing minutes on familiar routes"], events:[["社群流傳時間滑移第一人稱故事","社群流传时间滑移第一人称故事","First-person time-slip stories circulate online"],["故事通常沒有可驗證的時間紀錄","故事通常没有可验证的时间记录","Accounts usually lack verifiable time records"]], story:["同一條路，有人走五分鐘，有人走十五分鐘，補丁開了傳送門。","同一条路，有人走五分钟，有人走十五分钟，补丁开了传送门。","One road takes five minutes for one person and fifteen for another—the patch opens a portal."], fact:["走神、繞路與時間紀錄誤差等日常原因，比時空裂縫更常見。","走神、绕路与时间记录误差等日常原因，比时空裂缝更常见。","Distraction, detours and clock discrepancies are more common explanations than a spacetime rift."] },
  { year:"2026", kind:"legend", title:["集體夢到同一座城市","集体梦到同一座城市","The shared-dream city"], summary:["短影片留言串起相似夢境敘述","短视频评论串起相似梦境叙述","Comments link similar dream accounts"], events:[["「夢見同一個地方」說法在短影片流傳","“梦见同一个地方”说法在短视频流传","Videos share claims of dreaming about the same place"],["相似留言被演算法聚集與推薦","相似留言被算法聚集与推荐","Algorithms gather and recommend similar comments"]], story:["很多人醒來發現夢裡去過同一座城市，像收到統一更新包。","很多人醒来发现梦里去过同一座城市，像收到统一更新包。","Many wake from the same city-dream, as if a shared update were pushed overnight."], fact:["相似敘事會互相影響；夢境若沒有即時記錄，很難排除事後認領。","相似叙事会互相影响；梦境若没有即时记录，很难排除事后认领。","Similar stories can influence one another; without contemporaneous records, retrospective matching is hard to rule out."] },
  { year:"2027", kind:"legend", title:["補丁到期？傳說中的回檔點","补丁到期？传说中的回档点","Patch expiry? The rumoured rollback"], summary:["故事把 2027.12.21 設為結算點","故事把 2027.12.21 设为结算点","A story sets 2027-12-21 as a settlement date"], events:[["網路故事把日期寫成「系統結算點」","网络故事把日期写成“系统结算点”","Online stories call the date a “system settlement”"],["沒有可驗證的宇宙倒數","没有可验证的宇宙倒数","There is no verifiable cosmic countdown"]], story:["十五年試運行結束，系統要選擇續費、回檔或正式上線。","十五年试运行结束，系统要选择续费、回档或正式上线。","After fifteen years, the system chooses renewal, rollback or launch."], fact:["這個結算點只存在於創作傳說，沒有可驗證的預言或倒數。","这个结算点只存在于创作传说，没有可验证的预言或倒计时。","The settlement date exists only in the creative story; there is no verifiable prophecy or countdown."] },
];

const questions: Array<{ code: string; question: Copy }> = [
  { code:"DEJA_VU", question:["你有沒有過強烈的既視感，覺得眼前一幕已發生過？","你有没有过强烈的既视感，觉得眼前一幕已发生过？","Have you had a strong sense that the moment has happened before?"] },
  { code:"MEMORY_LEAK", question:["你有沒有突然想不起熟悉的詞或人名，過一會兒才想起？","你有没有突然想不起熟悉的词或人名，过一会儿才想起？","Have you briefly forgotten a familiar word or name, then remembered it later?"] },
  { code:"TIME_SCALE", question:["你有沒有覺得 2012 年之後，時間過得明顯更快？","你有没有觉得 2012 年之后，时间过得明显更快？","Has time felt noticeably faster to you since 2012?"] },
  { code:"DREAM_SYNC", question:["你有沒有夢過陌生地方，後來覺得它與現實相似？","你有没有梦过陌生地方，后来觉得它与现实相似？","Have you dreamed of an unfamiliar place that later felt familiar in real life?"] },
  { code:"FRAME_DROP", question:["你有沒有在某一刻覺得周圍的世界像是卡了一下？","你有没有在某一刻觉得周围的世界像是卡了一下？","Have you ever felt as if the world briefly stuttered?"] },
];

const archives: Array<{ title: Copy; story: Copy; fact: Copy }> = [
  { title:["裙子之謎 THE DRESS","裙子之谜 THE DRESS","The Dress"], story:["同一張照片，有人看見藍黑，有人看見白金，像各自載入不同版本的貼圖。","同一张照片，有人看见蓝黑，有人看见白金，像各自载入不同版本的贴图。","One photo, two colour readings—as if each viewer loaded a different texture."], fact:["照片光照資訊不完整，大腦會以不同白平衡假設補全。","照片光照信息不完整，大脑会以不同白平衡假设补全。","Ambiguous lighting lets the brain infer different white-balance conditions."] },
  { title:["大富翁先生的單片眼鏡","大富翁先生的单片眼镜","The Monopoly Man's monocle"], story:["很多人記得他戴著單片眼鏡，翻出原圖卻找不到。","很多人记得他戴着单片眼镜，翻出原图却找不到。","Many recall a monocle, but it is absent from the familiar image."], fact:["禮帽、手杖與富豪形象容易和其他角色記憶拼在一起。","礼帽、手杖与富豪形象容易和其他角色记忆拼在一起。","A top hat, cane and wealthy character can blend with other remembered images."] },
  { title:["時間丟失 LOST_MINUTES","时间丢失 LOST_MINUTES","Lost minutes"], story:["出門幾分鐘，回神看表卻少了二十分鐘，像路段被跳過。","出门几分钟，回神看表却少了二十分钟，像路段被跳过。","A short errand seems to consume twenty minutes that you cannot place."], fact:["熟路上的走神與注意力切換，會讓回憶壓縮路程。","熟路上的走神与注意力切换，会让回忆压缩路程。","Mind-wandering on a familiar route can compress what gets encoded into memory."] },
  { title:["陌生又熟悉的街道","陌生又熟悉的街道","A street that feels familiar"], story:["第一次走進一條街，卻覺得早知道轉角會出現什麼。","第一次走进一条街，却觉得早知道转角会出现什么。","A first visit feels like a scene you already know."], fact:["相似街道結構與模式辨識，可能帶來熟悉感錯覺。","相似街道结构与模式识别，可能带来熟悉感错觉。","Similar layouts and pattern recognition can create a feeling of familiarity."] },
  { title:["手機裡的陌生照片","手机里的陌生照片","The unfamiliar photo"], story:["相簿裡多了一張場景熟悉、卻想不起何時拍下的照片。","相册里多了一张场景熟悉、却想不起何时拍下的照片。","A familiar-looking photo appears, but its moment is hard to recall."], fact:["誤觸、連拍、家人借用或雲端同步，都是可先查的來源。","误触、连拍、家人借用或云端同步，都是可先查的来源。","Check accidental capture, burst mode, shared devices and cloud sync first."] },
  { title:["夢裡的城市 DREAM_CITY","梦里的城市 DREAM_CITY","The city in a dream"], story:["多年反覆夢見一座城市，後來在新聞裡看見相似街景。","多年反复梦见一座城市，后来在新闻里看见相似街景。","A recurring dream city later resembles a place seen in the news."], fact:["夢境會拼貼日常影像；沒有即時記錄時，回憶容易被新線索改寫。","梦境会拼贴日常影像；没有即时记录时，回忆容易被新线索改写。","Dreams remix daily imagery; later information can reshape recollection without a dated record."] },
];

const endings: Array<{ id: "rollback" | "upgrade" | "maintain"; title: Copy; code: string; body: Copy }> = [
  { id:"rollback", code:"ROLLBACK", title:["結局 A · 回檔","结局 A · 回档","Ending A · Rollback"], body:["回到 2012.12.20，重新站上分叉點。這是故事，不是預測。","回到 2012.12.20，重新站上分叉点。这是故事，不是预测。","Return to the branch point on 20 Dec 2012. A story ending, not a forecast."] },
  { id:"upgrade", code:"UPGRADE", title:["結局 B · 升級","结局 B · 升级","Ending B · Upgrade"], body:["補丁修復成功，世界進入新版本。這是故事，不是預測。","补丁修复成功，世界进入新版本。这是故事，不是预测。","The patch succeeds and the world upgrades. A story ending, not a forecast."] },
  { id:"maintain", code:"MAINTAIN", title:["結局 C · 維持","结局 C · 维持","Ending C · Maintain"], body:["沒有大結局，也沒有大崩潰；生活繼續往前。這是故事，不是預測。","没有大结局，也没有大崩溃；生活继续往前。这是故事，不是预测。","No grand finale, no collapse; ordinary life continues. A story ending, not a forecast."] },
];

function Frame({ label, children }: { label: Copy; children: ReactNode }) {
  const { locale } = useI18n();
  return <div className="rounded-xl border border-emerald-900/15 bg-[#f7f4e9] p-4 sm:p-5"><p className="mb-2 font-mono text-[10px] tracking-[0.16em] text-emerald-800">{copy(locale,label)}</p><div className="text-sm leading-7 text-[#33453b]">{children}</div></div>;
}

export function RealityPatchSection() {
  const { locale } = useI18n();
  const [filter, setFilter] = useState<Filter>("all");
  const [openYears, setOpenYears] = useState<string[]>(["2012"]);
  const [answers, setAnswers] = useState<Record<number, { score: number; choice: number }>>({});
  const [ending, setEnding] = useState<"rollback" | "upgrade" | "maintain">("maintain");
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const target = Date.parse("2027-12-21T00:00:00Z");
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const filtered = useMemo(() => timeline.filter((item) => filter === "all" || item.kind === filter), [filter]);
  const score = Object.values(answers).reduce((sum, answer) => sum + answer.score, 0);
  const answered = Object.keys(answers).length;
  const days = remaining === null ? 0 : Math.floor(remaining / 86_400_000);
  const hours = remaining === null ? 0 : Math.floor(remaining % 86_400_000 / 3_600_000);
  const minutes = remaining === null ? 0 : Math.floor(remaining % 3_600_000 / 60_000);
  const seconds = remaining === null ? 0 : Math.floor(remaining % 60_000 / 1000);
  const selectedEnding = endings.find((item) => item.id === ending)!;

  const toggleYear = (year: string) =>
    setOpenYears((current) => current.includes(year) ? current.filter((item) => item !== year) : [...current, year]);

  return (
    <section id="reality-patch-archive" className="scroll-mt-20 overflow-hidden rounded-2xl border border-emerald-900/20 bg-[#f0eee4] text-[#1b2b22]" aria-labelledby="reality-patch-title">
      <header className="relative overflow-hidden bg-[#08251a] px-5 py-10 text-[#e7f3e9] sm:px-9 sm:py-14">
        <div className="absolute inset-0 opacity-20" aria-hidden="true" style={{ backgroundImage:"repeating-linear-gradient(0deg,transparent 0 4px,rgba(0,0,0,.24) 5px 6px),radial-gradient(ellipse at 70% 20%,rgba(32,243,154,.32),transparent 48%)" }} />
        <div className="relative">
          <p className="font-mono text-[10px] tracking-[0.2em] text-emerald-300">PATCH_LIVE: 2012.12.21 · REALITY VERSION 2.012</p>
          <p className="mt-5 font-mono text-xs tracking-[0.22em] text-emerald-200">{copy(locale,["觀世錄 · 特別專題","观世录 · 特别专题","NOTES ON LIFE · SPECIAL FEATURE"])}</p>
          <h2 id="reality-patch-title" className="mt-2 max-w-3xl font-display text-3xl leading-tight text-white sm:text-5xl">
            {copy(locale,["I'm Awake｜現實補丁檔案","I'm Awake｜现实补丁档案","I'm Awake | The Reality Patch Archive"])}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50/80 sm:text-base">
            {copy(locale,["2012.12.21 不是末日預言。這是一個互動故障藝術故事：把長曆換輪後的網路傳說、真實事件與未解疑問分開閱讀。","2012.12.21 不是末日预言。这是一个互动故障艺术故事：把长历换轮后的网络传说、真实事件与未解疑问分开阅读。","21 Dec 2012 was not a doomsday prophecy. This interactive glitch-fiction archive separates internet lore, recorded events and open questions."])}
          </p>
          <a href="#patch-timeline" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-md bg-emerald-300 px-5 py-2 text-sm font-semibold text-[#092116] transition hover:-translate-y-0.5 hover:bg-emerald-200">
            {copy(locale,["進入檔案","进入档案","Enter the archive"])} <span aria-hidden="true">→</span>
          </a>
        </div>
      </header>

      <div className="space-y-12 px-4 py-8 sm:space-y-16 sm:px-8 sm:py-12">
        <section aria-labelledby="patch-origin">
          <p className="font-mono text-[10px] tracking-[0.18em] text-emerald-800">2012 PATCH THEORY · FIVE FRAGMENTS</p>
          <h3 id="patch-origin" className="mt-2 font-display text-2xl text-[#1b2b22] sm:text-3xl">{copy(locale,["現實打了補丁，我們還在舊版本裡。","现实打了补丁，我们还在旧版本里。","Reality received a patch. We are still on the old version."])}</h3>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              { code:"01 // ORIGIN", title:["起源 · THE PATCH","起源 · THE PATCH","Origin · The patch"], text:["瑪雅長曆結束，本該切換卻打了補丁。補丁論把日曆換輪想像成現實的分支點。","玛雅长历结束，本该切换却打了补丁。补丁论把日历换轮想象成现实的分支点。","The patch theory turns a calendar cycle into a branch point in reality."] },
              { code:"02 // SYMPTOM", title:["症狀 · LAG & LEAK","症状 · LAG & LEAK","Symptoms · Lag & leak"], text:["時間變快、記憶變差、注意力變短——故事把日常感受寫成系統掉幀。","时间变快、记忆变差、注意力变短——故事把日常感受写成系统掉帧。","Faster-feeling time and faltering attention become system lag in the story."] },
              { code:"03 // GLITCHES", title:["所謂證據 · GLITCHES","所谓证据 · GLITCHES","Supposed evidence · Glitches"], text:["曼德拉效應、既視感與網路迷因被串在一起，像補丁日誌中的 [REWRITE]。","曼德拉效应、既视感与网络迷因被串在一起，像补丁日志中的 [REWRITE]。","Mandela effects, déjà vu and memes are woven into a fictional [REWRITE] log."] },
              { code:"04 // ROLLBACK", title:["結局 · ROLLBACK","结局 · ROLLBACK","Ending · Rollback"], text:["傳說中的補丁崩潰會回檔到 2012.12.20。這是劇情設定，不是時間線預測。","传说中的补丁崩溃会回档到 2012.12.20。这是剧情设定，不是时间线预测。","A fictional rollback to 20 Dec 2012—not a forecast."] },
              { code:"05 // RATIONAL", title:["理性視角 · DEBUNK","理性视角 · DEBUNK","Rational view · Debunk"], text:["長曆換輪只是計數週期完成。把零散事件連成補丁故事，並不能證明現實遭到改寫。","长历换轮只是计数周期完成。把零散事件连成补丁故事，并不能证明现实遭到改写。","A calendar cycle ending does not prove reality was rewritten."] },
            ].map((item) => <article key={item.code} className="rounded-lg border border-emerald-900/15 bg-[#f8f6ee] p-4 sm:p-5"><p className="font-mono text-[10px] tracking-[0.15em] text-emerald-800">{item.code}</p><h4 className="mt-2 font-semibold">{copy(locale,item.title)}</h4><p className="mt-2 text-sm leading-7 text-[#536357]">{copy(locale,item.text)}</p></article>)}
          </div>
        </section>

        <section id="patch-timeline" className="scroll-mt-24" aria-labelledby="patch-timeline-title">
          <p className="font-mono text-[10px] tracking-[0.18em] text-emerald-800">TIMELINE // 2012—2027</p>
          <h3 id="patch-timeline-title" className="mt-2 font-display text-2xl sm:text-3xl">{copy(locale,["這 15 年，發生了什麼？","这 15 年，发生了什么？","What happened in these 15 years?"])}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#536357]">{copy(locale,["這不是證據鏈，而是人們如何把事件寫進故事。每列可展開，查看「補丁版本」與「理性拆解」。","这不是证据链，而是人们如何把事件写进故事。每列可展开，查看“补丁版本”与“理性拆解”。","This is not a chain of evidence; it shows how events get written into a story. Expand a year to compare the fiction with a rational reading."])}</p>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={copy(locale,["篩選時間線","筛选时间线","Filter timeline"])}>
            {(["all","real","mystery","legend"] as Filter[]).map((value) => <button key={value} type="button" aria-pressed={filter===value} onClick={() => setFilter(value)} className={`min-h-10 rounded-md border px-3 text-xs transition ${filter===value?"border-emerald-800 bg-emerald-800 text-white":"border-emerald-900/20 bg-white/70 text-[#405247] hover:border-emerald-700"}`}>{value==="all"?copy(locale,["全部年份","全部年份","All years"]):copy(locale,kindLabel[value])}</button>)}
            <button type="button" className="ml-auto min-h-10 rounded-md px-3 text-xs text-emerald-900 underline underline-offset-4" onClick={() => setOpenYears(filtered.map((item)=>item.year))}>{copy(locale,["全部展開","全部展开","Expand all"])}</button>
            <button type="button" className="min-h-10 rounded-md px-3 text-xs text-emerald-900 underline underline-offset-4" onClick={() => setOpenYears([])}>{copy(locale,["全部收起","全部收起","Collapse all"])}</button>
          </div>
          <p className="mt-2 text-xs text-[#6b7a6e]">{copy(locale,["目前顯示","当前显示","Showing"])} {filtered.length} / 16 {copy(locale,["年 · 已展開 ","年 · 已展开 ","years · expanded "])}{openYears.filter((year)=>filtered.some((item)=>item.year===year)).length}</p>
          <div className="mt-3 space-y-2">
            {filtered.map((item,index) => {
              const isOpen = openYears.includes(item.year);
              return <details key={item.year} open={isOpen} onToggle={(event) => { const next=(event.currentTarget as HTMLDetailsElement).open; setOpenYears((current)=>current.includes(item.year)===next?current:next?[...current,item.year]:current.filter((year)=>year!==item.year)); }} className="group rounded-lg border border-emerald-900/15 bg-[#faf8f1]">
                <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-3 py-3 sm:px-4 [&::-webkit-details-marker]:hidden"><span className="font-mono text-lg text-emerald-800">{item.year}</span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{copy(locale,item.title)}</span><span className="block text-xs text-[#718075]">{copy(locale,item.summary)}</span></span><span className="rounded-full border border-emerald-900/15 px-2 py-1 text-[9px] text-emerald-900">{copy(locale,kindLabel[item.kind])}</span><span aria-hidden="true" className="text-emerald-800 group-open:rotate-45">＋</span></summary>
                <div className="space-y-4 border-t border-emerald-900/10 px-4 py-4 sm:px-5">
                  <ul className="list-disc space-y-1 pl-5 text-sm text-[#44564b]">{item.events.map((event,i)=><li key={i}>{copy(locale,event)}</li>)}</ul>
                  <div className="grid gap-3 md:grid-cols-2"><Frame label={["補丁解讀 · 故事版本","补丁解读 · 故事版本","PATCH READING · STORY VERSION"]}>{copy(locale,item.story)}</Frame><Frame label={["理性拆解 · 事實邊界","理性拆解 · 事实边界","RATIONAL READING · FACT BOUNDARY"]}>{copy(locale,item.fact)}</Frame></div>
                </div>
              </details>;
            })}
          </div>
          <div className="mt-5 rounded-lg border border-amber-800/25 bg-[#f4edda] p-4 text-sm leading-7 text-[#56492c]"><strong className="font-mono text-[10px] tracking-[0.14em] text-amber-900">RATIONAL REMINDER</strong><p className="mt-2 mb-0">{copy(locale,["真實事件 ≠ 補丁證據；未解 ≠ 超自然；網路傳說 ≠ 親歷。補丁論是創作梗，不是科學理論。","真实事件 ≠ 补丁证据；未解 ≠ 超自然；网络传说 ≠ 亲历。补丁论是创作梗，不是科学理论。","Recorded events are not proof of a patch; unresolved does not mean supernatural; internet lore is not firsthand evidence. Patch theory is fiction, not science."])}</p></div>
        </section>

        <section aria-labelledby="awake-test-title">
          <p className="font-mono text-[10px] tracking-[0.18em] text-emerald-800">SECTION 01 // AWAKE TEST</p>
          <h3 id="awake-test-title" className="mt-2 font-display text-2xl sm:text-3xl">{copy(locale,["覺醒自測 · 你是不是「記得的人」？","觉醒自测 · 你是不是“记得的人”？","Awake test · Are you one who remembers?"])}</h3>
          <p className="mt-2 text-sm leading-7 text-[#536357]">{copy(locale,["五題即時計分，只是整理感受的趣味互動，不是心理測驗、診斷或超能力判定。作答只保留在當前頁面。","五题即时计分，只是整理感受的趣味互动，不是心理测试、诊断或超能力判定。作答只保留在当前页面。","Five quick prompts for reflection—not a psychological test, diagnosis or ability detector. Answers stay in this page only."])}</p>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px]">
            <div className="space-y-3">{questions.map((item,index)=><fieldset key={item.code} className="rounded-lg border border-emerald-900/15 bg-[#faf8f1] p-4"><legend className="font-mono text-[10px] tracking-[0.12em] text-emerald-800">Q {index+1} · {item.code}</legend><p className="mb-3 mt-2 text-sm font-medium">{copy(locale,item.question)}</p><div className="flex flex-wrap gap-2">{[[0,["沒有印象","没有印象","Not really"]],[1,["偶爾有過","偶尔有过","Sometimes"]],[1,["經常這樣","经常这样","Often"]]].map(([value,label],optionIndex)=><label key={optionIndex} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-emerald-900/15 px-3 text-xs has-[:checked]:border-emerald-700 has-[:checked]:bg-emerald-50 has-[:checked]:text-emerald-900"><input type="radio" name={`patch-q-${index}`} value={String(value)} checked={answers[index]?.choice===optionIndex} onChange={() => setAnswers((current)=>({...current,[index]:{score:Number(value),choice:optionIndex}}))} className="accent-emerald-700"/>{copy(locale,label as Copy)} +{value}</label>)}</div></fieldset>)}</div>
            <aside className="rounded-lg bg-[#08251a] p-5 text-center text-white lg:sticky lg:top-24 lg:self-start" aria-live="polite"><p className="font-mono text-[10px] tracking-[0.16em] text-emerald-200">{copy(locale,["即時得分","即时得分","LIVE SCORE"])}</p><p className="my-2 font-mono text-5xl text-emerald-300">{score}<span className="text-lg text-emerald-100/60"> / 5</span></p><div className="h-1 overflow-hidden bg-white/15"><div className="h-full bg-emerald-300 transition-all" style={{width:`${score*20}%`}}/></div><p className="mt-3 text-xs leading-6 text-emerald-50/80">{copy(locale,["已答","已答","Answered"])} {answered}/5<br/>{answered<5?copy(locale,["答完即可看結果；選擇不會儲存。","答完即可看结果；选择不会保存。","Finish to see a reflection; answers are not saved."]):score>=4?copy(locale,["故事訊號很強。記得分開感受與事實。","故事信号很强。记得分开感受与事实。","Strong story signal. Keep feelings and evidence separate."]):score>=2?copy(locale,["有些體驗與你共鳴；保持好奇，也保持核對。","有些体验与你共鸣；保持好奇，也保持核对。","Some prompts resonate. Stay curious and keep checking."]):copy(locale,["訊號平穩；每個人的時間感受都不同。","信号平稳；每个人的时间感受都不同。","Steady signal. Everyone experiences time differently."])}</p></aside>
          </div>
        </section>

        <section aria-labelledby="patch-levels-title">
          <p className="font-mono text-[10px] tracking-[0.18em] text-emerald-800">SECTION 02 // PATCH LEVELS</p>
          <h3 id="patch-levels-title" className="mt-2 font-display text-2xl sm:text-3xl">{copy(locale,["從「感覺不對」到完全覺醒","从“感觉不对”到完全觉醒","From “something feels off” to fully awake"])}</h3>
          <p className="mt-2 text-sm text-[#536357]">{copy(locale,["等級是敘事刻度，不是能力排名。真正的 Lv.5，是慢下來、記下來，再把故事和事實分清楚。","等级是叙事刻度，不是能力排名。真正的 Lv.5，是慢下来、记下来，再把故事和事实分清楚。","Levels are a story device, not a ranking. Lv.5 means slowing down, taking notes, and separating story from fact."])}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">{[
            ["Lv.1","感覺不對勁","感觉不对劲","Something feels off","SOMETHING_OFF","第一次覺得時間變快","第一次觉得时间变快","First sense that time is speeding up"],
            ["Lv.2","記憶閃回","记忆闪回","Memory flash","MEMORY_FLASH","熟悉的詞突然想不起","熟悉的词突然想不起","A familiar word slips away"],
            ["Lv.3","時間滑移","时间滑移","Time slip","TIME_SLIP","短途時間對不上","短途时间对不上","A short trip seems to lose time"],
            ["Lv.4","既視感頻繁","既视感频繁","Déjà-vu loop","DEJA_VU_LOOP","高頻既視感或提前猜中","高频既视感或提前猜中","Frequent déjà vu or guessing ahead"],
            ["Lv.5","完全覺醒","完全觉醒","Fully awake","FULLY_AWAKE","主動記錄、核對、慢下來","主动记录、核对、慢下来","Record, verify, and slow down"],
          ].map(([level,hant,hans,en,code,exampleHant,exampleHans,exampleEn])=><article key={level} className="rounded-lg border border-emerald-900/15 bg-[#faf8f1] p-4"><p className="font-mono text-xs text-emerald-800">{level} ◍</p><h4 className="mt-2 font-semibold">{copy(locale,[hant,hans,en] as Copy)}</h4><p className="font-mono text-[9px] text-[#758276]">{code}</p><p className="mt-3 text-xs leading-6 text-[#536357]">{copy(locale,[exampleHant,exampleHans,exampleEn] as Copy)}</p></article>)}</div>
        </section>

        <section aria-labelledby="glitch-files-title">
          <p className="font-mono text-[10px] tracking-[0.18em] text-emerald-800">SECTION 03 // GLITCH ARCHIVE</p>
          <h3 id="glitch-files-title" className="mt-2 font-display text-2xl sm:text-3xl">{copy(locale,["六份經典檔案，點開看兩面","六份经典档案，点开看两面","Six classic files, two sides each"])}</h3>
          <p className="mt-2 text-sm text-[#536357]">{copy(locale,["先讀故事版本，再看理性說明。","先读故事版本，再看理性说明。","Read the fictional version, then the rational explanation."])}</p>
          <div className="mt-4 grid gap-2 md:grid-cols-2">{archives.map((item,index)=><details key={index} className="group rounded-lg border border-emerald-900/15 bg-[#faf8f1]"><summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden"><span className="font-mono text-[10px] text-emerald-800">FILE {String(index+1).padStart(2,"0")}</span><span className="flex-1 text-sm font-semibold">{copy(locale,item.title)}</span><span className="text-emerald-800 group-open:rotate-45">＋</span></summary><div className="grid gap-2 border-t border-emerald-900/10 p-3"><Frame label={["故事版本","故事版本","STORY VERSION"]}>{copy(locale,item.story)}</Frame><Frame label={["理性解讀","理性解读","RATIONAL READING"]}>{copy(locale,item.fact)}</Frame></div></details>)}</div>
        </section>

        <section aria-labelledby="ending-title">
          <p className="font-mono text-[10px] tracking-[0.18em] text-emerald-800">SECTION 04 // 2027 SIMULATION</p>
          <h3 id="ending-title" className="mt-2 font-display text-2xl sm:text-3xl">{copy(locale,["2027 推演 · 三種結局","2027 推演 · 三种结局","2027 simulation · three endings"])}</h3>
          <p className="mt-2 text-sm leading-7 text-[#536357]">{copy(locale,["倒數只是頁面動畫，日期只是故事設定，不是預言或警報。","倒数只是页面动画，日期只是故事设定，不是预言或警报。","The countdown is a page animation; the date is a story setting, not a prophecy or warning."])}</p>
          <div className="my-5 flex flex-wrap justify-center gap-4 border-y border-emerald-900/15 py-4 font-mono text-emerald-900" aria-label={copy(locale,["距離故事設定日期的時間","距离故事设定日期的时间","Time to the story's date"])}>
            {[[days,["天","天","DAYS"]],[hours,["時","时","HRS"]],[minutes,["分","分","MIN"]],[seconds,["秒","秒","SEC"]]].map(([value,label])=><div key={String(label)} className="min-w-14 text-center"><strong className="block text-2xl">{String(value).padStart(2,"0")}</strong><span className="text-[9px]">{copy(locale,label as Copy)}</span></div>)}
          </div>
          <div className="grid gap-2 md:grid-cols-3" role="group" aria-label={copy(locale,["選擇結局","选择结局","Choose an ending"])}>{endings.map((item)=><button type="button" key={item.id} aria-pressed={ending===item.id} onClick={()=>setEnding(item.id)} className={`min-h-32 rounded-lg border p-4 text-left transition hover:-translate-y-0.5 ${ending===item.id?"border-emerald-700 bg-emerald-50":"border-emerald-900/15 bg-[#faf8f1]"}`}><span className="font-mono text-[9px] text-emerald-800">{item.code}</span><strong className="mt-2 block text-sm">{copy(locale,item.title)}</strong><span className="mt-2 block text-xs leading-6 text-[#536357]">{copy(locale,item.body)}</span></button>)}</div>
          <div className="mt-3 rounded-lg border-l-2 border-emerald-700 bg-white/70 p-4" aria-live="polite"><p className="font-mono text-[9px] tracking-[0.15em] text-emerald-800">YOUR ENDING · {ending.toUpperCase()}</p><p className="mb-1 mt-1 font-semibold">{copy(locale,selectedEnding.title)}</p><p className="mb-0 text-sm leading-7 text-[#536357]">{copy(locale,selectedEnding.body)}</p></div>
        </section>

        <footer className="border-t border-emerald-900/15 pt-5 text-xs leading-6 text-[#6b7a6e]">
          <p className="font-mono text-[9px] tracking-[0.14em] text-emerald-800">MAYA LONG COUNT 13.0.0.0.0 // PATCH v2012</p>
          <p className="mb-0 mt-2">{copy(locale,["以上為都市傳說創作與互動閱讀。故事可以串起事件，但不證明現實被改寫；未解之事也不等於超自然。","以上为都市传说创作与互动阅读。故事可以串起事件，但不证明现实被改写；未解之事也不等于超自然。","This is interactive urban-legend fiction. A story can connect events without proving reality was rewritten; unresolved does not mean supernatural."])}</p>
        </footer>
      </div>
    </section>
  );
}
