import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-regioni-modal',
  imports: [CommonModule, FormsModule, NgbModule],
  templateUrl: './regioni-modal.html',
  styleUrls: ['./regioni-modal.css'],
  providers: [NgbActiveModal]
})
export class RegioniModal {
  constructor(public activeModal: NgbActiveModal) {} // aggiungi questo costruttore

}
