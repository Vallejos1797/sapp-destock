import {Component, OnInit} from '@angular/core';
import {MainService} from '../../services/main.service';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import Swal from 'sweetalert2';
import {Router} from '@angular/router';
import {VivosComponent} from "../animales/vivos/vivos.component";
import {FaenadosComponent} from "../animales/faenados/faenados.component";
import {SerialPortService} from '../../services/SerialPortService';
import {IAnimal} from '../../interfaces/animalResponse';


@Component({
  selector: 'app-weighing-process',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // ModalModule,
    VivosComponent,
    FaenadosComponent
  ],
  templateUrl: './weighing-process.component.html',
  styleUrl: './weighing-process.component.css'
})
export class WeighingProcessComponent implements OnInit {
  animalStatus: any[] = [];
  animalStatusSelected: any = {};

  ports: any= [];
  selectedPort: string | null = null;
  isModalOpen: boolean = false;
  isPanelOpen: boolean = false;

  user: any;
  constructor(
    private Main: MainService,
    private Router: Router,
    private serialPortService: SerialPortService
  ) {
    console.log('llega al home..')
  }

  ngOnInit(): void {
    this.user = this.Main.getSession();
    this.getTipoAnimales();
    // Suscribirse a los cambios en la lista de puertos
    this.serialPortService.ports$.subscribe((ports) => {
      this.ports = ports;
    });

    // Suscribirse al puerto seleccionado
    this.serialPortService.selectedPort$.subscribe((port) => {
      this.selectedPort = port;
    });

  }



  async getTipoAnimales() {

    this.animalStatus = [
      {
        "id": 1,
        "name": "VIVOS",
        "image": "assets/images/vivos.png"
      },
      {
        "id": 2,
        "name": "FAENADOS",
        "image": "assets/images/faenados.png"
      }
    ];
  }

  toggleSelectAnimalStatus(animal?: IAnimal) {
    this.animalStatusSelected = animal;
  }



  logout() {
    Swal.fire({
      text: '¿Estás seguro de salir del sistema?',
      icon: 'question',
      allowEscapeKey: false,
      allowOutsideClick: false,
      allowEnterKey: false,
      showConfirmButton: true,
      showCancelButton: true,
      cancelButtonText: 'No',
      cancelButtonColor: '#dc3545',
      confirmButtonText: 'Si, deseo salir.',
      confirmButtonColor: '#10a48e'
    }).then((choice) => {
      if (choice.isConfirmed) {
        this.Main.destroySession();
        this.Router.navigate(['/inicio-de-sesion'])
      }
    });
  }
  home(){
    this.animalStatusSelected={}
  }
  openModal() {
    this.isModalOpen = true;
    this.isPanelOpen=true;
    console.log( this.isModalOpen);
  }

  closeModal() {
    this.isModalOpen = false;
  }
  async loadPorts() {
    try {
       // Obtiene los datos de la API
      this.ports = await this.Main.getPorts().toPromise(); // Almacena los puertos en la propiedad de clase
      console.log(this.ports );
      if (this.ports.length > 0) {
        this.selectedPort = this.ports[0].path; // Selecciona automáticamente el primer puerto
      } else {

        this.selectedPort = ''; // Establece un valor por defecto si no hay puertos
        Swal.fire({
          text: 'No se detectó ningún puerto. Por favor, verifique que el dispositivo esté correctamente conectado y vuelva a intentarlo.',
          icon: 'warning'
        });
        return; // Salir del método si no hay peso
      }

      // Almacena los puertos y el puerto seleccionado en el servicio compartido
      this.serialPortService.setPorts(this.ports);
      this.serialPortService.setSelectedPort(this.selectedPort);
    } catch (error) {
      console.error('Error al cargar los puertos:', error);
      alert('No se pudieron cargar los puertos. Intente nuevamente.');
    }
  }

  selectPort(port: string | null) {
    if (port) {
      this.serialPortService.setSelectedPort(port); // Si es un string válido, lo asigna
    } else {
      console.error('Invalid port selected'); // Manejo de errores o casos inválidos
    }
  }


  togglePanel() {
    this.isPanelOpen = !this.isPanelOpen; // Alterna entre abrir y cerrar
  }
  closePanelOnClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Si el clic no ocurrió dentro del panel o el botón de tuerca, cerrar el panel
    if (!target.closest('.top-panel') && !target.closest('.settings-button')) {
      this.isPanelOpen = false;
    }
  }


}
