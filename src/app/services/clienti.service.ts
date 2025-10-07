import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Cliente } from '../models/cliente.model';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

export const clienti: Cliente[] = [
  {
    id: 1,
    descrizione: 'Azienda Nord Italia',
    regione: { id: 1, descrizione: 'Lombardia', codice: 'LOM', coordinate: { x: 45.4642, y: 9.1900 } },
    software: [{
      id: 1,
      descrizione: 'Gestionale ERP',
      note: 'Software gestionale aziendale',
      ambienti: [],
      versioneCorrente: '2.3.1',
      dataUltimoAggiornamento: new Date('2024-07-01'),
    }]
  },
  {
    id: 2,
    descrizione: 'Società Sud Italia',
    regione: { id: 8, descrizione: 'Campania', codice: 'CAM', coordinate: { x: 40.8518, y: 14.2681 } },
    software: [{
      id: 2,
      descrizione: 'CRM Web',
      note: 'Gestione clienti e contatti',
      ambienti: [],
      versioneCorrente: '1.8.0',
      dataUltimoAggiornamento: new Date('2024-06-15'),
    }]
  },
  {
    id: 3,
    descrizione: 'Gruppo Centro Italia',
    regione: { id: 7, descrizione: 'Toscana', codice: 'TOS', coordinate: { x: 43.7696, y: 11.2558 } },
    software: []
  }
];

@Injectable({
  providedIn: 'root'
})
export class ClientiService {

  private readonly apiUrl = 'http://localhost:8085/api/clienti';
  
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  // Gestione degli errori HTTP
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Errore sconosciuto';
    
    // Check if we're in browser environment and ErrorEvent exists
    if (typeof ErrorEvent !== 'undefined' && error.error instanceof ErrorEvent) {
      errorMessage = `Errore client: ${error.error.message}`;
    } else if (error.status) {
      errorMessage = `Errore server ${error.status}: ${error.message}`;
      
      switch (error.status) {
        case 404:
          errorMessage = 'Risorsa non trovata';
          break;
        case 400:
          errorMessage = 'Dati non validi';
          break;
        case 403:
          errorMessage = 'Accesso negato - Controlla CORS o autenticazione';
          break;
        case 500:
          errorMessage = 'Errore interno del server';
          break;
      }
    }
    
    console.error('Errore HTTP:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
  
  constructor(private http: HttpClient) { }

  getAllClienti(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl).pipe(
      tap(data => console.log('Fetched clienti:', data)),
      catchError(this.handleError)
    );
  }

  getClienteById(id: number): Observable<Cliente | undefined> {
    return this.getAllClienti().pipe(
      map(clienti => clienti.find(cliente => cliente.id === id)),
      catchError(this.handleError)
    );
  }

  addCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente, this.httpOptions).pipe(
      tap(newCliente => console.log('Added cliente:', newCliente)),
      catchError(this.handleError)
    );
  }

  updateCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${cliente.id}`, cliente, this.httpOptions).pipe(
      tap(updatedCliente => console.log('Updated cliente:', updatedCliente)),
      catchError(this.handleError)
    );
  }

  deleteCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => console.log('Deleted cliente with id:', id)),
      catchError(this.handleError)
    );
  }
}
