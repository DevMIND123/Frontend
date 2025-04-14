import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterViewComponent } from './components/register/register-view/register-view.component';



const routes: Routes = [
  { path: 'landing-page', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterViewComponent },
  { path: '', pathMatch: 'full', redirectTo: 'landing-page' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, 
    {
      bindToComponentInputs: true, // Para poder usar @Input en rutas https://angular.io/guide/router
      onSameUrlNavigation: 'reload' // https://stackoverflow.com/a/52512361
    })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
