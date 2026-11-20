async function jsonOrEmpty(response: Response) {
  return response.json().catch(() => ({})) as Promise<Record<string, unknown>>;
}

export async function ownerSignIn(email: string, secret: string): Promise<"owner" | "tester"> {
  const response = await fetch("/api/owner-login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, secret }),
  });
  const body = await jsonOrEmpty(response);
  if (!response.ok) {
    throw new Error(body.error === "INVALID_OWNER_CREDENTIAL" ? "帳號或站主密碼不正確。" : "站主登入暫時不可用。");
  }
  return body.mode === "tester" ? "tester" : "owner";
}

export async function readOwnerSession() {
  const response = await fetch("/api/owner-session", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  }).catch(() => null);
  if (!response?.ok) return false;
  const body = await jsonOrEmpty(response);
  return body.authenticated === true;
}

export async function ownerSignOut() {
  await fetch("/api/owner-logout", {
    method: "POST",
    credentials: "include",
  }).catch(() => undefined);
}
