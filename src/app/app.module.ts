import { NgModule } from '@angular/core';
import { BrowserModule} from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { AboutComponent } from './components/about/about.component';
import { ClientComponent } from './components/home/client/client.component';
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
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch } from '@angular/common/http';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { AuthService } from './services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { EmpresaHomeComponent } from './components/home/empresa/empresa.component';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AboutComponent,
    MarketingComponent,
    SoporteComponent,
    SuperadminComponent,
    NotFoundComponent,
    ProfileComponent,
    RegisterViewComponent,
    AuthLayoutComponent,
    PasswordChangeModalComponent,
    UserInfoPanelComponent,
    LandingPageComponent,
    EmpresaHomeComponent
    
  ],
  imports: [
    NavbarComponent,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    FooterComponent,
    HttpClientModule,
    ClientComponent
    
  ],
  providers: [
    AuthService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideHttpClient(withFetch())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
