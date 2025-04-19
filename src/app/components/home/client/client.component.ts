import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {
  isEditing = false;
  showPasswordModal = false;
  userData = {
    nombre: '',
    email: '',
    departamento: '',
    especialidad: ''
  };

  successMessage = '';
  errorMessage = '';
  darkMode = false;
  notificationsEnabled = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit(): void {
    this.loadUserData();
    this.loadThemePreference();
  }

  loadUserData() {
    const email = sessionStorage.getItem('user');
    const rol = sessionStorage.getItem('user-role');

    if (!email || !rol) {
      this.errorMessage = 'No se encontró información del usuario en sesión. Por favor, inicie sesión nuevamente.';
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioService.obtenerUsuarioPorEmail(email, rol).subscribe({
      next: (data: any) => {
        this.userData = {
          nombre: data.nombre || '',
          email: data.email || '',
          departamento: data.departamento || '',
          especialidad: data.especialidad || ''
        };
        localStorage.setItem('userName', this.userData.nombre);
      },
      error: (error: any) => {
        this.errorMessage = 'Error al cargar los datos del usuario.';
        console.error('Error:', error);
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) this.loadUserData();
    this.successMessage = '';
    this.errorMessage = '';
  }

  updateProfile() {
    const rol = sessionStorage.getItem('user-role');
    if (!rol || !this.userData.email) return;

    this.usuarioService.actualizarUsuario(this.userData).subscribe({
      next: () => {
        this.successMessage = 'Perfil actualizado exitosamente';
        this.isEditing = false;
        localStorage.setItem('userName', this.userData.nombre);
      },
      error: (error: any) => {
        this.errorMessage = 'Error al actualizar el perfil';
        console.error('Error updating profile:', error);
      }
    });
  }

  onPasswordChange(newPassword: string) {
    const email = sessionStorage.getItem('user');
    const rol = sessionStorage.getItem('user-role');

    if (!email || !rol) {
      this.errorMessage = 'No se encontró información del usuario en sesión.';
      return;
    }

    this.authService.changePassword({ email, nuevaPassword: newPassword }).subscribe({
      next: () => {
        this.successMessage = 'Contraseña cambiada correctamente.';
        this.showPasswordModal = false;
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.errorMessage = error.message || 'Ocurrió un error al cambiar la contraseña.';
      }
    });
  }

  deleteAccount() {
    if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      const email = sessionStorage.getItem('user');
      const rol = sessionStorage.getItem('user-role');
      if (!email || !rol) return;

      this.usuarioService.eliminarUsuarioPorEmail(email, rol).subscribe({
        next: () => {
          this.authService.logout();
          this.router.navigate(['/login']);
        },
        error: (error: any) => {
          this.errorMessage = 'Error al eliminar la cuenta.';
          console.error('Delete account error:', error);
        }
      });
    }
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', this.darkMode.toString());
    this.applyTheme();
  }

  loadThemePreference() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    this.darkMode = darkMode;
    this.applyTheme();
  }

  private applyTheme() {
    document.body.classList.toggle('dark-mode', this.darkMode);
  }

  createHabit() {
    console.log('Crear nuevo hábito');
  }

  createChallenge() {
    console.log('Crear nuevo reto');
  }
}