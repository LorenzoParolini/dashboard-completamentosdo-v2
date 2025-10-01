import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Ambiente, AmbienteDTO } from '../../models/ambiente.model';
import { AmbientiService } from '../../services/ambienti.service';
import { FilterService } from '../../services/filter.service';
import { FilterUtilsService, FilterCriteria } from '../../services/filter-utils.service';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AmbientiModalComponent } from './ambienti-modal/ambienti-modal.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-ambienti',
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent, NgbModule],
  templateUrl: './ambienti.component.html',
  styleUrl: './ambienti.component.css',
})
export class AmbientiComponent implements OnInit, OnDestroy {
  ambienti: Ambiente[] = [];
  filteredAmbienti: Ambiente[] = [];
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
    private ambientiService: AmbientiService,
    private modalService: NgbModal,
    private filterService: FilterService,
    private filterUtilsService: FilterUtilsService
  ) {}

  ngOnInit(): void {
    console.log('Componente inizializzato, caricamento ambienti...');
    this.loadAmbienti();
    
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
    this.filteredAmbienti = this.ambienti.filter(ambiente => 
      this.filterUtilsService.shouldShowAmbiente(ambiente, this.currentFilters)
    );
  }

  shouldShowAmbiente(ambiente: Ambiente): boolean {
    return this.filterUtilsService.shouldShowAmbiente(ambiente, this.currentFilters);
  }

  // Carica ambienti dal backend
  loadAmbienti(): void {
    this.loading = true;
    this.error = null;
    
    const loadSub = this.ambientiService.getAllAmbienti().subscribe({
      next: (data: Ambiente[]) => {
        this.ambienti = data;
        this.applyFilters();
        this.loading = false;
        console.log('Ambienti caricati nel componente:', data);
      },
      error: (error: Error) => {
        this.error = error.message;
        this.loading = false;
        console.error('Errore nel caricamento ambienti:', error);
      }
    });
    
    this.subscriptions.add(loadSub);
  }

  // Crea nuovo ambiente
  onCreateAmbiente(ambienteData: { descrizione: string; note: string }): void {
    const nuovoAmbiente: AmbienteDTO = {
      descrizione: ambienteData.descrizione,
      note: ambienteData.note
    };

    const createSub = this.ambientiService.createAmbiente(nuovoAmbiente).subscribe({
      next: (ambienteCreato: AmbienteDTO) => {
        console.log('Ambiente creato con successo:', ambienteCreato);
        this.loadAmbienti();
      },
      error: (error: Error) => {
        this.error = `Errore nella creazione: ${error.message}`;
        console.error('Errore creazione ambiente:', error);
      }
    });
    
    this.subscriptions.add(createSub);
  }

  // Aggiorna ambiente
  onUpdateAmbiente(id: number, ambienteData: { descrizione: string; note: string }): void {
    const ambienteAggiornato: AmbienteDTO = {
      descrizione: ambienteData.descrizione,
      note: ambienteData.note
    };

    const updateSub = this.ambientiService.updateAmbiente(id, ambienteAggiornato).subscribe({
      next: (ambienteAggiornato: AmbienteDTO) => {
        console.log('Ambiente aggiornato con successo:', ambienteAggiornato);
        this.loadAmbienti();
      },
      error: (error: Error) => {
        this.error = `Errore nell'aggiornamento: ${error.message}`;
        console.error('Errore aggiornamento ambiente:', error);
      }
    });
    
    this.subscriptions.add(updateSub);
  }

  // Refresh manuale
  onRefresh(): void {
    this.loadAmbienti();
  }

  // TrackBy per performance
  trackByAmbienteId(index: number, ambiente: Ambiente): number {
    return ambiente.id;
  }

  onDeleteAmbiente(id_ambiente_da_eliminare: number) {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      backdrop: true,
      keyboard: true,
      centered: true,
      size: 'sm'
    });

    // Set modal properties
    modalRef.componentInstance.title = 'Attenzione!';
    modalRef.componentInstance.message = 'Sei sicuro di voler eliminare questo ambiente? Questa azione non può essere annullata.';
    modalRef.componentInstance.confirmText = 'Elimina';
    modalRef.componentInstance.cancelText = 'Annulla';

    // Handle modal result
    modalRef.result.then(
      (confirmed: boolean) => {
        if (confirmed) {
          const deleteSub = this.ambientiService.deleteAmbiente(id_ambiente_da_eliminare).subscribe({
            next: () => {
              console.log('Ambiente eliminato con successo');
              this.loadAmbienti();
            },
            error: (error: Error) => {
              this.error = `Errore nell'eliminazione: ${error.message}`;
              console.error('Errore eliminazione ambiente:', error);
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

  openAmbienteModal(ambiente?: Ambiente) {
    const modalRef = this.modalService.open(AmbientiModalComponent, {
      backdrop: 'static', // impedisce la chiusura cliccando fuori
      keyboard: true, // permette la chiusura con ESC
      centered: true, // centra la modale
      size: 'lg' // dimensione grande
    });
    if (ambiente) {
      modalRef.componentInstance.ambiente = ambiente;
    }
    
    modalRef.result.then(
      (result: Ambiente) => {
        if (ambiente) {
          const idx = this.ambienti.findIndex((a) => a.id === result.id);
          if (idx !== -1) this.ambienti[idx] = result;
        } else {
          this.ambienti.push(result);
        }
        this.applyFilters(); // Riapplica i filtri dopo la modifica/aggiunta
      },
      () => {}
    );
  }
}
