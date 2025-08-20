
export type Regione = {
  id: string;
  descrizione: string;
  sigla: string;
  coordinate?: {
    x: number;
    y: number;
  };
};
