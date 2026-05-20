/**
 * Cloudflare Worker entrypoint.
 *
 * The two compiled HTMLs (public + private) are bundled into the Worker as
 * source — neither exists as a directly-fetchable URL. The Worker decides
 * which to serve based on the client IP vs the `HOME_IPS` env var.
 *
 * Everything else falls through to the static assets binding (images, etc.).
 */

import publicHTML from "../built/public.html";
import privateHTML from "../built/private.html";

interface Env {
  ASSETS: Fetcher;
  HOME_IPS?: string;
}

function clientIPMatchesHome(request: Request, env: Env): boolean {
  const ip = request.headers.get("CF-Connecting-IP") ?? "";
  if (!ip) return false;
  const allowed = (env.HOME_IPS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return allowed.includes(ip);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/index.html") {
      const html = clientIPMatchesHome(request, env) ? privateHTML : publicHTML;
      return new Response(html, {
        headers: { "content-type": "text/html; charset=UTF-8" },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
