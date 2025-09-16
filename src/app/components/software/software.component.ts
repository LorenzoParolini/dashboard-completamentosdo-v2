import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Software as SoftwareModel } from '../../models/software.model';
import { SoftwareService } from '../../services/software.service';
import { FilterService } from '../../services/filter.service';
import { FilterUtilsService, FilterCriteria } from '../../services/filter-utils.service';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SoftwareModalComponent } from './software-modal/software-modal.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-software',
  imports: [CommonModule, LoadingSpinnerComponent, NgbModule, SoftwareModalComponent, ConfirmationModalComponent],
  templateUrl: './software.component.html',
  styleUrl: './software.component.css',
})
export class SoftwareComponent implements OnInit, OnDestroy {
  software: SoftwareModel[] = [];
  filteredSoftware: SoftwareModel[] = [];
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
    private softwareService: SoftwareService,
    private modalService: NgbModal,
    private filterService: FilterService,
    private filterUtilsService: FilterUtilsService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.software = [];
    
    // Subscribe to filter changes
    this.filterSubscription = this.filterService.filters$.subscribe(filters => {
      this.currentFilters = filters;
      this.applyFilters();
    });

    setTimeout(() => {
      this.softwareService.getAllSoftware().subscribe((data) => {
        this.software = data;
        this.applyFilters();
        this.loading = false;
      });
    }, 1200);
  }

  ngOnDestroy() {
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

  onDeleteSoftware(id_software_da_eliminare: string) {
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
          this.softwareService.deleteSoftware(id_software_da_eliminare);
          this.software = this.software.filter(s => s.id !== id_software_da_eliminare);
          this.applyFilters(); // Riapplica i filtri dopo l'eliminazione
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
