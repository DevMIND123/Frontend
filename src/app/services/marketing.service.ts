import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarketingService {
  private API_URL = '    http://10.43.101.86:8012/castlemock/mock/rest/project/MA1Q2G/application/Foz8Qv/publicidadmarketing';

  constructor(private http: HttpClient) {}

  obtenerModuloMarketing(): Observable<any> {
    return this.http.get<any>(this.API_URL);
  }
}
