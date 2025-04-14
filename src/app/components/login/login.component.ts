import { Component, OnInit } from '@angular/core';
import { LoginDto } from '../../dto/login-dto';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service'; // Asegúrate que este servicio esté creado e importado

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  loginDto: LoginDto = new LoginDto("", "");
  showPassword: boolean = false;
  rememberMe: boolean = false;
  errorMessage: string | null = null;
  isLoading: boolean = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  constructor(
    private auth: AuthService,
    private router: Router,
    private usuarioService: UsuarioService
  ) { }

  ngOnInit(): void {
    this.auth.logout();
  }

  login() {
    this.isLoading = true;
    this.errorMessage = null;
    console.log("DTO:", this.loginDto);
    this.auth.login(this.loginDto).subscribe({
      next: jwt => {
        console.log("Login exitoso. JWT:", jwt);
        console.log("JWT.user:", jwt.email);
        this.usuarioService.obtenerUsuario(jwt.email).subscribe({
          next: usuario => {
            this.usuarioService.setRol(jwt.rol);
            console.log("Rol del usuario:", jwt.rol);
            switch (jwt.rol) {
              case 'ADMINISTRADOR':
                this.router.navigate(['/admin/dashboard']);
                break;
              case 'CLIENTE':
                this.router.navigate(['/login']);
                break;
              case 'EMPRESA':
                this.router.navigate(['/empresa/panel']);
                break;
              case 'MARKETING':
                this.router.navigate(['/marketing/estrategias']);
                break;
              case 'SOPORTE':
                this.router.navigate(['/soporte/tickets']);
                break;
              default:
                console.warn("Rol no reconocido:", jwt.rol);
                this.isLoading = false;
                break;
            }
          },
          error: err => {
            console.error("Error al obtener usuario por email:", err);
            this.isLoading = false;
          }
        });
      },
      error: err => {
        console.error("Error de login:", err);
        this.isLoading = false;
      }
    });
  }
}
