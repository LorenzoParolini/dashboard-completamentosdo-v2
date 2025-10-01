import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cliente } from '../../../models/cliente.model';
import { Software } from '../../../models/software.model';
import { Ambiente } from '../../../models/ambiente.model';

@Component({
  selector: 'app-details-modal',
  imports: [CommonModule],
  templateUrl: './details-modal.component.html',
  styleUrl: './details-modal.component.css'
})
export class DetailsModalComponent {
  @Input() cliente: Cliente | null = null;
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal.emit();
    }
  }

  onCloseClick() {
    this.closeModal.emit();
  }

  trackBySoftwareId(index: number, software: Software): number {
    return software.id;
  }

  trackByAmbienteId(index: number, ambiente: Ambiente): number {
    return ambiente.id;
  }
}
