#!/usr/bin/env node
/**
 * Stable, zero-AI-cost daily social draft from the existing reviewed content bank.
 * Does NOT fabricate daily almanac, 24 solar terms, weather or hemisphere facts.
 * No network access, account access or publishing. stdout is one post JSON.
 */
import { pathToFileURL } from "node:url";
import { SOCIAL_CONTENT_BANK, bankPostText } from "../../../lib/social-content-bank.js";

export function sydneyLocalDate(now = new Date()) {
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) throw Error("Invalid instant");
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now).map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function dailyDraft(date, bank = SOCIAL_CONTENT_BANK) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(`${date}T00:00:00Z`))) throw Error("Invalid date");
  if (!Array.isArray(bank) || !bank.length) throw Error("Empty reviewed content bank");
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000);
  const entry = bank[((day % bank.length) + bank.length) % bank.length];
  if (typeof entry?.body !== "string" || !entry.body.trim() || typeof entry?.key !== "string") throw Error("Invalid reviewed content");
  const text = bankPostText(entry);
  if ([...text].length > 500 || [...text].length > 2200) throw Error("Reviewed content exceeds channel limit");
  return {
    local_date: date,
    topic: entry.key,
    captions: {
      facebook: text,
      instagram: text,
      threads: text,
    },
    image_url: "",
    image_alt: "",
    image_aspect_ratio: "4:5",
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const date = process.argv[2] || sydneyLocalDate();
  process.stdout.write(JSON.stringify(dailyDraft(date), null, 2) + "\n");
}
