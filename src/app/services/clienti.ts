import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Cliente } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClientiService {
  
  getAllClienti(): Observable<Cliente[]> {
    // Mock implementation - sostituire con chiamata HTTP reale
    return of([]);
  }

  deleteCliente(id: string): void {
    // Mock implementation - sostituire con chiamata HTTP reale
    console.log('Eliminando cliente con ID:', id);
  }
}
