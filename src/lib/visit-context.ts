export function visitContext(pathname: string, source: string, agent: string, touchPoints: number) {
  let referrer: string | null = null;
  try {
    const url = new URL(source);
    if (["https:", "http:"].includes(url.protocol) && url.origin.length <= 255) referrer = url.origin;
  } catch {
    // Direct visits and invalid URLs have no referring origin.
  }
  const tablet = /iPad|Tablet/i.test(agent) || (/Android/i.test(agent) && !/Mobile/i.test(agent))
    || (/Macintosh/i.test(agent) && touchPoints > 1);
  const device = tablet ? "tablet" : /Mobile|iPhone/i.test(agent) ? "mobile"
    : /Windows|Macintosh|Linux|CrOS/i.test(agent) ? "desktop" : "unknown";
  return { p_path: pathname.split(/[?#]/, 1)[0].slice(0, 512), p_referrer: referrer, p_device: device };
}
