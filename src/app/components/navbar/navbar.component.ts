import { Component, Input, OnInit, OnDestroy } from '@angular/core';
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
import { ThemeService } from '../../services/theme.service';
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
  currentView: 'D' | 'R' | 'C' | 'S' | 'A' = 'D';
  activeFiltersCount = 0;
  isDarkTheme = false;
  filterResetVersion = 0;
  private filterSubscription: Subscription = new Subscription();
  private themeSubscription: Subscription = new Subscription();
  private routeSubscription: Subscription = new Subscription();
  private currentRoutePath = '';

  constructor(
    private filterService: FilterService,
    private themeService: ThemeService,
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

    // Subscribe ai cambiamenti del tema
    this.themeSubscription = this.themeService.darkTheme$.subscribe(
      (isDark) => {
        this.isDarkTheme = isDark;
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
    this.themeSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
  }

  private getViewFromUrl(url: string): 'D' | 'R' | 'C' | 'S' | 'A' {
    const normalizedUrl = this.normalizeUrl(url);

    if (normalizedUrl.startsWith('/regione')) return 'R';
    if (normalizedUrl.startsWith('/cliente')) return 'C';
    if (normalizedUrl.startsWith('/software')) return 'S';
    if (normalizedUrl.startsWith('/ambiente')) return 'A';

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

  private switchView(view: 'D' | 'R' | 'C' | 'S' | 'A') {
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
    if (filters.codiciRegione && filters.codiciRegione.length > 0) count++;
    if (filters.coordinate && filters.coordinate.length > 0) count++;
    if (filters.versione && filters.versione.trim() !== '') count++;
    if (filters.dataAggiornamento && filters.dataAggiornamento.length > 0)
      count++;
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
    codiciRegione: string[];
    coordinate: { x: number; y: number }[];
    versione: string;
    dataAggiornamento: { inizio: Date; fine: Date }[];
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

  /**
   * Toggle del tema scuro
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
