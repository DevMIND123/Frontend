import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FaqItem } from '../models/faq.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private apiUrl = `${environment.gestionContenidoUrl}/api/faqs`;

  constructor(private http: HttpClient) { }

  getFaqs(): Observable<FaqItem[]> {
    return this.http.get<FaqItem[]>(this.apiUrl);
  }
}
