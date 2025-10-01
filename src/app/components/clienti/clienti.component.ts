import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Cliente, ClienteDTO, ClienteInputDTO } from '../../models/cliente.model';
import { ClientiService } from '../../services/clienti.service';
import { FilterService } from '../../services/filter.service';
import { FilterUtilsService, FilterCriteria } from '../../services/filter-utils.service';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClientiModalComponent } from './clienti-modal/clienti-modal.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-clienti',
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent, NgbModule],
  templateUrl: './clienti.component.html',
  styleUrl: './clienti.component.css',
})
export class ClientiComponent implements OnInit, OnDestroy {
  clienti: Cliente[] = [];
  filteredClienti: Cliente[] = [];
  loading: boolean = false;
  error: string | null = null;
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
  private subscriptions: Subscription = new Subscription();
  private filterSubscription: Subscription = new Subscription();

  constructor(
    private clientiService: ClientiService,
    private modalService: NgbModal,
    private filterService: FilterService,
    private filterUtilsService: FilterUtilsService
  ) {}

  ngOnInit(): void {
    console.log('Componente clienti inizializzato, caricamento clienti...');
    this.loadClienti();
    
    // Subscribe to filter changes
    this.filterSubscription = this.filterService.filters$.subscribe(filters => {
      this.currentFilters = filters;
      this.applyFilters();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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

  // Carica clienti dal backend
  loadClienti(): void {
    this.loading = true;
    this.error = null;
    
    const loadSub = this.clientiService.getAllClienti().subscribe({
      next: (data: Cliente[]) => {
        this.clienti = data;
        this.applyFilters();
        this.loading = false;
        console.log('Clienti caricati nel componente:', data);
      },
      error: (error: Error) => {
        this.error = error.message;
        this.loading = false;
        console.error('Errore nel caricamento clienti:', error);
      }
    });
    
    this.subscriptions.add(loadSub);
  }

  // Crea nuovo cliente (con oggetti completi)
  onCreateCliente(clienteData: ClienteDTO): void {
    const createSub = this.clientiService.createCliente(clienteData).subscribe({
      next: (clienteCreato: ClienteDTO) => {
        console.log('Cliente creato con successo:', clienteCreato);
        this.loadClienti();
      },
      error: (error: Error) => {
        this.error = `Errore nella creazione: ${error.message}`;
        console.error('Errore creazione cliente:', error);
      }
    });
    
    this.subscriptions.add(createSub);
  }

  // Crea nuovo cliente (con solo ID per le relazioni)
  onCreateClienteWithIds(clienteData: ClienteInputDTO): void {
    const createSub = this.clientiService.createClienteWithIds(clienteData).subscribe({
      next: (clienteCreato: Cliente) => {
        console.log('Cliente creato con IDs con successo:', clienteCreato);
        this.loadClienti();
      },
      error: (error: Error) => {
        this.error = `Errore nella creazione: ${error.message}`;
        console.error('Errore creazione cliente:', error);
      }
    });
    
    this.subscriptions.add(createSub);
  }

  // Aggiorna cliente
  onUpdateCliente(id: number, clienteData: ClienteDTO): void {
    const updateSub = this.clientiService.updateCliente(id, clienteData).subscribe({
      next: (clienteAggiornato: ClienteDTO) => {
        console.log('Cliente aggiornato con successo:', clienteAggiornato);
        this.loadClienti();
      },
      error: (error: Error) => {
        this.error = `Errore nell'aggiornamento: ${error.message}`;
        console.error('Errore aggiornamento cliente:', error);
      }
    });
    
    this.subscriptions.add(updateSub);
  }

  // Refresh manuale
  onRefresh(): void {
    this.loadClienti();
  }

  // TrackBy per performance
  trackByClienteId(index: number, cliente: Cliente): number {
    return cliente.id;
  }

  onDeleteCliente(id_cliente_da_eliminare: number) {
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
          const deleteSub = this.clientiService.deleteCliente(id_cliente_da_eliminare).subscribe({
            next: () => {
              console.log('Cliente eliminato con successo');
              this.loadClienti();
            },
            error: (error: Error) => {
              this.error = `Errore nell'eliminazione: ${error.message}`;
              console.error('Errore eliminazione cliente:', error);
            }
          });
          
          this.subscriptions.add(deleteSub);
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
