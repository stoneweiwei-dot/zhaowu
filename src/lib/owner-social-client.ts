export type SocialChannel = "instagram" | "threads";

export type SocialConfiguration = {
  instagram: boolean;
  threads: boolean;
  ready: boolean;
};

export type SocialPublishResult = {
  ok: boolean;
  id?: string;
  code?: string;
  message?: string;
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
  const response = await fetch("/api/owner-social", {
    credentials: "include",
    cache: "no-store",
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
}): Promise<Partial<Record<SocialChannel, SocialPublishResult>>> {
  const response = await fetch("/api/owner-social", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await payloadOf(response);
  if (body.results) return body.results;
  throw new Error(body.message || body.error || `HTTP ${response.status}`);
}
