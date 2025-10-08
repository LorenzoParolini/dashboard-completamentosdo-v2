import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

export interface ConfirmationModalConfig {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  icon?: 'warning' | 'info' | 'danger';
}

@Component({
  selector: 'app-confirmation-modal',
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html',
  styleUrl: './confirmation-modal.component.css',
})
export class ConfirmationModalComponent {
  @Input() title: string = 'Attenzione!';
  @Input() message: string = 'Sei sicuro di voler eliminare questo elemento?';
  @Input() confirmText: string = 'Elimina';
  @Input() cancelText: string = 'Annulla';
  @Input() confirmButtonClass: string = 'btn-danger';

  constructor(public activeModal: NgbActiveModal) {}

  onConfirm() {
    this.activeModal.close(true);
  }

  onCancel() {
    this.activeModal.dismiss(false);
  }

  onClose() {
    this.activeModal.dismiss(false);
  }
}