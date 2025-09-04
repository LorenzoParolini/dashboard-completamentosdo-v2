import { Component, OnInit } from '@angular/core';
import { Ambiente } from '../../models/ambiente.model';
import { AmbientiService } from '../../services/ambienti.service';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AmbientiModalComponent } from './ambienti-modal/ambienti-modal.component';

@Component({
  selector: 'app-ambienti',
  imports: [CommonModule, LoadingSpinnerComponent, NgbModule, AmbientiModalComponent],
  templateUrl: './ambienti.component.html',
  styleUrl: './ambienti.component.css',
})
export class AmbientiComponent implements OnInit {
  ambienti: Ambiente[] = [];
  loading: boolean = false;

  ngOnInit(): void {
    this.loading = true;
    this.ambienti = [];
    setTimeout(() => {
      this.ambientiService.getAllAmbienti().subscribe((data) => {
        this.ambienti = data;
        this.loading = false;
      });
    }, 1200);
  }

  constructor(
    private ambientiService: AmbientiService,
    private modalService: NgbModal
  ) {}

  onDeleteAmbiente(id_ambiente_da_eliminare: string) {
    this.ambientiService.deleteAmbiente(id_ambiente_da_eliminare);
    this.ambienti = this.ambienti.filter(a => a.id !== id_ambiente_da_eliminare);
  }

  openAmbienteModal(ambiente?: Ambiente) {
    const modalRef = this.modalService.open(AmbientiModalComponent, {
      backdrop: 'static', // impedisce la chiusura cliccando fuori
      keyboard: true, // permette la chiusura con ESC
      centered: true, // centra la modale
      size: 'lg' // dimensione grande
    });
    if (ambiente) {
      modalRef.componentInstance.ambiente = ambiente;
    }
    
    modalRef.result.then(
      (result: Ambiente) => {
        if (ambiente) {
          const idx = this.ambienti.findIndex((a) => a.id === result.id);
          if (idx !== -1) this.ambienti[idx] = result;
        } else {
          this.ambienti.push(result);
        }
      },
      () => {}
    );
  }
}
