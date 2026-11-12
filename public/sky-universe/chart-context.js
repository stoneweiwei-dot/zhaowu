/**
 * Integration boundary for Stone's Meta AI solar-system artwork.
 * Dates are Sydney calendar days. Animation geometry remains the original
 * artistic illustration and is independent from the dated observations below.
 */
export const TIME_ZONE = 'Australia/Sydney';
const DAY_MS = 86_400_000;
const SUPPORTED_LANGUAGES = new Set(['zh-Hant', 'zh-Hans', 'en']);
const SYDNEY_DAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
});

export function sydneyDate(now = new Date()) {
  const parts = SYDNEY_DAY.formatToParts(now);
  const value = (type) => parts.find((part) => part.type === type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}

// Find the next calendar-day boundary rather than assuming a 24-hour day.
// Sydney's daylight-saving transition days last 23 or 25 hours.
export function nextSydneyMidnight(now = new Date()) {
  const today = sydneyDate(now);
  let before = now.getTime();
  let after = before + 26 * 60 * 60 * 1000;
  while (after - before > 1) {
    const middle = Math.floor((before + after) / 2);
    if (sydneyDate(new Date(middle)) === today) before = middle;
    else after = middle;
  }
  return after;
}

// UTC noon represents a calendar date without involving the device's timezone
// or Sydney's 23/25-hour daylight-saving transition days.
export function calendarDate(day, offset = 0) {
  return new Date(Date.parse(`${day}T12:00:00Z`) + offset * DAY_MS);
}

// Preserve the original illustration's 11 November scene as its reference.
// This advances its schematic orbits; it is not an ephemeris calculation.
export function orbitalDayOffset(day, offset = 0) {
  return (calendarDate(day).getTime() - calendarDate('2026-11-11').getTime()) / DAY_MS + offset;
}

export function dateLabel(date, language) {
  return new Intl.DateTimeFormat(language === 'en' ? 'en-AU' : language, {
    timeZone: 'UTC', year: 'numeric', month: language === 'en' ? 'long' : 'numeric', day: 'numeric',
  }).format(date);
}

export function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

const WORDS = [
  ['昭梧觀象', '昭梧观象', 'ZHAOWU'],
  ['太陽攜行星系 · 穿行銀河', '太阳携行星系 · 穿行银河', 'The solar system travels through the galaxy'],
  ['太陽帶著八大行星在宇宙中穿行的動態觀象圖：拖曳旋轉視角，滾輪縮放', '太阳带着八大行星在宇宙中穿行的动态观象图：拖曳旋转视角，滚轮缩放', 'Animated Sun and eight planets. Drag to rotate, scroll or pinch to zoom.'],
  ['太陽表面 · G2V · 米粒組織 · 黑子 · 日冕', '太阳表面 · G2V · 米粒组织 · 黑子 · 日冕', 'Solar surface · G2V · granulation · sunspots · corona'],
  ['水星或金星經過太陽後方時，太陽自動變淡', '水星或金星经过太阳后方时，太阳自动变淡', 'The Sun fades when Mercury or Venus passes behind it in this view'],
  ['近白顆粒為米粒組織，深色點為黑子，外圍絲狀為日冕。', '近白颗粒为米粒组织，深色点为黑子，外围丝状为日冕。', 'Pale grains show granulation, dark spots show sunspots, and outer filaments show the corona.'],
  ['縮放超過 2', '缩放超过 2', 'Zoom above 2'],
  ['時可見更多米粒組織細節。', '时可见更多米粒组织细节。', ' to see more granulation detail.'],
  ['太陽行進方向 → 220 km/s', '太阳行进方向 → 220 km/s', 'Solar travel → 220 km/s'],
  ['太陽穿行 220 km/s · 時間 ', '太阳穿行 220 km/s · 时间 ', 'Solar motion 220 km/s · Speed '],
  ['太陽 · G2V · 220 km/s', '太阳 · G2V · 220 km/s', 'Sun · G2V · 220 km/s'],
  ['表面 5505°C · 直徑 1', '表面 5505°C · 直径 1', 'Surface 5505°C · Diameter 1'],
  ['真實色近白 · 表面 ~5', '真实色近白 · 表面 ~5', 'Near-white natural colour · Surface ~5'],
  ['3 光年 · 示意刻度', '3 光年 · 示意刻度', '3 light-years · illustrative scale'],
  ['坑洞 + 灰褐表面 · 布滿撞擊坑', '坑洞 + 灰褐表面 · 布满撞击坑', 'Grey-brown surface covered with impact craters'],
  ['硫酸雲 + 濃厚大氣 · 雲層完全包覆', '硫酸云 + 浓厚大气 · 云层完全包覆', 'Sulfuric-acid clouds and a thick atmosphere'],
  ['藍色海洋 + 白雲 + 大陸', '蓝色海洋 + 白云 + 大陆', 'Blue oceans, white clouds and continents'],
  ['奧林帕斯山 + 極冠 + 峽谷', '奥林帕斯山 + 极冠 + 峡谷', 'Olympus Mons, polar caps and canyons'],
  ['大紅斑 + 條紋雲帶', '大红斑 + 条纹云带', 'Great Red Spot and cloud bands'],
  ['環 + 淡金色球體', '环 + 淡金色球体', 'Rings and a pale-gold globe'],
  ['淡青色 + 側躺自轉 · 軸傾斜約 98°', '淡青色 + 侧躺自转 · 轴倾斜约 98°', 'Pale cyan, rotating on its side · axial tilt about 98°'],
  ['深藍 + 大黑斑 + 強風帶', '深蓝 + 大黑斑 + 强风带', 'Deep blue, dark storms and strong winds'],
  ['事件視界 · 光無法逃逸', '事件视界 · 光无法逃逸', 'Event horizon · light cannot escape'],
  ['冰核 + 離子尾 + 塵埃尾', '冰核 + 离子尾 + 尘埃尾', 'Icy nucleus, ion tail and dust tail'],
  ['大質量恆星爆發 · 膨脹中', '大质量恒星爆发 · 膨胀中', 'Expanding debris from a massive star'],
  ['快速自轉中子星 · 雙束射電', '快速自转中子星 · 双束射电', 'Rapidly rotating neutron star · twin radio beams'],
  ['白 · −1.46 等 · 全天最亮', '白 · −1.46 等 · 全天最亮', 'White · magnitude −1.46 · brightest night-sky star'],
  ['橙 · 巨星', '橙 · 巨星', 'Orange giant'],
  ['藍白 · 主序星', '蓝白 · 主序星', 'Blue-white main-sequence star'],
  ['恆星搖籃', '恒星摇篮', 'Stellar nursery'],
  ['火星與木星之間', '火星与木星之间', 'Between Mars and Jupiter'],
  ['水星 · 辰星 · 五行水', '水星 · 辰星 · 五行水', 'Mercury · Chen Xing · Water symbolism'],
  ['金星 · 太白 · 五行金', '金星 · 太白 · 五行金', 'Venus · Tai Bai · Metal symbolism'],
  ['地球 · 后土', '地球 · 后土', 'Earth · Hou Tu symbolism'],
  ['火星 · 熒惑 · 五行火', '火星 · 荧惑 · 五行火', 'Mars · Ying Huo · Fire symbolism'],
  ['木星 · 歲星 · 五行木', '木星 · 岁星 · 五行木', 'Jupiter · Sui Xing · Wood symbolism'],
  ['土星 · 鎮星 · 五行土', '土星 · 镇星 · 五行土', 'Saturn · Zhen Xing · Earth symbolism'],
  ['天王星 · 天王', '天王星 · 天王', 'Uranus · sky symbolism'],
  ['海王星 · 海王', '海王星 · 海王', 'Neptune · sea symbolism'],
  ['火衛一 · Phobos', '火卫一 · Phobos', 'Phobos'],
  ['木衛一 · Io', '木卫一 · Io', 'Io'],
  ['木衛二 · Europa', '木卫二 · Europa', 'Europa'],
  ['木衛三 · Ganymede', '木卫三 · Ganymede', 'Ganymede'],
  ['木衛四 · Callisto', '木卫四 · Callisto', 'Callisto'],
  ['土衛六 · Titan', '土卫六 · Titan', 'Titan'],
  ['太陽透明度', '太阳透明度', 'Solar transparency'],
  ['時間軸 前後 30 天', '时间轴 前后 30 天', 'Timeline, 30 days before or after today'],
  ['縮放 5% 到 400%', '缩放 5% 到 400%', 'Zoom from 5% to 400%'],
  ['拖曳標題移動面板', '拖曳标题移动面板', 'Drag the title to move this panel'],
  ['關閉功能選單', '关闭功能选单', 'Close controls'],
  ['關閉表面面板', '关闭表面面板', 'Close surface panel'],
  ['小而真實的衛星', '小而真实的卫星', 'Selected moons, illustrated'],
  ['對比全部表面', '对比全部表面', 'Compare all surfaces'],
  ['對比', '对比', 'Compare'],
  ['真實直徑', '真实直径', 'Diameter'],
  ['表面溫度', '表面温度', 'Surface temperature'],
  ['表面特徵：', '表面特征：', 'Surface features '],
  ['天 · 軌道速度 ', '天 · 轨道速度 ', ' days · Orbital speed '],
  ['公轉週期', '公转周期', 'Orbital period'],
  ['軌道速度', '轨道速度', 'Orbital speed'],
  ['點按查看大圖', '点按查看大图', 'Tap to enlarge'],
  ['表面面板', '表面面板', 'Surface panel'],
  ['回到今天', '回到今天', 'Today'],
  ['回到太陽', '回到太阳', 'Return to Sun'],
  ['跟隨太陽', '跟随太阳', 'Follow Sun'],
  ['重置視角', '重置视角', 'Reset view'],
  ['自動漫遊', '自动漫游', 'Auto tour'],
  ['自動透明', '自动透明', 'Auto fade'],
  ['太陽表面', '太阳表面', 'Solar surface'],
  ['上一顆', '上一颗', 'Previous'],
  ['下一顆', '下一颗', 'Next'],
  ['功能選單', '功能选单', 'Controls'],
  ['此時天象', '此时天象', 'Sky now'],
  ['超新星殘骸', '超新星残骸', 'Supernova remnant'],
  ['小行星帶', '小行星带', 'Asteroid belt'],
  ['脈衝星', '脉冲星', 'Pulsar'],
  ['織女星', '织女星', 'Vega'],
  ['天狼星', '天狼星', 'Sirius'],
  ['大角星', '大角星', 'Arcturus'],
  ['天王星', '天王星', 'Uranus'],
  ['海王星', '海王星', 'Neptune'],
  ['水星', '水星', 'Mercury'],
  ['金星', '金星', 'Venus'],
  ['地球', '地球', 'Earth'],
  ['火星', '火星', 'Mars'],
  ['木星', '木星', 'Jupiter'],
  ['土星', '土星', 'Saturn'],
  ['太陽', '太阳', 'Sun'],
  ['月球', '月球', 'Moon'],
  ['黑洞', '黑洞', 'Black hole'],
  ['彗星', '彗星', 'Comet'],
  ['星雲', '星云', 'Nebula'],
  ['灰褐', '灰褐', 'Grey-brown'],
  ['淡黃白', '淡黄白', 'Pale yellow-white'],
  ['橙紅', '橙红', 'Orange-red'],
  ['米白棕', '米白棕', 'Cream-brown'],
  ['淡金', '淡金', 'Pale gold'],
  ['淡青', '淡青', 'Pale cyan'],
  ['深藍', '深蓝', 'Deep blue'],
  ['真實色', '真实色', 'Natural colour'],
  ['衛星數', '卫星数', 'Known moons'],
  ['衛星', '卫星', 'Moons'],
  ['距日', '距日', 'From Sun'],
  ['繞銀心', '绕银心', 'Galactic orbit'],
  ['文化：', '文化：', 'Cultural symbolism '],
  ['直徑', '直径', 'Diameter'],
  ['週期', '周期', 'Period'],
  ['環繞', '环绕', 'Orbiting'],
  ['表面', '表面', 'Surface'],
  ['藍', '蓝', 'Blue'],
  ['聚焦', '聚焦', 'Focus '],
  ['功能', '功能', 'Menu'],
  ['關閉', '关闭', 'Close'],
  ['俯視', '俯视', 'Top view'],
  ['側視', '侧视', 'Side view'],
  ['自由', '自由', 'Free view'],
  ['視角', '视角', 'View'],
  ['時間軸', '时间轴', 'Timeline'],
  ['時間', '时间', 'Speed'],
  ['流速', '流速', 'Flow'],
  ['行星', '行星', 'Planets'],
  ['螺旋', '螺旋', 'Spiral'],
  ['軌跡', '轨迹', 'Trails'],
  ['軌道線', '轨道线', 'Orbits'],
  ['現象', '现象', 'Objects'],
  ['顯示', '显示', 'Display'],
  ['不透明', '不透明', 'Opaque'],
  ['半透明', '半透明', 'Half transparent'],
  ['高透明', '高透明', 'Transparent'],
  ['播放', '播放', 'Play'],
  ['暫停', '暂停', 'Pause'],
  ['縮小', '缩小', 'Zoom out'],
  ['放大', '放大', 'Zoom in'],
  ['全景', '全景', 'Overview'],
  ['慢', '慢', 'Slow'],
  ['中', '中', 'Medium'],
  ['快', '快', 'Fast'],
  ['強', '强', 'Strong'],
  ['弱', '弱', 'Soft'],
  ['開', '开', 'On'],
  ['關', '关', 'Off'],
  ['顆', '颗', ''],
  ['天', '天', ' days'],
].sort((first, second) => second[0].length - first[0].length);

export function translate(value, language) {
  if (typeof value !== 'string' || language === 'zh-Hant') return value;
  let result = value;
  for (const [traditional, simplified, english] of WORDS) {
    result = result.split(traditional).join(language === 'en' ? english : simplified);
  }
  return result;
}

export function createChartContext(language) {
  const locale = SUPPORTED_LANGUAGES.has(language) ? language : 'zh-Hant';
  const text = (value) => translate(value, locale);
  return {
    locale, text, calendarDate, isoDate, orbitalDayOffset,
    dateLabel: (date) => dateLabel(date, locale),
    useToday(React) {
      const [today, setToday] = React.useState(sydneyDate);
      React.useEffect(() => {
        let timer;
        const refresh = () => {
          const now = new Date();
          setToday(sydneyDate(now));
          window.clearTimeout(timer);
          timer = window.setTimeout(refresh, nextSydneyMidnight(now) - now.getTime());
        };
        refresh();
        document.addEventListener('visibilitychange', refresh);
        window.addEventListener('focus', refresh);
        window.addEventListener('pageshow', refresh);
        window.addEventListener('zhaowu:sky-today', refresh);
        return () => {
          window.clearTimeout(timer);
          document.removeEventListener('visibilitychange', refresh);
          window.removeEventListener('focus', refresh);
          window.removeEventListener('pageshow', refresh);
          window.removeEventListener('zhaowu:sky-today', refresh);
        };
      }, []);
      return today;
    },
    elementProps(props) {
      if (!props) return props;
      const next = { ...props };
      const children = (value) => Array.isArray(value) ? value.map(children) : text(value);
      next.children = children(props.children);
      for (const attribute of ['aria-label', 'title', 'alt']) {
        if (typeof props[attribute] === 'string') next[attribute] = text(props[attribute]);
      }
      if (props.children === '回到今天') {
        next.onClick = (...args) => {
          window.dispatchEvent(new Event('zhaowu:sky-today'));
          props.onClick?.(...args);
        };
      }
      return next;
    },
    decorateContext(context) {
      const fillText = context.fillText.bind(context);
      context.fillText = (value, ...args) => fillText(text(value), ...args);
      return context;
    },
  };
}
