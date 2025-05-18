import { Component, HostListener, OnInit, Inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { NotificacionesService } from '../../../services/notificaciones.service';
import { UsuarioService } from '../../../services/usuario.service';
import { switchMap } from 'rxjs/operators'; //daba error al importar el operador switchMap
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [CommonModule, RouterModule, FormsModule],
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  isAuthenticated = false;
  userEmail: string | null = null;
  //variable para el rol 
  rolSeleccionado: string = ''; //propiedad rol seleccionado
  rolesDisponibles = ['SOPORTE', 'MARKETING', 'CLIENTE', 'EMPRESA', 'ADMINISTRADOR']; 
  esSuperAdmin: boolean = false;


  unreadNotifications: any[] = [];
  readNotifications: any[] = [];
  mostrarDropdown = false;
  idUsuario: number = 0; // Actualiza esto según el token si es necesario

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    @Inject(NotificacionesService)
    private readonly notificacionesService: NotificacionesService,
    private readonly usuarioService: UsuarioService
  ) {}

  //detecta si el usuario tiene rol de "super_admin" al cargar el componente.
  //Al cambiar el valor de un <select>, redirige al usuario a otra URL.
  ngOnInit(): void {
    this.checkAuthStatus();
    if (this.isAuthenticated) {
      this.obtenerIdUsuario();

      //verificar el rol del usuario
      const rol = this.authService.getRole();
      this.esSuperAdmin = rol?.toUpperCase() === 'ADMINISTRADOR' || rol?.toUpperCase() === 'SUPER_ADMIN';
    }
    this.setRolDesdeRuta(this.router.url);

    this.router.events.subscribe(() => {
    this.setRolDesdeRuta(this.router.url);
    });
    const ruta = this.router.url;

    if (ruta.includes('soporte')) {
      this.rolSeleccionado = 'SOPORTE';
    } else if (ruta.includes('marketing')) {
      this.rolSeleccionado = 'MARKETING';
    } else if (ruta.includes('client')) {
      this.rolSeleccionado = 'CLIENTE';
    } else if (ruta.includes('empresa')) {
      this.rolSeleccionado = 'EMPRESA';
    } else if (ruta.includes('superadmin')) {
      this.rolSeleccionado = 'ADMINISTRADOR';
    }
  }

  private setRolDesdeRuta(url: string) {
  if (url.includes('/home/soporte')) {
    this.rolSeleccionado = 'SOPORTE';
  } else if (url.includes('/home/marketing')) {
    this.rolSeleccionado = 'MARKETING';
  } else if (url.includes('/home/cliente')) {
    this.rolSeleccionado = 'CLIENTE';
  } else if (url.includes('/home/empresa')) {
    this.rolSeleccionado = 'EMPRESA';
  }
}

  private checkAuthStatus(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.userEmail = this.authService.getEmail();
  }

  private obtenerIdUsuario(): void {
    const correo = sessionStorage.getItem('user');
    const rol = sessionStorage.getItem('user-role');

    // Validar que los datos existan antes de llamar al servicio
    if (correo && rol) {
      this.usuarioService.obtenerUsuario(correo, rol).subscribe({
        next: (usuario: any) => {
          this.idUsuario = usuario; // Asegúrate de que el backend retorne un objeto con `.id`
          console.log('ID del usuario:', this.idUsuario);
          this.cargarNotificaciones();
        },
        error: (err: any) => {
          console.error('Error al obtener el ID del usuario:', err);
        },
      });
    } else {
      console.warn('No se encontró correo o rol en el sessionStorage.');
    }
  }

  private cargarNotificaciones(): void {
    console.log('Cargando notificaciones para el usuario:', this.idUsuario);
    // token en el sessionStorage jwt-token
    const token = sessionStorage.getItem('jwt-token');

    this.notificacionesService
      .getNotificacionesPorUsuario(token)
      .subscribe({
        next: (notificaciones: any[]) => {
          // Suponiendo que cada notificación tiene un campo "leida"
          this.unreadNotifications = notificaciones.filter((n) => !n.leida);
          this.readNotifications = notificaciones.filter((n) => n.leida);
        },
        error: (err: any) =>
          console.error('Error al cargar notificaciones', err),
      });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  toggleDropdown() {
    this.mostrarDropdown = !this.mostrarDropdown;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  logout() {
    this.authService.logout();
    this.isAuthenticated = false;
    this.router.navigate(['/']);
  }

  onSeleccionarRol(event: Event) {
  const selectElement = event.target as HTMLSelectElement;
  this.rolSeleccionado = selectElement.value
  const ruta = this.getRutaPorRol(this.rolSeleccionado);
  this.router.navigate([`/${ruta}`]);
  }


  marcarComoLeida(notificacion: any): void {
    console.log('Marcando como leída:', notificacion);
    // 1. Quitar de la lista de no leídas
    this.unreadNotifications = this.unreadNotifications.filter(
      (n) => n !== notificacion
    );

    // 2. Marcar como leída (solo en frontend)
    notificacion.leida = true;

    // 3. Agregar a la lista de leídas
    this.readNotifications.unshift(notificacion);
  }

  home() {
    const rol = this.authService.getRole();
    const ruta = this.getRutaPorRol(rol);
    console.log('Redirigiendo a:', ruta);
    this.router.navigate([`/${ruta}`]);
  }

  /* ---------- util ---------- */
  private getRutaPorRol(rol: any): string {
    switch (rol.toUpperCase()) {
      case 'CLIENTE':
        return 'home/client';
      case 'EMPRESA':
        return 'home/empresa';
      case 'ADMINISTRADOR':
        return 'home/superadmin';
      case 'MARKETING':
        return 'home/marketing';
      case 'SOPORTE':
        return 'home/soporte';
      default:
        throw new Error(`Rol no válido: ${rol}`);
    }
  }
}
