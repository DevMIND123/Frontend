import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

// DTO de administrador
export interface AdministradorDTO {
  email: string;
  password: string;
  nombre: string;
  rol: 'ADMINISTRADOR' | 'SOPORTE' | 'MARKETING';
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private baseUrl = `${environment.apiUrl}/administradores`;
  private jsonHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient) {}

  /** Crea un nuevo administrador */
  createAdmin(adminData: AdministradorDTO): Observable<AdministradorDTO> {
    return this.http.post<AdministradorDTO>(this.baseUrl, adminData, {
      headers: this.jsonHeaders,
    });
  }

  /** Obtiene todos los administradores */
  getAllAdmins(): Observable<AdministradorDTO[]> {
    return this.http.get<AdministradorDTO[]>(this.baseUrl, {
      headers: this.jsonHeaders,
    });
  }

  /** Obtiene un administrador por email */
  getAdminByEmail(email: string): Observable<AdministradorDTO> {
    return this.http.get<AdministradorDTO>(
      `${this.baseUrl}/email/${encodeURIComponent(email)}`,
      { headers: this.jsonHeaders }
    );
  }

  /** Actualiza un administrador por ID (usa PUT) */
  updateAdmin(id: string, adminData: Partial<AdministradorDTO>): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/actualizar/${id}`,
      adminData,
      {
        headers: this.jsonHeaders,
        responseType: 'text' as 'json',
      }
    );
  }

  /** Elimina un administrador por ID */
  deleteAdmin(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/eliminar/${id}`, {
      headers: this.jsonHeaders,
      responseType: 'text' as 'json',
    });
  }

  /** Obtiene todos los usuarios (para superadmin dashboard) */
  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/admin/usuarios`);
  }

  /** Obtiene datos de un administrador por email (mockSoporte) */
  obtenerAdminPorEmail(email: string): Observable<{ nombre: string; email: string }> {
    return this.http.get<{ nombre: string; email: string }>(
      `${environment.apiUrl}/admin/email/${email}`
    );
  }
}
