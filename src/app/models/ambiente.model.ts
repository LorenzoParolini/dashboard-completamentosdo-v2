// Tipo per l'entità completa con ID (response dal backend)
export type Ambiente = {
  id: number;
  descrizione: string;
  note: string;
  dataCreazione: Date;
};

// Tipo per dati da inviare (POST/PUT)
export type AmbienteDTO = {
  descrizione: string;
  note: string;
  dataCreazione?: Date;
};
