import type { Ambiente, AmbienteDTO } from './ambiente.model';

// Tipo per l'entità completa con ID (response dal backend)
export type Software = {
  id: number;
  descrizione: string;
  note: string;
  ambienti: Ambiente[];
  versioneCorrente: string;
  dataUltimoAggiornamento: Date;
};

// Tipo per dati da inviare (POST/PUT) - oggetti completi
export type SoftwareDTO = {
  descrizione: string;
  note: string;
  versioneCorrente: string;
  dataUltimoAggiornamento: Date;
  ambienti: AmbienteDTO[];
};

// Tipo per input specifico - solo ID per le relazioni
export type SoftwareInputDTO = {
  descrizione: string;
  note: string;
  versioneCorrente: string;
  dataUltimoAggiornamento?: Date;
  ambienteIds: number[];
};
