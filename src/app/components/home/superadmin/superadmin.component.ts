/*  src/app/components/home/superadmin/superadmin.component.ts  */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';

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
  ],
  templateUrl: './superadmin.component.html',
  styleUrls: ['./superadmin.component.css'],
})
export class SuperadminComponent implements OnInit {
  /* ------------ flags & feedback ------------- */
  isEditing = false;
  darkMode = false;
  notificationsEnabled = true;

  successMessage = '';
  errorMessage = '';

  /* ------------ datos del admin -------------- */
  adminData = {
    nombre: '',
    email: '',
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
    private authService: AuthService
  ) { }

  /* =========================================================
   *  CICLO DE VIDA
   * ======================================================= */
  ngOnInit(): void {
    this.filteredUsers = this.users; // mock
    this.calculateStats();
    this.loadSettings();
    this.loadAdminData();
  }

  /* =========================================================
   *  CARGAR ADMIN
   * ======================================================= */
  private loadAdminData(): void {
    const email = this.authService.getEmail();
    if (!email) return;

    this.adminService.obtenerAdminPorEmail(email).subscribe({
      next: (dto) => {
        this.adminData = { nombre: dto.nombre, email: dto.email };
        localStorage.setItem('userName', dto.nombre);
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Error loading admin:', err);
        this.errorMessage = 'Error al cargar los datos del administrador';
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
    const id = this.authService.getUserId();
    if (!id) return;

    this.adminService.actualizarAdmin(id, this.adminData).subscribe({
      next: () => {
        this.successMessage = 'Perfil actualizado exitosamente';
        this.isEditing = false;
        localStorage.setItem('userName', this.adminData.nombre);
      },
      error: (err) => {
        console.error('Error updating admin:', err);
        this.errorMessage = 'Error al actualizar el perfil';
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
    localStorage.setItem(
      'notifications',
      String(this.notificationsEnabled)
    );
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
}
