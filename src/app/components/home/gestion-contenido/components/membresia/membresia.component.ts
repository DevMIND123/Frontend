import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { MembresiaService } from '../../../../../services/membresia.service';
import { PrecioMembresia } from '../../../../../models/membresia';

@Component({
  selector: 'app-membresia',
  templateUrl: './membresia.component.html',
  styleUrls: ['./membresia.component.css'],
  imports: [CommonModule]
})
export class MembresiasComponent implements OnInit {
  membresias: PrecioMembresia[] = [];

  constructor(private membresiaService: MembresiaService) {}

  ngOnInit() {
    this.cargarMembresias();
  }

  cargarMembresias() {
    this.membresiaService.getAll().subscribe(data => this.membresias = data);
  }

  crearMembresia() {
    Swal.fire({
      title: 'Nueva Membresía',
      html: `
        <input type="text" id="tipo" class="swal2-input" placeholder="Tipo de Membresía">
        <input type="number" id="precio" class="swal2-input" placeholder="Precio">
        <textarea id="descripcion" class="swal2-textarea" placeholder="Descripción"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      focusConfirm: false,
      preConfirm: () => {
        const tipo = (document.getElementById('tipo') as HTMLInputElement).value.trim();
        const precio = parseFloat((document.getElementById('precio') as HTMLInputElement).value);
        const descripcion = (document.getElementById('descripcion') as HTMLTextAreaElement).value.trim();
  
        if (!tipo || isNaN(precio) || !descripcion) {
          Swal.showValidationMessage('Todos los campos son obligatorios y válidos.');
          return;
        }
  
        return { tipo, precio, descripcion };
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const nuevaMembresia: PrecioMembresia = {
          tipo: result.value.tipo,
          precio: result.value.precio,
          descripcion: result.value.descripcion
        };
  
        this.membresiaService.create(nuevaMembresia).subscribe({
          next: () => {
            this.cargarMembresias();
            Swal.fire('Éxito', 'Membresía creada correctamente.', 'success');
          },
          error: () => {
            Swal.fire('Error', 'No se pudo crear la membresía.', 'error');
          }
        });
      }
    });
  }
  
  

  verDetalle(m: PrecioMembresia) {
    Swal.fire({
      title: m.tipo,
      html: `
        <p><strong>Precio:</strong> ${m.precio}</p>
        <p><strong>Descripción:</strong> ${m.descripcion}</p>
      `,
      icon: 'info'
    });
  }
  

  editarMembresia(m: PrecioMembresia) {
    Swal.fire('Editar', `Editar membresía ${m.tipo}`, 'warning');
  }

  eliminarMembresia(id?: number) {
    if (id === undefined) return;
  
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la membresía.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
    }).then(result => {
      if (result.isConfirmed) {
        this.membresiaService.delete(id).subscribe(() => {
          this.cargarMembresias();
          Swal.fire('Eliminado', 'La membresía ha sido eliminada.', 'success');
        });
      }
    });
  }  
}
