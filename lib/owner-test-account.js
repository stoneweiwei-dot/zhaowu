import { createHash, timingSafeEqual } from "node:crypto";

// Public, zero-privilege demo credential for third-party / AI sign-in testing.
// Its credentials are intentionally public. It never receives an owner cookie and
// is never forwarded to the Supabase owner bridge, so it cannot read or change anything.
// Revoke it by deleting this file and its single use in api/owner-login.js.
const TEST_ACCOUNT_SHA256 = "c85df10c65b54e130904093fcc2517c4183cca6bd70edc8c34df312376ecd3dd";
const TEST_PASSCODE_SHA256 = "785e70fa759f63896bb714e7440f6d756d5696583fd2864d98a25ff642e840cb";

function digestMatches(value, expectedHex) {
  const expected = Buffer.from(expectedHex, "hex");
  const actual = createHash("sha256").update(String(value ?? ""), "utf8").digest();
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function isPublicTestCredential(account, secret) {
  const normalizedAccount = String(account ?? "").trim().toLowerCase();
  const passcode = String(secret ?? "");
  if (!normalizedAccount || normalizedAccount.length > 256 || !passcode || passcode.length > 256) return false;
  // Evaluate both so timing does not reveal which half matched.
  const accountOk = digestMatches(normalizedAccount, TEST_ACCOUNT_SHA256);
  const passcodeOk = digestMatches(passcode, TEST_PASSCODE_SHA256);
  return accountOk && passcodeOk;
}
