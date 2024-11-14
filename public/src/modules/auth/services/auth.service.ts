import { Injectable } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { IAuthLogin, IAuthLoginResponse, IAuthSignup } from '../../../shared/interfaces/auth.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({providedIn: 'root'})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  constructor(private apiService: ApiService) {}

  login(body: IAuthLogin): Observable<IAuthLoginResponse> {
    try {
      const response = this.apiService.post<IAuthLoginResponse>('auth/login', body);
      this.isAuthenticatedSubject.next(true);
      return response;
    } catch (err) {
      this.isAuthenticatedSubject.next(false);
      throw err;
    }
  }

  signup<T>(body: IAuthSignup): Observable<T> {
    return this.apiService.post('auth/signup', body);
  }

  logout() {
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem('token');
  }

  isAuthenticated() {
    return this.isAuthenticatedSubject.value;
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token); // Debugging: Check if the token is retrieved

    if (!token) {
      return false;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      console.log('Decoded token:', decodedToken); // Debugging: Check if the token is decoded

      // Check if the token is expired
      if (decodedToken.exp && decodedToken.exp * 1000 > Date.now()) {
        console.log('Token is valid');
        return true;
      } else {
        console.log('Token is expired');
        return false;
      }
    } catch (error) {
      console.log('Error decoding token:', error); // Debugging: Check if token decoding fails
      return false;
    }
  }
}
