import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Ambiente } from '../models/ambiente.model';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

export const ambienti: Ambiente[] = [
    { id: 1, descrizione: 'DEV', dataCreazione: new Date('2024-01-10'), note: 'Ambiente di sviluppo' },
    { id: 2, descrizione: 'TEST', dataCreazione: new Date('2024-02-15'), note: 'Ambiente di test funzionale' },
    { id: 3, descrizione: 'PROD', dataCreazione: new Date('2024-03-01'), note: 'Ambiente di produzione' },
    { id: 4, descrizione: 'STAGING', dataCreazione: new Date('2024-04-05'), note: 'Ambiente di pre-produzione' },
  ];

@Injectable({
  providedIn: 'root'
})
export class AmbientiService {

  private readonly apiUrl = 'http://localhost:8085/api/ambienti';
  
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

   // Gestione degli errori HTTP
  private handleError(error: HttpErrorResponse): Observable<never> {
  let errorMessage = 'Errore sconosciuto';
  
  // Check if we're in browser environment and ErrorEvent exists
  if (typeof ErrorEvent !== 'undefined' && error.error instanceof ErrorEvent) {
    errorMessage = `Errore client: ${error.error.message}`;
  } else if (error.status) {
    errorMessage = `Errore server ${error.status}: ${error.message}`;
    
    switch (error.status) {
      case 404:
        errorMessage = 'Risorsa non trovata';
        break;
      case 400:
        errorMessage = 'Dati non validi';
        break;
      case 403:
        errorMessage = 'Accesso negato - Controlla CORS o autenticazione';
        break;
      case 500:
        errorMessage = 'Errore interno del server';
        break;
    }
  }
  
  console.error('Errore HTTP:', errorMessage, error);
  return throwError(() => new Error(errorMessage));
  }
  
  constructor(private http: HttpClient) { }

  getAllAmbienti(): Observable<Ambiente[]> {
    return this.http.get<Ambiente[]>(this.apiUrl).pipe(
      tap(data => console.log('Fetched ambienti:', data)),
      catchError(this.handleError)
    );
  }

  // getAmbienteById(id: number): Observable<Ambiente | undefined> {
  //   return this.getAllAmbienti().pipe(
  //     map(ambienti => ambienti.find(ambiente => ambiente.id === id)),
  //     catchError(this.handleError)
  //   );
  // }

  addAmbiente(ambiente: Ambiente): Observable<Ambiente> {
    return this.http.post<Ambiente>(this.apiUrl, ambiente, this.httpOptions).pipe(
      tap(newAmbiente => console.log('Added ambiente:', newAmbiente)),
      catchError(this.handleError)
    );
  }

  updateAmbiente(ambiente: Ambiente): Observable<Ambiente> {
    return this.http.put<Ambiente>(`${this.apiUrl}/${ambiente.id}`, ambiente, this.httpOptions).pipe(
      tap(updatedAmbiente => console.log('Updated ambiente:', updatedAmbiente)),
      catchError(this.handleError)
    );
  }

  deleteAmbiente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => console.log('Deleted ambiente with id:', id)),
      catchError(this.handleError)
    );
  }
}
