import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Cliente } from '../../models/cliente.model';
import { ClientiService } from '../../services/clienti.service';
import { FilterService } from '../../services/filter.service';
import { FilterUtilsService, FilterCriteria } from '../../services/filter-utils.service';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClientiModalComponent } from './clienti-modal/clienti-modal.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-clienti',
  imports: [CommonModule, LoadingSpinnerComponent, NgbModule, ClientiModalComponent, ConfirmationModalComponent],
  templateUrl: './clienti.component.html',
  styleUrl: './clienti.component.css',
})
export class ClientiComponent implements OnInit, OnDestroy {
  clienti: Cliente[] = [];
  filteredClienti: Cliente[] = [];
  loading: boolean = false;
  currentFilters: FilterCriteria = {
    regioni: [],
    software: [],
    ambienti: [],
    codiciRegione: [],
    coordinate: [],
    versione: '',
    dataAggiornamento: [],
    dataCreazione: [],
    searchQuery: ''
  };
  private filterSubscription: Subscription = new Subscription();

  constructor(
    private clientiService: ClientiService,
    private modalService: NgbModal,
    private filterService: FilterService,
    private filterUtilsService: FilterUtilsService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.clienti = [];
    
    // Subscribe to filter changes
    this.filterSubscription = this.filterService.filters$.subscribe(filters => {
      this.currentFilters = filters;
      this.applyFilters();
    });

    setTimeout(() => {
      this.clientiService.getAllClienti().subscribe((data) => {
        this.clienti = data;
        this.applyFilters();
        this.loading = false;
      });
    }, 1200);
  }

  ngOnDestroy() {
    this.filterSubscription.unsubscribe();
  }

  applyFilters() {
    this.filteredClienti = this.clienti.filter(cliente => 
      this.filterUtilsService.shouldShowCliente(cliente, this.currentFilters)
    );
  }

  shouldShowCliente(cliente: Cliente): boolean {
    return this.filterUtilsService.shouldShowCliente(cliente, this.currentFilters);
  }

  onDeleteCliente(id_cliente_da_eliminare: string) {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      backdrop: true,
      keyboard: true,
      centered: true,
      size: 'sm'
    });

    // Set modal properties
    modalRef.componentInstance.title = 'Attenzione!';
    modalRef.componentInstance.message = 'Sei sicuro di voler eliminare questo cliente? Questa azione non può essere annullata.';
    modalRef.componentInstance.confirmText = 'Elimina';
    modalRef.componentInstance.cancelText = 'Annulla';

    // Handle modal result
    modalRef.result.then(
      (confirmed: boolean) => {
        if (confirmed) {
          this.clientiService.deleteCliente(id_cliente_da_eliminare);
          this.clienti = this.clienti.filter(c => c.id !== id_cliente_da_eliminare);
          this.applyFilters(); // Riapplica i filtri dopo l'eliminazione
        }
      },
      () => {
        // Modal dismissed (user clicked cancel, X, or clicked outside)
        // Do nothing
      }
    );
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
        this.applyFilters(); // Riapplica i filtri dopo la modifica/aggiunta
      },
      () => {}
    );
  }
}
