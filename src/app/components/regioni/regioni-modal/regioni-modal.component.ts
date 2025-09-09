import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Regione } from '../../../models/regione.model';
import { RegioniService } from '../../../services/regioni.service';

export interface DialogData {
  regione?: Regione;
}


@Component({
  selector: 'app-regioni-modal',
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './regioni-modal.component.html',
  styleUrls: ['./regioni-modal.component.css'],
})
export class RegioniModalComponent implements OnInit {
  @Input() regione?: Regione;

  nuovaRegione: Regione = {
    id: '',
    descrizione: '',
    codice: '',
    coordinate: { x: 0, y: 0 }
  };

  constructor(public activeModal: NgbActiveModal, private regioniService: RegioniService) {
  }

  getLength(): number {
    return this.regioniService.length();
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
    } else {
      // Inizializza l'ID solo qui, quando il servizio è disponibile
      this.nuovaRegione.id = (this.getLength() + 1).toString();
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
    this.activeModal.dismiss();
    console.log('Modale chiusa senza salvare');
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

}
