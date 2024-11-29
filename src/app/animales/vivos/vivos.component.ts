import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from "@angular/common";
import { MainService } from "../../services/main.service";
import { firstValueFrom } from "rxjs";
import Swal from "sweetalert2";
import { BALANCE } from '../../constants/balance.constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vivos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule],
  templateUrl: './vivos.component.html',
  styleUrls: ['./vivos.component.css']
})
export class VivosComponent implements OnInit {
  todayDate: Date = new Date();
  selectedSpecies: any;
  minDate: string = '';
  maxDate: string = '';
  filter: any = {
    code: '',
    especie: '',
    page: 1,
    per_page: 10,
    tipoAnimal: 'inicio',
    fecha_faenamiento:''
  };
  especies: any[] = [];
  table: any =
    {
      current_page: 1,
      per_page: 10,
      total: 0,
      data: [],
    };
  totalPages: number = 0;
  user: any;
  loadingEspecies: boolean = false;
  loadingAnimales: boolean = false;



  constructor(
    private Main: MainService,
    private Router: Router
  ) {

  }

  ngOnInit(): void {
    const today = new Date();
    const yesterday = new Date(today);
    const tomorrow = new Date(today);

    // Ajusta las fechas para el rango permitido
    yesterday.setDate(today.getDate() - 1);
    tomorrow.setDate(today.getDate() + 1);

    // Formatea las fechas a 'YYYY-MM-DD'
    this.minDate = this.formatDate(yesterday);
    this.maxDate = this.formatDate(tomorrow);
    this.user = this.Main.getSession();
    console.log('-->',this.getDate())
    this.filter.fecha_faenamiento=this.getDate()
    this.getEspecies('getEspeciesVivos').then(r => this.getAnimals())
  }

  async getEspecies(especie: string) {
    this.loadingEspecies = true;
    this.loadingAnimales = true;

    try {
      const result: any = await firstValueFrom(this.Main.getEspecies(especie,{ fecha_faenamiento:this.filter.fecha_faenamiento}));
      console.log(result);
      this.especies = result.data;
      if (this.especies.length > 0) {
        this.selectedSpecies = this.especies[0];
        this.filter.especie = this.especies[0].nombre;
      }
    } finally {
      this.loadingEspecies = false;
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async getAnimals() {
    this.loadingAnimales = true;
    this.table.data = []
    try {
      const result: any = await firstValueFrom(this.Main.getAnimalesByCodeAndPagination(this.filter));
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
    console.log('Especie seleccionada:', especie);
    this.filter.page = 1
    this.table.current_page = 1
    this.selectedSpecies = especie; // Actualiza la especie seleccionada
    this.filter.especie = especie.nombre; // Actualiza el filtro de especie
    this.getAnimals(); // Obtiene los animales para la especie seleccionada
  }


  async guardar(animal: any) {
    animal.loading = true;
    try {

      if (!BALANCE.puerto) {
        Swal.fire({
          text: 'No se encontró la balanza,vuelva a iniciar sesión',
          icon: 'warning',
        });
        localStorage.removeItem('UENCUBA');
        this.Router.navigate(['/inicio-de-sesion'])
        return;
      }

      const result: any = await firstValueFrom(this.Main.getWeight({puerto:BALANCE.puerto}));
      if (!result || !result.weight) {
        Swal.fire({
          text: 'No se obtuvo valores de la balanza',
          icon: 'warning'
        });
        return; // Salir del método si no hay peso
      }
      animal.peso_vivo=Math.floor(result.weight * 100) / 100;

      if (animal.peso_vivo <= 0) {
        Swal.fire({
          html: `
                   <span>Peso calculado no permitido.</span><br>
                   <span>Peso en la balanza: ${result.weight} lb</span>
                 `,
          icon: 'warning'
        });
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      await firstValueFrom(this.Main.saveLifeWeightAnimal(animal.id_animales, animal.peso_vivo, this.user.id));
      await this.getAnimals();
    } catch (error) {
      console.error('Error al obtener o guardar el peso:', error);
    } finally {
      animal.loading = false;
    }
  }

  changeSearch(event: any) {
    this.filter.code = event.target.value.toString().toUpperCase()
    this.getAnimals()
  }
  changePage(page: number) {
    console.log(page)
    this.table.current_page = +page;
    this.filter.page = +page;
    this.getAnimals()
  }

  getFormattedDate(): string {
    const fecha = new Date(this.filter.fecha_faenamiento);
    const fechaAjustada = new Date(fecha.getTime() + fecha.getTimezoneOffset() * 60000);

    return fechaAjustada.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  getDate(): string {
    const year = this.todayDate.getFullYear();
    const month = String(this.todayDate.getMonth() + 1).padStart(2, '0'); // Mes (0-indexado)
    const day = String(this.todayDate.getDate()).padStart(2, '0'); // Día
    return `${year}-${month}-${day}`;
  }
  changeFecha(event:any){
    console.log('envio fecha:',event.target.value)
    this.filter.fecha_faenamiento = event.target.value
    this.getAnimals()
    this.getEspecies('getEspeciesVivos');
  }


}
