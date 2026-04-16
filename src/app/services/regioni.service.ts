import { Injectable } from '@angular/core';
import { Regione, RegioneInputDTO } from '../models/regione.model';
import { Observable } from 'rxjs';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RegioniService {
  private readonly baseUrl = 'http://localhost:8085/api/regioni';

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Errore sconosciuto';

    if (
      typeof ErrorEvent !== 'undefined' &&
      error.error instanceof ErrorEvent
    ) {
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
  getAllRegioni(): Observable<Regione[]> {
    // return of(regioni).pipe(delay(500));
    return this.http.get<Regione[]>(this.baseUrl).pipe(
      tap((regioniHTTP) => console.log('Regioni caricate:', regioniHTTP)),
      catchError(this.handleError),
    );
  }

  //DELETE - OK
  deleteRegione(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap(() => console.log(`Regione con ID ${id} eliminata`)),
      catchError(this.handleError),
    );
  }

  //POST
  addRegione(regione: RegioneInputDTO): Observable<RegioneInputDTO> {
    // regioni.push(regione);
    // return of(regione);
    return this.http
      .post<RegioneInputDTO>(this.baseUrl, regione, this.httpOptions)
      .pipe(
        tap((newRegione: RegioneInputDTO) =>
          console.log('Regione aggiunta:', newRegione),
        ),
        catchError(this.handleError),
      );
  }

  //PUT
  updateRegione(
    id: number,
    regione: RegioneInputDTO,
  ): Observable<RegioneInputDTO> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<RegioneInputDTO>(url, regione, this.httpOptions).pipe(
      tap((updatedRegione: RegioneInputDTO) =>
        console.log('Regione aggiornata:', updatedRegione),
      ),
      catchError(this.handleError),
    );
  }
}
