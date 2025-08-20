import type { Software } from './software.model';

export type Ambiente = {
  id: string;
  descrizione: string;
  note?: string;
  softwareInstallato: Software[];
  dataCreazione: Date;
};
