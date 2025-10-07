import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Regione } from '../../models/regione.model';
import { RegioniService } from '../../services/regioni.service';
import { FilterService } from '../../services/filter.service';
import { FilterUtilsService, FilterCriteria } from '../../services/filter-utils.service';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RegioniModalComponent } from './regioni-modal/regioni-modal.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-regioni',
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent, NgbModule],
  templateUrl: './regioni.component.html',
  styleUrl: './regioni.component.css',
})
export class RegioniComponent implements OnInit, OnDestroy {
  regioni: Regione[] = [];
  filteredRegioni: Regione[] = [];
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
    private regioniService: RegioniService,
    private modalService: NgbModal,
    private filterService: FilterService,
    private filterUtilsService: FilterUtilsService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.regioni = [];
    
    // Subscribe to filter changes
    this.filterSubscription = this.filterService.filters$.subscribe(filters => {
      this.currentFilters = filters;
      this.applyFilters();
    });

    // Carica le regioni dal backend
    this.regioniService.getAllRegioni().subscribe({
      next: (data) => {
        this.regioni = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Errore nel caricamento delle regioni:', error);
        this.loading = false;
      }
    });
  }

  ngOnDestroy() {
    this.filterSubscription.unsubscribe();
  }

  applyFilters() {
    this.filteredRegioni = this.regioni.filter(regione => 
      this.filterUtilsService.shouldShowRegione(regione, this.currentFilters)
    );
  }

  shouldShowRegione(regione: Regione): boolean {
    return this.filterUtilsService.shouldShowRegione(regione, this.currentFilters);
  }

  onDeleteRegione(id_regione_da_eliminare: number) {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      backdrop: true,
      keyboard: true,
      centered: true,
      size: 'sm'
    });

    // Set modal properties
    modalRef.componentInstance.title = 'Attenzione!';
    modalRef.componentInstance.message = 'Sei sicuro di voler eliminare questa regione? Questa azione non può essere annullata.';
    modalRef.componentInstance.confirmText = 'Elimina';
    modalRef.componentInstance.cancelText = 'Annulla';

    // Handle modal result
    modalRef.result.then(
      (confirmed: boolean) => {
        if (confirmed) {
          this.regioniService.deleteRegione(id_regione_da_eliminare).subscribe({
            next: () => {
              this.regioni = this.regioni.filter(r => r.id !== id_regione_da_eliminare);
              this.applyFilters(); // Riapplica i filtri dopo l'eliminazione
            },
            error: (error) => {
              console.error('Errore nell\'eliminazione della regione:', error);
            }
          });
        }
      },
      () => {
        // Modal dismissed (user clicked cancel, X, or clicked outside)
        // Do nothing
      }
    );
  }

  // Metodo attuale con NgBootstrap
  openRegioneModal(regione?: Regione) {
    const modalRef = this.modalService.open(RegioniModalComponent, {
      backdrop: true, // consente la chiusura cliccando fuori
      keyboard: true, // permette la chiusura con ESC
      centered: true, // centra la modale
      size: 'lg' // dimensione grande
    });
    if (regione) {
      modalRef.componentInstance.regione = regione;
    }
    
    // gestisce il risultato della modale
    modalRef.result.then(
      (result: Regione) => {
        if (regione) {
          // Aggiorna regione esistente
          this.regioniService.updateRegione(result).subscribe({
            next: (updatedRegione) => {
              const idx = this.regioni.findIndex((r) => r.id === updatedRegione.id);
              if (idx !== -1) this.regioni[idx] = updatedRegione;
              this.applyFilters();
            },
            error: (error) => {
              console.error('Errore nell\'aggiornamento della regione:', error);
            }
          });
        } else {
          // Aggiungi nuova regione
          this.regioniService.addRegione(result).subscribe({
            next: (newRegione) => {
              this.regioni.push(newRegione);
              this.applyFilters();
            },
            error: (error) => {
              console.error('Errore nell\'aggiunta della regione:', error);
            }
          });
        }
      },
      () => {}
    );
  }
}
