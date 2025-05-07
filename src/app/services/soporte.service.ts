import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SoporteService {
  // Asegúrate que esta URL coincida con tu endpoint en CastleMock
  private API_URL = `${environment.apiUrl}/castlemock/mock/rest/project/0zdcGK/application/SIKZ6F/soporte`;

  constructor(private http: HttpClient) {}

  obtenerModuloSoporte(): Observable<any> {
    return this.http.get<any>(this.API_URL);
  }
}