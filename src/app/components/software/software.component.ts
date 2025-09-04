import { Component, OnInit } from '@angular/core';
import { Software as SoftwareModel } from '../../models/software.model';
import { SoftwareService } from '../../services/software.service';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SoftwareModalComponent } from './software-modal/software-modal.component';

@Component({
  selector: 'app-software',
  imports: [CommonModule, LoadingSpinnerComponent, NgbModule, SoftwareModalComponent],
  templateUrl: './software.component.html',
  styleUrl: './software.component.css',
})
export class SoftwareComponent implements OnInit {
  software: SoftwareModel[] = [];
  loading: boolean = false;

  ngOnInit(): void {
    this.loading = true;
    this.software = [];
    this.softwareService.getAllSoftware().subscribe((data) => {
      this.software = data;
      this.loading = false;
    });
  }

  constructor(
    private softwareService: SoftwareService,
    private modalService: NgbModal
  ) {}

  onDeleteSoftware(id_software_da_eliminare: string) {
    this.softwareService.deleteSoftware(id_software_da_eliminare);
    this.software = this.software.filter(s => s.id !== id_software_da_eliminare);
  }

  openSoftwareModal(software?: SoftwareModel) {
    const modalRef = this.modalService.open(SoftwareModalComponent, {
      backdrop: true, // permette la chiusura cliccando fuori
      keyboard: true, // permette la chiusura con ESC
      centered: true, // centra la modale
      size: 'lg' // dimensione grande
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
