import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Regione } from '../../../models/regione.model';

export interface DialogData {
  regione?: Regione;
}


@Component({
  selector: 'app-regioni-modal',
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './regioni-modal.html',
  styleUrls: ['./regioni-modal.css'],
  providers: [NgbActiveModal]
})
export class RegioniModal implements OnInit {
  @Input() regione?: Regione;

  nuovaRegione: Regione = {
    id: '',
    descrizione: '',
    codice: '',
    coordinate: { x: 0, y: 0 }
  };

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    if (this.regione) {
      this.nuovaRegione = {
        ...this.regione,
        coordinate: {
          x: this.regione.coordinate?.x ?? 0,
          y: this.regione.coordinate?.y ?? 0
        }
      };
    }
    
    if (!this.nuovaRegione.coordinate) {
      this.nuovaRegione.coordinate = { x: 0, y: 0 };
    }
  }

  salva() {
    // Assicuriamoci che coordinate sia sempre definito prima del salvataggio
    if (!this.nuovaRegione.coordinate) {
      this.nuovaRegione.coordinate = { x: 0, y: 0 };
    }
    this.activeModal.close(this.nuovaRegione);
    console.log('Modale chiusa con salvataggio');
  }

  closeModal() {
    this.activeModal.close();
    console.log('Modale chiusa senza salvare');
  }

}
