import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable, tap, catchError, throwError, of, BehaviorSubject } from 'rxjs';
import { User, Company } from '../models/user.model';
import { TestUsersService } from './test-users.service';
import { ErrorHandlingService } from './error-handling.service';

export interface UserInfo {
  name: string;
  email: string;
  role: string;
}

export interface PasswordChange {
  email: string;
  nuevaPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private testUsersService: TestUsersService,
    private errorHandler: ErrorHandlingService
  ) {
    if (this.isAuthenticated()) {
      this.currentUserSubject.next({
        name: localStorage.getItem('userName') || '',
        email: localStorage.getItem('userEmail') || '',
        role: localStorage.getItem('userRole') || ''
      });
    }
  }

  login(email: string, password: string): Observable<any> {
    // Check for test users first
    if (!environment.production) {
      const testUser = this.testUsersService.getTestUsers()
        .find(user => user.email === email && user.password === password);
      
      if (testUser) {
        const userInfo = {
          name: testUser.label,
          email: testUser.email,
          role: testUser.role
        };
        
        this.setUserSession({
          nombre: testUser.label,
          email: testUser.email,
          id: 'test-user-id'
        }, testUser.role);

        this.currentUserSubject.next(userInfo);

        // Navigate based on role
        const roleLowerCase = testUser.role.toLowerCase();
        if (roleLowerCase === 'super_admin') {
          this.router.navigate(['/home/superadmin']);
        } else if (roleLowerCase === 'cliente') {
          this.router.navigate(['/home/client']);
        } else {
          this.router.navigate([`/home/${roleLowerCase}`]);
        }
        
        return of({ success: true });
      }
    }

    // Regular authentication flow
    return this.http.get(`${this.apiUrl}/usuarios/email/${email}`).pipe(
      tap((response: any) => {
        if (response.password === password) {
          this.setUserSession(response, response.rol);
          this.currentUserSubject.next({
            name: response.nombre,
            email: response.email,
            role: response.rol
          });

          // Navigate based on role
          const roleLowerCase = response.rol.toLowerCase();
          if (roleLowerCase === 'super_admin') {
            this.router.navigate(['/home/superadmin']);
          } else if (roleLowerCase === 'cliente') {
            this.router.navigate(['/home/client']);
          } else {
            this.router.navigate([`/home/${roleLowerCase}`]);
          }
        } else {
          throw new Error('Invalid credentials');
        }
      }),
      catchError(this.errorHandler.handleError)
    );
  }

  registerClient(userData: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios`, userData).pipe(
      tap((response: any) => {
        console.log('Client registered successfully:', response);
      }),
      catchError(this.errorHandler.handleError)
    );
  }

  registerCompany(companyData: Company): Observable<any> {
    return this.http.post(`${this.apiUrl}/empresas`, companyData).pipe(
      tap((response: any) => {
        console.log('Company registered successfully:', response);
      }),
      catchError(this.errorHandler.handleError)
    );
  }

  changePassword(data: PasswordChange, userType: 'usuarios' | 'empresas' | 'administradores'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userType}/cambiar-password`, data).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  private setUserSession(user: any, role: string) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', user.nombre || user.nombreEmpresa);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userId', user.id?.toString() || '');
  }

  logout(): void {
    localStorage.clear();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }
}