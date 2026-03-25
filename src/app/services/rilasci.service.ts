import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Rilascio, RilascioInputDTO } from '../models/rilascio.model';

@Injectable({
  providedIn: 'root',
})
export class RilasciService {
  private readonly baseUrl = 'http://localhost:8085/api/rilasci';

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

  getAllRilasci(): Observable<Rilascio[]> {
    return this.http.get<Rilascio[]>(this.baseUrl).pipe(
      tap((rilasciHTTP) => console.log('Rilasci caricati:', rilasciHTTP)),
      catchError(this.handleError),
    );
  }

  deleteRilascio(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap(() => console.log(`Rilascio con ID ${id} eliminato`)),
      catchError(this.handleError),
    );
  }

  addRilascio(newRilascio: RilascioInputDTO): Observable<Rilascio> {
    return this.http
      .post<Rilascio>(this.baseUrl, newRilascio, this.httpOptions)
      .pipe(
        tap((addedRilascio: Rilascio) =>
          console.log('Rilascio aggiunto:', addedRilascio),
        ),
        catchError(this.handleError),
      );
  }

  updateRilascio(
    id: number,
    updatedRilascio: RilascioInputDTO,
  ): Observable<Rilascio> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<Rilascio>(url, updatedRilascio, this.httpOptions).pipe(
      tap((rilascio: Rilascio) =>
        console.log('Rilascio aggiornato:', rilascio),
      ),
      catchError(this.handleError),
    );
  }
}
