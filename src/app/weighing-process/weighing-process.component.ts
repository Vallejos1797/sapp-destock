import { Component, OnInit,ElementRef, ViewChild } from '@angular/core';
import { MainService } from '../services/main.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import {VivosComponent} from "../animales/vivos/vivos.component";
import {FaenadosComponent} from "../animales/faenados/faenados.component";
import { BALANCE } from '../constants/balance.constants';

@Component({
  selector: 'app-weighing-process',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
    VivosComponent,
    FaenadosComponent
  ],
  templateUrl: './weighing-process.component.html',
  styleUrl: './weighing-process.component.css'
})
export class WeighingProcessComponent implements OnInit {
  animalStatus: any[] = [];
  animalStatusSelected: any = {};



  user: any;
  constructor(
    private Main: MainService,
    private Router: Router
  ) {
    console.log('llega al home..')
  }

  ngOnInit(): void {
    this.user = this.Main.getSession();
    this.getTipoAnimales();
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

  toggleSelectAnimalStatus(animal?: any) {
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

}
