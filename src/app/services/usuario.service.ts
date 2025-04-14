import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  actualizarUsuario(userData: { nombre: string; email: string; departamento: string; especialidad: string; currentPassword: string; newPassword: string; confirmPassword: string; }) {
    throw new Error('Method not implemented.');
  }

  private rol = new BehaviorSubject<String>('');

  constructor(
    private http: HttpClient
  ) {
  }

  private headers = new HttpHeaders(
    { "Content-Type": "application/json" }
  )

  obtenerUsuario(email: string, rol: string): Observable<number> {
    console.log("Rol:", rol);
    if (rol === "CLIENTE") {
      return this.http.get<number>(`${environment.apiUrl}/clientes/email/${email}`);
    } else if (rol === "ADMINISTRADOR" || rol === "MARKETING" || rol === "SOPORTE") {
      return this.http.get<number>(`${environment.apiUrl}/administradores/email/${email}`);
    } else if (rol === "EMPRESA") {
      return this.http.get<number>(`${environment.apiUrl}/empresas/email/${email}`);
    } else {
      return throwError(() => new Error("Rol no válido"));
    }
  }

  setRol(value: String) {
    this.rol.next(value);
  }

  getRol() {
    return this.rol.asObservable();
  }

  obtenerUsuarioPorId(id: number, rol: String): Observable<any> {
    if (rol === "CLIENTE") {
      return this.http.get<any>(`${environment.apiUrl}/clientes/${id}`);
    } else if (rol === "EMPRESA") {
      return this.http.get<any>(`${environment.apiUrl}/empresas/${id}`);
    } else if (rol === "ADMINISTRADOR" || rol === "MARKETING" || rol === "SOPORTE") {
      return this.http.get<any>(`${environment.apiUrl}/administradores/${id}`);
    } else {
      return throwError(() => new Error("Rol no válido"));
    }
  }

  actualizarUsuarioPorRol(id: number, data: any, rol: String): Observable<any> {
    if (rol === "CLIENTE") {
      return this.http.put(`${environment.apiUrl}/clientes/${id}`, data, { headers: this.headers });
    } else if (rol === "EMPRESA") {
      return this.http.put(`${environment.apiUrl}/empresas/${id}`, data, { headers: this.headers });
    } else if (rol === "ADMINISTRADOR" || rol === "MARKETING" || rol === "SOPORTE") {
      return this.http.put(`${environment.apiUrl}/administradores/${id}`, data, { headers: this.headers });
    } else {
      return throwError(() => new Error("Rol no válido"));
    }
  }

  eliminarUsuarioPorRol(id: number, rol: String): Observable<any> {
    if (rol === "CLIENTE") {
      return this.http.delete(`${environment.apiUrl}/clientes/${id}`);
    } else if (rol === "EMPRESA") {
      return this.http.delete(`${environment.apiUrl}/empresas/${id}`);
    } else if (rol === "ADMINISTRADOR" || rol === "MARKETING" || rol === "SOPORTE") {
      return this.http.delete(`${environment.apiUrl}/administradores/${id}`);
    } else {
      return throwError(() => new Error("Rol no válido"));
    }
  }

  

}


