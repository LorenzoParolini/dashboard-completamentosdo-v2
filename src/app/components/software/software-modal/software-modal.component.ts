import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NgbActiveModal,
  NgbModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { Software } from '../../../models/software.model';
import { ClientiService } from '../../../services/clienti.service';
import { MinimizedModalsService } from '../../../services/minimized-modals.service';
import { ConfirmationModalComponent } from '../../confirmation-modal/confirmation-modal.component';
import { Cliente } from '../../../models/cliente.model';

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
    assegnazioni: [],
    ambienti: [],
  };

  clienteSelezionatoId: number = 0;

  clientiDisponibili: Cliente[] = [];

  private originalData: Software = {
    id: 0,
    descrizione: '',
    note: '',
    assegnazioni: [],
    ambienti: [],
  };

  private hasUnsavedChanges = false;

  // Tracciamo il blur dei campi che hanno regole specifiche nel DTO.
  // Questo evita feedback prematuri mentre l'utente sta scrivendo.
  touchedFields = {
    descrizione: false,
    note: false,
  };

  constructor(
    public activeModal: NgbActiveModal,
    private clientiService: ClientiService,
    private modalService: NgbModal,
    private minimizedModalsService: MinimizedModalsService,
  ) {}

  ngOnInit() {
    this.clientiService.getAllClienti().subscribe((clienti) => {
      this.clientiDisponibili = clienti;
    });

    if (this.software) {
      console.log('Modalità modifica - Software ricevuto:', this.software);
      // Solo se non abbiamo già dati ripristinati da una modale minimizzata
      if (!this.isRestoredFromMinimized) {
        this.nuovoSoftware = {
          ...this.software,
          assegnazioni: [...(this.software.assegnazioni || [])],
          ambienti: [...this.software.ambienti],
        };
      } else {
        this.nuovoSoftware = {
          ...this.nuovoSoftware,
          assegnazioni: [...(this.nuovoSoftware.assegnazioni || [])],
          ambienti: [...this.nuovoSoftware.ambienti],
        };
      }
      this.originalData = {
        ...this.software,
        assegnazioni: [...(this.software.assegnazioni || [])],
        ambienti: [...this.software.ambienti],
      };
    } else {
      console.log('Modalità aggiunta - Nuovo software');

      this.nuovoSoftware = {
        ...this.nuovoSoftware,
        ambienti: [...this.nuovoSoftware.ambienti],
      };

      this.originalData = {
        ...this.nuovoSoftware,
        ambienti: [...this.nuovoSoftware.ambienti],
      };
    }
  }

  onFieldChange() {
    this.hasUnsavedChanges = this.checkForChanges();
  }

  // Attiva validazione visuale (errore/ok) quando il campo perde il focus.
  onFieldBlur(field: keyof typeof this.touchedFields) {
    this.touchedFields[field] = true;
  }

  // Al submit, trattiamo tutti i campi come "toccati" per mostrare
  // eventuali errori anche su campi non visitati.
  private markAllFieldsAsTouched() {
    this.touchedFields.descrizione = true;
    this.touchedFields.note = true;
  }

  // Normalizza stringhe in input per coerenza tra validazione e salvataggio.
  private normalizeText(value?: string | null): string {
    return (value ?? '').trim();
  }

  // Vincolo SoftwareInputDTO: descrizione obbligatoria, 3..100 caratteri.
  isDescrizioneValid(): boolean {
    const descrizione = this.normalizeText(this.nuovoSoftware.descrizione);
    return descrizione.length >= 3 && descrizione.length <= 100;
  }

  // Messaggio puntuale per i diversi casi di errore sulla descrizione.
  getDescrizioneError(): string {
    const descrizione = this.normalizeText(this.nuovoSoftware.descrizione);
    if (!descrizione) {
      return 'Descrizione obbligatoria';
    }
    if (descrizione.length < 3 || descrizione.length > 100) {
      return 'La descrizione deve essere tra 3 e 100 caratteri';
    }
    return '';
  }

  // Vincolo SoftwareInputDTO: note opzionali ma max 500 caratteri.
  isNoteValid(): boolean {
    return (this.nuovoSoftware.note ?? '').length <= 500;
  }

  // Messaggio per overflow lunghezza note.
  getNoteError(): string {
    if ((this.nuovoSoftware.note ?? '').length > 500) {
      return 'Le note non possono superare 500 caratteri';
    }
    return '';
  }

  // Un campo è invalid quando è stato toccato e non rispetta il suo vincolo.
  // Usato da template per bordo rosso e messaggio.
  isFieldInvalid(field: 'descrizione' | 'note'): boolean {
    if (!this.touchedFields[field]) {
      return false;
    }

    if (field === 'descrizione') {
      return !this.isDescrizioneValid();
    }

    if (field === 'note') {
      return !this.isNoteValid();
    }

    return false;
  }

  // Un campo è valid quando è toccato e non invalid.
  // Usato da template per bordo verde.
  isFieldValid(field: 'descrizione' | 'note'): boolean {
    return this.touchedFields[field] && !this.isFieldInvalid(field);
  }

  // Validazione complessiva chiamata prima del submit.
  private isFormValid(): boolean {
    return this.isDescrizioneValid() && this.isNoteValid();
  }

  private checkForChanges(): boolean {
    return (
      this.nuovoSoftware.descrizione !== this.originalData.descrizione ||
      this.nuovoSoftware.note !== this.originalData.note
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.hasUnsavedChanges) {
      $event.returnValue = true;
    }
  }

  salva() {
    // Mostra feedback su tutti i campi vincolati al click su "Salva".
    this.markAllFieldsAsTouched();

    // Interrompe il submit se uno dei vincoli DTO non passa.
    if (!this.isFormValid()) {
      return;
    }

    // Normalizzazione finale dei testi prima di chiudere la modale.
    this.nuovoSoftware.descrizione = this.normalizeText(
      this.nuovoSoftware.descrizione,
    );

    this.hasUnsavedChanges = false;
    this.activeModal.close({
      ...this.nuovoSoftware,
      clienteSelezionatoId: this.clienteSelezionatoId,
    });
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
        'software',
        this.software ? 'edit' : 'add',
        this.software?.id,
      );

    const description =
      this.nuovoSoftware.descrizione ||
      (this.software ? this.software.descrizione : 'Nuovo Software');

    // Crea una copia completa dei dati del form inclusi i campi di selezione
    const formDataToSave = {
      ...this.nuovoSoftware,
      clienteSelezionatoId: this.clienteSelezionatoId,
      // Salva anche lo stato originale per riferimento
      originalData: this.originalData,
    };

    this.minimizedModalsService.addMinimizedModal({
      id: modalId,
      type: this.software ? 'edit' : 'add',
      section: 'software',
      description: description,
      data: this.software,
      formData: formDataToSave,
    });

    this.hasUnsavedChanges = false;
    this.activeModal.dismiss();
  }
}
