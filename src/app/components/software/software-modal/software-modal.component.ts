import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NgbActiveModal,
  NgbModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { Software } from '../../../models/software.model';
import { Ambiente } from '../../../models/ambiente.model';
import { Rilascio } from '../../../models/rilascio.model';
import { SoftwareService } from '../../../services/software.service';
import { AmbientiService } from '../../../services/ambienti.service';
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

  // Campo per il menu a tendina
  ambienteSelezionatoId: number = 0;
  clienteSelezionatoId: number = 0;

  // Mock data per le select
  ambientiDisponibili: Ambiente[] = [];
  clientiDisponibili: Cliente[] = [];
  expandedAmbienti = new Set<number>();

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
    private softwareService: SoftwareService,
    private ambientiService: AmbientiService,
    private clientiService: ClientiService,
    private modalService: NgbModal,
    private minimizedModalsService: MinimizedModalsService,
  ) {}

  ngOnInit() {
    // Carica gli ambienti dal servizio
    this.ambientiService.getAllAmbienti().subscribe((ambienti) => {
      this.ambientiDisponibili = ambienti;
      console.log('Ambienti disponibili caricati:', this.ambientiDisponibili);

      // I DTO nested di alcuni endpoint possono non includere i rilasci:
      // riallineiamo gli ambienti selezionati con quelli completi disponibili.
      this.nuovoSoftware.ambienti = this.enrichAmbientiConRilasci(
        this.nuovoSoftware.ambienti,
      );
      this.originalData.ambienti = this.enrichAmbientiConRilasci(
        this.originalData.ambienti,
      );
    });

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

      this.nuovoSoftware.ambienti = this.enrichAmbientiConRilasci(
        this.nuovoSoftware.ambienti,
      );
      this.originalData.ambienti = this.enrichAmbientiConRilasci(
        this.originalData.ambienti,
      );

      console.log('Ambienti del software:', this.nuovoSoftware.ambienti);
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

      this.nuovoSoftware.ambienti = this.enrichAmbientiConRilasci(
        this.nuovoSoftware.ambienti,
      );
      this.originalData.ambienti = this.enrichAmbientiConRilasci(
        this.originalData.ambienti,
      );
    }
  }

  toggleAmbiente(ambienteId: number): void {
    if (this.expandedAmbienti.has(ambienteId)) {
      this.expandedAmbienti.delete(ambienteId);
      return;
    }
    this.expandedAmbienti.add(ambienteId);
  }

  isAmbienteExpanded(ambienteId: number): boolean {
    return this.expandedAmbienti.has(ambienteId);
  }

  getAmbienteRilasci(ambiente: Ambiente): Rilascio[] {
    return this.normalizeAmbienteConRilasci(ambiente).rilasci || [];
  }

  getAmbienteRilasciCount(ambiente: Ambiente): number {
    return this.getAmbienteRilasci(ambiente).length;
  }

  getSoftwareRilasci(): Rilascio[] {
    const flattened = (this.nuovoSoftware.assegnazioni ?? []).flatMap(
      (assegnazione) => assegnazione.rilasci ?? [],
    );
    const uniqueById = new Map<number, Rilascio>();
    flattened.forEach((rilascio) => uniqueById.set(rilascio.id, rilascio));
    return Array.from(uniqueById.values());
  }

  getAssegnazioniConRilasci(): Array<{
    clienteId: number;
    rilasci: Rilascio[];
  }> {
    return (this.nuovoSoftware.assegnazioni ?? [])
      .map((assegnazione) => ({
        clienteId: assegnazione.clienteId,
        rilasci: assegnazione.rilasci ?? [],
      }))
      .filter((entry) => entry.rilasci.length > 0);
  }

  getAmbienteDescrizioneForRilascio(rilascio: Rilascio): string {
    return (
      this.ambientiDisponibili.find(
        (ambiente) => ambiente.id === rilascio.ambienteId,
      )?.descrizione || `ID ${rilascio.ambienteId}`
    );
  }

  private enrichAmbientiConRilasci(ambienti: Ambiente[]): Ambiente[] {
    return (ambienti || []).map((ambiente) =>
      this.normalizeAmbienteConRilasci(ambiente),
    );
  }

  private normalizeAmbienteConRilasci(ambiente: Ambiente): Ambiente {
    const fromPayload = ambiente?.rilasci || [];
    if (fromPayload.length > 0) {
      return { ...ambiente, rilasci: fromPayload };
    }

    const fullAmbiente = this.ambientiDisponibili.find(
      (a) => a.id === ambiente.id,
    );
    return {
      ...ambiente,
      rilasci: fullAmbiente?.rilasci || [],
    };
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
    // Verifica cambiamenti nei campi base
    if (
      this.nuovoSoftware.descrizione !== this.originalData.descrizione ||
      this.nuovoSoftware.note !== this.originalData.note
    ) {
      return true;
    }

    // Verifica cambiamenti negli ambienti
    if (
      this.nuovoSoftware.ambienti.length !== this.originalData.ambienti.length
    ) {
      return true;
    }

    const originalAmbientiIds = this.originalData.ambienti
      .map((a) => a.id)
      .sort();
    const currentAmbientiIds = this.nuovoSoftware.ambienti
      .map((a) => a.id)
      .sort();

    return !originalAmbientiIds.every(
      (id, index) => id === currentAmbientiIds[index],
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

  // Chiamata quando cambia la selezione nel dropdown
  onAmbienteSelezionatoChange(value: string | number) {
    console.log('Ambiente selezionato value:', value, typeof value);
    const ambienteId = Number(value);
    console.log('Ambiente ID convertito:', ambienteId);

    if (ambienteId && ambienteId !== 0) {
      const ambienteSelezionato = this.ambientiDisponibili.find(
        (a) => a.id === ambienteId,
      );
      console.log('Ambiente trovato:', ambienteSelezionato);

      if (
        ambienteSelezionato &&
        !this.nuovoSoftware.ambienti.find((a) => a.id === ambienteId)
      ) {
        this.nuovoSoftware.ambienti.push(ambienteSelezionato);
        console.log('Ambienti dopo aggiunta:', this.nuovoSoftware.ambienti);
        this.onFieldChange();
      }

      // Resetta la selezione
      this.ambienteSelezionatoId = 0;
    }
  }

  // Manteniamo il vecchio metodo per compatibilità
  onAmbienteSelezionato() {
    this.onAmbienteSelezionatoChange(this.ambienteSelezionatoId);
  }

  // Rimuove un ambiente dalla lista
  rimuoviAmbiente(ambienteId: number) {
    this.nuovoSoftware.ambienti = this.nuovoSoftware.ambienti.filter(
      (a) => a.id !== ambienteId,
    );
    this.expandedAmbienti.delete(ambienteId);
    this.onFieldChange();
  }

  // Controlla se un ambiente è già stato selezionato
  isAmbienteGiaSelezionato(ambienteId: number): boolean {
    return this.nuovoSoftware.ambienti.some((a) => a.id === ambienteId);
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
      ambienteSelezionatoId: this.ambienteSelezionatoId,
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
