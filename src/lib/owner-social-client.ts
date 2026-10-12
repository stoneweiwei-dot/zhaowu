export type SocialChannel = "instagram" | "threads";

export type SocialConfiguration = {
  instagram: boolean;
  threads: boolean;
  ready: boolean;
  targets: {
    instagram: string;
    threads: string;
  };
  threadsOauthReady: boolean;
  threadsAccounts: ThreadsAccount[];
};

export type ThreadsAccount = {
  id: string;
  userId: string;
  username: string;
  profilePictureUrl: string;
  expiresAt: string | null;
  source: "oauth" | "env";
};

export type ThreadsAccountPublishResult = {
  accountId: string;
  username: string;
  ok: boolean;
  id?: string;
  code?: string;
  message?: string;
};

export type SocialPublishResult = {
  ok: boolean;
  id?: string;
  code?: string;
  message?: string;
  accounts?: ThreadsAccountPublishResult[];
};

type ApiPayload = {
  ok?: boolean;
  error?: string;
  message?: string;
  channels?: SocialConfiguration;
  results?: Partial<Record<SocialChannel, SocialPublishResult>>;
};

async function payloadOf(response: Response): Promise<ApiPayload> {
  return response.json().catch(() => ({})) as Promise<ApiPayload>;
}

export async function readSocialConfiguration(): Promise<SocialConfiguration> {
  const response = await fetch("/api/owner-session", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "social.status" }),
  });
  const body = await payloadOf(response);
  if (!response.ok || !body.channels) throw new Error(body.message || body.error || "SOCIAL_STATUS_FAILED");
  return body.channels;
}

export async function publishOwnerSocialPost(input: {
  text: string;
  imageUrl: string;
  altText: string;
  channels: SocialChannel[];
  threadAccountIds?: string[];
}): Promise<Partial<Record<SocialChannel, SocialPublishResult>>> {
  const response = await fetch("/api/owner-session", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "social.publish", ...input }),
  });
  const body = await payloadOf(response);
  if (body.results) return body.results;
  throw new Error(body.message || body.error || `HTTP ${response.status}`);
}

async function socialAction(action: string, extra: Record<string, unknown> = {}): Promise<ApiPayload & { url?: string }> {
  const response = await fetch("/api/owner-session", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...extra }),
  });
  const body = await response.json().catch(() => ({})) as ApiPayload & { url?: string };
  if (!response.ok || body.ok === false) throw new Error(body.message || body.error || `HTTP ${response.status}`);
  return body;
}

export async function startThreadsConnection(): Promise<string> {
  const body = await socialAction("social.threads.connect");
  if (!body.url) throw new Error("THREADS_OAUTH_URL_MISSING");
  return body.url;
}

export async function disconnectThreadsAccount(accountId: string): Promise<void> {
  await socialAction("social.threads.disconnect", { accountId });
}
