import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HabitoEjercicioService {
  private API_URL = 'https://tu-castlemock.com/mock/rest/project/.../habito-ejercicio';

  constructor(private http: HttpClient) {}

  obtenerHabitoEjercicio(): Observable<any> {
    return this.http.get<any>(this.API_URL);
  }
}
