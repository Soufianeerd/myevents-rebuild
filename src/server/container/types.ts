import type { Clock, IdGenerator } from '../../providers/contracts';

export interface AppContainer {
  clock: Clock;
  idGenerator: IdGenerator;
}
