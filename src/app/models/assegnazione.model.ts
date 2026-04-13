import type { Rilascio } from './rilascio.model';

export type Assegnazione = {
  softwareId: number;
  clienteId: number;
  rilasci: Rilascio[];
};
