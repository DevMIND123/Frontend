export interface CicloMenstrualDTO {
  id?: number;
  emailUsuario: string;
  fechaInicio: string;         // formato ISO: '2025-05-04'
  duracionCiclo: number;       // por ejemplo: 28
  duracionMenstruacion: number;// por ejemplo: 5
  fechaProximaMenstruacion?: string;
  fechaOvulacion?: string;
}
