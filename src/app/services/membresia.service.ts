import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PrecioMembresia } from '../models/membresia';

@Injectable({
  providedIn: 'root'
})
export class MembresiaService {

  private baseUrl = 'http://localhost:8091/api/precios';

  constructor(private http: HttpClient) {}

  getAll(): Observable<PrecioMembresia[]> {
    return this.http.get<PrecioMembresia[]>(this.baseUrl);
  }

  create(membresia: PrecioMembresia): Observable<PrecioMembresia> {
    return this.http.post<PrecioMembresia>(this.baseUrl, membresia);
  }

  update(id: number, membresia: PrecioMembresia): Observable<PrecioMembresia> {
    return this.http.put<PrecioMembresia>(`${this.baseUrl}/${id}`, membresia);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getById(id: number): Observable<PrecioMembresia> {
    return this.http.get<PrecioMembresia>(`${this.baseUrl}/${id}`);
  }
}
