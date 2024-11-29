export interface ICredenciales {
  "password": string,
  "name": string
}


export interface IUser {
  token: string;
  id: number;
  apellidos: string;
  nombres: string;
  cedula: string;
  name: string;
  codigo: string;
  direccion: string;
  estadocivil: string;
  fechanacimiento: string;
  genero: string;
  telefono: string | null;
  celular: string;
  estado: string;
  email: string;
  current_team_id: number;
  rol_actual: string;
  suscripcion: string;
}

export interface ILoginResponse {
  message: string;
  user: IUser;
  token: string;
}
