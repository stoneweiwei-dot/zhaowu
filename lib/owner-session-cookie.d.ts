export type OwnerSessionEnv = Record<string, string | undefined>;
export type OwnerSessionOptions = {
  env?: OwnerSessionEnv;
  now?: number;
  isValid?: (secret: string) => boolean;
};
export const OWNER_COOKIE: string;
export const OWNER_SESSION_MAX_AGE_SECONDS: number;
export function isValidOwnerSecret(value: string | null | undefined, env?: OwnerSessionEnv): boolean;
export function ownerCookieValue(secret: string, options?: OwnerSessionOptions): string;
export function ownerSetCookie(secret: string, options?: OwnerSessionOptions): string;
export function ownerClearCookie(): string;
export function ownerSecretFromCookieValue(value: string, options?: OwnerSessionOptions): string;
export function readCookie(req: unknown, name: string): string;
export function ownerSecretFromRequest(req: unknown, options?: OwnerSessionOptions): string;
export function requestHasOwnerSession(req: unknown, options?: OwnerSessionOptions): boolean;
