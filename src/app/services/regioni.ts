import { Injectable } from '@angular/core';
import { Regione } from '../models/regione.model';
import { delay, Observable, of } from 'rxjs';

export const regioni: Regione[] = [
    { id: '1', descrizione: 'Lombardia', codice: 'LOM', coordinate: { x: 45.4668, y: 9.1905 } },
    { id: '2', descrizione: 'Lazio', codice: 'LAZ', coordinate: { x: 41.9028, y: 12.4964 } },
    { id: '3', descrizione: 'Sicilia', codice: 'SIC', coordinate: { x: 37.5999, y: 14.0154 } },
    { id: '4', descrizione: 'Veneto', codice: 'VEN', coordinate: { x: 45.4343, y: 12.3388 } },
    { id: '5', descrizione: 'Piemonte', codice: 'PIE', coordinate: { x: 45.0703, y: 7.6869 } },
    { id: '6', descrizione: 'Emilia-Romagna', codice: 'EMR', coordinate: { x: 44.4949, y: 11.3426 } },
    { id: '7', descrizione: 'Toscana', codice: 'TOS', coordinate: { x: 43.7696, y: 11.2558 } },
    { id: '8', descrizione: 'Campania', codice: 'CAM', coordinate: { x: 40.8518, y: 14.2681 } },
    { id: '9', descrizione: 'Puglia', codice: 'PUG', coordinate: { x: 41.1171, y: 16.8719 } },
    { id: '10', descrizione: 'Calabria', codice: 'CAL', coordinate: { x: 38.9050, y: 16.5947 } },
];

@Injectable({
  providedIn: 'root'
})
export class RegioniService {

  getAllRegioni(): Observable<Regione[]> {
  return of(regioni).pipe(delay(2000));
}

  getRegioneById(id: string): Regione | undefined {
    return regioni.find(regione => regione.id === id);
  }

  deleteRegione(id: string) {
    const index = regioni.findIndex(regione => regione.id === id);
    if (index !== -1) {
      regioni.splice(index, 1);
    }
  }

}

