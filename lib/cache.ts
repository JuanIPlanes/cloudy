interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

class CacheService {
    private cache: Map<string, CacheEntry<any>>;
    private defaultTTL: number;

    constructor(defaultTTL: number = 3600) {
        this.cache = new Map();
        this.defaultTTL = defaultTTL * 1000; // Convert to milliseconds
    }

    set<T>(key: string, value: T, ttl?: number): void {
        const expiresAt = Date.now() + (ttl ? ttl * 1000 : this.defaultTTL);
        this.cache.set(key, { value, expiresAt });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        return entry.value as T;
    }

    has(key: string): boolean {
        const entry = this.cache.get(key);

        if (!entry) {
            return false;
        }

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    // Clean up expired entries
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
    }

    // Get cache statistics
    getStats() {
        const now = Date.now();
        let expired = 0;
        let active = 0;

        for (const entry of this.cache.values()) {
            if (now > entry.expiresAt) {
                expired++;
            } else {
                active++;
            }
        }

        return {
            total: this.cache.size,
            active,
            expired,
        };
    }
}

// Singleton instance
const cacheTTL = parseInt(process.env.CACHE_TTL || '3600', 10);
const cacheInstance = new CacheService(cacheTTL);

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        cacheInstance.cleanup();
    }, 5 * 60 * 1000);
}

export default cacheInstance;
