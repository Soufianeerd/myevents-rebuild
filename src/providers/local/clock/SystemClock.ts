import type { Clock } from '../../contracts/Clock';

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
