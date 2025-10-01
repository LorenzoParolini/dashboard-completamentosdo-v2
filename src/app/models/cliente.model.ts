import type { Regione, RegioneDTO } from './regione.model';
import type { Software, SoftwareDTO } from './software.model';

// Tipo per l'entità completa con ID (response dal backend)
export type Cliente = {
  id: number;
  descrizione: string;
  regione: Regione;
  software: Software[];
};

// Tipo per dati da inviare (POST/PUT) - oggetti completi
export type ClienteDTO = {
  descrizione: string;
  regione: RegioneDTO;
  software: SoftwareDTO[];
};

// Tipo per input specifico - solo ID per le relazioni
export type ClienteInputDTO = {
  descrizione: string;
  regioneId: number;
  softwareIds: number[];
};
