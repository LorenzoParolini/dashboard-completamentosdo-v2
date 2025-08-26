import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Cliente } from '../../../models/cliente.model';
import { Regione } from '../../../models/regione.model';
import { Software } from '../../../models/software.model';

export interface ClientiDialogData {
  cliente?: Cliente;
}

@Component({
  selector: 'app-clienti-modal',
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './clienti-modal.html',
  styleUrls: ['./clienti-modal.css'],
  providers: [NgbActiveModal]
})
export class ClientiModal implements OnInit {
  @Input() cliente?: Cliente;

  nuovoCliente: Cliente = {
    id: '',
    descrizione: '',
    regione: { id: '', descrizione: '', codice: '', coordinate: { x: 0, y: 0 } },
    software: []
  };

  // Mock data per le select
  regioniDisponibili: Regione[] = [
    { id: '1', descrizione: 'Lombardia', codice: 'LOM', coordinate: { x: 45.4642, y: 9.1900 } },
    { id: '2', descrizione: 'Campania', codice: 'CAM', coordinate: { x: 40.8518, y: 14.2681 } },
    { id: '3', descrizione: 'Toscana', codice: 'TOS', coordinate: { x: 43.7696, y: 11.2558 } }
  ];

  softwareDisponibili: Software[] = [
    { id: '1', descrizione: 'ERP System', note: 'Sistema gestionale', ambienti: [], versioneCorrente: '2.1.0', dataUltimoAggiornamento: new Date() },
    { id: '2', descrizione: 'CRM Platform', note: 'Gestione clienti', ambienti: [], versioneCorrente: '1.5.2', dataUltimoAggiornamento: new Date() },
    { id: '3', descrizione: 'Accounting Software', ambienti: [], versioneCorrente: '3.0.1', dataUltimoAggiornamento: new Date() }
  ];

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    if (this.cliente) {
      this.nuovoCliente = {
        ...this.cliente,
        regione: { ...this.cliente.regione },
        software: [...this.cliente.software]
      };
    }
  }

  salva() {
    this.activeModal.close(this.nuovoCliente);
  }

  closeModal() {
    this.activeModal.close();
  }

  onRegioneChange(event: any) {
    const regioneId = event.target.value;
    const regione = this.regioniDisponibili.find(r => r.id === regioneId);
    if (regione) {
      this.nuovoCliente.regione = regione;
    }
  }

  onSoftwareChange(event: any) {
    const softwareId = event.target.value;
    const isChecked = event.target.checked;
    
    if (isChecked) {
      const software = this.softwareDisponibili.find(s => s.id === softwareId);
      if (software && !this.nuovoCliente.software.find(s => s.id === softwareId)) {
        this.nuovoCliente.software.push(software);
      }
    } else {
      this.nuovoCliente.software = this.nuovoCliente.software.filter(s => s.id !== softwareId);
    }
  }

  isSoftwareSelected(softwareId: string): boolean {
    return this.nuovoCliente.software.some(s => s.id === softwareId);
  }
}
