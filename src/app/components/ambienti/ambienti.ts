import { Component, OnInit } from '@angular/core';
import { Ambiente } from '../../models/ambiente.model';
import { AmbientiService } from '../../services/ambienti';
import { CommonModule } from '@angular/common';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AmbientiModal } from './ambienti-modal/ambienti-modal';

@Component({
  selector: 'app-ambienti',
  imports: [CommonModule, LoadingSpinner, NgbModule, AmbientiModal],
  templateUrl: './ambienti.html',
  styleUrl: './ambienti.css',
})
export class Ambienti implements OnInit {
  ambienti: Ambiente[] = [];
  loading: boolean = false;

  ngOnInit(): void {
    this.loading = true;
    this.ambienti = [];
    // Dati di esempio
    this.ambienti = [
      {
        id: '1',
        descrizione: 'Ambiente di Sviluppo',
        note: 'Ambiente per lo sviluppo delle applicazioni',
        dataCreazione: new Date('2024-01-15')
      },
      {
        id: '2',
        descrizione: 'Ambiente di Test',
        note: 'Ambiente per i test di integrazione',
        dataCreazione: new Date('2024-02-10')
      },
      {
        id: '3',
        descrizione: 'Ambiente di Produzione',
        dataCreazione: new Date('2024-03-01')
      }
    ];
    this.loading = false;
    
    // Uncomment quando il servizio sarà pronto
    // this.ambientiService.getAllAmbienti().subscribe((data) => {
    //   this.ambienti = data;
    //   this.loading = false;
    // });
  }

  constructor(
    private ambientiService: AmbientiService,
    private modalService: NgbModal
  ) {}

  onDeleteAmbiente(id_ambiente_da_eliminare: string) {
    this.ambientiService.deleteAmbiente(id_ambiente_da_eliminare);
  }

  openAmbienteModal(ambiente?: Ambiente) {
    const modalRef = this.modalService.open(AmbientiModal, {
      backdrop: true,
      keyboard: true,
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
