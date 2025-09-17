import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from './components/navbar/navbar.component';
import { MinimizedModalsBarComponent } from './components/minimized-modals-bar/minimized-modals-bar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, MinimizedModalsBarComponent, NgbModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  protected title = 'dashboard-project';

  constructor(private themeService: ThemeService) {
    // Il ThemeService si inizializza automaticamente nel costruttore
  }
}
