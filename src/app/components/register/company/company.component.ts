import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
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
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const empresaData: Empresa = {
      nombre: this.nombre,
      email: this.email,
      password: this.password,
      telefono: this.telefono,
      direccion: this.direccion,
      nit: this.nit,
      fechaRegistro: new Date(),
      estadoCuenta: 'ACTIVO'
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
