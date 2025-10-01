import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Cliente } from '../../../models/cliente.model';
import { Regione } from '../../../models/regione.model';
import { Software } from '../../../models/software.model';
import { ClientiService } from '../../../services/clienti.service';
import { RegioniService } from '../../../services/regioni.service';
import { SoftwareService } from '../../../services/software.service';
import { MinimizedModalsService } from '../../../services/minimized-modals.service';
import { ConfirmationModalComponent } from '../../confirmation-modal/confirmation-modal.component';

export interface ClientiDialogData {
  cliente?: Cliente;
}

@Component({
  selector: 'app-clienti-modal',
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './clienti-modal.component.html',
  styleUrls: ['./clienti-modal.component.css']
})
export class ClientiModalComponent implements OnInit {
  @Input() cliente?: Cliente;
  @Input() modalId?: string;
  @Input() isRestoredFromMinimized?: boolean = false;

  nuovoCliente: Cliente = {
    id: 0,
    descrizione: '',
    regione: { id: 0, descrizione: '', codice: '', coordinate: { x: 0, y: 0 } },
    software: []
  };

  // Campo per il menu a tendina
  softwareSelezionatoId: number = 0;

  regioniDisponibili: Regione[] = [];
  softwareDisponibili: Software[] = [];

  private originalData: Cliente = {
    id: 0,
    descrizione: '',
    regione: { id: 0, descrizione: '', codice: '', coordinate: { x: 0, y: 0 } },
    software: []
  };

  private hasUnsavedChanges = false;

  constructor(
    public activeModal: NgbActiveModal, 
    private clientiService: ClientiService,
    private regioniService: RegioniService,
    private softwareService: SoftwareService,
    private modalService: NgbModal,
    private minimizedModalsService: MinimizedModalsService
  ) {
  }

  getLength(): number {
    // For now return 0 as this method isn't needed with backend
    return 0;
  }

  ngOnInit() {
    // Carica regioni disponibili
    this.regioniService.getAllRegioni().subscribe(regioni => {
      this.regioniDisponibili = regioni;
      
      // Se siamo in modalità modifica, assicuriamoci che la regione sia settata correttamente
      if (this.cliente) {
        // Solo se non abbiamo già dati ripristinati da una modale minimizzata
        if (!this.isRestoredFromMinimized) {
          this.nuovoCliente = {
            ...this.cliente,
            regione: { ...this.cliente.regione },
            software: [...this.cliente.software]
          };
        }
        this.originalData = {
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
      // Solo se non abbiamo già dati ripristinati
      if (!this.isRestoredFromMinimized && this.nuovoCliente.id === 0) {
        this.nuovoCliente.id = 0; // Backend will assign ID
      }
      this.originalData = {
        ...this.nuovoCliente,
        regione: { ...this.nuovoCliente.regione },
        software: [...this.nuovoCliente.software]
      };
    }
  }

  onFieldChange() {
    this.hasUnsavedChanges = this.checkForChanges();
  }

  private checkForChanges(): boolean {
    // Verifica cambiamenti nei campi base
    if (this.nuovoCliente.descrizione !== this.originalData.descrizione) {
      return true;
    }

    // Verifica cambiamenti nella regione
    if (this.nuovoCliente.regione.id !== this.originalData.regione.id) {
      return true;
    }

    // Verifica cambiamenti nei software
    if (this.nuovoCliente.software.length !== this.originalData.software.length) {
      return true;
    }

    const originalSoftwareIds = this.originalData.software.map(s => s.id).sort();
    const currentSoftwareIds = this.nuovoCliente.software.map(s => s.id).sort();
    
    return !originalSoftwareIds.every((id, index) => id === currentSoftwareIds[index]);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.hasUnsavedChanges) {
      $event.returnValue = true;
    }
  }

  salva() {
    this.hasUnsavedChanges = false;
    this.activeModal.close(this.nuovoCliente);
  }

  closeModal() {
    if (this.hasUnsavedChanges) {
      this.showUnsavedChangesConfirmation();
    } else {
      this.activeModal.dismiss();
    }
  }

  private showUnsavedChangesConfirmation() {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      centered: true,
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Modifiche non salvate';
    modalRef.componentInstance.message = 'Hai modifiche non salvate. Sei sicuro di voler chiudere senza salvare?';
    modalRef.componentInstance.confirmText = 'Chiudi senza salvare';
    modalRef.componentInstance.cancelText = 'Continua modifica';
    modalRef.componentInstance.confirmButtonClass = 'btn-warning';
    modalRef.componentInstance.icon = 'warning';

    modalRef.result.then(
      (result) => {
        if (result) {
          this.hasUnsavedChanges = false;
          this.activeModal.dismiss();
        }
      },
      () => {
        // L'utente ha annullato, non fare nulla
      }
    );
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onRegioneChange(event: any) {
    const regioneId = event.target.value;
    const regione = this.regioniDisponibili.find(r => r.id === regioneId);
    if (regione) {
      this.nuovoCliente.regione = regione;
    } else {
      // Se non viene trovata la regione, reimposta la regione vuota
      this.nuovoCliente.regione = { id: 0, descrizione: '', codice: '', coordinate: { x: 0, y: 0 } };
    }
    this.onFieldChange();
  }

  // Chiamata quando cambia la selezione nel dropdown software
  onSoftwareSelezionato() {
    if (this.softwareSelezionatoId) {
      const softwareSelezionato = this.softwareDisponibili.find(s => s.id === this.softwareSelezionatoId);
      if (softwareSelezionato && !this.nuovoCliente.software.find(s => s.id === this.softwareSelezionatoId)) {
        this.nuovoCliente.software.push(softwareSelezionato);
        this.onFieldChange();
      }
      // Resetta la selezione
      this.softwareSelezionatoId = 0;
    }
  }

  // Rimuove un software dalla lista
  rimuoviSoftware(softwareId: number) {
    this.nuovoCliente.software = this.nuovoCliente.software.filter(s => s.id !== softwareId);
    this.onFieldChange();
  }

  // Controlla se un software è già stato selezionato
  isSoftwareGiaSelezionato(softwareId: number): boolean {
    return this.nuovoCliente.software.some(s => s.id === softwareId);
  }

  // Minimizza la modale salvando i dati nel servizio
  minimizeModal() {
    const modalId = this.modalId || this.minimizedModalsService.generateModalId(
      'clienti', 
      this.cliente ? 'edit' : 'add',
      this.cliente?.id?.toString()
    );

    const description = this.nuovoCliente.descrizione || 
      (this.cliente ? this.cliente.descrizione : 'Nuovo Cliente');

    // Crea una copia completa dei dati del form inclusi i campi di selezione
    const formDataToSave = {
      ...this.nuovoCliente,
      softwareSelezionatoId: this.softwareSelezionatoId,
      // Salva anche lo stato originale per riferimento
      originalData: this.originalData
    };

    console.log('Salvando dati form clienti per minimizzazione:', formDataToSave);

    this.minimizedModalsService.addMinimizedModal({
      id: modalId,
      type: this.cliente ? 'edit' : 'add',
      section: 'clienti',
      description: description,
      data: this.cliente,
      formData: formDataToSave
    });

    this.hasUnsavedChanges = false;
    this.activeModal.dismiss();
  }
}
