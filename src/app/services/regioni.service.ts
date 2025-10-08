import { Injectable } from '@angular/core';
import { Regione, RegioneInputDTO } from '../models/regione.model';
import { delay, Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export const regioni: Regione[] = [
    { id: 1, descrizione: 'Lombardia', codice: 'LOM', x: 45.4668, y: 9.1905 },
    { id: 2, descrizione: 'Lazio', codice: 'LAZ', x: 41.9028, y: 12.4964 },
    { id: 3, descrizione: 'Sicilia', codice: 'SIC', x: 37.5999, y: 14.0154 },
    { id: 4, descrizione: 'Veneto', codice: 'VEN', x: 45.4343, y: 12.3388 },
    { id: 5, descrizione: 'Piemonte', codice: 'PIE', x: 45.0703, y: 7.6869 },
    { id: 6, descrizione: 'Emilia-Romagna', codice: 'EMR', x: 44.4949, y: 11.3426 },
    { id: 7, descrizione: 'Toscana', codice: 'TOS', x: 43.7696, y: 11.2558 },
    { id: 8, descrizione: 'Campania', codice: 'CAM', x: 40.8518, y: 14.2681 },
    { id: 9, descrizione: 'Puglia', codice: 'PUG', x: 41.1171, y: 16.8719 },
    { id: 10, descrizione: 'Calabria', codice: 'CAL', x: 38.9050, y: 16.5947 },
];

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
  getAllRegioni(): Observable<Regione[]> {
    // return of(regioni).pipe(delay(500));
    return this.http.get<Regione[]>(this.baseUrl)
      .pipe(
        tap(regioniHTTP => console.log('Regioni caricate:', regioniHTTP)),
        catchError(this.handleError)
      );
  }

  //DELETE - OK
  deleteRegione(id: number): Observable<void> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions)
      .pipe(
        tap(() => console.log(`Regione con ID ${id} eliminata`)),
        catchError(this.handleError)
      );
  }

  //POST
  addRegione(regione: RegioneInputDTO): Observable<RegioneInputDTO> {
    // regioni.push(regione);
    // return of(regione);
    return this.http.post<RegioneInputDTO>(this.baseUrl, regione, this.httpOptions)
      .pipe(
        tap((newRegione: RegioneInputDTO) => console.log('Regione aggiunta:', newRegione)),
        catchError(this.handleError)
      );
  }

  //PUT
  updateRegione(id: number, regione: RegioneInputDTO): Observable<RegioneInputDTO> {
    const url = `${this.baseUrl}/${id}`;
    return this.http.put<RegioneInputDTO>(url, regione, this.httpOptions)
      .pipe(
        tap((updatedRegione: RegioneInputDTO) => console.log('Regione aggiornata:', updatedRegione)),
        catchError(this.handleError)
      );
    
  }

  length(): number {
    return regioni.length;
  }

}

