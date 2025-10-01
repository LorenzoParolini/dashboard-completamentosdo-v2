import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Ambiente, AmbienteDTO } from '../models/ambiente.model';

@Injectable({
  providedIn: 'root'
})
export class AmbientiService {
  // ← AGGIUNGI QUESTE PROPRIETÀ
  private readonly baseUrl = 'http://localhost:8085/api/ambienti';
  
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // GET - Recupera tutti gli ambienti
  getAllAmbienti(): Observable<Ambiente[]> {
    return this.http.get<Ambiente[]>(this.baseUrl)
      .pipe(
        tap(ambienti => console.log('Ambienti caricati:', ambienti)),
        catchError(this.handleError)
      );
  }

  // POST - Crea nuovo ambiente
  createAmbiente(ambiente: AmbienteDTO): Observable<AmbienteDTO> {
    return this.http.post<AmbienteDTO>(this.baseUrl, ambiente, this.httpOptions)
      .pipe(
        tap(nuovoAmbiente => console.log('Ambiente creato:', nuovoAmbiente)),
        catchError(this.handleError)
      );
  }

  // PUT - Aggiorna ambiente
  updateAmbiente(id: number, ambiente: AmbienteDTO): Observable<AmbienteDTO> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<AmbienteDTO>(url, ambiente, this.httpOptions)
      .pipe(
        tap(ambienteAggiornato => console.log('Ambiente aggiornato:', ambienteAggiornato)),
        catchError(this.handleError)
      );
  }

  // DELETE - Elimina ambiente
  deleteAmbiente(id: number): Observable<any> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete(url, this.httpOptions)
      .pipe(
        tap(() => console.log(`Ambiente con ID ${id} eliminato`)),
        catchError(this.handleError)
      );
  }

  // GET - Recupera ambiente per ID
  getAmbienteById(id: number): Observable<Ambiente> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.get<Ambiente>(url)
      .pipe(
        tap(ambiente => console.log('Ambiente caricato:', ambiente)),
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
