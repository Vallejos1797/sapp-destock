export interface ITable<T> {
  current_page: number; // Página actual
  per_page: number; // Registros por página
  total: number; // Total de registros
  data: T[]; // Lista de datos (genéricos)
}
