export class Empresa {
    constructor(
        public id?: string, // ID único de la empresa (opcional)
        public nombreEmpresa?: string, // Nombre de la empresa
        public nombreRepresentante?: string, // Nombre del representante 
        public email?: string, // Correo electrónico
        public password?: string, // Contraseña
        public telefono?: string, // Teléfono de contacto
        public direccion?: string, // Dirección de la empresa
        public nit?: string, // Número de identificación tributaria
        public fechaRegistro?: Date, // Fecha de registro
        public estadoCuenta?: string ,// Estado de la cuenta (ejemplo: ACTIVO, INACTIVO)
        public rol?: string
    ) { }
}