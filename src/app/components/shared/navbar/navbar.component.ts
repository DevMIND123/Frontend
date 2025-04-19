import { Component, HostListener, OnInit, Inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { NotificacionesService } from '../../../services/notificaciones.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class NavbarComponent implements OnInit {
  isScrolled = false;
  isAuthenticated = false;
  userEmail: string | null = null;

  unreadNotifications: any[] = [];
  readNotifications: any[] = [];
  mostrarDropdown = false;
  idUsuario: number = 0; // Actualiza esto según el token si es necesario

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    @Inject(NotificacionesService) private readonly notificacionesService: NotificacionesService
  ) { }

  ngOnInit(): void {
    this.checkAuthStatus();
    if (this.isAuthenticated) {
      this.obtenerIdUsuario();
      this.cargarNotificaciones();
    }
  }

  private checkAuthStatus(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.userEmail = this.authService.getEmail();
  }

  private obtenerIdUsuario(): void {
    const token = localStorage.getItem('jwt');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.idUsuario = payload.id; // Ajusta si tu token usa otro campo
    }
  }

  private cargarNotificaciones(): void {
    this.notificacionesService.getNotificacionesPorUsuario(this.idUsuario).subscribe({
      next: (notificaciones: any[]) => {
        // Suponiendo que cada notificación tiene un campo "leida"
        this.unreadNotifications = notificaciones.filter(n => !n.leida);
        this.readNotifications = notificaciones.filter(n => n.leida);
      },
      error: (err: any) => console.error('Error al cargar notificaciones', err)
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
}