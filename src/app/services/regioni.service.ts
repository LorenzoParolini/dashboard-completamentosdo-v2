import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Regione } from '../models/regione.model';
import { delay, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class RegioniService {

  private readonly apiUrl = 'http://localhost:8085/api/regioni';
  
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

  getAllRegioni(): Observable<Regione[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(data => {
        // Mappa i dati rimuovendo i riferimenti circolari
        return data.map(item => ({
          id: item.id,
          descrizione: item.descrizione,
          codice: item.codice,
          coordinate: item.coordinate || { x: 0, y: 0 }
        } as Regione));
      }),
      tap(data => console.log('Fetched regioni:', data)),
      catchError(error => {
        console.error('Errore nel caricamento regioni:', error);
        // Solo durante SSR usa i dati mock come fallback
        if (!isPlatformBrowser(this.platformId)) {
          console.log('SSR fallback: using mock data for regioni');
          return of([]);  // Restituisci array vuoto durante SSR
        }
        // Nel browser, gestisci l'errore normalmente
        return this.handleError(error);
      })
    );
  }

  // getRegioneById(id: number): Observable<Regione | undefined> {
  //   return this.getAllRegioni().pipe(
  //     map(regioni => regioni.find(regione => regione.id === id)),
  //     catchError(this.handleError)
  //   );
  // }

  addRegione(regione: Regione): Observable<Regione> {
    return this.http.post<Regione>(this.apiUrl, regione, this.httpOptions).pipe(
      tap(newRegione => console.log('Added regione:', newRegione)),
      catchError(error => {
        if (!isPlatformBrowser(this.platformId)) {
          return of(regione);
        }
        return this.handleError(error);
      })
    );
  }

  updateRegione(regione: Regione): Observable<Regione> {
    return this.http.put<Regione>(`${this.apiUrl}/${regione.id}`, regione, this.httpOptions).pipe(
      tap(updatedRegione => console.log('Updated regione:', updatedRegione)),
      catchError(error => {
        if (!isPlatformBrowser(this.platformId)) {
          return of(regione);
        }
        return this.handleError(error);
      })
    );
  }

  deleteRegione(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => console.log('Deleted regione with id:', id)),
      catchError(error => {
        if (!isPlatformBrowser(this.platformId)) {
          return of(void 0);
        }
        return this.handleError(error);
      })
    );
  }
}

