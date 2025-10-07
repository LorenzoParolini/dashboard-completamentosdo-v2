import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface MinimizedModal {
  id: string;
  type: 'add' | 'edit';
  section: 'regioni' | 'clienti' | 'software' | 'ambienti';
  description: string;
  data: any;
  formData: any;
}

@Injectable({
  providedIn: 'root'
})
export class MinimizedModalsService {
  private minimizedModalsSubject = new BehaviorSubject<MinimizedModal[]>([]);
  public minimizedModals$: Observable<MinimizedModal[]> = this.minimizedModalsSubject.asObservable();

  constructor() {}

  addMinimizedModal(modal: MinimizedModal): void {
    const currentModals = this.minimizedModalsSubject.value;
    // Se esiste già una modale con lo stesso ID, la sostituisce
    const existingIndex = currentModals.findIndex(m => m.id === modal.id);
    
    if (existingIndex !== -1) {
      currentModals[existingIndex] = modal;
    } else {
      currentModals.push(modal);
    }
    
    this.minimizedModalsSubject.next([...currentModals]);
  }

  removeMinimizedModal(id: string): void {
    const currentModals = this.minimizedModalsSubject.value;
    const filteredModals = currentModals.filter(modal => modal.id !== id);
    this.minimizedModalsSubject.next(filteredModals);
  }

  getMinimizedModal(id: string): MinimizedModal | undefined {
    return this.minimizedModalsSubject.value.find(modal => modal.id === id);
  }

  updateMinimizedModalData(id: string, data: any, formData: any): void {
    const currentModals = this.minimizedModalsSubject.value;
    const modalIndex = currentModals.findIndex(m => m.id === id);
    
    if (modalIndex !== -1) {
      currentModals[modalIndex].data = data;
      currentModals[modalIndex].formData = formData;
      this.minimizedModalsSubject.next([...currentModals]);
    }
  }

  generateModalId(section: string, type: 'add' | 'edit', itemId?: string | number): string {
    return `${section}-${type}-${itemId || 'new'}-${Date.now()}`;
  }

  clearAllMinimizedModals(): void {
    this.minimizedModalsSubject.next([]);
  }
}