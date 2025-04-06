import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { User, Company } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  registerClient(userData: User): Observable<any> {
    const clientData = {
      ...userData,
      rol: 'CLIENTE'
    };
    return this.http.post(`${this.apiUrl}/usuarios`, clientData).pipe(
      tap((response: any) => {
        // Handle successful registration
        console.log('Client registered successfully:', response);
      }),
      catchError(this.handleError)
    );
  }

  registerCompany(companyData: Company): Observable<any> {
    return this.http.post(`${this.apiUrl}/empresas`, companyData).pipe(
      tap((response: any) => {
        // Handle successful registration
        console.log('Company registered successfully:', response);
      }),
      catchError(this.handleError)
    );
  }

  login(email: string, password: string): Observable<any> {
    // First try to login as a user
    return this.http.get(`${this.apiUrl}/usuarios/email/${email}`).pipe(
      tap((response: any) => {
        if (response.password === password) {
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userName', response.nombre);
          localStorage.setItem('userRole', response.rol);
          localStorage.setItem('userEmail', response.email);
        } else {
          throw new Error('Invalid credentials');
        }
      }),
      catchError((error) => {
        // If user not found, try company login
        return this.http.get(`${this.apiUrl}/empresas/email/${email}`).pipe(
          tap((response: any) => {
            if (response.password === password) {
              localStorage.setItem('isLoggedIn', 'true');
              localStorage.setItem('userName', response.nombreEmpresa);
              localStorage.setItem('userRole', 'EMPRESA');
              localStorage.setItem('userEmail', response.email);
            } else {
              throw new Error('Invalid credentials');
            }
          }),
          catchError((error) => {
            console.error('Login error:', error);
            return throwError(() => new Error('Unable to connect to the server. Please check your connection and try again.'));
          })
        );
      })
    );
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Unable to connect to the server. Please check your connection and try again.'));
  }
}