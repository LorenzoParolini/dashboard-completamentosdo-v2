import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Software } from '../models/software.model';
import { Ambiente } from '../models/ambiente.model';

const ambientiBase: Ambiente[] = [
  { id: 'a1', descrizione: 'DEV', dataCreazione: new Date('2024-01-10'), note: 'Ambiente di sviluppo' },
  { id: 'a2', descrizione: 'TEST', dataCreazione: new Date('2024-02-15'), note: 'Ambiente di test funzionale' },
];

export const software: Software[] = [
  {
    id: 's1',
    descrizione: 'Gestionale ERP',
    note: 'Software gestionale aziendale',
    ambienti: ambientiBase,
    versioneCorrente: '2.3.1',
    dataUltimoAggiornamento: new Date('2024-07-01'),
  },
  {
    id: 's2',
    descrizione: 'CRM Web',
    note: 'Gestione clienti e contatti',
    ambienti: ambientiBase,
    versioneCorrente: '1.8.0',
    dataUltimoAggiornamento: new Date('2024-06-15'),
  },
];

@Injectable({
  providedIn: 'root'
})
export class SoftwareService {
  
  getAllSoftware(): Observable<Software[]> {
    // Mock implementation - sostituire con chiamata HTTP reale
    return of(software);
  }

  deleteSoftware(id: string): void {
    // Mock implementation - sostituire con chiamata HTTP reale
    console.log('Eliminando software con ID:', id);
  }
}
