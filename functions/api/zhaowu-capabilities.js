import handler from "../../api/zhaowu-capabilities.js";

// Vercel-compatible Request handlers are reused for Pages; secrets are injected by
// Pages runtime bindings via nodejs_compat_populate_process_env.
export async function onRequest({ request }) {
  const response = await handler(request);
  return response instanceof Response ? response : new Response(null, { status: 204 });
}
