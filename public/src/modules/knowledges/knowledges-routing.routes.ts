import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const knowledgesRoutes: Routes = [
  { path: "knowledges", loadComponent: () => import('./knowledges.component').then(c => c.KnowledgesComponent), canActivate: [AuthGuard] }
];
