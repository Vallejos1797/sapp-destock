export interface IAnimalFilters {
  tipoAnimal: string;
  page?: number;
  perPage?: number;
  [key: string]: any; // Si no sabes todas las claves posibles
}
