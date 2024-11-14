import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const callsRoutes: Routes = [
  { path: "calls", loadComponent: () => import('./calls.component').then(c => c.CallsComponent), canActivate: [AuthGuard] }
];
