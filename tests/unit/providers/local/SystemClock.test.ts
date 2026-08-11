import { describe, it, expect } from 'vitest';
import { SystemClock } from '../../../../src/providers/local/clock/SystemClock';

describe('SystemClock', () => {
  it('should return a valid Date object', () => {
    const clock = new SystemClock();
    const now = clock.now();
    expect(now).toBeInstanceOf(Date);
    expect(now.getTime()).not.toBeNaN();
  });

  it('should return a date close to the current system time', () => {
    const clock = new SystemClock();
    const systemNow = new Date().getTime();
    const clockNow = clock.now().getTime();

    // Difference should be very small (less than 50ms)
    expect(Math.abs(clockNow - systemNow)).toBeLessThan(50);
  });
});
