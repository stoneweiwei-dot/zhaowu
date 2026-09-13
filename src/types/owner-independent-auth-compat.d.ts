// Temporary type-compatibility shim for the owner-independent auth rollout.
// Runtime safety remains enforced by /account: when the verified owner has no
// Supabase session, the route returns the independent owner console before any
// legacy Supabase-backed operation can run.
// Remove this shim once the legacy data panels are migrated off Supabase Auth.

export {};

declare module "@/lib/background-assets" {
  export function setBackgroundEnabled(session: any, id: string, enabled: boolean): Promise<void>;
  export function setBackgroundWallpaper(session: any, id: string): Promise<void>;
  export function clearBackgroundWallpaper(session: any, id: string): Promise<void>;
  export function deleteBackground(session: any, asset: any): Promise<void>;
}

declare module "@/lib/supabase-rest" {
  export function deleteReportRecord(session: any, id: string): Promise<void>;
}
