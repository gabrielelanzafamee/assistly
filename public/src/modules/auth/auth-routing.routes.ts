import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  { path: "login", loadComponent: () => import('./components/login/login.component').then(c => c.AuthLoginComponent) },
  // { path: "signup", loadComponent: () => import('./components/signup/signup.component').then(c => c.AuthSignupComponent) }
];
