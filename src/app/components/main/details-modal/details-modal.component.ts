import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cliente } from '../../../models/cliente.model';
import { Software } from '../../../models/software.model';
import { Ambiente } from '../../../models/ambiente.model';
import { Rilascio } from '../../../models/rilascio.model';
import { AmbientiService } from '../../../services/ambienti.service';

@Component({
  selector: 'app-details-modal',
  imports: [CommonModule],
  templateUrl: './details-modal.component.html',
  styleUrl: './details-modal.component.css',
})
export class DetailsModalComponent implements OnChanges {
  @Input() cliente: Cliente | null = null;
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  private ambientiById = new Map<number, Ambiente>();
  private ambientiCompletiLoaded = false;
  private expandedSoftwareIds = new Set<number>();

  constructor(private ambientiService: AmbientiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen'] || changes['cliente']) && this.isOpen) {
      this.syncExpandedSoftwareState();
      this.loadAmbientiCompleti();
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal.emit();
    }
  }

  onCloseClick() {
    this.closeModal.emit();
  }

  trackBySoftwareId(index: number, software: Software): number {
    return software.id;
  }

  trackByRilascioId(index: number, rilascio: Rilascio): number {
    return rilascio.id;
  }

  toggleSoftwareDetails(software: Software): void {
    if (this.expandedSoftwareIds.has(software.id)) {
      this.expandedSoftwareIds.delete(software.id);
      return;
    }

    this.expandedSoftwareIds.add(software.id);
  }

  isSoftwareExpanded(software: Software): boolean {
    return this.expandedSoftwareIds.has(software.id);
  }

  getSoftwareRilasci(software: Software): Rilascio[] {
    const flattened = (software.assegnazioni ?? []).flatMap(
      (assegnazione) => assegnazione.rilasci ?? [],
    );
    const uniqueById = new Map<number, Rilascio>();
    flattened.forEach((rilascio) => uniqueById.set(rilascio.id, rilascio));
    return Array.from(uniqueById.values());
  }

  getAmbienteDescrizione(rilascio: Rilascio): string {
    if (!rilascio.ambienteId) {
      return 'N/A';
    }

    return (
      this.ambientiById.get(rilascio.ambienteId)?.descrizione ||
      `ID ${rilascio.ambienteId}`
    );
  }

  private loadAmbientiCompleti(): void {
    if (this.ambientiCompletiLoaded) {
      return;
    }

    this.ambientiService.getAllAmbienti().subscribe((ambienti) => {
      this.ambientiById.clear();
      ambienti.forEach((ambiente) => {
        this.ambientiById.set(ambiente.id, ambiente);
      });
      this.ambientiCompletiLoaded = true;
    });
  }

  private syncExpandedSoftwareState(): void {
    const softwareList = this.cliente?.software ?? [];
    const currentSoftwareIds = new Set<number>(
      softwareList.map((software) => software.id),
    );

    this.expandedSoftwareIds.forEach((softwareId) => {
      if (!currentSoftwareIds.has(softwareId)) {
        this.expandedSoftwareIds.delete(softwareId);
      }
    });

    softwareList.forEach((software) => {
      if (!this.expandedSoftwareIds.has(software.id)) {
        this.expandedSoftwareIds.add(software.id);
      }
    });
  }
}
