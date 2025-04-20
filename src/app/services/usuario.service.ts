/* eslint‑disable @typescript-eslint/member-ordering */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

/* ✅ Si gatewayUrl no existe, caemos en apiUrl para no romper nada */
const BASE_URL: string = (environment as any).gatewayUrl || environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly rol$ = new BehaviorSubject<string>('');

  private readonly jsonHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(private readonly http: HttpClient) {}

  /* ---------- endpoints ---------- */
  obtenerUsuario(email: string, rol: string): Observable<any> {
    const ruta = this.getRutaPorRol(rol);
    return this.http.get<any>(`${BASE_URL}/${ruta}/email/${email}`);
  }

  obtenerUsuarioById(id: number, rol: string): Observable<any> {
    const ruta = this.getRutaPorRol(rol);
    return this.http.get<any>(`${BASE_URL}/${ruta}/${id}`);
  }

  obtenerIdPorEmail(email: string, rol: string): Observable<number> {
    const ruta = this.getRutaPorRol(rol);
    return this.http.get<number>(`${BASE_URL}/${ruta}/email/${email}`);
  }

  actualizarUsuarioPorId(
    id: any,
    dto:any,
    rol: any
  ): Observable<any> {
    const ruta = this.getRutaPorRol(rol);
    return this.http.patch(`${BASE_URL}/${ruta}/actualizar/${id}`, dto, {
      headers: this.jsonHeaders,
    });
  }

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

    return this.obtenerIdPorEmail(email, rol).pipe(
      switchMap((id) =>
        this.actualizarUsuarioPorId(id.toString(), userData, rol)
      )
    );
  }

  eliminarUsuarioPorId(id: number, rol: string): Observable<any> {
    const ruta = this.getRutaPorRol(rol);
    return this.http.delete(`${BASE_URL}/${ruta}/eliminar/${id}`);
  }

  /* ---------- util ---------- */
  private getRutaPorRol(rol: string): string {
    switch (rol.toUpperCase()) {
      case 'CLIENTE':
        return 'clientes';
      case 'EMPRESA':
        return 'empresas';
      case 'ADMINISTRADOR':
      case 'MARKETING':
      case 'SOPORTE':
        return 'administradores';
      default:
        throw new Error(`Rol no válido: ${rol}`);
    }
  }

  setRol(value: string) {
    this.rol$.next(value);
  }
  getRol(): Observable<string> {
    return this.rol$.asObservable();
  }
}
