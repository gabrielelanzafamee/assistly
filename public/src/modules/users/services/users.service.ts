import { Injectable } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { BehaviorSubject, catchError, Observable, of } from 'rxjs';
import { IUserItem, IUserListResponse, ICreateUserRequest, ICreateUserResponse, IDeleteUserResponse, IUpdateUserRequest, IUpdateUserResponse } from '../../../shared/interfaces/users.interface';

@Injectable({providedIn: 'root'})
export class UsersService {
  private UsersSubject = new BehaviorSubject<IUserItem[]>([]);  // Initialize with `null` or empty array
  Users$: Observable<IUserItem[]> = this.UsersSubject.asObservable(); // Observable for subscribers

  constructor(private apiService: ApiService) {
  }

  public fetchUsers(): Observable<IUserListResponse> {
    return this.apiService.get<IUserListResponse>('users').pipe(
      catchError((err) => {
        console.error('Error fetching users:', err);
        // Handle error by returning an empty response
        return of({
          ok: false,  // Assuming 'ok' is a boolean
          message: 'Failed to fetch users',
          results: []
        });
      })
    );
  }

  public createUser(data: ICreateUserRequest): Observable<ICreateUserResponse> {
    return this.apiService.post<ICreateUserResponse>('users', data).pipe(
      catchError((err) => {
        console.error('Error creating users:', err);
        return of({
          ok: false,
          message: 'Failed create users',
          results: ''
        });
      })
    );
  }

  public updateUser(id: string, data: IUpdateUserRequest): Observable<IUpdateUserResponse> {
    return this.apiService.patch<IUpdateUserResponse>(`users/${id}`, data).pipe(
      catchError((err) => {
        console.error('Error creating users:', err);
        return of({
          ok: false,
          message: 'Failed create users',
          results: ''
        });
      })
    );
  }


  public deleteUser(id: string): Observable<IDeleteUserResponse> {
    return this.apiService.delete<IDeleteUserResponse>(`users/${id}`).pipe(
      catchError((err) => {
        console.error('Error deleting users:', err);
        return of({
          ok: false,
          message: 'Failed deleting users',
          results: ''
        });
      })
    );
  }
}
