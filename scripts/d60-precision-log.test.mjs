import assert from "node:assert/strict";
import test from "node:test";
import { logD60MinutePrecisionConfirmation as log } from "../src/lib/indian-astrology/d60-precision-log.ts";

test("confirmation storage is SSR-safe, minimal, bounded, and silently optional", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  try {
    delete globalThis.window;
    assert.doesNotThrow(() => log("minute"));
    let raw = null;
    let key;
    globalThis.window = { localStorage: {
      getItem: () => raw,
      setItem: (storageKey, value) => { key = storageKey; raw = value; },
    } };
    log("minute");
    assert.equal(key, "zhaowu:d60-minute-precision-log");
    const first = JSON.parse(raw)[0];
    assert.deepEqual(Object.keys(first).sort(), ["confirmed", "precision", "timestamp"]);
    assert.equal(first.confirmed, true);
    assert.equal(first.precision, "minute");
    assert.ok(Number.isFinite(Date.parse(first.timestamp)));
    raw = JSON.stringify(Array.from({ length: 60 }, (_, i) => ({
      timestamp: new Date(i * 1000).toISOString(), confirmed: true, precision: "minute", name: "discard",
    })));
    log("minute");
    const capped = JSON.parse(raw);
    assert.equal(capped.length, 50);
    assert.equal(capped[0].timestamp, new Date(11000).toISOString());
    assert.ok(capped.every(e => Object.keys(e).length === 3));
    for (const corrupt of ["invalid", "{}", "null", '[null,{},{"precision":"unknown"}]']) {
      raw = corrupt;
      log("minute");
      assert.equal(JSON.parse(raw).length, 1);
    }
    const before = raw;
    log("unknown");
    assert.equal(raw, before);
    for (const method of ["getItem", "setItem"]) {
      globalThis.window = { localStorage: {
        getItem: () => null, setItem: () => {},
        [method]: () => { throw new Error("storage unavailable"); },
      } };
      assert.doesNotThrow(() => log("minute"));
    }
    globalThis.window = {};
    Object.defineProperty(globalThis.window, "localStorage", { get() { throw new Error("privacy"); } });
    assert.doesNotThrow(() => log("minute"));
    globalThis.window = {};
    assert.doesNotThrow(() => log("minute"));
  } finally {
    if (original) Object.defineProperty(globalThis, "window", original);
    else delete globalThis.window;
  }
});
