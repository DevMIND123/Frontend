import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EmbarazoService, EmbarazoRequestDTO } from './embarazo.service';
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
    httpMock.verify();
  });

  it('registrar embarazo con datos ingresados por la usuaria', () => {
    const email = localStorage.getItem('emailUsuario') || 'default@email.com';
    const fechaInicio = new Date().toISOString().split('T')[0]; // hoy por defecto
    const sintomas = 'Fatiga, náuseas';

    const requestData: EmbarazoRequestDTO = {
      emailUsuario: email,
      fechaInicio,
      sintomas
    };

    service.registrarEmbarazo(requestData).subscribe(response => {
      expect(response).toEqual('Embarazo registrado correctamente.');
    });

    const req = httpMock.expectOne(`${environment.apiUrlHabitos}/embarazo/registrar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(requestData);

    req.flush('Embarazo registrado correctamente.');
  });
});
