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
    this.clientiService.getAllClienti().subscribe((data) => {
      this.clienti = data;
      this.loading = false;
    });
  }

  constructor(
    private clientiService: ClientiService,
    private modalService: NgbModal
  ) {}

  onDeleteCliente(id_cliente_da_eliminare: string) {
    this.clientiService.deleteCliente(id_cliente_da_eliminare);
    this.clienti = this.clienti.filter(c => c.id !== id_cliente_da_eliminare);
  }

  openClienteModal(cliente?: Cliente) {
    const modalRef = this.modalService.open(ClientiModal, {
      backdrop: 'static', // impedisce la chiusura cliccando fuori
      keyboard: true, // permette la chiusura con ESC
      centered: true, // centra la modale
      size: 'lg' // dimensione grande
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
