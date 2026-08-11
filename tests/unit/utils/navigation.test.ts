import { describe, it, expect } from 'vitest';
import { isActiveRoute } from '@/lib/utils/navigation';

describe('isActiveRoute', () => {
  it('should match exact route when exact is true', () => {
    expect(isActiveRoute('/dashboard', '/dashboard', true)).toBe(true);
    expect(isActiveRoute('/dashboard/settings', '/dashboard', true)).toBe(
      false,
    );
  });

  it('should match prefix route when exact is false', () => {
    expect(isActiveRoute('/dashboard', '/dashboard', false)).toBe(true);
    expect(isActiveRoute('/dashboard/settings', '/dashboard', false)).toBe(
      true,
    );
  });

  it('should not match partial prefix route (e.g. /dashboard-settings)', () => {
    expect(isActiveRoute('/dashboard-settings', '/dashboard', false)).toBe(
      false,
    );
  });
});
