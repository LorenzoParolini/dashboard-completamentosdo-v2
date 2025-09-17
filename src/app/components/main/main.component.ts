import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ClientiService } from '../../services/clienti.service';
import { FilterService } from '../../services/filter.service';
import { FilterUtilsService, FilterCriteria } from '../../services/filter-utils.service';
import { Cliente } from '../../models/cliente.model';

import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { DetailsModalComponent } from './details-modal/details-modal.component';

@Component({
  selector: 'app-main',
  imports: [CommonModule, LoadingSpinnerComponent, EmptyStateComponent, DetailsModalComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit, OnDestroy {
  clienti: Cliente[] = [];
  filteredClienti: Cliente[] = [];
  selectedCliente: Cliente | null = null;
  loading: boolean = true;
  isModalOpen: boolean = false;
  modalCliente: Cliente | null = null;
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
    private clientiService: ClientiService,
    private filterService: FilterService,
    private filterUtilsService: FilterUtilsService
  ) {}

  ngOnInit() {
    this.loading = true;
    
    // Subscribe to filter changes
    this.filterSubscription = this.filterService.filters$.subscribe(filters => {
      this.currentFilters = filters;
      this.applyFilters();
    });

    setTimeout(() => {
      this.loadClienti();
    }, 1200); // 1.2s delay for loading effect
  }

  ngOnDestroy() {
    this.filterSubscription.unsubscribe();
  }

  loadClienti() {
    this.clientiService.getAllClienti().subscribe(
      (data) => {
        this.clienti = data;
        this.applyFilters();
        this.loading = false;
      }
    );
  }

  applyFilters() {
    this.filteredClienti = this.clienti.filter(cliente => 
      this.filterUtilsService.shouldShowCliente(cliente, this.currentFilters)
    );
  }

  shouldShowCliente(cliente: Cliente): boolean {
    return this.filterUtilsService.shouldShowCliente(cliente, this.currentFilters);
  }

  showDetails(cliente: Cliente) {
    this.selectedCliente = cliente;
  }

  openModal(cliente: Cliente) {
    this.modalCliente = cliente;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.modalCliente = null;
  }
}
