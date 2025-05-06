import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpresaDashboardService {

  private API_URL = 'http://10.43.101.86:8011/castlemock/mock/rest/project/msKIAN/application/pAkR5J/datosempresa';

  constructor(private http: HttpClient) {}

  obtenerResumenEmpresa(): Observable<any> {
    return this.http.get<any>(this.API_URL);
  }
}
