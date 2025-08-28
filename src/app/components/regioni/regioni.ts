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
    this.regioni = this.regioni.filter(r => r.id !== id_regione_da_eliminare);
  }

  // Metodo attuale con NgBootstrap
  openRegioneModal(regione?: Regione) {
    const modalRef = this.modalService.open(RegioniModal, {
      backdrop: 'static', // impedisce la chiusura cliccando fuori
      keyboard: true, // permette la chiusura con ESC
      centered: true, // centra la modale
      size: 'lg' // dimensione grande
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
}
