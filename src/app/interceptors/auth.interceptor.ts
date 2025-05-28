import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private readonly auth: AuthService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.auth.token();

    /* Agregamos el header sólo si hay JWT */
    const authReq = token
      ? request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`)
      })
      : request;

    return next.handle(authReq);
  }
}
//     email: string;