import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else if (error.status === 0) {
      // Network error
      errorMessage = 'No se puede conectar al servidor. Por favor, verifique su conexión e intente nuevamente.';
    } else if (error.status === 401) {
      errorMessage = 'No autorizado. Por favor, inicie sesión nuevamente.';
    } else if (error.status === 403) {
      errorMessage = 'No tiene permisos para realizar esta acción.';
    } else if (error.status === 404) {
      errorMessage = 'Recurso no encontrado.';
    } else {
      // Server-side error
      errorMessage = `Error del servidor: ${error.status}. ${error.message}`;
    }

    return throwError(() => errorMessage);
  }
}