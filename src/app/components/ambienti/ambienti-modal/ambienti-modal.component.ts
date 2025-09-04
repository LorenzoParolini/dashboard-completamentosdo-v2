import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Ambiente } from '../../../models/ambiente.model';
import { AmbientiService } from '../../../services/ambienti.service';


export interface AmbientiDialogData {
  ambiente?: Ambiente;
}



@Component({
  selector: 'app-ambienti-modal',
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './ambienti-modal.component.html',
  styleUrls: ['./ambienti-modal.component.css'],
  
})
export class AmbientiModalComponent implements OnInit {
  @Input() ambiente?: Ambiente;

  // Non inizializzare qui - fallo in ngOnInit
  nuovoAmbiente: Ambiente = {
    id: '',
    descrizione: '',
    note: '',
    dataCreazione: new Date()
  };

  
  constructor(public activeModal: NgbActiveModal, private ambientiService: AmbientiService) {
  }

  getLength(): number {
    return this.ambientiService.length();
  }

  ngOnInit() {
    if (this.ambiente) {
      this.nuovoAmbiente = {
        ...this.ambiente
      };
    } else {
      // Inizializza l'ID solo qui, quando il servizio è disponibile
      this.nuovoAmbiente.id = (this.getLength()+1).toString();
    }
  }

  salva() {
    if (!this.nuovoAmbiente.dataCreazione) {
      this.nuovoAmbiente.dataCreazione = new Date();
    }
    this.activeModal.close(this.nuovoAmbiente);
  }

  closeModal() {
    this.activeModal.dismiss();
  }
}
