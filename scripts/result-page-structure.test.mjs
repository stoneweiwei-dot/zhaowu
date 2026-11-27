import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const file = new URL("../src/components/analysis-form.tsx", import.meta.url);
const source = ts.createSourceFile(file.pathname, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

function descendants(node, predicate) {
  const matches = [];
  function visit(child) {
    if (predicate(child)) matches.push(child);
    ts.forEachChild(child, visit);
  }
  visit(node);
  return matches;
}

const sections = descendants(source, node => ts.isJsxElement(node) &&
  node.openingElement.attributes.properties.some(attr => attr.name?.getText() === "data-result-section"));

test("six ordered result sections start with the expanded chart and two open readings", () => {
  assert.equal(source.parseDiagnostics.length, 0);
  assert.deepEqual(sections.map(section => section.openingElement.getText().match(/data-result-section="(\d+)"/)?.[1]),
    ["01", "02", "03", "04", "05", "06"]);
  assert.match(sections[0].getText(), /previewChart\.pillars\.map/);
  for (const section of sections.slice(0, 3)) {
    assert.equal(section.parent, sections[0].parent);
    assert.doesNotMatch(section.getText(), /<details\b/);
    for (let node = section.parent; node; node = node.parent) {
      if (ts.isJsxElement(node)) assert.notEqual(node.openingElement.tagName.getText(), "details");
    }
  }
});

test("additional interpretation items render exclusively in the unlocked branch of section 03", () => {
  const extras = descendants(source, node => ts.isCallExpression(node) && node.getText() === "plainItems.slice(2)");
  assert.equal(extras.length, 1);
  let branch = extras[0];
  while (branch.parent && !ts.isConditionalExpression(branch.parent)) branch = branch.parent;
  const gate = branch.parent;
  assert.ok(ts.isConditionalExpression(gate));
  assert.equal(gate.condition.getText(), "readingUnlocked");
  assert.equal(gate.whenTrue, branch);
  assert.equal(gate.whenFalse.kind, ts.SyntaxKind.NullKeyword);
  assert.ok(gate.pos >= sections[2].pos && gate.end <= sections[2].end);
});
