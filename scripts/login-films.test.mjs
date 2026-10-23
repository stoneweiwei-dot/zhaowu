import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
test("homepage has truly editable visitor login connected to existing authentication", () => {
 const home = read("src/components/painted-home.tsx");
 const page = read("src/components/visitor-entrance.tsx");
 assert.ok(home.includes("<VisitorEntrance locale={locale} />"));
 for (const part of ["<form","type=\"email\"","type=\"password\"","value={email}","value={password}","loginVisitor(cleanEmail, password)","registerVisitor(cleanEmail, password, nickname)","requestVisitorPasswordReset(cleanEmail)","data-public-features-link","data-public-guest-entry"]) assert.ok(page.includes(part),part);
 assert.ok(!page.includes("<video"));
 assert.ok(!page.includes("/login-films/"));
});
test("standalone owner login stays intact and about section is separate", () => {
 const page = read("src/routes/login.tsx");
 assert.ok(page.includes("passkeySignIn()"));
 assert.ok(page.includes("ownerSignIn(email.trim(), secret)"));
 assert.ok(!page.includes("VisitorEntrance"));
 assert.ok(read("src/routes/about.tsx").includes("createFileRoute(\"/about\")"));
});
