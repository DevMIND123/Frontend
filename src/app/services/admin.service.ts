import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private http: HttpClient) { }

  // Actualiza los datos de un administrador por su ID
  actualizarAdmin(userId: string, adminData: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/admin/${userId}`, adminData);
  }

  // Obtiene los datos de un administrador por su correo electrónico
  obtenerAdminPorEmail(email: string): Observable<{ nombre: string; email: string }> {
    return this.http.get<{ nombre: string; email: string }>(`${environment.apiUrl}/admin/email/${email}`);
  }
}


