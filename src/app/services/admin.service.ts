import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

// DTO de administrador (opcionalmente defines una interfaz separada)
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

  /** Actualiza un administrador existente (reemplaza con PUT) */
  updateAdmin(
    id: string,
    adminData: Partial<AdministradorDTO>
  ): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/actualizar/${id}`, adminData, {
      headers: this.jsonHeaders,
      responseType: 'text' as 'json',
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

  /** Elimina un administrador por ID */
  deleteAdmin(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/eliminar/${id}`, {
      headers: this.jsonHeaders,
      responseType: 'text' as 'json',
    });
  }
}
