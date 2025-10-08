import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Regione } from '../../models/regione.model';
import { RegioniService } from '../../services/regioni.service';
import { FilterService } from '../../services/filter.service';
import { FilterUtilsService, FilterCriteria } from '../../services/filter-utils.service';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { ServerErrorComponent } from '../server-error/server-error.component';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RegioniModalComponent } from './regioni-modal/regioni-modal.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-regioni',
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent, ServerErrorComponent, NgbModule],
  templateUrl: './regioni.component.html',
  styleUrl: './regioni.component.css',
})
export class RegioniComponent implements OnInit, OnDestroy {
  regioni: Regione[] = [];
  filteredRegioni: Regione[] = [];
  loading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';
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

    this.loadRegioni();
  }

  loadRegioni() {
    this.loading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.regioniService.getAllRegioni().subscribe({
      next: (data) => {
        this.regioni = data;
        this.applyFilters();
        this.loading = false;
        this.hasError = false;
      },
      error: (error) => {
        console.error('Errore nel caricamento delle regioni:', error);
        this.loading = false;
        this.hasError = true;
        this.errorMessage = error.message || 'Impossibile raggiungere il server';
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
              console.log('Regione eliminata con successo');
              // Ricarica la lista aggiornata
              this.regioniService.getAllRegioni().subscribe((data) => {
                this.regioni = data;
                this.applyFilters();
              });
            },
            error: (error) => {
              console.error('Errore nell\'eliminazione regione:', error);
              // Gestisci l'errore (es. mostra un messaggio)
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
          // Modifica: converti in InputDTO e passa l'ID
          const regioneInputDTO = {
            descrizione: result.descrizione,
            codice: result.codice,
            x: result.x,
            y: result.y
          };
          this.regioniService.updateRegione(result.id, regioneInputDTO).subscribe(() => {
            // Ricarica la lista dalle regioni aggiornate
            this.regioniService.getAllRegioni().subscribe((data) => {
              this.regioni = data;
              this.applyFilters();
            });
          });
        } else {
          // Aggiunta: converti in InputDTO e usa il servizio per aggiungere
          const regioneInputDTO = {
            descrizione: result.descrizione,
            codice: result.codice,
            x: result.x,
            y: result.y
          };
          this.regioniService.addRegione(regioneInputDTO).subscribe(() => {
            // Ricarica la lista dalle regioni aggiornate
            this.regioniService.getAllRegioni().subscribe((data) => {
              this.regioni = data;
              this.applyFilters();
            });
          });
        }
      },
      () => {}
    );
  }

  retryLoadRegioni() {
    this.loadRegioni();
  }
}
