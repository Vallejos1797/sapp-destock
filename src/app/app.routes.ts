import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component'; // Asegúrate de importar tu componente de login

export const routes: Routes = [
  { path: 'login', component: LoginComponent }, // Ruta al componente de login
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirigir por defecto al login
  { path: '**', redirectTo: 'login' } // Ruta comodín para redirigir a login si no se encuentra una ruta
];
