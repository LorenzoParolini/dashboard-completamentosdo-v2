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
  regioni: Regione[] = new Array<Regione>();
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

  openRegioneModal(regione?: Regione) {
    const modalRef = this.modalService.open(RegioniModal, {
      backdrop: 'static',
      keyboard: false,
    });
    // Esempio: puoi passare dati alla modale
    // modalRef.componentInstance.regione = regione ? { ...regione } : undefined;
    modalRef.result.then(
      (result) => {
        // gestisci il risultato della modale qui
      },
      () => {}
    );
  }
}
