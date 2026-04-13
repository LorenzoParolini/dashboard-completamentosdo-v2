import type { Ambiente } from './ambiente.model';
import type { Assegnazione } from './assegnazione.model';

// ============================================================================
// SOFTWARE - Response dal backend (con ID e oggetti nested completi)
// ============================================================================
export type Software = {
  id: number;
  descrizione: string;
  note: string;
  assegnazioni?: Assegnazione[];
  ambienti: Ambiente[];
};

// ============================================================================
// SOFTWARE INPUT DTO - Dati da inviare (POST/PUT) con solo gli ID
// ============================================================================
export type SoftwareInputDTO = {
  descrizione: string;
  note: string;
  ambienteIds?: number[];
};
