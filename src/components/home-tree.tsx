import { useState } from 'react';

type HomeSubview = 'form' | 'today' | 'quiz' | 'notes';
export type HomeSection = HomeSubview | 'wuxing';
type T = (zh: string, hans: string, en: string) => string;

export type TreeLeaf =
  | { kind: 'link'; href: string; title: string; hint: string; marker?: string; thumb?: string }
  | { kind: 'action'; section: HomeSubview; title: string; hint: string; thumb?: string };
export type TreeBranch = { kind: 'branch'; id: string; title: string; hint: string; thumb: string; children: TreeLeaf[] };
export type TreeNode = {
  id: HomeSection;
  title: string;
  hint: string;
  /** First child inside the opened node, when the block has a lead action. */
  primary?: TreeLeaf;
  items: (TreeLeaf | TreeBranch)[];
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
      primary: { kind: 'action', section: 'form', title: t('開始免費排盤', '开始免费排盘', 'Start my free chart'), hint: t('免費 · 免登入 · 約 1 分鐘', '免费 · 免登录 · 约 1 分钟', 'Free · no sign-in · about 1 minute') },
      items: [
        { kind: 'link', href: '/sample-report', title: t('看範例報告', '看范例报告', 'View a sample report'), hint: t('虛構個案，先看內容深度與判斷邊界。', '虚构个案，先看内容深度与判断边界。', 'A fictional case showing the depth and boundaries.'), thumb: '/home-tiles/sample-report.webp' },
        { kind: 'link', href: '/history', title: t('我的報告', '我的报告', 'My reports'), hint: t('看過的報告都收在這裡，隨時回來讀。', '看过的报告都收在这里，随时回来读。', 'Every report you have made, kept in one place.'), thumb: '/home-tiles/my-reports.webp' },
        { kind: 'link', href: '/soul-chapters', title: t('人生十章對照', '人生十章对照', 'Ten life chapters'), hint: t('人生有十章，哪一章最像現在的你？', '人生有十章，哪一章最像现在的你？', 'Ten life chapters. Which one feels like yours right now?'), thumb: '/images/soul-chapters/zh/volume-1.webp' },
      ],
    },
    {
      id: 'wuxing',
      title: t('五行流轉', '五行流转', 'Five Elements Flow'),
      hint: t('黃曆、星象、色彩與五行。', '黄历、星象、色彩与五行。', 'Almanac, sky, colours and the five elements.'),
      primary: { kind: 'action', section: 'today', title: t('看今天的黃曆', '看今天的黄历', 'Open today’s almanac'), hint: t('宜忌、節氣與今日提醒', '宜忌、节气与今日提醒', 'Dos and don’ts, solar terms and daily guidance'), thumb: '/today/almanac-lotus-v1.webp' },
      items: [
        { kind: 'link', href: '/sky-events', title: t('今日星象', '今日星象', 'Today’s sky & astrology'), hint: t('星辰形象、當週天象與占星解讀，直接進入', '星辰形象、当周天象与占星解读，直接进入', 'Sky events, weekly outlook and astrology in one tap'), thumb: '/sky-universe/cosmic-nebula.webp' },
        { kind: 'link', href: '/daily-colors', title: t('每日幸運色', '每日幸运色', 'Colour of the day'), hint: t('今天穿什麼顏色比較順。', '今天穿什么颜色比较顺。', 'Which colour to wear today.'), thumb: '/home-tiles/daily-colors.webp' },
        { kind: 'branch', id: 'wuxing', title: t('五行', '五行', 'Five elements'), hint: t('色、音、味、氣、功能與飲食', '色、音、味、气、功能与饮食', 'Colour, tone, taste, qi, function and food'), thumb: '/articles/list-thumbs/five-elements-as-movement.webp', children: [
          { kind: 'link', href: '/knowledge/five-elements-tone-qi', title: t('五行五色、五音與五氣', '五行五色、五音与五气', 'Five elements, colours, tones and qi'), hint: t('五色、五音、五味、五氣、五功能與五色飲食，一篇看完。', '五色、五音、五味、五气、五功能与五色饮食，一篇看完。', 'Colours, tones, tastes, qi, functions and the five-colour diet in one article.') },
          { kind: 'link', href: '/fun-tests?test=element', title: t('五行功能測驗', '五行功能测验', 'Five-element function quiz'), hint: t('看現在最想加強哪一種功能', '看现在最想加强哪一种功能', 'Which function you most want to build') },
          { kind: 'link', href: '/quiz/five-element-overdrive', title: t('五行優勢內耗測驗', '五行优势内耗测验', 'Strength overuse quiz'), hint: t('10 個情境，看哪種優勢被你用成內耗', '10 个情境，看哪种优势被你用成内耗', '10 scenes — which strength you overuse') },
          { kind: 'action', section: 'quiz', title: t('五行香氣譜', '五行香气谱', 'Scent map'), hint: t('看嗅覺偏好與五行的文化象意', '看嗅觉偏好与五行的文化象意', 'Scent preferences and their cultural meaning') },
          { kind: 'link', href: '/tea-guardian', title: t('七題找到適合的茶', '七题找到适合的茶', 'Find your tea'), hint: t('七個問題，配一款適合你的茶', '七个问题，配一款适合你的茶', 'Seven questions, one tea') },
        ] },
      ],
    },
    {
      id: 'quiz',
      title: t('趣味測驗', '趣味测验', 'Quizzes'),
      hint: t('幾分鐘，看見另一面的自己。', '几分钟，看见另一面的自己。', 'A few minutes to meet another side of you.'),
      items: [
        { kind: 'branch', id: 'who', title: t('看看你是誰', '看看你是谁', 'Who you are'), hint: t('性格與緣分的角度', '性格与缘分的角度', 'Character and affinity'), thumb: '/home-tiles/quiz-who.webp', children: [
          { kind: 'link', href: '/quiz/divine-affinity', title: t('仙佛淵源本緣測試', '仙佛渊源本缘测试', 'Divine affinity quiz'), hint: t('16 題，看你與哪一位神佛最有緣', '16 题，看你与哪一位神佛最有缘', '16 questions — which sacred figure feels closest') },
          { kind: 'link', href: '/quiz/cultivation-destiny', title: t('修仙命格靈測', '修仙命格灵测', 'Cultivation destiny'), hint: t('推演你的靈根、宗門與道途', '推演你的灵根、宗门与道途', 'Your spirit root, sect and path') },
          { kind: 'link', href: '/fun-tests?test=animal', title: t('內在動物 × 命局瑞獸', '内在动物 × 命局瑞兽', 'Inner animal'), hint: t('看你常用的性格策略與本能', '看你常用的性格策略与本能', 'The instincts you lean on most') },
        ] },
        { kind: 'branch', id: 'state', title: t('看看你的狀態', '看看你的状态', 'How you are now'), hint: t('現在卡在哪、最想補什麼', '现在卡在哪、最想补什么', 'Where you are stuck, what you need'), thumb: '/home-tiles/quiz-state.webp', children: [
          { kind: 'link', href: '/fun-tests/earth-online', title: t('地球 Online · 古籍攻略', '地球 Online · 古籍攻略', 'Earth Online'), hint: t('8 題看你卡在哪一關，推薦古籍', '8 题看你卡在哪一关，推荐古籍', '8 questions on where you are stuck') },
          { kind: 'link', href: '/quiz/six-realms', title: t('六道習氣測驗', '六道习气测验', 'Six habits quiz'), hint: t('看目前最明顯的日常慣性', '看目前最明显的日常惯性', 'Your most visible everyday habit') },
        ] },
        { kind: 'branch', id: 'brand', title: t('品牌原型', '品牌原型', 'Brand archetypes'), hint: t('讓品牌有鮮明的性格', '让品牌有鲜明的性格', 'Find a clear brand voice'), thumb: '/home-tiles/quiz-brand.webp', children: [
          { kind: 'link', href: '/brand-archetypes.html', title: t('品牌十二原型 · 定位測評', '品牌十二原型 · 定位测评', 'Twelve Brand Archetypes'), hint: t('序、尋、證、聯；十二題找出品牌主副原型', '序、寻、证、联；十二题找出品牌主副原型', 'Twelve brand scenarios, primary and supporting archetypes') },
        ] },
      ],
    },
    {
      id: 'notes',
      title: t('文章與知識', '文章与知识', 'Articles & knowledge'),
      hint: t('慢慢讀：文章、短札與小知識。', '慢慢读：文章、短札与小知识。', 'Slow reading: essays, notes and short explainers.'),
      items: [
        { kind: 'link', href: '/knowledge', title: t('命理小知識', '命理小知识', 'Short explainers'), hint: t('方法、術語與判讀規則，查得到也看得懂。', '方法、术语与判读规则，查得到也看得懂。', 'Methods, terms and how to read them.'), thumb: '/home-tiles/knowledge-basics.webp' },
        { kind: 'link', href: '/mythic-atlas/', marker: 'data-home-mythic-atlas-entry', title: t('幽明萬象錄', '幽明万象录', 'Hidden & Manifest'), hint: t('十二幅原創畫作及完整神話世界觀。', '十二幅原创画作与完整神话世界观。', 'Twelve original artworks and their connected mythology.'), thumb: '/home-tiles/mythic-atlas.webp' },
        { kind: 'link', href: '/guaili-luanshen', marker: 'data-home-guaili-collection', title: t('三界異聞錄', '三界异闻录', 'Tales of the Three Realms'), hint: t('卷一至二十七連續故事、故事提要與相配插圖。', '卷一至二十七连续故事、故事提要与相配插图。', 'One connected story from volumes 1–27, with outlines and matched art.'), thumb: '/home-tiles/guaili.webp' },
        { kind: 'link', href: '/updates', title: t('最新更新', '最新更新', 'What’s new'), hint: t('網站最近多了什麼。', '网站最近多了什么。', 'What changed on the site recently.'), thumb: '/home-tiles/updates.webp' },
        { kind: 'link', href: '/about', title: t('關於昭梧', '关于昭梧', 'About ZHAOWU'), hint: t('認識昭梧的理念、藝術與方法邊界。', '认识昭梧的理念、艺术与方法边界。', 'The ideas, artwork and methods behind ZHAOWU.'), thumb: '/home-tiles/about.webp' },
      ],
    },
  ];
}

function Leaf({ leaf, onOpen }: { leaf: TreeLeaf; onOpen: (s: HomeSubview) => void }) {
  const body = <><span><strong>{leaf.title}</strong><small>{leaf.hint}</small></span><i aria-hidden>›</i></>;
  if (leaf.kind === 'link') {
    return <a className="ph-tree-leaf" href={leaf.href} data-home-guaili-collection={leaf.marker === 'data-home-guaili-collection' ? '' : undefined} data-home-mythic-atlas-entry={leaf.marker === 'data-home-mythic-atlas-entry' ? '' : undefined}>{body}</a>;
  }
  return <button type="button" className="ph-tree-leaf" onClick={() => onOpen(leaf.section)}>{body}</button>;
}

/**
 * Opened blocks show their pages as square image tiles: the picture leads,
 * the name is one short line underneath. Branch children keep the text rows
 * (their tiles are a later pass — they need ten more thumbnails first).
 */
function Tile({ leaf, onOpen }: { leaf: TreeLeaf; onOpen: (s: HomeSubview) => void }) {
  if (leaf.kind === 'action') {
    if (leaf.thumb) {
      return <button type="button" className="ph-tree-tile" onClick={() => onOpen(leaf.section)}>
        <img src={leaf.thumb} alt="" loading="lazy" />
        <span><strong>{leaf.title}</strong><small>{leaf.hint}</small></span>
      </button>;
    }
    return <button type="button" className="ph-tree-tile-cta" onClick={() => onOpen(leaf.section)}>
      <span><strong>{leaf.title}</strong><small>{leaf.hint}</small></span><i aria-hidden>›</i>
    </button>;
  }
  return <a className="ph-tree-tile" href={leaf.href} data-home-guaili-collection={leaf.marker === 'data-home-guaili-collection' ? '' : undefined} data-home-mythic-atlas-entry={leaf.marker === 'data-home-mythic-atlas-entry' ? '' : undefined}>
    {leaf.thumb ? <img src={leaf.thumb} alt="" loading="lazy" /> : null}
    <span><strong>{leaf.title}</strong></span>
  </a>;
}

function Branch({ branch, onOpen }: { branch: TreeBranch; onOpen: (s: HomeSubview) => void }) {
  const [open, setOpen] = useState(false);
  const id = `ph-tree-branch-${branch.id}`;
  return <li className="ph-tree-branch" data-open={open}>
    <button type="button" className="ph-tree-branch-tile" aria-expanded={open} aria-controls={id} onClick={() => setOpen(v => !v)}>
      <img src={branch.thumb} alt="" loading="lazy" />
      <span><strong>{branch.title}</strong><small>{branch.hint}</small></span><i aria-hidden>{open ? '−' : '+'}</i>
    </button>
    <ul id={id} hidden={!open}>{branch.children.map(c => <li key={c.title}><Leaf leaf={c} onOpen={onOpen} /></li>)}</ul>
  </li>;
}

function FivePhaseMark() {
  return <g stroke="currentColor"><circle cx="16" cy="16" r="7" /><path d="M16 5v4m10.5 3.6-3.8 1.2m-.2 11.1-2.4-3.2m-10.6 3.2 2.4-3.2M5.5 12.6l3.8 1.2" strokeLinecap="round" /></g>;
}

/** Small seasonal navigation marks, drawn as UI icons rather than artwork. */
function SeasonalMark({ section }: { section: HomeSection }) {
  return <svg className="zw-season-mark" viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    {section === 'form' && <><path d="M8 6h13a3 3 0 0 1 3 3v17H11a3 3 0 0 1-3-3zM8 8a2 2 0 0 0-2 2v13a3 3 0 0 0 3 3"/><path d="M12 12h8m-8 4h8m-8 4h5"/></>}
    {section === 'today' && <><circle cx="18" cy="11" r="4"/><path d="M18 3v2m0 12v2M10 11H8m20 0h-2M9 23h15a4 4 0 0 0-4-5 6 6 0 0 0-10 1 3 3 0 0 0-1 4z"/></>}
    {section === 'wuxing' && <FivePhaseMark />}
    {section === 'quiz' && <><path d="M16 5l2.3 7.2L25 15l-6.7 2.7L16 25l-2.4-7.3L7 15l6.6-2.8z"/><path d="M7 5v4m-2-2h4m16 14v4m-2-2h4"/></>}
    {section === 'notes' && <><path d="M5 8c5-2 8-1 11 2v16c-3-3-6-4-11-2zm22 0c-5-2-8-1-11 2v16c3-3 6-4 11-2z"/><path d="M9 13h3m-3 4h3m8-4h3m-3 4h3"/></>}
    <g className="zw-south-spring" strokeWidth="1"><circle cx="26" cy="26" r="1.1"/><path d="M26 22.6c.7 1.1.7 2 .1 3-.6-1-.6-1.9-.1-3zm0 6.8c-.7-1.1-.7-2-.1-3 .6 1 .6 1.9.1 3zM22.8 24.2c1.2.6 1.8 1.2 1.9 2.2-1.3-.1-2-1-1.9-2.2zm6.4 0c-1.2.6-1.8 1.2-1.9 2.2 1.3-.1 2-1 1.9-2.2zM23.4 28.6c1-.6 1.8-.6 2.6 0-1 .5-1.8.5-2.6 0z"/></g>
    <g className="zw-south-summer" strokeWidth="1"><path d="M21 25c1.2-1.4 2.4-1.4 3.6 0s2.4 1.4 3.6 0 2.4-1.4 3.6 0M21 28.2c1.2-1.4 2.4-1.4 3.6 0s2.4 1.4 3.6 0 2.4-1.4 3.6 0"/></g>
    <g className="zw-south-autumn" strokeWidth="1"><path d="M21 29.2 24 23l2 3.2 2.2-5.4L31 29.2z"/></g>
    <g className="zw-south-winter" strokeWidth="1"><path d="M23 30c.4-3 1.6-5.2 2.2-8.2 1.6 1.8 3.6 2.2 5.6 1.2M24.2 30c1.4-.6 2.8-2.6 2.4-5.4"/></g>
  </svg>;
}

/** A coordinated set of small wayfinding marks for the jacaranda edition.
 * Shown only while the Sydney jacaranda skin is active (see home-mobile-v2.css);
 * the seasonal mark above covers every other season. */
function JacarandaMark({ section }: { section: HomeSection }) {
  return <svg className="ph-jacaranda-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <circle cx="20" cy="20" r="18" stroke="currentColor" strokeOpacity=".45" />
    {section === 'form' && <><circle cx="20" cy="20" r="9" stroke="currentColor"/><path d="M20 8v24M8 20h24M14 14l12 12M26 14 14 26" stroke="currentColor" strokeLinecap="round"/></>}
    {section === 'today' && <><circle cx="20" cy="20" r="6" stroke="currentColor"/><path d="M20 9v3M20 28v3M9 20h3M28 20h3M12 12l2 2M26 26l2 2M28 12l-2 2M14 26l-2 2" stroke="currentColor" strokeLinecap="round"/></>}
    {section === 'wuxing' && <g transform="translate(4 4)"><FivePhaseMark /></g>}
    {section === 'quiz' && <><path d="M20 10c1 6 4 9 10 10-6 1-9 4-10 10-1-6-4-9-10-10 6-1 9-4 10-10Z" stroke="currentColor"/><circle cx="29" cy="11" r="1.5" fill="currentColor"/></>}
    {section === 'notes' && <><path d="M10 12c4-1 7 0 10 2 3-2 6-3 10-2v15c-4-1-7 0-10 2-3-2-6-3-10-2V12ZM20 14v15" stroke="currentColor" strokeLinejoin="round"/><path d="M13 17h4M23 17h4" stroke="currentColor" strokeLinecap="round"/></>}
    <path d="M20 2.5c-2 2-2 3.5 0 4.5 2-1 2-2.5 0-4.5Z" fill="currentColor" />
  </svg>;
}

function CellIcon({ section }: { section: HomeSection }) {
  return <span className="ph-cell-badge" aria-hidden="true">
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {section === 'form' && <path d="M3 7q7-2 13 2 6-4 13-2v18q-7-2-13 2-6-4-13-2zM16 9v18M7 12v7m5-6v7m8-7v7m5-8v7" />}
      {section === 'wuxing' && <FivePhaseMark />}
      {section === 'quiz' && <path d="M16 3l3.5 9.5L29 16l-9.5 3.5L16 29l-3.5-9.5L3 16l9.5-3.5z" />}
      {section === 'notes' && <path d="M4 7q6-2 12 2 6-4 12-2v17q-6-2-12 2-6-4-12-2zM16 9v17M8 12l4 1m-4 4 4 1m8-5 4-1m-4 6 4-1" />}
    </svg>
  </span>;
}

export function HomeTree({ t, onOpen }: { t: T; onOpen: (s: HomeSubview) => void }) {
  const [open, setOpen] = useState<HomeSection | null>(null);
  return <nav id="home-guide" className="ph-tree" data-home-tree data-home-blocks="4" aria-label={t('網站導覽', '网站导览', 'Site guide')}>
    <div className="ph-grid">
      {homeTree(t).map(node => {
        const isOpen = open === node.id;
        const panelId = `ph-tree-panel-${node.id}`;
        return <section key={node.id} className="ph-tree-node" data-open={isOpen ? 'true' : 'false'} data-home-card={node.id}>
          <button type="button" className="zw-entry ph-cell" title={node.hint} aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpen(isOpen ? null : node.id)}>
            <CellIcon section={node.id} />
            <strong>{node.title}</strong>
            <SeasonalMark section={node.id} /><JacarandaMark section={node.id} />
          </button>
          <div className="ph-tree-body" id={panelId} hidden={!isOpen}><ul className="ph-tree-tiles">
            {node.primary ? <li key={node.primary.title}><Tile leaf={node.primary} onOpen={onOpen} /></li> : null}
            {node.items.map(item => item.kind === 'branch'
              ? <Branch key={item.id} branch={item} onOpen={onOpen} />
              : <li key={item.title}><Tile leaf={item} onOpen={onOpen} /></li>)}
          </ul></div>
        </section>;
      })}
    </div>
  </nav>;
}
