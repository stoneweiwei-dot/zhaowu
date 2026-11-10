// Cloudflare Pages Function: Reverse proxy /sb/* requests to Supabase
// Bypasses Mainland China domain blocks and ensures zero-CORS same-origin connectivity.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const targetPath = url.pathname.replace(/^\/sb/, "");
  const targetUrl = new URL(targetPath + url.search, "https://gyisxbkjzvdretbqzeuw.supabase.co");

  const newHeaders = new Headers(context.request.headers);
  newHeaders.set("Host", "gyisxbkjzvdretbqzeuw.supabase.co");

  const proxyRequest = new Request(targetUrl.toString(), {
    method: context.request.method,
    headers: newHeaders,
    body: context.request.body,
    redirect: "follow",
  });

  return fetch(proxyRequest);
}
