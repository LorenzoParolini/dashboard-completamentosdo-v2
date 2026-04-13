import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, map, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Ambiente, AmbienteInputDTO } from '../models/ambiente.model';

@Injectable({
  providedIn: 'root',
})
export class AmbientiService {
  private readonly baseUrl = 'http://localhost:8085/api/ambienti';

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  private normalizeAmbiente(item: Ambiente): Ambiente {
    return {
      ...item,
      rilasci: item.rilasci ?? [],
    };
  }

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
  getAllAmbienti(): Observable<Ambiente[]> {
    // return of(ambienti);
    return this.http.get<Ambiente[]>(this.baseUrl).pipe(
      map((items) => items.map((item) => this.normalizeAmbiente(item))),
      tap((ambientiHTTP) => console.log('Ambienti caricati:', ambientiHTTP)),
      catchError(this.handleError),
    );
  }

  //DELETE - OK
  deleteAmbiente(id: number): Observable<any> {
    console.log(`Eliminazione ambiente con ID ${id}`);
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete(url, this.httpOptions).pipe(
      tap(() => console.log(`Ambiente con ID ${id} eliminato`)),
      catchError(this.handleError),
    );
  }

  //POST
  addAmbiente(ambiente: AmbienteInputDTO): Observable<Ambiente> {
    // ambienti.push(ambiente);
    // return of(ambiente);
    return this.http
      .post<Ambiente>(this.baseUrl, ambiente, this.httpOptions)
      .pipe(
        map((item) => this.normalizeAmbiente(item)),
        tap((addedAmbiente: Ambiente) =>
          console.log('Ambiente aggiunto:', addedAmbiente),
        ),
        catchError(this.handleError),
      );
  }

  //PUT
  updateAmbiente(id: number, ambiente: AmbienteInputDTO): Observable<Ambiente> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<Ambiente>(url, ambiente, this.httpOptions).pipe(
      map((item) => this.normalizeAmbiente(item)),
      tap((updatedAmbiente: Ambiente) =>
        console.log('Ambiente aggiornato:', updatedAmbiente),
      ),
      catchError(this.handleError),
    );
  }
}
