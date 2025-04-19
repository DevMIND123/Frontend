// notificaciones.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
    private baseUrl = 'http://localhost:5001'; // URL del backend de notificaciones

    constructor(private http: HttpClient) { }

    getNotificacionesPorUsuario(idUsuario: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/notificaciones/${idUsuario}`);
    }
}
