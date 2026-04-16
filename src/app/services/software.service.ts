import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, forkJoin, map, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Software, SoftwareInputDTO } from '../models/software.model';
import { Ambiente } from '../models/ambiente.model';

@Injectable({
  providedIn: 'root',
})
export class SoftwareService {
  private readonly baseUrl = 'http://localhost:8085/api/software';
  private readonly ambientiUrl = 'http://localhost:8085/api/ambienti';
  private readonly assegnazioniUrl = 'http://localhost:8085/api/assegnazioni';

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  private normalizeSoftware(
    item: Software,
    ambientiById: Map<number, Ambiente>,
  ): Software {
    const ambienteIds = new Set<number>();

    (item.assegnazioni ?? []).forEach((assegnazione) => {
      (assegnazione.rilasci ?? []).forEach((rilascio) => {
        if (rilascio.ambienteId) {
          ambienteIds.add(rilascio.ambienteId);
        }
      });
    });

    return {
      ...item,
      assegnazioni: item.assegnazioni ?? [],
      ambienti: Array.from(ambienteIds)
        .map((id) => ambientiById.get(id))
        .filter((ambiente): ambiente is Ambiente => Boolean(ambiente)),
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
  getAllSoftware(): Observable<Software[]> {
    return forkJoin({
      software: this.http.get<Software[]>(this.baseUrl),
      ambienti: this.http.get<Ambiente[]>(this.ambientiUrl),
    }).pipe(
      map(({ software, ambienti }) => {
        const ambientiById = new Map(
          ambienti.map((ambiente) => [ambiente.id, ambiente]),
        );
        return software.map((item) =>
          this.normalizeSoftware(item, ambientiById),
        );
      }),
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
  addSoftware(
    newSoftware: SoftwareInputDTO,
    clienteIds: number[] = [],
  ): Observable<Software> {
    // software.push(newSoftware);
    // return of(newSoftware);
    return this.http
      .post<Software>(this.baseUrl, newSoftware, this.httpOptions)
      .pipe(
        switchMap((addedSoftware: Software) => {
          const uniqueClienteIds = Array.from(
            new Set(clienteIds.filter((id) => id > 0)),
          );

          if (uniqueClienteIds.length === 0) {
            return of(addedSoftware);
          }

          const assegnazioniRequests = uniqueClienteIds.map((clienteId) =>
            this.http.post(
              this.assegnazioniUrl,
              {
                softwareId: addedSoftware.id,
                clienteId,
              },
              this.httpOptions,
            ),
          );

          return forkJoin(assegnazioniRequests).pipe(map(() => addedSoftware));
        }),
        tap((addedSoftware: Software) =>
          console.log('Software aggiunto:', addedSoftware),
        ),
        catchError(this.handleError),
      );
  }

  //PUT
  updateSoftware(
    id: number,
    updatedSoftware: SoftwareInputDTO,
  ): Observable<Software> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<Software>(url, updatedSoftware, this.httpOptions).pipe(
      tap((software: Software) =>
        console.log('Software aggiornato:', software),
      ),
      catchError(this.handleError),
    );
  }
}
