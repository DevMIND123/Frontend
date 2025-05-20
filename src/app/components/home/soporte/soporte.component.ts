// (Todas tus importaciones actuales)
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

  empresaId = '';
  documentosSubidos: any[] = [];
  estadoValidacion = '';
  notificacionEnviada = false;
  historialSoporteUsuario: any[] = [];
  reportesEficiencia: any;
  faq: any[] = [];

  tickets: any[] = [];
  ticketsFiltrados: any[] = [];
  filtroEstado: string = 'Todos';

  usuariosDisponibles: string[] = [];
  usuarioSeleccionado: string | null = null;
  historialFiltrado: any[] = [];
  filtroHistorialCategoria: string = '';
  filtroHistorialEstado: string = '';
  categoriasDisponibles: string[] = [];

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

  private loadUserData(): void {
    const email = this.authService.getEmail();
    const rol = this.authService.getRole();

    if (!email || !rol) {
      this.errorMessage = 'No se encontró la sesión de la empresa. Inicia sesión nuevamente.';
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioService.obtenerUsuario(email, rol).subscribe({
      next: (dto) => {
        this.id = dto;
        this.usuarioService.obtenerUsuarioById(this.id, rol).subscribe({
          next: (dto) => {
            this.userData = {
              nombre: dto.nombre,
              email: dto.email,
              departamento: 'Soporte Técnico',
              especialidad: 'Atención al Cliente',
            };
            this.errorMessage = null;
          },
          error: () => this.errorMessage = 'Error al cargar los datos de la empresa.',
        });
      },
      error: () => this.errorMessage = 'Error al cargar los datos de la empresa.',
    });
  }

  private cargarDatosDesdeMock(): void {
    this.soporteService.obtenerModuloSoporte().subscribe({
      next: (data) => {
        const soporte = data.moduloSoporte;
        this.empresaId = data.empresaId;
        this.documentosSubidos = soporte.validacionEmpresa.documentosSubidos;
        this.estadoValidacion = soporte.validacionEmpresa.estadoValidacion;
        this.notificacionEnviada = soporte.validacionEmpresa.notificacionEnviada;
        this.historialSoporteUsuario = soporte.historialSoporteUsuario;
        this.reportesEficiencia = soporte.reportesEficiencia;
        this.faq = soporte.faq;
        this.tickets = soporte.tickets;
        this.ticketsFiltrados = soporte.tickets;
        this.usuariosDisponibles = [...new Set(this.tickets.map((t: any) => t.usuarioId))];
        this.categoriasDisponibles = data.categoriasDisponibles || [];
        this.calculateStats();
      },
      error: () => {
        this.errorMessage = 'No se pudo obtener la información de soporte';
      },
    });
  }

createTicket(): void {
  console.log('[Mock] Crear nuevo ticket (simulado)');
}

  
  aplicarFiltroPorEstado(estado: string): void {
    this.filtroEstado = estado;
    this.ticketsFiltrados = estado === 'Todos'
      ? this.tickets
      : this.tickets.filter(t => t.estado === estado);
  }

  filtrarHistorialUsuario(): void {
    if (!this.usuarioSeleccionado) {
      this.historialFiltrado = [];
      return;
    }

    const historial = this.tickets.filter(t => t.usuarioId === this.usuarioSeleccionado);

    this.historialFiltrado = historial.filter(t =>
      (this.filtroHistorialCategoria ? t.categoria === this.filtroHistorialCategoria : true) &&
      (this.filtroHistorialEstado ? t.estado === this.filtroHistorialEstado : true)
    );
  }

  responderTicket(ticketId: string, mensaje: string): void {
    const ticket = this.tickets.find(t => t.ticketId === ticketId);
    if (ticket) {
      ticket.respuestas = ticket.respuestas || [];
      ticket.respuestas.push({
        fecha: new Date().toISOString().slice(0, 10),
        mensaje
      });
      this.successMessage = 'Respuesta registrada correctamente.';
    }
  }

  cambiarEstado(ticketId: string, nuevoEstado: string, nota?: string): void {
    const ticket = this.tickets.find(t => t.ticketId === ticketId);
    if (ticket) {
      ticket.estado = nuevoEstado;
      ticket.respuestas = ticket.respuestas || [];
      if (nota) {
        ticket.respuestas.push({
          fecha: new Date().toISOString().slice(0, 10),
          mensaje: `Nota de resolución: ${nota}`
        });
      }
      this.successMessage = `Estado actualizado a ${nuevoEstado}`;
      this.calculateStats();
      this.aplicarFiltroPorEstado(this.filtroEstado);
    }
  }

  private calculateStats(): void {
    this.activeTickets = this.tickets.filter(t => t.estado === 'Abierto').length;
    this.inProgressTickets = this.tickets.filter(t => t.estado === 'En Proceso').length;
    this.resolvedTickets = this.tickets.filter(t => t.estado === 'Cerrado').length;
  }

  

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) this.loadUserData();
    this.successMessage = '';
    this.errorMessage = '';
  }

  updateProfile(): void {
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
      error: () => this.errorMessage = 'Error al actualizar los datos.',
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

    this.authService.changePasswordAdmin({
      email,
      nuevaPassword: this.passwordData.newPassword,
    }).subscribe({
      next: () => {
        this.successMessage = 'Contraseña actualizada exitosamente';
        this.togglePasswordForm();
      },
      error: () => {
        this.errorMessage = 'Error al cambiar la contraseña';
      },
    });
  }

  deleteAccount(): void {
    if (!confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.'))
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
          error: () => this.errorMessage = 'Error al eliminar la cuenta',
        });
      },
      error: () => this.errorMessage = 'Error al cargar los datos de la empresa.',
    });
  }

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

