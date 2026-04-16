import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, forkJoin, map, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Cliente, ClienteInputDTO } from '../models/cliente.model';
import { Software } from '../models/software.model';
import { Ambiente } from '../models/ambiente.model';

@Injectable({
  providedIn: 'root',
})
export class ClientiService {
  private readonly baseUrl = 'http://localhost:8085/api/clienti';
  private readonly softwareUrl = 'http://localhost:8085/api/software';
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

  private normalizeSoftwareForCliente(
    item: Software,
    clienteId: number,
    ambientiById: Map<number, Ambiente>,
  ): Software {
    const assegnazioniCliente = (item.assegnazioni ?? []).filter(
      (assegnazione) => assegnazione.clienteId === clienteId,
    );

    const ambienteIds = new Set<number>();
    assegnazioniCliente.forEach((assegnazione) => {
      (assegnazione.rilasci ?? []).forEach((rilascio) => {
        if (rilascio.ambienteId) {
          ambienteIds.add(rilascio.ambienteId);
        }
      });
    });

    return {
      ...item,
      assegnazioni: assegnazioniCliente,
      ambienti: Array.from(ambienteIds)
        .map((id) => ambientiById.get(id))
        .filter((ambiente): ambiente is Ambiente => Boolean(ambiente)),
    };
  }

  private normalizeCliente(
    item: Cliente,
    softwareById: Map<number, Software>,
  ): Cliente {
    const softwareIds = Array.from(
      new Set(
        (item.assegnazioni ?? []).map(
          (assegnazione) => assegnazione.softwareId,
        ),
      ),
    );

    return {
      ...item,
      assegnazioni: item.assegnazioni ?? [],
      software: softwareIds
        .map((softwareId) => softwareById.get(softwareId))
        .filter((software): software is Software => Boolean(software)),
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
  getAllClienti(): Observable<Cliente[]> {
    return forkJoin({
      clienti: this.http.get<Cliente[]>(this.baseUrl),
      software: this.http.get<Software[]>(this.softwareUrl),
      ambienti: this.http.get<Ambiente[]>(this.ambientiUrl),
    }).pipe(
      map(({ clienti, software, ambienti }) => {
        const ambientiById = new Map(
          ambienti.map((ambiente) => [ambiente.id, ambiente]),
        );
        const softwareById = new Map(
          software
            .map((item) => this.normalizeSoftware(item, ambientiById))
            .map((item) => [item.id, item]),
        );

        return clienti.map((item) => {
          const normalizedCliente = this.normalizeCliente(item, softwareById);

          return {
            ...normalizedCliente,
            software: normalizedCliente.software.map((sw) =>
              this.normalizeSoftwareForCliente(
                sw,
                normalizedCliente.id,
                ambientiById,
              ),
            ),
          };
        });
      }),
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
  addCliente(
    cliente: ClienteInputDTO,
    softwareIds: number[] = [],
  ): Observable<Cliente> {
    return this.http
      .post<Cliente>(this.baseUrl, cliente, this.httpOptions)
      .pipe(
        switchMap((newCliente: Cliente) => {
          const uniqueSoftwareIds = Array.from(
            new Set(softwareIds.filter((id) => id > 0)),
          );

          if (uniqueSoftwareIds.length === 0) {
            return of(newCliente);
          }

          const assegnazioniRequests = uniqueSoftwareIds.map((softwareId) =>
            this.http.post(
              this.assegnazioniUrl,
              {
                softwareId,
                clienteId: newCliente.id,
              },
              this.httpOptions,
            ),
          );

          return forkJoin(assegnazioniRequests).pipe(map(() => newCliente));
        }),
        tap((newCliente: Cliente) =>
          console.log('Cliente aggiunto:', newCliente),
        ),
        catchError(this.handleError),
      );
  }

  private syncClienteSoftwareAssignments(
    clienteId: number,
    currentSoftwareIds: number[],
    nextSoftwareIds: number[],
  ): Observable<void> {
    const currentSet = new Set(currentSoftwareIds.filter((id) => id > 0));
    const nextSet = new Set(nextSoftwareIds.filter((id) => id > 0));

    const softwareDaAggiungere = Array.from(nextSet).filter(
      (softwareId) => !currentSet.has(softwareId),
    );
    const softwareDaRimuovere = Array.from(currentSet).filter(
      (softwareId) => !nextSet.has(softwareId),
    );

    if (softwareDaAggiungere.length === 0 && softwareDaRimuovere.length === 0) {
      return of(void 0);
    }

    const aggiunteRequests = softwareDaAggiungere.map((softwareId) =>
      this.http.post(
        this.assegnazioniUrl,
        { softwareId, clienteId },
        this.httpOptions,
      ),
    );

    const rimozioniRequests = softwareDaRimuovere.map((softwareId) =>
      this.http.delete<void>(
        `${this.assegnazioniUrl}/${softwareId}/${clienteId}`,
        this.httpOptions,
      ),
    );

    return forkJoin([...aggiunteRequests, ...rimozioniRequests]).pipe(
      map(() => void 0),
    );
  }

  //PUT
  updateCliente(
    id: number,
    cliente: ClienteInputDTO,
    nextSoftwareIds: number[] = [],
    currentSoftwareIds: number[] = [],
  ): Observable<Cliente> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<Cliente>(url, cliente, this.httpOptions).pipe(
      switchMap((updatedCliente: Cliente) =>
        this.syncClienteSoftwareAssignments(
          id,
          currentSoftwareIds,
          nextSoftwareIds,
        ).pipe(map(() => updatedCliente)),
      ),
      tap((updatedCliente: Cliente) =>
        console.log('Cliente aggiornato:', updatedCliente),
      ),
      catchError(this.handleError),
    );
  }
}
