import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './components/about/about.component';
import { ClientLoginComponent } from './components/login/client/client-login.component';
import { RegisterComponent } from './components/register/register.component';
import { ClientRegisterComponent } from './components/register/client/client-register.component';
import { CompanyRegisterComponent } from './components/register/company/company-register.component';
import { ProfileComponent } from './components/profile/profile.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'login', component: ClientLoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'register/client', component: ClientRegisterComponent },
  { path: 'register/company', component: CompanyRegisterComponent },
  { path: '**', redirectTo: 'home' }
];