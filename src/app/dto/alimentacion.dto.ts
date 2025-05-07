import { RetoAlimentacionDTO } from './reto-alimentacion.dto';
import { RegistroComidaDTO } from './registro-comida.dto';


export interface AlimentacionDTO {
  id?: number;
  emailUsuario: string;
  objetivo?: string; // ahora es opcional si ya no lo usas
  peso: number;
  altura: number;
  imc?: number; // el backend puede calcularlo, entonces puede ser opcional en el frontend
  caloriasObjetivoDiarias?: number;
  caloriasConsumidasHoy?: number;
  fechaInicio: string;
  fechaFin: string;
  retosAsignados?: RetoAlimentacionDTO[];
  comidasRegistradas?: RegistroComidaDTO[];
}
