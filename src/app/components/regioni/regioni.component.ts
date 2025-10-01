import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Regione, RegioneDTO } from '../../models/regione.model';
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
    private regioniService: RegioniService,
    private modalService: NgbModal,
    private filterService: FilterService,
    private filterUtilsService: FilterUtilsService
  ) {}

  ngOnInit(): void {
    console.log('Componente regioni inizializzato, caricamento regioni...');
    this.loadRegioni();
    
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
    this.filteredRegioni = this.regioni.filter(regione => 
      this.filterUtilsService.shouldShowRegione(regione, this.currentFilters)
    );
  }

  shouldShowRegione(regione: Regione): boolean {
    return this.filterUtilsService.shouldShowRegione(regione, this.currentFilters);
  }

  // Carica regioni dal backend
  loadRegioni(): void {
    this.loading = true;
    this.error = null;
    
    const loadSub = this.regioniService.getAllRegioni().subscribe({
      next: (data: Regione[]) => {
        this.regioni = data;
        this.applyFilters();
        this.loading = false;
        console.log('Regioni caricate nel componente:', data);
      },
      error: (error: Error) => {
        this.error = error.message;
        this.loading = false;
        console.error('Errore nel caricamento regioni:', error);
      }
    });
    
    this.subscriptions.add(loadSub);
  }

  // Crea nuova regione
  onCreateRegione(regioneData: { descrizione: string; codice: string }): void {
    const nuovaRegione: RegioneDTO = {
      descrizione: regioneData.descrizione,
      codice: regioneData.codice
    };

    const createSub = this.regioniService.createRegione(nuovaRegione).subscribe({
      next: (regioneCreata: RegioneDTO) => {
        console.log('Regione creata con successo:', regioneCreata);
        this.loadRegioni();
      },
      error: (error: Error) => {
        this.error = `Errore nella creazione: ${error.message}`;
        console.error('Errore creazione regione:', error);
      }
    });
    
    this.subscriptions.add(createSub);
  }

  // Aggiorna regione
  onUpdateRegione(id: number, regioneData: { descrizione: string; codice: string }): void {
    const regioneAggiornata: RegioneDTO = {
      descrizione: regioneData.descrizione,
      codice: regioneData.codice
    };

    const updateSub = this.regioniService.updateRegione(id, regioneAggiornata).subscribe({
      next: (regioneAggiornata: RegioneDTO) => {
        console.log('Regione aggiornata con successo:', regioneAggiornata);
        this.loadRegioni();
      },
      error: (error: Error) => {
        this.error = `Errore nell'aggiornamento: ${error.message}`;
        console.error('Errore aggiornamento regione:', error);
      }
    });
    
    this.subscriptions.add(updateSub);
  }

  // Refresh manuale
  onRefresh(): void {
    this.loadRegioni();
  }

  // TrackBy per performance
  trackByRegioneId(index: number, regione: Regione): number {
    return regione.id;
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
          const deleteSub = this.regioniService.deleteRegione(id_regione_da_eliminare).subscribe({
            next: () => {
              console.log('Regione eliminata con successo');
              this.loadRegioni();
            },
            error: (error: Error) => {
              this.error = `Errore nell'eliminazione: ${error.message}`;
              console.error('Errore eliminazione regione:', error);
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
          // Modifica: aggiorna la regione nella lista
          const idx = this.regioni.findIndex((r) => r.id === result.id);
          if (idx !== -1) this.regioni[idx] = result;
        } else {
          // Aggiunta: aggiungi la nuova regione
          this.regioni.push(result);
        }
        this.applyFilters(); // Riapplica i filtri dopo la modifica/aggiunta
      },
      () => {}
    );
  }
}
