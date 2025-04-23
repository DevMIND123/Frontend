import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' 
})
export class FinanzasService {

  private API_URL = 'http://10.43.103.209:8012/castlemock/mock/rest/project/NeOVAA/application/Ik851k/finanzas';

  constructor(private http: HttpClient) { }

  obtenerModuloFinanzas(): Observable<any> {
    return this.http.get<any>(this.API_URL);
  }
}
