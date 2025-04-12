import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface TestUser {
  email: string;
  password: string;
  role: string;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class TestUsersService {
  private readonly testUsers: TestUser[] = [
    {
      email: 'cliente@retorchimba.com',
      password: 'cliente123',
      role: 'CLIENTE',
      label: 'Cliente'
    },
    {
      email: 'admin@retorchimba.com',
      password: 'admin123',
      role: 'SUPER_ADMIN',
      label: 'Super Admin'
    },
    {
      email: 'soporte@retorchimba.com',
      password: 'soporte123',
      role: 'SOPORTE',
      label: 'Soporte'
    },
    {
      email: 'marketing@retorchimba.com',
      password: 'marketing123',
      role: 'MARKETING',
      label: 'Marketing'
    },
    {
      email: 'empresa@retorchimba.com',
      password: 'empresa123',
      role: 'EMPRESA',
      label: 'Empresa'
    }
  ];

  getTestUsers(): TestUser[] {
    return !environment.production ? this.testUsers : [];
  }

  getTestUser(role: string): TestUser | undefined {
    return this.testUsers.find(user => user.role === role);
  }
}