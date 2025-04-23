import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { UsuarioUpdateDTO } from '../../../models/usuario';
import Swal from 'sweetalert2';

/* --------------- Modelos mock --------------- */
interface Ticket {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  client: string;
}

@Component({
  selector: 'app-soporte-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './soporte.component.html',
  styleUrls: ['./soporte.component.css'],
})
export class SoporteHomeComponent implements OnInit {
  /* -------- flags & feedback -------- */
  isEditing = false;
  showPasswordForm = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  id: number = 0;

  /* -------- user data -------- */
  userData = {
    nombre: '',
    email: '',
    departamento: 'Soporte Técnico',
    especialidad: 'Atención al Cliente',
  };

  /* -------- password (estructura unificada) -------- */
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  /* -------- preferencias -------- */
  preferences = {
    darkMode: false,
    notifications: true,
  };

  /* -------- estadísticas -------- */
  activeTickets = 0;
  inProgressTickets = 0;
  resolvedTickets = 0;

  /* -------- tickets dummy -------- */
  tickets: Ticket[] = [
    {
      id: '1',
      title: 'Error en inicio de sesión',
      status: 'open',
      priority: 'high',
      createdAt: new Date('2024‑03‑10T09:00:00'),
      updatedAt: new Date('2024‑03‑10T09:00:00'),
      client: 'Juan Pérez',
    },
    {
      id: '2',
      title: 'Problema con pago',
      status: 'in_progress',
      priority: 'medium',
      createdAt: new Date('2024‑03‑09T15:30:00'),
      updatedAt: new Date('2024‑03‑10T10:15:00'),
      client: 'María López',
    },
  ];

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  /* =========================================================
   *  CICLO DE VIDA
   * ======================================================= */
  ngOnInit(): void {
    this.calculateStats();
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
        'No se encontró la sesión de la empresa. Inicia sesión nuevamente.';
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioService.obtenerUsuario(email, rol).subscribe({
      next: (dto) => {
        this.id = dto;

        // ✅ Ya tienes this.id, ahora sí haces la segunda llamada
        this.usuarioService.obtenerUsuarioById(this.id, rol).subscribe({
          next: (dto) => {
            this.userData = {
              nombre: dto.nombre,
              email: dto.email,
              departamento: 'Soporte Técnico',
              especialidad: 'Atención al Cliente',
            };

            console.log('[Empresa] loadCompanyData (by ID):', this.userData);
            this.errorMessage = null;
          },
          error: (err) => {
            this.errorMessage = 'Error al cargar los datos de la empresa.';
            console.error('[Empresa] loadCompanyData (by ID):', err);
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
   *  EDICIÓN PERFIL
   * ======================================================= */
  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) this.loadUserData();
    this.successMessage = '';
    this.errorMessage = '';
  }

  updateProfile(): void {
    console.log('[Empresa] onSubmit:', this.userData);

    const dto = {
      nombre: this.userData.nombre,
      email: this.userData.email,
    };
    const rol = this.authService.getRole();

    this.usuarioService.actualizarUsuarioPorId(this.id, dto, rol).subscribe({
      next: () => {
        this.successMessage = 'Datos actualizados correctamente';
        this.isEditing = false;
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage = 'Error al actualizar los datos.';
        console.error('[Empresa] onSubmit:', err);
      },
    });
  }

  /* =========================================================
   *  PASSWORD
   * ======================================================= */
  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  changePassword(): void {


    const email = this.authService.getEmail();
    if (!email) return;

    this.authService
      .changePasswordAdmin({
        email,
        nuevaPassword: this.passwordData.newPassword,
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Contraseña actualizada exitosamente';
          this.togglePasswordForm();
        },
        error: (err) => {
          console.error('Error changing password:', err);
          this.errorMessage = 'Error al cambiar la contraseña';
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
            console.error('Error deleting account:', err);
            this.errorMessage = 'Error al eliminar la cuenta';
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
   *  PREFERENCIAS / TEMA
   * ======================================================= */
  toggleTheme(): void {
    this.preferences.darkMode = !this.preferences.darkMode;
    localStorage.setItem('darkMode', String(this.preferences.darkMode));
    this.applyTheme();
  }

  private loadThemePreference(): void {
    this.preferences.darkMode = localStorage.getItem('darkMode') === 'true';
    this.applyTheme();
  }

  private applyTheme(): void {
    document.body.classList.toggle('dark-mode', this.preferences.darkMode);
  }

  /* =========================================================
   *  ESTADÍSTICAS DE TICKETS (mock)
   * ======================================================= */
  private calculateStats(): void {
    this.activeTickets = this.tickets.filter((t) => t.status === 'open').length;
    this.inProgressTickets = this.tickets.filter(
      (t) => t.status === 'in_progress'
    ).length;
    this.resolvedTickets = this.tickets.filter(
      (t) => t.status === 'resolved'
    ).length;
  }

  /* -------- helpers view -------- */
  getStatusClass(status: Ticket['status']): string {
    return (
      {
        open: 'bg-danger',
        in_progress: 'bg-warning',
        resolved: 'bg-success',
        closed: 'bg-secondary',
      }[status] || 'bg-secondary'
    );
  }

  getPriorityClass(p: Ticket['priority']): string {
    return (
      {
        low: 'bg-info',
        medium: 'bg-warning',
        high: 'bg-danger',
      }[p] || 'bg-secondary'
    );
  }

  getStatusLabel(status: Ticket['status']): string {
    return (
      {
        open: 'Abierto',
        in_progress: 'En progreso',
        resolved: 'Resuelto',
        closed: 'Cerrado',
      }[status] || status
    );
  }

  getPriorityLabel(priority: Ticket['priority']): string {
    return { low: 'Baja', medium: 'Media', high: 'Alta' }[priority] || priority;
  }

  /* -------- acciones mock tickets -------- */
  createTicket(): void {
    console.log('Create new ticket');
  }
  viewTicket(t: Ticket): void {
    console.log('View ticket:', t);
  }
  updateStatus(t: Ticket): void {
    console.log('Update ticket status:', t);
  }

  cambiarContrasena(): void {
    console.log('[Empresa] cambiarContrasena');
    const user = sessionStorage.getItem('user');

    if (!user) {
      this.errorMessage = 'No se encontró información del usuario en sesión.';
      return;
    }

    const email = user;

    console.log('[Empresa] cambiarContrasena user:', email);
    console.log(
      '[Empresa] cambiarContrasena nueva contraseña:',
      this.passwordData.newPassword
    );

    const payload = {
      email: email,
      nuevaPassword: this.passwordData.newPassword,
    };

    this.authService.changePasswordAdmin(payload).subscribe({
      next: () => {
        console.log('[Empresa] cambiarContrasena: éxito');
        this.successMessage = 'Contraseña actualizada correctamente';
        this.togglePasswordForm(); // ✅ coma agregada
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Contraseña actualizada correctamente.',
          confirmButtonText: 'Aceptar',
        });
      },
      error: (err) => {
        this.errorMessage = 'Error al cambiar la contraseña';
        console.error('[Empresa] cambiarContrasena:', err);
      },
    });
  }

}
