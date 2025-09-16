import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormStateService {
  private isDirtySubject = new BehaviorSubject<boolean>(false);
  public isDirty$ = this.isDirtySubject.asObservable();

  constructor() { }

  setDirty(isDirty: boolean): void {
    this.isDirtySubject.next(isDirty);
  }

  isDirty(): boolean {
    return this.isDirtySubject.value;
  }

  reset(): void {
    this.isDirtySubject.next(false);
  }
}