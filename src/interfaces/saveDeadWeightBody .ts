import {IProducto} from './animalResponse';

export interface ISaveDeadWeightBody {
  id_animales: number;
  id_user: number;
  id_tipoPiezas: number;
  productos: IProducto[];
}
