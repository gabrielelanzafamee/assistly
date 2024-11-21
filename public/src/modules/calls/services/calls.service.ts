import { Injectable } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { catchError, Observable, of } from 'rxjs';
import { ICallCreateRequest, ICallCreateResponse, ICallDeleteResponse, ICallItem, ICallListResponse, ICallSingleResponse, ICallUpdateRequest, ICallUpdateResponse } from '../../../shared/interfaces/calls.interface';

@Injectable({providedIn: 'root'})
export class CallsService {
  constructor(private apiService: ApiService) {}

  public fetchCalls(limit = 12, offset = 0): Observable<ICallListResponse> {
    return this.apiService.get<ICallListResponse>(`calls?limit=${limit}&offset=${offset}`).pipe(
      catchError((err) => {
        console.error('Error fetching calls:', err);
        return of({
          ok: false,
          message: 'Failed to fetch calls',
          results: [],
          count: 0
        });
      })
    );
  }

  public createCall(data: ICallCreateRequest): Observable<ICallCreateResponse> {
    return this.apiService.post<ICallCreateResponse>('calls', data).pipe(
      catchError((err) => {
        console.error('Error creating call:', err);
        return of({
          ok: false,
          message: 'Failed create call',
          results: {} as ICallItem
        });
      })
    );
  }

  public singleCall(id: string): Observable<ICallSingleResponse> {
    return this.apiService.get<ICallSingleResponse>(`calls/${id}`).pipe(
      catchError((err) => {
        console.error('Error fetching call:', err);
        return of({
          ok: false,
          message: 'Failed fetch call',
          results: {} as ICallItem
        });
      })
    );
  }

  public updateCall(id: string, data: ICallUpdateRequest): Observable<ICallUpdateResponse> {
    return this.apiService.patch<ICallUpdateResponse>(`calls/${id}`, data).pipe(
      catchError((err) => {
        console.error('Error update call:', err);
        return of({
          ok: false,
          message: 'Failed update call',
          results: {} as ICallItem
        });
      })
    );
  }

  public deleteCall(id: string): Observable<ICallDeleteResponse> {
    return this.apiService.delete<ICallDeleteResponse>(`calls/${id}`).pipe(
      catchError((err) => {
        console.error('Error update call:', err);
        return of({
          ok: false,
          message: 'Failed update call',
          results: ''
        });
      })
    );
  }
}
