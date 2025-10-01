import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Software as SoftwareModel, SoftwareDTO, SoftwareInputDTO } from '../../models/software.model';
import { SoftwareService } from '../../services/software.service';
import { FilterService } from '../../services/filter.service';
import { FilterUtilsService, FilterCriteria } from '../../services/filter-utils.service';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SoftwareModalComponent } from './software-modal/software-modal.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-software',
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent, NgbModule],
  templateUrl: './software.component.html',
  styleUrl: './software.component.css',
})
export class SoftwareComponent implements OnInit, OnDestroy {
  software: SoftwareModel[] = [];
  filteredSoftware: SoftwareModel[] = [];
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
    private softwareService: SoftwareService,
    private modalService: NgbModal,
    private filterService: FilterService,
    private filterUtilsService: FilterUtilsService
  ) {}

  ngOnInit(): void {
    console.log('Componente software inizializzato, caricamento software...');
    this.loadSoftware();
    
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
    this.filteredSoftware = this.software.filter(software => 
      this.filterUtilsService.shouldShowSoftware(software, this.currentFilters)
    );
  }

  shouldShowSoftware(software: SoftwareModel): boolean {
    return this.filterUtilsService.shouldShowSoftware(software, this.currentFilters);
  }

  // Carica software dal backend
  loadSoftware(): void {
    this.loading = true;
    this.error = null;
    
    const loadSub = this.softwareService.getAllSoftware().subscribe({
      next: (data: SoftwareModel[]) => {
        this.software = data;
        this.applyFilters();
        this.loading = false;
        console.log('Software caricati nel componente:', data);
      },
      error: (error: Error) => {
        this.error = error.message;
        this.loading = false;
        console.error('Errore nel caricamento software:', error);
      }
    });
    
    this.subscriptions.add(loadSub);
  }

  // Crea nuovo software (con oggetti completi)
  onCreateSoftware(softwareData: SoftwareDTO): void {
    const createSub = this.softwareService.createSoftware(softwareData).subscribe({
      next: (softwareCreato: SoftwareDTO) => {
        console.log('Software creato con successo:', softwareCreato);
        this.loadSoftware();
      },
      error: (error: Error) => {
        this.error = `Errore nella creazione: ${error.message}`;
        console.error('Errore creazione software:', error);
      }
    });
    
    this.subscriptions.add(createSub);
  }

  // Crea nuovo software (con solo ID per le relazioni)
  onCreateSoftwareWithIds(softwareData: SoftwareInputDTO): void {
    const createSub = this.softwareService.createSoftwareWithIds(softwareData).subscribe({
      next: (softwareCreato: SoftwareModel) => {
        console.log('Software creato con IDs con successo:', softwareCreato);
        this.loadSoftware();
      },
      error: (error: Error) => {
        this.error = `Errore nella creazione: ${error.message}`;
        console.error('Errore creazione software:', error);
      }
    });
    
    this.subscriptions.add(createSub);
  }

  // Aggiorna software
  onUpdateSoftware(id: number, softwareData: SoftwareDTO): void {
    const updateSub = this.softwareService.updateSoftware(id, softwareData).subscribe({
      next: (softwareAggiornato: SoftwareDTO) => {
        console.log('Software aggiornato con successo:', softwareAggiornato);
        this.loadSoftware();
      },
      error: (error: Error) => {
        this.error = `Errore nell'aggiornamento: ${error.message}`;
        console.error('Errore aggiornamento software:', error);
      }
    });
    
    this.subscriptions.add(updateSub);
  }

  // Refresh manuale
  onRefresh(): void {
    this.loadSoftware();
  }

  // TrackBy per performance
  trackBySoftwareId(index: number, software: SoftwareModel): number {
    return software.id;
  }

  onDeleteSoftware(id_software_da_eliminare: number) {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      backdrop: true,
      keyboard: true,
      centered: true,
      size: 'sm'
    });

    // Set modal properties
    modalRef.componentInstance.title = 'Attenzione!';
    modalRef.componentInstance.message = 'Sei sicuro di voler eliminare questo software? Questa azione non può essere annullata.';
    modalRef.componentInstance.confirmText = 'Elimina';
    modalRef.componentInstance.cancelText = 'Annulla';

    // Handle modal result
    modalRef.result.then(
      (confirmed: boolean) => {
        if (confirmed) {
          const deleteSub = this.softwareService.deleteSoftware(id_software_da_eliminare).subscribe({
            next: () => {
              console.log('Software eliminato con successo');
              this.loadSoftware();
            },
            error: (error: Error) => {
              this.error = `Errore nell'eliminazione: ${error.message}`;
              console.error('Errore eliminazione software:', error);
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

  openSoftwareModal(software?: SoftwareModel) {
    const modalRef = this.modalService.open(SoftwareModalComponent, {
      backdrop: true, // permette la chiusura cliccando fuori
      keyboard: true, // permette la chiusura con ESC
      centered: true, // centra la modale
      size: 'lg' // dimensione grande
    });
    if (software) {
      modalRef.componentInstance.software = software;
    }
    
    modalRef.result.then(
      (result: SoftwareModel) => {
        if (software) {
          const idx = this.software.findIndex((s) => s.id === result.id);
          if (idx !== -1) this.software[idx] = result;
        } else {
          this.software.push(result);
        }
        this.applyFilters(); // Riapplica i filtri dopo la modifica/aggiunta
      },
      () => {}
    );
  }
}
