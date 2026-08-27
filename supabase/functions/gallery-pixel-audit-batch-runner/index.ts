const HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store" };

Deno.serve(async () => new Response(JSON.stringify({
  ok: false,
  error: "PIXEL_AUDIT_RETIRED_USE_GALLERY_VISION_AUDIT",
  reason: "Batch pixel profiling is retired because color statistics must not be treated as semantic image understanding.",
}), { status: 410, headers: HEADERS }));
