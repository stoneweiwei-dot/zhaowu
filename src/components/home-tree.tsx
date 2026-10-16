import { useState } from 'react';
import { BrandIcon } from '@/components/brand-icon';

export type HomeSection = 'form' | 'today' | 'quiz' | 'notes';
type T = (zh: string, hans: string, en: string) => string;

export type TreeLeaf =
  | { kind: 'link'; href: string; title: string; hint: string }
  | { kind: 'action'; section: HomeSection; title: string; hint: string };
export type TreeBranch = { kind: 'branch'; id: string; title: string; hint: string; children: TreeLeaf[] };
export type TreeNode = {
  id: HomeSection;
  title: string;
  hint: string;
  art: string;
  icon: 'reports' | 'calendar' | 'insight' | 'articles';
  /** Main call-to-action shown first inside the opened node. */
  primary: TreeLeaf;
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
      hint: t('輸入生辰，看懂你的性格與人生節奏。', '输入生辰，看懂你的性格与人生节奏。', 'Enter your birth date. Understand your patterns and rhythm.'),
      primary: { kind: 'action', section: 'form', title: t('開始排盤：填寫出生日期', '开始排盘：填写出生日期', 'Start: enter your birth date'), hint: t('免費 · 免登入 · 約 1 分鐘', '免费 · 免登录 · 约 1 分钟', 'Free · no sign-in · about 1 minute') },
      items: [
        { kind: 'link', href: '/history', title: t('我的報告', '我的报告', 'My reports'), hint: t('看過的報告都收在這裡，隨時回來讀。', '看过的报告都收在这里，随时回来读。', 'Every report you have made, kept in one place.') },
        { kind: 'link', href: '/soul-chapters', title: t('靈階鏡像', '灵阶镜像', 'Soul Chapters'), hint: t('人生有十章，哪一章最像現在的你？', '人生有十章，哪一章最像现在的你？', 'Ten life chapters. Which one feels like yours right now?') },
      ],
    },
    {
      id: 'today', icon: 'calendar', art: '/art/scene-lotus-boat-v1.webp',
      title: t('今日指引', '今日指引', 'Today’s guide'),
      hint: t('黃曆、穿衣顏色、今天適合做什麼。', '黄历、穿衣颜色、今天适合做什么。', 'Almanac, colours to wear, and what suits today.'),
      primary: { kind: 'action', section: 'today', title: t('看今天的黃曆與天象', '看今天的黄历与天象', 'Open today’s almanac and sky'), hint: t('宜忌、節氣、當日天象一頁看完', '宜忌、节气、当日天象一页看完', 'Dos and don’ts, solar term and sky events on one page') },
      items: [
        { kind: 'link', href: '/daily-colors', title: t('每日幸運色', '每日幸运色', 'Colour of the day'), hint: t('今天穿什麼顏色比較順。', '今天穿什么颜色比较顺。', 'Which colour to wear today.') },
        { kind: 'link', href: '/auspicious-atlas', title: t('吉象圖鑑', '吉象图鉴', 'Auspicious symbols'), hint: t('認識傳統吉祥圖案與它們的寓意。', '认识传统吉祥图案与它们的寓意。', 'Traditional lucky motifs and what they mean.') },
      ],
    },
    {
      id: 'quiz', icon: 'insight', art: '/art/scene-osmanthus-tea-v1.webp',
      title: t('趣味測驗', '趣味测验', 'Quizzes'),
      hint: t('幾分鐘，看見另一面的自己。', '几分钟，看见另一面的自己。', 'A few minutes to meet another side of you.'),
      primary: { kind: 'action', section: 'quiz', title: t('看全部測驗', '看全部测验', 'See all quizzes'), hint: t('每個測驗都能獨立完成', '每个测验都能独立完成', 'Each one stands on its own') },
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
        { kind: 'branch', id: 'life', title: t('生活小測', '生活小测', 'Everyday'), hint: t('香氣與茶，輕鬆玩', '香气与茶，轻松玩', 'Scent and tea, just for fun'), children: [
          { kind: 'action', section: 'quiz', title: t('五行香氣譜', '五行香气谱', 'Scent map'), hint: t('看嗅覺偏好與五行的文化象意', '看嗅觉偏好与五行的文化象意', 'Scent preferences and their cultural meaning') },
          { kind: 'link', href: '/tea-guardian', title: t('七題找到適合的茶', '七题找到适合的茶', 'Find your tea'), hint: t('七個問題，配一款適合你的茶', '七个问题，配一款适合你的茶', 'Seven questions, one tea') },
        ] },
      ],
    },
    {
      id: 'notes', icon: 'articles', art: '/art/scene-butterfly-dream-v1.webp',
      title: t('文章專欄', '文章专栏', 'Articles'),
      hint: t('慢慢讀：文章、短札與小知識。', '慢慢读：文章、短札与小知识。', 'Slow reading: essays, notes and short explainers.'),
      primary: { kind: 'action', section: 'notes', title: t('讀觀世錄文章', '读观世录文章', 'Read the latest essays'), hint: t('最新文章與完整內容檔案', '最新文章与完整内容档案', 'Newest writing and the full archive') },
      items: [
        { kind: 'link', href: '/knowledge', title: t('命理小知識', '命理小知识', 'Short explainers'), hint: t('方法、術語與判讀規則，查得到也看得懂。', '方法、术语与判读规则，查得到也看得懂。', 'Methods, terms and how to read them.') },
        { kind: 'link', href: '/updates', title: t('最新更新', '最新更新', 'What’s new'), hint: t('網站最近多了什麼。', '网站最近多了什么。', 'What changed on the site recently.') },
      ],
    },
  ];
}

function Leaf({ leaf, onOpen }: { leaf: TreeLeaf; onOpen: (s: HomeSection) => void }) {
  const body = <><span><strong>{leaf.title}</strong><small>{leaf.hint}</small></span><i aria-hidden>›</i></>;
  return leaf.kind === 'link'
    ? <a className="ph-tree-leaf" href={leaf.href}>{body}</a>
    : <button type="button" className="ph-tree-leaf" onClick={() => onOpen(leaf.section)}>{body}</button>;
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

/** Expandable, layer-by-layer guide. One entrance open at a time; everything starts collapsed. */
export function HomeTree({ t, onOpen }: { t: T; onOpen: (s: HomeSection) => void }) {
  const [openId, setOpenId] = useState<HomeSection | null>(null);
  const tree = homeTree(t);
  return <nav className="ph-tree" data-home-tree aria-label={t('網站導覽', '网站导览', 'Site guide')}>
    {tree.map(node => {
      const open = openId === node.id;
      const bodyId = `ph-tree-${node.id}`;
      return <section key={node.id} className="ph-tree-node" data-open={open} data-home-card={node.id}>
        <button type="button" className="ph-tree-head" aria-expanded={open} aria-controls={bodyId} onClick={() => setOpenId(open ? null : node.id)}>
          <img src={node.art} alt="" loading="lazy" />
          <span className="ph-tree-head-text"><strong>{node.title}</strong><small>{node.hint}</small></span>
          <i aria-hidden><BrandIcon name={node.icon} /></i>
          <b aria-hidden className="ph-tree-toggle">{open ? '−' : '+'}</b>
        </button>
        <div id={bodyId} className="ph-tree-body" hidden={!open}>
          <button type="button" className="ph-tree-primary" onClick={() => node.primary.kind === 'action' && onOpen(node.primary.section)}>
            <span><strong>{node.primary.title}</strong><small>{node.primary.hint}</small></span><i aria-hidden>→</i>
          </button>
          <ul>{node.items.map(item => item.kind === 'branch'
            ? <Branch key={item.id} branch={item} onOpen={onOpen} />
            : <li key={item.title}><Leaf leaf={item} onOpen={onOpen} /></li>)}</ul>
        </div>
      </section>;
    })}
  </nav>;
}
