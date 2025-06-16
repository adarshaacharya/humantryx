import { env } from "@/env";
import { Redis } from "@upstash/redis";

export const redisClient = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

interface CacheConfig {
  ttl?: number;
  forceFresh?: boolean;
}

export class CacheError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = "CacheError";
  }
}

export async function cache<T>(
  key: string,
  getData: () => Promise<T>,
  config: CacheConfig = {},
): Promise<T> {
  const { ttl = 3600, forceFresh = false } = config;

  try {
    if (!forceFresh) {
      const cached = await redisClient.get<T>(key);
      if (cached !== null) return cached;
    }

    const fresh = await getData();
    if (fresh === undefined || fresh === null) {
      throw new Error("getData returned null/undefined");
    }

    await redisClient.set(key, fresh, { ex: ttl });
    return fresh;
  } catch (error) {
    throw new CacheError(`Cache operation failed for key: ${key}`, error);
  }
}

export async function invalidateCache(key: string): Promise<void> {
  try {
    await redisClient.del(key);
  } catch (error) {
    throw new CacheError(`Failed to invalidate cache for key: ${key}`, error);
  }
}

export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch (error) {
    throw new CacheError(
      `Failed to invalidate cache pattern: ${pattern}`,
      error,
    );
  }
}
