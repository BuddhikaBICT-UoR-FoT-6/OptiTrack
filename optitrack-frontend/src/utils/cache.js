/**
 * OptiTrack Data Cache
 * Prevents expensive re-fetches on every page navigation by storing API
 * responses in memory (fast) with localStorage fallback (survives refresh).
 * TTL-based: stale entries are ignored and re-fetched automatically.
 */

const memoryCache = {};

const DEFAULT_TTL_MS = 30_000; // 30 seconds default

export const cache = {
    /**
     * Get a cached value. Returns null if missing or expired.
     */
    get(key) {
        const entry = memoryCache[key];
        if (entry && Date.now() < entry.expiresAt) {
            return entry.data;
        }
        // Try localStorage fallback (survives page refresh)
        try {
            const raw = localStorage.getItem(`ot_cache_${key}`);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Date.now() < parsed.expiresAt) {
                    memoryCache[key] = parsed; // Promote to memory
                    return parsed.data;
                }
                localStorage.removeItem(`ot_cache_${key}`);
            }
        } catch (_) {}
        return null;
    },

    /**
     * Store a value with a TTL.
     */
    set(key, data, ttlMs = DEFAULT_TTL_MS) {
        const entry = { data, expiresAt: Date.now() + ttlMs };
        memoryCache[key] = entry;
        try {
            localStorage.setItem(`ot_cache_${key}`, JSON.stringify(entry));
        } catch (_) {}
    },

    /**
     * Invalidate a specific key.
     */
    invalidate(key) {
        delete memoryCache[key];
        try { localStorage.removeItem(`ot_cache_${key}`); } catch (_) {}
    },

    /**
     * Invalidate all keys matching a prefix.
     */
    invalidatePrefix(prefix) {
        Object.keys(memoryCache).forEach(k => {
            if (k.startsWith(prefix)) delete memoryCache[k];
        });
        try {
            Object.keys(localStorage).forEach(k => {
                if (k.startsWith(`ot_cache_${prefix}`)) localStorage.removeItem(k);
            });
        } catch (_) {}
    },
};

/**
 * Cached axios fetch helper.
 * Usage: cachedFetch(axios, '/vehicles', 'vehicles', 60_000)
 */
export async function cachedFetch(axiosInstance, url, cacheKey, ttlMs = DEFAULT_TTL_MS) {
    const cached = cache.get(cacheKey);
    if (cached !== null) return cached;

    const res = await axiosInstance.get(url);
    cache.set(cacheKey, res.data, ttlMs);
    return res.data;
}
