import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/components/result-view.tsx', 'utf8');

test('paid visual blueprint is prepared only after the durable full report save', () => {
  const saveIndex = source.indexOf('await saveReportRecord');
  const prepareIndex = source.indexOf('await preparePaidAuraVisual');
  assert.ok(saveIndex >= 0, 'durable save call must exist');
  assert.ok(prepareIndex > saveIndex, 'visual preparation must happen after the durable save');
  assert.match(source, /buildFunctionalTraining\(result\.chart, result\.locale \?\? locale\)/);
  assert.match(source, /buildAuraBlueprint\(training\)/);
});

test('visual preparation remains fail-open and cannot hide a saved text report', () => {
  assert.match(source, /try\s*\{\s*await preparePaidAuraVisual\(session, reportId, aura\);\s*\}\s*catch\s*\{[\s\S]*visual preparation remains fail-open/i);
  assert.match(source, /return reportId;/);
});

test('view-only full-report reveal does not call the paid visual preparation endpoint', () => {
  const onFullStart = source.indexOf('async function onFull()');
  const onSaveStart = source.indexOf('async function onSave()');
  assert.ok(onFullStart >= 0 && onSaveStart > onFullStart);
  const onFullBody = source.slice(onFullStart, onSaveStart);
  assert.doesNotMatch(onFullBody, /preparePaidAuraVisual/);
});
