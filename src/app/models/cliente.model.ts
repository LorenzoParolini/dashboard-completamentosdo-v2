import type { Regione } from './regione.model';
import type { Software } from './software.model';

export type Cliente = {
  id: string;
  descrizione: string;
  regione: Regione;
  software: Software[];
};
