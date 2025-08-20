import type { Ambiente } from './ambiente.model';

export type Software = {
  id: string;
  descrizione: string;
  note?: string;
  tipoAmbiente: Ambiente[];
  versioneCorrente: string;
  dataUltimoAggiornamento: Date;
};
