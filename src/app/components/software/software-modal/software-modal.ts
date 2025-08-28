import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Software } from '../../../models/software.model';
import { Ambiente } from '../../../models/ambiente.model';
import { SoftwareService } from '../../../services/software';
import { AmbientiService } from '../../../services/ambienti';

export interface SoftwareDialogData {
  software?: Software;
}

@Component({
  selector: 'app-software-modal',
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './software-modal.html',
  styleUrls: ['./software-modal.css'],
})
export class SoftwareModal implements OnInit {
  @Input() software?: Software;

  nuovoSoftware: Software = {
    id: '',
    descrizione: '',
    note: '',
    ambienti: [],
    versioneCorrente: '',
    dataUltimoAggiornamento: new Date()
  };

  // Campo per il menu a tendina
  ambienteSelezionatoId: string = '';

  // Mock data per le select
  ambientiDisponibili: Ambiente[] = [];

  constructor(public activeModal: NgbActiveModal, private softwareService: SoftwareService, private ambientiService: AmbientiService) {
  }

  getLength(): number {
    return this.softwareService.length();
  }

  ngOnInit() {
    // Carica gli ambienti dal servizio
    this.ambientiService.getAllAmbienti().subscribe(ambienti => {
      this.ambientiDisponibili = ambienti;
    });

    if (this.software) {
      this.nuovoSoftware = {
        ...this.software,
        ambienti: [...this.software.ambienti]
      };
      // Se c'è un ambiente già selezionato, imposta l'ID
      if (this.software.ambienti.length > 0) {
        this.ambienteSelezionatoId = this.software.ambienti[0].id;
      }
    } else {
      // Inizializza l'ID solo qui, quando il servizio è disponibile
      this.nuovoSoftware.id = (this.getLength() + 1).toString();
    }
  }

  salva() {
    if (!this.nuovoSoftware.dataUltimoAggiornamento) {
      this.nuovoSoftware.dataUltimoAggiornamento = new Date();
    }
    
    // Converte l'ambiente selezionato nell'array di ambienti
    if (this.ambienteSelezionatoId) {
      const ambienteSelezionato = this.ambientiDisponibili.find(a => a.id === this.ambienteSelezionatoId);
      if (ambienteSelezionato) {
        this.nuovoSoftware.ambienti = [ambienteSelezionato];
      }
    } else {
      this.nuovoSoftware.ambienti = [];
    }
    
    this.activeModal.close(this.nuovoSoftware);
  }

  closeModal() {
    this.activeModal.dismiss();
  }
}
