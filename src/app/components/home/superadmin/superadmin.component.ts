import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

import { AdminService } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';
import { FinanzasService } from '../../../services/finanzas.service';

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
  providers: [FinanzasService]
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

  /* ------------ gestión usuarios ------------- */
  searchTerm = '';
  filteredUsers: any[] = []; // ajusta el tipo si tienes interfaz Usuario[]

  /* ------------ módulo financiero ------------- */
  datosFinancieros: any = null;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private finanzasService: FinanzasService
  ) { }

  ngOnInit(): void {
    this.loadSettings();
    this.loadAdminData();
    this.cargarDatosFinancieros();
    this.cargarUsuarios(); // carga usuarios reales
  }

  /* ========= Obtener usuarios desde base de datos ========= */
  private cargarUsuarios(): void {
    this.adminService.obtenerUsuarios().subscribe({
      next: (usuarios) => {
        this.filteredUsers = usuarios;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
      }
    });
  }

  filterUsers(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.filteredUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term)
    );
  }

  /* ================== Finanzas =================== */
  private cargarDatosFinancieros(): void {
    this.finanzasService.obtenerModuloFinanzas().subscribe({
      next: (data) => {
        this.datosFinancieros = data.moduloFinanzas;
      },
      error: (err) => {
        console.error('Error cargando datos de finanzas:', err);
      }
    });
  }

  /* ================== Datos admin =================== */
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
        console.error('Error cargando admin:', err);
        this.errorMessage = 'Error al cargar los datos del administrador';
      },
    });
  }

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
        console.error('Error actualizando perfil:', err);
        this.errorMessage = 'Error al actualizar el perfil';
      },
    });
  }

  /* ================== Preferencias =================== */
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

  /* ================== Acciones usuario =================== */
  editUser(user: any): void {
    console.log('Editar usuario:', user);
  }

  deleteUser(user: any): void {
    console.log('Eliminar usuario:', user);
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
}
