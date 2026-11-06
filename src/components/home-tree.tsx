import { useState } from 'react';

export type HomeSection = 'form' | 'today' | 'quiz' | 'notes';
type T = (zh: string, hans: string, en: string) => string;

export type TreeLeaf =
  | { kind: 'link'; href: string; title: string; hint: string; marker?: string }
  | { kind: 'action'; section: HomeSection; title: string; hint: string };
export type TreeBranch = { kind: 'branch'; id: string; title: string; hint: string; children: TreeLeaf[] };
export type TreeNode = {
  id: HomeSection;
  title: string;
  hint: string;
  art: string;
  icon: 'reports' | 'calendar' | 'insight' | 'articles';
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
      id: 'form', icon: 'reports', art: '/art/scene-koi-rider-v1.webp',
      title: t('我的命盤', '我的命盘', 'My chart'),
      hint: t('免費・免登入・約 1 分鐘', '免费・免登录・约 1 分钟', 'Free · no sign-in · about 1 minute'),
      primary: { kind: 'action', section: 'form', title: t('開始免費排盤', '开始免费排盘', 'Start my free chart'), hint: t('免費 · 免登入 · 約 1 分鐘', '免费 · 免登录 · 约 1 分钟', 'Free · no sign-in · about 1 minute') },
      items: [
        { kind: 'link', href: '/sample-report', title: t('看範例報告', '看范例报告', 'View a sample report'), hint: t('虛構個案，先看內容深度與判斷邊界。', '虚构个案，先看内容深度与判断边界。', 'A fictional case showing the depth and boundaries.') },
        { kind: 'link', href: '/history', title: t('我的報告', '我的报告', 'My reports'), hint: t('看過的報告都收在這裡，隨時回來讀。', '看过的报告都收在这里，随时回来读。', 'Every report you have made, kept in one place.') },
        { kind: 'link', href: '/soul-chapters', title: t('人生十章對照', '人生十章对照', 'Ten life chapters'), hint: t('人生有十章，哪一章最像現在的你？', '人生有十章，哪一章最像现在的你？', 'Ten life chapters. Which one feels like yours right now?') },
      ],
    },
    {
      id: 'today', icon: 'calendar', art: '/art/scene-lotus-boat-v1.webp',
      title: t('今日指引', '今日指引', 'Today’s guide'),
      hint: t('黃曆、今日星象、穿衣顏色，一次看清。', '黄历、今日星象、穿衣颜色，一次看清。', 'Almanac, today’s sky and colours, clearly grouped.'),
      primary: { kind: 'action', section: 'today', title: t('看今天的黃曆', '看今天的黄历', 'Open today’s almanac'), hint: t('宜忌、節氣與今日提醒', '宜忌、节气与今日提醒', 'Dos and don’ts, solar terms and daily guidance') },
      items: [
        { kind: 'link', href: '/sky-events', title: t('今日星象', '今日星象', 'Today’s sky & astrology'), hint: t('星辰形象、當週天象與占星解讀，直接進入', '星辰形象、当周天象与占星解读，直接进入', 'Sky events, weekly outlook and astrology in one tap') },
        { kind: 'link', href: '/daily-colors', title: t('每日幸運色', '每日幸运色', 'Colour of the day'), hint: t('今天穿什麼顏色比較順。', '今天穿什么颜色比较顺。', 'Which colour to wear today.') },
      ],
    },
    {
      id: 'quiz', icon: 'insight', art: '/art/scene-osmanthus-tea-v1.webp',
      title: t('趣味測驗', '趣味测验', 'Quizzes'),
      hint: t('幾分鐘，看見另一面的自己。', '几分钟，看见另一面的自己。', 'A few minutes to meet another side of you.'),
      items: [
        { kind: 'branch', id: 'who', title: t('看看你是誰', '看看你是谁', 'Who you are'), hint: t('性格與緣分的角度', '性格与缘分的角度', 'Character and affinity'), children: [
          { kind: 'link', href: '/quiz/divine-affinity', title: t('仙佛淵源本緣測試', '仙佛渊源本缘测试', 'Divine affinity quiz'), hint: t('16 題，看你與哪一位神佛最有緣', '16 题，看你与哪一位神佛最有缘', '16 questions — which sacred figure feels closest') },
          { kind: 'link', href: '/quiz/cultivation-destiny', title: t('修仙命格靈測', '修仙命格灵测', 'Cultivation destiny'), hint: t('推演你的靈根、宗門與道途', '推演你的灵根、宗门与道途', 'Your spirit root, sect and path') },
          { kind: 'link', href: '/fun-tests?test=animal', title: t('內在動物 × 命局瑞獸', '内在动物 × 命局瑞兽', 'Inner animal'), hint: t('看你常用的性格策略與本能', '看你常用的性格策略与本能', 'The instincts you lean on most') },
        ] },
        { kind: 'branch', id: 'state', title: t('看看你的狀態', '看看你的状态', 'How you are now'), hint: t('現在卡在哪、最想補什麼', '现在卡在哪、最想补什么', 'Where you are stuck, what you need'), children: [
          { kind: 'link', href: '/fun-tests/earth-online', title: t('地球 Online · 古籍攻略', '地球 Online · 古籍攻略', 'Earth Online'), hint: t('8 題看你卡在哪一關，推薦古籍', '8 题看你卡在哪一关，推荐古籍', '8 questions on where you are stuck') },
          { kind: 'link', href: '/quiz/six-realms', title: t('六道習氣測驗', '六道习气测验', 'Six habits quiz'), hint: t('看目前最明顯的日常慣性', '看目前最明显的日常惯性', 'Your most visible everyday habit') },
          { kind: 'link', href: '/quiz/five-element-overdrive', title: t('五行優勢內耗測驗', '五行优势内耗测验', 'Strength overuse quiz'), hint: t('10 個情境，看哪種優勢被你用成內耗', '10 个情境，看哪种优势被你用成内耗', '10 scenes — which strength you overuse') },
          { kind: 'link', href: '/fun-tests?test=element', title: t('五行功能測驗', '五行功能测验', 'Five-element function quiz'), hint: t('看現在最想加強哪一種功能', '看现在最想加强哪一种功能', 'Which function you most want to build') },
        ] },
        { kind: 'branch', id: 'brand', title: t('品牌原型', '品牌原型', 'Brand archetypes'), hint: t('讓品牌有鮮明的性格', '让品牌有鲜明的性格', 'Find a clear brand voice'), children: [
          { kind: 'link', href: '/brand-archetypes.html', title: t('品牌十二原型 · 定位測評', '品牌十二原型 · 定位测评', 'Twelve Brand Archetypes'), hint: t('序、尋、證、聯；十二題找出品牌主副原型', '序、寻、证、联；十二题找出品牌主副原型', 'Twelve brand scenarios, primary and supporting archetypes') },
        ] },
        { kind: 'branch', id: 'life', title: t('生活小測', '生活小测', 'Everyday'), hint: t('香氣與茶，輕鬆玩', '香气与茶，轻松玩', 'Scent and tea, just for fun'), children: [
          { kind: 'action', section: 'quiz', title: t('五行香氣譜', '五行香气谱', 'Scent map'), hint: t('看嗅覺偏好與五行的文化象意', '看嗅觉偏好与五行的文化象意', 'Scent preferences and their cultural meaning') },
          { kind: 'link', href: '/tea-guardian', title: t('七題找到適合的茶', '七题找到适合的茶', 'Find your tea'), hint: t('七個問題，配一款適合你的茶', '七个问题，配一款适合你的茶', 'Seven questions, one tea') },
        ] },
      ],
    },
    {
      id: 'notes', icon: 'articles', art: '/art/scene-butterfly-dream-v1.webp',
      title: t('文章與知識', '文章与知识', 'Articles & knowledge'),
      hint: t('慢慢讀：文章、短札與小知識。', '慢慢读：文章、短札与小知识。', 'Slow reading: essays, notes and short explainers.'),
      items: [
        { kind: 'link', href: '/knowledge', title: t('命理小知識', '命理小知识', 'Short explainers'), hint: t('方法、術語與判讀規則，查得到也看得懂。', '方法、术语与判读规则，查得到也看得懂。', 'Methods, terms and how to read them.') },
        { kind: 'link', href: '/mythic-atlas', marker: 'data-home-mythic-atlas-entry', title: t('幽明萬象錄', '幽明万象录', 'Hidden & Manifest'), hint: t('十二幅原創畫作及完整神話世界觀。', '十二幅原创画作与完整神话世界观。', 'Twelve original artworks and their connected mythology.') },
        { kind: 'link', href: '/guaili-luanshen', marker: 'data-home-guaili-collection', title: t('三界異聞錄', '三界异闻录', 'Tales of the Three Realms'), hint: t('完整系列目錄、地支神話與災異編年。', '完整系列目录、地支神话与灾异编年。', 'Full series index, zodiac mythology and chronicles.') },
        { kind: 'link', href: '/updates', title: t('最新更新', '最新更新', 'What’s new'), hint: t('網站最近多了什麼。', '网站最近多了什么。', 'What changed on the site recently.') },
        { kind: 'link', href: '/about', title: t('關於昭梧', '关于昭梧', 'About ZHAOWU'), hint: t('認識昭梧的理念、藝術與方法邊界。', '认识昭梧的理念、艺术与方法边界。', 'The ideas, artwork and methods behind ZHAOWU.') },
      ],
    },
  ];
}

function Leaf({ leaf, onOpen }: { leaf: TreeLeaf; onOpen: (s: HomeSection) => void }) {
  const body = <><span><strong>{leaf.title}</strong><small>{leaf.hint}</small></span><i aria-hidden>›</i></>;
  if (leaf.kind === 'link') {
    return <a className="ph-tree-leaf" href={leaf.href} data-home-guaili-collection={leaf.marker === 'data-home-guaili-collection' ? '' : undefined} data-home-mythic-atlas-entry={leaf.marker === 'data-home-mythic-atlas-entry' ? '' : undefined}>{body}</a>;
  }
  return <button type="button" className="ph-tree-leaf" onClick={() => onOpen(leaf.section)}>{body}</button>;
}

function Branch({ branch, onOpen }: { branch: TreeBranch; onOpen: (s: HomeSection) => void }) {
  const [open, setOpen] = useState(false);
  const id = `ph-tree-branch-${branch.id}`;
  return <li className="ph-tree-branch" data-open={open}>
    <button type="button" className="ph-tree-branch-head" aria-expanded={open} aria-controls={id} onClick={() => setOpen(v => !v)}>
      <span><strong>{branch.title}</strong><small>{branch.hint}</small></span><i aria-hidden>{open ? '−' : '+'}</i>
    </button>
    <ul id={id} hidden={!open}>{branch.children.map(c => <li key={c.title}><Leaf leaf={c} onOpen={onOpen} /></li>)}</ul>
  </li>;
}

/** Small seasonal navigation marks, drawn as UI icons rather than artwork. */
function SeasonalMark({ section }: { section: HomeSection }) {
  return <svg className="zw-season-mark" viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    {section === 'form' && <><path d="M8 6h13a3 3 0 0 1 3 3v17H11a3 3 0 0 1-3-3zM8 8a2 2 0 0 0-2 2v13a3 3 0 0 0 3 3"/><path d="M12 12h8m-8 4h8m-8 4h5"/></>}
    {section === 'today' && <><circle cx="18" cy="11" r="4"/><path d="M18 3v2m0 12v2M10 11H8m20 0h-2M9 23h15a4 4 0 0 0-4-5 6 6 0 0 0-10 1 3 3 0 0 0-1 4z"/></>}
    {section === 'quiz' && <><path d="M16 5l2.3 7.2L25 15l-6.7 2.7L16 25l-2.4-7.3L7 15l6.6-2.8z"/><path d="M7 5v4m-2-2h4m16 14v4m-2-2h4"/></>}
    {section === 'notes' && <><path d="M5 8c5-2 8-1 11 2v16c-3-3-6-4-11-2zm22 0c-5-2-8-1-11 2v16c3-3 6-4 11-2z"/><path d="M9 13h3m-3 4h3m8-4h3m-3 4h3"/></>}
    <g className="zw-south-spring" strokeWidth="1"><circle cx="26" cy="26" r="1.3"/><path d="M26 22.5v1.5m0 4v1.5m-3.5-3.5H24m4 0h1.5m-6-2.5 1.1 1.1m2.8 2.8 1.1 1.1m0-5-1.1 1.1m-2.8 2.8-1.1 1.1"/></g>
    <g className="zw-south-summer" strokeWidth="1"><path d="M22 28c1-4 4-6 7-6-1 4-3 7-7 6zm0 0 5-4"/></g>
    <g className="zw-south-autumn" strokeWidth="1"><path d="M22 29c1-4 3-6 7-7m-5 5c-2-1-2-3-1-4 2 0 3 2 3 3m0-1c0-2 1-3 3-3 1 2 0 3-2 4"/></g>
    <g className="zw-south-winter" strokeWidth="1"><path d="M22 25c1-2 3-2 4 0 2-1 3 0 3 2h-7zm0 4h7"/></g>
  </svg>;
}

/** Four top-level blocks. All start collapsed; a tap reveals that block’s existing pages. */
export function HomeTree({ t, onOpen }: { t: T; onOpen: (s: HomeSection) => void }) {
  const [open, setOpen] = useState<HomeSection | null>(null);
  return <nav id="home-guide" className="ph-tree" data-home-tree data-home-blocks="4" aria-label={t('網站導覽', '网站导览', 'Site guide')}>
    {homeTree(t).map(node => {
      const isOpen = open === node.id;
      const panelId = `ph-tree-panel-${node.id}`;
      return <section key={node.id} className="ph-tree-node" data-open={isOpen ? 'true' : 'false'} data-home-card={node.id}>
        <button type="button" className="ph-tree-primary zw-entry" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpen(isOpen ? null : node.id)}>
          <span className="ph-tree-wash" aria-hidden="true" style={{ backgroundImage: `url("${node.art}")` }} />
          <SeasonalMark section={node.id} /><span><strong>{node.title}</strong><small>{node.hint}</small></span><i aria-hidden>{isOpen ? '−' : '+'}</i>
        </button>
        <div className="ph-tree-body" id={panelId} hidden={!isOpen}><ul>
          {node.primary ? <li key={node.primary.title}><Leaf leaf={node.primary} onOpen={onOpen} /></li> : null}
          {node.items.map(item => item.kind === 'branch'
            ? <Branch key={item.id} branch={item} onOpen={onOpen} />
            : <li key={item.title}><Leaf leaf={item} onOpen={onOpen} /></li>)}
        </ul></div>
      </section>;
    })}
  </nav>;
}
