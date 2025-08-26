import { Component, OnInit } from '@angular/core';
import { Software as SoftwareModel } from '../../models/software.model';
import { SoftwareService } from '../../services/software';
import { CommonModule } from '@angular/common';
import { LoadingSpinner } from '../loading-spinner/loading-spinner';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SoftwareModal } from './software-modal/software-modal';

@Component({
  selector: 'app-software',
  imports: [CommonModule, LoadingSpinner, NgbModule, SoftwareModal],
  templateUrl: './software.html',
  styleUrl: './software.css',
})
export class SoftwareComponent implements OnInit {
  software: SoftwareModel[] = [];
  loading: boolean = false;

  ngOnInit(): void {
    this.loading = true;
    this.software = [];
    // Dati di esempio
    this.software = [
      {
        id: '1',
        descrizione: 'ERP System',
        note: 'Sistema gestionale completo per aziende',
        ambienti: [
          { id: '1', descrizione: 'Ambiente di Sviluppo', note: 'Per sviluppo', dataCreazione: new Date('2024-01-15') },
          { id: '2', descrizione: 'Ambiente di Produzione', dataCreazione: new Date('2024-03-01') }
        ],
        versioneCorrente: '2.1.0',
        dataUltimoAggiornamento: new Date('2024-01-15')
      },
      {
        id: '2',
        descrizione: 'CRM Platform',
        note: 'Gestione relazioni con clienti',
        ambienti: [
          { id: '2', descrizione: 'Ambiente di Produzione', dataCreazione: new Date('2024-03-01') }
        ],
        versioneCorrente: '1.5.2',
        dataUltimoAggiornamento: new Date('2024-02-01')
      },
      {
        id: '3',
        descrizione: 'Accounting Software',
        ambienti: [],
        versioneCorrente: '3.0.1',
        dataUltimoAggiornamento: new Date('2024-01-20')
      }
    ];
    this.loading = false;
    
    // Uncomment quando il servizio sarà pronto
    // this.softwareService.getAllSoftware().subscribe((data) => {
    //   this.software = data;
    //   this.loading = false;
    // });
  }

  constructor(
    private softwareService: SoftwareService,
    private modalService: NgbModal
  ) {}

  onDeleteSoftware(id_software_da_eliminare: string) {
    this.softwareService.deleteSoftware(id_software_da_eliminare);
  }

  openSoftwareModal(software?: SoftwareModel) {
    const modalRef = this.modalService.open(SoftwareModal, {
      backdrop: true,
      keyboard: true,
    });
    if (software) {
      modalRef.componentInstance.software = software;
    }
    
    modalRef.result.then(
      (result: SoftwareModel) => {
        if (software) {
          const idx = this.software.findIndex((s) => s.id === result.id);
          if (idx !== -1) this.software[idx] = result;
        } else {
          this.software.push(result);
        }
      },
      () => {}
    );
  }
}
