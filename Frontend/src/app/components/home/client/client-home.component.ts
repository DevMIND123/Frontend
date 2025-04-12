import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { PasswordChangeModalComponent } from '../../shared/password-change-modal/password-change-modal.component';

@Component({
  selector: 'app-client-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NavbarComponent,
    FooterComponent,
    PasswordChangeModalComponent
  ],
  templateUrl: './client-home.component.html',
  styleUrls: ['./client-home.component.css']
})
export class ClientHomeComponent implements OnInit {
  isEditing = false;
  showPasswordModal = false;
  userData = {
    nombre: '',
    email: ''
  };
  
  successMessage = '';
  errorMessage = '';
  
  darkMode = false;
  notificationsEnabled = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadThemePreference();
  }

  loadUserData() {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      this.errorMessage = 'No se encontró información del usuario. Por favor, inicie sesión nuevamente.';
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioService.obtenerUsuarioPorEmail(email).subscribe({
      next: (data) => {
        if (data) {
          this.userData = {
            nombre: data.nombre,
            email: data.email
          };
          this.errorMessage = '';
        } else {
          this.errorMessage = 'No se encontraron datos del usuario';
        }
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.errorMessage = error;
      }
    });
  }

  loadThemePreference() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    this.darkMode = darkMode;
    this.applyTheme();
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadUserData();
    }
    this.successMessage = '';
    this.errorMessage = '';
  }

  updateProfile() {
    this.usuarioService.actualizarUsuario(this.userData).subscribe({
      next: () => {
        this.successMessage = 'Perfil actualizado exitosamente';
        this.isEditing = false;
        if (this.userData.nombre !== localStorage.getItem('userName')) {
          localStorage.setItem('userName', this.userData.nombre);
        }
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.errorMessage = error;
      }
    });
  }

  onPasswordChange(data: {currentPassword: string, newPassword: string}) {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      this.errorMessage = 'No se encontró información del usuario';
      return;
    }

    this.authService.changePassword({
      email,
      nuevaPassword: data.newPassword
    }, 'usuarios').subscribe({
      next: () => {
        this.successMessage = 'Contraseña actualizada exitosamente';
        this.showPasswordModal = false;
      },
      error: (error) => {
        this.errorMessage = error;
      }
    });
  }

  deleteAccount() {
    if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      const userId = localStorage.getItem('userId');
      if (userId) {
        this.usuarioService.eliminarUsuario(userId).subscribe({
          next: () => {
            this.authService.logout();
            this.router.navigate(['/login']);
          },
          error: (error) => {
            console.error('Error deleting account:', error);
            this.errorMessage = error;
          }
        });
      }
    }
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', this.darkMode.toString());
    this.applyTheme();
  }

  private applyTheme() {
    document.body.classList.toggle('dark-mode', this.darkMode);
  }

  // Habit and Challenge methods
  createHabit() {
    console.log('Creating new habit');
    // Implement habit creation logic
  }

  createChallenge() {
    console.log('Creating new challenge');
    // Implement challenge creation logic
  }
}