import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainService } from '../../../services/main.service';
import { firstValueFrom } from 'rxjs';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Asigna las fuentes a pdfMake
pdfMake.vfs = pdfFonts as any;
import Swal from 'sweetalert2';

import { SerialPortService } from '../../../services/SerialPortService';
import {IEspecie, IEspecieResponse, IGancho} from '../../../interfaces/especieResponse';
import {IFilter} from '../../../interfaces/filter';
import {ITable} from '../../../interfaces/table';
import {IAnimal, IAnimalResponse} from '../../../interfaces/animalResponse';
import {IUser} from '../../../interfaces/login';
import {IWeightResponse} from '../../../interfaces/weightResponse';

@Component({
  selector: 'app-faenados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './faenados.component.html',
  styleUrls: ['./faenados.component.css'],
})
export class FaenadosComponent implements OnInit {
  todayDate: Date = new Date();
  selectedSpecies!: IEspecie;
  minDate: string = '';
  maxDate: string = '';
  filter: IFilter = {
    code: '',
    especie: '',
    page: 1,
    per_page: 10,
    tipoAnimal: 'final',
    fecha_faenamiento:''
  };
  especies: IEspecie[] = [];
  ganchos: IGancho[] = [];
  table: ITable<IAnimal> = {
    current_page: 1,
    per_page: 10,
    total: 0,
    data: [],
  };
  totalPages: number = 0;
  user!: IUser;
  loadingEspecies: boolean = false;
  loadingAnimales: boolean = false;
  selectedGancho: IGancho = {
    id: 0,
    peso: '',
    nombre: '',
    unidad: '',
    pivot: {
      id_especies: 0,
      id_ganchos: 0
    }
  };


  constructor(private Main: MainService, private serialPortService: SerialPortService) {}

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
    this.filter.fecha_faenamiento=this.getDate()
    this.getEspecies('getEspeciesFaenados').then(() => this.getAnimals());
  }

  async getEspecies(especie: string) {
    this.loadingEspecies = true;
    this.loadingAnimales = true;
    this.ganchos=[];
    this.selectedGancho = {
      id: 0,
      peso: '',
      nombre: '',
      unidad: '',
      pivot: {
        id_especies: 0,
        id_ganchos: 0
      }
    };
    try {
      const result: IEspecieResponse = await firstValueFrom(this.Main.getEspecies(especie,{ fecha_faenamiento:this.filter.fecha_faenamiento}));
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
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  async getAnimals() {
    this.loadingAnimales = true;
    this.table.data = [];
    try {
      const result: IAnimalResponse = await firstValueFrom(
        this.Main.getAnimalesByCodeAndPagination(this.filter)
      );
      this.table.data = result.data.ingresos;
      // Conversión explícita de propiedades
      this.table.current_page = parseInt(result.data.current_page, 10);
      this.table.per_page = parseInt(result.data.per_page, 10);
      this.table.total = result.data.total;
      this.totalPages = Math.ceil(this.table.total / this.table.per_page);
    } finally {
      this.loadingAnimales = false;
    }
  }

  onEspecieChange(especie: IEspecie) {
    this.filter.page = 1;
    this.selectedSpecies = especie;
    this.filter.especie = especie.nombre;
    this.ganchos = especie.ganchos;
    this.selectedGancho = this.ganchos[0];
    this.getAnimals();
  }

  onGanchoChange(gancho: IGancho) {
    this.selectedGancho = gancho;
  }

  async guardar(animal: any) {
    animal.loading = true;

    try {
      // Obtén el puerto desde un servicio compartido
      const puertoSeleccionado = this.serialPortService.getSelectedPort();

      // Verifica si el puerto está disponible
      if (!puertoSeleccionado) {
        Swal.fire({
          text: 'No se detectó la balanza. Verifique la conexión y seleccione el puerto serial adecuado.',
          icon: 'warning',
        });

        return;
      }
      const result: IWeightResponse  = await firstValueFrom(
        this.Main.getWeight({ puerto: puertoSeleccionado })
      );

      if (!result || !result.weight) {
        Swal.fire({
          text: 'No se obtuvo valores de la balanza',
          icon: 'warning',
        });
        return;
      }

      animal.peso_faenado = Math.floor((result.weight - parseFloat(this.selectedGancho.peso)) * 100) / 100;
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

  getFormattedDate(): string {
    if (!this.filter.fecha_faenamiento) {
      console.error('La fecha de faenamiento no está definida');
      return ''; // O algún valor por defecto
    }

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
    this.getEspecies('getEspeciesFaenados');
  }

  getBase64Image(imgUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Asegúrate de que la imagen no esté bloqueada por políticas de CORS
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = (error) => {
        reject(error);
      };
      img.src = imgUrl;
    });
  }


  async imprimir(animal: IAnimal)

  {
    const base64Image = await this.getBase64Image('assets/logo_01.png'); // Usa la ruta relativa


    // Definir el contenido del documento PDF
    const documentDefinition: any = {
      pageSize: { width: 115, height: 581.18 }, // Tamaño en puntos
      pageOrientation: 'landscape', // Establecer orientación horizontal
      margin: [0, 0, 0, 0], // Establecer márgenes
      content: [
        {
          absolutePosition: {x: 4, y: 4},
          table: {
            widths: [52, 40, 40, 40, 40, 44, 'auto'],
            body: [
              [
                {text: 'ORIGEN:', bold: true, fontSize: 7},
                {text: animal.origen, fontSize: 7, colSpan: 4},
                {},
                {},
                {},
                {
                  stack: [
                    {text: [
                        {  text: 'Cód:', bold: true,fontSize: 6, alignment: 'center'  }, // Estilo para 'ID:'
                        { text:animal.SubCod+'-'+animal.ingreso.destinatario.codigo, fontSize: 10 } // Estilo para el código secuencial
                      ],
                    },
                    { text: 'PESO CANAL:', bold: true, fontSize: 6, alignment: 'center' },
                    { text: animal.peso_faenado + 'LB', fontSize: 12, alignment: 'center' }
                  ],
                  alignment: 'center',
                  rowSpan: 5,
                },
                {image: base64Image, width: 175, height: 60, rowSpan: 5, alignment: 'center',border: [false, false, false, false],margin: [0, 3, 0, 0] }
              ],
              [
                {text: 'DESTINO:', bold: true, fontSize: 7},
                {
                  text: animal.destino,
                  fontSize: 7,
                  colSpan: 4
                },
                {},
                {},
                {},
                {},
                {} // Columna vertical para "PESO CANAL"
              ],
              [
                {text: 'DESTINATARIO:', bold: true, fontSize: 7},
                {text: animal.ingreso.destinatario.nombre, fontSize: 7, colSpan: 4},
                {},
                {},
                {},
                {},
                {} // Celda vacía para mantener la estructura
              ],
              [
                {text: 'MOVILIZACIÓN:', bold: true, fontSize: 7},
                {text: animal.movilizacion, fontSize: 7, colSpan: 4},
                {},
                {},
                {},
                {},
                {} // Celda vacía para mantener la estructura
              ],
              [
                {text: 'ESPECIE:',  fontSize: 7},
                {text: animal.ingreso.especie,  fontSize: 7},
                {text: 'FECHA F.:', fontSize: 7},
                {text: animal.ingreso.fecha_faenamiento, fontSize: 7},
                {text: [
                  {  text: 'ID:',fontSize: 7 }, // Estilo para 'ID:'
                  { text: animal.codigo_secuencial, bold: true,fontSize: 9 } // Estilo para el código secuencial
                ],
              },
                {},
                {}
              ]
            ]
          },
          layout: {

          }
        }
      ],
      styles: {
        header: {
          fontSize: 10, // Tamaño de fuente del encabezado
          bold: true,
          margin: [0, 0, 0, 0] // Establecer márgenes
        }
      }
    };

    // Generar el PDF y abrir el diálogo de impresión
    // pdfMake.createPdf(documentDefinition).open();
    pdfMake.createPdf(documentDefinition).getBlob((blob:any) => {
      const url = URL.createObjectURL(blob);
      const win = window.open(url);
      if (win) {
        win.focus();
      } else {
        // Manejar el caso donde la ventana no se abre
        console.error('No se pudo abrir la ventana de impresión');
      }
    });

  }

}
