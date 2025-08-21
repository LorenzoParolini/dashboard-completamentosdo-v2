import { Component } from '@angular/core';
import { Regione } from '../../models/regione.model';
import { RegioniService } from '../../services/regioni';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-regioni',
  imports: [CommonModule],
  templateUrl: './regioni.html',
  styleUrl: './regioni.css'
})
export class Regioni {
  regioni: Regione[] = new Array<Regione>();
  constructor(private regioniService: RegioniService) {
    this.regioni = this.regioniService.getAllRegioni();
  }

}
