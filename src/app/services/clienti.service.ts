import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Cliente, ClienteInputDTO } from '../models/cliente.model';

export const clienti: Cliente[] = [
  {
    id: 1,
    descrizione: 'Azienda Nord Italia',
    regione: { id: 1, descrizione: 'Lombardia', codice: 'LOM', x: 45.4642, y: 9.1900 },
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
    regione: { id: 8, descrizione: 'Campania', codice: 'CAM', x: 40.8518, y: 14.2681 },
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
    regione: { id: 7, descrizione: 'Toscana', codice: 'TOS', x: 43.7696, y: 11.2558 },
    software: []
  }
];

@Injectable({
  providedIn: 'root'
})
export class ClientiService {
  
  private readonly baseUrl = 'http://localhost:8085/api/clienti';
  
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Errore sconosciuto';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Errore client: ${error.error.message}`;
    } else {
      errorMessage = `Errore server ${error.status}: ${error.message}`;
      
      switch (error.status) {
        case 404:
          errorMessage = 'Risorsa non trovata';
          break;
        case 400:
          errorMessage = 'Dati non validi';
          break;
        case 500:
          errorMessage = 'Errore interno del server';
          break;
      }
    }
    
    console.error('Errore HTTP:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  //GET - OK
  getAllClienti(): Observable<Cliente[]> {
    // return of(clienti);
    return this.http.get<Cliente[]>(this.baseUrl)
      .pipe(
        tap(clientiHTTP => console.log('Clienti caricati:', clientiHTTP)),
        catchError(this.handleError)
      );
  }

  //DELETE - OK
  deleteCliente(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions)
      .pipe(
        tap(() => console.log(`Cliente con ID ${id} eliminato`)),
        catchError(this.handleError)
      );
  }

  //POST
  addCliente(cliente: ClienteInputDTO): Observable<ClienteInputDTO> {
    return this.http.post<ClienteInputDTO>(this.baseUrl, cliente, this.httpOptions)
      .pipe(
        tap((newCliente: ClienteInputDTO) => console.log('Cliente aggiunto:', newCliente)),
        catchError(this.handleError)
      );
  }

  //PUT
  updateCliente(id: number, cliente: ClienteInputDTO): Observable<ClienteInputDTO> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<ClienteInputDTO>(url, cliente, this.httpOptions)
      .pipe(
        tap((updatedCliente: ClienteInputDTO) => console.log('Cliente aggiornato:', updatedCliente)),
        catchError(this.handleError)
      );
  }

  length(): number {
    return clienti.length;
  }
}
