import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Empresa } from '../../../models/empresa';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-company-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.css']
})
export class CompanyComponent {
  showPassword = false;
  nombre = '';
  nombreRepresentante = '';
  email = '';
  password = '';
  confirmPassword = '';
  telefono = '';
  direccion = '';
  nit = '';
  acceptTerms = false;
  errorMessage = '';
  isLoading = false;

  constructor(private router: Router, private authService: AuthService) { }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.acceptTerms) {
      this.errorMessage = 'Debes aceptar los términos y condiciones.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const empresaData: Empresa = {
      nombreEmpresa: this.nombre,
      nit: this.nit,
      nombreRepresentante: this.nombreRepresentante,
      email: this.email,
      direccion: this.direccion,
      telefono: this.telefono,
      password: this.password,
      rol: 'EMPRESA'
    };

    this.authService.registerCompany(empresaData).subscribe({
      next: () => this.router.navigate(['/login']),
      error: (error) => {
        this.errorMessage = error.message || 'Error al registrar la empresa.';
        this.isLoading = false;
      }
    });
  }
}
