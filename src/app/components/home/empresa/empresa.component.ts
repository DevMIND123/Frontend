import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-empresa-home',
  standalone: false,
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.css']
})
export class EmpresaHomeComponent implements OnInit {

  isEditing = false;
  showPasswordForm = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  searchTerm: string = '';

  companyData = {
    nombreEmpresa: 'TechCorp S.A.',
    nombreRepresentante: 'Carlos Ramírez',
    numeroDocumento: '9012345678',
    email: 'empresa@example.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  preferences = {
    darkMode: false,
    notifications: true
  };

  services = [
    { name: 'Consultoría', description: 'Servicio de consultoría técnica.', price: 250000, status: 'active' },
    { name: 'Mantenimiento', description: 'Soporte y mantenimiento mensual.', price: 180000, status: 'inactive' }
  ];

  clients = [
    { name: 'María López', email: 'maria@example.com', subscriptionDate: new Date('2023-12-01') },
    { name: 'Juan Torres', email: 'juan@example.com', subscriptionDate: new Date('2024-01-15') }
  ];

  filteredClients = [...this.clients];

  ngOnInit(): void {}

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) this.successMessage = null;
  }

  onSubmit(): void {
    this.successMessage = 'Datos actualizados correctamente';
    this.errorMessage = null;
    this.isEditing = false;
  }

  toggleTheme(): void {
    document.body.classList.toggle('dark-mode', this.preferences.darkMode);
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    this.companyData.currentPassword = '';
    this.companyData.newPassword = '';
    this.companyData.confirmPassword = '';
  }

  changePassword(): void {
    if (this.companyData.newPassword !== this.companyData.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }
    this.successMessage = 'Contraseña actualizada correctamente';
    this.togglePasswordForm();
  }

  deleteAccount(): void {
    if (confirm('¿Estás seguro de que deseas eliminar tu cuenta?')) {
      this.errorMessage = 'Cuenta eliminada (simulado)';
    }
  }

  getTotalIncome(): number {
    return this.services
      .filter(service => service.status === 'active')
      .reduce((acc, s) => acc + s.price, 0);
  }

  addService(): void {
    const nuevoServicio = {
      name: 'Nuevo Servicio',
      description: 'Descripción del nuevo servicio.',
      price: 100000,
      status: 'active'
    };
    this.services.push(nuevoServicio);
  }

  editService(service: any): void {
    alert(`Editar servicio: ${service.name}`);
  }

  deleteService(service: any): void {
    const confirmDelete = confirm(`¿Eliminar el servicio "${service.name}"?`);
    if (confirmDelete) {
      this.services = this.services.filter(s => s !== service);
    }
  }

  filterClients(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredClients = this.clients.filter(client =>
      client.name.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term)
    );
  }

  viewClientDetails(client: any): void {
    alert(`Detalles de ${client.name}`);
  }
}
