import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const usersRoutes: Routes = [
  { path: "users", loadComponent: () => import('./users.component').then(c => c.UsersComponent), canActivate: [AuthGuard] },
];
