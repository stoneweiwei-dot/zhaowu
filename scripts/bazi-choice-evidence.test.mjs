import test from "node:test";
import assert from "node:assert/strict";
import { leanChoice } from "../src/lib/bazi/interpret.ts";

test("a work choice without concrete comparison does not become a strength-only recommendation", () => {
  const answer = leanChoice("留在現在公司，還是接受新工作？");
  assert.match(answer, /不能可靠強選/);
  assert.match(answer, /留在現在公司/);
  assert.match(answer, /接受新工作/);
  assert.match(answer, /收益/);
  assert.match(answer, /退出成本/);
  assert.doesNotMatch(answer, /偏向|原局承載偏弱/);
});

test("a yes-or-no choice cannot imply a weak chart when no chart is provided", () => {
  const answer = leanChoice("我要不要離職？");
  assert.match(answer, /條件不足/);
  assert.doesNotMatch(answer, /偏弱|原則上可以動/);
});
