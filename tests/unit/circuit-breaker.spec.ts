import { describe, it, expect } from 'vitest';
import { checkCircuitBreaker } from '../../server/utils/circuit-breaker';

describe('Circuit Breaker', () => {
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
    expect(result.isActive).toBe(false);
    expect(result.d1ReadsCount).toBe(5000);
    expect(result.workerRequestsCount).toBe(5000);
  });

  it('should activate at 96% D1 reads threshold', async () => {
    const mockDb = {
      prepare: () => ({
        bind: () => ({
          first: () => Promise.resolve({ count: 9700, reset_at: new Date().toISOString() })
        }),
        run: () => Promise.resolve()
      })
    };

    const result = await checkCircuitBreaker(mockDb as any);
    expect(result.isActive).toBe(true);
    expect(result.d1ReadsCount).toBe(9700);
  });

  it('should activate at 96% Worker requests threshold', async () => {
    let callCount = 0;
    const mockDb = {
      prepare: () => ({
        bind: () => ({
          first: () => {
            callCount++;
            // First call for d1_reads, second for worker_requests
            const count = callCount === 1 ? 5000 : 97000;
            return Promise.resolve({ count, reset_at: new Date().toISOString() });
          }
        }),
        run: () => Promise.resolve()
      })
    };

    const result = await checkCircuitBreaker(mockDb as any);
    expect(result.isActive).toBe(true);
    expect(result.workerRequestsCount).toBe(97000);
  });
});
