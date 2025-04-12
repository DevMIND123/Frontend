import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandlingService } from './error-handling.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/administradores`;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlingService
  ) {}

  crearAdministrador(adminData: any): Observable<any> {
    return this.http.post(this.apiUrl, adminData).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  obtenerAdminPorEmail(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/email/${email}`).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  actualizarAdmin(id: string, adminData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/actualizar/${id}`, adminData).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  eliminarAdmin(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  cambiarPassword(email: string, nuevaPassword: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/cambiar-password`, {
      email,
      nuevaPassword
    }).pipe(
      catchError(this.errorHandler.handleError)
    );
  }
}