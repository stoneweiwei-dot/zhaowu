insert into public.classic_sources (
  slug, title_zh_hant, title_zh_hans, title_en, tradition, canon_code, edition_name, source_url, verification_note
) values
  ('daodejing', '道德經', '道德经', 'Daodejing', 'daoist', 'CTEXT-DAO', '中國哲學書電子化計劃', 'https://ctext.org/dao-de-jing/zh', '經文逐條核對後才可標記 verified。'),
  ('zhuangzi', '莊子', '庄子', 'Zhuangzi', 'daoist', 'CTEXT-ZHUANGZI', '中國哲學書電子化計劃', 'https://ctext.org/zhuangzi/zh', '經文逐條核對後才可標記 verified。'),
  ('zhouyi', '周易', '周易', 'Book of Changes', 'yijing', 'CTEXT-YIJING', '中國哲學書電子化計劃', 'https://ctext.org/book-of-changes/zh', '象傳原文；不得把後世解說冒充經文。'),
  ('qingjingjing', '太上老君說常清靜經', '太上老君说常清静经', 'Qingjing Jing', 'daoist', 'CTEXT-QINGJING', '中國哲學書電子化計劃', 'https://ctext.org/wiki.pl?chapter=392753', '採可追溯原句；後世註文不作經文輸出。'),
  ('yinfu_jing', '黃帝陰符經', '黄帝阴符经', 'Yinfu Jing', 'daoist', 'CTEXT-YINFU', '中國哲學書電子化計劃', 'https://ctext.org/wiki.pl?chapter=449315', '採可追溯原句；後世註文不作經文輸出。'),
  ('diamond_sutra', '金剛般若波羅蜜經', '金刚般若波罗蜜经', 'Diamond Sutra', 'buddhist', 'CBETA-T08n0235', 'CBETA 大正新脩大藏經', 'https://cbetaonline.dila.edu.tw/zh/T0235_001', '姚秦鳩摩羅什譯本；以 CBETA 行號核對。'),
  ('heart_sutra', '般若波羅蜜多心經', '般若波罗蜜多心经', 'Heart Sutra', 'buddhist', 'CBETA-T08n0251', 'CBETA 大正新脩大藏經', 'https://cbetaonline.dila.edu.tw/zh/T0251_001', '唐玄奘譯本；以 CBETA 行號核對。'),
  ('vimalakirti_sutra', '維摩詰所說經', '维摩诘所说经', 'Vimalakirti Sutra', 'buddhist', 'CBETA-T14n0475', 'CBETA 大正新脩大藏經', 'https://cbetaonline.dila.edu.tw/zh/T0475_001', '姚秦鳩摩羅什譯本；以 CBETA 行號核對。')
on conflict (slug) do update set
  title_zh_hant = excluded.title_zh_hant,
  title_zh_hans = excluded.title_zh_hans,
  title_en = excluded.title_en,
  tradition = excluded.tradition,
  canon_code = excluded.canon_code,
  edition_name = excluded.edition_name,
  source_url = excluded.source_url,
  verification_note = excluded.verification_note,
  is_active = true,
  updated_at = now();

insert into public.classic_passages (
  source_id, passage_key, locator, original_text, simplified_text,
  display_note_zh_hant, display_note_zh_hans,
  theme_tags, element_tags, stem_tags, branch_tags, question_tags, life_stage_tags, avoid_tags,
  score_bias, verification_status, verified_against, verified_at, is_direct_quote, is_active
) values
  (
    (select id from public.classic_sources where slug = 'daodejing'),
    'daodejing_08_water', '第八章',
    '上善若水。水善利萬物而不爭，處眾人之所惡，故幾於道。',
    '上善若水。水善利万物而不争，处众人之所恶，故几于道。',
    '柔而有力，利物而不爭。', '柔而有力，利物而不争。',
    array['順勢','柔韌','不爭','利他','流動','包容'], array['水'], array['壬','癸'], '{}'::text[],
    array['人際','事業','選擇','自我'], array['轉折','擴張','壓力'], '{}'::text[],
    8, 'verified', '中國哲學書電子化計劃《道德經》第八章「上善若水」', now(), true, true
  ),
  (
    (select id from public.classic_sources where slug = 'daodejing'),
    'daodejing_33_self_mastery', '第三十三章',
    '知人者智，自知者明。勝人者有力，自勝者強。知足者富，強行者有志。',
    '知人者智，自知者明。胜人者有力，自胜者强。知足者富，强行者有志。',
    '知人之前，先能知己；勝人之前，先能勝己。', '知人之前，先能知己；胜人之前，先能胜己。',
    array['自知','克己','知足','定力','自省'], '{}'::text[], '{}'::text[], '{}'::text[],
    array['自我','事業','決策','關係'], array['成熟','轉折','壓力'], '{}'::text[],
    7, 'verified', '中國哲學書電子化計劃《道德經》第三十三章「知人者智」', now(), true, true
  ),
  (
    (select id from public.classic_sources where slug = 'zhuangzi'),
    'zhuangzi_yangshengzhu_accept_time', '內篇・養生主',
    '適來，夫子時也；適去，夫子順也。安時而處順，哀樂不能入也。',
    '适来，夫子时也；适去，夫子顺也。安时而处顺，哀乐不能入也。',
    '識時、處順，不讓得失侵入心之主位。', '识时、处顺，不让得失侵入心之主位。',
    array['順時','無常','放下','情緒','安時處順'], '{}'::text[], '{}'::text[], '{}'::text[],
    array['時機','選擇','關係','自我'], array['轉折','失落','變動'], array['喪親急性期','自傷風險'],
    6, 'verified', '中國哲學書電子化計劃《莊子・養生主》老聃死章', now(), true, true
  ),
  (
    (select id from public.classic_sources where slug = 'zhouyi'),
    'zhouyi_qian_self_strength', '乾卦・象傳',
    '天行健，君子以自強不息。',
    '天行健，君子以自强不息。',
    '剛健不是躁進，而是持續不息。', '刚健不是躁进，而是持续不息。',
    array['自強','持續','行動','進取','韌性'], '{}'::text[], '{}'::text[], '{}'::text[],
    array['事業','學業','決策','時機'], array['起步','上升','擴張','低谷'], '{}'::text[],
    6, 'verified', '中國哲學書電子化計劃《周易・乾・象傳》', now(), true, true
  ),
  (
    (select id from public.classic_sources where slug = 'zhouyi'),
    'zhouyi_kun_carrying', '坤卦・象傳',
    '地勢坤，君子以厚德載物。',
    '地势坤，君子以厚德载物。',
    '以厚、穩、承載成事，不以急取勝。', '以厚、稳、承载成事，不以急取胜。',
    array['承載','厚德','穩定','落地','包容'], array['土'], array['戊','己'], array['辰','戌','丑','未'],
    array['事業','家庭','財務','自我'], array['立業','累積','成熟','守成'], '{}'::text[],
    7, 'verified', '中國哲學書電子化計劃《周易・坤・象傳》', now(), true, true
  ),
  (
    (select id from public.classic_sources where slug = 'qingjingjing'),
    'qingjingjing_constant_stillness', '經文「常清靜」段',
    '人能常清靜，天地悉皆歸。',
    '人能常清静，天地悉皆归。',
    '先清其心，再辨其勢。', '先清其心，再辨其势。',
    array['清靜','去躁','內觀','定心','清明'], '{}'::text[], '{}'::text[], '{}'::text[],
    array['自我','關係','決策','健康'], array['壓力','混亂','轉折'], array['精神危機'],
    6, 'verified', '中國哲學書電子化計劃《太上老君說常清靜經》「人能常清靜」', now(), true, true
  ),
  (
    (select id from public.classic_sources where slug = 'yinfu_jing'),
    'yinfu_observe_and_act', '上篇首章',
    '觀天之道，執天之行，盡矣。',
    '观天之道，执天之行，尽矣。',
    '先觀規律，再依時而行。', '先观规律，再依时而行。',
    array['觀時','順勢','規律','行動','時機'], '{}'::text[], '{}'::text[], '{}'::text[],
    array['時機','大運','流年','決策','事業'], array['轉折','上升','守成'], '{}'::text[],
    8, 'verified', '中國哲學書電子化計劃《黃帝陰符經》「觀天之道」', now(), true, true
  ),
  (
    (select id from public.classic_sources where slug = 'diamond_sutra'),
    'diamond_sutra_non_abiding_mind', '卷一・莊嚴淨土分相關段',
    '不應住色生心，不應住聲香味觸法生心，應無所住而生其心。',
    '不应住色生心，不应住声香味触法生心，应无所住而生其心。',
    '行而不住，做而不執。', '行而不住，做而不执。',
    array['不執','放下','清淨','行動','無住'], '{}'::text[], '{}'::text[], '{}'::text[],
    array['關係','財務','事業','自我','選擇'], array['轉折','失落','壓力','成熟'], array['自傷風險'],
    6, 'verified', 'CBETA T08n0235；「應無所住而生其心」原句核對', now(), true, true
  ),
  (
    (select id from public.classic_sources where slug = 'heart_sutra'),
    'heart_sutra_five_aggregates_empty', '卷一・開篇',
    '照見五蘊皆空，度一切苦厄。',
    '照见五蕴皆空，度一切苦厄。',
    '看見執著的結構，才有鬆開的可能。', '看见执着的结构，才有松开的可能。',
    array['空性','放下','洞察','無礙','恐懼'], '{}'::text[], '{}'::text[], '{}'::text[],
    array['自我','關係','選擇'], array['壓力','失落','轉折'], array['自傷風險','精神危機'],
    5, 'verified', 'CBETA T08n0251《般若波羅蜜多心經》開篇原句', now(), true, true
  ),
  (
    (select id from public.classic_sources where slug = 'vimalakirti_sutra'),
    'vimalakirti_pure_mind_pure_land', '佛國品第一',
    '若菩薩欲得淨土，當淨其心；隨其心淨，則佛土淨。',
    '若菩萨欲得净土，当净其心；随其心净，则佛土净。',
    '先正其心，再看環境如何回應。', '先正其心，再看环境如何回应。',
    array['心淨','環境','內外','清明','修心'], '{}'::text[], '{}'::text[], '{}'::text[],
    array['居住','關係','自我','選擇'], array['轉折','重整','成熟'], '{}'::text[],
    5, 'verified', 'CBETA T14n0475 p.538c4《維摩詰所說經・佛國品》', now(), true, true
  )
on conflict (passage_key) do update set
  source_id = excluded.source_id,
  locator = excluded.locator,
  original_text = excluded.original_text,
  simplified_text = excluded.simplified_text,
  display_note_zh_hant = excluded.display_note_zh_hant,
  display_note_zh_hans = excluded.display_note_zh_hans,
  theme_tags = excluded.theme_tags,
  element_tags = excluded.element_tags,
  stem_tags = excluded.stem_tags,
  branch_tags = excluded.branch_tags,
  question_tags = excluded.question_tags,
  life_stage_tags = excluded.life_stage_tags,
  avoid_tags = excluded.avoid_tags,
  score_bias = excluded.score_bias,
  verification_status = excluded.verification_status,
  verified_against = excluded.verified_against,
  verified_at = excluded.verified_at,
  is_direct_quote = true,
  is_active = true,
  updated_at = now();
