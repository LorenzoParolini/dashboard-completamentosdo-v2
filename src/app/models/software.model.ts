import type { Cliente } from './cliente.model';

export type Software = {
  id: string;
  nome: string;
  descrizione: string;
  versioneCorrente: string;
  dataUltimoAggiornamento: Date;
  clientiAssociati: Cliente[];
};
