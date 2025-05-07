export interface Promocion {
    id?: number;
    nombre: string;
    descripcion: string;
    porcentajeDescuento: number;
    fechaInicio: string;   // ISO date string
    fechaFin: string;      // ISO date string
    isActive?: boolean;    // opcional
}  