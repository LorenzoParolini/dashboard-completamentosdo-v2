import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Ambiente, AmbienteInputDTO } from '../models/ambiente.model';

export const ambienti: Ambiente[] = [
  {
    id: 1,
    descrizione: 'DEV',
    dataCreazione: new Date('2024-01-10'),
    note: 'Ambiente di sviluppo',
  },
  {
    id: 2,
    descrizione: 'TEST',
    dataCreazione: new Date('2024-02-15'),
    note: 'Ambiente di test funzionale',
  },
  {
    id: 3,
    descrizione: 'PROD',
    dataCreazione: new Date('2024-03-01'),
    note: 'Ambiente di produzione',
  },
  {
    id: 4,
    descrizione: 'STAGING',
    dataCreazione: new Date('2024-04-05'),
    note: 'Ambiente di pre-produzione',
  },
];

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
  getAllAmbienti(): Observable<Ambiente[]> {
    // return of(ambienti);
    return this.http.get<Ambiente[]>(this.baseUrl).pipe(
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
  addAmbiente(ambiente: AmbienteInputDTO): Observable<AmbienteInputDTO> {
    // ambienti.push(ambiente);
    // return of(ambiente);
    return this.http
      .post<AmbienteInputDTO>(this.baseUrl, ambiente, this.httpOptions)
      .pipe(
        tap((addedAmbiente: AmbienteInputDTO) =>
          console.log('Ambiente aggiunto:', addedAmbiente),
        ),
        catchError(this.handleError),
      );
  }

  //PUT
  updateAmbiente(
    id: number,
    ambiente: AmbienteInputDTO,
  ): Observable<AmbienteInputDTO> {
    const url = `${this.baseUrl}/${id}`;
    return this.http
      .put<AmbienteInputDTO>(url, ambiente, this.httpOptions)
      .pipe(
        tap((updatedAmbiente: AmbienteInputDTO) =>
          console.log('Ambiente aggiornato:', updatedAmbiente),
        ),
        catchError(this.handleError),
      );
  }

  length(): number {
    return ambienti.length;
  }
}
