import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { jwtDecode } from 'jwt-decode';


@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(router: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // check if the user is logged in
    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const decoded = jwtDecode(token);

    if (decoded.exp === undefined || (decoded.exp * 1000) <= new Date().getTime()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    if (!('role' in decoded)) return false

    return decoded?.role === 'admin';
  }
}
