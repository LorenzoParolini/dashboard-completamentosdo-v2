import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Cliente, ClienteInputDTO } from '../models/cliente.model';


@Injectable({
  providedIn: 'root',
})
export class ClientiService {
  private readonly baseUrl = 'http://localhost:8085/api/clienti';

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

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
    return this.http.get<Cliente[]>(this.baseUrl).pipe(
      tap((clientiHTTP) => console.log('Clienti caricati:', clientiHTTP)),
      catchError(this.handleError),
    );
  }

  //DELETE - OK
  deleteCliente(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap(() => console.log(`Cliente con ID ${id} eliminato`)),
      catchError(this.handleError),
    );
  }

  //POST
  addCliente(cliente: ClienteInputDTO): Observable<ClienteInputDTO> {
    return this.http
      .post<ClienteInputDTO>(this.baseUrl, cliente, this.httpOptions)
      .pipe(
        tap((newCliente: ClienteInputDTO) =>
          console.log('Cliente aggiunto:', newCliente),
        ),
        catchError(this.handleError),
      );
  }

  //PUT
  updateCliente(
    id: number,
    cliente: ClienteInputDTO,
  ): Observable<ClienteInputDTO> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<ClienteInputDTO>(url, cliente, this.httpOptions).pipe(
      tap((updatedCliente: ClienteInputDTO) =>
        console.log('Cliente aggiornato:', updatedCliente),
      ),
      catchError(this.handleError),
    );
  }

}
