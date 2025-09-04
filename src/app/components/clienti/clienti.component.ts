import { Component, OnInit } from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { ClientiService } from '../../services/clienti.service';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClientiModalComponent } from './clienti-modal/clienti-modal.component';

@Component({
  selector: 'app-clienti',
  imports: [CommonModule, LoadingSpinnerComponent, NgbModule, ClientiModalComponent],
  templateUrl: './clienti.component.html',
  styleUrl: './clienti.component.css',
})
export class ClientiComponent implements OnInit {
  clienti: Cliente[] = [];
  loading: boolean = false;

  ngOnInit(): void {
    this.loading = true;
    this.clienti = [];
    setTimeout(() => {
      this.clientiService.getAllClienti().subscribe((data) => {
        this.clienti = data;
        this.loading = false;
      });
    }, 1200);
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
    const modalRef = this.modalService.open(ClientiModalComponent, {
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
