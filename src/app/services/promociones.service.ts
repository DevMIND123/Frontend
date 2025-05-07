import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Promocion } from '../models/promociones';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
// !! Update URL for deployment !!
export class PromocionService {
  private baseUrl = `http://localhost:8091/api/promociones`;

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  listarTodas(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(this.baseUrl, { headers: this.authHeaders() });
  }

  crear(p: Promocion): Observable<Promocion> {
    return this.http.post<Promocion>(this.baseUrl, p, { headers: this.authHeaders() });
  }

  editar(id: number, p: Promocion): Observable<Promocion> {
    return this.http.put<Promocion>(`${this.baseUrl}/${id}`, p, { headers: this.authHeaders() });
  }
}
