import { Component, OnInit } from '@angular/core';
import { Regione } from '../../models/regione.model';
import { RegioniService } from '../../services/regioni';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-regioni',
  imports: [CommonModule],
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

  constructor(private regioniService: RegioniService) {
    
  }

  onDeleteRegione(id_regione_da_eliminare: string) {

    console.log('Eliminazione regione con id:', id_regione_da_eliminare);
    this.regioniService.deleteRegione(id_regione_da_eliminare);
  }
}
