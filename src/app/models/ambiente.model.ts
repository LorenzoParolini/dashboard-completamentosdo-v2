import type { Software } from './software.model';

export type Ambiente = {
  id: string;
  nome: string;
  descrizione: string;
  softwareInstallato: Software[];
  dataCreazione: Date;
};
