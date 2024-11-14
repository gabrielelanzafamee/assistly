import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../modules/auth/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage

    console.log('Intercepting request:', req.url);  // Log the request URL
    console.log('Token from localStorage:', token); // Log the token to ensure it's being retrieved

    if (this.authService.isAuthenticated() && token) {
      // Clone the request and add the Authorization header with the token
      const clonedReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(clonedReq);
    }

    // Pass the request unchanged if no token is found
    return next.handle(req);
  }
}
