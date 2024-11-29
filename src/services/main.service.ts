import {HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../environments/environment';
import {ICredenciales, ILoginResponse, IUser} from '../interfaces/login';
import {TSerialPortsResponse} from '../interfaces/port';
import {IAnimalResponse, IProducto} from '../interfaces/animalResponse';
import { IEspecieResponse } from '../interfaces/especieResponse';
import {IWeightResponse} from '../interfaces/weightResponse';
import {IAnimalFilters} from '../interfaces/animalFilters';
import {IEspecieBody} from '../interfaces/especieBody';

@Injectable({
  providedIn: 'root',
})
export class MainService {

  uri: string = environment.API_URL;  // Usará la URL según el entorno (desarrollo o producción)
  uriLocal: string = environment.API_URL_LOCAL;  // URL local

  constructor(
    private Http: HttpClient
  ) { }

  saveSession(user: IUser) {
    return localStorage.setItem('UENCUBA', JSON.stringify(user));
  }

  destroySession() {
    return localStorage.removeItem('UENCUBA');
  }

  getSession() {
    return JSON.parse(localStorage.getItem('UENCUBA') || '{}');
  }

  login(credentials: ICredenciales): Observable<ILoginResponse> {
    return this.Http.post<ILoginResponse>(`${this.uri}/login`,credentials);
  }

  getAnimalesByCodeAndPagination(filters: IAnimalFilters): Observable<IAnimalResponse> {
    // Crear los parámetros dinámicamente a partir de los filtros
    let params = new HttpParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params = params.set(key, filters[key]);
      }
    });

    // Realizar la solicitud GET con los parámetros y especificar el tipo devuelto
    return this.Http.get<IAnimalResponse>(`${this.uri}/peso/${filters.tipoAnimal}/getAnimales`, { params });
  }

  getWeight(params: any):Observable<IWeightResponse> {
    console.log("va enviar", params);
    const queryParams = new URLSearchParams(params).toString();
    return this.Http.get<IWeightResponse>(`${this.uriLocal}/balance/get-weight?${queryParams}`);
  }

  saveLifeWeightAnimal(animalID: number, weight: number, userID: number) {
    return this.Http.put(`${this.uri}/peso/inicio/${animalID}/guardarPesoInicio?peso=${weight}&id_user=${userID}`, {});
  }

  saveDeadWeightAnimal(animalID: number, userID: number, products: IProducto[]) {
    let body: any = {
      id_animales: animalID,
      id_user: userID,
      id_tipoPiezas: 1,
      productos: products
    };
    return this.Http.post(`${this.uri}/peso/final/guardarPesoFinal`, body);
  }

  getEspecies(tipoEspecie: string, body:  IEspecieBody): Observable<IEspecieResponse> {
    console.log('llega...', body);

    // Convertir el objeto body en parámetros de consulta
    let params = new HttpParams();
    Object.keys(body).forEach((key) => {
      if (body[key] !== undefined && body[key] !== null) {
        params = params.set(key, body[key]);
      }
    });

    // Enviar la solicitud GET con parámetros
    return this.Http.get<IEspecieResponse>(`${this.uri}/peso/${tipoEspecie}`, { params });
  }
  getPorts(): Observable<TSerialPortsResponse> {
    return this.Http.get<TSerialPortsResponse>(`${this.uriLocal}/balance/get-ports`);
  }


}
