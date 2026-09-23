import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { buildChart } from "@/lib/bazi/chart";
import { useI18n } from "@/lib/i18n";
import { formatSharedBirthRecord, readSharedBirthRecord, type SharedBirthRecord } from "@/lib/shared-birth";
import { deriveCultivationDestiny, type CultivationDestiny } from "@/lib/fun-tests/cultivation-destiny";

export const Route = createFileRoute("/quiz/cultivation-destiny")({ component: CultivationDestinyQuiz });

const MBTI_OPTIONS = [
  "", "INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP",
  "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP",
];

function escapeXml(value: string) {
  return value.replace(/[<>&"']/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;", "'": "&apos;" }[char] ?? char));
}

function chunks(value: string, max = 18) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (!clean) return [""];
  if (/^[\x00-\x7F\s]+$/.test(clean)) {
    const words = clean.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const next = line ? line + " " + word : word;
      if (next.length > max && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
    return lines.slice(0, 4);
  }
  const lines: string[] = [];
  for (let i = 0; i < clean.length; i += max) lines.push(clean.slice(i, i + max));
  return lines.slice(0, 4);
}

function svgLines(text: string, x: number, y: number, size: number, max: number, lineHeight = 1.35, anchor = "start") {
  return chunks(text, max).map((line, index) =>
    '<text x="' + x + '" y="' + (y + index * size * lineHeight) + '" font-size="' + size + '" text-anchor="' + anchor + '" fill="#382a1d">' + escapeXml(line) + "</text>"
  ).join("");
}

function pctLine(label: string, percent: number, y: number) {
  const width = Math.max(8, Math.min(360, percent * 3.6));
  return [
    '<text x="175" y="' + y + '" font-size="21" fill="#4c3825">' + escapeXml(label) + "</text>",
    '<rect x="250" y="' + (y - 17) + '" width="360" height="16" rx="8" fill="#d9c6a4"/>',
    '<rect x="250" y="' + (y - 17) + '" width="' + width + '" height="16" rx="8" fill="#786044"/>',
    '<text x="630" y="' + y + '" font-size="20" fill="#6c5137">' + percent.toFixed(1) + "%</text>",
  ].join("");
}

function buildDestinySvg(result: CultivationDestiny, input: {
  name: string;
  birth: string;
  bazi: string;
  mbti: string;
  locale: "zh-Hant" | "zh-Hans" | "en";
}) {
  const zh = input.locale !== "en";
  const title = zh ? "天機命冊" : "CELESTIAL DOSSIER";
  const subtitle = zh ? "修士先天命格與道途詳鑑" : "Cultivation aptitude & path dossier";
  const labels = zh
    ? { root: "靈根屬性", grade: "靈根品階", identity: "入門身份", peak: "峰脈", five: "五行氣象", six: "六維資質", paths: "道途鑑定", sect: "諸宗適性", three: "三句機驗", final: "天機終評" }
    : { root: "SPIRIT ROOT", grade: "GRADE", identity: "ENTRY", peak: "PEAK", five: "FIVE ELEMENTS", six: "SIX APTITUDES", paths: "PATH FIT", sect: "SECT FIT", three: "THREE LINES", final: "FINAL READING" };
  const boxes = [
    [labels.root, result.rootName],
    [labels.grade, result.rootGrade],
    [labels.identity, result.identity],
    [labels.peak, result.peak],
  ];
  const pathTop = result.paths.slice(0, 5);
  const sectTop = result.sectFits.slice(0, 3);
  const svg: string[] = [];
  svg.push('<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">');
  svg.push('<defs><filter id="paper"><feTurbulence baseFrequency=".7" numOctaves="3" seed="11" type="fractalNoise" result="n"/><feBlend in="SourceGraphic" in2="n" mode="multiply"/></filter><linearGradient id="jade" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#19231f"/><stop offset=".52" stop-color="#2e3833"/><stop offset="1" stop-color="#101714"/></linearGradient></defs>');
  svg.push('<rect width="1080" height="1920" fill="#d6c09c"/>');
  svg.push('<rect x="70" y="54" width="940" height="1810" rx="18" fill="#ead8b6" stroke="#9a7a50" stroke-width="3" filter="url(#paper)"/>');
  svg.push('<rect x="92" y="76" width="896" height="1766" rx="10" fill="none" stroke="#aa895f" stroke-width="2"/>');
  svg.push('<g transform="rotate(-4 152 350)"><rect x="30" y="82" width="218" height="570" rx="42" fill="url(#jade)" stroke="#b6aa8a" stroke-width="5"/><rect x="48" y="104" width="182" height="526" rx="32" fill="none" stroke="#7d8c82" stroke-width="2"/><circle cx="139" cy="560" r="54" fill="none" stroke="#c4b994" stroke-width="4"/><circle cx="139" cy="560" r="25" fill="none" stroke="#c4b994" stroke-width="3"/><path d="M88 560h102M139 509v102" stroke="#c4b994" stroke-width="2"/><text x="139" y="130" font-size="29" text-anchor="middle" fill="#eee4cd" writing-mode="vertical-rl">' + escapeXml(result.sect + (zh ? "入門令牌" : " TOKEN")) + '</text><text x="75" y="164" font-size="19" fill="#cabd9f" writing-mode="vertical-rl">' + escapeXml(result.peak) + "</text></g>");
  svg.push('<text x="620" y="145" font-size="58" text-anchor="middle" font-weight="700" fill="#332517">' + escapeXml(title) + "</text>");
  svg.push('<text x="620" y="190" font-size="25" text-anchor="middle" fill="#665039">' + escapeXml(subtitle) + "</text>");
  svg.push('<line x1="290" x2="940" y1="220" y2="220" stroke="#9b7b52" stroke-width="2"/>');
  svg.push(svgLines((zh ? "命主 " : "NAME ") + input.name, 310, 270, 24, 32));
  svg.push(svgLines((zh ? "生辰 " : "BIRTH ") + input.birth, 310, 310, 20, 38));
  svg.push(svgLines((zh ? "八字 " : "BAZI ") + input.bazi, 310, 346, 20, 38));
  svg.push(svgLines((zh ? "旁證 " : "SIDE ") + result.zodiac + " · " + result.trigram + (input.mbti ? " · " + input.mbti : ""), 310, 382, 20, 38));

  boxes.forEach((item, index) => {
    const x = 285 + index * 174;
    svg.push('<rect x="' + x + '" y="430" width="156" height="180" rx="70" fill="none" stroke="#a63f32" stroke-width="4"/>');
    svg.push('<text x="' + (x + 78) + '" y="474" font-size="18" text-anchor="middle" fill="#8e3028" font-weight="700">' + escapeXml(item[0]) + "</text>");
    svg.push(svgLines(item[1], x + 78, 520, 20, 8, 1.3, "middle"));
  });

  svg.push('<line x1="135" x2="945" y1="660" y2="660" stroke="#9b7b52" stroke-width="2"/>');
  svg.push('<text x="145" y="710" font-size="27" font-weight="700" fill="#382a1d">' + labels.five + "</text>");
  result.elements.forEach((item, index) => svg.push(pctLine(item.label, item.percent, 755 + index * 42)));

  svg.push('<text x="590" y="710" font-size="27" font-weight="700" fill="#382a1d">' + labels.six + "</text>");
  result.dimensions.forEach((item, index) => {
    const y = 755 + index * 39;
    svg.push('<text x="600" y="' + y + '" font-size="21" fill="#4c3825">' + escapeXml(item.label) + "</text>");
    svg.push('<text x="720" y="' + y + '" font-size="20" fill="#71563b">' + escapeXml("★".repeat(item.score) + "☆".repeat(10 - item.score)) + "</text>");
  });

  svg.push('<line x1="135" x2="945" y1="995" y2="995" stroke="#9b7b52" stroke-width="2"/>');
  svg.push('<text x="145" y="1045" font-size="27" font-weight="700" fill="#382a1d">' + labels.paths + "</text>");
  pathTop.forEach((item, index) => {
    const y = 1088 + index * 36;
    svg.push('<text x="155" y="' + y + '" font-size="20" fill="#4c3825">' + escapeXml(item.label) + "</text>");
    svg.push('<text x="270" y="' + y + '" font-size="19" fill="#6b5137">' + escapeXml("★".repeat(item.score)) + "</text>");
  });
  svg.push('<text x="565" y="1045" font-size="27" font-weight="700" fill="#382a1d">' + labels.sect + "</text>");
  sectTop.forEach((item, index) => {
    const y = 1088 + index * 52;
    svg.push('<text x="575" y="' + y + '" font-size="21" fill="#4c3825">' + escapeXml(item.name) + "</text>");
    svg.push('<text x="575" y="' + (y + 27) + '" font-size="18" fill="#8b332a">' + escapeXml(item.status + " · " + item.peak) + "</text>");
  });

  svg.push('<line x1="135" x2="945" y1="1300" y2="1300" stroke="#9b7b52" stroke-width="2"/>');
  svg.push('<text x="145" y="1350" font-size="27" font-weight="700" fill="#382a1d">' + labels.three + "</text>");
  svg.push(svgLines((zh ? "最大機緣 " : "Opening: ") + result.opportunity, 155, 1395, 20, 36));
  svg.push(svgLines((zh ? "最大劫數 " : "Trial: ") + result.trial, 155, 1465, 20, 36));
  svg.push(svgLines((zh ? "核心道意 " : "Dao: ") + result.dao, 155, 1535, 20, 36));

  svg.push('<line x1="135" x2="945" y1="1625" y2="1625" stroke="#9b7b52" stroke-width="2"/>');
  svg.push('<text x="145" y="1675" font-size="27" font-weight="700" fill="#382a1d">' + labels.final + "</text>");
  svg.push(svgLines(result.finalReading, 155, 1720, 21, 39));
  svg.push('<text x="540" y="1823" font-size="24" text-anchor="middle" fill="#8c7254" opacity=".58">STONE 原創</text>');
  svg.push('<text x="540" y="1852" font-size="15" text-anchor="middle" fill="#897357">' + escapeXml(zh ? "仙俠世界觀測靈圖 · 不取代正式命盤" : "Fictional cultivation-world profile · not a formal chart verdict") + "</text>");
  svg.push("</svg>");
  return svg.join("");
}

async function downloadPng(svg: string, filename: string) {
  const source = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(source);
  try {
    const image = new Image();
    image.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("image-render-failed"));
      image.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("canvas-unavailable");
    context.drawImage(image, 0, 0, 1080, 1920);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error("png-export-failed")), "image/png", 0.96);
    });
    const out = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = out;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(out), 1500);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function CultivationDestinyQuiz() {
  const { locale } = useI18n();
  const [birth, setBirth] = useState<SharedBirthRecord | null>(null);
  const [name, setName] = useState("");
  const [mbti, setMbti] = useState("");
  const [generated, setGenerated] = useState(false);
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    setBirth(readSharedBirthRecord());
  }, []);

  const chart = useMemo(() => {
    if (!birth) return null;
    try {
      return buildChart({ ...birth, question: "", locale });
    } catch {
      return null;
    }
  }, [birth, locale]);

  const result = useMemo(() => {
    if (!generated || !birth || !chart) return null;
    return deriveCultivationDestiny({ chart, birthMonth: birth.month, birthDay: birth.day, locale, mbti });
  }, [birth, chart, generated, locale, mbti]);

  const copy = locale === "en"
    ? {
        kicker: "FUN TEST · CULTIVATION WORLD",
        title: "Cultivation Destiny Dossier",
        lead: "Turn your saved birth chart into a xianxia-world spirit root, sect, cultivation paths and a personal 9:16 dossier image.",
        boundary: "This is a fictional worldbuilding translation. BaZi/Five-Element data comes from your existing chart; zodiac and optional MBTI are low-weight flavour. It never changes your formal chart.",
        noBirth: "A saved birth record is required because this test does not invent a chart from quiz answers.",
        back: "Create or restore my birth chart",
        name: "Name / alias",
        namePh: "Your name or cultivation alias",
        mbti: "MBTI (optional)",
        mbtiNone: "Not provided",
        birth: "Birth record",
        generate: "Generate my cultivation dossier",
        root: "Spirit root",
        grade: "Grade",
        identity: "Entry identity",
        sect: "Sect / peak",
        material: "Token",
        five: "Five-Element climate",
        six: "Six aptitudes",
        paths: "Path appraisal",
        partner: "Dao companion fit",
        sects: "Sect fit",
        three: "Three verification lines",
        route: "Cultivation route",
        final: "Final reading",
        evidence: "Evidence boundary",
        save: "Save 9:16 PNG",
        retry: "Recalculate",
        exportFail: "PNG export failed on this browser. The on-screen result remains available.",
        fellow: "Fellow cultivator",
      }
    : locale === "zh-Hans"
      ? {
          kicker: "趣味测验 · 修仙世界观",
          title: "修仙命格灵测",
          lead: "把已保存的生辰命盘转译成仙侠世界里的灵根 宗门 峰脉 修行道途与个人九比十六命测图",
          boundary: "这是仙侠世界观转译 八字与五行只读取网站现有命盘 星座与自填 MBTI 仅作低权重旁证 不会修改正式命盘结论",
          noBirth: "需要先有一份已保存生辰 本测验不会靠答题反推或伪造八字",
          back: "先建立或恢复生辰命盘",
          name: "姓名或道号",
          namePh: "填写姓名或你想显示的道号",
          mbti: "MBTI 可选",
          mbtiNone: "不提供",
          birth: "出生资料",
          generate: "生成我的天机命册",
          root: "灵根",
          grade: "品阶",
          identity: "入门身份",
          sect: "宗门峰脉",
          material: "令牌材质",
          five: "五行气象",
          six: "六维资质",
          paths: "道途鉴定",
          partner: "道侣适性",
          sects: "诸宗适性",
          three: "三句机验",
          route: "修行命途",
          final: "天机终评",
          evidence: "推演边界",
          save: "保存九比十六 PNG",
          retry: "重新推演",
          exportFail: "当前浏览器导出 PNG 失败 画面与文字结果仍可正常查看",
          fellow: "道友",
        }
      : {
          kicker: "趣味測驗 · 修仙世界觀",
          title: "修仙命格靈測",
          lead: "把已保存的生辰命盤轉譯成仙俠世界裡的靈根 宗門 峰脈 修行道途與個人九比十六命測圖",
          boundary: "這是仙俠世界觀轉譯 八字與五行只讀取網站現有命盤 星座與自填 MBTI 僅作低權重旁證 不會修改正式命盤結論",
          noBirth: "需要先有一份已保存生辰 本測驗不會靠答題反推或偽造八字",
          back: "先建立或恢復生辰命盤",
          name: "姓名或道號",
          namePh: "填寫姓名或你想顯示的道號",
          mbti: "MBTI 可選",
          mbtiNone: "不提供",
          birth: "出生資料",
          generate: "生成我的天機命冊",
          root: "靈根",
          grade: "品階",
          identity: "入門身份",
          sect: "宗門峰脈",
          material: "令牌材質",
          five: "五行氣象",
          six: "六維資質",
          paths: "道途鑑定",
          partner: "道侶適性",
          sects: "諸宗適性",
          three: "三句機驗",
          route: "修行命途",
          final: "天機終評",
          evidence: "推演邊界",
          save: "保存 9:16 PNG",
          retry: "重新推演",
          exportFail: "目前瀏覽器匯出 PNG 失敗 畫面與文字結果仍可正常查看",
          fellow: "道友",
        };

  if (!birth || !chart) {
    return (
      <main className="mx-auto max-w-3xl space-y-5 pb-16">
        <header className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8">
          <p className="text-xs tracking-[0.24em] text-cinnabar">ZHAOWU · {copy.kicker}</p>
          <h1 className="mt-2 font-display text-3xl text-ink">{copy.title}</h1>
          <p className="mt-4 text-[15px] leading-7 text-ink-soft">{copy.lead}</p>
        </header>
        <section className="seal-border rounded-2xl bg-paper p-5 sm:p-7">
          <p className="text-sm leading-7 text-ink-soft">{copy.noBirth}</p>
          <Link to="/" className="mt-5 grid min-h-12 place-items-center rounded-full bg-cinnabar px-5 py-3 text-sm text-cream">{copy.back}</Link>
        </section>
      </main>
    );
  }

  const displayName = name.trim() || copy.fellow;
  const bazi = chart.pillars.filter((pillar) => pillar.ready).map((pillar) => pillar.ganZhi).join(" ");
  const birthLine = formatSharedBirthRecord(birth, locale);
  const svg = result ? buildDestinySvg(result, { name: displayName, birth: birthLine, bazi, mbti, locale }) : "";
  const imageUrl = svg ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg) : "";

  async function savePng() {
    if (!svg) return;
    setExportError("");
    try {
      await downloadPng(svg, "zhaowu-cultivation-destiny-" + Date.now() + ".png");
    } catch {
      setExportError(copy.exportFail);
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-5 pb-16">
      <header className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8">
        <p className="text-xs tracking-[0.24em] text-cinnabar">ZHAOWU · {copy.kicker}</p>
        <h1 className="mt-2 font-display text-3xl text-ink">{copy.title}</h1>
        <p className="mt-4 text-[15px] leading-7 text-ink-soft">{copy.lead}</p>
        <p className="mt-4 rounded-xl border border-line bg-paper px-4 py-3 text-sm leading-6 text-ink-soft">{copy.boundary}</p>
      </header>

      {!generated ? (
        <section className="seal-border rounded-2xl bg-paper p-5 sm:p-7">
          <div>
            <span className="text-xs tracking-[0.2em] text-ink-mute">{copy.birth}</span>
            <p className="mt-2 text-sm leading-6 text-ink">{birthLine}</p>
            <p className="mt-1 text-sm text-ink-soft">{bazi}</p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm text-ink">
              <span>{copy.name}</span>
              <input value={name} maxLength={32} onChange={(event) => setName(event.target.value)} placeholder={copy.namePh} className="min-h-12 rounded-xl border border-line bg-cream px-4 text-base text-ink" />
            </label>
            <label className="grid gap-2 text-sm text-ink">
              <span>{copy.mbti}</span>
              <select value={mbti} onChange={(event) => setMbti(event.target.value)} className="min-h-12 rounded-xl border border-line bg-cream px-4 text-base text-ink">
                {MBTI_OPTIONS.map((value) => <option key={value || "none"} value={value}>{value || copy.mbtiNone}</option>)}
              </select>
            </label>
          </div>
          <button type="button" onClick={() => setGenerated(true)} className="mt-6 min-h-12 w-full rounded-full bg-cinnabar px-5 py-3 text-sm text-cream">{copy.generate}</button>
        </section>
      ) : null}

      {result ? (
        <section className="space-y-5">
          <article className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8">
            <p className="text-xs tracking-[0.22em] text-cinnabar">{locale === "en" ? "CELESTIAL DOSSIER" : "天機命冊"}</p>
            <h2 className="mt-2 font-display text-3xl text-ink">{displayName} · {result.rootName}</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                [copy.grade, result.rootGrade + " · " + result.specialAffinity],
                [copy.identity, result.identity],
                [copy.sect, result.sect + " · " + result.peak],
                [copy.material, result.tokenMaterial],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-line bg-paper px-4 py-3">
                  <span className="text-xs text-ink-mute">{label}</span>
                  <strong className="mt-1 block text-sm leading-6 text-ink">{value}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="seal-border rounded-2xl bg-paper p-5 sm:p-7">
            <h3 className="font-display text-2xl text-ink">{copy.five}</h3>
            <div className="mt-4 grid gap-3">
              {result.elements.map((item) => (
                <div key={item.element}>
                  <div className="flex items-center justify-between text-sm"><span className="text-ink">{item.label}</span><span className="text-ink-mute">{item.percent.toFixed(1)}%</span></div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-paper-deep"><div className="h-full bg-cinnabar/70" style={{ width: Math.max(3, Math.min(100, item.percent)) + "%" }} /></div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-ink-soft">{result.trigram} · {result.zodiac}{mbti ? " · " + mbti : ""}</p>
          </article>

          <article className="seal-border rounded-2xl bg-paper p-5 sm:p-7">
            <h3 className="font-display text-2xl text-ink">{copy.six}</h3>
            <div className="mt-4 grid gap-3">
              {result.dimensions.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-3 border-b border-line/70 pb-2 text-sm">
                  <span className="text-ink">{item.label}</span>
                  <span className="min-w-0 text-right tracking-[0.08em] text-cinnabar">{"★".repeat(item.score)}<span className="text-ink-mute">{"☆".repeat(10 - item.score)}</span></span>
                </div>
              ))}
            </div>
          </article>

          <article className="seal-border rounded-2xl bg-paper p-5 sm:p-7">
            <h3 className="font-display text-2xl text-ink">{copy.paths}</h3>
            <p className="mt-3 text-sm leading-7 text-ink-soft"><b className="text-ink">{locale === "en" ? "Main" : locale === "zh-Hans" ? "主修" : "主修"}：</b>{result.mainPath.label} · {result.mainPath.score}/10</p>
            <p className="mt-1 text-sm leading-7 text-ink-soft"><b className="text-ink">{locale === "en" ? "Support" : locale === "zh-Hans" ? "辅修" : "輔修"}：</b>{result.supportPath.label} · {result.supportPath.score}/10</p>
            <p className="mt-1 text-sm leading-7 text-ink-soft"><b className="text-ink">{locale === "en" ? "Poor fit" : "不適合"}：</b>{result.unsuitablePaths.map((item) => item.label + " " + item.score + "/10").join(" · ")}</p>
            <div className="mt-4 grid gap-2">
              {result.paths.map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm"><span>{item.label}</span><span className="text-cinnabar">{item.score}/10</span></div>
              ))}
            </div>
          </article>

          <article className="seal-border rounded-2xl bg-paper p-5 sm:p-7">
            <h3 className="font-display text-2xl text-ink">{copy.sects}</h3>
            <div className="mt-4 grid gap-3">
              {result.sectFits.map((item) => (
                <div key={item.name} className="rounded-xl border border-line px-4 py-3">
                  <strong className="block text-sm text-ink">{item.name} · {item.peak}</strong>
                  <span className="mt-1 block text-sm text-ink-soft">{item.score}/10 · {item.status}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="seal-border rounded-2xl bg-paper p-5 sm:p-7">
            <h3 className="font-display text-2xl text-ink">{copy.partner}</h3>
            <p className="mt-3 text-sm leading-7 text-ink-soft">{result.partner}</p>
          </article>

          <article className="seal-border rounded-2xl bg-paper p-5 sm:p-7">
            <h3 className="font-display text-2xl text-ink">{copy.three}</h3>
            <div className="mt-4 grid gap-3 text-sm leading-7 text-ink-soft">
              <p><b className="text-ink">{locale === "en" ? "Opening" : "最大機緣"}：</b>{result.opportunity}</p>
              <p><b className="text-ink">{locale === "en" ? "Trial" : "最大劫數"}：</b>{result.trial}</p>
              <p><b className="text-ink">{locale === "en" ? "Core Dao" : "核心道意"}：</b>{result.dao}</p>
            </div>
          </article>

          <article className="seal-border rounded-2xl bg-paper p-5 sm:p-7">
            <h3 className="font-display text-2xl text-ink">{copy.route}</h3>
            <div className="mt-4 grid gap-3 text-sm leading-7 text-ink-soft">
              <p><b className="text-ink">{locale === "en" ? "Common" : "常途"}：</b>{result.commonRoute}</p>
              <p><b className="text-ink">{locale === "en" ? "Upper" : "上途"}：</b>{result.upperRoute}</p>
              <p><b className="text-ink">{locale === "en" ? "Extreme" : "極途"}：</b>{result.extremeRoute}</p>
            </div>
          </article>

          <article className="seal-border rounded-2xl bg-cream/95 p-5 sm:p-8">
            <h3 className="font-display text-2xl text-ink">{copy.final}</h3>
            <p className="mt-4 text-[15px] leading-8 text-ink">{result.finalReading}</p>
          </article>

          <article className="seal-border rounded-2xl bg-paper p-4 sm:p-6">
            <h3 className="font-display text-xl text-ink">{copy.evidence}</h3>
            <p className="mt-3 text-xs leading-6 text-ink-soft">{result.evidenceNote}</p>
            <p className="mt-2 text-xs leading-6 text-ink-soft">{result.ziweiNote}</p>
          </article>

          <article className="seal-border rounded-2xl bg-cream/95 p-4 sm:p-6">
            <img src={imageUrl} alt={locale === "en" ? "Personal cultivation destiny dossier" : "個人修仙命測圖"} className="mx-auto block h-auto w-full max-w-[540px] rounded-xl border border-line" />
            <button type="button" onClick={() => void savePng()} className="mt-4 min-h-12 w-full rounded-full bg-cinnabar px-5 py-3 text-sm text-cream">{copy.save}</button>
            {exportError ? <p role="alert" className="mt-3 text-xs leading-6 text-cinnabar">{exportError}</p> : null}
          </article>

          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => { setGenerated(false); setExportError(""); }} className="min-h-12 rounded-full border border-line bg-cream px-5 py-3 text-sm text-ink">{copy.retry}</button>
            <Link to="/" className="grid min-h-12 place-items-center rounded-full border border-line bg-paper px-5 py-3 text-sm text-ink">{locale === "en" ? "Back home" : "返回首頁"}</Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
