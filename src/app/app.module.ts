import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { AboutComponent } from './components/about/about.component';
import { ClientComponent } from './components/home/client/client.component';
import { EmpresaComponent } from './components/home/empresa/empresa.component';
import { MarketingComponent } from './components/home/marketing/marketing.component';
import { SoporteComponent } from './components/home/soporte/soporte.component';
import { SuperadminComponent } from './components/home/superadmin/superadmin.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ProfileComponent } from './components/profile/profile.component';
import { CompanyComponent } from './components/register/company/company.component';
import { RegisterViewComponent } from './components/register/register-view/register-view.component';
import { AuthLayoutComponent } from './components/shared/auth-layout/auth-layout.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { PasswordChangeModalComponent } from './components/shared/password-change-modal/password-change-modal.component';
import { UserInfoPanelComponent } from './components/shared/user-info-panel/user-info-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AboutComponent,
    ClientComponent,
    EmpresaComponent,
    MarketingComponent,
    SoporteComponent,
    SuperadminComponent,
    NotFoundComponent,
    ProfileComponent,
    CompanyComponent,
    RegisterViewComponent,
    AuthLayoutComponent,
    FooterComponent,
    NavbarComponent,
    PasswordChangeModalComponent,
    UserInfoPanelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    provideClientHydration(withEventReplay())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
