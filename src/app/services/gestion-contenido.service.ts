import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Bono {
    id: number;
    nombre: string;
    valor: number;
    fechaExpiracion: Date | string;
    active: boolean; // <-- asegúrate de tener esto
}
// !! Update URL for deployment !!
@Injectable({ providedIn: 'root' })
export class GestionContenidoService {
  // URL específica para bonos, evitando colisiones
    private bonosUrl = `${environment.gestionContenidoUrl}/api/bonos`;

    constructor(private http: HttpClient) {}

    getBonos(): Observable<Bono[]> {
        return this.http.get<Bono[]>(this.bonosUrl);
    }

    createBono(bono: Partial<Bono>): Observable<Bono> {
        return this.http.post<Bono>(this.bonosUrl, bono);
    }

    editarBono(id: number, bono: Bono): Observable<Bono> {
        return this.http.put<Bono>(`${this.bonosUrl}/${id}`, bono);
    }    

    eliminarBono(id: number): Observable<void> {
        return this.http.delete<void>(`${this.bonosUrl}/${id}`);
    }    
}