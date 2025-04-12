import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthLayoutComponent } from '../../shared/auth-layout/auth-layout.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-company-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AuthLayoutComponent],
  templateUrl: './company-register.component.html'
})
export class CompanyRegisterComponent {
  showPassword = false;
  email = '';
  password = '';
  confirmPassword = '';
  companyName = '';
  nit = '';
  address = '';
  phone = '';
  acceptTerms = false;
  errorMessage = '';
  isLoading = false;
  representativeName = '';

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

    const companyData = {
      tipoDocumento: {
        id: 'NIT'
      },
      numeroDocumento: this.nit,
      nombreEmpresa: this.companyName,
      nombreRepresentante: this.representativeName,
      email: this.email,
      password: this.password
    };

    this.authService.registerCompany(companyData).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        this.errorMessage = error.message || 'Error al registrar. Por favor, inténtalo de nuevo.';
        this.isLoading = false;
      }
    });
  }
}