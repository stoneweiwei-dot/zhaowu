import assert from "node:assert/strict";
import test from "node:test";
import { scoreSixRealmAnswers } from "../src/lib/fun-tests/six-realms.ts";

const cases = [
  ["AAAAAA", ["A"]],
  ["BBBBBB", ["B"]],
  ["CCCCCC", ["C"]],
  ["DDDDDD", ["D"]],
  ["EEEEEE", ["E"]],
  ["FFFFFF", ["F"]],
  ["AABBCC", ["A", "B", "C"]],
];

for (const [input, winners] of cases) {
  test(`six realms score ${input}`, () => {
    const result = scoreSixRealmAnswers([...input]);
    assert.deepEqual(result.winners, winners);
    assert.equal(result.tied, winners.length > 1);
  });
}

test("six realms scoring keeps all six counts", () => {
  const result = scoreSixRealmAnswers(["A", "B", "C", "D", "E", "F"]);
  assert.deepEqual(result.counts, { A: 1, B: 1, C: 1, D: 1, E: 1, F: 1 });
});
