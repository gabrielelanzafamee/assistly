import { Injectable } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { catchError, Observable, of } from 'rxjs';
import { IKnowledgeCreateRequest, IKnowledgeCreateResponse, IKnowledgeDeleteResponse, IKnowledgeItem, IKnowledgeListResponse } from '../../../shared/interfaces/knowledges.interface';

@Injectable({providedIn: 'root'})
export class KnowledgesService {
  constructor(private apiService: ApiService) {}

  public fetchKnowledge(): Observable<IKnowledgeListResponse> {
    return this.apiService.get<IKnowledgeListResponse>('knowledges').pipe(
      catchError((err) => {
        console.error('Error fetching knowledge:', err);
        // Handle error by returning an empty response
        return of({
          ok: false,  // Assuming 'ok' is a boolean
          message: 'Failed to fetch knowledge',
          results: []
        });
      })
    );
  }

  public createKnowledge(data: FormData): Observable<IKnowledgeCreateResponse> {
    return this.apiService.post<IKnowledgeCreateResponse>('knowledges', data).pipe(
      catchError((err) => {
        console.error('Error creating knowledge:', err);
        return of({
          ok: false,
          message: 'Failed create knowledge',
          results: {} as IKnowledgeItem
        });
      })
    );
  }

  public deleteKnowledge(id: string): Observable<IKnowledgeDeleteResponse> {
    return this.apiService.delete<IKnowledgeDeleteResponse>(`knowledges/${id}`).pipe(
      catchError((err) => {
        console.error('Error deleting knowledge:', err);
        return of({
          ok: false,
          message: 'Failed deleting knowledge',
          results: ''
        });
      })
    );
  }
}
