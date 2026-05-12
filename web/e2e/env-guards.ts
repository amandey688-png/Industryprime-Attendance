/**
 * Shared checks for staging Playwright smoke tests.
 * Documentation examples (example.com, etc.) must not run as real targets.
 */

export function e2eBaseUrlFromEnv(): string {
  return (
    process.env.E2E_BASE_URL?.trim() ||
    process.env.E2E_STAGING_URL?.trim() ||
    ""
  );
}

/** True when BASE / STAGING URL is a real http(s) origin, not a doc placeholder. */
export function isUsableE2eBaseUrl(raw: string | undefined): boolean {
  const s = raw?.trim() ?? "";
  if (!s) return false;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return false;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  const h = u.hostname.toLowerCase();
  if (h === "example.com" || h === "example.net" || h === "example.org") return false;
  if (h.endsWith(".example.com")) return false;
  if (h.endsWith(".example")) return false;
  const placeholders = new Set(["your-app.vercel.app", "your-frontend.vercel.app"]);
  if (placeholders.has(h)) return false;
  return true;
}

export function isUsableE2eEmail(raw: string | undefined): boolean {
  const s = raw?.trim() ?? "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/** Matches app login validation (min 8 chars); rejects obvious placeholders. */
export function isUsableE2ePassword(raw: string | undefined): boolean {
  const s = raw?.trim() ?? "";
  return s.length >= 8;
}

export function hasRunnableStagingE2e(): boolean {
  return (
    isUsableE2eBaseUrl(e2eBaseUrlFromEnv()) &&
    isUsableE2eEmail(process.env.E2E_USER_EMAIL) &&
    isUsableE2ePassword(process.env.E2E_USER_PASSWORD)
  );
}
