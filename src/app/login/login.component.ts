import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
// import { MainService } from '../services/main.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { BALANCE } from '../constants/balance.constants';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  showPassword: boolean = false;
  credentials: any = {}
  mostrarContenido: boolean = false;
  puertoSeleccionado: string = '';
  constructor(
    // private Main: MainService,
    private Router: Router
  ) {
  }


  ngOnInit(): void {
    this.puertoSeleccionado = BALANCE.puerto;
    const user = sessionStorage.getItem('UENCUBA');
    if (user) {
      // Si existe el valor en sessionStorage, navega a la ruta '/proceso-de-pesaje'
      this.Router.navigate(['/proceso-de-pesaje']);
    }
  }

  // async login() {
  //   const loadingSwal: any = Swal.fire({
  //     html: '<span class="fa fa-spin fa-spinner fa-3x"></span> <br> Verificando Credenciales de Ingreso',
  //     allowEscapeKey: false,
  //     allowOutsideClick: false,
  //     allowEnterKey: false,
  //     showCancelButton: false,
  //     showConfirmButton: false
  //   });
  //
  //   try {
  //     let result: any = await this.Main.login(this.credentials).toPromise();
  //     console.log(result);
  //
  //     if (!result.user) {
  //       throw new Error('Credenciales incorrectas');
  //     }
  //
  //     let user: any = result.user;
  //     user.token = result.token;
  //     this.Main.saveSession(user);
  //     Swal.close();
  //     this.Router.navigate(['/proceso-de-pesaje']);
  //   } catch (error: any) {
  //     loadingSwal.close(); // Cerrar el loading Swal al recibir un error
  //
  //     if (error.status === 401) {
  //       Swal.fire({
  //         text: 'Credenciales incorrectas',
  //         icon: 'warning'
  //       });
  //     } else {
  //       Swal.fire({
  //         text: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.',
  //         icon: 'error'
  //       });
  //     }
  //   }
  //
  // }
  toggleContenido() {
    this.mostrarContenido = !this.mostrarContenido; // Cambia el estado
  }

  changePuerto(event: any) {
    console.log(event);
    console.log(event.target.value);
    BALANCE.puerto = event.target.value;

  }


}
