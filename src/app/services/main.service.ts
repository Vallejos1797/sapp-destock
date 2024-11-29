import {HttpClient, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MainService {

  // uri: string = 'http://46.183.117.133/api';
 // uri: string = 'http://185.253.153.225/api';
  uriLocal: string = 'http://localhost:3000/api';

  uri: string ='https://epfyprocai.com/api'

  constructor(
    private Http: HttpClient
  ) { }

  saveSession(user: any) {
    return localStorage.setItem('UENCUBA', JSON.stringify(user));
  }

  destroySession() {
    return localStorage.removeItem('UENCUBA');
  }

  getSession() {
    return JSON.parse(localStorage.getItem('UENCUBA') || '{}');
  }

  login(credentials: any) {
    // return this.Http.post(`${this.uri}/auth/login`, credentials);
    return this.Http.post(`${this.uri}/login`, {name: credentials.username, password: credentials.password});
  }

  getAnimalStatus() {
    return this.Http.get(`${this.uriLocal}/animal-status`);
  }

  getPieceTypes() {
    return this.Http.get(`${this.uri}/peso/getTipoPiezas`);
  }

  getPieces(pieceType: number, animalID: number) {
    return this.Http.get(`${this.uri}/peso/getPiezas?id_tipoPiezas=${pieceType}&id_animales=${animalID}`);
  }


  getAnimalesByCodeAndPagination(filters: any) {
    // Crear los parámetros dinámicamente a partir de los filtros
    let params = new HttpParams();

    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== null) {
        params = params.set(key, filters[key]);
      }
    });

    // Realizar la solicitud GET con los parámetros
    return this.Http.get(`${this.uri}/peso/${filters.tipoAnimal}/getAnimales`, { params });
  }

  getWeight(params: any ) {
    console.log("va enviar", params);
    const queryParams = new URLSearchParams(params).toString();
    return this.Http.get(`${this.uriLocal}/balance/get-weight?${queryParams}`);
  }

  saveLifeWeightAnimal(animalID: number, weight: number, userID: number) {
    return this.Http.put(`${this.uri}/peso/inicio/${animalID}/guardarPesoInicio?peso=${weight}&id_user=${userID}`, {});
  }

  saveDeadWeightAnimal(animalID: number, userID: number, products: any[]) {
    let body: any = {
      id_animales: animalID,
      id_user: userID,
      id_tipoPiezas: 1,
      productos: products
    };
    return this.Http.post(`${this.uri}/peso/final/guardarPesoFinal`, body);
  }

  getEspecies(tipoEspecie: string, body: any) {
    console.log('llega...', body);

    // Convertir el objeto body en parámetros de consulta
    let params = new HttpParams();
    Object.keys(body).forEach((key) => {
      if (body[key] !== undefined && body[key] !== null) {
        params = params.set(key, body[key]);
      }
    });

    // Enviar la solicitud GET con parámetros
    return this.Http.get(`${this.uri}/peso/${tipoEspecie}`, { params });
  }
  getPorts() {
    return this.Http.get(`${this.uriLocal}/balance/get-ports`);
  }


}
