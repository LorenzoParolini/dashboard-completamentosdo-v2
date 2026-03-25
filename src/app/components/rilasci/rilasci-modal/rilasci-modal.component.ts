import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NgbActiveModal,
  NgbModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';

import { Rilascio } from '../../../models/rilascio.model';
import { MinimizedModalsService } from '../../../services/minimized-modals.service';
import { ConfirmationModalComponent } from '../../confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-rilasci-modal',
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './rilasci-modal.component.html',
  styleUrls: ['./rilasci-modal.component.css'],
})
export class RilasciModalComponent implements OnInit {
  @Input() rilascio?: Rilascio;
  @Input() modalId?: string;
  @Input() isRestoredFromMinimized?: boolean = false;

  nuovoRilascio: Rilascio = {
    id: 0,
    branch: '',
    commit: '',
    deployedBy: '',
    ultimoAggiornamento: '',
    build: '',
    note: '',
    versioneCorrente: '',
  };

  private originalData: Rilascio = {
    id: 0,
    branch: '',
    commit: '',
    deployedBy: '',
    ultimoAggiornamento: '',
    build: '',
    note: '',
    versioneCorrente: '',
  };

  private hasUnsavedChanges = false;

  touchedFields = {
    branch: false,
    commit: false,
    deployedBy: false,
    build: false,
    note: false,
    versioneCorrente: false,
  };

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    private minimizedModalsService: MinimizedModalsService,
  ) {}

  ngOnInit() {
    if (this.rilascio) {
      if (!this.isRestoredFromMinimized) {
        this.nuovoRilascio = {
          ...this.rilascio,
          ultimoAggiornamento: this.toDateTimeLocalValue(
            this.rilascio.ultimoAggiornamento,
          ),
        };
      }
      this.originalData = {
        ...this.rilascio,
      };
    } else {
      this.nuovoRilascio.ultimoAggiornamento = this.toDateTimeLocalValue(
        new Date(),
      );
      this.originalData = {
        ...this.nuovoRilascio,
      };
    }
  }

  onFieldChange() {
    this.hasUnsavedChanges = this.checkForChanges();
  }

  onFieldBlur(field: keyof typeof this.touchedFields) {
    this.touchedFields[field] = true;
  }

  private markAllFieldsAsTouched() {
    this.touchedFields.branch = true;
    this.touchedFields.commit = true;
    this.touchedFields.deployedBy = true;
    this.touchedFields.build = true;
    this.touchedFields.note = true;
    this.touchedFields.versioneCorrente = true;
  }

  private normalizeText(value?: string | null): string {
    return (value ?? '').trim();
  }

  isBranchValid(): boolean {
    return (this.nuovoRilascio.branch ?? '').length <= 100;
  }

  isCommitValid(): boolean {
    return (this.nuovoRilascio.commit ?? '').length <= 40;
  }

  isDeployedByValid(): boolean {
    return (this.nuovoRilascio.deployedBy ?? '').length <= 100;
  }

  isBuildValid(): boolean {
    return (this.nuovoRilascio.build ?? '').length <= 50;
  }

  isNoteValid(): boolean {
    return (this.nuovoRilascio.note ?? '').length <= 1000;
  }

  isVersioneCorrenteValid(): boolean {
    const versione = this.normalizeText(this.nuovoRilascio.versioneCorrente);
    return versione.length > 0 && versione.length <= 50;
  }

  getBranchError(): string {
    if ((this.nuovoRilascio.branch ?? '').length > 100) {
      return 'Il branch non puo superare 100 caratteri';
    }
    return '';
  }

  getCommitError(): string {
    if ((this.nuovoRilascio.commit ?? '').length > 40) {
      return 'Il commit non puo superare 40 caratteri';
    }
    return '';
  }

  getDeployedByError(): string {
    if ((this.nuovoRilascio.deployedBy ?? '').length > 100) {
      return 'Il deployedBy non puo superare 100 caratteri';
    }
    return '';
  }

  getBuildError(): string {
    if ((this.nuovoRilascio.build ?? '').length > 50) {
      return 'Il build non puo superare 50 caratteri';
    }
    return '';
  }

  getNoteError(): string {
    if ((this.nuovoRilascio.note ?? '').length > 1000) {
      return 'Le note non possono superare 1000 caratteri';
    }
    return '';
  }

  getVersioneCorrenteError(): string {
    const versione = this.normalizeText(this.nuovoRilascio.versioneCorrente);
    if (!versione) {
      return 'Versione corrente obbligatoria';
    }
    if (versione.length > 50) {
      return 'La versione non puo superare 50 caratteri';
    }
    return '';
  }

  isFieldInvalid(
    field:
      | 'branch'
      | 'commit'
      | 'deployedBy'
      | 'build'
      | 'note'
      | 'versioneCorrente',
  ): boolean {
    if (!this.touchedFields[field]) {
      return false;
    }

    if (field === 'branch') return !this.isBranchValid();
    if (field === 'commit') return !this.isCommitValid();
    if (field === 'deployedBy') return !this.isDeployedByValid();
    if (field === 'build') return !this.isBuildValid();
    if (field === 'note') return !this.isNoteValid();

    return !this.isVersioneCorrenteValid();
  }

  isFieldValid(
    field:
      | 'branch'
      | 'commit'
      | 'deployedBy'
      | 'build'
      | 'note'
      | 'versioneCorrente',
  ): boolean {
    return this.touchedFields[field] && !this.isFieldInvalid(field);
  }

  private isFormValid(): boolean {
    return (
      this.isBranchValid() &&
      this.isCommitValid() &&
      this.isDeployedByValid() &&
      this.isBuildValid() &&
      this.isNoteValid() &&
      this.isVersioneCorrenteValid()
    );
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
    return (
      this.nuovoRilascio.branch !== this.originalData.branch ||
      this.nuovoRilascio.commit !== this.originalData.commit ||
      this.nuovoRilascio.deployedBy !== this.originalData.deployedBy ||
      this.nuovoRilascio.build !== this.originalData.build ||
      this.nuovoRilascio.note !== this.originalData.note ||
      this.nuovoRilascio.versioneCorrente !==
        this.originalData.versioneCorrente ||
      this.toBackendLocalDateTime(this.nuovoRilascio.ultimoAggiornamento) !==
        this.toBackendLocalDateTime(this.originalData.ultimoAggiornamento)
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.hasUnsavedChanges) {
      $event.returnValue = true;
    }
  }

  salva() {
    this.markAllFieldsAsTouched();

    if (!this.isFormValid()) {
      return;
    }

    this.nuovoRilascio.branch = this.normalizeText(this.nuovoRilascio.branch);
    this.nuovoRilascio.commit = this.normalizeText(this.nuovoRilascio.commit);
    this.nuovoRilascio.deployedBy = this.normalizeText(
      this.nuovoRilascio.deployedBy,
    );
    this.nuovoRilascio.build = this.normalizeText(this.nuovoRilascio.build);
    this.nuovoRilascio.note = this.normalizeText(this.nuovoRilascio.note);
    this.nuovoRilascio.versioneCorrente = this.normalizeText(
      this.nuovoRilascio.versioneCorrente,
    );

    const normalizedDateTime = this.toBackendLocalDateTime(
      this.nuovoRilascio.ultimoAggiornamento || new Date(),
    );
    this.nuovoRilascio.ultimoAggiornamento =
      normalizedDateTime || this.toBackendLocalDateTime(new Date());

    this.hasUnsavedChanges = false;
    this.activeModal.close(this.nuovoRilascio);
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
      () => {},
    );
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  minimizeModal() {
    const modalId =
      this.modalId ||
      this.minimizedModalsService.generateModalId(
        'rilasci',
        this.rilascio ? 'edit' : 'add',
        this.rilascio?.id,
      );

    const description =
      this.nuovoRilascio.versioneCorrente ||
      (this.rilascio ? this.rilascio.versioneCorrente : 'Nuovo Rilascio');

    this.minimizedModalsService.addMinimizedModal({
      id: modalId,
      type: this.rilascio ? 'edit' : 'add',
      section: 'rilasci',
      description,
      data: this.rilascio,
      formData: {
        ...this.nuovoRilascio,
      },
    });

    this.hasUnsavedChanges = false;
    this.activeModal.dismiss();
  }
}
