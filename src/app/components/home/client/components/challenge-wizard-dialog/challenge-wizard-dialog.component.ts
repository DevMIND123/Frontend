import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2';
import { AlimentacionDTO } from '../../../../../dto/alimentacion.dto';
import { RetoComidaService } from '../../../../../services/reto-comida.service';

@Component({
  selector: 'app-challenge-wizard-dialog',
  imports: [
    MatIconModule,
    MatDialogModule,
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatStepperModule,
    MatButtonModule,
    FormsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './challenge-wizard-dialog.component.html',
  styleUrl: './challenge-wizard-dialog.component.css'
})
export class ChallengeWizardDialogComponent {
  stepLabels = ['Bienvenida', 'Info. Datos', 'Tus Datos', '¡Tu Reto!'];
  datosForm!: FormGroup;
  retoForm!: FormGroup;

  alimentacionCreada?: AlimentacionDTO;
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<ChallengeWizardDialogComponent>,
    private retoComidaService: RetoComidaService
  ) {
    this.datosForm = this.fb.group({
      height: [null, [Validators.required, Validators.min(100), Validators.max(250)]],
      weight: [null, [Validators.required, Validators.min(30), Validators.max(300)]],
      targetDate: [null, Validators.required]
    });

    this.retoForm = this.fb.group({
      type: [null, Validators.required],
      calories: [null, [Validators.required, Validators.min(800)]],
      description: ['']
    });
  }

  onStep3Next(): void {
    if (this.datosForm.invalid) return;

    const emailUsuario = sessionStorage.getItem('user');
    if (!emailUsuario) {
      Swal.fire('Error', 'No se encontró el usuario en sesión.', 'error');
      return;
    }

    const values = this.datosForm.value;
    const fechaInicio = formatDate(new Date(), 'yyyy-MM-dd', 'es-CO');
    const fechaFin = formatDate(values.targetDate, 'yyyy-MM-dd', 'es-CO');

    const dto: AlimentacionDTO = {
      emailUsuario,
      peso: values.weight,
      altura: values.height,
      caloriasConsumidasHoy: 0,
      fechaInicio,
      fechaFin
    };

    this.cargando = true;
    this.retoComidaService.crearAlimentacion(dto).subscribe({
      next: (res) => {
        this.cargando = false;
        this.alimentacionCreada = res;

        // Precarga el formulario del reto con datos sugeridos
        this.retoForm.patchValue({
          type: this.mapObjetivoToTipo(res.objetivo),
          calories: res.caloriasObjetivoDiarias
        });
      },
      error: () => {
        this.cargando = false;
        Swal.fire('Error', 'No se pudo procesar la información.', 'error');
      }
    });
  }

  finish(): void {
    const result = {
      datos: this.datosForm.value,
      reto: this.retoForm.value,
      alimentacion: this.alimentacionCreada
    };

    this.ref.close(result);
  }

  private mapObjetivoToTipo(objetivo: string | undefined): string {
    switch ((objetivo || '').toLowerCase()) {
      case 'perder peso': return 'perderPeso';
      case 'ganar masa': return 'ganarMasa';
      case 'mantener peso': return 'mantener';
      default: return 'otro';
    }
  }

}
