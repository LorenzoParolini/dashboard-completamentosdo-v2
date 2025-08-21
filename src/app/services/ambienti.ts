import { Injectable } from '@angular/core';
import { Ambiente } from '../models/ambiente.model';

@Injectable({
  providedIn: 'root'
})
export class AmbientiService {
  private ambienti: Ambiente[] = [
    { id: 'a1', descrizione: 'DEV', dataCreazione: new Date('2024-01-10'), note: 'Ambiente di sviluppo' },
    { id: 'a2', descrizione: 'TEST', dataCreazione: new Date('2024-02-15'), note: 'Ambiente di test funzionale' },
    { id: 'a3', descrizione: 'PROD', dataCreazione: new Date('2024-03-01'), note: 'Ambiente di produzione' },
    { id: 'a4', descrizione: 'STAGING', dataCreazione: new Date('2024-04-05'), note: 'Ambiente di pre-produzione' },
  ];

  getAllAmbienti(): Ambiente[] {
    return this.ambienti;
  }

  getAmbienteById(id: string): Ambiente | undefined {
    return this.ambienti.find(ambiente => ambiente.id === id);
  }
}
