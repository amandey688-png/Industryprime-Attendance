/**
 * Maps technical / operational errors to short copy for end users in production.
 * Developers still see full messages when NODE_ENV !== "production".
 */

const COPY = {
  connection:
    "We could not reach the service. Check your internet connection and try again in a moment.",
  timeout: "The request took too long. Please try again.",
  generic: "Something went wrong. Please try again.",
  session: "Your session could not be verified. Please sign in again.",
} as const;

function isProductionClient(): boolean {
  return typeof process !== "undefined" && process.env.NODE_ENV === "production";
}

/** Heuristic: message looks like an internal/ops note, not a user validation message. */
function looksTechnical(message: string): boolean {
  const l = message.toLowerCase();
  return (
    l.includes("cannot reach") ||
    l.includes("fetch failed") ||
    l.includes("failed to fetch") ||
    l.includes("networkerror") ||
    l.includes("load failed") ||
    l.includes("bad gateway") ||
    l.includes("upstream") ||
    l.includes("next_public") ||
    l.includes("backend_proxy") ||
    l.includes("vercel") ||
    l.includes("fastapi") ||
    l.includes("uvicorn") ||
    l.includes("onrender") ||
    l.includes("/api proxy") ||
    l.includes("cors") ||
    l.includes("postgres") ||
    l.includes("supabase") ||
    l.includes("sql") ||
    l.includes("prisma") ||
    l.includes("redis") ||
    l.includes("mongodb") ||
    l.includes("typescript") ||
    l.includes("javascript") ||
    l.includes("node.js") ||
    l.includes("traceback") ||
    l.includes("exception") ||
    l.includes("stack trace") ||
    l.includes("http://") ||
    l.includes("https://")
  );
}

function stripUrlsAndNoise(message: string): string {
  return message
    .replace(/https?:\/\/[^\s)]+/gi, "")
    .replace(/\s+/g, " ")
    .replace(/^\W+|\W+$/g, "")
    .trim();
}

/**
 * Use when displaying any `Error.message` from API/auth/network to the user.
 */
export function errorMessageForUser(err: unknown, fallback: string = COPY.generic): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (!isProductionClient()) return raw || fallback;

  const l = raw.toLowerCase();
  if (
    l.includes("timed out") ||
    l.includes("timeout") ||
    (l.includes("abort") && l.includes("auth"))
  ) {
    return COPY.timeout;
  }
  if (
    l.includes("not authenticated") ||
    l.includes("missing a token") ||
    l.includes("session") ||
    l.includes("sign in")
  ) {
    return COPY.session;
  }
  if (looksTechnical(raw) || raw.length > 220) {
    return COPY.connection;
  }
  const stripped = stripUrlsAndNoise(raw);
  if (!stripped || stripped.length < 3) return fallback;
  if (looksTechnical(stripped)) return COPY.generic;
  return stripped.slice(0, 280);
}

/**
 * Sanitize backend `detail` strings before throwing from shared API helpers.
 */
export function userFacingApiDetail(detail: string): string {
  if (!isProductionClient()) return detail;
  if (!detail.trim()) return COPY.generic;
  const l = detail.toLowerCase();
  if (l.includes("timed out") || (l.includes("timeout") && l.includes("auth"))) {
    return COPY.timeout;
  }
  if (looksTechnical(detail) || detail.length > 220) return COPY.connection;
  const stripped = stripUrlsAndNoise(detail);
  return stripped.slice(0, 280) || COPY.generic;
}
