import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmbarazoService } from './embarazo.service';
import { environment } from '../../environments/environment';

describe('EmbarazoService', () => {
  let service: EmbarazoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EmbarazoService]
    });

    service = TestBed.inject(EmbarazoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifica que no haya peticiones pendientes
  });

  it('debería enviar POST correctamente a /embarazo/registrar con datos del formulario', () => {
    // Datos simulados del formulario
    const formData = {
      emailUsuario: 'ejemplo@correo.com',
      fechaInicio: '2025-04-15',
      sintomas: 'Náuseas y sensibilidad'
    };

    service.registrarEmbarazo(formData).subscribe(response => {
      expect(response).toEqual('Embarazo registrado correctamente.');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/embarazo/registrar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(formData);

    req.flush('Embarazo registrado correctamente.');
  });
});
