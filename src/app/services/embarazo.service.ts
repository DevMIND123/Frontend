import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface EmbarazoDTO {
  fechaInicio: string;
  semanaActual: number;
  fechaPartoEstimada: string;
  sintomas?: string;
}

export interface EmbarazoRequestDTO {
  emailUsuario: string;
  fechaInicio: string;
  sintomas: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmbarazoService {
  private baseUrl = environment.apiUrlHabitos;

  constructor(private http: HttpClient) {}

  registrarEmbarazo(data: EmbarazoRequestDTO): Observable<string> {
    return this.http.post(`${this.baseUrl}/embarazo/registrar`, data, {
      responseType: 'text',
    });
  }

  obtenerUltimoEmbarazo(email: string): Observable<EmbarazoDTO> {
    return this.http.get<EmbarazoDTO>(`${this.baseUrl}/embarazo/usuario/${email}`);
  }
}