import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NgbActiveModal,
  NgbModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { Cliente } from '../../../models/cliente.model';
import { Regione } from '../../../models/regione.model';
import { Software } from '../../../models/software.model';
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
  styleUrls: ['./clienti-modal.component.css'],
})
export class ClientiModalComponent implements OnInit {
  @Input() cliente?: Cliente;
  @Input() modalId?: string;
  @Input() isRestoredFromMinimized?: boolean = false;

  nuovoCliente: Cliente = {
    id: 0,
    descrizione: '',
    regione: { id: 0, descrizione: '', codice: '', x: 0, y: 0 },
    software: [],
  };

  // Campo per il menu a tendina
  softwareSelezionatoId: number = 0;

  regioniDisponibili: Regione[] = [];
  softwareDisponibili: Software[] = [];

  private originalData: Cliente = {
    id: 0,
    descrizione: '',
    regione: { id: 0, descrizione: '', codice: '', x: 0, y: 0 },
    software: [],
  };

  private hasUnsavedChanges = false;

  // Traccia i campi su cui l'utente ha già perso il focus (blur).
  // Usiamo questo stato per mostrare feedback solo al momento giusto.
  touchedFields = {
    descrizione: false,
    regione: false,
  };

  constructor(
    public activeModal: NgbActiveModal,
    private regioniService: RegioniService,
    private softwareService: SoftwareService,
    private modalService: NgbModal,
    private minimizedModalsService: MinimizedModalsService,
  ) {}

  ngOnInit() {
    // Carica regioni disponibili
    this.regioniService.getAllRegioni().subscribe((regioni) => {
      this.regioniDisponibili = regioni;
      console.log('Regioni disponibili caricate:', this.regioniDisponibili);

      // Se siamo in modalità modifica, assicuriamoci che la regione sia settata correttamente
      if (this.cliente) {
        console.log('Modalità modifica - Cliente ricevuto:', this.cliente);
        // Solo se non abbiamo già dati ripristinati da una modale minimizzata
        if (!this.isRestoredFromMinimized) {
          this.nuovoCliente = {
            ...this.cliente,
            regione: { ...this.cliente.regione },
            software: [...this.cliente.software],
          };
        }
        this.originalData = {
          ...this.cliente,
          regione: { ...this.cliente.regione },
          software: [...this.cliente.software],
        };
        console.log('Cliente da modificare:', this.cliente);
        console.log('Regione del cliente:', this.cliente.regione);
        console.log('Software del cliente:', this.nuovoCliente.software);
        console.log('ID regione del cliente:', this.cliente.regione.id);
        this.normalizeSoftwareSelection();
      }
    });

    // Carica software disponibili
    this.softwareService.getAllSoftware().subscribe((software) => {
      this.softwareDisponibili = software;
      console.log('Software disponibili caricati:', this.softwareDisponibili);
    });

    if (!this.cliente) {
      console.log('Modalità aggiunta - Nuovo cliente');
      this.originalData = {
        ...this.nuovoCliente,
        regione: { ...this.nuovoCliente.regione },
        software: [...this.nuovoCliente.software],
      };
      this.normalizeSoftwareSelection();
    }
  }

  private normalizeSoftwareSelection() {
    this.nuovoCliente.software = Array.from(
      new Map(
        this.nuovoCliente.software.map((software) => [software.id, software]),
      ).values(),
    );

    this.originalData.software = Array.from(
      new Map(
        this.originalData.software.map((software) => [software.id, software]),
      ).values(),
    );

    this.softwareSelezionatoId = 0;
  }

  onFieldChange() {
    this.hasUnsavedChanges = this.checkForChanges();
  }

  // Attiva la validazione visuale del campo quando l'utente esce dall'input.
  onFieldBlur(field: keyof typeof this.touchedFields) {
    this.touchedFields[field] = true;
  }

  // Al submit marchiamo tutti i campi vincolati per mostrare tutti gli errori.
  private markAllFieldsAsTouched() {
    this.touchedFields.descrizione = true;
    this.touchedFields.regione = true;
  }

  // Standardizza le stringhe prima dei controlli e del salvataggio.
  private normalizeText(value?: string | null): string {
    return (value ?? '').trim();
  }

  // Vincolo ClienteInputDTO: descrizione obbligatoria con lunghezza 3..100.
  isDescrizioneValid(): boolean {
    const descrizione = this.normalizeText(this.nuovoCliente.descrizione);
    return descrizione.length >= 3 && descrizione.length <= 100;
  }

  // Messaggio di errore specifico da mostrare sotto la descrizione.
  getDescrizioneError(): string {
    const descrizione = this.normalizeText(this.nuovoCliente.descrizione);
    if (!descrizione) {
      return 'Descrizione obbligatoria';
    }
    if (descrizione.length < 3 || descrizione.length > 100) {
      return 'La descrizione deve essere tra 3 e 100 caratteri';
    }
    return '';
  }

  // Vincolo ClienteInputDTO: regioneId obbligatorio.
  isRegioneValid(): boolean {
    return (this.nuovoCliente.regione?.id ?? 0) > 0;
  }

  // Messaggio da mostrare quando la regione non è stata selezionata.
  getRegioneError(): string {
    if (!this.isRegioneValid()) {
      return 'Regione obbligatoria';
    }
    return '';
  }

  // Determina quando un campo deve apparire "in errore" (bordo rosso + testo).
  isFieldInvalid(field: 'descrizione' | 'regione'): boolean {
    if (!this.touchedFields[field]) {
      return false;
    }

    if (field === 'descrizione') {
      return !this.isDescrizioneValid();
    }

    return !this.isRegioneValid();
  }

  // Determina quando un campo deve apparire "valido" (bordo verde).
  isFieldValid(field: 'descrizione' | 'regione'): boolean {
    return this.touchedFields[field] && !this.isFieldInvalid(field);
  }

  // Validazione aggregata eseguita prima della chiusura con salvataggio.
  private isFormValid(): boolean {
    return this.isDescrizioneValid() && this.isRegioneValid();
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
    if (
      this.nuovoCliente.software.length !== this.originalData.software.length
    ) {
      return true;
    }

    const originalSoftwareIds = this.originalData.software
      .map((s) => s.id)
      .sort();
    const currentSoftwareIds = this.nuovoCliente.software
      .map((s) => s.id)
      .sort();

    return !originalSoftwareIds.every(
      (id, index) => id === currentSoftwareIds[index],
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.hasUnsavedChanges) {
      $event.returnValue = true;
    }
  }

  salva() {
    // Mostra eventuali errori anche se l'utente non ha fatto blur su tutti i campi.
    this.markAllFieldsAsTouched();

    // Blocca il submit finché i requisiti DTO non sono rispettati.
    if (!this.isFormValid()) {
      return;
    }

    // Pulizia del testo prima del ritorno dati al componente padre.
    this.nuovoCliente.descrizione = this.normalizeText(
      this.nuovoCliente.descrizione,
    );

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

  onRegioneChange(event: any) {
    const regioneId = Number(event.target.value);
    const regione = this.regioniDisponibili.find((r) => r.id === regioneId);
    if (regione) {
      this.nuovoCliente.regione = regione;
    } else {
      // Se non viene trovata la regione, reimposta la regione vuota
      this.nuovoCliente.regione = {
        id: 0,
        descrizione: '',
        codice: '',
        x: 0,
        y: 0,
      };
    }
    this.onFieldChange();
  }

  // Chiamata quando cambia la selezione nel dropdown software
  onSoftwareSelezionatoChange(value: string | number) {
    const softwareId = Number(value);

    this.softwareSelezionatoId = softwareId;

    if (softwareId === 0) {
      return;
    }

    const softwareSelezionato = this.softwareDisponibili.find(
      (s) => s.id === softwareId,
    );
    if (!softwareSelezionato) {
      return;
    }

    const softwareGiaAssociato = this.nuovoCliente.software.some(
      (software) => software.id === softwareId,
    );

    if (!softwareGiaAssociato) {
      this.nuovoCliente.software = [
        ...this.nuovoCliente.software,
        softwareSelezionato,
      ];
      this.onFieldChange();
    }

    this.softwareSelezionatoId = 0;
  }

  // Rimuove un software dalla lista
  rimuoviSoftware(softwareId: number) {
    this.nuovoCliente.software = this.nuovoCliente.software.filter(
      (s) => s.id !== softwareId,
    );
    if (this.softwareSelezionatoId === softwareId) {
      this.softwareSelezionatoId = 0;
    }
    this.onFieldChange();
  }

  // Minimizza la modale salvando i dati nel servizio
  minimizeModal() {
    const modalId =
      this.modalId ||
      this.minimizedModalsService.generateModalId(
        'clienti',
        this.cliente ? 'edit' : 'add',
        this.cliente?.id,
      );

    const description =
      this.nuovoCliente.descrizione ||
      (this.cliente ? this.cliente.descrizione : 'Nuovo Cliente');

    // Crea una copia completa dei dati del form inclusi i campi di selezione
    const formDataToSave = {
      ...this.nuovoCliente,
      softwareSelezionatoId: this.softwareSelezionatoId,
      // Salva anche lo stato originale per riferimento
      originalData: this.originalData,
    };

    console.log(
      'Salvando dati form clienti per minimizzazione:',
      formDataToSave,
    );

    this.minimizedModalsService.addMinimizedModal({
      id: modalId,
      type: this.cliente ? 'edit' : 'add',
      section: 'clienti',
      description: description,
      data: this.cliente,
      formData: formDataToSave,
    });

    this.hasUnsavedChanges = false;
    this.activeModal.dismiss();
  }
}
