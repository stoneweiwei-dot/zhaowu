import { createHash } from "node:crypto";

export const ZHAOWU_ENGINE_VERSION = "R6.2.1";
export const ZHAOWU_RELEASE = "ZW-WEB-2026.09.23-r182";

export const SOURCE_KINDS = Object.freeze({
  CALC_TRUTH: "CALC_TRUTH",
  ZHAOWU_DERIVED: "ZHAOWU_DERIVED",
  SIDE_CHANNEL: "SIDE_CHANNEL",
  AI_INTERPRETATION: "AI_INTERPRETATION",
});

export const COMPARISON_STATUS = Object.freeze({
  MATCH: "MATCH",
  PARTIAL: "PARTIAL",
  CONFLICT: "CONFLICT",
  UNAVAILABLE: "UNAVAILABLE",
});

function cleanString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, stableValue(value[key])]),
  );
}

export function stableJson(value) {
  return JSON.stringify(stableValue(value));
}

function uniqueSorted(values) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.map(cleanString).filter(Boolean))].sort();
}

function ganZhiOf(value) {
  if (typeof value === "string") return cleanString(value);
  if (!value || typeof value !== "object") return null;
  return cleanString(value.ganZhi ?? value.ganzhi ?? value.value ?? value.label);
}

function orderedPillars(value) {
  if (Array.isArray(value)) return value.map(ganZhiOf).filter(Boolean).slice(0, 4);
  if (!value || typeof value !== "object") return [];
  return ["year", "month", "day", "time", "hour"]
    .map((key) => ganZhiOf(value[key]))
    .filter(Boolean)
    .slice(0, 4);
}

function scalar(value) {
  if (typeof value === "string") return cleanString(value);
  if (!value || typeof value !== "object") return null;
  return cleanString(
    value.label ??
      value.value ??
      value.name ??
      value.gan ??
      value.stem ??
      value.dayMaster ??
      value.tendency,
  );
}

function normalizedDayun(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return { ganZhi: cleanString(item) };
      if (!item || typeof item !== "object") return null;
      const ganZhi = ganZhiOf(item);
      if (!ganZhi) return null;
      const out = { ganZhi };
      if (Number.isInteger(item.startYear)) out.startYear = item.startYear;
      if (Number.isInteger(item.endYear)) out.endYear = item.endYear;
      return out;
    })
    .filter(Boolean);
}

export function projectZhaowuChart(snapshot) {
  const chart = snapshot?.chart && typeof snapshot.chart === "object" ? snapshot.chart : snapshot ?? {};
  const strength = chart.strength && typeof chart.strength === "object" ? chart.strength : {};
  return {
    engineVersion: ZHAOWU_ENGINE_VERSION,
    pillars: orderedPillars(chart.pillars),
    dayMaster: scalar(chart.dayMaster),
    monthBranch: cleanString(chart.monthBranch),
    strength: {
      tendency: scalar(strength.tendency ?? strength.label ?? strength),
      deLing: typeof strength.deLing === "boolean" ? strength.deLing : null,
      deDi: typeof strength.deDi === "boolean" ? strength.deDi : null,
      deShi: typeof strength.deShi === "boolean" ? strength.deShi : null,
    },
    useful: uniqueSorted(chart.useful),
    pattern: scalar(chart.pattern ?? snapshot?.pattern ?? snapshot?.judgments?.pattern),
    dayun: normalizedDayun(chart.dayun),
  };
}

export function isUsableZhaowuSnapshot(snapshot) {
  const projected = projectZhaowuChart(snapshot);
  return Boolean(projected.dayMaster && projected.pillars.length >= 3);
}

export function createChartFingerprint(snapshot) {
  const projection = projectZhaowuChart(snapshot);
  if (!projection.dayMaster || projection.pillars.length < 3) return null;
  const digest = createHash("sha256")
    .update(stableJson(projection), "utf8")
    .digest("hex")
    .slice(0, 16)
    .toUpperCase();
  return `ZW-${ZHAOWU_ENGINE_VERSION}-${digest}`;
}

export function projectMingshuChart(payload) {
  const facts = payload?.facts && typeof payload.facts === "object" ? payload.facts : {};
  const judgments =
    payload?.judgments && typeof payload.judgments === "object" ? payload.judgments : {};
  const strength =
    judgments.strength && typeof judgments.strength === "object" ? judgments.strength : {};
  return {
    pillars: orderedPillars(facts.pillars ?? payload?.pillars),
    dayMaster: scalar(facts.dayMaster ?? payload?.dayMaster),
    strength: scalar(strength.label ?? judgments.strength),
    useful: uniqueSorted(judgments.useful),
    pattern: scalar(judgments.pattern),
    chartDigest: cleanString(payload?.chartDigest),
  };
}

function compareField(field, left, right) {
  const missingLeft =
    left == null || (Array.isArray(left) && left.length === 0) || left === "";
  const missingRight =
    right == null || (Array.isArray(right) && right.length === 0) || right === "";
  if (missingLeft || missingRight) {
    return { field, status: COMPARISON_STATUS.UNAVAILABLE, zhaowu: left ?? null, mingshu: right ?? null };
  }

  if (Array.isArray(left) || Array.isArray(right)) {
    const l = uniqueSorted(Array.isArray(left) ? left : [left]);
    const r = uniqueSorted(Array.isArray(right) ? right : [right]);
    if (stableJson(l) === stableJson(r)) {
      return { field, status: COMPARISON_STATUS.MATCH, zhaowu: left, mingshu: right };
    }
    const overlap = l.filter((item) => r.includes(item));
    return {
      field,
      status: overlap.length ? COMPARISON_STATUS.PARTIAL : COMPARISON_STATUS.CONFLICT,
      zhaowu: left,
      mingshu: right,
      ...(overlap.length ? { overlap } : {}),
    };
  }

  return {
    field,
    status: stableJson(left) === stableJson(right) ? COMPARISON_STATUS.MATCH : COMPARISON_STATUS.CONFLICT,
    zhaowu: left,
    mingshu: right,
  };
}

export function compareZhaowuWithMingshu(zhaowuSnapshot, mingshuPayload) {
  const local = projectZhaowuChart(zhaowuSnapshot);
  const external = projectMingshuChart(mingshuPayload);
  const checks = [
    compareField("pillars", local.pillars, external.pillars),
    compareField("dayMaster", local.dayMaster, external.dayMaster),
    compareField("strength", local.strength.tendency, external.strength),
    compareField("useful", local.useful, external.useful),
    compareField("pattern", local.pattern, external.pattern),
  ];
  const comparable = checks.filter((item) => item.status !== COMPARISON_STATUS.UNAVAILABLE);
  const status = comparable.length === 0
    ? COMPARISON_STATUS.UNAVAILABLE
    : comparable.some((item) => item.status === COMPARISON_STATUS.CONFLICT)
      ? COMPARISON_STATUS.CONFLICT
      : comparable.some((item) => item.status === COMPARISON_STATUS.PARTIAL)
        ? COMPARISON_STATUS.PARTIAL
        : COMPARISON_STATUS.MATCH;

  return {
    status,
    fingerprint: createChartFingerprint(zhaowuSnapshot),
    coverage: { compared: comparable.length, total: checks.length },
    checks,
    sources: {
      zhaowu: { layer: SOURCE_KINDS.CALC_TRUTH, engineVersion: ZHAOWU_ENGINE_VERSION },
      mingshu: { layer: SOURCE_KINDS.SIDE_CHANNEL, chartDigest: external.chartDigest },
    },
    resolution: "ZHAOWU_REMAINS_AUTHORITATIVE",
    overridesBaziCalcTruth: false,
  };
}
