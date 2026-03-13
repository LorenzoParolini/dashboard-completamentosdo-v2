import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterService } from '../../../services/filter.service';

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.component.css',
})
export class SearchbarComponent implements OnChanges {
  @Input() currentView: string = 'D';
  @Input() resetVersion: number = 0;
  searchQuery: string = '';

  constructor(private filterService: FilterService) {}

  ngOnChanges(changes: SimpleChanges): void {
    // Cancella la ricerca quando si cambia sezione
    if (changes['currentView'] && !changes['currentView'].firstChange) {
      this.searchQuery = '';
      this.filterService.updateSearchQuery('');
    }

    if (changes['resetVersion'] && !changes['resetVersion'].firstChange) {
      this.searchQuery = '';
    }
  }

  get placeholder(): string {
    switch (this.currentView) {
      case 'R':
        return 'Cerca regioni per nome...';
      case 'C':
        return 'Cerca clienti per nome...';
      case 'S':
        return 'Cerca software per nome...';
      case 'A':
        return 'Cerca ambienti per nome...';
      case 'D':
      default:
        return 'Cerca clienti per nome...';
    }
  }

  onSearchChange(): void {
    this.filterService.updateSearchQuery(this.searchQuery);
  }

  onSearchSubmit(): void {
    this.filterService.updateSearchQuery(this.searchQuery);
  }
}
