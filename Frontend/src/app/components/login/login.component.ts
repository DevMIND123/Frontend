import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AuthLayoutComponent } from '../shared/auth-layout/auth-layout.component';
import { TestUsersService, TestUser } from '../../services/test-users.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AuthLayoutComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  showPassword = false;
  email = '';
  password = '';
  rememberMe = false;
  isLoading = false;
  errorMessage = '';
  testUsers: TestUser[] = [];
  isDevelopment = !environment.production;

  constructor(
    private router: Router,
    private authService: AuthService,
    private testUsersService: TestUsersService
  ) {
    this.testUsers = this.testUsersService.getTestUsers();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  loginAsTestUser(testUser: TestUser) {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(testUser.email, testUser.password).subscribe({
      next: () => {
        // Get the role and handle navigation
        const role = testUser.role.toLowerCase();
        if (role === 'super_admin') {
          this.router.navigate(['/home/superadmin']);
        } else if (role === 'cliente') {
          this.router.navigate(['/home/client']);
        } else {
          this.router.navigate([`/home/${role}`]);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al iniciar sesión. Por favor, inténtalo de nuevo.';
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        const userRole = localStorage.getItem('userRole');
        if (userRole) {
          const role = userRole.toLowerCase();
          if (role === 'super_admin') {
            this.router.navigate(['/home/superadmin']);
          } else if (role === 'cliente') {
            this.router.navigate(['/home/client']);
          } else {
            this.router.navigate([`/home/${role}`]);
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Credenciales incorrectas. Por favor, inténtalo de nuevo.';
        this.isLoading = false;
      }
    });
  }
}