import type { Ambiente } from './ambiente.model';

export type LocalDateTimeString = string;

// ============================================================================
// SOFTWARE - Response dal backend (con ID e oggetti nested completi)
// ============================================================================
export type Software = {
  id: number;
  descrizione: string;
  note: string;
  versioneCorrente: string;
  dataUltimoAggiornamento: LocalDateTimeString;
  ambienti: Ambiente[];
  branch?: string;
  commit?: string;
  deployedBy?: string;
  build?: string;
};

// ============================================================================
// SOFTWARE INPUT DTO - Dati da inviare (POST/PUT) con solo gli ID
// ============================================================================
export type SoftwareInputDTO = {
  descrizione: string;
  note: string;
  versioneCorrente: string;
  dataUltimoAggiornamento?: LocalDateTimeString;
  ambienteIds: number[];
  branch?: string;
  commit?: string;
  deployedBy?: string;
  build?: string;
};
