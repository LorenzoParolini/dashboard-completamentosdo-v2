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
    } else {
      // Inizializza l'ID solo qui, quando il servizio è disponibile
      this.nuovoSoftware.id = (this.getLength() + 1).toString();
    }
  }

  salva() {
    if (!this.nuovoSoftware.dataUltimoAggiornamento) {
      this.nuovoSoftware.dataUltimoAggiornamento = new Date();
    }
    
    this.activeModal.close(this.nuovoSoftware);
  }

  closeModal() {
    this.activeModal.dismiss();
  }

  // Chiamata quando cambia la selezione nel dropdown
  onAmbienteSelezionato() {
    if (this.ambienteSelezionatoId) {
      const ambienteSelezionato = this.ambientiDisponibili.find(a => a.id === this.ambienteSelezionatoId);
      if (ambienteSelezionato && !this.nuovoSoftware.ambienti.find(a => a.id === this.ambienteSelezionatoId)) {
        this.nuovoSoftware.ambienti.push(ambienteSelezionato);
      }
      // Resetta la selezione
      this.ambienteSelezionatoId = '';
    }
  }

  // Rimuove un ambiente dalla lista
  rimuoviAmbiente(ambienteId: string) {
    this.nuovoSoftware.ambienti = this.nuovoSoftware.ambienti.filter(a => a.id !== ambienteId);
  }

  // Controlla se un ambiente è già stato selezionato
  isAmbienteGiaSelezionato(ambienteId: string): boolean {
    return this.nuovoSoftware.ambienti.some(a => a.id === ambienteId);
  }
}
