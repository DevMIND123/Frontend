import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

/* -------- componentes NO‑stand‑alone (siguen en declarations) -------- */
import { LoginComponent } from './components/login/login.component';
import { AboutComponent } from './components/about/about.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RegisterViewComponent } from './components/register/register-view/register-view.component';
import { AuthLayoutComponent } from './components/shared/auth-layout/auth-layout.component';
import { PasswordChangeModalComponent } from './components/shared/password-change-modal/password-change-modal.component';
import { UserInfoPanelComponent } from './components/shared/user-info-panel/user-info-panel.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';

/* -------- componentes stand‑alone → sólo en imports -------- */
import { MarketingComponent } from './components/home/marketing/marketing.component';
import { SoporteHomeComponent } from './components/home/soporte/soporte.component';
import { SuperadminComponent } from './components/home/superadmin/superadmin.component';
import { ClientComponent } from './components/home/client/client.component';
import { EmpresaHomeComponent } from './components/home/empresa/empresa.component';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { FooterComponent } from './components/shared/footer/footer.component';

import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AuthService } from './services/auth.service';
import { GestionContenidoComponent } from './components/home/gestion-contenido/gestion-contenido.component';
import { FaqComponent } from './components/faq/faq.component';
import { FaqAdminComponent } from './components/faq-admin/faq-admin.component';
import { registerLocaleData } from '@angular/common';
import localeEsCO from '@angular/common/locales/es-CO';
registerLocaleData(localeEsCO);

@NgModule({
  /* ❶ SOLO componentes NO‑stand‑alone */
  declarations: [
    AppComponent,
    LoginComponent,
    AboutComponent,
    NotFoundComponent,
    ProfileComponent,
    RegisterViewComponent,
    AuthLayoutComponent,
    PasswordChangeModalComponent,
    UserInfoPanelComponent,
    LandingPageComponent,
  ],

  /* ❷ Los stand‑alone van aquí */
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,

    /* stand‑alone */
    MarketingComponent,
    SoporteHomeComponent,
    SuperadminComponent,
    ClientComponent,
    EmpresaHomeComponent,
    NavbarComponent,
    FooterComponent,
    GestionContenidoComponent,
    FaqAdminComponent,
    FaqComponent
  ],

  providers: [
    AuthService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideHttpClient(withFetch()),
    { provide: LOCALE_ID, useValue: 'es-CO' } // ✅ esto soluciona NG0701
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
