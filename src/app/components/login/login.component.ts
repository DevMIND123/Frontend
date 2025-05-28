import { Component, OnInit } from '@angular/core';
import { LoginDto } from '../../dto/login-dto';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { safeLocalStorageSet } from '../../shared/utils/utils';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginDto: LoginDto = new LoginDto('', '');
  showPassword: boolean = false;
  rememberMe: boolean = false;
  errorMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.auth.logout(); // Limpiar sesión anterior
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.auth.login(this.loginDto).subscribe({
      next: (jwt: any) => {
        console.log('Login exitoso. JWT:', jwt);
        safeLocalStorageSet('token', jwt.token); // ✅ Guarda token

        this.usuarioService.obtenerIdPorEmail(jwt.email, jwt.rol).subscribe({
          next: (usuario: any) => {
            console.log('Rol:', jwt.rol);
            this.usuarioService.setRol(jwt.rol);

            this.redirigirPorRol(jwt.rol);
          },
          error: (err: any) => {
            console.error('Error al obtener usuario por email:', err);
            this.errorMessage = 'No se pudo obtener información del usuario.';
            this.isLoading = false;
          },
        });
      },
      error: (err: any) => {
        console.error('Error de login:', err);
        this.errorMessage = 'Usuario o contraseña incorrectos';
        this.isLoading = false;
      },
    });
  }

  private redirigirPorRol(rol: string): void {
    switch (rol) {
      case 'ADMINISTRADOR':
        this.router.navigate(['/home/superadmin']);
        break;
      case 'CLIENTE':
        this.router.navigate(['/home/client']);
        break;
      case 'EMPRESA':
        this.router.navigate(['/home/empresa']);
        break;
      case 'MARKETING':
        this.router.navigate(['/home/marketing']);
        break;
      case 'SOPORTE':
        this.router.navigate(['/home/soporte']);
        break;
      default:
        console.warn('Rol no reconocido:', rol);
        this.router.navigate(['/landing-page']);
        break;
    }

    this.isLoading = false;
  }
}
