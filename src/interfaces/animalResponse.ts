export interface IAnimalResponse {
  message: string;
  data: {
    current_page: string;
    per_page: string;
    total: number;
    color_peso: string;
    ingresos: IAnimal[]; // Lista de animales
  };
}


export interface IAnimal{//ANIMAL
  id_animales: number;
  codigo_agrocalidad: string;
  codigo_secuencial: string;
  origen: string;
  destino: string;
  movilizacion: string;
  etapa_productiva: string;
  etapa_productiva_id: number;
  genero: string;
  tipo_acabado: string;
  SubCod: string;
  peso_updated_at: string | null;
  peso_vivo: number | null;
  ingreso: IIngreso;
  peso_faenado: number;
  productos: IProducto[];
  loading?: boolean;
}

export interface IIngreso {
  id_ingreso: number;
  fecha_ingreso: string;
  fecha_faenamiento: string;
  especie: string;
  id_especie: number;
  destinatario: IDestinatario;
}

export interface IDestinatario {
  nombre: string;
  cedula: string;
  codigo: string;
}

export interface IProducto {
  producto_id: number;
  producto: string;
  animales_piezas_id: number | null;
  peso: number;
}
