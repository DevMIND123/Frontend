import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthLayoutComponent } from '../../shared/auth-layout/auth-layout.component';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-client-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AuthLayoutComponent],
  templateUrl: './client-register.component.html'
})
export class ClientRegisterComponent {
  showPassword = false;
  email = '';
  password = '';
  confirmPassword = '';
  fullName = '';
  acceptTerms = false;
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const userData: User = {
      nombre: this.fullName,
      email: this.email,
      password: this.password,
      rol: 'CLIENTE' as const
    };

    this.authService.registerClient(userData).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al registrar. Por favor, inténtalo de nuevo.';
        this.isLoading = false;
      }
    });
  }
}