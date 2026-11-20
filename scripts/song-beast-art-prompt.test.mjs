import assert from "node:assert/strict";
import test from "node:test";
import {
  SONG_BEAST_ARCHETYPES,
  SONG_BEAST_ART_VERSION,
  GUARDIAN_BEAST_ART_BY_ELEMENT,
  buildSongBeastArtPrompt,
  isSongBeastImageContext,
} from "../src/lib/song-beast-art-prompt.ts";

test("all existing 8 inner animals and 5 chart guardians have one distinct prompt archetype", () => {
  const ids = SONG_BEAST_ARCHETYPES.map((a) => a.id);
  assert.equal(ids.length, 13);
  assert.equal(new Set(ids).size, 13);
  assert.equal(new Set(SONG_BEAST_ARCHETYPES.map((a) => a.form)).size, 13);
  assert.equal(new Set(Object.values(GUARDIAN_BEAST_ART_BY_ELEMENT)).size, 5);
});

test("all three modes retain Song art style and no generated text", () => {
  for (const mode of ["solo", "companion", "atlas"]) {
    const prompt = buildSongBeastArtPrompt({ archetype: "yinglong", mode });
    assert.match(prompt, /北宋院畫|北宋畫院/);
    assert.match(prompt, /9:16/);
    assert.match(prompt, /留白/);
    assert.match(prompt, /STONE 原創/);
    assert.match(prompt, /no generated letters|不生成任何文字|無字/);
    assert.ok(prompt.includes(SONG_BEAST_ART_VERSION));
  }
});

test("solo stays beast-only, while companion requires a real photo for likeness", () => {
  const solo = buildSongBeastArtPrompt({ archetype: "fox", mode: "solo" });
  const paired = buildSongBeastArtPrompt({ archetype: "fox", mode: "companion", personDescription: "成年男子，無鬍鬚" });
  assert.match(solo, /禁止人物/);
  assert.match(paired, /成年男子，無鬍鬚/);
  assert.match(paired, /未附照片/);
  assert.notEqual(solo, paired);
});

test("different species do not get the same morphology", () => {
  const crane = buildSongBeastArtPrompt({ archetype: "crane" });
  const leopard = buildSongBeastArtPrompt({ archetype: "leopard" });
  assert.match(crane, /修長頸腿/);
  assert.match(leopard, /貓科軀幹/);
  assert.notEqual(crane, leopard);
});

test("owner-defined original beast keeps custom morphology separate from predefined chart beasts", () => {
  const original = buildSongBeastArtPrompt({
    archetype: "original", originalName: "溯光玄隱",
    originalForm: "白羽、木角、水紋軀幹，四足與尾羽解剖比例協調", mode: "companion",
  });
  assert.match(original, /溯光玄隱/);
  assert.match(original, /四足與尾羽/);
  assert.match(original, /未附照片/);
  assert.notEqual(original, buildSongBeastArtPrompt({ archetype: "qilin", mode: "companion" }));
});

test("legacy provider prompt selector only matches beast topics", () => {
  assert.equal(isSongBeastImageContext("命局瑞獸：應龍"), true);
  assert.equal(isSongBeastImageContext("inner animal"), true);
  assert.equal(isSongBeastImageContext("神兽原创图鉴"), true);
  assert.equal(isSongBeastImageContext("personal destiny report, general finance"), false);
  assert.equal(isSongBeastImageContext("tea guardian portrait"), false);
});
