import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import {WeighingProcessComponent} from './weighing-process/weighing-process.component'; // Asegúrate de importar tu componente de login

export const routes: Routes = [
  { path: 'login', component: LoginComponent }, // Ruta al componente de login
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirigir por defecto al login
  { path: 'proceso-de-pesaje', component: WeighingProcessComponent },
  { path: '**', redirectTo: 'login' } // Ruta comodín para redirigir a login si no se encuentra una ruta
];
