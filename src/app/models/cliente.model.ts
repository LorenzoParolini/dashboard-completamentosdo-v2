import type { Regione } from './regione.model';
import type { Software } from './software.model';

// ============================================================================
// CLIENTE - Response dal backend (con ID e oggetti nested completi)
// ============================================================================
export type Cliente = {
  id: number;
  descrizione: string;
  regione: Regione;
  software: Software[];
};

// ============================================================================
// CLIENTE INPUT DTO - Dati da inviare (POST/PUT) con solo gli ID
// ============================================================================
export type ClienteInputDTO = {
  descrizione: string;
  regioneId: number;
  softwareIds: number[];
};
