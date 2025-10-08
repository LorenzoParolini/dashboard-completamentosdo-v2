// ============================================================================
// REGIONE - Response dal backend (con ID)
// ============================================================================
export type Regione = {
  id: number;
  descrizione: string;
  codice: string;
  x: number;
  y: number;
};

// ============================================================================
// REGIONE INPUT DTO - Dati da inviare (POST/PUT) senza ID
// ============================================================================
export type RegioneInputDTO = {
  descrizione: string;
  codice: string;
  x?: number;
  y?: number;
};
