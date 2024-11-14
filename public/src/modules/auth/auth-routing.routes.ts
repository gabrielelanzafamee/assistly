import { Routes } from '@angular/router';
import { AuthLoginComponent } from './components/login/login.component';
import { AuthGuard } from '../../core/guards/auth.guard';

export const authRoutes: Routes = [
  { path: "login", loadComponent: () => import('./components/login/login.component').then(c => c.AuthLoginComponent) },
  { path: "signup", loadComponent: () => import('./components/signup/signup.component').then(c => c.AuthSignupComponent) }
];
