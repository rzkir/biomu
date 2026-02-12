/**
 * Base URL backend API. Cookie session di-set backend dengan Domain=localhost
 * sehingga dikirim ke frontend (3000) dan proxy bisa baca session.
 */
export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "";
}

export function apiUrl(path: string): string {
  const base = getApiUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base.replace(/\/$/, "")}${p}` : p;
}
