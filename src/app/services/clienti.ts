import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Cliente } from '../models/cliente.model';

export const clienti: Cliente[] = [
  {
    id: '1',
    descrizione: 'Azienda Nord Italia',
    regione: { id: '1', descrizione: 'Lombardia', codice: 'LOM', coordinate: { x: 45.4642, y: 9.1900 } },
    software: []
  },
  {
    id: '2',
    descrizione: 'Società Sud Italia',
    regione: { id: '8', descrizione: 'Campania', codice: 'CAM', coordinate: { x: 40.8518, y: 14.2681 } },
    software: []
  },
  {
    id: '3',
    descrizione: 'Gruppo Centro Italia',
    regione: { id: '7', descrizione: 'Toscana', codice: 'TOS', coordinate: { x: 43.7696, y: 11.2558 } },
    software: []
  }
];

@Injectable({
  providedIn: 'root'
})
export class ClientiService {
  
  getAllClienti(): Observable<Cliente[]> {
    return of(clienti);
  }

  getClienteById(id: string): Cliente | undefined {
    return clienti.find(cliente => cliente.id === id);
  }

  deleteCliente(id: string) {
    const index = clienti.findIndex(cliente => cliente.id === id);
    if (index !== -1) {
      clienti.splice(index, 1);
    }
  }
}
