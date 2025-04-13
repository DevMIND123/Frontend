import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginDto } from '../dto/login-dto';
import { Observable } from 'rxjs';
import { JwtAuthenticationResponse } from '../dto/jwt-authentication-response';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';

const JWT_TOKEN = "jwt-token";
const USER = "user";
const ROLE = "user-role";
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(loginDto: LoginDto): Observable<JwtAuthenticationResponse> {
    console.log("DTO:", loginDto);
    return this.http.post<JwtAuthenticationResponse>(`http://localhost:8080/api.retochimba.com/auth/login`, loginDto)
      .pipe(map(jwt => {
        // Importante: https://stackoverflow.com/questions/27067251/where-to-store-jwt-in-browser-how-to-protect-against-csrf
        if (this.isBrowser()) {
          sessionStorage.setItem(JWT_TOKEN, jwt.token);
          sessionStorage.setItem(USER, jwt.email);
          sessionStorage.setItem(ROLE, jwt.rol);
    
        }
        return jwt;
      }));
  }

  logout() {
    if (this.isBrowser()) {
      sessionStorage.removeItem(JWT_TOKEN);
      sessionStorage.removeItem(USER);
      sessionStorage.removeItem(ROLE);
    }
  }

  isAuthenticated() {
    return this.isBrowser() && sessionStorage.getItem(JWT_TOKEN) != null;
  }

  token() {
    return this.isBrowser() ? sessionStorage.getItem(JWT_TOKEN) : null;
  }

  role() {
    return this.isBrowser() ? sessionStorage.getItem(ROLE) : null;
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
  }

}
