import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { FilterOffcanvasComponent } from './filter-offcanvas/filter-offcanvas.component';
import { FilterService } from '../../services/filter.service';
import { FilterCriteria } from '../../services/filter-utils.service';
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, SearchbarComponent, FilterOffcanvasComponent, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isFilterOffcanvasOpen = false;
  currentView: 'D' | 'R' | 'C' | 'S' | 'A' = 'D';
  activeFiltersCount = 0;
  isDarkTheme = false;
  private filterSubscription: Subscription = new Subscription();
  private themeSubscription: Subscription = new Subscription();

  constructor(
    private filterService: FilterService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    // Subscribe ai cambiamenti dei filtri per contare quelli attivi
    this.filterSubscription = this.filterService.filters$.subscribe(filters => {
      this.activeFiltersCount = this.countActiveFilters(filters);
    });

    // Subscribe ai cambiamenti del tema
    this.themeSubscription = this.themeService.darkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
    });
  }

  ngOnDestroy() {
    this.filterSubscription.unsubscribe();
    this.themeSubscription.unsubscribe();
  }

  /**
   * Conta il numero di filtri attivi
   */
  private countActiveFilters(filters: FilterCriteria): number {
    let count = 0;
    
    if (filters.regioni && filters.regioni.length > 0) count++;
    if (filters.software && filters.software.length > 0) count++;
    if (filters.ambienti && filters.ambienti.length > 0) count++;
    if (filters.codiciRegione && filters.codiciRegione.length > 0) count++;
    if (filters.coordinate && filters.coordinate.length > 0) count++;
    if (filters.versione && filters.versione.trim() !== '') count++;
    if (filters.dataAggiornamento && filters.dataAggiornamento.length > 0) count++;
    if (filters.dataCreazione && filters.dataCreazione.length > 0) count++;
    
    return count;
  }

  toggleMenu() {
    // Logica per aprire/chiudere il menu
    console.log('Menu toggled');
  }

  openFilterOffcanvas() {
    this.isFilterOffcanvasOpen = true;
  }

  closeFilterOffcanvas() {
    this.isFilterOffcanvasOpen = false;
  }

  onFiltersApplied(filters: {
    regioni: number[], 
    software: number[], 
    ambienti: number[],
    codiciRegione: string[],
    coordinate: { x: number, y: number }[],
    versione: string,
    dataAggiornamento: { inizio: Date, fine: Date }[],
    dataCreazione: { inizio: Date, fine: Date }[]
  }) {
    console.log('Filtri applicati:', filters);
    
    // Preserve the current search query when updating other filters
    const currentFilters = this.filterService.getCurrentFilters();
    
    this.filterService.updateFilters({
      ...filters,
      searchQuery: currentFilters.searchQuery
    });
    this.isFilterOffcanvasOpen = false;
  }

  onClickDashboard() {
    this.currentView = 'D';
    this.refreshPage();
  }

  onClickRegione() {
    this.currentView = 'R';
    this.refreshPage();
  }

  onClickCliente() {
    this.currentView = 'C';
    this.refreshPage();
  }

  onClickSoftware() {
    this.currentView = 'S';
    this.refreshPage();
  }

  onClickAmbiente() {
    this.currentView = 'A';
    this.refreshPage();
  }

  /**
   * Refresh della pagina del browser
   */
  private refreshPage(): void {
    // Piccolo delay per permettere alla navigazione di completarsi
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  /**
   * Toggle del tema scuro
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}