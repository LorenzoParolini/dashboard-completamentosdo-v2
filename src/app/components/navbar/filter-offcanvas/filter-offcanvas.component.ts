import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegioniService } from '../../../services/regioni.service';
import { SoftwareService } from '../../../services/software.service';
import { AmbientiService } from '../../../services/ambienti.service';
import { RilasciService } from '../../../services/rilasci.service';
import { Regione } from '../../../models/regione.model';
import { Software } from '../../../models/software.model';
import { Ambiente } from '../../../models/ambiente.model';
import { Rilascio } from '../../../models/rilascio.model';

@Component({
  selector: 'app-filter-offcanvas',
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-offcanvas.component.html',
  styleUrl: './filter-offcanvas.component.css',
})
export class FilterOffcanvasComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() currentView: 'D' | 'R' | 'C' | 'S' | 'A' | 'L' = 'D';
  @Input() resetVersion: number = 0;
  @Output() onClose = new EventEmitter<void>();
  @Output() onFiltersApplied = new EventEmitter<{
    regioni: number[];
    software: number[];
    ambienti: number[];
    rilasci: number[];
    branch: string;
    commit: string;
    deployedBy: string;
    build: string;
    ultimoAggiornamento: { inizio: Date; fine: Date }[];
    codiciRegione: string[];
    coordinate: { x: number; y: number }[];
    dataCreazione: { inizio: Date; fine: Date }[];
  }>();

  isSelectedRegione: boolean = false;
  isSelectedSoftware: boolean = false;
  isSelectedAmbiente: boolean = false;
  isSelectedRilascio: boolean = false;
  isSelectedBranch: boolean = false;
  isSelectedCommit: boolean = false;
  isSelectedDeployedBy: boolean = false;
  isSelectedBuild: boolean = false;
  isSelectedUltimoAggiornamento: boolean = false;
  isSelectedCodiceRegione: boolean = false;
  isSelectedCoordinate: boolean = false;
  isSelectedDataCreazione: boolean = false;

  regioni: Regione[] = [];
  software: Software[] = [];
  ambienti: Ambiente[] = [];
  rilasci: Rilascio[] = [];
  codiciRegione: string[] = [];

  selectedRegioni: number[] = [];
  selectedSoftware: number[] = [];
  selectedAmbienti: number[] = [];
  selectedRilasci: number[] = [];
  selectedBranch: string = '';
  selectedCommit: string = '';
  selectedDeployedBy: string = '';
  selectedBuild: string = '';
  selectedUltimoAggiornamento: { inizio: Date; fine: Date }[] = [];
  selectedCodiciRegione: string[] = [];
  selectedCoordinate: { x: number; y: number }[] = [];
  selectedDataCreazione: { inizio: Date; fine: Date }[] = [];

  // Temporary variables for input
  newCoordinateX: number | null = null;
  newCoordinateY: number | null = null;
  newUltimoAggiornamentoInizio: string = '';
  newUltimoAggiornamentoFine: string = '';
  newDataCreazioneInizio: string = '';
  newDataCreazioneFine: string = '';

  //importa service di regioni, software e ambienti
  constructor(
    private regioniService: RegioniService,
    private softwareService: SoftwareService,
    private ambientiService: AmbientiService,
    private rilasciService: RilasciService,
  ) {}

  //subscribe per ottenere i dati di regioni, software e ambienti
  ngOnInit() {
    this.regioniService.getAllRegioni().subscribe((data: Regione[]) => {
      this.regioni = data;
      // Populate codiciRegione from regioni
      this.codiciRegione = [...new Set(data.map((regione) => regione.codice))];
    });
    this.softwareService.getAllSoftware().subscribe((data: Software[]) => {
      this.software = data;
    });
    this.ambientiService.getAllAmbienti().subscribe((data: Ambiente[]) => {
      this.ambienti = data;
    });
    this.rilasciService.getAllRilasci().subscribe((data: Rilascio[]) => {
      this.rilasci = data;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const viewChanged =
      changes['currentView'] && !changes['currentView'].firstChange;
    const resetTriggered =
      changes['resetVersion'] && !changes['resetVersion'].firstChange;

    if (viewChanged || resetTriggered) {
      this.resetLocalFilters();
    }
  }

  closeOffcanvas() {
    this.onClose.emit();
  }

  onFilterRegioneClick() {
    this.isSelectedRegione = !this.isSelectedRegione;
  }
  onFilterSoftwareClick() {
    this.isSelectedSoftware = !this.isSelectedSoftware;
  }
  onFilterAmbienteClick() {
    this.isSelectedAmbiente = !this.isSelectedAmbiente;
  }
  onFilterRilascioClick() {
    this.isSelectedRilascio = !this.isSelectedRilascio;
  }
  onFilterBranchClick() {
    this.isSelectedBranch = !this.isSelectedBranch;
  }
  onFilterCommitClick() {
    this.isSelectedCommit = !this.isSelectedCommit;
  }
  onFilterDeployedByClick() {
    this.isSelectedDeployedBy = !this.isSelectedDeployedBy;
  }
  onFilterBuildClick() {
    this.isSelectedBuild = !this.isSelectedBuild;
  }
  onFilterUltimoAggiornamentoClick() {
    this.isSelectedUltimoAggiornamento = !this.isSelectedUltimoAggiornamento;
  }
  onFilterCodiceRegioneClick() {
    this.isSelectedCodiceRegione = !this.isSelectedCodiceRegione;
  }
  onFilterCoordinateClick() {
    this.isSelectedCoordinate = !this.isSelectedCoordinate;
  }
  onFilterDataCreazioneClick() {
    this.isSelectedDataCreazione = !this.isSelectedDataCreazione;
  }

  onRegioneChange(regioneId: number, event: any) {
    if (event.target.checked) {
      this.selectedRegioni.push(regioneId);
    } else {
      const index = this.selectedRegioni.indexOf(regioneId);
      if (index > -1) {
        this.selectedRegioni.splice(index, 1);
      }
    }
  }

  onSoftwareChange(softwareId: number, event: any) {
    if (event.target.checked) {
      this.selectedSoftware.push(softwareId);
    } else {
      const index = this.selectedSoftware.indexOf(softwareId);
      if (index > -1) {
        this.selectedSoftware.splice(index, 1);
      }
    }
  }

  onAmbienteChange(ambienteId: number, event: any) {
    if (event.target.checked) {
      this.selectedAmbienti.push(ambienteId);
    } else {
      const index = this.selectedAmbienti.indexOf(ambienteId);
      if (index > -1) {
        this.selectedAmbienti.splice(index, 1);
      }
    }
  }

  onRilascioChange(rilascioId: number, event: any) {
    if (event.target.checked) {
      this.selectedRilasci.push(rilascioId);
    } else {
      const index = this.selectedRilasci.indexOf(rilascioId);
      if (index > -1) {
        this.selectedRilasci.splice(index, 1);
      }
    }
  }

  onCodiceRegioneChange(codice: string, event: any) {
    if (event.target.checked) {
      this.selectedCodiciRegione.push(codice);
    } else {
      const index = this.selectedCodiciRegione.indexOf(codice);
      if (index > -1) {
        this.selectedCodiciRegione.splice(index, 1);
      }
    }
  }

  isRegioneSelected(regioneId: number): boolean {
    return this.selectedRegioni.includes(regioneId);
  }

  isSoftwareSelected(softwareId: number): boolean {
    return this.selectedSoftware.includes(softwareId);
  }

  isAmbienteSelected(ambienteId: number): boolean {
    return this.selectedAmbienti.includes(ambienteId);
  }

  isRilascioSelected(rilascioId: number): boolean {
    return this.selectedRilasci.includes(rilascioId);
  }

  isCodiceRegioneSelected(codice: string): boolean {
    return this.selectedCodiciRegione.includes(codice);
  }

  // Coordinate methods
  addCoordinate() {
    if (this.newCoordinateX !== null && this.newCoordinateY !== null) {
      this.selectedCoordinate.push({
        x: this.newCoordinateX,
        y: this.newCoordinateY,
      });
      this.newCoordinateX = null;
      this.newCoordinateY = null;
    }
  }

  removeCoordinate(index: number) {
    this.selectedCoordinate.splice(index, 1);
  }

  addUltimoAggiornamentoRange() {
    if (this.newUltimoAggiornamentoInizio && this.newUltimoAggiornamentoFine) {
      const dataInizio = new Date(this.newUltimoAggiornamentoInizio);
      const dataFine = new Date(this.newUltimoAggiornamentoFine);

      if (dataInizio <= dataFine) {
        const range = { inizio: dataInizio, fine: dataFine };

        const exists = this.selectedUltimoAggiornamento.some(
          (r) =>
            r.inizio.getTime() === range.inizio.getTime() &&
            r.fine.getTime() === range.fine.getTime(),
        );

        if (!exists) {
          this.selectedUltimoAggiornamento.push(range);
        }

        this.newUltimoAggiornamentoInizio = '';
        this.newUltimoAggiornamentoFine = '';
      }
    }
  }

  removeUltimoAggiornamento(index: number) {
    this.selectedUltimoAggiornamento.splice(index, 1);
  }

  addDataCreazioneRange() {
    if (this.newDataCreazioneInizio && this.newDataCreazioneFine) {
      const dataInizio = new Date(this.newDataCreazioneInizio);
      const dataFine = new Date(this.newDataCreazioneFine);

      // Verifica che la data inizio sia precedente o uguale alla data fine
      if (dataInizio <= dataFine) {
        const range = { inizio: dataInizio, fine: dataFine };

        // Verifica che non ci sia già lo stesso intervallo
        const exists = this.selectedDataCreazione.some(
          (r) =>
            r.inizio.getTime() === range.inizio.getTime() &&
            r.fine.getTime() === range.fine.getTime(),
        );

        if (!exists) {
          this.selectedDataCreazione.push(range);
        }

        this.newDataCreazioneInizio = '';
        this.newDataCreazioneFine = '';
      }
    }
  }

  removeDataCreazione(index: number) {
    this.selectedDataCreazione.splice(index, 1);
  }

  resetFilters() {
    this.resetLocalFilters();
    this.applyFilters();
  }

  private resetLocalFilters() {
    this.selectedRegioni = [];
    this.selectedSoftware = [];
    this.selectedAmbienti = [];
    this.selectedRilasci = [];
    this.selectedBranch = '';
    this.selectedCommit = '';
    this.selectedDeployedBy = '';
    this.selectedBuild = '';
    this.selectedUltimoAggiornamento = [];
    this.selectedCodiciRegione = [];
    this.selectedCoordinate = [];
    this.selectedDataCreazione = [];
    this.isSelectedRegione = false;
    this.isSelectedSoftware = false;
    this.isSelectedAmbiente = false;
    this.isSelectedRilascio = false;
    this.isSelectedBranch = false;
    this.isSelectedCommit = false;
    this.isSelectedDeployedBy = false;
    this.isSelectedBuild = false;
    this.isSelectedUltimoAggiornamento = false;
    this.isSelectedCodiceRegione = false;
    this.isSelectedCoordinate = false;
    this.isSelectedDataCreazione = false;
    this.newCoordinateX = null;
    this.newCoordinateY = null;
    this.newUltimoAggiornamentoInizio = '';
    this.newUltimoAggiornamentoFine = '';
    this.newDataCreazioneInizio = '';
    this.newDataCreazioneFine = '';
  }

  applyFilters() {
    const filters = {
      regioni: this.selectedRegioni,
      software: this.selectedSoftware,
      ambienti: this.selectedAmbienti,
      rilasci: this.selectedRilasci,
      branch: this.selectedBranch,
      commit: this.selectedCommit,
      deployedBy: this.selectedDeployedBy,
      build: this.selectedBuild,
      ultimoAggiornamento: this.selectedUltimoAggiornamento,
      codiciRegione: this.selectedCodiciRegione,
      coordinate: this.selectedCoordinate,
      dataCreazione: this.selectedDataCreazione,
    };
    this.onFiltersApplied.emit(filters);
    this.closeOffcanvas();
  }
}
