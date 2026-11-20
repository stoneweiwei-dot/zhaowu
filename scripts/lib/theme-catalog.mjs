import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Read the real TypeScript catalog, irrespective of whitespace/property order.
// Reject a non-literal entry rather than silently omitting a newly added skin.
export function readThemeCatalog(source = readFileSync('src/lib/theme-skins.ts', 'utf8')) {
  const file = ts.createSourceFile('theme-skins.ts', source, ts.ScriptTarget.Latest, true);
  let catalog;
  function value(node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
    if (ts.isNumericLiteral(node)) return Number(node.text);
    if (ts.isArrayLiteralExpression(node)) return node.elements.map(value);
    if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.map(prop => {
      assert.ok(ts.isPropertyAssignment(prop), 'Theme catalog entries must use explicit properties');
      return [prop.name.text, value(prop.initializer)];
    }));
    throw new Error('Theme catalog values must be literal: new themes must not be skipped by validation');
  }
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(file) === 'SKINS') catalog = value(node.initializer);
    ts.forEachChild(node, visit);
  }
  visit(file);
  assert.ok(Array.isArray(catalog) && catalog.length, 'SKINS catalog is missing or empty');
  return catalog;
}
