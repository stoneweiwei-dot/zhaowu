import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");

test("four owner-provided films play only on the public homepage, with visitor actions", () => {
  const film = read("src/components/visitor-welcome-films.tsx");
  const home = read("src/components/painted-home.tsx");
  const styles = read("src/components/visitor-welcome-films.css");
  const clips = ["flute-dragon", "dragon-portrait", "lotus-sunlight", "imperial-cat"];
  assert.match(home, /<VisitorWelcomeFilms locale=\{locale\}/);
  assert.match(film, /data-public-welcome-films/);
  assert.match(film, /<video/);
  assert.match(film, /autoPlay=\{!paused\}/);
  assert.match(film, /playsInline/);
  assert.match(film, /onEnded=\{next\}/);
  assert.match(film, /visibilitychange/);
  assert.match(film, /prefers-reduced-motion/);
  assert.match(film, /href="#home-guide"/);
  assert.match(film, /href="\/about"/);
  assert.match(film, /data-public-features-link/);
  assert.doesNotMatch(film, /<input|passkeySignIn|ownerSignIn/);
  assert.match(styles, /max-width:450px/);
  for(const clip of clips) {
    assert.match(film, new RegExp(clip));
    const video = readFileSync(new URL("../public/login-films/" + clip + ".mp4",import.meta.url));
    const poster = readFileSync(new URL("../public/login-films/" + clip + ".jpg",import.meta.url));
    assert.equal(video.subarray(4,8).toString(), "ftyp");
    assert.equal(poster[0], 0xff);
    assert.equal(poster[1], 0xd8);
    assert.ok(video.length > 50_000 && video.length < 3_500_000);
    assert.ok(statSync(new URL("../public/login-films/"+clip+".jpg",import.meta.url)).size > 5_000);
  }
});

test("owner /login is static, isolated, and keeps password plus Face ID", () => {
  const login = read("src/routes/login.tsx");
  assert.match(login, /LOGIN_BACKDROP/);
  assert.match(login, /stone-login-stage-media/);
  assert.match(login, /data-owner-only-login="true"/);
  assert.match(login, /passkeySignIn\(\)/);
  assert.match(login, /ownerSignIn\(email.trim\(\), secret\)/);
  assert.doesNotMatch(login, /LoginFilmStage|VisitorWelcomeFilms|data-zhaowu-discover-link/);
  assert.match(read("src/routes/about.tsx"), /createFileRoute\("\/about"\)/);
});
