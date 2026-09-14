const DEFAULT_REDIRECT = "/dashboard";

/**
 * Only ever redirect to a relative, same-origin path. Rejects
 * absolute URLs and protocol-relative URLs (e.g. "//evil.com") to
 * avoid turning `callbackUrl` into an open redirect.
 */
export function getSafeRedirect(
  callbackUrl: string | undefined | null,
  fallback: string = DEFAULT_REDIRECT
): string {
  if (!callbackUrl) return fallback;
  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return fallback;
  }
  return callbackUrl;
}
