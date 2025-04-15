import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginDto } from '../dto/login-dto';
import { Observable } from 'rxjs';
import { JwtAuthenticationResponse } from '../dto/jwt-authentication-response';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';

const JWT_TOKEN = 'jwt-token';
const USER = 'user';
const ROLE = 'user-role';
const USER_ID = 'userId';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: any;

  constructor(private http: HttpClient) { }

  login(loginDto: LoginDto): Observable<JwtAuthenticationResponse> {
    return this.http.post<JwtAuthenticationResponse>(`${environment.apiUrl}/auth/login`, loginDto)
      .pipe(map(jwt => {
        if (this.isBrowser()) {
          sessionStorage.setItem(JWT_TOKEN, jwt.token);
          sessionStorage.setItem(USER, jwt.email);
          sessionStorage.setItem(ROLE, jwt.rol);
          if (jwt.userId) {
            sessionStorage.setItem(USER_ID, jwt.userId.toString());
          }
        }
        return jwt;
      }));
  }

  logout(): void {
    if (this.isBrowser()) {
      sessionStorage.removeItem(JWT_TOKEN);
      sessionStorage.removeItem(USER);
      sessionStorage.removeItem(ROLE);
      sessionStorage.removeItem(USER_ID);
    }
  }

  isAuthenticated(): boolean {
    return this.isBrowser() && sessionStorage.getItem(JWT_TOKEN) != null;
  }

  // filepath: auth.service.ts
  token(): string | null {
    return this.isBrowser() ? sessionStorage.getItem('jwt-token') : null;
  }

  getRole(): string | null {
    return this.isBrowser() ? sessionStorage.getItem(ROLE) : null;
  }

  getEmail(): string | null {
    return this.isBrowser() ? sessionStorage.getItem(USER) : null;
  }

  getUserId(): string | null {
    return this.isBrowser() ? sessionStorage.getItem(USER_ID) : null;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
  }

  registerClient(usuario: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/clientes`, usuario);
  }

  registerCompany(empresa: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/empresas`, empresa);
  }

  changePassword(data: { email: string; nuevaPassword: string }): Observable<any> {
    return this.http.put(`${environment.apiUrl}/auth/change-password`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
