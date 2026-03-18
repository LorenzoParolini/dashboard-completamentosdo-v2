import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NgbActiveModal,
  NgbModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
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
    dataCreazione: new Date(),
  };

  private originalData: Ambiente = {
    id: 0,
    descrizione: '',
    note: '',
    dataCreazione: new Date(),
  };

  private hasUnsavedChanges = false;

  // Segna se l'utente ha già lasciato (blur) il campo.
  // Serve a non mostrare errori mentre sta ancora digitando per la prima volta.
  touchedFields = {
    descrizione: false,
    note: false,
  };

  constructor(
    public activeModal: NgbActiveModal,
    private ambientiService: AmbientiService,
    private modalService: NgbModal,
    private minimizedModalsService: MinimizedModalsService,
  ) {}

  ngOnInit() {
    if (this.ambiente) {
      // Solo se non abbiamo già dati ripristinati da una modale minimizzata
      if (!this.isRestoredFromMinimized) {
        this.nuovoAmbiente = {
          ...this.ambiente,
        };
      }
      this.originalData = {
        ...this.ambiente,
      };
    } else {
      this.originalData = {
        ...this.nuovoAmbiente,
      };
    }
  }

  onFieldChange() {
    this.hasUnsavedChanges = this.checkForChanges();
  }

  // Al blur abilitiamo la validazione visuale per il campo specifico.
  onFieldBlur(field: keyof typeof this.touchedFields) {
    this.touchedFields[field] = true;
  }

  // Quando l'utente preme "Salva", forziamo la visualizzazione di tutti
  // gli errori dei campi con vincoli DTO.
  private markAllFieldsAsTouched() {
    this.touchedFields.descrizione = true;
    this.touchedFields.note = true;
  }

  // Uniforma i controlli sulle stringhe (evita spazi iniziali/finali).
  private normalizeText(value?: string | null): string {
    return (value ?? '').trim();
  }

  // Vincolo allineato a AmbienteInputDTO: descrizione obbligatoria 3..100.
  isDescrizioneValid(): boolean {
    const descrizione = this.normalizeText(this.nuovoAmbiente.descrizione);
    return descrizione.length >= 3 && descrizione.length <= 100;
  }

  // Ritorna il messaggio puntuale da mostrare sotto il campo descrizione.
  getDescrizioneError(): string {
    const descrizione = this.normalizeText(this.nuovoAmbiente.descrizione);
    if (!descrizione) {
      return 'Descrizione obbligatoria';
    }
    if (descrizione.length < 3 || descrizione.length > 100) {
      return 'La descrizione deve essere tra 3 e 100 caratteri';
    }
    return '';
  }

  // Vincolo allineato a AmbienteInputDTO: note opzionali max 500 caratteri.
  isNoteValid(): boolean {
    return (this.nuovoAmbiente.note ?? '').length <= 500;
  }

  // Messaggio mostrato solo quando la lunghezza delle note supera il limite.
  getNoteError(): string {
    if ((this.nuovoAmbiente.note ?? '').length > 500) {
      return 'Le note non possono superare 500 caratteri';
    }
    return '';
  }

  // Campo non valido se: è già stato toccato e la sua regola DTO non passa.
  // Questo pilota sia il messaggio rosso sia il bordo rosso.
  isFieldInvalid(field: 'descrizione' | 'note'): boolean {
    if (!this.touchedFields[field]) {
      return false;
    }

    if (field === 'descrizione') {
      return !this.isDescrizioneValid();
    }

    return !this.isNoteValid();
  }

  // Campo valido se è stato toccato e non è invalid.
  // Questo pilota il bordo verde.
  isFieldValid(field: 'descrizione' | 'note'): boolean {
    return this.touchedFields[field] && !this.isFieldInvalid(field);
  }

  // Validazione complessiva usata prima di chiudere la modale con "Salva".
  private isFormValid(): boolean {
    return this.isDescrizioneValid() && this.isNoteValid();
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
    // Prima del submit mostriamo eventuali errori su tutti i campi vincolati.
    this.markAllFieldsAsTouched();

    // Se i vincoli DTO non sono rispettati, blocchiamo il salvataggio.
    if (!this.isFormValid()) {
      return;
    }

    // Normalizzazione finale prima di inviare l'oggetto al chiamante.
    this.nuovoAmbiente.descrizione = this.normalizeText(
      this.nuovoAmbiente.descrizione,
    );

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
      backdrop: 'static',
    });

    modalRef.componentInstance.title = 'Modifiche non salvate';
    modalRef.componentInstance.message =
      'Hai modifiche non salvate. Sei sicuro di voler chiudere senza salvare?';
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
      },
    );
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  // Minimizza la modale salvando i dati nel servizio
  minimizeModal() {
    const modalId =
      this.modalId ||
      this.minimizedModalsService.generateModalId(
        'ambienti',
        this.ambiente ? 'edit' : 'add',
        this.ambiente?.id,
      );

    const description =
      this.nuovoAmbiente.descrizione ||
      (this.ambiente ? this.ambiente.descrizione : 'Nuovo Ambiente');

    // Crea una copia completa dei dati del form
    const formDataToSave = {
      ...this.nuovoAmbiente,
      // Salva anche lo stato originale per riferimento
      originalData: this.originalData,
    };

    this.minimizedModalsService.addMinimizedModal({
      id: modalId,
      type: this.ambiente ? 'edit' : 'add',
      section: 'ambienti',
      description: description,
      data: this.ambiente,
      formData: formDataToSave,
    });

    this.hasUnsavedChanges = false;
    this.activeModal.dismiss();
  }
}
