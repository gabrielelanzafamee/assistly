import { Routes } from '@angular/router';
import { AuthGuard } from '../../core/guards/auth.guard';

export const conversationsRoutes: Routes = [
  { path: "conversations", loadComponent: () => import('./conversations.component').then(c => c.ConversationsComponent), canActivate: [AuthGuard] }
];
