import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private rol = new BehaviorSubject<String>('');

  constructor(
    private http: HttpClient
  ) {
  }

  private headers = new HttpHeaders(
    { "Content-Type": "application/json" }
  )

  obtenerUsuario(Email: String, rol: String): Observable<number> {
    console.log("Rol:", rol);
    if (rol == "CLIENTE") {
      return this.http.get<number>(`${environment.apiUrl}/clientes/email/${Email}`)
    }
    else if (rol == "ADMINISTRADOR" || rol == "MARKETING" || rol == "SOPORTE") {
      return this.http.get<number>(`${environment.apiUrl}/administradores/email/${Email}`)
    }
    else if (rol == "EMPRESA") {
      return this.http.get<number>(`${environment.apiUrl}/empresas/email/${Email}`)
    }
    else {
      return throwError(() => new Error("Rol no válido"));
    }
  }

  setRol(value: String) {
    this.rol.next(value);
  }

  getRol() {
    return this.rol.asObservable();
  }

}
