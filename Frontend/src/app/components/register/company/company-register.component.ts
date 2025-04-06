import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthLayoutComponent } from '../../shared/auth-layout/auth-layout.component';

@Component({
  selector: 'app-company-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AuthLayoutComponent],
  templateUrl: './company-register.component.html'
})
export class CompanyRegisterComponent {
  showPassword = false;
  email = '';
  password = '';
  confirmPassword = '';
  companyName = '';
  nit = '';
  address = '';
  phone = '';
  acceptTerms = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      return;
    }

    const companyData = {
      companyName: this.companyName,
      nit: this.nit,
      email: this.email,
      password: this.password,
      address: this.address,
      phone: this.phone,
      type: 'company'
    };
    
    console.log('Company Registration:', companyData);
  }
}