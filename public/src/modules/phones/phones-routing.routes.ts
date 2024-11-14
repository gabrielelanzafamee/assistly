import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const phonesRoutes: Routes = [
  { path: "phones", loadComponent: () => import('./phones.component').then(c => c.PhonesComponent), canActivate: [AuthGuard] }
];
