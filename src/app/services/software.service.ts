import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Software, SoftwareDTO, SoftwareInputDTO } from '../models/software.model';

@Injectable({
  providedIn: 'root'
})
export class SoftwareService {
  private readonly baseUrl = 'http://localhost:8085/api/software';
  
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // GET - Recupera tutti i software
  getAllSoftware(): Observable<Software[]> {
    return this.http.get<Software[]>(this.baseUrl)
      .pipe(
        tap(software => console.log('Software caricati:', software)),
        catchError(this.handleError)
      );
  }

  // POST - Crea nuovo software (con oggetti completi)
  createSoftware(software: SoftwareDTO): Observable<SoftwareDTO> {
    return this.http.post<SoftwareDTO>(this.baseUrl, software, this.httpOptions)
      .pipe(
        tap(nuovoSoftware => console.log('Software creato:', nuovoSoftware)),
        catchError(this.handleError)
      );
  }

  // POST - Crea nuovo software (con solo ID per le relazioni)
  createSoftwareWithIds(software: SoftwareInputDTO): Observable<Software> {
    const url = `${this.baseUrl}/with-ids`;
    return this.http.post<Software>(url, software, this.httpOptions)
      .pipe(
        tap(nuovoSoftware => console.log('Software creato con IDs:', nuovoSoftware)),
        catchError(this.handleError)
      );
  }

  // PUT - Aggiorna software
  updateSoftware(id: number, software: SoftwareDTO): Observable<SoftwareDTO> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<SoftwareDTO>(url, software, this.httpOptions)
      .pipe(
        tap(softwareAggiornato => console.log('Software aggiornato:', softwareAggiornato)),
        catchError(this.handleError)
      );
  }

  // PUT - Aggiorna software (con solo ID per le relazioni)
  updateSoftwareWithIds(id: number, software: SoftwareInputDTO): Observable<Software> {
    const url = `${this.baseUrl}/${id}/with-ids`;
    return this.http.put<Software>(url, software, this.httpOptions)
      .pipe(
        tap(softwareAggiornato => console.log('Software aggiornato con IDs:', softwareAggiornato)),
        catchError(this.handleError)
      );
  }

  // DELETE - Elimina software
  deleteSoftware(id: number): Observable<any> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete(url, this.httpOptions)
      .pipe(
        tap(() => console.log(`Software con ID ${id} eliminato`)),
        catchError(this.handleError)
      );
  }

  // GET - Recupera software per ID
  getSoftwareById(id: number): Observable<Software> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.get<Software>(url)
      .pipe(
        tap(software => console.log('Software caricato:', software)),
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
