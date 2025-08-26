import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { ClientiService } from '../../services/clienti';
import { CommonModule } from '@angular/common';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClientiModal } from './clienti-modal/clienti-modal';

@Component({
  selector: 'app-clienti',
  imports: [CommonModule, LoadingSpinner, NgbModule, ClientiModal],
  templateUrl: './clienti.html',
  styleUrl: './clienti.css',
})
export class Clienti implements OnInit {
  clienti: Cliente[] = [];
  loading: boolean = false;

  ngOnInit(): void {
    this.loading = true;
    this.clienti = [];
    // Dati di esempio
    this.clienti = [
      {
        id: '1',
        descrizione: 'Azienda Nord Italia',
        regione: { id: '1', descrizione: 'Lombardia', codice: 'LOM', coordinate: { x: 45.4642, y: 9.1900 } },
        software: [
          { id: '1', descrizione: 'ERP System', note: 'Sistema gestionale', ambienti: [], versioneCorrente: '2.1.0', dataUltimoAggiornamento: new Date('2024-01-15') },
          { id: '2', descrizione: 'CRM Platform', note: 'Gestione clienti', ambienti: [], versioneCorrente: '1.5.2', dataUltimoAggiornamento: new Date('2024-02-01') }
        ]
      },
      {
        id: '2',
        descrizione: 'Società Sud Italia',
        regione: { id: '2', descrizione: 'Campania', codice: 'CAM', coordinate: { x: 40.8518, y: 14.2681 } },
        software: [
          { id: '3', descrizione: 'Accounting Software', ambienti: [], versioneCorrente: '3.0.1', dataUltimoAggiornamento: new Date('2024-01-20') }
        ]
      },
      {
        id: '3',
        descrizione: 'Gruppo Centro Italia',
        regione: { id: '3', descrizione: 'Toscana', codice: 'TOS', coordinate: { x: 43.7696, y: 11.2558 } },
        software: [
          { id: '1', descrizione: 'ERP System', note: 'Sistema gestionale', ambienti: [], versioneCorrente: '2.1.0', dataUltimoAggiornamento: new Date('2024-01-15') }
        ]
      }
    ];
    this.loading = false;
    
    // Uncomment quando il servizio sarà pronto
    // this.clientiService.getAllClienti().subscribe((data) => {
    //   this.clienti = data;
    //   this.loading = false;
    // });
  }

  constructor(
    private clientiService: ClientiService,
    private modalService: NgbModal
  ) {}

  onDeleteCliente(id_cliente_da_eliminare: string) {
    this.clientiService.deleteCliente(id_cliente_da_eliminare);
  }

  openClienteModal(cliente?: Cliente) {
    const modalRef = this.modalService.open(ClientiModal, {
      backdrop: true,
      keyboard: true,
    });
    if (cliente) {
      modalRef.componentInstance.cliente = cliente;
    }
    
    modalRef.result.then(
      (result: Cliente) => {
        if (cliente) {
          const idx = this.clienti.findIndex((c) => c.id === result.id);
          if (idx !== -1) this.clienti[idx] = result;
        } else {
          this.clienti.push(result);
        }
      },
      () => {}
    );
  }
}
