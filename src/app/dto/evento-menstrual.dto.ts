export type EventoTipo =
  | 'INICIO_REGLA'
  | 'FIN_REGLA'
  | 'OVULACION'
  | 'SANGRADO_INTERMENSTRUAL'
  | 'DOLOR_INTENSO'
  | 'CAMBIO_ANIMO_BRUSCO'
  | 'FLUJO_ANORMAL'
  | 'FIEBRE'
  | 'OTRO';

export interface EventoMenstrualDTO {
  id?: number;
  tipo: EventoTipo;
  fecha: string;           // formato ISO
  observaciones?: string;
  emailUsuario: string;
}
