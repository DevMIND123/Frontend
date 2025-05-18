import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MarketingService {
  private API_URL = `${environment.mocksUrl}/castlemock/mock/rest/project/MA1Q2G/application/Foz8Qv/publicidadmarketing`;

  constructor(private http: HttpClient) {}

  obtenerModuloMarketing(): Observable<any> {
    return this.http.get<any>(this.API_URL);
  }
}
