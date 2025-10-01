import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Regione, RegioneDTO } from '../models/regione.model';

@Injectable({
  providedIn: 'root'
})
export class RegioniService {
  private readonly baseUrl = 'http://localhost:8085/api/regioni';
  
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // GET - Recupera tutte le regioni
  getAllRegioni(): Observable<Regione[]> {
    return this.http.get<Regione[]>(this.baseUrl)
      .pipe(
        tap(regioni => console.log('Regioni caricate:', regioni)),
        catchError(this.handleError)
      );
  }

  // POST - Crea nuova regione
  createRegione(regione: RegioneDTO): Observable<RegioneDTO> {
    return this.http.post<RegioneDTO>(this.baseUrl, regione, this.httpOptions)
      .pipe(
        tap(nuovaRegione => console.log('Regione creata:', nuovaRegione)),
        catchError(this.handleError)
      );
  }

  // PUT - Aggiorna regione
  updateRegione(id: number, regione: RegioneDTO): Observable<RegioneDTO> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<RegioneDTO>(url, regione, this.httpOptions)
      .pipe(
        tap(regioneAggiornata => console.log('Regione aggiornata:', regioneAggiornata)),
        catchError(this.handleError)
      );
  }

  // DELETE - Elimina regione
  deleteRegione(id: number): Observable<any> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete(url, this.httpOptions)
      .pipe(
        tap(() => console.log(`Regione con ID ${id} eliminata`)),
        catchError(this.handleError)
      );
  }

  // GET - Recupera regione per ID
  getRegioneById(id: number): Observable<Regione> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.get<Regione>(url)
      .pipe(
        tap(regione => console.log('Regione caricata:', regione)),
        catchError(this.handleError)
      );
  }

  // Gestione errori
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
}

