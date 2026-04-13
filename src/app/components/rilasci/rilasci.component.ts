import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

import { Rilascio } from '../../models/rilascio.model';
import { Ambiente } from '../../models/ambiente.model';
import { Software } from '../../models/software.model';
import { RilasciService } from '../../services/rilasci.service';
import { AmbientiService } from '../../services/ambienti.service';
import { SoftwareService } from '../../services/software.service';
import { FilterService } from '../../services/filter.service';
import {
  FilterCriteria,
  FilterUtilsService,
} from '../../services/filter-utils.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { ServerErrorComponent } from '../server-error/server-error.component';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { RilasciModalComponent } from './rilasci-modal/rilasci-modal.component';

@Component({
  selector: 'app-rilasci',
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ServerErrorComponent,
    NgbModule,
  ],
  templateUrl: './rilasci.component.html',
  styleUrls: ['./rilasci.component.css'],
})
export class RilasciComponent implements OnInit, OnDestroy {
  rilasci: Rilascio[] = [];
  ambienti: Ambiente[] = [];
  software: Software[] = [];
  filteredRilasci: Rilascio[] = [];
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
    private rilasciService: RilasciService,
    private ambientiService: AmbientiService,
    private softwareService: SoftwareService,
    private modalService: NgbModal,
    private filterService: FilterService,
    private filterUtilsService: FilterUtilsService,
  ) {}

  ngOnInit(): void {
    this.loading = true;

    this.filterSubscription = this.filterService.filters$.subscribe(
      (filters) => {
        this.currentFilters = filters;
        this.applyFilters();
      },
    );

    setTimeout(() => {
      this.loadAmbienti();
      this.loadSoftware();
      this.loadRilasci();
    }, 1200);
  }

  ngOnDestroy(): void {
    this.filterSubscription.unsubscribe();
  }

  loadRilasci() {
    this.loading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.rilasciService.getAllRilasci().subscribe({
      next: (data) => {
        this.rilasci = data;
        this.applyFilters();
        this.loading = false;
        this.hasError = false;
      },
      error: (error) => {
        console.error('Errore nel caricamento dei rilasci:', error);
        this.loading = false;
        this.hasError = true;
        this.errorMessage =
          error.message || 'Impossibile raggiungere il server';
      },
    });
  }

  loadAmbienti() {
    this.ambientiService.getAllAmbienti().subscribe({
      next: (data) => {
        this.ambienti = data;
      },
      error: () => {
        this.ambienti = [];
      },
    });
  }

  loadSoftware() {
    this.softwareService.getAllSoftware().subscribe({
      next: (data) => {
        this.software = data;
      },
      error: () => {
        this.software = [];
      },
    });
  }

  applyFilters() {
    this.filteredRilasci = this.rilasci.filter((rilascio) =>
      this.filterUtilsService.shouldShowRilascio(rilascio, this.currentFilters),
    );
  }

  onDeleteRilascio(idRilascioDaEliminare: number) {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      backdrop: true,
      keyboard: true,
      centered: true,
      size: 'sm',
    });

    modalRef.componentInstance.title = 'Attenzione!';
    modalRef.componentInstance.message =
      'Sei sicuro di voler eliminare questo rilascio? Questa azione non può essere annullata.';
    modalRef.componentInstance.confirmText = 'Elimina';
    modalRef.componentInstance.cancelText = 'Annulla';

    modalRef.result.then(
      (confirmed: boolean) => {
        if (confirmed) {
          this.rilasciService.deleteRilascio(idRilascioDaEliminare).subscribe({
            next: () => {
              this.loadRilasci();
            },
            error: (error) => {
              console.error("Errore nell'eliminazione rilascio:", error);
            },
          });
        }
      },
      () => {},
    );
  }

  openRilascioModal(rilascio?: Rilascio) {
    const modalRef = this.modalService.open(RilasciModalComponent, {
      backdrop: true,
      keyboard: true,
      centered: true,
      size: 'lg',
    });

    if (rilascio) {
      modalRef.componentInstance.rilascio = rilascio;
    }

    modalRef.result.then(
      (result: Rilascio) => {
        const rilascioInputDTO = {
          branch: result.branch,
          commit: result.commit,
          deployedBy: result.deployedBy,
          ultimoAggiornamento: result.ultimoAggiornamento,
          build: result.build,
          note: result.note,
          versione: result.versione || result.versioneCorrente || '',
          softwareId: result.softwareId,
          clienteId: result.clienteId,
          ambienteId: result.ambienteId,
        };

        if (rilascio) {
          this.rilasciService
            .updateRilascio(result.id, rilascioInputDTO)
            .subscribe(() => {
              this.loadRilasci();
            });
        } else {
          this.rilasciService.addRilascio(rilascioInputDTO).subscribe(() => {
            this.loadRilasci();
          });
        }
      },
      () => {},
    );
  }

  retryLoadRilasci() {
    this.loadRilasci();
  }

  getAmbienteDescrizione(ambienteId: number): string {
    return (
      this.ambienti.find((ambiente) => ambiente.id === ambienteId)
        ?.descrizione || `ID ${ambienteId}`
    );
  }

  getSoftwareDescrizione(softwareId: number): string {
    return (
      this.software.find((software) => software.id === softwareId)
        ?.descrizione || `ID ${softwareId}`
    );
  }
}
