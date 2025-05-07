
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface FaqDTO {
  id?: number;
  pregunta: string;
  respuesta: string;
  visible: boolean;
  createdAt?: string;
}
@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private apiUrl = `${environment.apiUrl}/faqs`;

  constructor(private http: HttpClient) { }

  getFaqs(): Observable<any> {
    return this.http.get(this.apiUrl, {
      withCredentials: false // Importante: debe ser false si no usas cookies/sesión
    });
  }
  createFaq(faq: Omit<FaqDTO, 'id' | 'createdAt'>): Observable<FaqDTO> {
    return this.http.post<FaqDTO>(this.apiUrl, faq, {
      withCredentials: false
    });
  }

  // Actualizar FAQ existente
  updateFaq(id: number, faq: Partial<FaqDTO>): Observable<FaqDTO> {
    return this.http.put<FaqDTO>(`${this.apiUrl}/${id}`, faq, {
      withCredentials: false
    });
  }

  // Eliminar FAQ
  deleteFaq(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      withCredentials: false
    });
  }
}
