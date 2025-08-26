import { Component, OnInit } from '@angular/core';
import { Regione } from '../../models/regione.model';
import { RegioniService } from '../../services/regioni';
import { CommonModule } from '@angular/common';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RegioniModal } from './regioni-modal/regioni-modal';

@Component({
  selector: 'app-regioni',
  imports: [CommonModule, LoadingSpinner, NgbModule, RegioniModal],
  templateUrl: './regioni.html',
  styleUrl: './regioni.css',
})
export class Regioni implements OnInit {
  regioni: Regione[] = [];
  loading: boolean = false;

  ngOnInit(): void {
    this.loading = true;
    this.regioni = [];
    this.regioniService.getAllRegioni().subscribe((data) => {
      this.regioni = data;
      this.loading = false;
    });
  }

  constructor(
    private regioniService: RegioniService,
    private modalService: NgbModal
  ) {}

  onDeleteRegione(id_regione_da_eliminare: string) {
    this.regioniService.deleteRegione(id_regione_da_eliminare);
  }

  // Metodo attuale con NgBootstrap
  openRegioneModal(regione?: Regione) {
    const modalRef = this.modalService.open(RegioniModal, {
      backdrop: true, // permette la chiusura del modal cliccando fuori
      keyboard: true, // permette la chiusura del modal con il tasto ESC
    });
    if (regione) {
      modalRef.componentInstance.regione = regione;
    }
    
    // gestisce il risultato della modale
    modalRef.result.then(
      (result: Regione) => {
        if (regione) {
          // Modifica: aggiorna la regione nella lista
          const idx = this.regioni.findIndex((r) => r.id === result.id);
          if (idx !== -1) this.regioni[idx] = result;
        } else {
          // Aggiunta: aggiungi la nuova regione
          this.regioni.push(result);
        }
      },
      () => {}
    );
  }

  // Metodo con Angular Material Dialog (commentato per ora)
  /*
  openRegioneModalMaterial(regione?: Regione) {
    const dialogRef = this.dialog.open(RegioniModal, {
      width: '500px',
      height: 'auto',
      data: { regione: regione } as DialogData,
      disableClose: false, // permette la chiusura con ESC o backdrop
      autoFocus: true,
      restoreFocus: true
    });

    // Esempi di utilizzo degli eventi e metodi del dialog:

    // 1. Evento dopo l'apertura
    dialogRef.afterOpened().subscribe(() => {
      console.log('Dialog aperto');
    });

    // 2. Evento prima della chiusura
    dialogRef.beforeClosed().subscribe(result => {
      console.log('Dialog sta per chiudersi con risultato:', result);
    });

    // 3. Evento dopo la chiusura
    dialogRef.afterClosed().subscribe((result: Regione) => {
      console.log('Dialog chiuso');
      if (result) {
        if (regione) {
          // Modifica: aggiorna la regione nella lista
          const idx = this.regioni.findIndex((r) => r.id === result.id);
          if (idx !== -1) this.regioni[idx] = result;
        } else {
          // Aggiunta: aggiungi la nuova regione
          this.regioni.push(result);
        }
      }
    });

    // 4. Evento click su backdrop
    dialogRef.backdropClick().subscribe(() => {
      console.log('Click su backdrop - dialog si chiuderà');
    });

    // 5. Esempi di controllo programmatico del dialog:
    
    // Blocca la chiusura per 3 secondi
    setTimeout(() => {
      dialogRef.disableClose = true;
      console.log('Chiusura bloccata');
      
      setTimeout(() => {
        dialogRef.disableClose = false;
        console.log('Chiusura sbloccata');
      }, 3000);
    }, 1000);

    // Cambia dimensioni dopo 2 secondi
    setTimeout(() => {
      dialogRef.updateSize('600px', '400px');
      console.log('Dimensioni aggiornate');
    }, 2000);

    // Cambia posizione dopo 4 secondi
    setTimeout(() => {
      dialogRef.updatePosition({ top: '50px', left: '100px' });
      console.log('Posizione aggiornata');
    }, 4000);

    // Chiudi programmaticamente dopo 10 secondi
    setTimeout(() => {
      dialogRef.close('Chiuso automaticamente');
    }, 10000);
  }
  */
}
