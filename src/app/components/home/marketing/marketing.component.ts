import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { UsuarioUpdateDTO } from '../../../models/usuario'; // 👈 NUEVO

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'draft' | 'completed';
  startDate: Date;
  endDate: Date;
  budget: number;
  reach: number;
}

@Component({
  selector: 'app-marketing',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './marketing.component.html',
  styleUrls: ['./marketing.component.css']
})
export class MarketingComponent implements OnInit {
  activeCampaigns = 0;
  totalReach = 0;
  totalBudget = 0;
  isEditing = false;
  successMessage = '';
  errorMessage = '';
  showPasswordForm = false;

  userData = {
    nombre: '',
    email: '',
    departamento: 'Marketing',
    especialidad: 'Marketing Digital'
  };

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  preferences = {
    darkMode: false,
    notifications: true
  };

  campaigns: Campaign[] = [
    {
      id: '1',
      name: 'Campaña de Verano',
      status: 'active',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-05-31'),
      budget: 5000000,
      reach: 50000
    },
    {
      id: '2',
      name: 'Promoción Fitness',
      status: 'draft',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-06-30'),
      budget: 3000000,
      reach: 30000
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit() {
    this.calculateStats();
    this.loadUserData();
    this.loadThemePreference();
  }

  loadUserData() {
    const email = this.authService.getEmail();
    const rol = this.authService.getRole();

    if (!email || !rol) {
      this.errorMessage = 'No se encontró información del usuario.';
      return;
    }

    this.usuarioService.obtenerUsuarioPorEmail(email, rol).subscribe({
      next: (data: any) => {
        this.userData = {
          nombre: data.nombre || '',
          email: data.email || '',
          departamento: data.departamento || 'Marketing',
          especialidad: data.especialidad || 'Marketing Digital'
        };
        this.errorMessage = '';
      },
      error: (error: any) => {
        console.error('Error loading user data:', error);
        this.errorMessage = 'Error al cargar los datos del usuario';
      }
    });
  }

  updateProfile() {
    const rol = this.authService.getRole();
    if (!this.userData.email || !rol) return;

    const updateData: UsuarioUpdateDTO = {
      nombre: this.userData.nombre,
      email: this.userData.email,
      departamento: this.userData.departamento,
      especialidad: this.userData.especialidad
    };

    this.usuarioService.actualizarUsuario(updateData).subscribe({
      next: () => {
        this.successMessage = 'Perfil actualizado exitosamente';
        this.isEditing = false;
        localStorage.setItem('userName', this.userData.nombre);
      },
      error: (error: any) => {
        console.error('Error updating profile:', error);
        this.errorMessage = 'Error al actualizar el perfil';
      }
    });
  }

  deleteAccount() {
    if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      const email = this.userData.email;
      const rol = this.authService.getRole();

      if (!email || !rol) return;

      this.usuarioService.eliminarUsuarioPorEmail(email, rol).subscribe({
        next: () => {
          this.authService.logout();
          this.router.navigate(['/login']);
        },
        error: (error: any) => {
          console.error('Error deleting account:', error);
          this.errorMessage = 'Error al eliminar la cuenta';
        }
      });
    }
  }

  changePassword() {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMessage = 'Las contraseñas nuevas no coinciden';
      return;
    }

    const email = this.userData.email;

    this.authService.changePassword({ email, nuevaPassword: this.passwordData.newPassword }).subscribe({
      next: () => {
        this.successMessage = 'Contraseña actualizada exitosamente';
        this.togglePasswordForm();
      },
      error: (error: any) => {
        console.error('Error changing password:', error);
        this.errorMessage = 'Error al cambiar la contraseña';
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) this.loadUserData();
    this.successMessage = '';
    this.errorMessage = '';
  }

  togglePasswordForm() {
    this.showPasswordForm = !this.showPasswordForm;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  loadThemePreference() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    this.preferences.darkMode = darkMode;
    this.applyTheme();
  }

  toggleTheme() {
    this.preferences.darkMode = !this.preferences.darkMode;
    localStorage.setItem('darkMode', this.preferences.darkMode.toString());
    this.applyTheme();
  }

  private applyTheme() {
    document.body.classList.toggle('dark-mode', this.preferences.darkMode);
  }

  calculateStats() {
    this.activeCampaigns = this.campaigns.filter(c => c.status === 'active').length;
    this.totalReach = this.campaigns.reduce((sum, c) => sum + c.reach, 0);
    this.totalBudget = this.campaigns.reduce((sum, c) => sum + c.budget, 0);
  }

  getStatusClass(status: string): string {
    const classes = {
      'active': 'bg-success',
      'draft': 'bg-warning',
      'completed': 'bg-secondary'
    };
    return classes[status as keyof typeof classes] || 'bg-secondary';
  }

  getStatusLabel(status: string): string {
    const labels = {
      'active': 'Activa',
      'draft': 'Borrador',
      'completed': 'Completada'
    };
    return labels[status as keyof typeof labels] || status;
  }

  createCampaign() {
    console.log('Create new campaign');
  }

  editCampaign(campaign: Campaign) {
    console.log('Edit campaign:', campaign);
  }

  deleteCampaign(campaign: Campaign) {
    console.log('Delete campaign:', campaign);
  }
}
