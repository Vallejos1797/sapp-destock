import { HttpClient } from '@angular/common/http';
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
    return sessionStorage.setItem('UENCUBA', JSON.stringify(user));
  }

  destroySession() {
    return sessionStorage.removeItem('UENCUBA');
  }

  getSession() {
    return JSON.parse(sessionStorage.getItem('UENCUBA') || '{}');
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


  getAnimalesByCodeAndPagination( filters:any) {
    return this.Http.get(`${this.uri}/peso/${filters.tipoAnimal}/getAnimales?codigo=${filters.code}&per_page=${filters.per_page}&page=${filters.page}&especie=${filters.especie}`);
  }

  getWeight(params: any ) {
    console.log("va enviar", params);
    const queryParams = new URLSearchParams(params).toString();
    return this.Http.get(`${this.uriLocal}/balance/get-weight?${queryParams}`);
  }

  saveLifeWeightAnimal(animalID: number, weight: number, userID: number) {
    let body: any = {
      peso: weight,
      id_user: userID
    };
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

  getEspecies(tipoEspecie: string) {
    return this.Http.get(`${this.uri}/peso/${tipoEspecie}`);
  }

}
