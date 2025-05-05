import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { FinanzasService } from '../../../services/finanzas.service';

import { safeLocalStorageGet, safeLocalStorageSet } from '../../../shared/utils/utils';

import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

/* Modelo auxiliar */
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
  ],
  templateUrl: './superadmin.component.html',
  styleUrls: ['./superadmin.component.css'],
  providers: [FinanzasService],
})
export class SuperadminComponent implements OnInit {
  // Flags
  isEditing = false;
  darkMode = false;
  notificationsEnabled = true;
  showPasswordForm = false;

  successMessage: string | null = null;
  errorMessage: string | null = null;

  id: number = 0;

  // Datos personales del admin
  adminData = {
    nombre: '',
    email: '',
  };

  // Gestión de usuarios
  searchTerm = '';
  filteredUsers: User[] = [];
  allUsers: User[] = [];
  availableRoles = ['SOPORTE', 'MARKETING'];

  // Finanzas
  datosFinancieros: any = null;

  // Cambio de contraseña
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private finanzasService: FinanzasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSettings();
    this.loadAdminData();
    this.loadUsers();
    this.loadFinancialData();
  }

  /* ============ Carga de usuarios reales ============ */
  private loadUsers(): void {
    forkJoin({
      admins: this.adminService.obtenerUsuarios(),
      clientes: this.adminService.obtenerClientes(),
      empresas: this.adminService.obtenerEmpresas(),
    }).subscribe({
      next: ({ admins, clientes, empresas }) => {
        const mappedAdmins: User[] = admins.map((a) => ({
          id: a.id,
          name: a.nombre,
          email: a.email,
          role: a.rol, // Asume que ya es 'SOPORTE', 'MARKETING', etc.
          status: a.estadoCuenta === 'Activo' ? 'active' : 'inactive',
          createdAt: new Date(), // Ajusta si tienes un campo de fecha
        }));

        const mappedClientes: User[] = clientes.map((c) => ({
          id: c.id,
          name: c.nombre,
          email: c.email,
          role: 'CLIENTE',
          status: c.estadoCuenta === 'Activo' ? 'active' : 'inactive',
          createdAt: new Date(), // Ajusta si tienes fecha
        }));

        const mappedEmpresas: User[] = empresas.map((e) => ({
          id: e.id,
          name: e.nombre,
          email: e.email,
          role: 'EMPRESA',
          status: e.estadoCuenta === 'Activo' ? 'active' : 'inactive',
          createdAt: new Date(), // Ajusta si tienes fecha
        }));

        const allUsers = [
          ...mappedAdmins,
          ...mappedClientes,
          ...mappedEmpresas,
        ];

        this.allUsers = allUsers;
        this.filteredUsers = allUsers;
      },
      error: (err) => console.error('Error al cargar usuarios:', err),
    });
  }

  filterUsers(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.allUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term)
    );
  }

  /* ============ Datos financieros (mock) ============ */
  private loadFinancialData(): void {
    this.finanzasService.obtenerModuloFinanzas().subscribe({
      next: (data) => {
        this.datosFinancieros = data.moduloFinanzas;
      },
      error: (err) => console.error('Error cargando datos financieros:', err),
    });
  }

  /* ============ Cargar datos del administrador ============ */
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
        this.usuarioService.obtenerUsuarioById(this.id, rol).subscribe({
          next: (dto) => {
            this.adminData = {
              nombre: dto.nombre,
              email: dto.email,
            };
            this.errorMessage = null;
          },
          error: (err) => {
            this.errorMessage = 'Error al cargar los datos del administrador.';
            console.error('[Admin] loadById:', err);
          },
        });
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar datos del administrador.';
        console.error('[Admin] loadByEmail:', err);
      },
    });
  }

  updateProfile(): void {
    const rol = this.authService.getRole();
    const dto = {
      nombre: this.adminData.nombre,
      email: this.adminData.email,
    };

    this.usuarioService.actualizarUsuarioPorId(this.id, dto, rol).subscribe({
      next: () => {
        this.successMessage = 'Datos actualizados correctamente';
        this.isEditing = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al actualizar el perfil';
        console.error('updateProfile:', err);
      },
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) this.loadAdminData();
    this.successMessage = '';
    this.errorMessage = '';
  }

  /* ================== Preferencias ================== */
  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    safeLocalStorageSet('darkMode', String(this.darkMode));
    this.applyDarkMode();
  }

  toggleNotifications(): void {
    safeLocalStorageSet('notifications', String(this.notificationsEnabled));
  }

  private loadSettings(): void {
    this.darkMode = safeLocalStorageGet('darkMode') === 'true';
    this.notificationsEnabled =
      safeLocalStorageGet('notifications') !== 'false';
    this.applyDarkMode();
  }

  private applyDarkMode(): void {
    document.body.classList.toggle('dark-mode', this.darkMode);
  }

  /* ================== Acciones sobre usuarios ================== */
  editUser(user: User): void {
    Swal.fire({
      title: 'Editar usuario',
      html:
        `<input id="swal-input-nombre" class="swal2-input" placeholder="Nombre" value="${user.name}">` +
        `<input id="swal-input-email" class="swal2-input" value="${user.email}" disabled>`,
      focusConfirm: false,
      preConfirm: () => {
        const nombre = (
          document.getElementById('swal-input-nombre') as HTMLInputElement
        ).value;
        const email = user.email; // No editable, pero se envía
        if (!nombre.trim()) {
          Swal.showValidationMessage('El nombre no puede estar vacío');
          return false;
        }
        return { nombre, email };
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const rol = this.authService.getRole(); // Asumiendo que ya lo tienes
        const dto = {
          nombre: result.value.nombre,
          email: result.value.email,
        };

        this.usuarioService
          .actualizarUsuarioPorId(user.id, dto, rol)
          .subscribe({
            next: () => {
              Swal.fire('Éxito', 'Datos actualizados correctamente', 'success');
              // Aquí puedes actualizar la lista local si lo deseas
              user.name = result.value.nombre;
            },
            error: (err) => {
              console.error('Error al actualizar:', err);
              Swal.fire('Error', 'No se pudo actualizar el usuario', 'error');
            },
          });
      }
    });
  }

  deleteUser(user: User): void {
    console.log('Eliminar usuario:', user);
    this.adminService.deleteAdmin(user.id).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Usuario eliminado correctamente', 'success');
        this.loadUsers(); // Actualizar lista de usuarios
      },
      error: (err) => {
        console.error('Error al eliminar usuario:', err);
        Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
      },
    });
  }

  getRoleBadgeClass(role: string): string {
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

  /* ================== Modal Crear Usuario ================== */
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
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
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
        this.adminService.createAdmin(result.value).subscribe(
          () => {
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'Usuario creado correctamente.',
              confirmButtonText: 'Aceptar',
            });
            this.loadUsers(); // actualizar lista
          },
          (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo crear el usuario.',
              confirmButtonText: 'Aceptar',
            });
            console.error('Error al crear el usuario:', error);
          }
        );
      }
    });
  }

  /* ================== Cambio de contraseña ================== */
  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    this.successMessage = null;
    this.errorMessage = null;
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
          console.error('changePassword:', err);
        },
      });
  }
}
