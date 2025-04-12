import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';

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
  selector: 'app-marketing-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './marketing-home.component.html',
  styleUrls: ['./marketing-home.component.css']
})
export class MarketingHomeComponent implements OnInit {
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
    especialidad: 'Marketing Digital',
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
    this.activeCampaigns = this.campaigns.filter(c => c.status === 'active').length;
    this.totalReach = this.campaigns.reduce((sum, c) => sum + c.reach, 0);
    this.totalBudget = this.campaigns.reduce((sum, c) => sum + c.budget, 0);
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