import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HabitoBellezaService {
  private API_URL = 'https://tu-castlemock.com/mock/rest/project/.../habito-belleza';

  constructor(private http: HttpClient) {}

  obtenerHabitoBelleza(): Observable<any> {
    return this.http.get<any>(this.API_URL);
  }
}
