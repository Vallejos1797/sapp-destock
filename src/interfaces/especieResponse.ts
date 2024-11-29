export interface IEspecieResponse {
  message: string;
  data: IEspecie[];
}
export interface IEspecie {
  id: number; // ID único de la especie
  nombre: string; // Nombre de la especie
  ganchos: IGancho[]; // Lista de ganchos asociados a la especie
}

export interface IGancho {
  id: number;
  peso: string;
  nombre: string;
  unidad: string;
  pivot: IPivot;
}
export interface IPivot {
  id_especies: number;
  id_ganchos: number;
}

