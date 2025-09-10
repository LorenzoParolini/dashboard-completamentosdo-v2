import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { FilterOffcanvasComponent } from './filter-offcanvas/filter-offcanvas.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, SearchbarComponent, FilterOffcanvasComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isFilterOffcanvasOpen = false;
  currentView: 'D' | 'R' | 'C' | 'S' | 'A' = 'D';

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

  onFiltersApplied(filters: {regioni: string[], software: string[], ambienti: string[]}) {
    console.log('Filtri applicati:', filters);
    // Qui puoi implementare la logica per applicare i filtri ai dati
    this.isFilterOffcanvasOpen = false;
  }

  onClickDashboard() {
    this.currentView = 'D';
  }

  onClickRegione() {
    this.currentView = 'R';
  }

  onClickCliente() {
    this.currentView = 'C';
  }

  onClickSoftware() {
    this.currentView = 'S';
  }

  onClickAmbiente() {
    this.currentView = 'A';
  }
}