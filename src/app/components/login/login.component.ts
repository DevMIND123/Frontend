import { Component, OnInit } from '@angular/core';
import { LoginDto } from '../../dto/login-dto';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'] // 🔧 CORREGIDO: era styleUrl
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
  ) { }

  ngOnInit(): void {
    this.auth.logout(); // limpiar cualquier sesión anterior
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    this.isLoading = true;
    this.errorMessage = null;

    console.log('DTO:', this.loginDto);

    this.auth.login(this.loginDto).subscribe({
      next: jwt => {
        console.log('Login exitoso. JWT:', jwt);
        localStorage.setItem('token', jwt.token); // ✅ Guarda token

        // Si necesitas obtener info adicional del usuario, puedes mantener esto
        this.usuarioService.obtenerUsuario(jwt.email, jwt.rol).subscribe({
          next: usuario => {
            console.log('Rol:', jwt.rol);
            this.usuarioService.setRol(jwt.rol);

            // ✅ Redirección limpia y clara
            this.redirigirPorRol(jwt.rol);
          },
          error: err => {
            console.error('Error al obtener usuario por email:', err);
            this.isLoading = false;
            this.errorMessage = 'No se pudo obtener información del usuario.';
          }
        });
      },
      error: err => {
        console.error('Error de login:', err);
        this.errorMessage = 'Usuario o contraseña incorrectos';
        this.isLoading = false;
      }
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
