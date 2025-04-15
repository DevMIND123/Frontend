import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing-page',
  standalone: false,
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent {
  isLoggedIn = false;
  userName = '';
  userRole = '';
  userProfileImage = 'assets/images/profile-placeholder.jpg';
  isScrolled = false;

  constructor(private authService: AuthService) {
    this.checkLoginStatus();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  checkLoginStatus() {
    this.isLoggedIn = this.authService.isAuthenticated();

    if (this.isLoggedIn) {
      this.userName = sessionStorage.getItem('user') || '';
      this.userRole = sessionStorage.getItem('user-role') || '';
    } else {
      this.userName = '';
      this.userRole = '';
    }
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.userName = '';
    this.userRole = '';
  }
}