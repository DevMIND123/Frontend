/*  src/app/components/home/superadmin/superadmin.component.ts  */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
0;
/* --------------- Modelos auxiliares (mock) --------------- */
interface User {
  id: string;
  name: string;
  email: string;
  role: 'CLIENTE' | 'EMPRESA' | 'SOPORTE' | 'MARKETING' | 'SUPER_ADMIN';
  status: 'active' | 'inactive';
  createdAt: Date;
}

@Component({
  selector: 'app-superadmin-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NavbarComponent,
    FooterComponent,
    RouterModule,
  ],
  templateUrl: './superadmin.component.html',
  styleUrls: ['./superadmin.component.css'],
})
export class SuperadminComponent implements OnInit {
  /* ------------ flags & feedback ------------- */
  isEditing = false;
  darkMode = false;
  notificationsEnabled = true;
  showPasswordForm = false;
  // Lista de roles permitidos
  availableRoles = ['SOPORTE', 'MARKETING'];
  successMessage: string | null = null;
  errorMessage: string | null = null;
  id: number = 0;
  /* ------------ datos del admin -------------- */
  adminData = {
    nombre: '',
    email: '',
  };

  /** formulario de cambio de contraseña */
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  /* ------------ dashboard  mock -------------- */
  users: User[] = [
    {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      role: 'CLIENTE',
      status: 'active',
      createdAt: new Date('2024‑01‑15'),
    },
    {
      id: '2',
      name: 'Tech Corp',
      email: 'tech@example.com',
      role: 'EMPRESA',
      status: 'active',
      createdAt: new Date('2024‑02‑01'),
    },
    {
      id: '3',
      name: 'Ana López',
      email: 'ana@example.com',
      role: 'SOPORTE',
      status: 'inactive',
      createdAt: new Date('2024‑03‑01'),
    },
  ];

  /* ------------ dashboard métricas ----------- */
  totalUsers = 0;
  activeUsers = 0;
  totalCompanies = 0;
  newUsersThisMonth = 0;

  /* ------------ búsqueda usuarios ------------ */
  searchTerm = '';
  filteredUsers: User[] = [];

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  /* =========================================================
   *  CICLO DE VIDA
   * ======================================================= */
  ngOnInit(): void {
    this.filteredUsers = this.users; // mock
    this.calculateStats();
    this.loadSettings();
    this.loadAdminData();
    this.loadUsers(); // Cargar todos los usuarios al inicio
  }
  allUsers: any[] = [];

  private loadUsers(): void {
    forkJoin({
      admins: this.usuarioService.obtenerTodosAdministradores(),
      empresas: this.usuarioService.obtenerTodasEmpresas(),
      clientes: this.usuarioService.obtenerTodosClientes(),
    }).subscribe({
      next: ({ admins, empresas, clientes }) => {
        // Combina y estandariza
        const combined = [...admins, ...empresas, ...clientes];

        this.allUsers = combined.map((item) => ({
          id: item.id,
          // si viene de admin/cliente usa `nombre`, si viene de empresa usa `nombreEmpresa`
          name: (item as any).nombre ?? (item as any).nombreEmpresa,
          email: item.email,
          role: item.rol, // o `item.role` según tu DTO real
        }));
        // para que la tabla *ngFor use filteredUsers:
        this.filteredUsers = [...this.allUsers];
      },
      error: (err) => console.error('Error cargando usuarios:', err),
    });
  }

  /* =========================================================
   *  CARGAR ADMIN
   * ======================================================= */
  private loadAdminData(): void {
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
            this.adminData = {
              nombre: dto.nombre,
              email: dto.email,
            };

            console.log('[Empresa] loadCompanyData (by ID):', this.adminData);
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
   *  DASHBOARD MÉTRICAS
   * ======================================================= */
  private calculateStats(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    this.totalUsers = this.users.length;
    this.activeUsers = this.users.filter((u) => u.status === 'active').length;
    this.totalCompanies = this.users.filter((u) => u.role === 'EMPRESA').length;
    this.newUsersThisMonth = this.users.filter(
      (u) => u.createdAt >= firstDay
    ).length;
  }

  /* =========================================================
   *  BÚSQUEDA / FILTRO
   * ======================================================= */
  filterUsers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = this.users;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term)
    );
  }

  /* =========================================================
   *  EDICIÓN DE PERFIL
   * ======================================================= */
  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) this.loadAdminData();
    this.successMessage = '';
    this.errorMessage = '';
  }

  updateProfile(): void {
    console.log('[Empresa] onSubmit:', this.adminData);

    const dto = {
      nombre: this.adminData.nombre,
      email: this.adminData.email,
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
   *  PREFS / DARK MODE / NOTIFICACIONES
   * ======================================================= */
  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', String(this.darkMode));
    this.applyDarkMode();
  }

  toggleNotifications(): void {
    localStorage.setItem('notifications', String(this.notificationsEnabled));
  }

  private loadSettings(): void {
    this.darkMode = localStorage.getItem('darkMode') === 'true';
    this.notificationsEnabled =
      localStorage.getItem('notifications') !== 'false';
    this.applyDarkMode();
  }

  private applyDarkMode(): void {
    document.body.classList.toggle('dark-mode', this.darkMode);
  }

  /* =========================================================
   *  ESTILOS BADGES (helpers view)
   * ======================================================= */
  getRoleBadgeClass(role: User['role']): string {
    return (
      {
        CLIENTE: 'bg-success',
        EMPRESA: 'bg-primary',
        SOPORTE: 'bg-info',
        MARKETING: 'bg-warning',
        SUPER_ADMIN: 'bg-danger',
      }[role] || 'bg-secondary'
    );
  }
  getStatusBadgeClass(status: User['status']): string {
    return status === 'active' ? 'bg-success' : 'bg-secondary';
  }

  /* =========================================================
   *  ACCIONES MOCK SOBRE USUARIOS
   * ======================================================= */
  createUser(): void {
    console.log('Create new user');
  }
  editUser(u: User): void {
    console.log('Edit user:', u);
  }
  deleteUser(u: User): void {
    console.log('Delete user:', u);
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
    const email = this.authService.getEmail();
    if (!email) return;

    this.authService
      .changePasswordAdmin({
        email,
        nuevaPassword: this.passwordData.newPassword,
      })
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

  openCreateUserModal() {
    Swal.fire({
      title: 'Crear nuevo usuario',
      html:
        `<input id="swal-email" class="swal2-input" placeholder="Email">` +
        `<input id="swal-nombre" class="swal2-input" placeholder="Nombre">` +
        `<input id="swal-password" type="password" class="swal2-input" placeholder="Contraseña">` +
        `<select id="swal-rol" class="swal2-input">
         ${this.availableRoles
           .map((r) => `<option value="${r}">${r}</option>`)
           .join('')}
       </select>`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'create-user-popup',
        title: 'create-user-title',
        input: 'create-user-input',
        confirmButton: 'create-user-confirm',
        cancelButton: 'create-user-cancel',
        validationMessage: 'create-user-validation',
      },
      preConfirm: () => {
        const email = (
          document.getElementById('swal-email') as HTMLInputElement
        ).value;
        const nombre = (
          document.getElementById('swal-nombre') as HTMLInputElement
        ).value;
        const password = (
          document.getElementById('swal-password') as HTMLInputElement
        ).value;
        const rol = (document.getElementById('swal-rol') as HTMLSelectElement)
          .value;
        if (!email || !nombre || !password) {
          Swal.showValidationMessage('✱ Todos los campos son obligatorios');
        }
        return { email, nombre, password, rol };
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        console.log(result.value);

        this.adminService.createAdmin(result.value).subscribe(
          (response) => {
            console.log('Usuario creado:', response);
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'Usuario creado correctamente.',
              confirmButtonText: 'Aceptar',
            });
          },
          (error) => {
            console.error('Error al crear el usuario:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo crear el usuario.',
              confirmButtonText: 'Aceptar',
            });
          }
        );
      }
    });
  }
}
