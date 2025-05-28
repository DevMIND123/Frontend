export type SintomaTipo =
  | 'COLICOS'
  | 'MIGRAÑA'
  | 'DOLOR_PELVICO'
  | 'ACNE'
  | 'CAMBIO_ANIMO'
  | 'FATIGA'
  | 'ANSIEDAD'
  | 'DEPRESION'
  | 'NAUSEAS'
  | 'PECHOS_SENSIBLES'
  | 'INSOMNIO'
  | 'HAMBRE_EXCESIVA'
  | 'RETENCION_LIQUIDOS'
  | 'OTRO';

export interface SintomaMenstrualDTO {
  id?: number;
  tipo: SintomaTipo;
  fecha: string;            // formato ISO
  intensidad?: string;      // "baja" | "media" | "alta"
  emailUsuario: string;
}
