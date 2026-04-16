import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NgbActiveModal,
  NgbModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { Regione } from '../../../models/regione.model';
import { MinimizedModalsService } from '../../../services/minimized-modals.service';
import { ConfirmationModalComponent } from '../../confirmation-modal/confirmation-modal.component';

export interface DialogData {
  regione?: Regione;
}

@Component({
  selector: 'app-regioni-modal',
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './regioni-modal.component.html',
  styleUrls: ['./regioni-modal.component.css'],
})
export class RegioniModalComponent implements OnInit {
  @Input() regione?: Regione;
  @Input() modalId?: string;
  @Input() isRestoredFromMinimized?: boolean = false;

  nuovaRegione: Regione = {
    id: 0,
    descrizione: '',
    codice: '',
    x: 0,
    y: 0,
  };

  private originalData: Regione = {
    id: 0,
    descrizione: '',
    codice: '',
    x: 0,
    y: 0,
  };

  private hasUnsavedChanges = false;

  // Stato blur dei campi con vincoli DTO.
  // Finché false, non mostriamo errori né bordi valid/invalid.
  touchedFields = {
    descrizione: false,
    codice: false,
  };

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private minimizedModalsService: MinimizedModalsService,
  ) {}

  ngOnInit() {
    if (this.regione) {
      // Solo se non abbiamo già dati ripristinati da una modale minimizzata
      if (!this.isRestoredFromMinimized) {
        this.nuovaRegione = {
          ...this.regione,
          x: this.regione.x ?? 0,
          y: this.regione.y ?? 0,
        };
      }
      this.originalData = {
        ...this.regione,
        x: this.regione.x ?? 0,
        y: this.regione.y ?? 0,
      };
    }

    // Imposta originalData dopo aver inizializzato nuovaRegione
    if (!this.originalData.id) {
      this.originalData = {
        ...this.nuovaRegione,
      };
    }
  }

  onFieldChange() {
    this.hasUnsavedChanges = this.checkForChanges();
  }

  // Chiamato dal template su blur per attivare il feedback del singolo campo.
  onFieldBlur(field: keyof typeof this.touchedFields) {
    this.touchedFields[field] = true;
  }

  // Forza la visualizzazione degli errori quando l'utente tenta di salvare.
  private markAllFieldsAsTouched() {
    this.touchedFields.descrizione = true;
    this.touchedFields.codice = true;
  }

  // Utility di normalizzazione per evitare validazioni falsate dagli spazi.
  private normalizeText(value?: string | null): string {
    return (value ?? '').trim();
  }

  // Vincolo RegioneInputDTO: descrizione obbligatoria e 3..100 caratteri.
  isDescrizioneValid(): boolean {
    const descrizione = this.normalizeText(this.nuovaRegione.descrizione);
    return descrizione.length >= 3 && descrizione.length <= 100;
  }

  // Messaggio contestuale per la descrizione in base all'errore corrente.
  getDescrizioneError(): string {
    const descrizione = this.normalizeText(this.nuovaRegione.descrizione);
    if (!descrizione) {
      return 'Descrizione obbligatoria';
    }
    if (descrizione.length < 3 || descrizione.length > 100) {
      return 'La descrizione deve essere tra 3 e 100 caratteri';
    }
    return '';
  }

  // Vincolo RegioneInputDTO: codice obbligatorio e 2..10 caratteri.
  isCodiceValid(): boolean {
    const codice = this.normalizeText(this.nuovaRegione.codice);
    return codice.length >= 2 && codice.length <= 10;
  }

  // Messaggio contestuale per il codice.
  getCodiceError(): string {
    const codice = this.normalizeText(this.nuovaRegione.codice);
    if (!codice) {
      return 'Codice obbligatorio';
    }
    if (codice.length < 2 || codice.length > 10) {
      return 'Il codice deve essere tra 2 e 10 caratteri';
    }
    return '';
  }

  // Se il campo è stato toccato e non passa la regola DTO => invalid.
  isFieldInvalid(field: 'descrizione' | 'codice'): boolean {
    if (!this.touchedFields[field]) {
      return false;
    }

    if (field === 'descrizione') {
      return !this.isDescrizioneValid();
    }

    return !this.isCodiceValid();
  }

  // Se il campo è toccato e non invalid => valid (bordo verde).
  isFieldValid(field: 'descrizione' | 'codice'): boolean {
    return this.touchedFields[field] && !this.isFieldInvalid(field);
  }

  // Check unico usato dal metodo salva.
  private isFormValid(): boolean {
    return this.isDescrizioneValid() && this.isCodiceValid();
  }

  private checkForChanges(): boolean {
    return (
      this.nuovaRegione.descrizione !== this.originalData.descrizione ||
      this.nuovaRegione.codice !== this.originalData.codice ||
      (this.nuovaRegione.x ?? 0) !== (this.originalData.x ?? 0) ||
      (this.nuovaRegione.y ?? 0) !== (this.originalData.y ?? 0)
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.hasUnsavedChanges) {
      $event.returnValue = true;
    }
  }

  salva() {
    // Rende visibili tutti i feedback prima del controllo finale.
    this.markAllFieldsAsTouched();

    // Non chiudere la modale se il payload non rispetta i vincoli DTO.
    if (!this.isFormValid()) {
      return;
    }

    // Normalizzazione finale per mantenere i dati coerenti lato backend.
    this.nuovaRegione.descrizione = this.normalizeText(
      this.nuovaRegione.descrizione,
    );
    this.nuovaRegione.codice = this.normalizeText(this.nuovaRegione.codice);

    this.hasUnsavedChanges = false;
    this.activeModal.close(this.nuovaRegione);
    console.log('Modale chiusa con salvataggio');
  }

  closeModal() {
    if (this.hasUnsavedChanges) {
      this.showUnsavedChangesConfirmation();
    } else {
      this.activeModal.dismiss();
      console.log('Modale chiusa senza salvare');
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
        'regioni',
        this.regione ? 'edit' : 'add',
        this.regione?.id,
      );

    const description =
      this.nuovaRegione.descrizione ||
      (this.regione ? this.regione.descrizione : 'Nuova Regione');

    // Crea una copia completa dei dati del form
    const formDataToSave = {
      ...this.nuovaRegione,
      // Salva anche lo stato originale per riferimento
      originalData: this.originalData,
    };

    this.minimizedModalsService.addMinimizedModal({
      id: modalId,
      type: this.regione ? 'edit' : 'add',
      section: 'regioni',
      description: description,
      data: this.regione,
      formData: formDataToSave,
    });

    this.hasUnsavedChanges = false;
    this.activeModal.dismiss();
  }
}
