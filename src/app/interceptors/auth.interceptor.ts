import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

// https://stackoverflow.com/questions/52468071/how-to-send-jwt-token-as-authorization-header-in-angular-6
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private auth: AuthService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let token = this.auth.token();

    if (token == null) {
      return next.handle(request);
    } else {
      return next.handle(request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`),
      }));
    }
  }
}
