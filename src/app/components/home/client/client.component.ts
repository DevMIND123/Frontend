/* src/app/components/home/client/client.component.ts */
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import Swal from 'sweetalert2';
import { RetoComidaService } from '../../../services/reto-comida.service';
import { AlimentacionDTO } from '../../../dto/alimentacion.dto';
import { RetoAlimentacionDTO } from '../../../dto/reto-alimentacion.dto';
import { RegistroComidaDTO } from '../../../dto/registro-comida.dto';
import { CicloMenstrualService } from '../../../services/ciclo-menstrual.service';
import { EmbarazoService } from '../../../services/embarazo.service';
import { EventoTipo } from '../../../dto/evento-menstrual.dto';
import { SintomaTipo } from '../../../dto/sintoma-menstrual.dto';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import esLocale from '@fullcalendar/core/locales/es';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import { forkJoin } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { HabitoEjercicioService } from '../../../services/habito-ejercicio.service';
import { HabitoModaService } from '../../../services/habito-moda.service';
import { HabitoBellezaService } from '../../../services/habito-belleza.service';
import { HabitoDineroService } from '../../../services/habito-dinero.service';

import { safeLocalStorageGet, safeLocalStorageSet } from '../../../shared/utils/utils';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ChallengeWizardDialogComponent } from './components/challenge-wizard-dialog/challenge-wizard-dialog.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

type EstadoDia = 'cumplido' | 'noCumplido' | 'sinDato';

interface DiaCalendario {
  dia: number;
  estado: EstadoDia;
  esOtroMes?: boolean;
}

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NavbarComponent,
    FooterComponent,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule
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
  // Alimentación
  alimentaciones: any[] = [];

  // Mock Hábito: Ejercicio o Deporte
  habitoEjercicio: any = null;
  // Mock Hábito: Moda
  habitoModa: any = null;
  // Hábito: Belleza
  habitoBelleza: any = null;
  // Hábito: Dinero
  habitoDinero: any = null;

  userData = {
    nombre: '',
    email: '',
    sexo: '',
    newEmail: '',
    departamento: '',
    especialidad: '',
  };

  embarazo: {
  fechaInicio: string;
  semanaActual: number;
  fechaPartoEstimada: string;
} | null = null;

  /* ------------ preferencias ------------ */
  darkMode = false;
  notificationsEnabled = true;
  comidasRegistradas: RegistroComidaDTO[] = [];
  comidaForm!: FormGroup;
  calendario: DiaCalendario[][] = [];
mostrarInfoIMC = false;

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
    private retoComidaService: RetoComidaService,
    private cicloMenstrualService: CicloMenstrualService,
    private habitoEjercicioService: HabitoEjercicioService,
    private habitoModaService: HabitoModaService,
    private habitoBellezaService: HabitoBellezaService,
    private habitoDineroService: HabitoDineroService,
    private dialog: MatDialog,
    private http: HttpClient,
    private fb: FormBuilder,
    private embarazoService: EmbarazoService
  ) {
    this.comidaForm = this.fb.group({
      nombre: ['', Validators.required],
      calorias: [null, [Validators.required, Validators.min(1)]]
    });
  }

  /* =========================================================
   *  CICLO DE VIDA
   * ======================================================= */
  async ngOnInit(): Promise<void> {
    await this.loadUserData();
    this.loadThemePreference();

    this.loadHabitos();



  }

  registrarComida(): void {
    console.log('Formulario de comida:', this.alimentaciones);
    if (this.comidaForm.valid) {
      const comida: RegistroComidaDTO = {
        nombre: this.comidaForm.value.nombre,
        calorias: this.comidaForm.value.calorias,
        fechaHoraRegistro: new Date().toISOString()
      };

      // Asegúrate de que haya al menos una alimentación activa
      if (!this.alimentaciones || this.alimentaciones.length === 0) {
        console.warn('No hay un reto de alimentación activo');
        return;
      }

      const idAlimentacion = this.alimentaciones[0].id;

      this.retoComidaService.registrarComida(idAlimentacion, comida).subscribe({
        next: () => {
          console.log('Comida registrada exitosamente:', comida);
          this.comidaForm.reset(); // Limpiar el formulario
        },
        error: () => {
          console.error('Error al registrar la comida');
        }
      });
    } else {
      console.warn('Formulario inválido');
    }
  }


 generarCalendario(): void {
    if (!this.alimentaciones?.length) return;

    const caloriasObjetivo = this.alimentaciones[0].caloriasObjetivoDiarias;
    if (!caloriasObjetivo) return;

    const hoy  = new Date();
    const año  = hoy.getFullYear();
    const mes  = hoy.getMonth();            // 0-based
    const dia0 = new Date(año, mes, 1);
    const nDias= new Date(año, mes + 1, 0).getDate();
    const primerCol = (dia0.getDay() || 7); // Lun=1 … Dom=7

    /* ---------- 1. agrupar calorías por día ---------- */
    const caloriasPorDia: Record<string, number> = {};
    this.comidasRegistradas.forEach(c => {
      const k = this.formatLocal(new Date(c.fechaHoraRegistro));
      caloriasPorDia[k] = (caloriasPorDia[k] ?? 0) + c.calorias;
    });

    /* ---------- 2. construir matriz del calendario ---------- */
    const calendario: DiaCalendario[][] = [];
    let semana: DiaCalendario[] = [];

    // huecos del mes anterior
    for (let i = 1; i < primerCol; i++) {
      semana.push({ dia: 0, estado: 'sinDato', esOtroMes: true });
    }

    // días del mes actual
    for (let d = 1; d <= nDias; d++) {
      const fecha = new Date(año, mes, d);
      const k     = this.formatLocal(fecha);
      const tot   = caloriasPorDia[k] ?? 0;

      let estado: EstadoDia = 'sinDato';
      if (k in caloriasPorDia)
        estado = tot >= caloriasObjetivo ? 'cumplido' : 'noCumplido';

      semana.push({ dia: d, estado });

      if (semana.length === 7) {
        calendario.push(semana);
        semana = [];
      }
    }

    // relleno final
    if (semana.length) {
      while (semana.length < 7) {
        semana.push({ dia: 0, estado: 'sinDato', esOtroMes: true });
      }
      calendario.push(semana);
    }

    this.calendario = calendario;
  }

  getIMCClass(imc: number): string {
  if (imc < 18.5) return 'imc-display-underweight';
  if (imc < 25) return 'imc-display-healthy';
  if (imc < 30) return 'imc-display-overweight';
  if (imc < 35) return 'imc-display-obese';
  return 'imc-display-extremely-obese';
}


  formatLocal(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;   // YYYY-MM-DD (sin cambio a UTC)
  }

  obtenerEstadoSimulado(dia: number): EstadoDia {
    // Simula progreso: alternar entre cumplido / no cumplido / sinDato
    if (dia % 3 === 0) return 'noCumplido';
    if (dia % 2 === 0) return 'cumplido';
    return 'sinDato';
  }

  /* =========================================================
   *  CARGA DE DATOS
   * ======================================================= */
  async loadUserData(): Promise<void> {
    const email = this.authService.getEmail();
    const rol = this.authService.getRole();

    if (!email || !rol) {
      this.errorMessage =
        'No se encontró la sesión. Inicia sesión nuevamente, por favor.';
      this.router.navigate(['/login']);
      return;
    }

    this.cargarEmbarazo(email); //Carga la información de embarazo

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
              sexo: localStorage.getItem('sexoUsuario') ?? '',
              newEmail: dto.email ?? '',
              departamento: dto.departamento ?? '',
              especialidad: dto.especialidad ?? '',
            };

            localStorage.setItem('userName', this.userData.nombre);
            safeLocalStorageSet('userName', this.userData.nombre);
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
        console.log('Alimentación obtenida:', res);
        if (!res || res.length === 0) {
          this.alimentaciones = [];
          return;
        }

        // Buscar la alimentación con el id más alto
        const alimentacion = res.reduce((max: any, current: any) =>
          current.id > max.id ? current : max
        );

        this.alimentaciones = [
          {
            ...alimentacion,
            diasTranscurridos: this.calcularDiasTranscurridos(alimentacion.fechaInicio),
            diasRestantes: this.calcularDiasRestantes(alimentacion.fechaFin),
            progreso: this.calcularProgreso(
              alimentacion.caloriasConsumidasHoy,
              alimentacion.caloriasObjetivoDiarias
            )
          }
        ];

        console.log('Última alimentación procesada (por ID):', this.alimentaciones);
        this.verComidas();

      },
      error: (err) => {
        console.error('Error al cargar la alimentación:', err);
      }
    });


  }

  verComidas(): void {
    const alimentacion = this.alimentaciones?.[0];

    if (!alimentacion || !alimentacion.id) {
      return; // No hay alimentación activa
    }

    this.retoComidaService.obtenerComidasPorAlimentacion(alimentacion.id).subscribe({
      next: (comidas) => {
        this.comidasRegistradas = comidas ?? [];
        console.log('Comidas registradas:', this.comidasRegistradas);
                this.generarCalendario();
      },
      error: () => {
        this.comidasRegistradas = []; // Limpiar en caso de error
      }
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
    const diff = Math.floor(
      (hoy.getTime() - inicio.getTime()) / (1000 * 3600 * 24)
    );
    return diff > 0 ? diff : 0;
  }

  calcularDiasRestantes(fechaFin: string): number {
    if (!fechaFin) return 0;
    const fin = new Date(fechaFin);
    const hoy = new Date();
    const diff = Math.ceil(
      (fin.getTime() - hoy.getTime()) / (1000 * 3600 * 24)
    );
    return diff > 0 ? diff : 0;
  }

  calcularProgreso(
    caloriasConsumidas: any,
    caloriasObjetivo?: number
  ): number {
    if (!caloriasObjetivo || caloriasObjetivo <= 0) return 0;

    const progreso = (caloriasConsumidas / caloriasObjetivo) * 100;
    return progreso < 0 ? 0 : progreso > 100 ? 100 : Math.round(progreso);
  }

  private loadHabitos(): void {
    this.habitoEjercicioService.obtenerHabitoEjercicio().subscribe({
      next: (data) => {
        this.habitoEjercicio = data;
        console.log('[Hábito Ejercicio] Datos cargados:', data);
      },
      error: (err) => console.error('[Hábito Ejercicio] Error:', err),
    });

    this.habitoModaService.obtenerHabitoModa().subscribe({
      next: (data) => {
        this.habitoModa = data;
        console.log('[Hábito Moda] Datos cargados:', data);
      },
      error: (err) => console.error('[Hábito Moda] Error:', err),
    });

    this.habitoBellezaService.obtenerHabitoBelleza().subscribe({
      next: (data) => {
        this.habitoBelleza = data;
        console.log('[Hábito Belleza] Datos cargados:', data);
      },
      error: (err) => console.error('[Hábito Belleza] Error:', err),
    });

    this.habitoDineroService.obtenerHabitoDinero().subscribe({
      next: (data) => {
        this.habitoDinero = data;
        console.log('[Hábito Dinero] Datos cargados:', data);
      },
      error: (err) => console.error('[Hábito Dinero] Error:', err),
    });
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
    console.log('Actualizando perfil:', this.userData);
    this.usuarioService.actualizarUsuario(this.userData).subscribe({
      next: () => {
        this.successMessage = 'Perfil actualizado exitosamente';
        this.isEditing = false;
        safeLocalStorageSet('userName', this.userData.nombre);
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
    safeLocalStorageSet('darkMode', String(this.darkMode));
    this.applyTheme();
  }

  private loadThemePreference(): void {
    this.darkMode = safeLocalStorageGet('darkMode') === 'true';
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
        <input id="peso" type="number" class="swal2-input" placeholder="Peso (kg)">
        <input id="altura" type="number" class="swal2-input" placeholder="Altura (cm)">
        <input id="fechaFin" type="date" class="swal2-input">
        <input id="descripcion" class="swal2-input" placeholder="Descripción del reto">
      `,
      confirmButtonText: 'Crear reto',
      focusConfirm: false,
      preConfirm: () => {
        const peso = +(document.getElementById('peso') as HTMLInputElement).value;
        const altura = +(document.getElementById('altura') as HTMLInputElement).value;
        const fechaInicio = new Date().toISOString().split('T')[0];
        const fechaFin = (document.getElementById('fechaFin') as HTMLInputElement).value;
        const descripcion = (document.getElementById('descripcion') as HTMLInputElement).value;

        if (!peso || !altura || !fechaFin || !descripcion) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return null;
        }

        return { peso, altura, fechaInicio, fechaFin, descripcion };
      },
    }).then((result) => {
      if (!result.isConfirmed || !result.value) return;

      const { peso, altura, fechaInicio, fechaFin, descripcion } = result.value;

      const alimentacion: AlimentacionDTO = {
        emailUsuario,
        peso,
        altura,
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
            fechaFin,
          };

          this.retoComidaService.asignarReto(alimentacionId, reto).subscribe({
            next: () => {
              if (res.imc !== undefined && res.objetivo && res.caloriasObjetivoDiarias !== undefined) {
                Swal.fire({
                  icon: 'success',
                  title: '¡Reto de alimentación creado!',
                  html: `
                    <p><strong>IMC calculado:</strong> ${res.imc.toFixed(2)}</p>
                    <p><strong>Objetivo sugerido:</strong> ${res.objetivo}</p>
                    <p><strong>Calorías diarias recomendadas :D:</strong> ${res.caloriasObjetivoDiarias}</p>
                  `,
                  confirmButtonText: 'Aceptar',
                });
              } else {
                Swal.fire({
                  icon: 'warning',
                  title: 'Reto creado',
                  text: 'Se creó el reto, pero no se pudo obtener información detallada.',
                  confirmButtonText: 'Aceptar',
                });
              }
            },

          });
        },
        error: () => {
          Swal.fire('Error', 'No se pudo crear el hábito de alimentación.', 'error');
        },
      });
    });

    this.loadUserData();
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
        const nombre = (document.getElementById('nombre') as HTMLInputElement)
          .value;
        const calorias = +(
          document.getElementById('calorias') as HTMLInputElement
        ).value;
        const fechaHoraRegistro = new Date().toISOString(); // fecha automática

        if (!nombre || !calorias) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return null;
        }

        return { nombre, calorias, fechaHoraRegistro };
      },
    }).then((result) => {
      if (!result.isConfirmed || !result.value) return;

      const comida: RegistroComidaDTO = result.value;

      this.retoComidaService
        .registrarComida(alimentacion.id, comida)
        .subscribe({
          next: () => {
            Swal.fire(
              '¡Registrado!',
              'La comida fue registrada correctamente.',
              'success'
            );
          },
          error: () => {
            Swal.fire('Error', 'No se pudo registrar la comida.', 'error');
          },
        });
    });
  }



  abrirSwalCicloMenstrual(): void {
    const email = sessionStorage.getItem('user');
    if (!email) {
      Swal.fire('Error', 'No se encontró información del usuario.', 'error');
      return;
    }

    Swal.fire({
      title: 'Ciclo Menstrual',
      html: `
        <div class="text-start">
          <p class="mb-2">¿Qué deseas hacer?</p>
          <button id="btn-ciclo"     class="swal2-confirm swal2-styled" style="background:#d63384;margin:4px 0;">Registrar Ciclo</button>
          <button id="btn-evento"    class="swal2-confirm swal2-styled" style="background:#6f42c1;margin:4px 0;">Registrar Evento</button>
          <button id="btn-sintoma"   class="swal2-confirm swal2-styled" style="background:#20c997;margin:4px 0;">Registrar Síntoma</button>
          <button id="btn-calendario"class="swal2-confirm swal2-styled" style="background:#0d6efd;margin:4px 0;">Ver Calendario</button>
        </div>
      `,
      showConfirmButton: false,
      didOpen: () => {
        const btnCiclo = document.getElementById('btn-ciclo');
        const btnEvento = document.getElementById('btn-evento');
        const btnSintoma = document.getElementById('btn-sintoma');
        const btnCalendario = document.getElementById('btn-calendario');

        /* ---------- Registrar ciclo ---------- */
        btnCiclo?.addEventListener('click', () => {
          Swal.fire({
            title: 'Registrar Ciclo',
            html: `
              <input id="duracion"      class="swal2-input" type="number" placeholder="Duración del ciclo (días)">
              <input id="menstruacion"  class="swal2-input" type="number" placeholder="Duración menstruación (días)">
            `,
            preConfirm: () => {
              const duracion = +(
                document.getElementById('duracion') as HTMLInputElement
              ).value;
              const menstruacion = +(
                document.getElementById('menstruacion') as HTMLInputElement
              ).value;

              const hoy = new Date().toISOString().split('T')[0];

              if (!duracion || !menstruacion) {
                Swal.showValidationMessage('Todos los campos son requeridos.');
                return;
              }

              return this.cicloMenstrualService
                .registrarCiclo(
                  {
                    emailUsuario: email,
                    fechaInicio: hoy,
                    duracionCiclo: duracion,
                    duracionMenstruacion: menstruacion,
                  },
                  `Bearer ${sessionStorage.getItem('token')}`
                )
                .toPromise();
            },
          }).then((res) => {
            if (res.isConfirmed)
              Swal.fire(
                'Guardado',
                'Ciclo registrado correctamente',
                'success'
              );
          });
        });

        /* ---------- Registrar evento ---------- */
        btnEvento?.addEventListener('click', () => {
          Swal.fire({
            title: 'Registrar Evento',
            html: `
              <select id="evento" class="swal2-input">
                <option value="">Seleccionar evento</option>
                <option value="INICIO_REGLA">Inicio regla</option>
                <option value="FIN_REGLA">Fin regla</option>
                <option value="OVULACION">Ovulación</option>
                <option value="SANGRADO_INTERMENSTRUAL">Sangrado intermenstrual</option>
                <option value="DOLOR_INTENSO">Dolor intenso</option>
                <option value="CAMBIO_ANIMO_BRUSCO">Cambio de ánimo brusco</option>
                <option value="FLUJO_ANORMAL">Flujo anormal</option>
                <option value="FIEBRE">Fiebre</option>
                <option value="OTRO">Otro</option>
              </select>
              <input id="obs" class="swal2-input" placeholder="Observaciones (opcional)">
            `,
            preConfirm: () => {
              const tipo = (
                document.getElementById('evento') as HTMLSelectElement
              ).value;
              const observaciones = (
                document.getElementById('obs') as HTMLInputElement
              ).value;

              const fecha = new Date().toISOString().split('T')[0];

              if (!tipo) {
                Swal.showValidationMessage('Debe seleccionar un evento');
                return;
              }

              return this.cicloMenstrualService
                .registrarEvento({
                  emailUsuario: email,
                  tipo: tipo as EventoTipo,
                  observaciones,
                  fecha,
                })
                .toPromise();
            },
          }).then((res) => {
            if (res.isConfirmed)
              Swal.fire('Guardado', 'Evento registrado', 'success');
          });
        });

        /* ---------- Registrar síntoma ---------- */
        btnSintoma?.addEventListener('click', () => {
          Swal.fire({
            title: 'Registrar Síntoma',
            html: `
              <select id="sintoma" class="swal2-input">
                <option value="">Seleccionar síntoma</option>
                <option value="COLICOS">Cólicos</option> <option value="MIGRAÑA">Migraña</option>
                <option value="DOLOR_PELVICO">Dolor pélvico</option> <option value="ACNE">Acné</option>
                <option value="CAMBIO_ANIMO">Cambio de ánimo</option> <option value="FATIGA">Fatiga</option>
                <option value="ANSIEDAD">Ansiedad</option> <option value="DEPRESION">Depresión</option>
                <option value="NAUSEAS">Náuseas</option> <option value="PECHOS_SENSIBLES">Pechos sensibles</option>
                <option value="INSOMNIO">Insomnio</option> <option value="HAMBRE_EXCESIVA">Hambre excesiva</option>
                <option value="RETENCION_LIQUIDOS">Retención de líquidos</option> <option value="OTRO">Otro</option>
              </select>
              <input id="intensidad" class="swal2-input" placeholder="Intensidad (baja, media, alta)">
            `,
            preConfirm: () => {
              const tipo = (
                document.getElementById('sintoma') as HTMLSelectElement
              ).value;
              const intensidad = (
                document.getElementById('intensidad') as HTMLInputElement
              ).value;

              const fecha = new Date().toISOString().split('T')[0];

              if (!tipo || !intensidad) {
                Swal.showValidationMessage('Todos los campos son obligatorios');
                return;
              }

              return this.cicloMenstrualService
                .registrarSintoma({
                  emailUsuario: email,
                  tipo: tipo as SintomaTipo,
                  intensidad,
                  fecha,
                })
                .toPromise();
            },
          }).then((res) => {
            if (res.isConfirmed)
              Swal.fire('Guardado', 'Síntoma registrado', 'success');
          });
        });

        /* ---------- Ver calendario ---------- */
        btnCalendario?.addEventListener('click', () => {
          forkJoin([
            this.cicloMenstrualService.obtenerEventosPorUsuario(email),
            this.cicloMenstrualService.obtenerSintomasPorUsuario(email),
            this.cicloMenstrualService.obtenerCiclosPorUsuario(email),
          ]).subscribe({
            next: ([eventos, sintomas, ciclos]) => {
              console.log('Ciclos:', ciclos);
              /* 1️⃣ Eventos de backend → FullCalendar */
              const fullEvents = [
                /* eventos puntuales */
                ...eventos.map((ev) => ({
                  title: this.prettyEvento(ev.tipo),
                  start: ev.fecha,
                  color: this.colorEvento(ev.tipo),
                  extendedProps: { obs: ev.observaciones ?? '' },
                })),

                /* síntomas */
                ...sintomas.map((si) => ({
                  title: this.prettySintoma(si.tipo, si.intensidad),
                  start: si.fecha,
                  color: '#20c997',
                  extendedProps: { intensidad: si.intensidad },
                })),

                /* ciclos: marca Día 1, ovulación y próxima regla */
                ...ciclos.flatMap((c) => [
                  {
                    title: '🩸 Día 1 (Inicio ciclo)',
                    start: c.fechaInicio,
                    color: '#e74c3c',
                  },
                  {
                    title: '🌸 Ovulación',
                    start: c.fechaOvulacion,
                    color: '#3498db',
                  },
                  {
                    title: '🔔 Próxima menstruación',
                    start: c.fechaProximaMenstruacion,
                    color: '#f39c12',
                  },
                ]),
              ];

              /* 2️⃣ Mostrar calendario */
              Swal.fire({
                title: 'Calendario Menstrual',
                html: `<div id="calMenstrual" style="max-width:100%;margin:0 auto;"></div>`,
                width: 800,
                showCloseButton: true,
                showConfirmButton: false,
                didOpen: () => {
                  const calEl = document.getElementById('calMenstrual')!;
                  const calendar = new Calendar(calEl, {
                    plugins: [dayGridPlugin],
                    locale: 'es',
                    initialView: 'dayGridMonth',
                    height: 500,
                    headerToolbar: {
                      left: 'prev,next today',
                      center: 'title',
                      right: '',
                    },
                    events: fullEvents,
                    eventClick(info) {
                      const extra =
                        info.event.extendedProps['obs'] ??
                        info.event.extendedProps['intensidad'] ??
                        '';
                      Swal.fire(
                        info.event.title,
                        extra ? `<small>${extra}</small>` : '',
                        'info'
                      );
                    },
                  });
                  calendar.render();
                },
              });
            },
            error: () =>
              Swal.fire('Error', 'No se pudo cargar el calendario', 'error'),
          });
        });
      },
    });
  }

  /* Helpers colorear y titular */
  private prettyEvento(tipo: EventoTipo): string {
    switch (tipo) {
      case 'INICIO_REGLA':
        return '🩸 Inicio Regla';
      case 'FIN_REGLA':
        return '✅ Fin Regla';
      case 'OVULACION':
        return '🌸 Ovulación';
      default:
        return '⚠️ ' + tipo.replace(/_/g, ' ');
    }
  }
  private colorEvento(tipo: EventoTipo): string {
    if (tipo === 'INICIO_REGLA' || tipo === 'FIN_REGLA') return '#e74c3c';
    if (tipo === 'OVULACION') return '#3498db';
    return '#f39c12';
  }
  private prettySintoma(tipo: SintomaTipo, int?: string) {
    const base = tipo.replace(/_/g, ' ').toLowerCase();
    return `🤒 ${base}${int ? ' (' + int + ')' : ''}`;
  }



  openWizard(): void {
    const dialogRef = this.dialog.open(ChallengeWizardDialogComponent, {
      minWidth: '60vw'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result || !result.alimentacion?.id) return;

      const reto: RetoAlimentacionDTO = {
        descripcion: result.reto.description || result.reto.type,
        completado: false,
        fechaInicio: result.alimentacion.fechaInicio,
        fechaFin: result.alimentacion.fechaFin
      };

      this.retoComidaService.asignarReto(result.alimentacion.id, reto).subscribe({
        next: () => {
          Swal.fire('Reto asignado', 'Tu reto fue asignado correctamente.', 'success');
          this.loadUserData?.();
        },
        error: () => {
          Swal.fire('Error', 'No se pudo asignar el reto.', 'error');
        }
      });
    });
  }

  abrirSwalRegistrarEmbarazo(): void {
  const email = sessionStorage.getItem('user');
  if (!email) {
    Swal.fire('Error', 'No se encontró el usuario autenticado.', 'error');
    return;
  }

  let fechaSeleccionada = '';

  Swal.fire({
    title: 'Selecciona la fecha de inicio',
    html: `
      <div id="calendar-container" style="max-width:100%;margin:0 auto;"></div>
      <label for="sintomasExtra" class="mt-3">Síntomas iniciales (opcional):</label>
      <textarea id="sintomasExtra" class="swal2-textarea" placeholder="Náuseas, fatiga, antojos..."></textarea>
    `,
    showCancelButton: true,
    confirmButtonText: 'Registrar',
    didOpen: () => {
      const calendarEl = document.getElementById('calendar-container')!;
      const calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin, interactionPlugin],
        locale: esLocale,
        initialView: 'dayGridMonth',
        height: 400,
        dateClick: (info: DateClickArg) => {
          fechaSeleccionada = info.dateStr;
          Swal.getConfirmButton()?.classList.remove('swal2-confirm-disabled');
          Swal.getConfirmButton()!.innerText = `Registrar (${fechaSeleccionada})`;
        },
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: ''
        },
      });
      calendar.render();
      Swal.getConfirmButton()?.classList.add('swal2-confirm-disabled');
    },
    preConfirm: () => {
      const sintomas = (document.getElementById('sintomasExtra') as HTMLTextAreaElement).value;
      if (!fechaSeleccionada) {
        Swal.showValidationMessage('Debes seleccionar una fecha.');
        return;
      }

      return {
        emailUsuario: email,
        fechaInicio: fechaSeleccionada,
        sintomas: sintomas || '',
      };
    },
  }).then((res) => {
    if (!res.isConfirmed || !res.value) return;

    this.embarazoService.registrarEmbarazo(res.value).subscribe({
      next: () => {
        Swal.fire('¡Registrado!', 'Embarazo registrado correctamente.', 'success');
        this.cargarEmbarazo(email); // 🟢 Esto actualiza la vista del embarazo con semana y fecha
      },
      error: () => {
        Swal.fire('Error', 'No se pudo registrar el embarazo.', 'error');
      },
    });
  });
}

cargarEmbarazo(email: string): void {
  this.embarazoService.obtenerUltimoEmbarazo(email).subscribe({
    next: (data) => {
      this.embarazo = {
        fechaInicio: data.fechaInicio,
        semanaActual: data.semanaActual,
        fechaPartoEstimada: data.fechaPartoEstimada
      };
    },
    error: () => {
      this.embarazo = null;
    }
  });
}

}
