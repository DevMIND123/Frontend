export class JwtAuthenticationResponse {
    constructor(public token: string, public user: string, public role: string) { }
}
