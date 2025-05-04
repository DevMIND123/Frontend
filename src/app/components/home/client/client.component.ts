/* src/app/components/home/client/client.component.ts */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import Swal from 'sweetalert2';
import { RetoComidaService } from '../../../services/reto-comida.service';
import { AlimentacionDTO } from '../../../dto/alimentacion.dto';
import { RetoAlimentacionDTO } from '../../../dto/reto-alimentacion.dto';
import { RegistroComidaDTO } from '../../../dto/registro-comida.dto';


@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NavbarComponent,
    FooterComponent,
  ],
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css'],
})
export class ClientComponent implements OnInit {
  /* ------------ estado de formulario ------------ */
  isEditing = false;
  showPasswordModal = false;
  id: number = 0;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  alimentaciones: any[] = [];

  userData = {
    nombre: '',
    email: '',
    departamento: '',
    especialidad: '',
  };


  /* ------------ preferencias ------------ */
  darkMode = false;
  notificationsEnabled = true;

  /* ------------ password modal ------------ */
  /** formulario de cambio de contraseña */
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private retoComidaService: RetoComidaService
  ) { }

  /* =========================================================
   *  CICLO DE VIDA
   * ======================================================= */
  ngOnInit(): void {
    this.loadUserData();
    this.loadThemePreference();
  }

  /* =========================================================
   *  CARGA DE DATOS
   * ======================================================= */
  private loadUserData(): void {
    const email = this.authService.getEmail();
    const rol = this.authService.getRole();

    if (!email || !rol) {
      this.errorMessage =
        'No se encontró la sesión. Inicia sesión nuevamente, por favor.';
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioService.obtenerUsuario(email, rol).subscribe({
      next: (dto) => {
        this.id = dto;
        /* Nuevo endpoint que devuelve el DTO completo                *
         * (internamente el Service llama a /datos/{email})           */
        this.usuarioService.obtenerUsuarioById(this.id, rol).subscribe({
          next: (dto) => {
            console.log('User data:', dto);

            this.userData = {
              nombre: dto.nombre ?? '',
              email: dto.email ?? '',
              departamento: dto.departamento ?? '',
              especialidad: dto.especialidad ?? '',
            };
            localStorage.setItem('userName', this.userData.nombre);
            this.errorMessage = '';
          },
          error: (err) => {
            console.error('Error al cargar datos:', err);
            this.errorMessage = 'Error al cargar los datos del usuario.';
          },
        });
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los datos de la empresa.';
        console.error('[Empresa] loadCompanyData:', err);
      },
    });

    this.retoComidaService.obtenerAlimentacionPorEmail(email).subscribe({
      next: (res) => {
        console.log('Alimentación encontrada:', res);
        this.alimentaciones = res.map((alimentacion: any) => ({
          ...alimentacion,
          diasTranscurridos: this.calcularDiasTranscurridos(alimentacion.fechaInicio),
          diasRestantes: this.calcularDiasRestantes(alimentacion.fechaFin),
          progreso: this.calcularProgreso(
            alimentacion.caloriasConsumidasHoy,
            alimentacion.caloriasObjetivoDiarias
          ),
        }));
        console.log('Alimentaciones:', this.alimentaciones);
      },
      error: (err) => {
        console.error('Error al cargar la alimentación:', err);
      },
    });



  }


  getBadgeColor(progreso: number): string {
    if (progreso >= 75) return 'bg-success';
    if (progreso >= 40) return 'bg-warning';
    return 'bg-danger';
  }

  getTextColor(progreso: number): string {
    if (progreso >= 75) return 'text-success';
    if (progreso >= 40) return 'text-warning';
    return 'text-danger';
  }

  getBarColor(progreso: number): string {
    if (progreso >= 75) return 'bg-success';
    if (progreso >= 40) return 'bg-warning';
    return 'bg-danger';
  }



  calcularDiasTranscurridos(fechaInicio: string): number {
    if (!fechaInicio) return 0;
    const inicio = new Date(fechaInicio);
    const hoy = new Date();
    const diff = Math.floor((hoy.getTime() - inicio.getTime()) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 0;
  }

  calcularDiasRestantes(fechaFin: string): number {
    if (!fechaFin) return 0;
    const fin = new Date(fechaFin);
    const hoy = new Date();
    const diff = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 3600 * 24));
    return diff > 0 ? diff : 0;
  }

  calcularProgreso(caloriasConsumidas: number, caloriasObjetivo: number): number {
    if (!caloriasObjetivo || caloriasObjetivo <= 0) return 0;

    const progreso = (caloriasConsumidas / caloriasObjetivo) * 100;
    return progreso < 0 ? 0 : progreso > 100 ? 100 : Math.round(progreso);
  }









  /* =========================================================
   *  EDICIÓN DE PERFIL
   * ======================================================= */
  toggleEdit(): void {
    this.isEditing = !this.isEditing;

    if (!this.isEditing) {
      // si cancela, recargamos los datos para descartar cambios
      this.loadUserData();
    }

    this.successMessage = '';
    this.errorMessage = '';
  }

  updateProfile(): void {
    this.usuarioService.actualizarUsuario(this.userData).subscribe({
      next: () => {
        this.successMessage = 'Perfil actualizado exitosamente';
        this.isEditing = false;
        localStorage.setItem('userName', this.userData.nombre);
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.errorMessage = 'Error al actualizar el perfil.';
      },
    });
  }

  /* =========================================================
   *  PASSWORD
   * ======================================================= */

  /* =========================================================
   *  ELIMINAR CUENTA
   * ======================================================= */
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
    this.usuarioService.obtenerUsuario(email, rol).subscribe({
      next: (dto) => {
        this.id = dto;

        this.usuarioService.eliminarUsuarioPorId(this.id, rol).subscribe({
          next: () => {
            this.authService.logout();
            this.router.navigate(['/login']);
          },
          error: (err) => {
            console.error('Delete account error:', err);
            this.errorMessage = 'Error al eliminar la cuenta.';
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
   *  TEMA & PREFERENCIAS
   * ======================================================= */
  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', String(this.darkMode));
    this.applyTheme();
  }

  private loadThemePreference(): void {
    this.darkMode = localStorage.getItem('darkMode') === 'true';
    this.applyTheme();
  }

  private applyTheme(): void {
    document.body.classList.toggle('dark-mode', this.darkMode);
  }

  /* =========================================================
   *  PLACEHOLDERS DE NEGOCIO (hábitos / retos)
   * ======================================================= */
  createHabit(): void {
    console.log('Crear nuevo hábito');
  }

  createChallenge(): void {
    const emailUsuario = sessionStorage.getItem('user');
    if (!emailUsuario) {
      Swal.fire('Error', 'No se encontró información de sesión.', 'error');
      return;
    }

    Swal.fire({
      title: 'Nuevo reto de alimentación',
      html: `
        <select id="objetivo" class="swal2-input">
          <option value="">Seleccione un objetivo</option>
          <option value="Perder peso">Perder peso</option>
          <option value="Ganar masa">Ganar masa</option>
          <option value="Mantener peso">Mantener peso</option>
        </select>
        <input id="calorias" type="number" class="swal2-input" placeholder="Calorías diarias">
        <input id="fechaFin" type="date" class="swal2-input">
        <input id="descripcion" class="swal2-input" placeholder="Descripción del reto">
      `,
      confirmButtonText: 'Crear reto',
      focusConfirm: false,
      preConfirm: () => {
        const objetivo = (document.getElementById('objetivo') as HTMLSelectElement).value;
        const calorias = +(document.getElementById('calorias') as HTMLInputElement).value;
        const fechaInicio = new Date().toISOString().split('T')[0];
        const fechaFin = (document.getElementById('fechaFin') as HTMLInputElement).value;
        const descripcion = (document.getElementById('descripcion') as HTMLInputElement).value;

        if (!objetivo || !calorias || !fechaFin || !descripcion) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return null;
        }

        return { objetivo, calorias, fechaInicio, fechaFin, descripcion };
      }
    }).then(result => {
      if (!result.isConfirmed || !result.value) return;

      const { objetivo, calorias, fechaInicio, fechaFin, descripcion } = result.value;

      const alimentacion: AlimentacionDTO = {
        emailUsuario,
        objetivo,
        caloriasObjetivoDiarias: calorias,
        caloriasConsumidasHoy: 0,
        fechaInicio,
        fechaFin
      };

      this.retoComidaService.crearAlimentacion(alimentacion).subscribe({
        next: (res) => {
          const alimentacionId = res.id!;
          const reto: RetoAlimentacionDTO = {
            descripcion,
            completado: false,
            fechaInicio,
            fechaFin
          };

          this.retoComidaService.asignarReto(alimentacionId, reto).subscribe({
            next: () => {
              Swal.fire('¡Listo!', 'Se creó el reto de alimentación exitosamente.', 'success');
            },
            error: () => {
              Swal.fire('Error', 'No se pudo asignar el reto.', 'error');
            }
          });
        },
        error: () => {
          Swal.fire('Error', 'No se pudo crear el hábito de alimentación.', 'error');
        }
      });
    });
    this.loadUserData(); // Recargar datos después de crear el reto
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

    this.authService.changePasswordCli(payload).subscribe({
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
  showPasswordForm = false;

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



  abrirSwalRegistroComida(alimentacion: any): void {
    console.log('Alimentación seleccionada:', alimentacion);
    Swal.fire({
      title: 'Registrar comida',
      html: `
        <input id="nombre" class="swal2-input" placeholder="Nombre de la comida">
        <input id="calorias" type="number" class="swal2-input" placeholder="Calorías">
      `,
      confirmButtonText: 'Registrar',
      focusConfirm: false,
      preConfirm: () => {
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
        const calorias = +(document.getElementById('calorias') as HTMLInputElement).value;
        const fechaHoraRegistro = new Date().toISOString(); // fecha automática

        if (!nombre || !calorias) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return null;
        }

        return { nombre, calorias, fechaHoraRegistro };
      }
    }).then(result => {
      if (!result.isConfirmed || !result.value) return;

      const comida: RegistroComidaDTO = result.value;

      this.retoComidaService.registrarComida(alimentacion.id, comida).subscribe({
        next: () => {
          Swal.fire('¡Registrado!', 'La comida fue registrada correctamente.', 'success');
        },
        error: () => {
          Swal.fire('Error', 'No se pudo registrar la comida.', 'error');
        }
      });
    });
  }


}
