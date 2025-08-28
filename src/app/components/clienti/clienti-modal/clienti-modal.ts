import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Cliente } from '../../../models/cliente.model';
import { Regione } from '../../../models/regione.model';
import { Software } from '../../../models/software.model';
import { ClientiService } from '../../../services/clienti';
import { RegioniService } from '../../../services/regioni';
import { SoftwareService } from '../../../services/software';

export interface ClientiDialogData {
  cliente?: Cliente;
}

@Component({
  selector: 'app-clienti-modal',
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './clienti-modal.html',
  styleUrls: ['./clienti-modal.css']
})
export class ClientiModal implements OnInit {
  @Input() cliente?: Cliente;

  nuovoCliente: Cliente = {
    id: '',
    descrizione: '',
    regione: { id: '', descrizione: '', codice: '', coordinate: { x: 0, y: 0 } },
    software: []
  };

  regioniDisponibili: Regione[] = [];
  softwareDisponibili: Software[] = [];

  constructor(
    public activeModal: NgbActiveModal, 
    private clientiService: ClientiService,
    private regioniService: RegioniService,
    private softwareService: SoftwareService
  ) {
  }

  getLength(): number {
    return this.clientiService.length();
  }

  ngOnInit() {
    // Carica regioni disponibili
    this.regioniService.getAllRegioni().subscribe(regioni => {
      this.regioniDisponibili = regioni;
    });

    // Carica software disponibili
    this.softwareService.getAllSoftware().subscribe(software => {
      this.softwareDisponibili = software;
    });

    if (this.cliente) {
      this.nuovoCliente = {
        ...this.cliente,
        regione: { ...this.cliente.regione },
        software: [...this.cliente.software]
      };
    } else {
      // Inizializza l'ID solo qui, quando il servizio è disponibile
      this.nuovoCliente.id = (this.getLength() + 1).toString();
    }
  }

  salva() {
    this.activeModal.close(this.nuovoCliente);
  }

  closeModal() {
    this.activeModal.dismiss();
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
    if (softwareId) {
      const software = this.softwareDisponibili.find(s => s.id === softwareId);
      if (software) {
        // Sostituisce l'array con un singolo software
        this.nuovoCliente.software = [software];
      }
    } else {
      // Svuota l'array se non è selezionato nessun software
      this.nuovoCliente.software = [];
    }
  }

  getSelectedSoftwareId(): string {
    return this.nuovoCliente.software.length > 0 ? this.nuovoCliente.software[0].id : '';
  }
}
