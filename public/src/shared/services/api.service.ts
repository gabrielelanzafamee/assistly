import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api/v1'; // Set your backend URL here

  constructor(
    private http: HttpClient
  ) {}

  // GET request
  get<T>(endpoint: string, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { params, headers });
  }

  // POST request
  post<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, { headers });
  }

  // PUT request
  put<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, { headers });
  }

  // DELETE request
  delete<T>(endpoint: string, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, { params, headers });
  }

  // PATCH request
  patch<T>(endpoint: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}/${endpoint}`, body, { headers });
  }
}
