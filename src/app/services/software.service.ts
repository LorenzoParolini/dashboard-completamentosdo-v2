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

  
}
