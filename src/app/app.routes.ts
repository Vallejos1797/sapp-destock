import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { WeighingProcessComponent } from './weighing-process/weighing-process.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'inicio-de-sesion'
  },
  {
    path: 'inicio-de-sesion',
    component: LoginComponent
  },
  {
    path: 'proceso-de-pesaje',
    component: WeighingProcessComponent
  },
  { path: '**',
    pathMatch: 'full',
    redirectTo: 'inicio-de-sesion'
  },
];
