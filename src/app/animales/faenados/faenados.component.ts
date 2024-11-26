import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainService } from '../../services/main.service';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';

import { BALANCE } from '../../constants/balance.constants';

@Component({
  selector: 'app-faenados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './faenados.component.html',
  styleUrls: ['./faenados.component.css'],
})
export class FaenadosComponent implements OnInit {
  todayDate: Date = new Date();
  selectedSpecies: any;
  filter: any = {
    code: '',
    especie: '',
    page: 1,
    per_page: 10,
    tipoAnimal: 'final',
  };
  especies: any[] = [];
  ganchos: any[] = [];
  table: any = {
    current_page: 1,
    per_page: 10,
    total: 0,
    data: [],
  };
  totalPages: number = 0;
  user: any;
  loadingEspecies: boolean = false;
  loadingAnimales: boolean = false;
  selectedGancho: any = {};
  htmlContent: string = ''; // Aquí cargaremos el HTML

  constructor(private Main: MainService, private http: HttpClient) {}

  ngOnInit(): void {
    console.log('----', BALANCE.puerto);
    this.user = this.Main.getSession();
    this.getEspecies('getEspeciesFaenados').then(() => this.getAnimals());
  }

  async getEspecies(especie: string) {
    this.loadingEspecies = true;
    this.loadingAnimales = true;

    try {
      const result: any = await firstValueFrom(this.Main.getEspecies(especie));
      this.especies = result.data;
      if (this.especies.length > 0) {
        this.selectedSpecies = this.especies[0];
        this.ganchos = this.especies[0].ganchos;
        this.selectedGancho = this.ganchos[0];
        this.filter.especie = this.especies[0].nombre;
      }
    } finally {
      this.loadingEspecies = false;
    }
  }

  async getAnimals() {
    this.loadingAnimales = true;
    this.table.data = [];
    try {
      const result: any = await firstValueFrom(
        this.Main.getAnimalesByCodeAndPagination(this.filter)
      );
      this.table.data = result.data.ingresos;
      this.table.current_page = result.data.current_page;
      this.table.per_page = result.data.per_page;
      this.table.total = result.data.total;
      this.totalPages = Math.ceil(this.table.total / this.table.per_page);
    } finally {
      this.loadingAnimales = false;
    }
  }

  onEspecieChange(especie: any) {
    this.filter.page = 1;
    this.selectedSpecies = especie;
    this.filter.especie = especie.nombre;
    this.ganchos = especie.ganchos;
    this.selectedGancho = this.ganchos[0];
    this.getAnimals();
  }

  onGanchoChange(gancho: any) {
    this.selectedGancho = gancho;
  }

  async guardar(animal: any) {
    animal.loading = true;
    try {
      const result: any = await firstValueFrom(
        this.Main.getWeight({ puerto: BALANCE.puerto })
      );

      if (!result || !result.weight) {
        Swal.fire({
          text: 'No se obtuvo valores de la balanza',
          icon: 'warning',
        });
        return;
      }

      animal.peso_faenado = Math.floor((result.weight - this.selectedGancho.peso) * 100) / 100;
      if (animal.peso_faenado <= 0) {
        Swal.fire({
          html: `
                   <span>Peso calculado no permitido.</span><br>
                   <span>Peso calculado: ${animal.peso_faenado} lb</span><br>
                   <span>Peso en la balanza: ${result.weight} lb</span>
                 `,
          icon: 'warning',
        });
        return;
      }
      animal.productos[0] = {
        id_producto: animal.productos[0].producto_id,
        peso: animal.peso_faenado,
      };
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await firstValueFrom(
        this.Main.saveDeadWeightAnimal(
          animal.id_animales,
          this.user.id,
          animal.productos
        )
      );
      await this.imprimir(animal);
      await this.getAnimals();
    } catch (error) {
      Swal.fire({
        text: 'Error al obtener o guardar el peso',
        icon: 'warning',
      });
      console.error('Error al obtener o guardar el peso:', error);
    } finally {
      animal.loading = false;
    }
  }

  changeSearch(event: any) {
    this.filter.code = event.target.value.toString().toUpperCase();
    this.getAnimals();
  }

  changePage(page: number) {
    this.table.current_page = +page;
    this.filter.page = +page;
    this.getAnimals();
  }

  loadHtmlFile() {
    this.http
      .get('assets/my-template.html', { responseType: 'text' })
      .subscribe({
        next: (response) => {
          this.htmlContent = response;
        },
        error: (err) => {
          console.error('Error al cargar el archivo HTML:', err);
        },
      });
  }

  async imprimir(animal: any) {
    await this.loadHtmlFile();

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.innerHTML = this.htmlContent;
    document.body.appendChild(container);

    html2canvas(container).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.autoPrint();
      window.open(pdf.output('bloburl'), '_blank');
      document.body.removeChild(container);
    });
  }

  getFormattedDate(): string {
    return this.todayDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
