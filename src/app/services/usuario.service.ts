import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private rol = new BehaviorSubject<string>('');

  constructor(private http: HttpClient) { }

  private headers = new HttpHeaders({
    "Content-Type": "application/json"
  });

  // ✅ NUEVO: Actualizar usuario por ID
  actualizarUsuarioPorId(
    id: string,
    userData: {
      nombre: string;
      email: string;
      departamento: string;
      especialidad: string;
    },
    rol: string
  ): Observable<any> {
    const ruta = this.getRutaPorRol(rol);
    return this.http.patch(`${environment.apiUrl}/${ruta}/actualizar/${id}`, userData, {
      headers: this.headers
    });
  }

  // ✅ Modificado: Obtener el ID por email y luego usarlo para actualizar
  actualizarUsuario(userData: {
    nombre: string;
    email: string;
    departamento: string;
    especialidad: string;
  }): Observable<any> {
    const rol = sessionStorage.getItem('user-role');
    const email = userData.email;

    if (!rol) return throwError(() => new Error('Rol no encontrado en sesión'));
    if (!email) return throwError(() => new Error('Email no proporcionado'));

    return this.obtenerUsuarioPorEmail(email, rol).pipe(
      switchMap((id: number) => this.actualizarUsuarioPorId(id.toString(), userData, rol))
    );
  }

  // ✅ Obtener ID por email
  obtenerUsuarioPorEmail(email: string, rol: string): Observable<any> {
    const ruta = this.getRutaPorRol(rol);
    return this.http.get<any>(`${environment.apiUrl}/${ruta}/email/${email}`);
  }

  // ✅ Eliminar usuario por email
  eliminarUsuarioPorEmail(email: string, rol: string): Observable<any> {
    const ruta = this.getRutaPorRol(rol);
    return this.http.delete(`${environment.apiUrl}/${ruta}/email/${email}`);
  }

  // ✅ Auxiliar para rutas por rol
  private getRutaPorRol(rol: string): string {
    switch (rol) {
      case "CLIENTE": return "clientes";
      case "EMPRESA": return "empresas";
      case "ADMINISTRADOR":
      case "MARKETING":
      case "SOPORTE":
        return "administradores";
      default:
        throw new Error("Rol no válido");
    }
  }

  setRol(value: string) {
    this.rol.next(value);
  }

  getRol() {
    return this.rol.asObservable();
  }
}