import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { PromocionService } from '../../../../../services/promociones.service';
import { Promocion } from '../../../../../models/promociones';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-promociones',
  templateUrl: './promociones.component.html',
  styleUrls: ['./promociones.component.css'],
  imports: [CommonModule]
})
export class PromocionesComponent implements OnInit {
  promociones: Promocion[] = [];

  constructor(private svc: PromocionService) {}

  ngOnInit() {
    this.cargarPromociones();
  }

  private calcularActivo(p: Promocion): boolean {
    const hoy = new Date();
    const inicio = new Date(p.fechaInicio);
    const fin    = new Date(p.fechaFin);
    return hoy >= inicio && hoy <= fin;
  }

  private procesarLista(list: Promocion[]): Promocion[] {
    return list.map(p => ({
      ...p,
      // convertimos fecha y calculamos el estado
      fechaInicio: p.fechaInicio,
      fechaFin: p.fechaFin,
      isActive: this.calcularActivo(p)
    }));
  }

  cargarPromociones() {
    this.svc.listarTodas().subscribe(list => {
      this.promociones = this.procesarLista(list);
    });
  }

  crearPromocion() {
    Swal.fire({
      title: 'Nueva Promoción',
      html: `
        <input id="nombre" class="swal2-input" placeholder="Nombre">
        <textarea id="descripcion" class="swal2-textarea" placeholder="Descripción"></textarea>
        <input id="porcentaje" type="number" class="swal2-input" placeholder="% Descuento">
        <input id="inicio" type="date" class="swal2-input">
        <input id="fin" type="date" class="swal2-input">
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      preConfirm: () => {
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value.trim();
        const descripcion = (document.getElementById('descripcion') as HTMLTextAreaElement).value.trim();
        const porcentaje = parseFloat((document.getElementById('porcentaje') as HTMLInputElement).value);
        const inicio = (document.getElementById('inicio') as HTMLInputElement).value;
        const fin = (document.getElementById('fin') as HTMLInputElement).value;

        if (!nombre || !descripcion || isNaN(porcentaje) || !inicio || !fin) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return;
        }
        return { nombre, descripcion, porcentajeDescuento: porcentaje, fechaInicio: inicio, fechaFin: fin };
      }
    }).then(res => {
      if (res.isConfirmed && res.value) {
        this.svc.crear(res.value as Promocion).subscribe({
          next: promoCreada => {
            // procesamos la promoción creada y la agregamos
            const p = this.procesarLista([promoCreada])[0];
            this.promociones.push(p);
            Swal.fire('¡Creada!', 'Promoción creada correctamente.', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo crear la promoción.', 'error')
        });
      }
    });
  }

  editarPromocion(p: Promocion) {
    Swal.fire({
      title: 'Editar Promoción',
      html: `
        <input id="nombre" class="swal2-input" value="${p.nombre}">
        <textarea id="descripcion" class="swal2-textarea">${p.descripcion}</textarea>
        <input id="porcentaje" type="number" class="swal2-input" value="${p.porcentajeDescuento}">
        <input id="inicio" type="date" class="swal2-input" value="${p.fechaInicio}">
        <input id="fin" type="date" class="swal2-input" value="${p.fechaFin}">
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: () => {
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value.trim();
        const descripcion = (document.getElementById('descripcion') as HTMLTextAreaElement).value.trim();
        const porcentaje = parseFloat((document.getElementById('porcentaje') as HTMLInputElement).value);
        const inicio = (document.getElementById('inicio') as HTMLInputElement).value;
        const fin = (document.getElementById('fin') as HTMLInputElement).value;

        if (!nombre || !descripcion || isNaN(porcentaje) || !inicio || !fin) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return;
        }
        return { nombre, descripcion, porcentajeDescuento: porcentaje, fechaInicio: inicio, fechaFin: fin };
      }
    }).then(res => {
      if (res.isConfirmed && res.value) {
        this.svc.editar(p.id!, res.value as Promocion).subscribe({
          next: promoEditada => {
            // Reemplazamos la promoción en el array procesándolo
            const procesada = this.procesarLista([promoEditada])[0];
            const idx = this.promociones.findIndex(x => x.id === procesada.id);
            if (idx > -1) this.promociones[idx] = procesada;
            Swal.fire('¡Actualizada!', 'Promoción actualizada.', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo actualizar.', 'error')
        });
      }
    });
  }

  verDetalle(p: Promocion) {
    Swal.fire({
      title: p.nombre,
      html: `
        <p><strong>Descripción:</strong> ${p.descripcion}</p>
        <p><strong>Descuento:</strong> ${p.porcentajeDescuento}%</p>
        <p><strong>Desde:</strong> ${new Date(p.fechaInicio).toLocaleDateString()}</p>
        <p><strong>Hasta:</strong> ${new Date(p.fechaFin).toLocaleDateString()}</p>
        <p><strong>Estado:</strong> ${this.calcularActivo(p) ? 'Activa' : 'Inactiva'}</p>
      `,
      icon: 'info'
    });
  }
}

