import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientiService } from '../../services/clienti.service';
import { Cliente } from '../../models/cliente.model';

import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { DetailsModalComponent } from './details-modal/details-modal.component';

@Component({
  selector: 'app-main',
  imports: [CommonModule, LoadingSpinnerComponent, DetailsModalComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {
  clienti: Cliente[] = [];
  selectedCliente: Cliente | null = null;
  loading: boolean = true;
  isModalOpen: boolean = false;
  modalCliente: Cliente | null = null;

  constructor(private clientiService: ClientiService) {}

  ngOnInit() {
    this.loading = true;
    setTimeout(() => {
      this.loadClienti();
    }, 1200); // 1.2s delay for loading effect
  }

  loadClienti() {
    this.clientiService.getAllClienti().subscribe(
      (data) => {
        this.clienti = data;
        this.loading = false;
      }
    );
  }

  showDetails(cliente: Cliente) {
    this.selectedCliente = cliente;
  }

  openModal(cliente: Cliente) {
    this.modalCliente = cliente;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.modalCliente = null;
  }
}
