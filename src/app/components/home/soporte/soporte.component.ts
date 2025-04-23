import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { UsuarioUpdateDTO } from '../../../models/usuario';
import { SoporteService } from '../../../services/soporte.service'; // 👈 nuevo servicio CastleMock

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
  isEditing = false;
  showPasswordForm = false;
  id = 0;
  successMessage = '';
  errorMessage = '';

  userData = {
    nombre: '',
    email: '',
    departamento: 'Soporte Técnico',
    especialidad: 'Atención al Cliente',
  };

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  preferences = {
    darkMode: false,
    notifications: true,
  };

  // NUEVAS PROPIEDADES (datos de CastleMock)
  empresaId = '';
  documentosSubidos: any[] = [];
  estadoValidacion = '';
  notificacionEnviada = false;
  historialSoporteUsuario: any[] = [];
  reportesEficiencia: any;
  faq: any[] = [];

  // TICKETS reemplazados por los del mock
  tickets: any[] = [];

  activeTickets = 0;
  inProgressTickets = 0;
  resolvedTickets = 0;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private soporteService: SoporteService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUserData();
    this.loadThemePreference();
    this.cargarDatosDesdeMock();
  }

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
            this.errorMessage = '';
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

  private cargarDatosDesdeMock(): void {
    this.soporteService.obtenerModuloSoporte().subscribe({
      next: (data) => {
        this.empresaId = data.empresaId;
        const soporte = data.moduloSoporte;
        this.documentosSubidos = soporte.validacionEmpresa.documentosSubidos;
        this.estadoValidacion = soporte.validacionEmpresa.estadoValidacion;
        this.notificacionEnviada = soporte.validacionEmpresa.notificacionEnviada;
        this.historialSoporteUsuario = soporte.historialSoporteUsuario;
        this.reportesEficiencia = soporte.reportesEficiencia;
        this.faq = soporte.faq;
        this.tickets = soporte.tickets;
        this.calculateStats();
      },
      error: (err) => {
        console.error('Error cargando datos de CastleMock:', err);
        this.errorMessage = 'No se pudo obtener la información de soporte';
      }
    });
  }

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
        this.errorMessage = '';
      },
      error: (err) => {
        this.errorMessage = 'Error al actualizar los datos.';
        console.error('[Empresa] onSubmit:', err);
      },
    });
  }

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

  deleteAccount(): void {
    if (!confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) return;

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

  private calculateStats(): void {
    this.activeTickets = this.tickets.filter((t) => t.estado === 'Abierto').length;
    this.inProgressTickets = this.tickets.filter((t) => t.estado === 'En Progreso').length;
    this.resolvedTickets = this.tickets.filter((t) => t.estado === 'Cerrado').length;
  }

  getStatusClass(status: string): string {
    return {
      'Abierto': 'bg-danger',
      'En Progreso': 'bg-warning',
      'Cerrado': 'bg-success',
      'Resuelto': 'bg-success'
    }[status] || 'bg-secondary';
  }

  getPriorityClass(priority: string): string {
    return {
      'Baja': 'bg-info',
      'Media': 'bg-warning',
      'Alta': 'bg-danger'
    }[priority] || 'bg-secondary';
  }

  getStatusLabel(status: string): string {
    return {
      'Abierto': 'Abierto',
      'En Progreso': 'En progreso',
      'Cerrado': 'Cerrado',
      'Resuelto': 'Resuelto'
    }[status] || status;
  }

  getPriorityLabel(priority: string): string {
    return {
      'Baja': 'Baja',
      'Media': 'Media',
      'Alta': 'Alta'
    }[priority] || priority;
  }

  createTicket(): void {
    console.log('Create new ticket');
  }

  viewTicket(t: any): void {
    console.log('View ticket:', t);
  }

  updateStatus(t: any): void {
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
