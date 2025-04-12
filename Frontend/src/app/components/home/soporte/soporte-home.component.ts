import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';

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
    RouterModule,
    FormsModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './soporte-home.component.html',
  styleUrls: ['./soporte-home.component.css']
})
export class SoporteHomeComponent implements OnInit {
  activeTickets = 0;
  inProgressTickets = 0;
  resolvedTickets = 0;
  avgResponseTime = 4;
  isEditing = false;
  successMessage = '';
  errorMessage = '';

  userData = {
    nombre: '',
    email: '',
    departamento: 'Soporte Técnico',
    especialidad: 'Atención al Cliente',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  preferences = {
    darkMode: false,
    notifications: true
  };

  showPasswordForm = false;

  tickets: Ticket[] = [
    {
      id: '1',
      title: 'Error en inicio de sesión',
      status: 'open',
      priority: 'high',
      createdAt: new Date('2024-03-10T09:00:00'),
      updatedAt: new Date('2024-03-10T09:00:00'),
      client: 'Juan Pérez'
    },
    {
      id: '2',
      title: 'Problema con pago',
      status: 'in_progress',
      priority: 'medium',
      createdAt: new Date('2024-03-09T15:30:00'),
      updatedAt: new Date('2024-03-10T10:15:00'),
      client: 'María López'
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    this.calculateStats();
    this.loadUserData();
    this.loadThemePreference();
  }

  loadUserData() {
    const email = localStorage.getItem('userEmail');
    if (email) {
      this.usuarioService.obtenerUsuarioPorEmail(email).subscribe({
        next: (data) => {
          this.userData = {
            ...this.userData,
            ...data
          };
          this.errorMessage = '';
        },
        error: (error) => {
          console.error('Error loading user data:', error);
          this.errorMessage = 'Error al cargar los datos del usuario';
        }
      });
    }
  }

  loadThemePreference() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    this.preferences.darkMode = darkMode;
    this.applyTheme();
  }

  calculateStats() {
    this.activeTickets = this.tickets.filter(t => t.status === 'open').length;
    this.inProgressTickets = this.tickets.filter(t => t.status === 'in_progress').length;
    this.resolvedTickets = this.tickets.filter(t => t.status === 'resolved').length;
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadUserData();
    }
    this.successMessage = '';
    this.errorMessage = '';
  }

  updateProfile() {
    const userId = localStorage.getItem('userId');
    if (userId) {
      this.usuarioService.actualizarUsuario(this.userData).subscribe({
        next: () => {
          this.successMessage = 'Perfil actualizado exitosamente';
          this.isEditing = false;
          if (this.userData.nombre !== localStorage.getItem('userName')) {
            localStorage.setItem('userName', this.userData.nombre);
          }
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.errorMessage = 'Error al actualizar el perfil';
        }
      });
    }
  }

  togglePasswordForm() {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.userData.currentPassword = '';
      this.userData.newPassword = '';
      this.userData.confirmPassword = '';
    }
  }

  changePassword() {
    if (this.userData.newPassword !== this.userData.confirmPassword) {
      this.errorMessage = 'Las contraseñas nuevas no coinciden';
      return;
    }

    // Here you would typically call a service method to change the password
    console.log('Changing password...');
    this.successMessage = 'Contraseña actualizada exitosamente';
    this.togglePasswordForm();
  }

  deleteAccount() {
    if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      const userId = localStorage.getItem('userId');
      if (userId) {
        this.usuarioService.eliminarUsuario(userId).subscribe({
          next: () => {
            this.authService.logout();
            this.router.navigate(['/login']);
          },
          error: (error) => {
            console.error('Error deleting account:', error);
            this.errorMessage = 'Error al eliminar la cuenta';
          }
        });
      }
    }
  }

  toggleTheme() {
    this.preferences.darkMode = !this.preferences.darkMode;
    localStorage.setItem('darkMode', this.preferences.darkMode.toString());
    this.applyTheme();
  }

  private applyTheme() {
    document.body.classList.toggle('dark-mode', this.preferences.darkMode);
  }

  getStatusClass(status: string): string {
    const classes = {
      'open': 'bg-danger',
      'in_progress': 'bg-warning',
      'resolved': 'bg-success',
      'closed': 'bg-secondary'
    };
    return classes[status as keyof typeof classes] || 'bg-secondary';
  }

  getStatusLabel(status: string): string {
    const labels = {
      'open': 'Abierto',
      'in_progress': 'En Progreso',
      'resolved': 'Resuelto',
      'closed': 'Cerrado'
    };
    return labels[status as keyof typeof labels] || status;
  }

  getPriorityClass(priority: string): string {
    const classes = {
      'low': 'bg-info',
      'medium': 'bg-warning',
      'high': 'bg-danger'
    };
    return classes[priority as keyof typeof classes] || 'bg-secondary';
  }

  getPriorityLabel(priority: string): string {
    const labels = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta'
    };
    return labels[priority as keyof typeof labels] || priority;
  }

  createTicket() {
    console.log('Create new ticket');
  }

  viewTicket(ticket: Ticket) {
    console.log('View ticket:', ticket);
  }

  updateStatus(ticket: Ticket) {
    console.log('Update ticket status:', ticket);
  }
}