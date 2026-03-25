import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MinimizedModal } from '../../services/minimized-modals.service';

@Component({
  selector: 'app-minimized-modal-item',
  imports: [CommonModule],
  templateUrl: './minimized-modal-item.component.html',
  styleUrls: ['./minimized-modal-item.component.css'],
})
export class MinimizedModalItemComponent {
  @Input() modal!: MinimizedModal;
  @Output() restore = new EventEmitter<string>();
  @Output() close = new EventEmitter<string>();

  onRestore(): void {
    this.restore.emit(this.modal.id);
  }

  onClose(): void {
    this.close.emit(this.modal.id);
  }

  getTypeLabel(): string {
    return this.modal.type === 'add' ? 'A:' : 'M:';
  }

  getSectionLabel(): string {
    const sectionLabels: { [key: string]: string } = {
      regioni: 'Regioni',
      clienti: 'Clienti',
      software: 'Software',
      ambienti: 'Ambienti',
      rilasci: 'Rilasci',
    };
    return sectionLabels[this.modal.section] || this.modal.section;
  }
}
