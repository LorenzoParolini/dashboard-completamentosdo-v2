import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Cliente } from '../../models/cliente.model';
import { ClientiService } from '../../services/clienti.service';
import { FilterService } from '../../services/filter.service';
import {
  FilterUtilsService,
  FilterCriteria,
} from '../../services/filter-utils.service';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { ServerErrorComponent } from '../server-error/server-error.component';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClientiModalComponent } from './clienti-modal/clienti-modal.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-clienti',
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ServerErrorComponent,
    NgbModule,
  ],
  templateUrl: './clienti.component.html',
  styleUrl: './clienti.component.css',
})
export class ClientiComponent implements OnInit, OnDestroy {
  clienti: Cliente[] = [];
  filteredClienti: Cliente[] = [];
  loading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';
  currentFilters: FilterCriteria = {
    regioni: [],
    software: [],
    ambienti: [],
    rilasci: [],
    branch: '',
    commit: '',
    deployedBy: '',
    build: '',
    ultimoAggiornamento: [],
    codiciRegione: [],
    coordinate: [],
    dataCreazione: [],
    searchQuery: '',
  };
  private filterSubscription: Subscription = new Subscription();

  constructor(
    private clientiService: ClientiService,
    private modalService: NgbModal,
    private filterService: FilterService,
    private filterUtilsService: FilterUtilsService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.clienti = [];

    // Subscribe to filter changes
    this.filterSubscription = this.filterService.filters$.subscribe(
      (filters) => {
        this.currentFilters = filters;
        this.applyFilters();
      },
    );

    setTimeout(() => {
      this.loadClienti();
    }, 1200);
  }

  loadClienti() {
    this.loading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.clientiService.getAllClienti().subscribe({
      next: (data) => {
        this.clienti = data;
        this.applyFilters();
        this.loading = false;
        this.hasError = false;
      },
      error: (error) => {
        console.error('Errore nel caricamento dei clienti:', error);
        this.loading = false;
        this.hasError = true;
        this.errorMessage =
          error.message || 'Impossibile raggiungere il server';
      },
    });
  }

  ngOnDestroy() {
    this.filterSubscription.unsubscribe();
  }

  applyFilters() {
    this.filteredClienti = this.clienti.filter((cliente) =>
      this.filterUtilsService.shouldShowCliente(cliente, this.currentFilters),
    );
  }

  shouldShowCliente(cliente: Cliente): boolean {
    return this.filterUtilsService.shouldShowCliente(
      cliente,
      this.currentFilters,
    );
  }

  onDeleteCliente(id_cliente_da_eliminare: number) {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      backdrop: true,
      keyboard: true,
      centered: true,
      size: 'sm',
    });

    // Set modal properties
    modalRef.componentInstance.title = 'Attenzione!';
    modalRef.componentInstance.message =
      'Sei sicuro di voler eliminare questo cliente? Questa azione non può essere annullata.';
    modalRef.componentInstance.confirmText = 'Elimina';
    modalRef.componentInstance.cancelText = 'Annulla';

    // Handle modal result
    modalRef.result.then(
      (confirmed: boolean) => {
        if (confirmed) {
          this.clientiService.deleteCliente(id_cliente_da_eliminare).subscribe({
            next: () => {
              console.log('Cliente eliminato con successo');
              // Ricarica la lista aggiornata
              this.clientiService.getAllClienti().subscribe((data) => {
                this.clienti = data;
                this.applyFilters();
              });
            },
            error: (error) => {
              console.error("Errore nell'eliminazione cliente:", error);
              // Gestisci l'errore (es. mostra un messaggio)
            },
          });
        }
      },
      () => {
        // Modal dismissed (user clicked cancel, X, or clicked outside)
        // Do nothing
      },
    );
  }

  openClienteModal(cliente?: Cliente) {
    const modalRef = this.modalService.open(ClientiModalComponent, {
      backdrop: 'static', // impedisce la chiusura cliccando fuori
      keyboard: true, // permette la chiusura con ESC
      centered: true, // centra la modale
      size: 'lg', // dimensione grande
    });
    if (cliente) {
      modalRef.componentInstance.cliente = cliente;
    }

    modalRef.result.then(
      (result: Cliente) => {
        if (cliente) {
          // Modifica: converti in InputDTO e passa l'ID
          const clienteInputDTO = {
            descrizione: result.descrizione,
            regioneId: result.regione.id,
            softwareIds: result.software.map((s) => s.id),
          };
          this.clientiService
            .updateCliente(result.id, clienteInputDTO)
            .subscribe(() => {
              // Ricarica la lista dai clienti aggiornati
              this.clientiService.getAllClienti().subscribe((data) => {
                this.clienti = data;
                this.applyFilters();
              });
            });
        } else {
          // Aggiunta: converti in InputDTO e usa il servizio per aggiungere
          const clienteInputDTO = {
            descrizione: result.descrizione,
            regioneId: result.regione.id,
            softwareIds: result.software.map((s) => s.id),
          };
          this.clientiService.addCliente(clienteInputDTO).subscribe(() => {
            // Ricarica la lista dai clienti aggiornati
            this.clientiService.getAllClienti().subscribe((data) => {
              this.clienti = data;
              this.applyFilters();
            });
          });
        }
      },
      () => {},
    );
  }

  retryLoadClienti() {
    this.loadClienti();
  }
}
