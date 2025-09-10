import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-filter-offcanvas',
  imports: [],
  templateUrl: './filter-offcanvas.component.html',
  styleUrl: './filter-offcanvas.component.css',
})
export class FilterOffcanvasComponent { 
  @Input() isOpen: boolean = false;
  @Output() onClose = new EventEmitter<void>();

  closeOffcanvas() {
    this.onClose.emit();
  }
}
