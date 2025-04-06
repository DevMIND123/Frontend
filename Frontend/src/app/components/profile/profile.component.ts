import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface UserProfile {
  fullName: string;
  email: string;
  age: number;
  description: string;
  profileImage: string;
  darkMode: boolean;
  notificationsEnabled: boolean;
}

interface Habit {
  id: number;
  name: string;
  progress: number;
  streak: number;
  category: string;
}

interface Challenge {
  id: number;
  name: string;
  progress: number;
  daysLeft: number;
  category: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="profile-container" [class.dark-mode]="userProfile.darkMode">
      <!-- Header Section -->
      <header class="profile-header">
        <div class="container py-4">
          <div class="row align-items-center">
            <div class="col-auto">
              <div class="profile-image-container">
                <img [src]="userProfile.profileImage" alt="Profile" class="profile-image">
                <div class="profile-image-overlay" (click)="triggerImageUpload()">
                  <i class="bi bi-camera"></i>
                </div>
                <input type="file" #imageInput class="d-none" (change)="onImageChange($event)" accept="image/*">
              </div>
            </div>
            <div class="col">
              <h1 class="mb-2">{{ userProfile.fullName }}</h1>
              <p class="text-muted mb-0">{{ userProfile.description }}</p>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <div class="container py-4">
        <div class="row g-4">
          <!-- Left Column - Personal Information -->
          <div class="col-md-4">
            <div class="card shadow-sm">
              <div class="card-body">
                <h3 class="card-title mb-4">Información Personal</h3>
                <form (ngSubmit)="saveProfile()">
                  <div class="mb-3">
                    <label class="form-label">Nombre Completo</label>
                    <input type="text" class="form-control" [(ngModel)]="userProfile.fullName" name="fullName">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Correo Electrónico</label>
                    <input type="email" class="form-control" [(ngModel)]="userProfile.email" name="email">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Edad</label>
                    <input type="number" class="form-control" [(ngModel)]="userProfile.age" name="age">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Descripción</label>
                    <textarea class="form-control" rows="3" [(ngModel)]="userProfile.description" name="description"></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary w-100">
                    <i class="bi bi-save me-2"></i>Guardar Cambios
                  </button>
                </form>

                <hr>

                <h4 class="mb-3">Seguridad</h4>
                <button class="btn btn-outline-primary w-100 mb-3" (click)="changePassword()">
                  <i class="bi bi-key me-2"></i>Cambiar Contraseña
                </button>
                <button class="btn btn-outline-danger w-100" (click)="deleteAccount()">
                  <i class="bi bi-trash me-2"></i>Eliminar Cuenta
                </button>

                <hr>

                <h4 class="mb-3">Preferencias</h4>
                <div class="form-check form-switch mb-3">
                  <input class="form-check-input" type="checkbox" [(ngModel)]="userProfile.darkMode" (change)="toggleTheme()">
                  <label class="form-check-label">Modo Oscuro</label>
                </div>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" [(ngModel)]="userProfile.notificationsEnabled">
                  <label class="form-check-label">Notificaciones</label>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column - Progress and Challenges -->
          <div class="col-md-8">
            <!-- Habits Progress -->
            <div class="card shadow-sm mb-4">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <h3 class="card-title mb-0">Progreso de Hábitos</h3>
                  <button class="btn btn-outline-primary btn-sm" (click)="manageHabits()">
                    <i class="bi bi-gear me-2"></i>Gestionar
                  </button>
                </div>
                <div class="habits-grid">
                  <div *ngFor="let habit of habits" class="habit-card">
                    <div class="habit-icon" [ngClass]="habit.category">
                      <i class="bi" [class]="getCategoryIcon(habit.category)"></i>
                    </div>
                    <div class="habit-info">
                      <h4>{{ habit.name }}</h4>
                      <div class="progress mb-2">
                        <div class="progress-bar" 
                             [style.width.%]="habit.progress"
                             [class]="getProgressClass(habit.progress)">
                          {{ habit.progress }}%
                        </div>
                      </div>
                      <small class="text-muted">
                        <i class="bi bi-lightning me-1"></i>
                        Racha: {{ habit.streak }} días
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Active Challenges -->
            <div class="card shadow-sm">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <h3 class="card-title mb-0">Retos Activos</h3>
                  <button class="btn btn-outline-primary btn-sm" (click)="exploreChallenges()">
                    <i class="bi bi-plus-lg me-2"></i>Explorar Retos
                  </button>
                </div>
                <div class="challenges-list">
                  <div *ngFor="let challenge of challenges" class="challenge-card">
                    <div class="challenge-icon" [ngClass]="challenge.category">
                      <i class="bi" [class]="getCategoryIcon(challenge.category)"></i>
                    </div>
                    <div class="challenge-info">
                      <h4>{{ challenge.name }}</h4>
                      <div class="progress mb-2">
                        <div class="progress-bar" 
                             [style.width.%]="challenge.progress"
                             [class]="getProgressClass(challenge.progress)">
                          {{ challenge.progress }}%
                        </div>
                      </div>
                      <small class="text-muted">
                        <i class="bi bi-calendar me-1"></i>
                        {{ challenge.daysLeft }} días restantes
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Container Styles */
    .profile-container {
      min-height: 100vh;
      background-color: #f8f9fa;
      transition: all 0.3s ease;
    }

    .profile-container.dark-mode {
      background-color: #1a1a1a;
      color: #fff;
    }

    .dark-mode .card {
      background-color: #2d2d2d;
      border-color: #404040;
    }

    .dark-mode .form-control,
    .dark-mode .form-select {
      background-color: #333;
      border-color: #404040;
      color: #fff;
    }

    .dark-mode .text-muted {
      color: #aaa !important;
    }

    /* Header Styles */
    .profile-header {
      background: linear-gradient(135deg, #20B2AA 0%, #003893 100%);
      color: white;
      padding: 2rem 0;
      margin-bottom: 2rem;
    }

    .profile-image-container {
      position: relative;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid white;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .profile-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .profile-image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      cursor: pointer;
    }

    .profile-image-overlay i {
      color: white;
      font-size: 2rem;
    }

    .profile-image-container:hover .profile-image-overlay {
      opacity: 1;
    }

    /* Card Styles */
    .card {
      border-radius: 1rem;
      border: none;
      transition: all 0.3s ease;
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
    }

    /* Form Styles */
    .form-control, .form-select {
      padding: 0.75rem;
      border-radius: 0.5rem;
      border: 2px solid #e0e0e0;
      transition: all 0.3s ease;
    }

    .form-control:focus, .form-select:focus {
      border-color: #20B2AA;
      box-shadow: 0 0 0 0.2rem rgba(32, 178, 170, 0.25);
    }

    /* Habits Grid */
    .habits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .habit-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .dark-mode .habit-card {
      background-color: #333;
    }

    .habit-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .habit-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .habit-info {
      flex: 1;
    }

    /* Challenge Cards */
    .challenges-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .challenge-card {
      background: white;
      border-radius: 1rem;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .dark-mode .challenge-card {
      background-color: #333;
    }

    .challenge-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .challenge-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .challenge-info {
      flex: 1;
    }

    /* Category Colors */
    .food { background-color: #FDB347; }
    .time { background-color: #003893; }
    .location { background-color: #CE1126; }
    .knowledge { background-color: #2E7D32; }
    .finance { background-color: #7B1FA2; }

    /* Progress Bars */
    .progress {
      height: 0.75rem;
      border-radius: 1rem;
      background-color: #e9ecef;
    }

    .dark-mode .progress {
      background-color: #404040;
    }

    .progress-bar {
      border-radius: 1rem;
      transition: width 0.6s ease;
    }

    .progress-low { background-color: #dc3545; }
    .progress-medium { background-color: #ffc107; }
    .progress-high { background-color: #28a745; }

    /* Buttons */
    .btn {
      border-radius: 0.5rem;
      padding: 0.5rem 1rem;
      transition: all 0.3s ease;
    }

    .btn:hover {
      transform: translateY(-2px);
    }

    /* Form Switch */
    .form-check-input {
      cursor: pointer;
    }

    .form-check-input:checked {
      background-color: #20B2AA;
      border-color: #20B2AA;
    }

    /* Delete Account Button */
    .btn-outline-danger {
      color: #dc3545;
      border-color: #dc3545;
    }

    .btn-outline-danger:hover {
      color: white;
      background-color: #dc3545;
      border-color: #dc3545;
    }
  `]
})
export class ProfileComponent implements OnInit {
  userProfile: UserProfile = {
    fullName: 'Maikol01990',
    email: 'maikol@example.com',
    age: 25,
    description: '¡Comprometido con el cambio y la mejora continua! 💪',
    profileImage: 'assets/images/profile-placeholder.jpg',
    darkMode: false,
    notificationsEnabled: true
  };

  habits: Habit[] = [
    { id: 1, name: 'Alimentación Saludable', progress: 75, streak: 12, category: 'food' },
    { id: 2, name: 'Gestión del Tiempo', progress: 45, streak: 5, category: 'time' },
    { id: 3, name: 'Ejercicio Diario', progress: 90, streak: 21, category: 'location' },
    { id: 4, name: 'Lectura Diaria', progress: 60, streak: 8, category: 'knowledge' },
    { id: 5, name: 'Ahorro Mensual', progress: 30, streak: 3, category: 'finance' }
  ];

  challenges: Challenge[] = [
    { id: 1, name: '30 Días Sin Azúcar', progress: 65, daysLeft: 10, category: 'food' },
    { id: 2, name: 'Madrugador', progress: 40, daysLeft: 15, category: 'time' },
    { id: 3, name: 'Finanzas Inteligentes', progress: 85, daysLeft: 5, category: 'finance' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.applyTheme();
  }

  getCategoryIcon(category: string): string {
    const icons = {
      food: 'bi-apple',
      time: 'bi-clock',
      location: 'bi-geo-alt',
      knowledge: 'bi-book',
      finance: 'bi-piggy-bank'
    };
    return icons[category as keyof typeof icons] || 'bi-star';
  }

  getProgressClass(progress: number): string {
    if (progress < 40) return 'progress-low';
    if (progress < 70) return 'progress-medium';
    return 'progress-high';
  }

  triggerImageUpload() {
    const imageInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    imageInput?.click();
  }

  onImageChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.userProfile.profileImage = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  toggleTheme() {
    this.applyTheme();
  }

  applyTheme() {
    document.body.classList.toggle('dark-mode', this.userProfile.darkMode);
  }

  saveProfile() {
    console.log('Saving profile:', this.userProfile);
    // Aquí iría la lógica para guardar en el backend
  }

  changePassword() {
    console.log('Change password clicked');
    // Aquí iría la lógica para cambiar la contraseña
  }

  deleteAccount() {
    if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      // Aquí iría la lógica para eliminar la cuenta
      this.authService.logout();
      this.router.navigate(['/auth/login']);
    }
  }

  manageHabits() {
    console.log('Manage habits clicked');
    // Aquí iría la navegación a la página de gestión de hábitos
  }

  exploreChallenges() {
    console.log('Explore challenges clicked');
    // Aquí iría la navegación a la página de exploración de retos
  }
}