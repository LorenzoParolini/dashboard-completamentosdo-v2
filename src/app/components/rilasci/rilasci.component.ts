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
import { Cliente } from '../../models/cliente.model';
import { ClientiService } from '../../services/clienti.service';

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
  clienti: Cliente[] = [];

  filteredRilasci: Rilascio[] = [];
  groupedRilasci: {
    clienteId: number;
    clienteDescrizione: string;
    rilasci: Rilascio[];
  }[] = [];
  expandedClienti: Set<number> = new Set<number>();
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
    private clientiService: ClientiService,
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
      this.loadClienti();
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

  loadClienti() {
    this.clientiService.getAllClienti().subscribe({
      next: (data) => {
        this.clienti = data;
        this.buildGroupedRilasci();
      },
      error: () => {
        this.clienti = [];
      },
    });
  }

  applyFilters() {
    this.filteredRilasci = this.rilasci.filter((rilascio) =>
      this.filterUtilsService.shouldShowRilascio(rilascio, this.currentFilters),
    );

    this.buildGroupedRilasci();
  }

  buildGroupedRilasci() {
    const groupedMap = new Map<
      number,
      {
        clienteId: number;
        clienteDescrizione: string;
        rilasci: Rilascio[];
      }
    >();

    this.filteredRilasci.forEach((rilascio) => {
      if (!groupedMap.has(rilascio.clienteId)) {
        groupedMap.set(rilascio.clienteId, {
          clienteId: rilascio.clienteId,
          clienteDescrizione: this.getClienteDescrizione(rilascio.clienteId),
          rilasci: [],
        });
      }

      groupedMap.get(rilascio.clienteId)?.rilasci.push(rilascio);
    });

    this.groupedRilasci = Array.from(groupedMap.values()).sort((a, b) =>
      a.clienteDescrizione.localeCompare(b.clienteDescrizione),
    );

    this.expandedClienti.forEach((clienteId) => {
      if (!this.groupedRilasci.some((group) => group.clienteId === clienteId)) {
        this.expandedClienti.delete(clienteId);
      }
    });
  }

  toggleClienteGroup(clienteId: number) {
    if (this.expandedClienti.has(clienteId)) {
      this.expandedClienti.delete(clienteId);
      return;
    }

    this.expandedClienti.add(clienteId);
  }

  isClienteGroupExpanded(clienteId: number): boolean {
    return this.expandedClienti.has(clienteId);
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

  getClienteDescrizione(clienteId: number): string {
    return (
      this.clienti.find((cliente) => cliente.id === clienteId)?.descrizione ||
      'Cliente non disponibile'
    );
  }
}
