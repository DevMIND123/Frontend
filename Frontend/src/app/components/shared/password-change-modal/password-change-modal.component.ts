import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-change-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal" [class.show]="show" tabindex="-1" [style.display]="show ? 'block' : 'none'">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Cambiar Contraseña</h5>
            <button type="button" class="btn-close" (click)="onClose()"></button>
          </div>
          <div class="modal-body">
            <form #passwordForm="ngForm">
              <div class="mb-3">
                <label class="form-label">Contraseña Actual</label>
                <div class="input-group">
                  <input
                    [type]="showCurrentPassword ? 'text' : 'password'"
                    class="form-control"
                    [(ngModel)]="passwordData.currentPassword"
                    name="currentPassword"
                    required>
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button"
                    (click)="showCurrentPassword = !showCurrentPassword">
                    <i class="bi" [class]="showCurrentPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                  </button>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Nueva Contraseña</label>
                <div class="input-group">
                  <input
                    [type]="showNewPassword ? 'text' : 'password'"
                    class="form-control"
                    [(ngModel)]="passwordData.newPassword"
                    name="newPassword"
                    required>
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button"
                    (click)="showNewPassword = !showNewPassword">
                    <i class="bi" [class]="showNewPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                  </button>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Confirmar Nueva Contraseña</label>
                <div class="input-group">
                  <input
                    [type]="showConfirmPassword ? 'text' : 'password'"
                    class="form-control"
                    [(ngModel)]="passwordData.confirmPassword"
                    name="confirmPassword"
                    required>
                  <button 
                    class="btn btn-outline-secondary" 
                    type="button"
                    (click)="showConfirmPassword = !showConfirmPassword">
                    <i class="bi" [class]="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                  </button>
                </div>
              </div>
            </form>
            <div *ngIf="error" class="alert alert-danger mt-3">
              {{ error }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="onClose()">
              <i class="bi bi-x-lg me-2"></i>Cancelar
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              (click)="onSubmit()"
              [disabled]="!isValid()">
              <i class="bi bi-check-lg me-2"></i>Cambiar Contraseña
            </button>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show"></div>
    </div>
  `,
  styles: [`
    .modal {
      background-color: rgba(0, 0, 0, 0.5);
    }

    .modal-content {
      border-radius: 1rem;
      border: none;
    }

    .modal-header {
      border-bottom: none;
      padding: 1.5rem 1.5rem 1rem;
    }

    .modal-body {
      padding: 1rem 1.5rem;
    }

    .modal-footer {
      border-top: none;
      padding: 1rem 1.5rem 1.5rem;
    }

    .form-control {
      padding: 0.75rem;
      border-radius: 0.5rem;
      border: 2px solid #e2e8f0;
      transition: all 0.3s ease;
    }

    .form-control:focus {
      border-color: #4299e1;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
    }

    .input-group .form-control {
      border-right: none;
    }

    .input-group .btn {
      border: 2px solid #e2e8f0;
      border-left: none;
    }

    .input-group .form-control:focus + .btn {
      border-color: #4299e1;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn:hover {
      transform: translateY(-2px);
    }

    .alert {
      border-radius: 0.5rem;
    }
  `]
})
export class PasswordChangeModalComponent {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<{currentPassword: string, newPassword: string}>();

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  error: string | null = null;

  onClose() {
    this.resetForm();
    this.close.emit();
  }

  onSubmit() {
    if (!this.isValid()) {
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.error = 'Las contraseñas nuevas no coinciden';
      return;
    }

    this.submit.emit({
      currentPassword: this.passwordData.currentPassword,
      newPassword: this.passwordData.newPassword
    });

    this.resetForm();
  }

  isValid(): boolean {
    return !!(
      this.passwordData.currentPassword &&
      this.passwordData.newPassword &&
      this.passwordData.confirmPassword
    );
  }

  private resetForm() {
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.error = null;
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }
}