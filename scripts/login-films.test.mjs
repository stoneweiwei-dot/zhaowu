import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
test("temporary public entrance withdrawal restores existing artwork and feature navigation", () => {
 const home = read("src/components/painted-home.tsx");
 assert.ok(!home.includes("VisitorEntrance"));
 assert.ok(!home.includes("VisitorWelcomeFilms"));
 assert.ok(home.includes('<div className="ph-hero">'));
 assert.ok(home.includes("<HomeTree t={t} onOpen={onOpen} />"));

});
test("standalone owner login stays intact and about section is separate", () => {
 const page = read("src/routes/login.tsx");
 assert.ok(page.includes("passkeySignIn()"));
 assert.ok(page.includes("ownerSignIn(email.trim(), secret)"));
 assert.ok(!page.includes("VisitorEntrance"));
 assert.ok(read("src/routes/about.tsx").includes("createFileRoute(\"/about\")"));
});
