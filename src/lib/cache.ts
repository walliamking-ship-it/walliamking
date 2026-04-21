/**
 * 数据缓存层
 * 用于减少API调用，提高性能
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class DataCache {
  private cache = new Map<string, CacheItem<any>>();
  private defaultTTL = 5 * 60 * 1000; // 默认5分钟

  /**
   * 获取缓存数据
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }

  /**
   * 设置缓存数据
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, timestamp: Date.now(), expiresAt });
  }

  /**
   * 删除指定缓存
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 清除指定前缀的缓存
   */
  clearPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    let expiredCount = 0;
    const now = Date.now();
    for (const item of this.cache.values()) {
      if (now > item.expiresAt) expiredCount++;
    }
    return {
      total: this.cache.size,
      expired: expiredCount,
      active: this.cache.size - expiredCount,
    };
  }
}

// 全局缓存实例
export const dataCache = new DataCache();

/**
 * 带缓存的数据获取Hook
 */
export function withCache<T>(
  fetchFn: () => Promise<T>,
  key: string,
  ttl?: number
): () => Promise<T> {
  return async () => {
    // 尝试从缓存获取
    const cached = dataCache.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    // 从API获取
    const data = await fetchFn();
    dataCache.set(key, data, ttl);
    return data;
  };
}

/**
 * 缓存键生成辅助
 */
export function makeCacheKey(entity: string, id?: string, suffix?: string): string {
  if (id) {
    return suffix ? `${entity}:${id}:${suffix}` : `${entity}:${id}`;
  }
  return suffix ? `${entity}:all:${suffix}` : `${entity}:all`;
}
