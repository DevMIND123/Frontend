import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const NOTIF_URL = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  constructor(private readonly http: HttpClient) {}

  getNotificacionesPorUsuario(token: any): Observable<any[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<any[]>(`${NOTIF_URL}/notificaciones`, { headers });
  }

  marcarComoLeida(idNotificacion: number): Observable<void> {
    return this.http.patch<void>(
      `${NOTIF_URL}/notificaciones/${idNotificacion}/leida`,
      {}
    );
  }
}
