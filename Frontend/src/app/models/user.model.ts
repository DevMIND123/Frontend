export interface User {
  nombre: string;
  email: string;
  password: string;
  rol: 'CLIENTE' | 'EMPRESA';
}

export interface Company {
  tipoDocumento: {
    id: string;
  };
  numeroDocumento: string;
  nombreEmpresa: string;
  nombreRepresentante: string;
  email: string;
  password: string;
}