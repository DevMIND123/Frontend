// filepath: ../dto/jwt-authentication-response.ts
export interface JwtAuthenticationResponse {
    token: string;
    email: string;
    rol: string;
    userId?: string; // Agrega esta propiedad si es necesaria
}