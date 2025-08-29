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

  // Campo per il menu a tendina
  softwareSelezionatoId: string = '';

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
      
      // Se siamo in modalità modifica, assicuriamoci che la regione sia settata correttamente
      if (this.cliente) {
        this.nuovoCliente = {
          ...this.cliente,
          regione: { ...this.cliente.regione },
          software: [...this.cliente.software]
        };
        console.log('Cliente da modificare:', this.cliente);
        console.log('Regione del cliente:', this.cliente.regione);
        console.log('ID regione del cliente:', this.cliente.regione.id);
      }
    });

    // Carica software disponibili
    this.softwareService.getAllSoftware().subscribe(software => {
      this.softwareDisponibili = software;
    });

    if (!this.cliente) {
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
    } else {
      // Se non viene trovata la regione, reimposta la regione vuota
      this.nuovoCliente.regione = { id: '', descrizione: '', codice: '', coordinate: { x: 0, y: 0 } };
    }
  }

  // Chiamata quando cambia la selezione nel dropdown software
  onSoftwareSelezionato() {
    if (this.softwareSelezionatoId) {
      const softwareSelezionato = this.softwareDisponibili.find(s => s.id === this.softwareSelezionatoId);
      if (softwareSelezionato && !this.nuovoCliente.software.find(s => s.id === this.softwareSelezionatoId)) {
        this.nuovoCliente.software.push(softwareSelezionato);
      }
      // Resetta la selezione
      this.softwareSelezionatoId = '';
    }
  }

  // Rimuove un software dalla lista
  rimuoviSoftware(softwareId: string) {
    this.nuovoCliente.software = this.nuovoCliente.software.filter(s => s.id !== softwareId);
  }

  // Controlla se un software è già stato selezionato
  isSoftwareGiaSelezionato(softwareId: string): boolean {
    return this.nuovoCliente.software.some(s => s.id === softwareId);
  }
}
