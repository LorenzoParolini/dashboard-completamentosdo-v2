// ============================================================================
// AMBIENTE - Response dal backend (con ID)

import { Rilascio } from './rilascio.model';

// ============================================================================
export type Ambiente = {
  id: number;
  descrizione: string;
  note: string;
  dataCreazione: Date;
  rilasci: Rilascio[];
};

// ============================================================================
// AMBIENTE INPUT DTO - Dati da inviare (POST/PUT) senza ID
// ============================================================================
export type AmbienteInputDTO = {
  descrizione: string;
  note: string;
  dataCreazione?: Date;
  rilascioIds?: number[];
};
