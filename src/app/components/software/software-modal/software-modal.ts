import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Software } from '../../../models/software.model';
import { Ambiente } from '../../../models/ambiente.model';

export interface SoftwareDialogData {
  software?: Software;
}

@Component({
  selector: 'app-software-modal',
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './software-modal.html',
  styleUrls: ['./software-modal.css'],
  providers: [NgbActiveModal]
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

  // Mock data per le select
  ambientiDisponibili: Ambiente[] = [
    { id: '1', descrizione: 'Ambiente di Sviluppo', note: 'Per sviluppo', dataCreazione: new Date('2024-01-15') },
    { id: '2', descrizione: 'Ambiente di Test', note: 'Per test', dataCreazione: new Date('2024-02-10') },
    { id: '3', descrizione: 'Ambiente di Produzione', dataCreazione: new Date('2024-03-01') }
  ];

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    if (this.software) {
      this.nuovoSoftware = {
        ...this.software,
        ambienti: [...this.software.ambienti]
      };
    }
  }

  salva() {
    if (!this.nuovoSoftware.dataUltimoAggiornamento) {
      this.nuovoSoftware.dataUltimoAggiornamento = new Date();
    }
    this.activeModal.close(this.nuovoSoftware);
  }

  closeModal() {
    this.activeModal.close();
  }

  onAmbienteChange(event: any) {
    const ambienteId = event.target.value;
    const isChecked = event.target.checked;
    
    if (isChecked) {
      const ambiente = this.ambientiDisponibili.find(a => a.id === ambienteId);
      if (ambiente && !this.nuovoSoftware.ambienti.find(a => a.id === ambienteId)) {
        this.nuovoSoftware.ambienti.push(ambiente);
      }
    } else {
      this.nuovoSoftware.ambienti = this.nuovoSoftware.ambienti.filter(a => a.id !== ambienteId);
    }
  }

  isAmbienteSelected(ambienteId: string): boolean {
    return this.nuovoSoftware.ambienti.some(a => a.id === ambienteId);
  }
}
