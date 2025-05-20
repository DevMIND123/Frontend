import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AlimentacionDTO } from '../dto/alimentacion.dto';
import { RegistroComidaDTO } from '../dto/registro-comida.dto';
import { RetoAlimentacionDTO } from '../dto/reto-alimentacion.dto';

@Injectable({
  providedIn: 'root'
})
export class RetoComidaService {
  private baseUrl = environment.apiUrlHabitos;
  private jsonHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor(private http: HttpClient) { }

  // ========= ALIMENTACIÓN =========

  crearAlimentacion(dto: AlimentacionDTO): Observable<AlimentacionDTO> {
    return this.http.post<AlimentacionDTO>(
      `${this.baseUrl}/alimentacion/crear`,
      dto,
      { headers: this.jsonHeaders }
    );
  }

  obtenerAlimentacionPorEmail(email: string): Observable<AlimentacionDTO[]> {
    return this.http.get<AlimentacionDTO[]>(`${this.baseUrl}/alimentacion/por-email/${email}`);
  }


  // ========= RETOS DE ALIMENTACIÓN =========

  asignarReto(alimentacionId: number, dto: RetoAlimentacionDTO): Observable<RetoAlimentacionDTO> {
    return this.http.post<RetoAlimentacionDTO>(
      `${this.baseUrl}/reto/asignar/${alimentacionId}`,
      dto,
      { headers: this.jsonHeaders }
    );
  }

  obtenerRetosPorAlimentacion(alimentacionId: number): Observable<RetoAlimentacionDTO[]> {
    return this.http.get<RetoAlimentacionDTO[]>(`${this.baseUrl}/reto/alimentacion/${alimentacionId}`);
  }

  completarReto(retoId: number): Observable<RetoAlimentacionDTO> {
    return this.http.patch<RetoAlimentacionDTO>(`${this.baseUrl}/reto/completar/${retoId}`, null);
  }

  // ========= REGISTRO DE COMIDAS =========

  registrarComida(alimentacionId: number, dto: RegistroComidaDTO): Observable<RegistroComidaDTO> {
    return this.http.post<RegistroComidaDTO>(
      `${this.baseUrl}/comida/registrar/${alimentacionId}`,
      dto,
      { headers: this.jsonHeaders }
    );
  }

  obtenerComidasPorAlimentacion(alimentacionId: number): Observable<RegistroComidaDTO[]> {
    return this.http.get<RegistroComidaDTO[]>(`${this.baseUrl}/comida/alimentacion/${alimentacionId}`);
  }
}
