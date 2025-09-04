import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientiService } from '../../services/clienti.service';
import { Cliente } from '../../models/cliente.model';

import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-main',
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {
  clienti: Cliente[] = [];
  selectedCliente: Cliente | null = null;
  loading: boolean = true;

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
}
