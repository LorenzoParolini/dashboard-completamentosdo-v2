import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Software, SoftwareInputDTO } from '../models/software.model';
import { Ambiente } from '../models/ambiente.model';

const ambientiBase: Ambiente[] = [
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
    dataCreazione: new Date('2024-03-20'),
    note: 'Ambiente di produzione',
  },
];

export const software: Software[] = [
  {
    id: 1,
    descrizione: 'Gestionale ERP',
    note: 'Software gestionale aziendale',
    ambienti: ambientiBase,
    versioneCorrente: '2.3.1',
    dataUltimoAggiornamento: '2024-07-01T10:30:00',
  },
  {
    id: 2,
    descrizione: 'CRM Web',
    note: 'Gestione clienti e contatti',
    ambienti: ambientiBase,
    versioneCorrente: '1.8.0',
    dataUltimoAggiornamento: '2024-06-15T09:15:00',
  },
];

@Injectable({
  providedIn: 'root',
})
export class SoftwareService {
  private readonly baseUrl = 'http://localhost:8085/api/software';

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
  getAllSoftware(): Observable<Software[]> {
    return this.http.get<Software[]>(this.baseUrl).pipe(
      tap((softwareHTTP) => console.log('Software caricati:', softwareHTTP)),
      catchError(this.handleError),
    );
  }

  //DELETE - OK
  deleteSoftware(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap(() => console.log(`Software con ID ${id} eliminato`)),
      catchError(this.handleError),
    );
  }

  //POST
  addSoftware(newSoftware: SoftwareInputDTO): Observable<SoftwareInputDTO> {
    // software.push(newSoftware);
    // return of(newSoftware);
    return this.http
      .post<SoftwareInputDTO>(this.baseUrl, newSoftware, this.httpOptions)
      .pipe(
        tap((addedSoftware: SoftwareInputDTO) =>
          console.log('Software aggiunto:', addedSoftware),
        ),
        catchError(this.handleError),
      );
  }

  //PUT
  updateSoftware(
    id: number,
    updatedSoftware: SoftwareInputDTO,
  ): Observable<SoftwareInputDTO> {
    const url = `${this.baseUrl}/${id}`;
    return this.http
      .put<SoftwareInputDTO>(url, updatedSoftware, this.httpOptions)
      .pipe(
        tap((software: SoftwareInputDTO) =>
          console.log('Software aggiornato:', software),
        ),
        catchError(this.handleError),
      );
  }

  length(): number {
    return software.length;
  }
}
