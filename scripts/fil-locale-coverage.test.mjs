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
