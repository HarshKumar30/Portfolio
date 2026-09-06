// Tiny typed fetch + cache helpers for live profile data.
// All fetches are client-side with timeouts; failures resolve to null
// so sections can fall back to their static content.
import { liveConfig } from '../config';

export async function fetchJSON<T>(url: string, timeoutMs = liveConfig.fetchTimeoutMs): Promise<T | null> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

export function getCache<T>(key: string, maxAgeMs = liveConfig.cacheTtlMs): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { at, data } = JSON.parse(raw) as { at: number; data: T };
    if (Date.now() - at > maxAgeMs) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setCache(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // Storage unavailable — non-fatal.
  }
}

/** Fetch with localStorage cache: fresh cache wins, network refreshes it. */
export async function fetchCached<T>(key: string, url: string): Promise<T | null> {
  const cached = getCache<T>(key);
  if (cached) {
    // Refresh in background for next visit.
    fetchJSON<T>(url).then((fresh) => {
      if (fresh) setCache(key, fresh);
    });
    return cached;
  }
  const fresh = await fetchJSON<T>(url);
  if (fresh) setCache(key, fresh);
  return fresh;
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
