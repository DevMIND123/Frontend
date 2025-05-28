import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root' 
})
export class FinanzasService {

  private API_URL = `${environment.mocksUrl}/castlemock/mock/rest/project/NeOVAA/application/Ik851k/finanzas`;

  constructor(private http: HttpClient) { }

  obtenerModuloFinanzas(): Observable<any> {
    return this.http.get<any>(this.API_URL);
  }
}
