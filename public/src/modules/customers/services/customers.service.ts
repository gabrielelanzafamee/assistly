import { Injectable } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { catchError, Observable, of } from 'rxjs';
import { ICustomerDeleteResponse, ICustomerItem, ICustomerListResponse, ICustomerSingleResponse } from '../../../shared/interfaces/customers.interface';

@Injectable({providedIn: 'root'})
export class CustomersService {
  constructor(private apiService: ApiService) {}

  public fetchCustomers(): Observable<ICustomerListResponse> {
    return this.apiService.get<ICustomerListResponse>('customers').pipe(
      catchError((err) => {
        console.error('Error fetching Conversations:', err);
        return of({
          ok: false,
          message: 'Failed to fetch Conversations',
          results: []
        });
      })
    );
  }

  public singleCustomer(id: string): Observable<ICustomerSingleResponse> {
    return this.apiService.get<ICustomerSingleResponse>(`customers/${id}`).pipe(
      catchError((err) => {
        console.error('Error fetching conversation:', err);
        return of({
          ok: false,
          message: 'Failed fetch conversation',
          results: {} as ICustomerItem
        });
      })
    );
  }

  public deleteCustomer(id: string): Observable<ICustomerDeleteResponse> {
    return this.apiService.delete<ICustomerDeleteResponse>(`customers/${id}`).pipe(
      catchError((err) => {
        console.error('Error update conversation:', err);
        return of({
          ok: false,
          message: 'Failed update conversation',
          results: ''
        });
      })
    );
  }
}
