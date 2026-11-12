import type { Locale } from "@/lib/i18n";

export const QUIZ_SHARE_SIZE = { width: 1080, height: 1350 } as const;
export const QUIZ_SHARE_PALETTE = { paper: "#F3EBDD", jade: "#286653", indigo: "#414C78", vermilion: "#A8463D", gold: "#B28A45", ink: "#28271F" } as const;

export type QuizShareInput = { quizId: string; quizName: string; resultLabel: string; description: string };
export type QuizShareModel = QuizShareInput & { locale: Locale; description: string; shareUrl: string; marks: { site: string; original: string } };

export function buildQuizShareModel(input: QuizShareInput & { locale: Locale }, pathname = typeof window === "undefined" ? "/" : window.location.pathname): QuizShareModel {
  const description = [...String(input.description ?? "")].slice(0, 40).join("");
  const path = pathname.split(/[?#]/)[0] || "/";
  const origin = typeof window === "undefined" ? "https://zhao-wu.com" : window.location.origin;
  return { ...input, description, shareUrl: `${origin}${path}`, marks: { site: "zhao-wu.com", original: input.locale === "en" ? "© STONE" : "STONE 原創" } };
}

export function renderQuizShareCard(model: QuizShareModel): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = QUIZ_SHARE_SIZE.width;
  canvas.height = QUIZ_SHARE_SIZE.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  const { paper, jade, indigo, vermilion, gold, ink } = QUIZ_SHARE_PALETTE;
  ctx.fillStyle = paper; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#D7C8AE"; ctx.lineWidth = 3; ctx.strokeRect(38, 38, 1004, 1274);
  ctx.strokeStyle = gold; ctx.lineWidth = 2; ctx.strokeRect(57, 57, 966, 1236);
  ctx.fillStyle = jade; ctx.beginPath(); ctx.arc(900, 198, 92, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(65,76,120,.12)"; ctx.beginPath(); ctx.arc(184, 1080, 210, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = vermilion; ctx.fillRect(96, 135, 11, 96);
  ctx.fillStyle = jade; ctx.font = "600 32px system-ui, sans-serif"; ctx.fillText("ZHAOWU · QUIZ", 132, 193);
  ctx.fillStyle = ink; ctx.font = "700 64px system-ui, sans-serif"; wrap(ctx, model.quizName, 132, 330, 790, 82, 2);
  ctx.fillStyle = indigo; ctx.font = "700 82px system-ui, sans-serif"; wrap(ctx, model.resultLabel, 132, 580, 820, 108, 3);
  ctx.fillStyle = gold; ctx.fillRect(132, 846, 200, 6);
  ctx.fillStyle = ink; ctx.font = "400 40px system-ui, sans-serif"; wrap(ctx, model.description, 132, 940, 800, 64, 2);
  ctx.fillStyle = vermilion; ctx.font = "700 30px system-ui, sans-serif"; ctx.fillText(model.marks.original, 132, 1192);
  ctx.fillStyle = jade; ctx.font = "600 30px system-ui, sans-serif"; ctx.textAlign = "right"; ctx.fillText(model.marks.site, 948, 1192);
  return canvas;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
  const words = [...String(text || "")];
  const lines: string[] = []; let line = "";
  for (const char of words) {
    const next = line + char;
    if (line && ctx.measureText(next).width > maxWidth) { lines.push(line); line = char; } else line = next;
  }
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((value, index) => ctx.fillText(value, x, y + index * lineHeight, maxWidth));
}
