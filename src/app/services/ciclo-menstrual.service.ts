import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { CicloMenstrualDTO } from '../dto/ciclo-menstrual.dto';
import { EventoMenstrualDTO } from '../dto/evento-menstrual.dto';
import { SintomaMenstrualDTO } from '../dto/sintoma-menstrual.dto';

@Injectable({
  providedIn: 'root'
})
export class CicloMenstrualService {
  private baseUrl = environment.retoUrl;
  private jsonHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) {}

  // ✅ CICLOS MENSTRUALES
  registrarCiclo(dto: CicloMenstrualDTO, token: string): Observable<CicloMenstrualDTO> {
    return this.http.post<CicloMenstrualDTO>(`${this.baseUrl}/ciclos`, dto, {
      headers: this.jsonHeaders.set('Authorization', token),
    });
  }

  obtenerCiclosPorUsuario(email: string): Observable<CicloMenstrualDTO[]> {
    return this.http.get<CicloMenstrualDTO[]>(`${this.baseUrl}/ciclos/${email}`);
  }

  // ✅ EVENTOS MENSTRUALES
  registrarEvento(dto: EventoMenstrualDTO): Observable<EventoMenstrualDTO> {
    return this.http.post<EventoMenstrualDTO>(`${this.baseUrl}/evento-menstrual/registrar`, dto, {
      headers: this.jsonHeaders,
    });
  }

  obtenerEventosPorUsuario(email: string): Observable<EventoMenstrualDTO[]> {
    return this.http.get<EventoMenstrualDTO[]>(`${this.baseUrl}/evento-menstrual/usuario/${email}`);
  }

  obtenerEventosPorRango(email: string, inicio: string, fin: string): Observable<EventoMenstrualDTO[]> {
    return this.http.get<EventoMenstrualDTO[]>(
      `${this.baseUrl}/evento-menstrual/rango/${email}?inicio=${inicio}&fin=${fin}`
    );
  }

  // ✅ SÍNTOMAS MENSTRUALES
  registrarSintoma(dto: SintomaMenstrualDTO): Observable<SintomaMenstrualDTO> {
    return this.http.post<SintomaMenstrualDTO>(`${this.baseUrl}/sintoma-menstrual/registrar`, dto, {
      headers: this.jsonHeaders,
    });
  }

  obtenerSintomasPorUsuario(email: string): Observable<SintomaMenstrualDTO[]> {
    return this.http.get<SintomaMenstrualDTO[]>(`${this.baseUrl}/sintoma-menstrual/usuario/${email}`);
  }

  obtenerSintomasPorRango(email: string, inicio: string, fin: string): Observable<SintomaMenstrualDTO[]> {
    return this.http.get<SintomaMenstrualDTO[]>(
      `${this.baseUrl}/sintoma-menstrual/rango/${email}?inicio=${inicio}&fin=${fin}`
    );
  }
}
