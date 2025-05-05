import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../shared/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { FaqService } from '../../services/faq.service';

interface FaqItem {
  id?: number;
  pregunta: string;
  respuesta: string;
  visible: boolean;
  createdAt?: string;
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
export class FaqAdminComponent implements OnInit {
  faqs: FaqItem[] = [];
  nuevaPregunta: string = '';
  nuevaRespuesta: string = '';
  nuevaVisibilidad: boolean = true;
  editarIndex: number | null = null;
  estaCargando: boolean = false;
  mensajeError: string | null = null;

  constructor(private faqService: FaqService) {}

  ngOnInit(): void {
    this.cargarFAQs();
  }

  cargarFAQs(): void {
    this.estaCargando = true;
    this.faqService.getFaqs().subscribe({
      next: (data) => {
        this.faqs = data;
        this.estaCargando = false;
      },
      error: (err) => {
        console.error('Error al cargar FAQs', err);
        this.mensajeError = 'Error al cargar las preguntas frecuentes';
        this.estaCargando = false;
      }
    });
  }

  agregarFaq(): void {
    if (this.esFormularioValido()) {
      const nuevaFaq: Omit<FaqItem, 'id' | 'createdAt'> = {
        pregunta: this.nuevaPregunta,
        respuesta: this.nuevaRespuesta,
        visible: true
      };


      this.faqService.createFaq(nuevaFaq).subscribe({
        next: (faqCreada) => {
          this.faqs.push(faqCreada);
          this.resetearFormulario();
          this.mensajeError = null;
        },
        error: (err) => {
          console.error('Error al crear FAQ', err);
          this.mensajeError = 'Error al crear la nueva pregunta';
        }
      });
    }
  }

  eliminarFaq(id: number, index: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta pregunta?')) {
      this.faqService.deleteFaq(id).subscribe({
        next: () => {
          this.faqs.splice(index, 1);
          this.mensajeError = null;
        },
        error: (err) => {
          console.error('Error al eliminar FAQ', err);
          this.mensajeError = 'Error al eliminar la pregunta';
        }
      });
    }
  }

  editarFaq(index: number): void {
    this.editarIndex = index;
    const faq = this.faqs[index];
    this.nuevaPregunta = faq.pregunta;
    this.nuevaRespuesta = faq.respuesta;
    this.nuevaVisibilidad = true;
  }

  guardarEdicion(): void {
    if (this.editarIndex !== null) {
      const id = this.faqs[this.editarIndex].id;
      if (id == null) {
        this.mensajeError = 'ID inválido para actualizar';
        return;
      }

      const cambios: Partial<FaqItem> = {
        pregunta: this.nuevaPregunta,
        respuesta: this.nuevaRespuesta,
        visible: this.nuevaVisibilidad
      };

      this.faqService.updateFaq(id, cambios).subscribe({
        next: (faqActualizada) => {
          this.faqs[this.editarIndex!] = faqActualizada;
          this.cancelarEdicion();
          this.mensajeError = null;
        },
        error: (err) => {
          console.error('Error al actualizar FAQ', err);
          this.mensajeError = 'Error al actualizar la pregunta';
        }
      });
    }
  }

  cancelarEdicion(): void {
    this.editarIndex = null;
    this.resetearFormulario();
  }




  private resetearFormulario(): void {
    this.nuevaPregunta = '';
    this.nuevaRespuesta = '';
    this.nuevaVisibilidad = true;
  }

  private esFormularioValido(): boolean {
    return this.nuevaPregunta.trim() !== '' && this.nuevaRespuesta.trim() !== '';
  }
}
