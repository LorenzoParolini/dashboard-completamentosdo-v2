import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { Software } from '../models/software.model';
import { Ambiente } from '../models/ambiente.model';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

const ambientiBase: Ambiente[] = [
  { id: 1, descrizione: 'DEV', dataCreazione: new Date('2024-01-10'), note: 'Ambiente di sviluppo' },
  { id: 2, descrizione: 'TEST', dataCreazione: new Date('2024-02-15'), note: 'Ambiente di test funzionale' },
  { id: 3, descrizione: 'PROD', dataCreazione: new Date('2024-03-20'), note: 'Ambiente di produzione' },
];

export const software: Software[] = [
  {
    id: 1,
    descrizione: 'Gestionale ERP',
    note: 'Software gestionale aziendale',
    ambienti: ambientiBase,
    versioneCorrente: '2.3.1',
    dataUltimoAggiornamento: new Date('2024-07-01'),
  },
  {
    id: 2,
    descrizione: 'CRM Web',
    note: 'Gestione clienti e contatti',
    ambienti: ambientiBase,
    versioneCorrente: '1.8.0',
    dataUltimoAggiornamento: new Date('2024-06-15'),
  },
];

@Injectable({
  providedIn: 'root'
})
export class SoftwareService {

  private readonly apiUrl = 'http://localhost:8085/api/software';
  
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
  
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }
  
  getAllSoftware(): Observable<Software[]> {
    return this.http.get<Software[]>(this.apiUrl).pipe(
      tap(data => console.log('Fetched software:', data)),
      catchError(this.handleError)
    );
  }

  getSoftwareById(id: number): Observable<Software | undefined> {
    return this.getAllSoftware().pipe(
      map(software => software.find(soft => soft.id === id)),
      catchError(this.handleError)
    );
  }

  addSoftware(software: Software): Observable<Software> {
    return this.http.post<Software>(this.apiUrl, software, this.httpOptions).pipe(
      tap(newSoftware => console.log('Added software:', newSoftware)),
      catchError(this.handleError)
    );
  }

  updateSoftware(software: Software): Observable<Software> {
    return this.http.put<Software>(`${this.apiUrl}/${software.id}`, software, this.httpOptions).pipe(
      tap(updatedSoftware => console.log('Updated software:', updatedSoftware)),
      catchError(this.handleError)
    );
  }

  deleteSoftware(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => console.log('Deleted software with id:', id)),
      catchError(this.handleError)
    );
  }
}
