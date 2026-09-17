export default function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const latitude = Number(req.headers["x-vercel-ip-latitude"]);
  const longitude = Number(req.headers["x-vercel-ip-longitude"]);
  const timezone = typeof req.headers["x-vercel-ip-timezone"] === "string"
    ? req.headers["x-vercel-ip-timezone"]
    : null;

  if (
    !Number.isFinite(latitude)
    || !Number.isFinite(longitude)
    || latitude < -90
    || latitude > 90
    || longitude < -180
    || longitude > 180
  ) {
    return res.status(200).json({
      latitude: null,
      longitude: null,
      timezone,
      source: "clock",
    });
  }

  return res.status(200).json({
    latitude,
    longitude,
    timezone,
    source: "vercel-ip",
  });
}
