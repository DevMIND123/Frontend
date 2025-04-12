import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';

// Login Component
import { LoginComponent } from './components/login/login.component';

// Home Components
import { ClientHomeComponent } from './components/home/client/client-home.component';
import { SuperadminHomeComponent } from './components/home/superadmin/superadmin-home.component';
import { SoporteHomeComponent } from './components/home/soporte/soporte-home.component';
import { MarketingHomeComponent } from './components/home/marketing/marketing-home.component';
import { EmpresaHomeComponent } from './components/home/empresa/empresa-home.component';

// Register Components
import { RegisterComponent } from './components/register/register.component';
import { ClientRegisterComponent } from './components/register/client/client-register.component';
import { CompanyRegisterComponent } from './components/register/company/company-register.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  
  // Login route
  { path: 'login', component: LoginComponent },
  
  // Home routes (protected)
  { 
    path: 'home/client', 
    component: ClientHomeComponent,
    canActivate: [AuthGuard],
    data: { roles: ['CLIENTE'] }
  },
  { 
    path: 'home/empresa', 
    component: EmpresaHomeComponent,
    canActivate: [AuthGuard],
    data: { roles: ['EMPRESA'] }
  },
  { 
    path: 'home/superadmin', 
    component: SuperadminHomeComponent,
    canActivate: [AuthGuard],
    data: { roles: ['SUPER_ADMIN'] }
  },
  { 
    path: 'home/soporte', 
    component: SoporteHomeComponent,
    canActivate: [AuthGuard],
    data: { roles: ['SOPORTE'] }
  },
  { 
    path: 'home/marketing', 
    component: MarketingHomeComponent,
    canActivate: [AuthGuard],
    data: { roles: ['MARKETING'] }
  },
  
  // Register routes
  { path: 'register', component: RegisterComponent },
  { path: 'register/client', component: ClientRegisterComponent },
  { path: 'register/company', component: CompanyRegisterComponent },
  
  { path: '**', redirectTo: 'home' }
];