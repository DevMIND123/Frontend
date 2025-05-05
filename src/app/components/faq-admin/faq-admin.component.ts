import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../shared/footer/footer.component';
import { FormsModule } from '@angular/forms';

interface FaqItem {
  pregunta: string;
  respuesta: string;
}

@Component({
  selector: 'app-faq-admin',
  standalone: true,
  templateUrl: './faq-admin.component.html',
  styleUrls: ['./faq-admin.component.css'],
  imports: [
    NavbarComponent,
    CommonModule,
    FooterComponent,
    FormsModule
  ],
})

export class FaqAdminComponent {
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

  nuevaPregunta: string = '';
  nuevaRespuesta: string = '';

  editarIndex: number | null = null;

  agregarFaq() {
    if (this.nuevaPregunta && this.nuevaRespuesta) {
      this.faqs.push({ pregunta: this.nuevaPregunta, respuesta: this.nuevaRespuesta });
      this.nuevaPregunta = '';
      this.nuevaRespuesta = '';
    }
  }

  eliminarFaq(index: number) {
    this.faqs.splice(index, 1);
  }

  editarFaq(index: number) {
    this.editarIndex = index;
    this.nuevaPregunta = this.faqs[index].pregunta;
    this.nuevaRespuesta = this.faqs[index].respuesta;
  }

  guardarEdicion() {
    if (this.editarIndex !== null) {
      this.faqs[this.editarIndex] = {
        pregunta: this.nuevaPregunta,
        respuesta: this.nuevaRespuesta
      };
      this.editarIndex = null;
      this.nuevaPregunta = '';
      this.nuevaRespuesta = '';
    }
  }

  cancelarEdicion() {
    this.editarIndex = null;
    this.nuevaPregunta = '';
    this.nuevaRespuesta = '';
  }
}
