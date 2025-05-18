import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HabitoDineroService {
  private API_URL = `${environment.mocksUrl}/castlemock/mock/rest/project/NeOVAA/application/Ik851k/habito-dinero`;

  constructor(private http: HttpClient) {}

  obtenerHabitoDinero(): Observable<any> {
    return this.http.get<any>(this.API_URL);
  }
}
