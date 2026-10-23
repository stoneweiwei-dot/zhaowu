import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const film = read("src/components/login-film-stage.tsx");
const login = read("src/routes/login.tsx");
const componentStyles = read("src/login-films.css");

test("the sign-in screen uses four actual MP4 clips and HTML playback controls", () => {
  const titles = ["flute-dragon", "dragon-portrait", "lotus-sunlight", "imperial-cat"];
  assert.match(film, /<video/);
  assert.match(film, /playsInline/);
  assert.match(film, /preload="metadata"/);
  assert.match(film, /onEnded=\{nextFilm\}/);
  assert.match(film, /setIndex\(current => \(current \+ 1\) % FILMS.length\)/);
  assert.match(film, /prefers-reduced-motion/);
  assert.match(film, /visibilitychange/);
  assert.match(film, /onError=\{\(\) => setFailed\(true\)\}/);
  assert.match(film, /muted=\{muted\}/);
  assert.match(componentStyles, /max-width: 430px/);
  for (const title of titles) {
    assert.ok(film.includes("/login-films/" + title + ".mp4"));
    assert.ok(film.includes("/login-films/" + title + ".jpg"));
    const mp4 = readFileSync(new URL("../public/login-films/" + title + ".mp4", import.meta.url));
    const jpg = readFileSync(new URL("../public/login-films/" + title + ".jpg", import.meta.url));
    assert.equal(mp4.subarray(4, 8).toString(), "ftyp");
    assert.equal(jpg[0], 0xff);
    assert.equal(jpg[1], 0xd8);
    assert.ok(mp4.length > 50_000 && mp4.length < 3_500_000);
    assert.ok(statSync(new URL("../public/login-films/" + title + ".jpg", import.meta.url)).size > 5_000);
  }
  assert.doesNotMatch(film, /firestorage|oaiusercontent/);
});

test("Face ID/password remain independent and /about is a separate page", () => {
  assert.match(login, /<LoginFilmStage locale=\{locale\} \/>/);
  assert.match(login, /passkeySignIn\(\)/);
  assert.match(login, /ownerSignIn\(email.trim\(\), secret\)/);
  assert.match(login, /data-owner-passkey-login/);
  assert.match(login, /data-zhaowu-discover-link/);
  assert.match(login, /<Link to="\/about">/);
  assert.match(read("src/routes/about.tsx"), /createFileRoute\("\/about"\)/);
});
