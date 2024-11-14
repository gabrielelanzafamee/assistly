import { Injectable } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { catchError, Observable, of } from 'rxjs';
import { IAssistantListResponse, ICreateAssistantRequest, ICreateAssistantResponse, IDeleteAssistantResponse, IUpdateAssistantRequest, IUpdateAssistantResponse } from '../../../shared/interfaces/assistants.interface';

@Injectable({providedIn: 'root'})
export class ToolsService {
  constructor(private apiService: ApiService) {
    // this.loadPhones();  // Fetch phones when service is initialized
  }

  public fetchTools(): Observable<IAssistantListResponse> {
    return this.apiService.get<IAssistantListResponse>('assistants').pipe(
      catchError((err) => {
        console.error('Error fetching assistants:', err);
        // Handle error by returning an empty response
        return of({
          ok: false,  // Assuming 'ok' is a boolean
          message: 'Failed to fetch assistants',
          results: []
        });
      })
    );
  }

  public createTool(data: ICreateAssistantRequest): Observable<ICreateAssistantResponse> {
    return this.apiService.post<ICreateAssistantResponse>('assistants', data).pipe(
      catchError((err) => {
        console.error('Error creating phone number:', err);
        return of({
          ok: false,
          message: 'Failed create phoen number',
          results: ''
        });
      })
    );
  }

  public updateTool(id: string, data: IUpdateAssistantRequest): Observable<IUpdateAssistantResponse> {
    return this.apiService.patch<IUpdateAssistantResponse>(`assistants/${id}`, data).pipe(
      catchError((err) => {
        console.error('Error creating phone number:', err);
        return of({
          ok: false,
          message: 'Failed create phoen number',
          results: ''
        });
      })
    );
  }


  public deleteTool(id: string): Observable<IDeleteAssistantResponse> {
    return this.apiService.delete<IDeleteAssistantResponse>(`assistants/${id}`).pipe(
      catchError((err) => {
        console.error('Error deleting phone number:', err);
        return of({
          ok: false,
          message: 'Failed deleting phoen number',
          results: ''
        });
      })
    );
  }
}
