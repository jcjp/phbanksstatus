import { describe, it, expect, beforeEach } from 'vitest';
import { checkCircuitBreaker, incrementCounter, resetCounters } from '../../server/utils/circuit-breaker';

describe('Circuit Breaker', () => {
  beforeEach(async () => {
    await resetCounters();
  });

  it('should allow operations below 96% threshold', async () => {
    const mockDb = {
      prepare: () => ({
        bind: () => ({
          first: () => Promise.resolve({ count: 5000, reset_at: new Date().toISOString() })
        }),
        run: () => Promise.resolve()
      })
    };

    const result = await checkCircuitBreaker(mockDb as any);
    expect(result.halted).toBe(false);
    expect(result.reason).toBeNull();
  });

  it('should halt at 96% D1 reads threshold', async () => {
    const mockDb = {
      prepare: () => ({
        bind: () => ({
          first: () => Promise.resolve({ count: 9700, reset_at: new Date().toISOString() })
        }),
        run: () => Promise.resolve()
      })
    };

    const result = await checkCircuitBreaker(mockDb as any);
    expect(result.halted).toBe(true);
    expect(result.reason).toContain('D1 reads');
  });

  it('should halt at 96% Worker requests threshold', async () => {
    const mockDb = {
      prepare: () => ({
        bind: () => ({
          first: (name: string) => {
            if (name === 'd1_reads_daily') return Promise.resolve({ count: 5000 });
            if (name === 'worker_requests_daily') return Promise.resolve({ count: 97000 });
            return Promise.resolve({ count: 0 });
          }
        }),
        run: () => Promise.resolve()
      })
    };

    const result = await checkCircuitBreaker(mockDb as any);
    expect(result.halted).toBe(true);
    expect(result.reason).toContain('Worker requests');
  });
});
