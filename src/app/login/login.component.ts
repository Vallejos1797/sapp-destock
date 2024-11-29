import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';

import { MainService } from '../../services/main.service';
import { SerialPortService } from '../../services/SerialPortService';

import { ICredenciales, ILoginResponse, IUser } from '../../Interfaces/login';
import { ErrorResponse } from '../../Interfaces/error';
import { TSerialPortsResponse } from '../../Interfaces/port';

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
  credentials: ICredenciales = {name: '', password: ''};

  constructor(
    private Main: MainService,
    private Router: Router,
    private serialPortService: SerialPortService
  ) {
  }

  async ngOnInit(): Promise<void> {
    const user = localStorage.getItem('UENCUBA');
    if (user) {
      await this.Router.navigate(['/proceso-de-pesaje']);
    }
    await this.getPorts();
  }

  async getPorts() {
    try {
      let puertos: TSerialPortsResponse = await firstValueFrom(this.Main.getPorts());

      if (puertos.length > 1) {
        await Swal.fire({
          text: 'Más de un dispositivo conectado',
          icon: 'warning',
        });
      }

      this.serialPortService.setPorts(puertos); // Almacena los puertos en el servicio compartido

      if (puertos.length > 0) {
        this.serialPortService.setSelectedPort(puertos[0].path); // Establece el puerto seleccionado
      }
    } catch (error) {
      await Swal.fire({
        text: 'Hubo un error al obtener los puertos.',
        icon: 'error',
      });
    }
  }

  async login() {
    const loadingSwal:any  = Swal.fire({
      html: '<span class="fa fa-spin fa-spinner fa-3x"></span> <br> Verificando Credenciales de Ingreso',
      allowEscapeKey: false,
      allowOutsideClick: false,
      allowEnterKey: false,
      showCancelButton: false,
      showConfirmButton: false
    });

    try {
      let result: ILoginResponse = await firstValueFrom(this.Main.login(this.credentials));
      let user: IUser = result.user;
      user.token = result.token;
      this.Main.saveSession(user);
      Swal.close();
      await this.Router.navigate(['/proceso-de-pesaje']);
    } catch (error:unknown) {
      loadingSwal.close();
      if (error && (error as ErrorResponse).status === 401) {
        // Manejo de error específico
        await Swal.fire({
          text: 'No autorizado',
          icon: 'error',
        });
      }  else {
        await Swal.fire({
          text: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.',
          icon: 'error'
        });
      }
    }
  }
}
