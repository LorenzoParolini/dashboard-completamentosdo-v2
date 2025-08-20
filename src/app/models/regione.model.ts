
export type Regione = {
  id: string;
  descrizione: string;
  codice: string;
  coordinate?: {
    x: number;
    y: number;
  };
};
