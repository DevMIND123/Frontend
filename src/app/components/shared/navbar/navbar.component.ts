import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isScrolled = false;

  constructor(private router: Router) { }

  // Detectar el scroll en la ventana
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  // Navegar al componente de login
  goToLogin() {
    this.router.navigate(['/login']);
  }

  // Navegar al componente de registro
  goToRegister() {
    this.router.navigate(['/register']);
  }
}