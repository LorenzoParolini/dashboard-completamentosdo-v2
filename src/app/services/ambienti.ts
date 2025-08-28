import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Ambiente } from '../models/ambiente.model';

export const ambienti: Ambiente[] = [
    { id: '1', descrizione: 'DEV', dataCreazione: new Date('2024-01-10'), note: 'Ambiente di sviluppo' },
    { id: '2', descrizione: 'TEST', dataCreazione: new Date('2024-02-15'), note: 'Ambiente di test funzionale' },
    { id: '3', descrizione: 'PROD', dataCreazione: new Date('2024-03-01'), note: 'Ambiente di produzione' },
    { id: '4', descrizione: 'STAGING', dataCreazione: new Date('2024-04-05'), note: 'Ambiente di pre-produzione' },
  ];

@Injectable({
  providedIn: 'root'
})
export class AmbientiService {
  

  getAllAmbienti(): Observable<Ambiente[]> {
    return of(ambienti);
  }

  getAmbienteById(id: string): Ambiente | undefined {
    return ambienti.find(ambiente => ambiente.id === id);
  }

  deleteAmbiente(id: string) {
    const index = ambienti.findIndex(ambiente => ambiente.id === id);
    if (index !== -1) {
      ambienti.splice(index, 1);
    }
  }

  length(): number {
    return ambienti.length;
  }
}
