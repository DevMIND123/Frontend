/*  src/app/components/home/empresa/empresa.component.ts  */
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/* ─── stand‑alone shared components ───────────────────── */
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

/* ─── servicios y modelos ─────────────────────────────── */
import { UsuarioService } from '../../../services/usuario.service';
import { AuthService } from '../../../services/auth.service';
import { EmpresaUpdateDTO } from '../../../models/empresa';
import Swal from 'sweetalert2';
import { safeLocalStorageGet, safeLocalStorageSet } from '../../../shared/utils/utils';

/* ─── Tipos “mock” usados en la vista ──────────────────── */
import { EmpresaDashboardService } from '../../../services/empresa-dashboard.service';

interface ServiceItem {
  name: string;
  description: string;
  price: number;
  status: 'active' | 'inactive';
}

interface ClientItem {
  name: string;
  email: string;
  subscriptionDate: Date;
}

@Component({
  selector: 'app-empresa-home',
  standalone: true,
  /*  IMPORTANTE:
      ‑  CommonModule y FormsModule  → directivas como *ngIf, ngModel, …
      ‑  RouterModule               → routerLink, etc.
      ‑  NavbarComponent, FooterComponent
         para que Angular reconozca <app-navbar> y <app-footer>            */
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.css'],
})
export class EmpresaHomeComponent implements OnInit {
  /* ═══════════════════════════════════════════════════════
   *  PROPIEDADES
   * ═════════════════════════════════════════════════════ */
  isEditing = false;
  showPasswordForm = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  id: number = 0;
  /** datos principales de la empresa (editable) */
  companyData = {
    nombreEmpresa: '',
    nombreRepresentante: '',
    numeroDocumento: '',
    email: '',
    departamento: '',
    especialidad: '',
    nit: '',
  };

  /** formulario de cambio de contraseña */
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  /** preferencias locales */
  preferences = {
    darkMode: false,
    notifications: true,
  };

  /* ─── datos “mock” para demo ─────────────────────────── */
  services: ServiceItem[] = [
    {
      name: 'Consultoría',
      description: 'Servicio de consultoría técnica.',
      price: 250_000,
      status: 'active',
    },
    {
      name: 'Mantenimiento',
      description: 'Soporte y mantenimiento mensual.',
      price: 180_000,
      status: 'inactive',
    },
  ];

  clients: ClientItem[] = [
    {
      name: 'María López',
      email: 'maria@example.com',
      subscriptionDate: new Date('2023‑12‑01'),
    },
    {
      name: 'Juan Torres',
      email: 'juan@example.com',
      subscriptionDate: new Date('2024‑01‑15'),
    },
  ];
  filteredClients: ClientItem[] = [...this.clients];
  searchTerm = '';
  dashboardResumen: any = null;

  /* ═══════════════════════════════════════════════════════
   *  CONSTRUCTOR & CICLO DE VIDA
   * ═════════════════════════════════════════════════════ */
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly empresaDashboardService: EmpresaDashboardService
  ) {}

  ngOnInit(): void {
    this.loadCompanyData();
    this.loadThemePreference();
    this.empresaDashboardService.obtenerResumenEmpresa().subscribe({
      next: (data) => {
        this.dashboardResumen = data;
        console.log('[Empresa] Dashboard cargado:', data);
      },
      error: (err) => {
        console.error('[Empresa] Error al cargar dashboard:', err);
      }
    });
  }

  /* ═══════════════════════════════════════════════════════
   *  CARGA DE DATOS EMPRESA
   * ═════════════════════════════════════════════════════ */
  private loadCompanyData(): void {
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
            this.companyData = {
              nombreEmpresa: dto.nombreEmpresa,
              nombreRepresentante: dto.nombreRepresentante,
              numeroDocumento: dto.numeroDocumento,
              email: dto.email,
              departamento: dto.departamento,
              especialidad: dto.especialidad,
              nit: dto.nit,
            };

            console.log('[Empresa] loadCompanyData (by ID):', this.companyData);
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

  /* ═══════════════════════════════════════════════════════
   *  EDICIÓN DE PERFIL
   * ═════════════════════════════════════════════════════ */
  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // canceló edición
      this.successMessage = null;
      this.errorMessage = null;
      this.loadCompanyData();
    }
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

    this.authService.changePassword(payload).subscribe({
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

  onSubmit(): void {
    console.log('[Empresa] onSubmit:', this.companyData);

    const dto = {
      nombreEmpresa: this.companyData.nombreEmpresa,
      nit: this.companyData.nit,
      nombreRepresentante: this.companyData.nombreRepresentante,
      email: this.companyData.email,
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

  /* ═══════════════════════════════════════════════════════
   *  CAMBIO DE CONTRASEÑA
   * ═════════════════════════════════════════════════════ */
  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    this.errorMessage = null;
    this.successMessage = null;
  }

  changePassword(): void {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    const email = this.authService.getEmail();
    if (!email) return;

    this.authService
      .changePassword({ email, nuevaPassword: this.passwordData.newPassword })
      .subscribe({
        next: () => {
          this.successMessage = 'Contraseña actualizada correctamente';
          this.togglePasswordForm();
        },
        error: (err) => {
          this.errorMessage = 'Error al cambiar la contraseña';
          console.error('[Empresa] changePassword:', err);
        },
      });
  }

  /* ═══════════════════════════════════════════════════════
   *  ELIMINAR CUENTA
   * ═════════════════════════════════════════════════════ */
  deleteAccount(): void {
    if (
      !confirm(
        '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.'
      )
    ) {
      return;
    }

    const rol = this.authService.getRole();
    if (!rol) return;

    this.usuarioService.eliminarUsuarioPorId(this.id, rol).subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.errorMessage = 'Error al eliminar la cuenta';
        console.error('[Empresa] deleteAccount:', err);
      },
    });
  }

  /* ═══════════════════════════════════════════════════════
   *  PREFERENCIAS / TEMA
   * ═════════════════════════════════════════════════════ */
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

  /* ═══════════════════════════════════════════════════════
   *  SERVICIOS (mock)
   * ═════════════════════════════════════════════════════ */
  getTotalIncome(): number {
    return this.services
      .filter((s) => s.status === 'active')
      .reduce((acc, s) => acc + s.price, 0);
  }

  addService(): void {
    this.services.push({
      name: 'Nuevo Servicio',
      description: 'Descripción del nuevo servicio.',
      price: 100_000,
      status: 'active',
    });
  }

  editService(service: ServiceItem): void {
    alert(`Editar servicio: ${service.name}`);
  }

  deleteService(service: ServiceItem): void {
    if (confirm(`¿Eliminar el servicio "${service.name}"?`)) {
      this.services = this.services.filter((s) => s !== service);
    }
  }

  /* ═══════════════════════════════════════════════════════
   *  CLIENTES (mock)
   * ═════════════════════════════════════════════════════ */
  filterClients(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredClients = this.clients.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
    );
  }

  viewClientDetails(client: ClientItem): void {
    alert(`Detalles de ${client.name}`);
  }
}
