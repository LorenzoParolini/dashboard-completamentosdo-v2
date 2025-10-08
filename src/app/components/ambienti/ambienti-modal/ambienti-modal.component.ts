import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Ambiente } from '../../../models/ambiente.model';
import { AmbientiService } from '../../../services/ambienti.service';
import { MinimizedModalsService } from '../../../services/minimized-modals.service';
import { ConfirmationModalComponent } from '../../confirmation-modal/confirmation-modal.component';


export interface AmbientiDialogData {
  ambiente?: Ambiente;
}



@Component({
  selector: 'app-ambienti-modal',
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './ambienti-modal.component.html',
  styleUrls: ['./ambienti-modal.component.css'],
  
})
export class AmbientiModalComponent implements OnInit {
  @Input() ambiente?: Ambiente;
  @Input() modalId?: string;
  @Input() isRestoredFromMinimized?: boolean = false;

  // Non inizializzare qui - fallo in ngOnInit
  nuovoAmbiente: Ambiente = {
    id: 0,
    descrizione: '',
    note: '',
    dataCreazione: new Date()
  };

  private originalData: Ambiente = {
    id: 0,
    descrizione: '',
    note: '',
    dataCreazione: new Date()
  };

  private hasUnsavedChanges = false;

  
  constructor(
    public activeModal: NgbActiveModal, 
    private ambientiService: AmbientiService,
    private modalService: NgbModal,
    private minimizedModalsService: MinimizedModalsService
  ) {
  }

  getLength(): number {
    return this.ambientiService.length();
  }

  ngOnInit() {
    if (this.ambiente) {
      // Solo se non abbiamo già dati ripristinati da una modale minimizzata
      if (!this.isRestoredFromMinimized) {
        this.nuovoAmbiente = {
          ...this.ambiente
        };
      }
      this.originalData = {
        ...this.ambiente
      };
    } else {
      // Inizializza l'ID solo qui, quando il servizio è disponibile
      // Solo se non abbiamo già dati ripristinati
      if (!this.isRestoredFromMinimized && this.nuovoAmbiente.id === 0) {
        this.nuovoAmbiente.id = this.getLength() + 1;
      }
      this.originalData = {
        ...this.nuovoAmbiente
      };
    }
  }

  onFieldChange() {
    this.hasUnsavedChanges = this.checkForChanges();
  }

  private checkForChanges(): boolean {
    return (
      this.nuovoAmbiente.descrizione !== this.originalData.descrizione ||
      this.nuovoAmbiente.note !== this.originalData.note
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.hasUnsavedChanges) {
      $event.returnValue = true;
    }
  }

  salva() {
    if (!this.nuovoAmbiente.dataCreazione) {
      this.nuovoAmbiente.dataCreazione = new Date();
    }
    this.hasUnsavedChanges = false;
    this.activeModal.close(this.nuovoAmbiente);
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

  // Minimizza la modale salvando i dati nel servizio
  minimizeModal() {
    const modalId = this.modalId || this.minimizedModalsService.generateModalId(
      'ambienti', 
      this.ambiente ? 'edit' : 'add',
      this.ambiente?.id
    );

    const description = this.nuovoAmbiente.descrizione || 
      (this.ambiente ? this.ambiente.descrizione : 'Nuovo Ambiente');

    // Crea una copia completa dei dati del form
    const formDataToSave = {
      ...this.nuovoAmbiente,
      // Salva anche lo stato originale per riferimento
      originalData: this.originalData
    };

    this.minimizedModalsService.addMinimizedModal({
      id: modalId,
      type: this.ambiente ? 'edit' : 'add',
      section: 'ambienti',
      description: description,
      data: this.ambiente,
      formData: formDataToSave
    });

    this.hasUnsavedChanges = false;
    this.activeModal.dismiss();
  }
}
