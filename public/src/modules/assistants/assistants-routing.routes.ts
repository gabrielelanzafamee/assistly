import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const assistantsRoutes: Routes = [
  { path: "assistants", loadComponent: () => import('./assistants.component').then(c => c.AssistantsComponent), canActivate: [AuthGuard] },
];
