import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import { test } from "node:test";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("Filipino UI dictionary covers all master copy keys", () => {
  const source = read("src/lib/i18n.ts");
  const master = source.split("const TABLE = {")[1]?.split("} as const satisfies Record<string, Entry>")[0];
  assert.ok(master);
  const expected = [...master.matchAll(/^  ([a-z][a-zA-Z0-9]+):\s*/gm)].map((x) => x[1]).sort();
  const target = read("src/lib/display-dictionaries/fil.ts");
  const body = target.split("const dictionary = {")[1]?.split("} satisfies Partial<Record<CopyKey, string>>")[0];
  assert.ok(body);
  const actual = [...body.matchAll(/^  "([a-z][a-zA-Z0-9]+)":/gm)].map((x) => x[1]).sort();
  assert.deepEqual(actual, expected);
});
test("Filipino choice is persisted and dynamically loaded", () => {
  const code = read("src/lib/display-language.ts");
  const shell = read("src/components/site-shell.tsx");
  for (const needle of ['"fil-PH"', 'import("@/lib/display-dictionaries/fil")', 'value === "fil"', 'language === "fil"']) {
    assert.ok(code.includes(needle), needle);
  }
  assert.ok(shell.includes('value: "fil" as const'));
});

test("All ten language dictionaries cover every shared UI key", () => {
  const source = read("src/lib/i18n.ts");
  const body = source.split("const TABLE = {")[1]?.split("} as const satisfies Record<string, Entry>")[0];
  assert.ok(body);
  const keys = [...body.matchAll(/^  ([a-z][a-zA-Z0-9]+):\s*/gm)].map((x) => x[1]);
  const english = source.split("const EN: Record<CopyKey, string> = {")[1]?.split("\n};")[0];
  assert.ok(english);
  const enKeys = [...english.matchAll(/^  ([a-z][a-zA-Z0-9]+):\s*/gm)].map((x) => x[1]);
  assert.deepEqual(enKeys.sort(), [...keys].sort());
  const display = read("src/lib/display-language.ts");
  for (const lang of ["JA", "KO", "HI"]) {
    const part = display.split("const " + lang + ": UiDictionary = {")[1]?.split("\n};")[0];
    assert.ok(part, lang);
    const actual = [...part.matchAll(/^  ([a-z][a-zA-Z0-9]+):\s*/gm)].map((x) => x[1]);
    assert.deepEqual(actual.sort(), [...keys].sort(), lang);
  }
  for (const lang of ["th", "id", "vi"]) {
    const s = read("src/lib/display-dictionaries/" + lang + ".ts");
    const part = s.split("const dictionary = {")[1]?.split("} satisfies Partial<Record<CopyKey, string>>")[0];
    assert.ok(part, lang);
    const actual = [...part.matchAll(/^  ([a-z][a-zA-Z0-9]+):\s*/gm)].map((x) => x[1]);
    assert.deepEqual(actual.sort(), [...keys].sort(), lang);
  }
});

test("Shared navigation and footer copy has offline Thai, Indonesian, Vietnamese and Filipino", () => {
  const shell = read("src/components/site-shell.tsx");
  const start = shell.indexOf("const SHELL_COPY: Record<string, Record<ExtraLanguage, string>> = ");
  assert.ok(start >= 0);
  const content = shell.slice(start).split(" = ")[1].split(";\n")[0];
  const phrases = JSON.parse(content);
  const languageTags = ["th", "id", "vi", "fil"];
  assert.ok(Object.keys(phrases).length >= 25);
  for (const [english, translations] of Object.entries(phrases)) {
    assert.ok(english.length > 0);
    for (const lang of languageTags) {
      assert.ok(typeof translations[lang] === "string" && translations[lang].trim(), english + ": " + lang);
      // International loanwords such as Media, Admin and Privacy are acceptable when natural.
    }
  }
});
