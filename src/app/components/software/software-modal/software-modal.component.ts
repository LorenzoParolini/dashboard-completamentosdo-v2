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
    dataUltimoAggiornamento: '',
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
    dataUltimoAggiornamento: '',
  };

  private hasUnsavedChanges = false;

  constructor(
    public activeModal: NgbActiveModal,
    private softwareService: SoftwareService,
    private ambientiService: AmbientiService,
    private modalService: NgbModal,
    private minimizedModalsService: MinimizedModalsService,
  ) {}

  

  ngOnInit() {
    // Carica gli ambienti dal servizio
    this.ambientiService.getAllAmbienti().subscribe((ambienti) => {
      this.ambientiDisponibili = ambienti;
      console.log('Ambienti disponibili caricati:', this.ambientiDisponibili);
    });

    if (this.software) {
      console.log('Modalità modifica - Software ricevuto:', this.software);
      // Solo se non abbiamo già dati ripristinati da una modale minimizzata
      if (!this.isRestoredFromMinimized) {
        this.nuovoSoftware = {
          ...this.software,
          ambienti: [...this.software.ambienti],
          dataUltimoAggiornamento: this.toDateTimeLocalValue(
            this.software.dataUltimoAggiornamento,
          ),
        };
      } else {
        this.nuovoSoftware = {
          ...this.nuovoSoftware,
          ambienti: [...this.nuovoSoftware.ambienti],
          dataUltimoAggiornamento: this.toDateTimeLocalValue(
            this.nuovoSoftware.dataUltimoAggiornamento,
          ),
        };
      }
      this.originalData = {
        ...this.software,
        ambienti: [...this.software.ambienti],
        dataUltimoAggiornamento: this.toBackendLocalDateTime(
          this.software.dataUltimoAggiornamento,
        ),
      };
      console.log('Ambienti del software:', this.nuovoSoftware.ambienti);
    } else {
      console.log('Modalità aggiunta - Nuovo software');
      

      this.nuovoSoftware = {
        ...this.nuovoSoftware,
        ambienti: [...this.nuovoSoftware.ambienti],
        dataUltimoAggiornamento: this.toDateTimeLocalValue(
          this.nuovoSoftware.dataUltimoAggiornamento || new Date(),
        ),
      };

      this.originalData = {
        ...this.nuovoSoftware,
        ambienti: [...this.nuovoSoftware.ambienti],
        dataUltimoAggiornamento: this.toBackendLocalDateTime(
          this.nuovoSoftware.dataUltimoAggiornamento,
        ),
      };
    }
  }

  onFieldChange() {
    this.hasUnsavedChanges = this.checkForChanges();
  }

  private formatLocalDateTime(
    date: Date,
    includeSeconds: boolean = false,
  ): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    if (includeSeconds) {
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private toDateTimeLocalValue(value?: string | Date | null): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      const normalized = value.trim().replace(' ', 'T').replace('Z', '');
      const dateTimeMatch = normalized.match(
        /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/,
      );
      if (dateTimeMatch) {
        return dateTimeMatch[1];
      }
    }

    const parsedDate = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsedDate.getTime())
      ? ''
      : this.formatLocalDateTime(parsedDate);
  }

  private toBackendLocalDateTime(value?: string | Date | null): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      const normalized = value.trim().replace(' ', 'T').replace('Z', '');

      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
        return `${normalized}:00`;
      }

      const dateTimeWithSecondsMatch = normalized.match(
        /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/,
      );
      if (dateTimeWithSecondsMatch) {
        return dateTimeWithSecondsMatch[1];
      }
    }

    const parsedDate = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsedDate.getTime())
      ? ''
      : this.formatLocalDateTime(parsedDate, true);
  }

  private checkForChanges(): boolean {
    // Verifica cambiamenti nei campi base
    if (
      this.nuovoSoftware.descrizione !== this.originalData.descrizione ||
      this.nuovoSoftware.note !== this.originalData.note ||
      this.nuovoSoftware.versioneCorrente !== this.originalData.versioneCorrente
    ) {
      return true;
    }

    const currentDateTime = this.toBackendLocalDateTime(
      this.nuovoSoftware.dataUltimoAggiornamento,
    );
    const originalDateTime = this.toBackendLocalDateTime(
      this.originalData.dataUltimoAggiornamento,
    );
    if (currentDateTime !== originalDateTime) {
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
    const normalizedDateTime = this.toBackendLocalDateTime(
      this.nuovoSoftware.dataUltimoAggiornamento || new Date(),
    );

    this.nuovoSoftware.dataUltimoAggiornamento =
      normalizedDateTime || this.toBackendLocalDateTime(new Date());

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
