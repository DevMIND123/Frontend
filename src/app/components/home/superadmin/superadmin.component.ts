import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
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
    FooterComponent
  ],
  templateUrl: './superadmin.component.html',
  styleUrls: ['./superadmin.component.css']
})
export class SuperadminComponent implements OnInit {
  totalUsers = 0;
  activeUsers = 0;
  totalCompanies = 0;
  newUsersThisMonth = 0;
  searchTerm = '';
  isEditing = false;
  successMessage = '';
  errorMessage = '';
  darkMode = false;
  notificationsEnabled = true;

  adminData = {
    nombre: '',
    email: ''
  };

  users: User[] = [
    {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      role: 'CLIENTE',
      status: 'active',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Tech Corp',
      email: 'tech@example.com',
      role: 'EMPRESA',
      status: 'active',
      createdAt: new Date('2024-02-01')
    },
    {
      id: '3',
      name: 'Ana López',
      email: 'ana@example.com',
      role: 'SOPORTE',
      status: 'active',
      createdAt: new Date('2024-03-01')
    }
  ];

  filteredUsers: User[] = [];

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.calculateStats();
    this.filteredUsers = this.users;
    this.loadAdminData();
    this.loadSettings();
  }

  loadAdminData() {
    const email = this.authService.getEmail();
    if (email) {
      this.adminService.obtenerAdminPorEmail(email).subscribe({
        next: (data) => {
          this.adminData = {
            nombre: data.nombre,
            email: data.email
          };
          this.errorMessage = '';
        },
        error: (error) => {
          console.error('Error loading admin data:', error);
          this.errorMessage = 'Error al cargar los datos del administrador';
        }
      });
    }
  }

  loadSettings() {
    const darkModeSetting = localStorage.getItem('darkMode');
    this.darkMode = darkModeSetting === 'true';
    const notificationsSetting = localStorage.getItem('notifications');
    this.notificationsEnabled = notificationsSetting !== 'false';
    this.applyDarkMode();
  }

  calculateStats() {
    this.totalUsers = this.users.length;
    this.activeUsers = this.users.filter(u => u.status === 'active').length;
    this.totalCompanies = this.users.filter(u => u.role === 'EMPRESA').length;
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    this.newUsersThisMonth = this.users.filter(u => u.createdAt >= firstDayOfMonth).length;
  }

  filterUsers() {
    if (!this.searchTerm) {
      this.filteredUsers = this.users;
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  }

  getRoleBadgeClass(role: string): string {
    const classes = {
      'CLIENTE': 'bg-success',
      'EMPRESA': 'bg-primary',
      'SOPORTE': 'bg-info',
      'MARKETING': 'bg-warning',
      'SUPER_ADMIN': 'bg-danger'
    };
    return classes[role as keyof typeof classes] || 'bg-secondary';
  }

  getStatusBadgeClass(status: string): string {
    return status === 'active' ? 'bg-success' : 'bg-secondary';
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadAdminData();
    }
    this.successMessage = '';
    this.errorMessage = '';
  }

  updateProfile() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.adminService.actualizarAdmin(userId, this.adminData).subscribe({
        next: () => {
          this.successMessage = 'Perfil actualizado exitosamente';
          this.isEditing = false;
          if (this.adminData.nombre !== localStorage.getItem('userName')) {
            localStorage.setItem('userName', this.adminData.nombre);
          }
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.errorMessage = 'Error al actualizar el perfil';
        }
      });
    }
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', this.darkMode.toString());
    this.applyDarkMode();
  }

  private applyDarkMode() {
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  toggleNotifications() {
    localStorage.setItem('notifications', this.notificationsEnabled.toString());
  }

  createUser() {
    console.log('Create new user');
  }

  editUser(user: User) {
    console.log('Edit user:', user);
  }

  deleteUser(user: User) {
    console.log('Delete user:', user);
  }
}