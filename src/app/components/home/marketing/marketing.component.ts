import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { UsuarioUpdateDTO } from '../../../models/usuario';
import { MarketingService } from '../../../services/marketing.service'; // nuevo servicio
import { safeLocalStorageGet, safeLocalStorageSet } from '../../../shared/utils/utils';

interface Campaign {
  campañaId: string;
  nombre: string;
  estado: 'Activa' | 'Inactiva';
  fechaInicio: string;
  fechaFin: string;
  clicks: number;
  CTR: number;
  gananciasTotales: number;
  publicidades?: any[];
}

@Component({
  selector: 'app-marketing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './marketing.component.html',
  styleUrls: ['./marketing.component.css'],
})
export class MarketingComponent implements OnInit {
  isEditing = false;
  showPasswordForm = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  id = 0;

  userData = {
    nombre: '',
    email: '',
    departamento: 'Marketing',
    especialidad: 'Marketing Digital',
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

  campaigns: Campaign[] = [];

  activeCampaigns = 0;
  totalReach = 0;
  totalBudget = 0;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private marketingService: MarketingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadThemePreference();
    this.cargarDatosDesdeMock();
  }

  private cargarDatosDesdeMock(): void {
    this.marketingService.obtenerModuloMarketing().subscribe({
      next: (data) => {
        const modulo = data.moduloMercadeoPublicidad;
        this.campaigns = modulo.campañas;
        this.calculateStats();
      },
      error: (err) => {
        console.error('Error cargando campañas desde CastleMock:', err);
        this.errorMessage = 'No se pudo obtener información de campañas';
      },
    });
  }

  private loadUserData(): void {
    const email = this.authService.getEmail();
    const rol = this.authService.getRole();

    if (!email || !rol) {
      this.errorMessage = 'No se encontró información del usuario.';
      return;
    }

    this.usuarioService.obtenerUsuario(email, rol).subscribe({
      next: (dto) => {
        this.id = dto;

        this.usuarioService.obtenerUsuarioById(this.id, rol).subscribe({
          next: (dto) => {
            this.userData = {
              nombre: dto.nombre ?? '',
              email: dto.email,
              departamento: dto.departamento ?? 'Marketing',
              especialidad: dto.especialidad ?? 'Marketing Digital',
            };
            this.errorMessage = null;
          },
          error: (err) => {
            console.error('Error loading user data:', err);
            this.errorMessage = 'Error al cargar los datos del usuario';
          },
        });
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los datos de la empresa.';
        console.error('[Empresa] loadCompanyData:', err);
      },
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadUserData();
      this.successMessage = null;
    }
    this.errorMessage = null;
  }

  updateProfile(): void {
    const dto: UsuarioUpdateDTO = {
      nombre: this.userData.nombre,
      email: this.userData.email,
      departamento: this.userData.departamento,
      especialidad: this.userData.especialidad,
    };

    this.usuarioService.actualizarUsuario(dto).subscribe({
      next: () => {
        this.successMessage = 'Perfil actualizado exitosamente';
        this.isEditing = false;
        this.errorMessage = null;
        safeLocalStorageSet('userName', this.userData.nombre);
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.errorMessage = 'Error al actualizar el perfil';
      },
    });
  }

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
          this.successMessage = 'Contraseña actualizada exitosamente';
          this.togglePasswordForm();
        },
        error: (err) => {
          console.error('Error changing password:', err);
          this.errorMessage = 'Error al cambiar la contraseña';
        },
      });
  }

  deleteAccount(): void {
    if (
      !confirm(
        '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.'
      )
    )
      return;

    const email = this.authService.getEmail();
    const rol = this.authService.getRole();
    if (!email || !rol) return;

    this.usuarioService.eliminarUsuarioPorId(this.id, rol).subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error deleting account:', err);
        this.errorMessage = 'Error al eliminar la cuenta';
      },
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

  private calculateStats(): void {
    this.activeCampaigns = this.campaigns.filter(
      (c) => c.estado === 'Activa'
    ).length;
    this.totalReach = this.campaigns.reduce(
      (sum, c) => sum + (c.clicks || 0),
      0
    );
    this.totalBudget = this.campaigns.reduce(
      (sum, c) => sum + (c.gananciasTotales || 0),
      0
    );
  }

  getStatusClass(estado: string): string {
    return (
      {
        Activa: 'bg-success',
        Inactiva: 'bg-secondary',
      }[estado] || 'bg-secondary'
    );
  }

  getStatusLabel(estado: string): string {
    return (
      {
        Activa: 'Activa',
        Inactiva: 'Inactiva',
      }[estado] || estado
    );
  }

  createCampaign(): void {
    console.log('Crear nueva campaña');
  }

  editCampaign(c: Campaign): void {
    console.log('Editar campaña:', c);
  }

  deleteCampaign(c: Campaign): void {
    console.log('Eliminar campaña:', c);
  }
}
