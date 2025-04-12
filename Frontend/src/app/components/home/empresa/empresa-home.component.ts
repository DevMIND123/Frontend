import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { AuthService } from '../../../services/auth.service';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  status: 'active' | 'inactive';
}

interface Client {
  id: string;
  name: string;
  email: string;
  subscriptionDate: Date;
}

@Component({
  selector: 'app-empresa-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './empresa-home.component.html',
  styleUrls: ['./empresa-home.component.css']
})
export class EmpresaHomeComponent implements OnInit {
  isEditing = false;
  showPasswordForm = false;
  successMessage = '';
  errorMessage = '';
  searchTerm = '';

  preferences = {
    darkMode: false,
    notifications: true
  };

  companyData = {
    nombreEmpresa: '',
    nombreRepresentante: '',
    numeroDocumento: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  services: Service[] = [
    {
      id: '1',
      name: 'Consultoría Nutricional',
      description: 'Asesoría personalizada en nutrición',
      price: 150000,
      status: 'active'
    },
    {
      id: '2',
      name: 'Plan de Entrenamiento',
      description: 'Programa de ejercicios personalizado',
      price: 200000,
      status: 'active'
    }
  ];

  clients: Client[] = [
    {
      id: '1',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      subscriptionDate: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'María López',
      email: 'maria@example.com',
      subscriptionDate: new Date('2024-02-01')
    }
  ];

  filteredClients: Client[] = [];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.filteredClients = this.clients;
    this.loadCompanyData();
    this.loadThemePreference();
  }

  loadCompanyData() {
    // Here you would typically load company data from a service
    // For now, we'll use mock data
    this.companyData = {
      nombreEmpresa: 'Tech Solutions S.A.',
      nombreRepresentante: 'Carlos Rodríguez',
      numeroDocumento: '900123456-7',
      email: 'info@techsolutions.com',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  loadThemePreference() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    this.preferences.darkMode = darkMode;
    this.applyTheme();
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.loadCompanyData();
    }
    this.successMessage = '';
    this.errorMessage = '';
  }

  onSubmit() {
    // Here you would typically call a service to update company data
    console.log('Updating company data:', this.companyData);
    this.successMessage = 'Información actualizada exitosamente';
    this.isEditing = false;
  }

  togglePasswordForm() {
    this.showPasswordForm = !this.showPasswordForm;
    if (!this.showPasswordForm) {
      this.companyData.currentPassword = '';
      this.companyData.newPassword = '';
      this.companyData.confirmPassword = '';
    }
  }

  changePassword() {
    if (this.companyData.newPassword !== this.companyData.confirmPassword) {
      this.errorMessage = 'Las contraseñas nuevas no coinciden';
      return;
    }

    // Here you would typically call a service to change the password
    console.log('Changing password...');
    this.successMessage = 'Contraseña actualizada exitosamente';
    this.togglePasswordForm();
  }

  deleteAccount() {
    if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      // Here you would typically call a service to delete the account
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  toggleTheme() {
    this.preferences.darkMode = !this.preferences.darkMode;
    localStorage.setItem('darkMode', this.preferences.darkMode.toString());
    this.applyTheme();
  }

  private applyTheme() {
    document.body.classList.toggle('dark-mode', this.preferences.darkMode);
  }

  getTotalIncome(): number {
    return this.services.reduce((total, service) => {
      if (service.status === 'active') {
        return total + service.price;
      }
      return total;
    }, 0);
  }

  filterClients() {
    if (!this.searchTerm) {
      this.filteredClients = this.clients;
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredClients = this.clients.filter(client =>
      client.name.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term)
    );
  }

  addService() {
    console.log('Add new service');
  }

  editService(service: Service) {
    console.log('Edit service:', service);
  }

  deleteService(service: Service) {
    console.log('Delete service:', service);
  }

  viewClientDetails(client: Client) {
    console.log('View client details:', client);
  }
}