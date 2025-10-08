// ============================================================================
// AMBIENTE - Response dal backend (con ID)
// ============================================================================
export type Ambiente = {
  id: number;
  descrizione: string;
  note: string;
  dataCreazione: Date;
};

// ============================================================================
// AMBIENTE INPUT DTO - Dati da inviare (POST/PUT) senza ID
// ============================================================================
export type AmbienteInputDTO = {
  descrizione: string;
  note: string;
  dataCreazione?: Date;
};
