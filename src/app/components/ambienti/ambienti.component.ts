import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Ambiente } from '../../models/ambiente.model';
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
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent, NgbModule, AmbientiModalComponent, ConfirmationModalComponent],
  templateUrl: './ambienti.component.html',
  styleUrl: './ambienti.component.css',
})
export class AmbientiComponent implements OnInit, OnDestroy {
  ambienti: Ambiente[] = [];
  filteredAmbienti: Ambiente[] = [];
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
    private ambientiService: AmbientiService,
    private modalService: NgbModal,
    private filterService: FilterService,
    private filterUtilsService: FilterUtilsService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.ambienti = [];
    
    // Subscribe to filter changes
    this.filterSubscription = this.filterService.filters$.subscribe(filters => {
      this.currentFilters = filters;
      this.applyFilters();
    });

    setTimeout(() => {
      this.ambientiService.getAllAmbienti().subscribe((data) => {
        this.ambienti = data;
        this.applyFilters();
        this.loading = false;
      });
    }, 1200);
  }

  ngOnDestroy() {
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

  onDeleteAmbiente(id_ambiente_da_eliminare: string) {
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
          this.ambientiService.deleteAmbiente(id_ambiente_da_eliminare);
          this.ambienti = this.ambienti.filter(a => a.id !== id_ambiente_da_eliminare);
          this.applyFilters(); // Riapplica i filtri dopo l'eliminazione
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
