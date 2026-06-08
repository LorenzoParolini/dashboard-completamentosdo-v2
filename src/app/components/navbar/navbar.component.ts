import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  RouterLink,
  RouterLinkActive,
  Router,
  NavigationEnd,
} from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { FilterOffcanvasComponent } from './filter-offcanvas/filter-offcanvas.component';
import { FilterService } from '../../services/filter.service';
import { FilterCriteria } from '../../services/filter-utils.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    SearchbarComponent,
    FilterOffcanvasComponent,
    CommonModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isFilterOffcanvasOpen = false;
  currentView: 'D' | 'R' | 'C' | 'S' | 'A' | 'L' = 'D';
  activeFiltersCount = 0;
  filterResetVersion = 0;
  private filterSubscription: Subscription = new Subscription();
  private routeSubscription: Subscription = new Subscription();
  private currentRoutePath = '';

  constructor(
    private filterService: FilterService,
    private router: Router,
  ) {}

  ngOnInit() {
    const initialRoutePath = this.normalizeUrl(this.router.url);
    this.currentRoutePath = initialRoutePath;
    this.currentView = this.getViewFromUrl(initialRoutePath);

    // Subscribe ai cambiamenti dei filtri per contare quelli attivi
    this.filterSubscription = this.filterService.filters$.subscribe(
      (filters) => {
        this.activeFiltersCount = this.countActiveFilters(filters);
      },
    );

    // Reset automatico dei filtri quando cambia pagina (anche con back/forward)
    this.routeSubscription = this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
      )
      .subscribe((event) => {
        const nextRoutePath = this.normalizeUrl(event.urlAfterRedirects);
        const nextView = this.getViewFromUrl(nextRoutePath);

        this.currentView = nextView;

        if (nextRoutePath !== this.currentRoutePath) {
          this.resetFiltersOnNavigation();
          this.currentRoutePath = nextRoutePath;
        }
      });
  }

  ngOnDestroy() {
    this.filterSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
  }

  private getViewFromUrl(url: string): 'D' | 'R' | 'C' | 'S' | 'A' | 'L' {
    const normalizedUrl = this.normalizeUrl(url);

    if (normalizedUrl.startsWith('/regione')) return 'R';
    if (normalizedUrl.startsWith('/cliente')) return 'C';
    if (normalizedUrl.startsWith('/software')) return 'S';
    if (normalizedUrl.startsWith('/ambiente')) return 'A';
    if (normalizedUrl.startsWith('/rilascio')) return 'L';

    return 'D';
  }

  private normalizeUrl(url: string): string {
    return url.split('?')[0].split('#')[0];
  }

  private resetFiltersOnNavigation() {
    this.filterService.clearFilters();
    this.isFilterOffcanvasOpen = false;
    this.filterResetVersion++;
  }

  private switchView(view: 'D' | 'R' | 'C' | 'S' | 'A' | 'L') {
    if (this.currentView !== view) {
      this.currentView = view;
    }

    this.resetFiltersOnNavigation();
  }

  /**
   * Conta il numero di filtri attivi
   */
  private countActiveFilters(filters: FilterCriteria): number {
    let count = 0;

    if (filters.regioni && filters.regioni.length > 0) count++;
    if (filters.software && filters.software.length > 0) count++;
    if (filters.ambienti && filters.ambienti.length > 0) count++;
    if (filters.rilasci && filters.rilasci.length > 0) count++;
    if (filters.branch && filters.branch.trim() !== '') count++;
    if (filters.commit && filters.commit.trim() !== '') count++;
    if (filters.deployedBy && filters.deployedBy.trim() !== '') count++;
    if (filters.build && filters.build.trim() !== '') count++;
    if (filters.ultimoAggiornamento && filters.ultimoAggiornamento.length > 0)
      count++;
    if (filters.codiciRegione && filters.codiciRegione.length > 0) count++;
    if (filters.coordinate && filters.coordinate.length > 0) count++;
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
  }) {
    console.log('Filtri applicati:', filters);

    // Preserve the current search query when updating other filters
    const currentFilters = this.filterService.getCurrentFilters();

    this.filterService.updateFilters({
      ...filters,
      searchQuery: currentFilters.searchQuery,
    });
    this.isFilterOffcanvasOpen = false;
  }

  onClickDashboard() {
    this.switchView('D');
  }

  onClickRegione() {
    this.switchView('R');
  }

  onClickCliente() {
    this.switchView('C');
  }

  onClickSoftware() {
    this.switchView('S');
  }

  onClickAmbiente() {
    this.switchView('A');
  }

  onClickRilascio() {
    this.switchView('L');
  }
}
