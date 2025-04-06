import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthLayoutComponent } from '../../shared/auth-layout/auth-layout.component';

@Component({
  selector: 'app-client-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AuthLayoutComponent],
  templateUrl: './client-register.component.html'
})
export class ClientRegisterComponent {
  showPassword = false;
  email = '';
  password = '';
  confirmPassword = '';
  fullName = '';
  acceptTerms = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      return;
    }

    const userData = {
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      type: 'client'
    };
    
    console.log('Client Registration:', userData);
  }
}