export interface IFilter {
  codigo: string; // Código de búsqueda
  especie: string; // Especie seleccionada
  page: number; // Página actual
  per_page: number; // Registros por página
  tipoAnimal: string; // Tipo de animal (inicio/faenado)
  fecha_faenamiento?: string; // Fecha de faenamiento
}
