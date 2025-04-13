import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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

  obtenerUsuario(Email:String): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/usuarios/email/${Email}`)
  }

  setRol(value: String) {
    this.rol.next(value);
  }

  getRol() {
    return this.rol.asObservable();
  }

}
