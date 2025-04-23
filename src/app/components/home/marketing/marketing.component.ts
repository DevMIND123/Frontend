/*  src/app/components/home/marketing/marketing.component.ts  */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { UsuarioUpdateDTO } from '../../../models/usuario';

/* ---------------- Modelos mock ---------------- */
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
  standalone: true, // ← componente stand‑alone
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
  /* ---------- flags / feedback ---------- */
  isEditing = false;
  showPasswordForm = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  id = 0; // para el CRUD mock de campañas
  /* ---------- datos de usuario ---------- */
  userData = {
    nombre: '',
    email: '',
    departamento: 'Marketing',
    especialidad: 'Marketing Digital',
  };

  /* ---------- password (coincide con HTML) ---------- */
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  /* ---------- preferencias ---------- */
  preferences = {
    darkMode: false,
    notifications: true,
  };

  /* ---------- campañas mock ---------- */
  campaigns: Campaign[] = [
    {
      id: '1',
      name: 'Campaña de Verano',
      status: 'active',
      startDate: new Date('2024‑03‑01'),
      endDate: new Date('2024‑05‑31'),
      budget: 5_000_000,
      reach: 50_000,
    },
    {
      id: '2',
      name: 'Promoción Fitness',
      status: 'draft',
      startDate: new Date('2024‑04‑01'),
      endDate: new Date('2024‑06‑30'),
      budget: 3_000_000,
      reach: 30_000,
    },
  ];

  /* ---------- métricas ---------- */
  activeCampaigns = 0;
  totalReach = 0;
  totalBudget = 0;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  /* =====================================================
   *  CICLO DE VIDA
   * =================================================== */
  ngOnInit(): void {
    this.calculateStats();
    this.loadUserData();
    this.loadThemePreference();
  }

  /* =====================================================
   *  CARGA DE DATOS
   * =================================================== */
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
              especialidad: dto.especialidad ?? 'Marketing Digital',
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

  /* =====================================================
   *  EDICIÓN PERFIL
   * =================================================== */
  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadUserData(); // descartar cambios al cancelar
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
        localStorage.setItem('userName', this.userData.nombre);
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.errorMessage = 'Error al actualizar el perfil';
      },
    });
  }

  /* =====================================================
   *  PASSWORD
   * =================================================== */
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

  /* =====================================================
   *  ELIMINAR CUENTA
   * =================================================== */
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

  /* =====================================================
   *  PREFERENCIAS / TEMA
   * =================================================== */
  toggleTheme(): void {
    this.preferences.darkMode = !this.preferences.darkMode;
    localStorage.setItem('darkMode', String(this.preferences.darkMode));
    this.applyTheme();
  }

  private loadThemePreference(): void {
    this.preferences.darkMode = localStorage.getItem('darkMode') === 'true';
    this.applyTheme();
  }

  private applyTheme(): void {
    document.body.classList.toggle('dark-mode', this.preferences.darkMode);
  }

  /* =====================================================
   *  CAMPAÑAS (mock)
   * =================================================== */
  private calculateStats(): void {
    this.activeCampaigns = this.campaigns.filter(
      (c) => c.status === 'active'
    ).length;
    this.totalReach = this.campaigns.reduce((sum, c) => sum + c.reach, 0);
    this.totalBudget = this.campaigns.reduce((sum, c) => sum + c.budget, 0);
  }

  getStatusClass(status: Campaign['status']): string {
    return (
      {
        active: 'bg-success',
        draft: 'bg-warning',
        completed: 'bg-secondary',
      }[status] || 'bg-secondary'
    );
  }

  getStatusLabel(status: Campaign['status']): string {
    return (
      {
        active: 'Activa',
        draft: 'Borrador',
        completed: 'Completada',
      }[status] || status
    );
  }

  /* ----- CRUD mock campañas ----- */
  createCampaign(): void {
    console.log('Create new campaign');
  }
  editCampaign(c: Campaign): void {
    console.log('Edit campaign:', c);
  }
  deleteCampaign(c: Campaign): void {
    console.log('Delete campaign:', c);
  }
}
