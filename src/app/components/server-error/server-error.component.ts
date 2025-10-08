import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-server-error',
  imports: [CommonModule],
  templateUrl: './server-error.component.html',
  styleUrl: './server-error.component.css'
})
export class ServerErrorComponent {
  @Input() errorMessage: string = 'Impossibile raggiungere il server';
  @Output() retry = new EventEmitter<void>();

  onRetry() {
    this.retry.emit();
  }
}