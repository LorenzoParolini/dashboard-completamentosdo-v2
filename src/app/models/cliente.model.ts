import type { Ambiente } from './ambiente.model';
import type { Regione } from './regione.model';

export type Cliente = {
  nome: string;
  tipoAmbiente: Ambiente;
  regione: Regione;
  versione: string;
  utenteAggiornamento: string;
  dataRilascio: Date;
};
