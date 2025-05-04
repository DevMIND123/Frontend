import { RetoAlimentacionDTO } from './reto-alimentacion.dto';
import { RegistroComidaDTO } from './registro-comida.dto';


export interface AlimentacionDTO {
  id?: number;
  emailUsuario: string;
  objetivo: string;
  caloriasObjetivoDiarias: number;
  caloriasConsumidasHoy?: number;
  fechaInicio: string;
  fechaFin: string;
  retosAsignados?: RetoAlimentacionDTO[];
  comidasRegistradas?: RegistroComidaDTO[];
}
