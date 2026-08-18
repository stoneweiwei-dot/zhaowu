import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { FEATURED_CITIES, filterFeatured } from "@/lib/bazi/cities";
import type { AnalysisResult, AnalyzeInput, CityHit, SavedReport } from "@/lib/bazi/types";

function newId(): string {
  return crypto.randomUUID();
}

function isCity(value: unknown): value is CityHit {
  if (!value || typeof value !== "object") return false;
  const c = value as CityHit;
  return (
    typeof c.name === "string" &&
    typeof c.display === "string" &&
    typeof c.timezone === "string" &&
    Number.isFinite(c.latitude) &&
    Number.isFinite(c.longitude)
  );
}

function parseInput(raw: AnalyzeInput): AnalyzeInput {
  if (!raw.question?.trim()) throw new Error("請先寫下你真正想問的問題。");
  const year = Number(raw.year);
  const month = Number(raw.month);
  const day = Number(raw.day);
  const hour = Number(raw.hour);
  const minute = Number.isFinite(Number(raw.minute)) ? Math.round(Number(raw.minute)) : 0;
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    throw new Error("請分別填寫出生年、月、日。");
  }
  if (year < 1900 || year > 2100 || month < 1 || month > 12) {
    throw new Error("出生日期不正確，請檢查年、月、日。");
  }
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  if (day < 1 || day > lastDay) throw new Error("出生日期不正確，請檢查年、月、日。");
  if (!isCity(raw.city)) throw new Error("請填寫出生城市與國家。");
  if (!raw.timeUnknown && (!Number.isInteger(hour) || hour < 0 || hour > 23 || minute < 0 || minute > 59)) {
    throw new Error("出生時間請使用 24 小時格式。");
  }
  return {
    ...raw,
    year,
    month,
    day,
    hour: raw.timeUnknown ? 12 : hour,
    question: raw.question.trim().slice(0, 400),
    minute: raw.timeUnknown ? 0 : minute,
    liveCity: raw.liveCity && isCity(raw.liveCity) ? raw.liveCity : null,
    relation: raw.relation === "hetero" || raw.relation === "same" || raw.relation === "any" ? raw.relation : "unset",
  };
}

export const getAlmanac = createServerFn({ method: "GET" }).handler(async () => {
  const { currentAlmanac } = await import("@/lib/bazi/chart");
  return currentAlmanac(new Date());
});

export const searchCities = createServerFn({ method: "GET" })
  .validator((q: string) => String(q ?? "").trim().slice(0, 40))
  .handler(async ({ data: q }) => {
    const local = filterFeatured(q);
    if (!q || q.length < 2) return local;
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=zh`;
      const res = await fetch(url);
      if (!res.ok) return local;
      const body = (await res.json()) as {
        results?: {
          name: string;
          country?: string;
          admin1?: string;
          latitude: number;
          longitude: number;
          timezone?: string;
        }[];
      };
      const remote: CityHit[] = (body.results ?? []).map((r) => ({
        name: r.name,
        country: r.country ?? "",
        display: [r.name, r.admin1, r.country].filter(Boolean).join("，"),
        latitude: r.latitude,
        longitude: r.longitude,
        timezone: r.timezone || "UTC",
      }));
      const seen = new Set<string>();
      const merged: CityHit[] = [];
      for (const item of [...local, ...remote]) {
        const key = `${item.display}-${item.latitude.toFixed(2)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        merged.push(item);
      }
      return merged.slice(0, 8);
    } catch {
      return local.length ? local : FEATURED_CITIES.slice(0, 6);
    }
  });

export const analyzeLife = createServerFn({ method: "POST" })
  .validator((input: AnalyzeInput) => parseInput(input))
  .handler(async ({ data }) => {
    const { buildChart } = await import("@/lib/bazi/chart");
    const { interpret, classifyQuestion } = await import("@/lib/bazi/interpret");
    const { buildPalm } = await import("@/lib/palm/engine");
    const { routeMethods } = await import("@/lib/core/method");
    const chart = buildChart(data);
    const palm = buildPalm({
      year: data.year,
      month: data.month,
      day: data.day,
      hour: data.hour,
      timeUnknown: data.timeUnknown,
      gender: data.gender,
    });
    const kind = classifyQuestion(data.question);
    const methodProtocol = routeMethods(kind, {
      palmReady: palm.ready,
      palmMissing: palm.missing,
    });
    const reading = interpret(data.question, chart, data.relation, palm);
    const result: AnalysisResult = {
      id: newId(),
      question: data.question,
      chart,
      reading,
      createdAt: new Date().toISOString(),
      methodProtocol,
      palm,
    };
    return result;
  });

export const writeFullReport = createServerFn({ method: "POST" })
  .validator((payload: { question: string; chart: AnalysisResult["chart"]; reading: AnalysisResult["reading"]; palm?: AnalysisResult["palm"] }) => payload)
  .handler(async ({ data }) => {
    const { composeFullReport } = await import("@/lib/bazi/interpret");
    const palm = data.palm ?? null;
    const fallback = composeFullReport(data.question, data.chart, data.reading, palm);
    if (data.reading.kind === "past") return { text: fallback, source: "rule" as const };
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { text: fallback, source: "rule" as const };

    const detail = data.chart.pillars
      .map((col) => `${col.label}${col.ganZhi} 十神${col.shiShenGan} 納音${col.nayin} 長生${col.diShi} 藏干${col.hide.map((h) => h.gan + h.shiShen).join("")}`)
      .join("；");
    const prompt = `你是「昭梧」。客人花時間把出生資料和真正的問題交給你，你必須像看著這個人說話，不能像在寫免責聲明。

硬規則：
- 第一句就回答問題，給判斷，不要先寫「不保證」「資料不足」「難以判斷」「僅供參考」「要看更多」。
- 缺性別、缺出生時辰、缺大運時：用原局＋流年＋日支照樣下判斷，把現有的盤用盡。禁止說資料不夠。
- 把客人的原話嵌進開頭。點出至少兩件「他看了會覺得被說中」的具體習慣，必須能從日主、日支、月令、十神推出來，不要寫誰都適用的空話。
- 禁止算命腔、禁止保證某月必發生某事、禁止醫療診斷與康復日期、禁止點名具體股票或官司輸贏。
- 健康題：指出他如何硬撐、恢復從哪裡先壞，並清楚寫「已有痛、失眠、掉力就去看醫生」。
- 選擇題：必須選邊，並說明為什麼另一邊現在吃虧。
- 時間題：用流年、大運（有就用）指出「現在這一截」怎麼走，不編造必成之日。
- 繁體中文。短句。像書院文書，不像廟祝。

盤：
問題：${data.question}
四柱明細：${detail}
日主：${data.chart.dayMaster}${data.chart.dayMasterElement}
月令：${data.chart.monthBranch}
旺衰：${data.chart.strength.tendency}。${data.chart.strength.summary}
喜用：${data.chart.useful.join("、")}　洩耗：${data.chart.drain.join("、")}
大運：${data.chart.currentDayun ? `${data.chart.currentDayun.ganZhi} ${data.chart.currentDayun.startYear}-${data.chart.currentDayun.endYear}（${data.chart.currentDayun.startAge}–${data.chart.currentDayun.endAge}歲）` : `以流年${data.chart.currentYear}為今年天氣`}
流年：${data.chart.currentYear}
胎元／命宮：${data.chart.taiyuan}／${data.chart.minggong}
出生地：${data.chart.cityLabel}
真太陽時：${data.chart.trueSolarStamp}
直答底稿（請在此基礎上寫得更準、更像在說這個人，不要更虛）：${data.reading.directAnswer}

依序寫，用小標題：
1 你真正問的事（先給判斷）
2 我憑什麼這樣說（點四柱，不要課堂講義）
3 你的人生節奏
4 你反覆出現的課題
5 命誥
6 工作／感情／財務／身心／家宅
7 未來三十天只做這一件
8 最後一句話`;

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0.55,
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) return { text: fallback, source: "rule" as const };
      const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = body.choices?.[0]?.message?.content?.trim();
      if (!text) return { text: fallback, source: "rule" as const };
      return { text, source: "ai" as const };
    } catch {
      return { text: fallback, source: "rule" as const };
    }
  });

export const saveReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((payload: { result: AnalysisResult; fullReport?: string | null }) => payload)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const id = data.result.id || newId();
    const ganzhi = data.result.chart.pillars.map((p) => p.ganZhi).join(" ");
    await sql`
      insert into reports (id, user_id, question, city_label, day_master, ganzhi_line, chart_json, reading_json, full_report)
      values (
        ${id},
        ${context.userId},
        ${data.result.question},
        ${data.result.chart.cityLabel},
        ${data.result.chart.dayMaster},
        ${ganzhi},
        ${JSON.stringify(data.result.chart)},
        ${JSON.stringify(data.result.reading)},
        ${data.fullReport ?? null}
      )
    `;
    return { id };
  });

export const listReports = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      question: string;
      city_label: string;
      day_master: string;
      ganzhi_line: string;
      created_at: string;
      full_report: string | null;
    }>`
      select id, question, city_label, day_master, ganzhi_line, created_at, full_report
      from reports
      where user_id = ${context.userId}
      order by created_at desc
    `;
    return rows.map(
      (r): SavedReport => ({
        id: r.id,
        question: r.question,
        cityLabel: r.city_label,
        dayMaster: r.day_master,
        ganZhiLine: r.ganzhi_line,
        createdAt: r.created_at,
        hasFullReport: Boolean(r.full_report),
      }),
    );
  });

export const loadReport = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      question: string;
      chart_json: string;
      reading_json: string;
      full_report: string | null;
      created_at: string;
    }>`
      select id, question, chart_json, reading_json, full_report, created_at
      from reports
      where id = ${id} and user_id = ${context.userId}
      limit 1
    `;
    const row = rows[0];
    if (!row) return null;
    const result: AnalysisResult = {
      id: row.id,
      question: row.question,
      chart: JSON.parse(row.chart_json),
      reading: JSON.parse(row.reading_json),
      createdAt: row.created_at,
    };
    return { result, fullReport: row.full_report };
  });

export const deleteReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => id)
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    await sql`delete from reports where id = ${id} and user_id = ${context.userId}`;
    return { ok: true as const };
  });
