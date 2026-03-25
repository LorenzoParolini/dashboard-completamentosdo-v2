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
  expandedAmbienti = new Set<string>();
  private ambienteRilasciById = new Map<number, Rilascio[]>();
  private ambientiCompletiLoaded = false;

  constructor(private ambientiService: AmbientiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen'] || changes['cliente']) && this.isOpen) {
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

  toggleAmbiente(softwareId: number, ambienteId: number): void {
    const key = this.getAmbienteKey(softwareId, ambienteId);
    if (this.expandedAmbienti.has(key)) {
      this.expandedAmbienti.delete(key);
      return;
    }
    this.expandedAmbienti.add(key);
  }

  isAmbienteExpanded(softwareId: number, ambienteId: number): boolean {
    return this.expandedAmbienti.has(
      this.getAmbienteKey(softwareId, ambienteId),
    );
  }

  private getAmbienteKey(softwareId: number, ambienteId: number): string {
    return `${softwareId}-${ambienteId}`;
  }

  trackBySoftwareId(index: number, software: Software): number {
    return software.id;
  }

  trackByAmbienteId(index: number, ambiente: Ambiente): number {
    return ambiente.id;
  }

  trackByRilascioId(index: number, rilascio: Rilascio): number {
    return rilascio.id;
  }

  getAmbienteRilasci(ambiente: Ambiente): Rilascio[] {
    if (ambiente.rilasci && ambiente.rilasci.length > 0) {
      return ambiente.rilasci;
    }

    return this.ambienteRilasciById.get(ambiente.id) || [];
  }

  getAmbienteRilasciCount(ambiente: Ambiente): number {
    return this.getAmbienteRilasci(ambiente).length;
  }

  private loadAmbientiCompleti(): void {
    if (this.ambientiCompletiLoaded) {
      return;
    }

    this.ambientiService.getAllAmbienti().subscribe((ambienti) => {
      this.ambienteRilasciById.clear();
      ambienti.forEach((ambiente) => {
        this.ambienteRilasciById.set(ambiente.id, ambiente.rilasci || []);
      });
      this.ambientiCompletiLoaded = true;
    });
  }
}
