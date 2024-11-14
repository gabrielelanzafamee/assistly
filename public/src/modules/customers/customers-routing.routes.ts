import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const customersRoutes: Routes = [
  { path: "customers", loadComponent: () => import('./customers.component').then(c => c.CustomersComponent), canActivate: [AuthGuard] }
];
