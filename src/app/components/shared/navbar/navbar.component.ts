import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

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

  unreadNotifications = [
    { mensaje: '¡Nuevo reto disponible!', fecha: '2025-04-14 08:30' },
    { mensaje: 'Actualización de tu hábito', fecha: '2025-04-13 19:45' }
  ];

  readNotifications = [
    { mensaje: 'Reto semanal completado', fecha: '2025-04-12 09:00' },
    { mensaje: 'Recordatorio leído', fecha: '2025-04-11 17:15' }
  ];

  constructor(private readonly router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.userEmail = this.authService.getEmail();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
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
