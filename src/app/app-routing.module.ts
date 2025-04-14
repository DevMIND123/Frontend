import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterViewComponent } from './components/register/register-view/register-view.component';
import { CompanyComponent } from './components/register/company/company.component';
import { ClientComponent } from './components/home/client/client.component';
import { AboutComponent } from './components/about/about.component';
import { MarketingComponent } from './components/home/marketing/marketing.component';
import { SoporteComponent } from './components/home/soporte/soporte.component';
import { SuperadminComponent } from './components/home/superadmin/superadmin.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { PasswordChangeModalComponent } from './components/shared/password-change-modal/password-change-modal.component';
import { EmpresaHomeComponent } from './components/home/empresa/empresa.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'landing-page' },
  { path: 'landing-page', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterViewComponent },
  { path: 'register/company', loadComponent: () => import('./components/register/company/company.component').then(m => m.CompanyComponent) },
  { path: 'register/client', loadComponent: () => import('./components/register/client/client.component').then(m => m.ClientComponent) }, 
  { path: 'home/superadmin', component: SuperadminComponent },
  { path: 'home/marketing', component: MarketingComponent },
  { path: 'home/soporte', component: SoporteComponent },
  { path: 'home/empresa', component: EmpresaHomeComponent },
  { path: 'home/client', component: ClientComponent },
  { path: 'about', component: AboutComponent },
  { path: 'password-change', component: PasswordChangeModalComponent },
  { path: 'not-found', component: NotFoundComponent },
  { path: '**', redirectTo: 'not-found' } // 👈 fallback por si se va a una ruta inexistente
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    bindToComponentInputs: true,
    onSameUrlNavigation: 'reload'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
