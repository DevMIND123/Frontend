/* src/app/components/home/client/client.component.ts */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    /* Angular */
    CommonModule,
    FormsModule,
    RouterModule,
    /* Layout */
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css'],
})
export class ClientComponent implements OnInit {
  /* ------------ estado de formulario ------------ */
  isEditing = false;
  showPasswordModal = false;
  id: number = 0;

  userData = {
    nombre: '',
    email: '',
    departamento: '',
    especialidad: '',
  };

  /* ------------ feedback UI ------------ */
  successMessage = '';
  errorMessage = '';

  /* ------------ preferencias ------------ */
  darkMode = false;
  notificationsEnabled = true;

  /* ------------ password modal ------------ */
  passwordData = {
    current: '',
    nueva: '',
    confirm: '',
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  /* =========================================================
   *  CICLO DE VIDA
   * ======================================================= */
  ngOnInit(): void {
    this.loadUserData();
    this.loadThemePreference();
  }

  /* =========================================================
   *  CARGA DE DATOS
   * ======================================================= */
  private loadUserData(): void {
    const email = this.authService.getEmail();
    const rol = this.authService.getRole();

    if (!email || !rol) {
      this.errorMessage =
        'No se encontró la sesión. Inicia sesión nuevamente, por favor.';
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioService.obtenerUsuario(email, rol).subscribe({
      next: (dto) => {
        this.id = dto;
        /* Nuevo endpoint que devuelve el DTO completo                *
         * (internamente el Service llama a /datos/{email})           */
        this.usuarioService.obtenerUsuario(email, rol).subscribe({
          next: (dto) => {
            this.userData = {
              nombre: dto.nombre ?? '',
              email: dto.email ?? '',
              departamento: dto.departamento ?? '',
              especialidad: dto.especialidad ?? '',
            };
            localStorage.setItem('userName', this.userData.nombre);
            this.errorMessage = '';
          },
          error: (err) => {
            console.error('Error al cargar datos:', err);
            this.errorMessage = 'Error al cargar los datos del usuario.';
          },
        });
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los datos de la empresa.';
        console.error('[Empresa] loadCompanyData:', err);
      },
    });
  }

  /* =========================================================
   *  EDICIÓN DE PERFIL
   * ======================================================= */
  toggleEdit(): void {
    this.isEditing = !this.isEditing;

    if (!this.isEditing) {
      // si cancela, recargamos los datos para descartar cambios
      this.loadUserData();
    }

    this.successMessage = '';
    this.errorMessage = '';
  }

  updateProfile(): void {
    this.usuarioService.actualizarUsuario(this.userData).subscribe({
      next: () => {
        this.successMessage = 'Perfil actualizado exitosamente';
        this.isEditing = false;
        localStorage.setItem('userName', this.userData.nombre);
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.errorMessage = 'Error al actualizar el perfil.';
      },
    });
  }

  /* =========================================================
   *  PASSWORD
   * ======================================================= */
  onPasswordChange(): void {
    if (this.passwordData.nueva !== this.passwordData.confirm) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    const email = this.authService.getEmail();
    if (!email) return;

    this.authService
      .changePassword({ email, nuevaPassword: this.passwordData.nueva })
      .subscribe({
        next: () => {
          this.successMessage = 'Contraseña cambiada correctamente.';
          this.showPasswordModal = false;
          this.passwordData = { current: '', nueva: '', confirm: '' };
        },
        error: (err) => {
          console.error('Error al cambiar contraseña:', err);
          this.errorMessage =
            err.error?.message || 'Ocurrió un error al cambiar la contraseña.';
        },
      });
  }

  /* =========================================================
   *  ELIMINAR CUENTA
   * ======================================================= */
  deleteAccount(): void {
    if (
      !confirm(
        '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.'
      )
    )
      return;

    const email = this.authService.getEmail();
    const rol = this.authService.getRole();
    if (!email || !rol) return;
    this.usuarioService.obtenerUsuario(email, rol).subscribe({
      next: (dto) => {
        this.id = dto;

        this.usuarioService.eliminarUsuarioPorId(this.id, rol).subscribe({
          next: () => {
            this.authService.logout();
            this.router.navigate(['/login']);
          },
          error: (err) => {
            console.error('Delete account error:', err);
            this.errorMessage = 'Error al eliminar la cuenta.';
          },
        });
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los datos de la empresa.';
        console.error('[Empresa] loadCompanyData:', err);
      },
    });
  }

  /* =========================================================
   *  TEMA & PREFERENCIAS
   * ======================================================= */
  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', String(this.darkMode));
    this.applyTheme();
  }

  private loadThemePreference(): void {
    this.darkMode = localStorage.getItem('darkMode') === 'true';
    this.applyTheme();
  }

  private applyTheme(): void {
    document.body.classList.toggle('dark-mode', this.darkMode);
  }

  /* =========================================================
   *  PLACEHOLDERS DE NEGOCIO (hábitos / retos)
   * ======================================================= */
  createHabit(): void {
    console.log('Crear nuevo hábito');
  }

  createChallenge(): void {
    console.log('Crear nuevo reto');
  }
}
