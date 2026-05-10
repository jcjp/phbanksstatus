import { describe, it, expect } from 'vitest';

// Mock bank status calculation logic
function calculateBankStatus(endpoints: Array<{ current_status: string }>): string {
  const downCount = endpoints.filter(e => e.current_status === 'down').length;
  const maintenanceCount = endpoints.filter(e => e.current_status === 'maintenance').length;

  if (maintenanceCount > 0) return 'maintenance';
  if (downCount === endpoints.length) return 'down';
  if (downCount >= 1 && downCount <= 3) return 'degraded';
  return 'up';
}

describe('Status Logic', () => {
  it('should return up when all endpoints up', () => {
    const endpoints = [
      { current_status: 'up' },
      { current_status: 'up' },
      { current_status: 'up' },
      { current_status: 'up' }
    ];
    expect(calculateBankStatus(endpoints)).toBe('up');
  });

  it('should return degraded when 1-3 endpoints down', () => {
    const endpoints = [
      { current_status: 'up' },
      { current_status: 'down' },
      { current_status: 'up' },
      { current_status: 'up' }
    ];
    expect(calculateBankStatus(endpoints)).toBe('degraded');
  });

  it('should return down when all endpoints down', () => {
    const endpoints = [
      { current_status: 'down' },
      { current_status: 'down' },
      { current_status: 'down' },
      { current_status: 'down' }
    ];
    expect(calculateBankStatus(endpoints)).toBe('down');
  });

  it('should return maintenance when any endpoint in maintenance', () => {
    const endpoints = [
      { current_status: 'up' },
      { current_status: 'maintenance' },
      { current_status: 'up' },
      { current_status: 'up' }
    ];
    expect(calculateBankStatus(endpoints)).toBe('maintenance');
  });
});
