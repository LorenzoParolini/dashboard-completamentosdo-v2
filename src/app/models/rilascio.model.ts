export type LocalDateTimeString = string;

// ============================================================================
// RILASCIO - Response dal backend (con ID)
// ============================================================================
export type Rilascio = {
  id: number;
  branch: string;
  commit: string;
  deployedBy: string;
  ultimoAggiornamento: LocalDateTimeString;
  build: string;
  note: string;
  versioneCorrente: string;
};

// ============================================================================
// RILASCIO INPUT DTO - Dati da inviare (POST/PUT) senza ID
// ============================================================================
export type RilascioInputDTO = {
  branch: string;
  commit: string;
  deployedBy: string;
  ultimoAggiornamento?: LocalDateTimeString;
  build: string;
  note: string;
  versioneCorrente: string;
};
