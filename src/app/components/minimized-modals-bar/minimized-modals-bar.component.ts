import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import {
  MinimizedModalsService,
  MinimizedModal,
} from '../../services/minimized-modals.service';
import { MinimizedModalItemComponent } from '../minimized-modal-item/minimized-modal-item.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// Import delle modali
import { ClientiModalComponent } from '../clienti/clienti-modal/clienti-modal.component';
import { RegioniModalComponent } from '../regioni/regioni-modal/regioni-modal.component';
import { SoftwareModalComponent } from '../software/software-modal/software-modal.component';
import { AmbientiModalComponent } from '../ambienti/ambienti-modal/ambienti-modal.component';
import { RilasciModalComponent } from '../rilasci/rilasci-modal/rilasci-modal.component';

@Component({
  selector: 'app-minimized-modals-bar',
  imports: [CommonModule, MinimizedModalItemComponent],
  templateUrl: './minimized-modals-bar.component.html',
  styleUrls: ['./minimized-modals-bar.component.css'],
})
export class MinimizedModalsBarComponent implements OnInit, OnDestroy {
  minimizedModals$: Observable<MinimizedModal[]>;
  private subscriptions: Subscription[] = [];

  constructor(
    private minimizedModalsService: MinimizedModalsService,
    private modalService: NgbModal,
  ) {
    this.minimizedModals$ = this.minimizedModalsService.minimizedModals$;
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  onRestoreModal(modalId: string): void {
    const modal = this.minimizedModalsService.getMinimizedModal(modalId);
    if (!modal) return;

    console.log('Ripristinando modale:', modal);

    // Rimuovi la modale minimizzata
    this.minimizedModalsService.removeMinimizedModal(modalId);

    // Apri la modale corrispondente con i dati salvati
    this.openModalByType(modal);
  }

  onCloseModal(modalId: string): void {
    this.minimizedModalsService.removeMinimizedModal(modalId);
  }

  // TrackBy function per ottimizzare le performance con ngFor
  trackByModalId(_index: number, modal: MinimizedModal): string {
    return modal.id;
  }

  private openModalByType(modal: MinimizedModal): void {
    let modalRef: any;

    switch (modal.section) {
      case 'clienti':
        modalRef = this.modalService.open(ClientiModalComponent, {
          size: 'lg',
          backdrop: false,
          container: 'body',
        });
        if (modal.type === 'edit' && modal.data) {
          modalRef.componentInstance.cliente = modal.data;
        }
        // Ripristina i dati del form PRIMA che ngOnInit sia chiamato
        if (modal.formData) {
          console.log('Ripristinando dati form clienti:', modal.formData);
          modalRef.componentInstance.nuovoCliente = { ...modal.formData };
          // Ripristina anche il campo di selezione se presente
          if (modal.formData.softwareSelezionatoId) {
            modalRef.componentInstance.softwareSelezionatoId =
              modal.formData.softwareSelezionatoId;
          }
          // Marca che questi sono dati ripristinati
          modalRef.componentInstance.isRestoredFromMinimized = true;
        }
        break;

      case 'regioni':
        modalRef = this.modalService.open(RegioniModalComponent, {
          size: 'lg',
          backdrop: false,
          container: 'body',
        });
        if (modal.type === 'edit' && modal.data) {
          modalRef.componentInstance.regione = modal.data;
        }
        if (modal.formData) {
          modalRef.componentInstance.nuovaRegione = { ...modal.formData };
          modalRef.componentInstance.isRestoredFromMinimized = true;
        }
        break;

      case 'software':
        modalRef = this.modalService.open(SoftwareModalComponent, {
          size: 'lg',
          backdrop: false,
          container: 'body',
        });
        if (modal.type === 'edit' && modal.data) {
          modalRef.componentInstance.software = modal.data;
        }
        if (modal.formData) {
          modalRef.componentInstance.nuovoSoftware = { ...modal.formData };
          if (modal.formData.clienteSelezionatoId) {
            modalRef.componentInstance.clienteSelezionatoId =
              modal.formData.clienteSelezionatoId;
          }
          modalRef.componentInstance.isRestoredFromMinimized = true;
        }
        break;

      case 'ambienti':
        modalRef = this.modalService.open(AmbientiModalComponent, {
          size: 'lg',
          backdrop: false,
          container: 'body',
        });
        if (modal.type === 'edit' && modal.data) {
          modalRef.componentInstance.ambiente = modal.data;
        }
        if (modal.formData) {
          modalRef.componentInstance.nuovoAmbiente = { ...modal.formData };
          modalRef.componentInstance.isRestoredFromMinimized = true;
        }
        break;

      case 'rilasci':
        modalRef = this.modalService.open(RilasciModalComponent, {
          size: 'lg',
          backdrop: false,
          container: 'body',
        });
        if (modal.type === 'edit' && modal.data) {
          modalRef.componentInstance.rilascio = modal.data;
        }
        if (modal.formData) {
          modalRef.componentInstance.nuovoRilascio = { ...modal.formData };
          modalRef.componentInstance.isRestoredFromMinimized = true;
        }
        break;
    }

    // Aggiorna l'ID della modale per prevenire conflitti
    if (modalRef) {
      const newModalId = this.minimizedModalsService.generateModalId(
        modal.section,
        modal.type,
        modal.data?.id,
      );
      modalRef.componentInstance.modalId = newModalId;

      // Gestisci la chiusura della modale ripristinata
      modalRef.result.catch(() => {
        // La modale è stata chiusa, non fare nulla di speciale
      });
    }
  }
}
