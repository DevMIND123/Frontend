import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpresaDashboardService {

  private API_URL = `${environment.apiUrl}/castlemock/mock/rest/project/NeOVAA/application/Ik851k/empresa-dashboard`;

  constructor(private http: HttpClient) {}

  obtenerResumenEmpresa(): Observable<any> {
    return this.http.get<any>(this.API_URL);
  }
}
