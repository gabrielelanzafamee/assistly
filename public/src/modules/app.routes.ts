import { Routes } from '@angular/router';
import { authRoutes } from './auth/auth-routing.routes';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from '../core/guards/auth.guard';
import { phonesRoutes } from './phones/phones-routing.routes';
import { assistantsRoutes } from './assistants/assistants-routing.routes';
import { knowledgesRoutes } from './knowledges/knowledges-routing.routes';
import { conversationsRoutes } from './conversations/conversations-routing.routes';
import { callsRoutes } from './calls/calls-routing.routes';
import { customersRoutes } from './customers/customers-routing.routes';
import { usersRoutes } from './users/users-routing.routes';

export const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
  ...authRoutes,
  ...phonesRoutes,
  ...assistantsRoutes,
  ...knowledgesRoutes,
  ...conversationsRoutes,
  ...callsRoutes,
  ...customersRoutes,
  ...usersRoutes
];
