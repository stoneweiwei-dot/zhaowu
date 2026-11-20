const HEADERS = { "Content-Type": "application/json", "Cache-Control": "no-store" };

Deno.serve(async () => new Response(JSON.stringify({
  ok: false,
  error: "PIXEL_AUDIT_RETIRED_USE_GALLERY_VISION_AUDIT",
  reason: "Pixel/color statistics are not semantic image understanding and must never overwrite subject, style, motif, religious-figure, approval or client-eligibility metadata.",
}), { status: 410, headers: HEADERS }));
