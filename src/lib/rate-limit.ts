import { LRUCache } from 'lru-cache';

const rateLimit = (options: { uniqueTokenPerInterval?: number; interval?: number } = {}) => {
  const tokenCache = new LRUCache({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (limit: number, token: string) => 
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0];
        if (tokenCount[0] === 0) tokenCache.set(token, tokenCount);
        tokenCount[0] += 1;

        const currentUsage = tokenCount[0];
        if (currentUsage >= limit) reject('Rate limit exceeded');
        resolve();
      }),
  };
};

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export default limiter;