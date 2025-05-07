import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { Bono, GestionContenidoService } from '../../../services/gestion-contenido.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { MembresiasComponent } from './components/membresia/membresia.component';
import { PromocionesComponent } from "./components/promociones/promociones.component";

@Component({
    selector: 'app-gestion-contenido',
    standalone: true,
    templateUrl: './gestion-contenido.component.html',
    styleUrls: ['./gestion-contenido.component.css'],
    imports: [NavbarComponent, FooterComponent, CommonModule, MembresiasComponent, PromocionesComponent]
    })
    export class GestionContenidoComponent implements OnInit {
    bonos: Bono[] = [];
    carouselInterval = 5000;

    constructor(private gestionService: GestionContenidoService) {}

    ngOnInit(): void {
        this.loadBonos();
    }

    loadBonos(): void {
        this.gestionService.getBonos().subscribe(data => {
        this.bonos = data;
        });
        console.log(this.bonos);
    }

    async crearBono(): Promise<void> {
        const { value: formValues } = await Swal.fire({
        title: 'Crear Bono de Descuento',
        html:
            '<input id="swal-nombre" class="swal2-input" placeholder="Nombre">' +
            '<input id="swal-valor" type="number" class="swal2-input" placeholder="Valor">' +
            '<input id="swal-fecha" type="date" class="swal2-input">',
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Crear',
        confirmButtonColor: '#0d6efd',
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#dc3545',
        preConfirm: () => {
            const nombre = (document.getElementById('swal-nombre') as HTMLInputElement).value;
            const valor = parseFloat((document.getElementById('swal-valor') as HTMLInputElement).value);
            const fecha = (document.getElementById('swal-fecha') as HTMLInputElement).value;
            if (!nombre || isNaN(valor) || !fecha) {
            Swal.showValidationMessage('Por favor, completa todos los campos');
            }
            return { nombre, valor, fechaExpiracion: fecha };
        }
        });

        if (formValues) {
        this.gestionService.createBono(formValues).subscribe(newBono => {
            this.bonos.push(newBono);
            Swal.fire('¡Creado!', 'El bono ha sido creado.', 'success');
        }, () => {
            Swal.fire('Error', 'No se pudo crear el bono.', 'error');
        });
        }
    }

    mostrarDetalle(bono: Bono): void {
        const isActive = new Date(bono.fechaExpiracion) > new Date();  // Compara fechas correctamente
        // Formateamos el valor como moneda manualmente
        const valorFormateado = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(bono.valor);
    
        Swal.fire({
        title: bono.nombre,
        html: `
            <p><strong>ID:</strong> ${bono.id}</p>
            <p><strong>Valor:</strong> ${valorFormateado}</p>
            <p><strong>Expiración:</strong> ${new Date(bono.fechaExpiracion).toLocaleDateString()}</p>
            <p><strong>Estado:</strong> 
            <span class="badge" style="background-color:${isActive ? 'lightgreen' : 'lightcoral'};">
                ${isActive ? 'Activo' : 'Inactivo'}
            </span>
            </p>`,
        showCancelButton: true,
        confirmButtonText: 'Editar',
        cancelButtonText: 'Eliminar',
        focusConfirm: false
        }).then((result) => {
        if (result.isConfirmed) {
            this.editarBono(bono);  // Si se confirma, edita el bono
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            this.eliminarBono(bono);  // Si se cancela, elimina el bono
        }
        });
    } 

    editarBono(bono: Bono): void {
        Swal.fire({
        title: 'Editar Bono',
        html:
            `<input id="swal-nombre" class="swal2-input" value="${bono.nombre}" placeholder="Nombre">` +
            `<input id="swal-valor" type="number" class="swal2-input" value="${bono.valor}" placeholder="Valor">` +
            `<input id="swal-fecha" type="date" class="swal2-input" value="${bono.fechaExpiracion}">`,
        confirmButtonText: 'Guardar',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        focusConfirm: false
        }).then((result) => {
        if (result.isConfirmed) {
            const nombre = (document.getElementById('swal-nombre') as HTMLInputElement).value;
            const valor = parseFloat((document.getElementById('swal-valor') as HTMLInputElement).value);
            const fecha = (document.getElementById('swal-fecha') as HTMLInputElement).value;

            if (nombre && !isNaN(valor) && fecha) {
            bono.nombre = nombre;
            bono.valor = valor;
            bono.fechaExpiracion = fecha;

            this.gestionService.editarBono(bono.id, bono).subscribe(() => {
                Swal.fire('Actualizado!', 'El bono ha sido actualizado.', 'success');
                this.loadBonos();
            }, () => {
                Swal.fire('Error', 'No se pudo actualizar el bono.', 'error');
            });
            } else {
            Swal.fire('Error', 'Por favor, completa todos los campos correctamente.', 'error');
            }
        }
        });
    }

    eliminarBono(bono: Bono): void {
        this.gestionService.eliminarBono(bono.id).subscribe(() => {
          this.bonos = this.bonos.filter(b => b.id !== bono.id);
          Swal.fire('Eliminado', 'El bono ha sido eliminado.', 'success');
      
          // Espera al renderizado y fuerza el primer item como activo si hay bonos
          setTimeout(() => {
            const items = document.querySelectorAll('.carousel-item');
            if (items.length > 0) {
              items.forEach(item => item.classList.remove('active'));
              items[0].classList.add('active');
            }
          }, 100);
          
        }, () => {
          Swal.fire('Error', 'No se pudo eliminar el bono.', 'error');
        });
      }      
}
