import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';

interface FaqItem {
  pregunta: string;
  respuesta: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css'],
  imports: [
    NavbarComponent,
    CommonModule,
    FooterComponent
  ],
})


export class FaqComponent {
  constructor(private router: Router) {}

  irASoporte() {
    this.router.navigate(['/home/soporte']);
  }

  faqs: FaqItem[] = [
    {
      pregunta: '¿Cómo puedo registrarme en la plataforma?',
      respuesta: 'Para registrarte, haz clic en el botón "Registrarse" en la parte superior derecha y completa el formulario.'
    },
    {
      pregunta: '¿Puedo cambiar mi contraseña?',
      respuesta: 'Sí. Ve a tu perfil, haz clic en "Configuración" y luego en "Cambiar contraseña".'
    },
    {
      pregunta: '¿Cómo contacto al soporte técnico?',
      respuesta: 'Puedes escribirnos a soporte@tuempresa.com y responderemos en menos de 24 horas.'
    },
    {
      pregunta: '¿Cómo puedo registrarme en la plataforma?',
      respuesta: 'Para registrarte, haz clic en el botón "Registrarse" en la parte superior derecha y completa el formulario.'
    },
    {
      pregunta: '¿Puedo cambiar mi contraseña?',
      respuesta: 'Sí. Ve a tu perfil, haz clic en "Configuración" y luego en "Cambiar contraseña".'
    },
    {
      pregunta: '¿Cómo contacto al soporte técnico?',
      respuesta: 'Puedes escribirnos a soporte@tuempresa.com y responderemos en menos de 24 horas.'
    },
    {
      pregunta: '¿Cómo puedo registrarme en la plataforma?',
      respuesta: 'Para registrarte, haz clic en el botón "Registrarse" en la parte superior derecha y completa el formulario.'
    },
    {
      pregunta: '¿Puedo cambiar mi contraseña?',
      respuesta: 'Sí. Ve a tu perfil, haz clic en "Configuración" y luego en "Cambiar contraseña".'
    },
    {
      pregunta: '¿Cómo contacto al soporte técnico?',
      respuesta: 'Puedes escribirnos a soporte@tuempresa.com y responderemos en menos de 24 horas.'
    }
  ];
}


