import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SearchbarComponent } from './searchbar/searchbar.component';
import { FilterOffcanvasComponent } from '../filter-offcanvas/filter-offcanvas.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, SearchbarComponent, FilterOffcanvasComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isFilterOffcanvasOpen = false;

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
}