import { describe, it, expect } from 'vitest';

// Mock bank status calculation logic
function calculateBankStatus(endpoints: Array<{ current_status: string }>): string {
  const downCount = endpoints.filter(e => e.current_status === 'Down').length;
  const maintenanceCount = endpoints.filter(e => e.current_status === 'Maintenance').length;
  
  if (maintenanceCount > 0) return 'Maintenance';
  if (downCount === endpoints.length) return 'Down';
  if (downCount >= 1 && downCount <= 3) return 'Degraded';
  return 'Up';
}

describe('Status Logic', () => {
  it('should return Up when all endpoints up', () => {
    const endpoints = [
      { current_status: 'Up' },
      { current_status: 'Up' },
      { current_status: 'Up' },
      { current_status: 'Up' }
    ];
    expect(calculateBankStatus(endpoints)).toBe('Up');
  });

  it('should return Degraded when 1-3 endpoints down', () => {
    const endpoints = [
      { current_status: 'Up' },
      { current_status: 'Down' },
      { current_status: 'Up' },
      { current_status: 'Up' }
    ];
    expect(calculateBankStatus(endpoints)).toBe('Degraded');
  });

  it('should return Down when all endpoints down', () => {
    const endpoints = [
      { current_status: 'Down' },
      { current_status: 'Down' },
      { current_status: 'Down' },
      { current_status: 'Down' }
    ];
    expect(calculateBankStatus(endpoints)).toBe('Down');
  });

  it('should return Maintenance when any endpoint in maintenance', () => {
    const endpoints = [
      { current_status: 'Up' },
      { current_status: 'Maintenance' },
      { current_status: 'Up' },
      { current_status: 'Up' }
    ];
    expect(calculateBankStatus(endpoints)).toBe('Maintenance');
  });
});
