import { Injectable } from '@angular/core';
import { Regione } from '../models/regione.model';
import { Software } from '../models/software.model';
import { Ambiente } from '../models/ambiente.model';
import { Cliente } from '../models/cliente.model';
import { Rilascio } from '../models/rilascio.model';

export interface FilterCriteria {
  regioni: number[];
  software: number[];
  ambienti: number[];
  rilasci: number[];
  branch: string;
  commit: string;
  deployedBy: string;
  build: string;
  ultimoAggiornamento: { inizio: Date; fine: Date }[];
  codiciRegione: string[];
  coordinate: { x: number; y: number }[];
  dataCreazione: { inizio: Date; fine: Date }[];
  searchQuery: string;
}

@Injectable({
  providedIn: 'root',
})
export class FilterUtilsService {
  constructor() {}

  /**
   * Funzione unificata per la ricerca nella descrizione
   * Funziona per tutti i tipi di entità (Cliente, Regione, Software, Ambiente)
   */
  matchesSearchQuery(
    item: Cliente | Regione | Software | Ambiente | Rilascio,
    searchQuery: string,
  ): boolean {
    if (!searchQuery || searchQuery.trim() === '') {
      return true;
    }

    const normalizedQuery = searchQuery.toLowerCase().trim();
    const description =
      (
        item as Cliente | Regione | Software | Ambiente
      ).descrizione?.toLowerCase() ||
      (item as Rilascio).versioneCorrente?.toLowerCase() ||
      '';

    return description.includes(normalizedQuery);
  }

  /**
   * Verifica se una regione dovrebbe essere mostrata in base ai filtri applicati
   */
  shouldShowRegione(regione: Regione, filters: FilterCriteria): boolean {
    if (!filters) return true;

    if (!regione) {
      const hasRegioneConstraints =
        (filters.searchQuery && filters.searchQuery.trim() !== '') ||
        (filters.regioni && filters.regioni.length > 0) ||
        (filters.codiciRegione && filters.codiciRegione.length > 0) ||
        (filters.coordinate && filters.coordinate.length > 0);

      return !hasRegioneConstraints;
    }

    // Filtro per ricerca nella descrizione
    if (!this.matchesSearchQuery(regione, filters.searchQuery)) {
      return false;
    }

    // Filtro per ID regione
    if (filters.regioni && filters.regioni.length > 0) {
      if (!filters.regioni.includes(regione.id)) {
        return false;
      }
    }

    // Filtro per codice regione
    if (filters.codiciRegione && filters.codiciRegione.length > 0) {
      if (!filters.codiciRegione.includes(regione.codice)) {
        return false;
      }
    }

    // Filtro per coordinate
    if (filters.coordinate && filters.coordinate.length > 0) {
      const hasMatchingCoordinate = filters.coordinate.some(
        (filterCoord) =>
          regione.x === filterCoord.x && regione.y === filterCoord.y,
      );
      if (!hasMatchingCoordinate) {
        return false;
      }
    }

    return true;
  }

  /**
   * Verifica se un software dovrebbe essere mostrato in base ai filtri applicati
   */
  shouldShowSoftware(software: Software, filters: FilterCriteria): boolean {
    if (!filters) return true;

    const ambienti = software.ambienti || [];

    // Filtro per ricerca nella descrizione
    if (!this.matchesSearchQuery(software, filters.searchQuery)) {
      return false;
    }

    // Filtro per ID software
    if (filters.software && filters.software.length > 0) {
      if (!filters.software.includes(software.id)) {
        return false;
      }
    }

    // Filtro per ambienti associati
    if (filters.ambienti && filters.ambienti.length > 0) {
      const hasMatchingAmbiente = ambienti.some((ambiente) =>
        filters.ambienti.includes(ambiente.id),
      );
      if (!hasMatchingAmbiente) {
        return false;
      }
    }

    return true;
  }

  /**
   * Verifica se un ambiente dovrebbe essere mostrato in base ai filtri applicati
   */
  shouldShowAmbiente(ambiente: Ambiente, filters: FilterCriteria): boolean {
    if (!filters) return true;

    // Filtro per ricerca nella descrizione
    if (!this.matchesSearchQuery(ambiente, filters.searchQuery)) {
      return false;
    }

    // Filtro per ID ambiente
    if (filters.ambienti && filters.ambienti.length > 0) {
      if (!filters.ambienti.includes(ambiente.id)) {
        return false;
      }
    }

    // Filtro per data creazione
    if (filters.dataCreazione && filters.dataCreazione.length > 0) {
      const ambienteDate = new Date(ambiente.dataCreazione);
      const isInDateRange = filters.dataCreazione.some(
        (dateRange) =>
          ambienteDate >= dateRange.inizio && ambienteDate <= dateRange.fine,
      );
      if (!isInDateRange) {
        return false;
      }
    }

    return true;
  }

  /**
   * Verifica se un rilascio dovrebbe essere mostrato in base ai filtri applicati
   */
  shouldShowRilascio(rilascio: Rilascio, filters: FilterCriteria): boolean {
    if (!filters) return true;

    if (!this.matchesSearchQuery(rilascio, filters.searchQuery)) {
      return false;
    }

    if (filters.rilasci && filters.rilasci.length > 0) {
      if (!filters.rilasci.includes(rilascio.id)) {
        return false;
      }
    }

    const branchFilter = (filters.branch || '').trim().toLowerCase();
    if (
      branchFilter &&
      !(rilascio.branch || '').toLowerCase().includes(branchFilter)
    ) {
      return false;
    }

    const commitFilter = (filters.commit || '').trim().toLowerCase();
    if (
      commitFilter &&
      !(rilascio.commit || '').toLowerCase().includes(commitFilter)
    ) {
      return false;
    }

    const deployedByFilter = (filters.deployedBy || '').trim().toLowerCase();
    if (
      deployedByFilter &&
      !(rilascio.deployedBy || '').toLowerCase().includes(deployedByFilter)
    ) {
      return false;
    }

    const buildFilter = (filters.build || '').trim().toLowerCase();
    if (
      buildFilter &&
      !(rilascio.build || '').toLowerCase().includes(buildFilter)
    ) {
      return false;
    }

    if (filters.ultimoAggiornamento && filters.ultimoAggiornamento.length > 0) {
      const rilascioDate = new Date(rilascio.ultimoAggiornamento);
      const isInDateRange = filters.ultimoAggiornamento.some(
        (dateRange) =>
          rilascioDate >= dateRange.inizio && rilascioDate <= dateRange.fine,
      );
      if (!isInDateRange) {
        return false;
      }
    }

    return true;
  }

  /**
   * Verifica se un cliente dovrebbe essere mostrato in base ai filtri applicati
   */
  shouldShowCliente(cliente: Cliente, filters: FilterCriteria): boolean {
    if (!filters) return true;

    const softwareList = cliente.software || [];

    // Filtro per ricerca nella descrizione del cliente
    if (!this.matchesSearchQuery(cliente, filters.searchQuery)) {
      return false;
    }

    // Filtro per regione del cliente (senza applicare searchQuery alla regione)
    const regionFilters = { ...filters, searchQuery: '' };
    if (!this.shouldShowRegione(cliente.regione, regionFilters)) {
      return false;
    }

    // Filtro per software del cliente
    if (filters.software && filters.software.length > 0) {
      const hasMatchingSoftware = softwareList.some((software) =>
        filters.software.includes(software.id),
      );
      if (!hasMatchingSoftware) {
        return false;
      }
    }

    // Filtro per ambienti dei software del cliente
    if (filters.ambienti && filters.ambienti.length > 0) {
      const hasMatchingAmbiente = softwareList.some((software) =>
        (software.ambienti || []).some((ambiente) =>
          filters.ambienti.includes(ambiente.id),
        ),
      );
      if (!hasMatchingAmbiente) {
        return false;
      }
    }

    // Filtro per data creazione ambienti
    if (filters.dataCreazione && filters.dataCreazione.length > 0) {
      const hasMatchingCreationDate = softwareList.some((software) =>
        (software.ambienti || []).some((ambiente) => {
          const ambienteDate = new Date(ambiente.dataCreazione);
          return filters.dataCreazione.some(
            (dateRange) =>
              ambienteDate >= dateRange.inizio &&
              ambienteDate <= dateRange.fine,
          );
        }),
      );
      if (!hasMatchingCreationDate) {
        return false;
      }
    }

    return true;
  }

  /**
   * Funzione generica che determina quale metodo di filtro utilizzare
   */
  shouldShow(
    item: Regione | Software | Ambiente | Cliente | Rilascio,
    filters: FilterCriteria,
    itemType: 'regione' | 'software' | 'ambiente' | 'cliente' | 'rilascio',
  ): boolean {
    switch (itemType) {
      case 'regione':
        return this.shouldShowRegione(item as Regione, filters);
      case 'software':
        return this.shouldShowSoftware(item as Software, filters);
      case 'ambiente':
        return this.shouldShowAmbiente(item as Ambiente, filters);
      case 'cliente':
        return this.shouldShowCliente(item as Cliente, filters);
      case 'rilascio':
        return this.shouldShowRilascio(item as Rilascio, filters);
      default:
        return true;
    }
  }
}
