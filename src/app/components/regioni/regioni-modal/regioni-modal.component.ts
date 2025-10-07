import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Regione } from '../../../models/regione.model';
import { RegioniService } from '../../../services/regioni.service';
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
    coordinate: { x: 0, y: 0 }
  };

  private originalData: Regione = {
    id: 0,
    descrizione: '',
    codice: '',
    coordinate: { x: 0, y: 0 }
  };

  private hasUnsavedChanges = false;

  constructor(
    public activeModal: NgbActiveModal, 
    private regioniService: RegioniService,
    private modalService: NgbModal,
    private minimizedModalsService: MinimizedModalsService
  ) {
  }

  private nextId: number = 1;

  private setNextId(): void {
    this.regioniService.getAllRegioni().subscribe(regioni => {
      this.nextId = regioni.length > 0 ? Math.max(...regioni.map(r => r.id)) + 1 : 1;
    });
  }

  ngOnInit() {
    if (this.regione) {
      // Solo se non abbiamo già dati ripristinati da una modale minimizzata
      if (!this.isRestoredFromMinimized) {
        this.nuovaRegione = {
          ...this.regione,
          coordinate: {
            x: this.regione.coordinate?.x ?? 0,
            y: this.regione.coordinate?.y ?? 0
          }
        };
      }
      this.originalData = {
        ...this.regione,
        coordinate: {
          x: this.regione.coordinate?.x ?? 0,
          y: this.regione.coordinate?.y ?? 0
        }
      };
    } else {
      // Inizializza l'ID solo qui, quando il servizio è disponibile
      // Solo se non abbiamo già dati ripristinati
      if (!this.isRestoredFromMinimized && this.nuovaRegione.id === 0) {
        this.setNextId();
        this.nuovaRegione.id = this.nextId;
      }
    }
    
    if (!this.nuovaRegione.coordinate) {
      this.nuovaRegione.coordinate = { x: 0, y: 0 };
    }

    // Imposta originalData dopo aver assicurato che coordinate sia definito
    if (!this.originalData.id) {
      this.originalData = {
        ...this.nuovaRegione,
        coordinate: { x: this.nuovaRegione.coordinate.x, y: this.nuovaRegione.coordinate.y }
      };
    }
  }

  onFieldChange() {
    this.hasUnsavedChanges = this.checkForChanges();
  }

  private checkForChanges(): boolean {
    return (
      this.nuovaRegione.descrizione !== this.originalData.descrizione ||
      this.nuovaRegione.codice !== this.originalData.codice ||
      (this.nuovaRegione.coordinate?.x ?? 0) !== (this.originalData.coordinate?.x ?? 0) ||
      (this.nuovaRegione.coordinate?.y ?? 0) !== (this.originalData.coordinate?.y ?? 0)
    );
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.hasUnsavedChanges) {
      $event.returnValue = true;
    }
  }

  salva() {
    // Assicuriamoci che coordinate sia sempre definito prima del salvataggio
    if (!this.nuovaRegione.coordinate) {
      this.nuovaRegione.coordinate = { x: 0, y: 0 };
    }
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
      'regioni', 
      this.regione ? 'edit' : 'add',
      this.regione?.id
    );

    const description = this.nuovaRegione.descrizione || 
      (this.regione ? this.regione.descrizione : 'Nuova Regione');

    // Crea una copia completa dei dati del form
    const formDataToSave = {
      ...this.nuovaRegione,
      // Salva anche lo stato originale per riferimento
      originalData: this.originalData
    };

    this.minimizedModalsService.addMinimizedModal({
      id: modalId,
      type: this.regione ? 'edit' : 'add',
      section: 'regioni',
      description: description,
      data: this.regione,
      formData: formDataToSave
    });

    this.hasUnsavedChanges = false;
    this.activeModal.dismiss();
  }

}
