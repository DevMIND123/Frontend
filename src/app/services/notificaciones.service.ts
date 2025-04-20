import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/* ✅ Usamos notificationUrl directamente */
const NOTIF_URL = environment.notificationUrl;

@Injectable({ providedIn: 'root' })
export class NotificacionesService {

    constructor(private readonly http: HttpClient) { }

    getNotificacionesPorUsuario(idUsuario: number): Observable<any[]> {
        return this.http.get<any[]>(`${NOTIF_URL}/notificaciones/${idUsuario}`);
    }

    marcarComoLeida(idNotificacion: number): Observable<void> {
        return this.http.patch<void>(`${NOTIF_URL}/notificaciones/${idNotificacion}/leida`, {});
    }
}
