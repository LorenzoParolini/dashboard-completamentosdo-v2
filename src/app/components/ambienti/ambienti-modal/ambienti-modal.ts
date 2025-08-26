import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Ambiente } from '../../../models/ambiente.model';

export interface AmbientiDialogData {
  ambiente?: Ambiente;
}

@Component({
  selector: 'app-ambienti-modal',
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './ambienti-modal.html',
  styleUrls: ['./ambienti-modal.css'],
  providers: [NgbActiveModal]
})
export class AmbientiModal implements OnInit {
  @Input() ambiente?: Ambiente;

  nuovoAmbiente: Ambiente = {
    id: '',
    descrizione: '',
    note: '',
    dataCreazione: new Date()
  };

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    if (this.ambiente) {
      this.nuovoAmbiente = {
        ...this.ambiente
      };
    }
  }

  salva() {
    if (!this.nuovoAmbiente.dataCreazione) {
      this.nuovoAmbiente.dataCreazione = new Date();
    }
    this.activeModal.close(this.nuovoAmbiente);
  }

  closeModal() {
    this.activeModal.close();
  }
}
