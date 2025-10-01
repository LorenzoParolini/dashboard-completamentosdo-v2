import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Software } from '../../../models/software.model';
import { Ambiente } from '../../../models/ambiente.model';
import { SoftwareService } from '../../../services/software.service';
import { AmbientiService } from '../../../services/ambienti.service';
import { MinimizedModalsService } from '../../../services/minimized-modals.service';
import { ConfirmationModalComponent } from '../../confirmation-modal/confirmation-modal.component';

export interface SoftwareDialogData {
  software?: Software;
}

@Component({
  selector: 'app-software-modal',
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './software-modal.component.html',
  styleUrls: ['./software-modal.component.css'],
})
export class SoftwareModalComponent implements OnInit {
  @Input() software?: Software;
  @Input() modalId?: string;
  @Input() isRestoredFromMinimized?: boolean = false;

  nuovoSoftware: Software = {
    id: 0,
    descrizione: '',
    note: '',
    ambienti: [],
    versioneCorrente: '',
    dataUltimoAggiornamento: new Date()
  };

  // Campo per il menu a tendina
  ambienteSelezionatoId: number = 0;

  // Mock data per le select
  ambientiDisponibili: Ambiente[] = [];

  private originalData: Software = {
    id: 0,
    descrizione: '',
    note: '',
    ambienti: [],
    versioneCorrente: '',
    dataUltimoAggiornamento: new Date()
  };

  private hasUnsavedChanges = false;

  constructor(
    public activeModal: NgbActiveModal, 
    private softwareService: SoftwareService, 
    private ambientiService: AmbientiService,
    private modalService: NgbModal,
    private minimizedModalsService: MinimizedModalsService
  ) {
  }

  getLength(): number {
    // Il metodo length non esiste più nel nuovo servizio HTTP
    // Restituiamo un valore di default per ora
    return 0;
  }

  ngOnInit() {
    // Carica gli ambienti dal servizio
    this.ambientiService.getAllAmbienti().subscribe(ambienti => {
      this.ambientiDisponibili = ambienti;
    });

    if (this.software) {
      // Solo se non abbiamo già dati ripristinati da una modale minimizzata
      if (!this.isRestoredFromMinimized) {
        this.nuovoSoftware = {
          ...this.software,
          ambienti: [...this.software.ambienti]
        };
      }
      this.originalData = {
        ...this.software,
        ambienti: [...this.software.ambienti]
      };
    } else {
      // Inizializza l'ID solo qui, quando il servizio è disponibile
      // Solo se non abbiamo già dati ripristinati
      if (!this.isRestoredFromMinimized && this.nuovoSoftware.id === 0) {
        this.nuovoSoftware.id = this.getLength() + 1;
      }
      this.originalData = {
        ...this.nuovoSoftware,
        ambienti: [...this.nuovoSoftware.ambienti]
      };
    }
  }

  onFieldChange() {
    this.hasUnsavedChanges = this.checkForChanges();
  }

  private checkForChanges(): boolean {
    // Verifica cambiamenti nei campi base
    if (this.nuovoSoftware.descrizione !== this.originalData.descrizione ||
        this.nuovoSoftware.note !== this.originalData.note ||
        this.nuovoSoftware.versioneCorrente !== this.originalData.versioneCorrente) {
      return true;
    }

    // Verifica cambiamenti negli ambienti
    if (this.nuovoSoftware.ambienti.length !== this.originalData.ambienti.length) {
      return true;
    }

    const originalAmbientiIds = this.originalData.ambienti.map(a => a.id).sort();
    const currentAmbientiIds = this.nuovoSoftware.ambienti.map(a => a.id).sort();
    
    return !originalAmbientiIds.every((id, index) => id === currentAmbientiIds[index]);
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.hasUnsavedChanges) {
      $event.returnValue = true;
    }
  }

  salva() {
    if (!this.nuovoSoftware.dataUltimoAggiornamento) {
      this.nuovoSoftware.dataUltimoAggiornamento = new Date();
    }
    
    this.hasUnsavedChanges = false;
    this.activeModal.close(this.nuovoSoftware);
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

  // Chiamata quando cambia la selezione nel dropdown
  onAmbienteSelezionato() {
    if (this.ambienteSelezionatoId) {
      const ambienteSelezionato = this.ambientiDisponibili.find(a => a.id === this.ambienteSelezionatoId);
      if (ambienteSelezionato && !this.nuovoSoftware.ambienti.find(a => a.id === this.ambienteSelezionatoId)) {
        this.nuovoSoftware.ambienti.push(ambienteSelezionato);
        this.onFieldChange();
      }
      // Resetta la selezione
      this.ambienteSelezionatoId = 0;
    }
  }

  // Rimuove un ambiente dalla lista
  rimuoviAmbiente(ambienteId: number) {
    this.nuovoSoftware.ambienti = this.nuovoSoftware.ambienti.filter(a => a.id !== ambienteId);
    this.onFieldChange();
  }

  // Controlla se un ambiente è già stato selezionato
  isAmbienteGiaSelezionato(ambienteId: number): boolean {
    return this.nuovoSoftware.ambienti.some(a => a.id === ambienteId);
  }

  // Minimizza la modale salvando i dati nel servizio
  minimizeModal() {
    const modalId = this.modalId || this.minimizedModalsService.generateModalId(
      'software', 
      this.software ? 'edit' : 'add',
      this.software?.id?.toString()
    );

    const description = this.nuovoSoftware.descrizione || 
      (this.software ? this.software.descrizione : 'Nuovo Software');

    // Crea una copia completa dei dati del form inclusi i campi di selezione
    const formDataToSave = {
      ...this.nuovoSoftware,
      ambienteSelezionatoId: this.ambienteSelezionatoId,
      // Salva anche lo stato originale per riferimento
      originalData: this.originalData
    };

    this.minimizedModalsService.addMinimizedModal({
      id: modalId,
      type: this.software ? 'edit' : 'add',
      section: 'software',
      description: description,
      data: this.software,
      formData: formDataToSave
    });

    this.hasUnsavedChanges = false;
    this.activeModal.dismiss();
  }
}
