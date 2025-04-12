import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, UserInfo } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg fixed-top" [class.navbar-scrolled]="isScrolled">
      <div class="container">
        <a class="navbar-brand" routerLink="/">
          <img src="assets/images/Logos/Horizontal.png" alt="RetoChimba Logo" class="navbar-logo">
        </a>
        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/home" routerLinkActive="active">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/about" routerLinkActive="active">About</a>
            </li>
          </ul>

          <!-- Guest Menu -->
          <div class="d-flex gap-2" *ngIf="!currentUser">
            <a routerLink="/login" class="btn btn-outline-primary">
              <i class="bi bi-box-arrow-in-right me-2"></i>Iniciar Sesión
            </a>
            <a routerLink="/register" class="btn btn-primary">
              <i class="bi bi-person-plus me-2"></i>Registrarse
            </a>
          </div>

          <!-- User Menu -->
          <div class="nav-item dropdown" *ngIf="currentUser">
            <a class="nav-link dropdown-toggle d-flex align-items-center gap-2" 
               role="button" 
               data-bs-toggle="dropdown" 
               aria-expanded="false">
              <img [src]="userProfileImage" 
                   alt="Profile" 
                   class="rounded-circle profile-image"
                   width="32" 
                   height="32">
              <span class="d-none d-md-inline">{{ currentUser.name }} ({{ currentUser.role }})</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end animate slideIn">
              <li>
                <a class="dropdown-item d-flex align-items-center" [routerLink]="['/home', currentUser.role.toLowerCase()]">
                  <i class="bi bi-house me-2"></i>Dashboard
                </a>
              </li>
              <li>
                <a class="dropdown-item d-flex align-items-center" [routerLink]="['/home', currentUser.role.toLowerCase()]">
                  <i class="bi bi-person me-2"></i>Mi Perfil
                </a>
              </li>
              <li>
                <a class="dropdown-item d-flex align-items-center" routerLink="/habits">
                  <i class="bi bi-check2-square me-2"></i>Mis Hábitos
                </a>
              </li>
              <li>
                <a class="dropdown-item d-flex align-items-center" routerLink="/challenges">
                  <i class="bi bi-trophy me-2"></i>Mis Retos
                </a>
              </li>
              <li>
                <a class="dropdown-item d-flex align-items-center" routerLink="/settings">
                  <i class="bi bi-gear me-2"></i>Configuración
                </a>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <button class="dropdown-item d-flex align-items-center text-danger" (click)="logout()">
                  <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  `,
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isScrolled = false;
  currentUser: UserInfo | null = null;
  userProfileImage = 'assets/images/profile-placeholder.jpg';
  private userSubscription?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  logout() {
    this.authService.logout();
  }
}