import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { SoporteService } from '../../../services/soporte.service';
import Swal from 'sweetalert2';
import { safeLocalStorageGet, safeLocalStorageSet } from '../../../shared/utils/utils';

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
  // Perfil y estado UI
  isEditing = false;
  showPasswordForm = false;
  id = 0;
  successMessage = '';
  errorMessage: any;

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

  // Datos del módulo de soporte
  tickets: any[] = [];
  ticketsFiltrados: any[] = [];
  filtroEstado: string = 'Todos';
  historialSoporteUsuario: any[] = [];
  reportesEficiencia: any;

  // Estadísticas
  activeTickets = 0;
  inProgressTickets = 0;
  resolvedTickets = 0;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private soporteService: SoporteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadThemePreference();
    this.cargarDatosDesdeMock();
  }

  /** Carga datos de perfil del agente */
  private loadUserData(): void {
    const email = this.authService.getEmail();
    const rol = this.authService.getRole();
    if (!email || !rol) {
      this.errorMessage = 'No se encontró la sesión. Inicia sesión nuevamente.';
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioService.obtenerUsuario(email, rol).subscribe({
      next: (dto) => {
        this.id = dto;
        this.usuarioService.obtenerUsuarioById(this.id, rol).subscribe({
          next: (u) => {
            this.userData = {
              nombre: u.nombre,
              email: u.email,
              departamento: 'Soporte Técnico',
              especialidad: 'Atención al Cliente',
            };
            this.errorMessage = null;
          },
          error: () => {
            this.errorMessage = 'Error al cargar datos de perfil.';
          },
        });
      },
      error: () => {
        this.errorMessage = 'Error al cargar datos de perfil.';
      },
    });
  }

  /** Obtiene el mock desde CastleMock */
  private cargarDatosDesdeMock(): void {
    this.soporteService.obtenerModuloSoporte().subscribe({
      next: (data) => {
        const m = data.moduloSoporte;
        this.tickets = m.tickets;
        this.ticketsFiltrados = [...this.tickets];
        this.historialSoporteUsuario = m.historialSoporteUsuario;
        this.reportesEficiencia = m.reportesEficiencia;
        this.calculateStats();
      },
      error: () => {
        this.errorMessage = 'No se pudo obtener la información de soporte.';
      },
    });
  }

  /** Estadísticas generales */
  private calculateStats(): void {
    this.activeTickets = this.tickets.filter(t => t.estado === 'Abierto').length;
    this.inProgressTickets = this.tickets.filter(t => t.estado === 'En proceso').length;
    this.resolvedTickets = this.tickets.filter(t => t.estado === 'Cerrado').length;
  }

  /** Filtro de tickets */
  aplicarFiltroPorEstado(estado: string): void {
    this.filtroEstado = estado;
    this.ticketsFiltrados = estado === 'Todos'
      ? [...this.tickets]
      : this.tickets.filter(t => t.estado === estado);
  }

  /** Simula creación de ticket */
  createTicket(): void {
    console.log('[Mock] Crear nuevo ticket (simulado)');
  }

  /** Agrega una respuesta al ticket */
  responderTicket(ticketId: string, mensaje: string): void {
    const ticket = this.tickets.find(t => t.ticketId === ticketId);
    if (!ticket) return;
    ticket.respuestas = ticket.respuestas || [];
    ticket.respuestas.push({
      fecha: new Date().toISOString().slice(0, 10),
      mensaje,
    });
    this.successMessage = 'Respuesta registrada correctamente.';
  }

  /** Cambia el estado de un ticket y (opcional) añade nota de resolución */
  cambiarEstado(ticketId: string, nuevoEstado: string, nota?: string): void {
    const ticket = this.tickets.find(t => t.ticketId === ticketId);
    if (!ticket) return;
    ticket.estado = nuevoEstado;
    ticket.respuestas = ticket.respuestas || [];
    if (nota) {
      ticket.respuestas.push({
        fecha: new Date().toISOString().slice(0, 10),
        mensaje: `Nota de resolución: ${nota}`,
      });
    }
    this.successMessage = `Estado actualizado a ${nuevoEstado}.`;
    this.calculateStats();
    this.aplicarFiltroPorEstado(this.filtroEstado);
  }

  /** Toggle edición de perfil */
  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) this.loadUserData();
    this.successMessage = '';
    this.errorMessage = '';
  }

  /** Envía actualización de perfil */
  updateProfile(): void {
    const dto = {
      nombre: this.userData.nombre,
      email: this.userData.email,
    };
    const rol = this.authService.getRole();
    this.usuarioService.actualizarUsuarioPorId(this.id, dto, rol).subscribe({
      next: () => {
        this.successMessage = 'Perfil actualizado correctamente.';
        this.isEditing = false;
        this.errorMessage = null;
      },
      error: () => {
        this.errorMessage = 'Error al actualizar perfil.';
      },
    });
  }

  /** Toggle formulario de cambio de contraseña */
  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.successMessage = '';
    this.errorMessage = '';
  }

  /** Llama al servicio para cambiar contraseña */
  changePassword(): void {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }
    const email = this.authService.getEmail();
    if (!email) return;
    this.authService
      .changePasswordAdmin({ email, nuevaPassword: this.passwordData.newPassword })
      .subscribe({
        next: () => {
          this.successMessage = 'Contraseña actualizada correctamente.';
          this.togglePasswordForm();
        },
        error: () => {
          this.errorMessage = 'Error al cambiar la contraseña.';
        },
      });
  }

  /** Elimina la cuenta tras confirmación */
  deleteAccount(): void {
    if (!confirm('¿Seguro que deseas eliminar tu cuenta?')) return;
    const email = this.authService.getEmail();
    const rol = this.authService.getRole();
    if (!email || !rol) return;
    this.usuarioService.obtenerUsuario(email, rol).subscribe({
      next: dto => {
        this.id = dto;
        this.usuarioService.eliminarUsuarioPorId(this.id, rol).subscribe({
          next: () => {
            this.authService.logout();
            this.router.navigate(['/login']);
          },
          error: () => (this.errorMessage = 'Error al eliminar la cuenta.'),
        });
      },
      error: () => (this.errorMessage = 'Error al cargar datos de perfil.'),
    });
  }

  /** Alterna modo oscuro */
  toggleTheme(): void {
    this.preferences.darkMode = !this.preferences.darkMode;
    safeLocalStorageSet('darkMode', String(this.preferences.darkMode));
    this.applyTheme();
  }

  private loadThemePreference(): void {
    this.preferences.darkMode = safeLocalStorageGet('darkMode') === 'true';
    this.applyTheme();
  }

  private applyTheme(): void {
    document.body.classList.toggle('dark-mode', this.preferences.darkMode);
  }
}
