export const apiBase = (
  import.meta.env.VITE_API_URL ?? "http://localhost:3001/api/v1"
).replace(/\/$/, "");

export const apiOrigin = apiBase.replace(/\/api\/v1\/?$/, "");

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers ?? {});

  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers,
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(json?.message ?? `Request failed: ${response.status}`);
  }

  return json as T;
}
