
// Tipo per l'entità completa con ID (response dal backend)
export type Regione = {
  id: number;
  descrizione: string;
  codice: string;
  coordinate?: {
    x: number;
    y: number;
  };
};

// Tipo per dati da inviare (POST/PUT)
export type RegioneDTO = {
  descrizione: string;
  codice: string;
};
