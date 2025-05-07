import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmpresaDashboardService {
  private API_URL = `${environment.mocksUrl}/castlemock/mock/rest/project/msKIAN/application/pAkR5J/datosempresa`;

  constructor(private http: HttpClient) {}

  obtenerResumenEmpresa(): Observable<any> {
    return this.http.get<any>(this.API_URL);
  }
}
