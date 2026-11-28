import { useState } from 'react';

type HomeSubview = 'form' | 'today' | 'quiz' | 'notes';
export type HomeSection = HomeSubview | 'wuxing';
type T = (zh: string, hans: string, en: string) => string;

export type TreeLeaf =
  | { kind: 'link'; href: string; title: string; hint: string; marker?: string; thumb?: string; alt?: string }
  | { kind: 'action'; section: HomeSubview; title: string; hint: string; thumb?: string };
export type TreeBranch = { id: string; title: string; hint: string; thumb?: string; children: TreeLeaf[] };
export type TreeNode = {
  id: HomeSection;
  title: string;
  hint: string;
  groups: TreeBranch[];
};

/**
 * Four plain-language entrances → expandable branches → real pages.
 * Only public, ungated pages are listed (professional charts stay behind their own access gate).
 */
export function homeTree(t: T): TreeNode[] {
  return [
    {
      id: 'form',
      title: t('我的命盤', '我的命盘', 'My chart'),
      hint: t('免費・免登入・約 1 分鐘', '免费・免登录・约 1 分钟', 'Free · no sign-in · about 1 minute'),
      groups: [
        {
          id: 'start', title: t('開始排盤', '开始排盘', 'Start a chart'),
          hint: t('輸入生辰或先看範例', '输入生辰或先看范例', 'Enter birth details or preview a report'),
          children: [
            { kind: 'action', section: 'form', title: t('開始免費排盤', '开始免费排盘', 'Start my free chart'), hint: t('免費 · 免登入 · 約 1 分鐘', '免费 · 免登录 · 约 1 分钟', 'Free · no sign-in · about 1 minute') },
            { kind: 'link', href: '/sample-report', title: t('看範例報告', '看范例报告', 'View a sample report'), hint: t('用虛構個案看解讀範圍', '用虚构个案看解读范围', 'See what a fictional report covers'), thumb: '/home-tiles/sample-report.webp' },
          ],
        },
        {
          id: 'reports', title: t('建立命書', '建立命书', 'Build a destiny book'),
          hint: t('重讀報告，對照人生十章', '重读报告，对照人生十章', 'Revisit reports and life chapters'),
          children: [
            { kind: 'link', href: '/history', title: t('我的報告', '我的报告', 'My reports'), hint: t('重讀已存報告', '重读已存报告', 'Revisit saved reports'), thumb: '/home-tiles/my-reports.webp' },
            { kind: 'link', href: '/soul-chapters', title: t('人生十章對照', '人生十章对照', 'Ten life chapters'), hint: t('對照目前的人生階段', '对照目前的人生阶段', 'Find the chapter that fits now'), thumb: '/images/soul-chapters/zh/volume-1.webp' },
          ],
        },
      ],
    },
    {
      id: 'wuxing',
      title: t('五行流轉', '五行流转', 'Five Elements Flow'),
      hint: t('黃曆、星象、色彩與五行。', '黄历、星象、色彩与五行。', 'Almanac, sky, colours and the five elements.'),
      groups: [
        {
          id: 'today-guide', title: t('查今日', '查今日', 'Check today'),
          hint: t('黃曆、星象與色彩', '黄历、星象与色彩', 'Almanac, sky and daily colour'),
          children: [
            { kind: 'action', section: 'today', title: t('看今天的運勢', '看今天的运势', 'Today’s fortune'), hint: t('宜忌、節氣與今日提醒', '宜忌、节气与今日提醒', 'Dos and don’ts, solar terms and daily guidance'), thumb: '/today/almanac-lotus-v1.webp' },
            { kind: 'link', href: '/sky-events', title: t('今日星象', '今日星象', 'Today’s sky'), hint: t('本週天象與占星解讀', '本周天象与占星解读', 'This week’s sky and astrology'), thumb: '/sky-universe/cosmic-nebula.webp' },
            { kind: 'link', href: '/daily-colors', title: t('每日幸運色', '每日幸运色', 'Colour of the day'), hint: t('今天穿什麼顏色比較順。', '今天穿什么颜色比较顺。', 'Which colour to wear today.'), thumb: '/home-tiles/daily-colors.webp' },
          ],
        },
        {
          id: 'element-lore', title: t('尋五行', '寻五行', 'Explore the elements'),
          hint: t('從色音、香氣與茶入門', '从色音、香气与茶入门', 'Discover colour, sound, scent and tea'),
          thumb: '/articles/list-thumbs/five-elements-as-movement.webp',
          children: [
            { kind: 'link', href: '/knowledge/five-elements-tone-qi', title: t('五行五色、五音與五氣', '五行五色、五音与五气', 'Five elements, colours, tones and qi'), hint: t('五色、五音、五味、五氣、功能與飲食', '五色、五音、五味、五气、功能与饮食', 'Colours, tones, tastes, qi, functions and food') },
            { kind: 'action', section: 'quiz', title: t('五行香氣譜', '五行香气谱', 'Scent map'), hint: t('看嗅覺偏好與五行的文化象意', '看嗅觉偏好与五行的文化象意', 'Scent preferences and their cultural meaning') },
            { kind: 'link', href: '/tea-guardian', title: t('七題找到適合的茶', '七题找到适合的茶', 'Find your tea'), hint: t('七個問題，配一款適合你的茶', '七个问题，配一款适合你的茶', 'Seven questions, one tea') },
          ],
        },
      ],
    },
    {
      id: 'quiz',
      title: t('趣味測驗', '趣味测验', 'Quizzes'),
      hint: t('幾分鐘，看見另一面的自己。', '几分钟，看见另一面的自己。', 'A few minutes to meet another side of you.'),
      groups: [
        {
          id: 'myth', title: t('尋仙緣', '寻仙缘', 'Explore divine ties'),
          hint: t('神佛緣分與修仙道途', '神佛缘分与修仙道途', 'Sacred figures and cultivation paths'),
          thumb: '/home-tiles/quiz-who.webp',
          children: [
            { kind: 'link', href: '/quiz/divine-affinity', title: t('仙佛淵源本緣測試', '仙佛渊源本缘测试', 'Divine affinity quiz'), hint: t('16 題，看你與哪一位神佛最有緣', '16 题，看你与哪一位神佛最有缘', '16 questions — which sacred figure feels closest') },
            { kind: 'link', href: '/quiz/cultivation-destiny', title: t('修仙命格靈測', '修仙命格灵测', 'Cultivation destiny'), hint: t('推演你的靈根、宗門與道途', '推演你的灵根、宗门与道途', 'Your spirit root, sect and path') },
          ],
        },
        {
          id: 'archetypes', title: t('找原型', '找原型', 'Find an archetype'),
          hint: t('動物本能與品牌性格', '动物本能与品牌性格', 'Animal instincts and brand character'),
          thumb: '/home-tiles/quiz-brand.webp',
          children: [
            { kind: 'link', href: '/fun-tests?test=animal', title: t('內在動物 × 命局瑞獸', '内在动物 × 命局瑞兽', 'Inner animal'), hint: t('看你常用的性格策略與本能', '看你常用的性格策略与本能', 'The instincts you lean on most') },
            { kind: 'link', href: '/brand-archetypes.html', title: t('品牌十二原型 · 定位測評', '品牌十二原型 · 定位测评', 'Twelve Brand Archetypes'), hint: t('十二題辨識品牌主副原型', '十二题辨识品牌主副原型', 'Find both brand archetypes in 12 questions') },
          ],
        },
        {
          id: 'habits', title: t('看近況', '看近况', 'Check in'),
          hint: t('習慣、卡關與優勢運用', '习惯、卡关与优势运用', 'Habits, obstacles and strengths'),
          thumb: '/home-tiles/quiz-state.webp',
          children: [
            { kind: 'link', href: '/fun-tests/earth-online', title: t('地球 Online · 古籍攻略', '地球 Online · 古籍攻略', 'Earth Online'), hint: t('答八題，按近況選古籍', '答八题，按近况选古籍', 'Find a classic in eight questions') },
            { kind: 'link', href: '/quiz/six-realms', title: t('六道習氣測驗', '六道习气测验', 'Six habits quiz'), hint: t('看目前最明顯的日常慣性', '看目前最明显的日常惯性', 'Your most visible everyday habit') },
            { kind: 'link', href: '/fun-tests?test=element', title: t('五行功能測驗', '五行功能测验', 'Five-element function quiz'), hint: t('看現在最想加強哪一種功能', '看现在最想加强哪一种功能', 'Which function you most want to build') },
            { kind: 'link', href: '/quiz/five-element-overdrive', title: t('五行優勢內耗測驗', '五行优势内耗测验', 'Strength overuse quiz'), hint: t('10 個情境，看哪種優勢被你用成內耗', '10 个情境，看哪种优势被你用成内耗', '10 scenes — which strength you overuse') },
          ],
        },
      ],
    },
    {
      id: 'notes',
      title: t('文章與知識', '文章与知识', 'Articles & knowledge'),
      hint: t('文章、原畫與站務', '文章、原画与站务', 'Reading, galleries and site news'),
      groups: [
        {
          id: 'reading', title: t('讀文章', '读文章', 'Browse readings'),
          hint: t('命理入門與連載故事', '命理入门与连载故事', 'Chart explainers and serial fiction'),
          children: [
            { kind: 'link', href: '/knowledge', title: t('命理小知識', '命理小知识', 'Short explainers'), hint: t('查方法、術語與判讀規則', '查方法、术语与判读规则', 'Look up methods, terms and reading rules'), thumb: '/home-tiles/knowledge-basics.webp' },
            { kind: 'link', href: '/guaili-luanshen', marker: 'data-home-guaili-collection', title: t('三界異聞錄', '三界异闻录', 'Tales of the Three Realms'), hint: t('二十七卷故事、提要與插畫', '二十七卷故事、提要与插画', 'Read 27 illustrated volumes with summaries'), thumb: '/home-tiles/guaili.webp' },
          ],
        },
        {
          id: 'galleries', title: t('看畫集', '看画集', 'View galleries'),
          hint: t('神話圖錄與仙境原畫', '神话图录与仙境原画', 'Mythic art and painted realms'),
          children: [
            { kind: 'link', href: '/mythic-atlas/', marker: 'data-home-mythic-atlas-entry', title: t('幽明萬象錄', '幽明万象录', 'Hidden & Manifest'), hint: t('十二幅原畫中的神話世界', '十二幅原画中的神话世界', 'Explore mythology in twelve original paintings'), thumb: '/home-tiles/mythic-atlas.webp' },
            { kind: 'link', href: '/bajinggong', title: t('八景宮 · 九景圖志', '八景宫 · 九景图志', 'Nine Visions of Bajinggong'), hint: t('九幅仙境原畫與來源辨識', '九幅仙境原画与来源辨识', 'Nine original paintings with source notes'), thumb: '/bajinggong/01-hanhai-cangming.webp', alt: t('瀚海滄溟原創畫作', '瀚海沧溟原创画作', 'Original painting of the Boundless Azure Sea') },
          ],
        },
        {
          id: 'site', title: t('認識昭梧', '认识昭梧', 'Explore ZHAOWU'),
          hint: t('理念與近期更新', '理念与近期更新', 'Our approach and recent updates'),
          children: [
            { kind: 'link', href: '/about', title: t('關於昭梧', '关于昭梧', 'About ZHAOWU'), hint: t('了解理念、藝術與方法邊界', '了解理念、艺术与方法边界', 'Explore our approach, art and limits'), thumb: '/home-tiles/about.webp' },
            { kind: 'link', href: '/updates', title: t('最新更新', '最新更新', 'What’s new'), hint: t('網站最近多了什麼。', '网站最近多了什么。', 'What changed on the site recently.'), thumb: '/home-tiles/updates.webp' },
          ],
        },
      ],
    },
  ];
}

function Leaf({ leaf, onOpen, textOnly = false }: { leaf: TreeLeaf; textOnly?: boolean; onOpen: (s: HomeSubview) => void }) {
  const isChartAction = leaf.kind === 'action' && leaf.section === 'form';
  const className = leaf.thumb ? 'ph-tree-tile' : isChartAction ? 'ph-tree-tile-cta' : 'ph-tree-leaf';
  const body = <>
    {!textOnly && leaf.thumb && <img src={leaf.thumb} alt={leaf.kind === 'link' ? leaf.alt ?? '' : ''} loading="lazy" />}
    <span><strong>{leaf.title}</strong><small>{leaf.hint}</small></span>
    {!leaf.thumb && <i aria-hidden>›</i>}
  </>;
  if (leaf.kind === 'action') {
    return <button type="button" className={className} onClick={() => onOpen(leaf.section)}>{body}</button>;
  }
  return <a className={className} href={leaf.href}
    data-home-guaili-collection={leaf.marker === 'data-home-guaili-collection' ? '' : undefined}
    data-home-mythic-atlas-entry={leaf.marker === 'data-home-mythic-atlas-entry' ? '' : undefined}>{body}</a>;
}

function Branch({ branch, initiallyOpen, onOpen }: { branch: TreeBranch; initiallyOpen: boolean; onOpen: (s: HomeSubview) => void }) {
  const [open, setOpen] = useState(initiallyOpen);
  const id = `ph-tree-branch-${branch.id}`;
  return <li className="ph-tree-branch" data-open={open}>
    <button type="button" className="ph-tree-branch-tile" aria-expanded={open} aria-controls={id} onClick={() => setOpen(v => !v)}>
      {branch.thumb && <img src={branch.thumb} alt="" loading="lazy" />}
      <span><strong>{branch.title}</strong><small>{branch.hint}</small></span><i aria-hidden>{open ? '−' : '+'}</i>
    </button>
    <ul id={id} className="ph-tree-tiles" hidden={!open}>{branch.children.map(leaf =>
      <li key={leaf.kind === 'link' ? leaf.href : leaf.section} className={leaf.thumb ? undefined : 'ph-tree-wide'}>
        <Leaf leaf={leaf} onOpen={onOpen} />
      </li>)}</ul>
  </li>;
}

export function HomeTree({ t, onOpen }: { t: T; onOpen: (s: HomeSubview) => void }) {
  const nodes = homeTree(t);
  const daily = nodes.flatMap(node => node.groups).find(group => group.id === 'today-guide');
  return <nav id="home-guide" className="zw-study-guide" data-home-tree aria-label={t('網站導覽', '网站导览', 'Site guide')}>
    <div className="zw-daily-entries">
      {daily?.children.map(leaf => <Leaf textOnly key={leaf.kind === 'link' ? leaf.href : leaf.section} leaf={leaf} onOpen={onOpen} />)}
    </div>
    <details className="zw-study">
      <summary><img src="/theme-skins/verdant-mist-art.webp" alt="" />
        <span><strong>{t('梧下文房', '梧下文房', 'The Wutong Study')}</strong>
          <small>{t('命盤、五行、測驗與文章', '命盘、五行、测验与文章', 'Charts, elements, quizzes and readings')}</small></span>
      </summary>
      {nodes.map(node => <section key={node.id}>
        <h3>{node.title}</h3>
        <ul className="ph-tree-tiles">{node.groups.filter(group => group !== daily).map((group, index) =>
          <Branch key={group.id} branch={group} initiallyOpen={index === 0} onOpen={onOpen} />)}</ul>
      </section>)}
    </details>
  </nav>;
}
