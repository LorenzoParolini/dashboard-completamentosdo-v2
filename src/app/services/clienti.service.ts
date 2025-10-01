import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Cliente, ClienteDTO, ClienteInputDTO } from '../models/cliente.model';

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

  // GET - Recupera tutti i clienti
  getAllClienti(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.baseUrl)
      .pipe(
        tap(clienti => console.log('Clienti caricati:', clienti)),
        catchError(this.handleError)
      );
  }

  // POST - Crea nuovo cliente (con oggetti completi)
  createCliente(cliente: ClienteDTO): Observable<ClienteDTO> {
    return this.http.post<ClienteDTO>(this.baseUrl, cliente, this.httpOptions)
      .pipe(
        tap(nuovoCliente => console.log('Cliente creato:', nuovoCliente)),
        catchError(this.handleError)
      );
  }

  // POST - Crea nuovo cliente (con solo ID per le relazioni)
  createClienteWithIds(cliente: ClienteInputDTO): Observable<Cliente> {
    const url = `${this.baseUrl}/with-ids`;
    return this.http.post<Cliente>(url, cliente, this.httpOptions)
      .pipe(
        tap(nuovoCliente => console.log('Cliente creato con IDs:', nuovoCliente)),
        catchError(this.handleError)
      );
  }

  // PUT - Aggiorna cliente
  updateCliente(id: number, cliente: ClienteDTO): Observable<ClienteDTO> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<ClienteDTO>(url, cliente, this.httpOptions)
      .pipe(
        tap(clienteAggiornato => console.log('Cliente aggiornato:', clienteAggiornato)),
        catchError(this.handleError)
      );
  }

  // PUT - Aggiorna cliente (con solo ID per le relazioni)
  updateClienteWithIds(id: number, cliente: ClienteInputDTO): Observable<Cliente> {
    const url = `${this.baseUrl}/${id}/with-ids`;
    return this.http.put<Cliente>(url, cliente, this.httpOptions)
      .pipe(
        tap(clienteAggiornato => console.log('Cliente aggiornato con IDs:', clienteAggiornato)),
        catchError(this.handleError)
      );
  }

  // DELETE - Elimina cliente
  deleteCliente(id: number): Observable<any> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete(url, this.httpOptions)
      .pipe(
        tap(() => console.log(`Cliente con ID ${id} eliminato`)),
        catchError(this.handleError)
      );
  }

  // GET - Recupera cliente per ID
  getClienteById(id: number): Observable<Cliente> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.get<Cliente>(url)
      .pipe(
        tap(cliente => console.log('Cliente caricato:', cliente)),
        catchError(this.handleError)
      );
  }

  // Gestione errori
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
}
