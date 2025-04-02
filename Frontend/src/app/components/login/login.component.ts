import { Component } from '@angular/core';
import { UsuarioService } from '../../services/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  nombre: string = '';
  email: string = '';
  password: string = '';

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  registrar() {
    const nuevoUsuario = {
      nombre: this.nombre,
      email: this.email,
      password: this.password,
      rol: 'CLIENTE' // lo convierte al enum Rol.CLIENTE automáticamente
    };

    this.usuarioService.registrarUsuario(nuevoUsuario).subscribe({
      next: (res) => {
        console.log('✅ Usuario registrado:', res);
        alert('¡Te has registrado exitosamente!');
        this.router.navigate(['/home']); // 👈 redirección automática
      },
      error: (err) => {
        console.error('❌ Error al registrar:', err);
        alert('El correo ya está en uso o hubo un problema.');
      }
    });
  }
}
