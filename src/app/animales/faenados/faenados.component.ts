import {Component, OnInit} from '@angular/core';
import {CommonModule, DatePipe, UpperCasePipe} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {MainService} from "../../services/main.service";
import {firstValueFrom} from "rxjs";
import {HttpClient} from "@angular/common/http";
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import Swal from "sweetalert2";
import { BALANCE } from '../../constants/balance.constants';

// Asigna las fuentes a pdfMake
@Component({
  selector: 'app-faenados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UpperCasePipe,
    DatePipe
  ],
  templateUrl: './faenados.component.html',
  styleUrl: './faenados.component.css'
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
  selectedGancho: any = {};


  constructor(
    private Main: MainService,
    private http: HttpClient
  ) {

  }

  ngOnInit(): void {
    console.log('----',BALANCE.puerto);
    this.user = this.Main.getSession();
    this.getEspecies('getEspeciesFaenados').then(r => this.getAnimals())
  }

  async getEspecies(especie: string) {
    this.loadingEspecies = true;
    this.loadingAnimales = true;

    try {
      const result: any = await firstValueFrom(this.Main.getEspecies(especie));
      console.log(result);
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
    this.selectedSpecies = especie;
    this.filter.especie = especie.nombre;
    this.ganchos = especie.ganchos;
    this.selectedGancho = this.ganchos[0]
    this.getAnimals();
  }

  onGanchoChange(gancho: any) {
    this.selectedGancho = gancho;
  }


  async guardar(animal: any) {
    animal.loading = true;
    try {
    const result: any = await firstValueFrom(this.Main.getWeight({puerto:BALANCE.puerto}));

      // Verificar si no se obtuvo un peso
      if (!result || !result.weight) {
        Swal.fire({
          text: 'No se obtuvo valores de la balanza',
          icon: 'warning'
        });
        return;
      }

      animal.peso_faenado = Math.floor((result.weight - this.selectedGancho.peso)*100)/100;
      if (animal.peso_faenado <= 0) {
        Swal.fire({
          html: `
                   <span>Peso calculado no permitido.</span><br>
                   <span>Peso calculado: ${animal.peso_faenado} lb</span><br>
                   <span>Peso en la balanza: ${result.weight} lb</span>
                 `,
          icon: 'warning'
        });
        return;
      }
      animal.productos[0] = {
        id_producto: animal.productos[0].producto_id,
        peso: animal.peso_faenado
      };
      await new Promise(resolve => setTimeout(resolve, 1000));
      await firstValueFrom(this.Main.saveDeadWeightAnimal(animal.id_animales, this.user.id, animal.productos));
      await this.imprimir(animal);
      await this.getAnimals();
    } catch (error) {
      Swal.fire({
        text: 'Error al obtener o guardar el peso',
        icon: 'warning'
      });
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


  async imprimir(animal: any)

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
                      {  text: 'ID:', bold: true,fontSize: 7, alignment: 'center'  }, // Estilo para 'ID:'
                      { text: animal.codigo_secuencial, fontSize: 14 } // Estilo para el código secuencial
                      ],
                    },
                    { text: 'PESO CANAL:', bold: true, fontSize: 7, alignment: 'center' },
                    { text: animal.peso_faenado + ' LB', fontSize: 14, alignment: 'center' }
                  ],
                  alignment: 'center',
                  rowSpan: 5
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
                {text: animal.ingreso.destinatario.nombre+'/Cód:'+animal.ingreso.destinatario.codigo, fontSize: 7, colSpan: 4},
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
                {text: 'ESPECIE:', bold: true, fontSize: 7},
                {text: animal.ingreso.especie, fontSize: 7},
                {text: 'FECHA F.:', fontSize: 7},
                {text: animal.ingreso.fecha_faenamiento, fontSize: 7},
                {text: 'SUBCÓD:'+animal.SubCod, fontSize: 7},
                {},
                {}
              ]
            ]
          },
          layout: {
            hLineWidth: () => 0.2, // Grosor de las líneas horizontales
            vLineWidth: () => 0.2, // Grosor de las líneas verticales
            hLineColor: () => '#d3d3d3', // Color de las líneas horizontales
            vLineColor: () => '#d3d3d3', // Color de las líneas verticales
            paddingLeft: () => 2, // Espaciado interno a la izquierda
            paddingRight: () => 2, // Espaciado interno a la derecha
            paddingTop: () => 2, // Espaciado interno en la parte superior
            paddingBottom: () => 2 // Espaciado interno en la parte inferior
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
    pdfMake.createPdf(documentDefinition).getBlob((blob) => {
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

  getFormattedDate(): string {
    return this.todayDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

}


