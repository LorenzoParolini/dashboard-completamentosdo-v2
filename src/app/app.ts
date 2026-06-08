import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from './components/navbar/navbar.component';
import { MinimizedModalsBarComponent } from './components/minimized-modals-bar/minimized-modals-bar.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavbarComponent,
    MinimizedModalsBarComponent,
    NgbModule,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent implements OnInit {
  protected title = 'dashboard-project';

  ngOnInit(): void {
    // Applica il tema scuro come unico tema
    document.documentElement.classList.add('dark');
  }
}
