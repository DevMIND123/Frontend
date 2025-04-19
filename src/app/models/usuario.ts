// Clase general para instanciar usuarios (usada en formularios o creación)
export class Usuario {
    constructor(
        public id?: string,
        public nombre?: string,
        public email?: string,
        public password?: string,
        public rol?: string,
        public fechaRegistro?: Date,
        public estadoCuenta?: string
    ) { }
}

// DTO para actualizar perfil (por email)
export interface UsuarioUpdateDTO {
    nombre: string;
    email: string;
    departamento: string;
    especialidad: string;
}

// DTO para cambio de contraseña
export interface PasswordChangeDTO {
    email: string;
    nuevaPassword: string;
}
