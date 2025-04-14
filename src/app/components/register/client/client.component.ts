import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Usuario } from '../../../models/usuario';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';


@Component({
  selector: 'app-client-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NavbarComponent, // Agrega el componente Navbar
    FooterComponent  // Agrega el componente Footer
  ],
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent {
  showPassword = false;
  email = '';
  password = '';
  confirmPassword = '';
  fullName = '';
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

    const userData: Usuario = {
      id: '', // Genera un ID si es necesario
      nombre: this.fullName,
      email: this.email,
      password: this.password,
      rol: 'CLIENTE',
      fechaRegistro: new Date(), // Fecha actual
      estadoCuenta: 'ACTIVO' // Estado inicial
    };

    this.authService.registerClient(userData).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al registrar. Inténtalo de nuevo.';
        this.isLoading = false;
      }
    });
  }
}
