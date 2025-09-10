import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from './components/navbar/navbar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FilterOffcanvasComponent } from './components/filter-offcanvas/filter-offcanvas.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, NgbModule, FilterOffcanvasComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  protected title = 'dashboard-project';
}
