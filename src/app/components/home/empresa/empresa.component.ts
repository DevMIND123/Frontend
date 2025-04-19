import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../../../services/usuario.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { EmpresaUpdateDTO } from '../../../models/empresa'; // 👈 Importar la interfaz correcta

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
    nombreEmpresa: '',
    nombreRepresentante: '',
    numeroDocumento: '',
    email: '',
    departamento: '',
    especialidad: ''
  };

  passwordData = {
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

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCompanyData();
    this.loadThemePreference();
  }

  loadCompanyData(): void {
    const email = sessionStorage.getItem('user');
    const rol = sessionStorage.getItem('user-role');

    if (!email || !rol) {
      this.errorMessage = 'No se encontró la sesión de la empresa. Inicia sesión nuevamente.';
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioService.obtenerUsuarioPorEmail(email, rol).subscribe({
      next: (data: any) => {
        this.companyData = {
          nombreEmpresa: data.nombreEmpresa || '',
          nombreRepresentante: data.nombreRepresentante || '',
          numeroDocumento: data.numeroDocumento || '',
          email: data.email || '',
          departamento: data.departamento || '',
          especialidad: data.especialidad || ''
        };
      },
      error: (error: any) => {
        this.errorMessage = 'Error al cargar los datos de la empresa.';
        console.error('Error:', error);
      }
    });
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) this.successMessage = null;
  }

  onSubmit(): void {
    const rol = sessionStorage.getItem('user-role');
    if (!rol || !this.companyData.email) return;

    const updateData: EmpresaUpdateDTO = {
      nombre: this.companyData.nombreEmpresa,
      email: this.companyData.email,
      departamento: this.companyData.departamento,
      especialidad: this.companyData.especialidad
    };

    this.usuarioService.actualizarUsuario(updateData).subscribe({
      next: () => {
        this.successMessage = 'Datos actualizados correctamente';
        this.isEditing = false;
        this.errorMessage = null;
      },
      error: (error: any) => {
        this.errorMessage = 'Error al actualizar los datos.';
        console.error('Error al actualizar:', error);
      }
    });
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  changePassword(): void {
    const email = sessionStorage.getItem('user');
    if (!email) return;

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    this.authService.changePassword({ email, nuevaPassword: this.passwordData.newPassword }).subscribe({
      next: () => {
        this.successMessage = 'Contraseña actualizada correctamente';
        this.togglePasswordForm();
      },
      error: (error: any) => {
        this.errorMessage = 'Error al cambiar la contraseña';
        console.error('Error:', error);
      }
    });
  }

  deleteAccount(): void {
    const email = sessionStorage.getItem('user');
    const rol = sessionStorage.getItem('user-role');
    if (!email || !rol) return;

    if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      this.usuarioService.eliminarUsuarioPorEmail(email, rol).subscribe({
        next: () => {
          this.authService.logout();
          this.router.navigate(['/login']);
        },
        error: (error: any) => {
          this.errorMessage = 'Error al eliminar la cuenta';
          console.error('Delete error:', error);
        }
      });
    }
  }

  toggleTheme(): void {
    this.preferences.darkMode = !this.preferences.darkMode;
    localStorage.setItem('darkMode', this.preferences.darkMode.toString());
    this.applyTheme();
  }

  loadThemePreference(): void {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    this.preferences.darkMode = darkMode;
    this.applyTheme();
  }

  applyTheme(): void {
    document.body.classList.toggle('dark-mode', this.preferences.darkMode);
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