import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FilterCriteria } from './filter-utils.service';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private filtersSubject = new BehaviorSubject<FilterCriteria>({
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
  });

  public filters$: Observable<FilterCriteria> =
    this.filtersSubject.asObservable();

  constructor() {}

  /**
   * Aggiorna i filtri globali
   */
  updateFilters(filters: FilterCriteria): void {
    this.filtersSubject.next(filters);
  }

  /**
   * Ottiene i filtri correnti
   */
  getCurrentFilters(): FilterCriteria {
    return this.filtersSubject.value;
  }

  /**
   * Resetta tutti i filtri
   */
  clearFilters(): void {
    this.filtersSubject.next({
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
    });
  }

  /**
   * Aggiorna solo la query di ricerca
   */
  updateSearchQuery(searchQuery: string): void {
    const currentFilters = this.getCurrentFilters();
    this.updateFilters({
      ...currentFilters,
      searchQuery: searchQuery,
    });
  }

  /**
   * Verifica se ci sono filtri attivi
   */
  hasActiveFilters(): boolean {
    const filters = this.getCurrentFilters();
    return (
      filters.regioni.length > 0 ||
      filters.software.length > 0 ||
      filters.ambienti.length > 0 ||
      filters.rilasci.length > 0 ||
      filters.branch.trim() !== '' ||
      filters.commit.trim() !== '' ||
      filters.deployedBy.trim() !== '' ||
      filters.build.trim() !== '' ||
      filters.ultimoAggiornamento.length > 0 ||
      filters.codiciRegione.length > 0 ||
      filters.coordinate.length > 0 ||
      filters.dataCreazione.length > 0 ||
      filters.searchQuery.trim() !== ''
    );
  }
}
