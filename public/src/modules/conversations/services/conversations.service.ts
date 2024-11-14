import { Injectable } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { catchError, Observable, of } from 'rxjs';
import { IConversationCreateRequest, IConversationCreateResponse, IConversationDeleteResponse, IConversationItem, IConversationListResponse, IConversationSingleResponse, IConversationUpdateRequest, IConversationUpdateResponse } from '../../../shared/interfaces/conversations.interface';

@Injectable({providedIn: 'root'})
export class ConversationsService {
  constructor(private apiService: ApiService) {}

  public fetchConversations(): Observable<IConversationListResponse> {
    return this.apiService.get<IConversationListResponse>('conversations').pipe(
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

  public createConversation(data: IConversationCreateRequest): Observable<IConversationCreateResponse> {
    return this.apiService.post<IConversationCreateResponse>('conversations', data).pipe(
      catchError((err) => {
        console.error('Error creating conversation:', err);
        return of({
          ok: false,
          message: 'Failed create conversation',
          results: {} as IConversationItem
        });
      })
    );
  }

  public singleConversation(id: string): Observable<IConversationSingleResponse> {
    return this.apiService.get<IConversationSingleResponse>(`conversations/${id}`).pipe(
      catchError((err) => {
        console.error('Error fetching conversation:', err);
        return of({
          ok: false,
          message: 'Failed fetch conversation',
          results: {} as IConversationItem
        });
      })
    );
  }

  public updateConversation(id: string, data: IConversationUpdateRequest): Observable<IConversationUpdateResponse> {
    return this.apiService.patch<IConversationUpdateResponse>(`conversations/${id}`, data).pipe(
      catchError((err) => {
        console.error('Error update conversation:', err);
        return of({
          ok: false,
          message: 'Failed update conversation',
          results: {} as IConversationItem
        });
      })
    );
  }

  public deleteConversation(id: string): Observable<IConversationDeleteResponse> {
    return this.apiService.delete<IConversationDeleteResponse>(`conversations/${id}`).pipe(
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
