import { Injectable } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { catchError, Observable, of } from 'rxjs';
import { IMessageCreateRequest, IMessageCreateResponse, IMessageDeleteResponse, IMessageItem, IMessageListResponse, IMessageSendRequest, IMessageSendResponse, IMessageSingleResponse } from '../../../shared/interfaces/messages.interface';

@Injectable({providedIn: 'root'})
export class MessagesService {
  constructor(private apiService: ApiService) {}

  public fetchMessages(): Observable<IMessageListResponse> {
    return this.apiService.get<IMessageListResponse>('messages').pipe(
      catchError((err) => {
        console.error('Error fetching Messages:', err);
        return of({
          ok: false,
          message: 'Failed to fetch Messages',
          results: []
        });
      })
    );
  }

  public fetchMessagesConversation(conversationId: string): Observable<IMessageListResponse> {
    return this.apiService.get<IMessageListResponse>(`messages/conversation/${conversationId}`).pipe(
      catchError((err) => {
        console.error('Error fetching Messages:', err);
        return of({
          ok: false,
          message: 'Failed to fetch Messages',
          results: []
        });
      })
    );
  }

  public createMessage(data: IMessageCreateRequest): Observable<IMessageCreateResponse> {
    return this.apiService.post<IMessageCreateResponse>('messages', data).pipe(
      catchError((err) => {
        console.error('Error creating Message:', err);
        return of({
          ok: false,
          message: 'Failed create Message',
          results: {} as IMessageItem
        });
      })
    );
  }

  public singleMessage(id: string): Observable<IMessageSingleResponse> {
    return this.apiService.get<IMessageSingleResponse>(`messages/${id}`).pipe(
      catchError((err) => {
        console.error('Error fetching Message:', err);
        return of({
          ok: false,
          message: 'Failed fetch Message',
          results: {} as IMessageItem
        });
      })
    );
  }

  public sendMessage(conversationId: string, content: string): Observable<IMessageSendResponse> {
    return this.apiService.post<IMessageSendResponse>(`messages/${conversationId}/send`, { content }).pipe(
      catchError((err) => {
        console.error('Error fetching Message:', err);
        return of({
          ok: false,
          message: 'Failed fetch Message',
          results: {} as IMessageItem
        });
      })
    );
  }

  public deleteMessage(id: string): Observable<IMessageDeleteResponse> {
    return this.apiService.delete<IMessageDeleteResponse>(`messages/${id}`).pipe(
      catchError((err) => {
        console.error('Error update Message:', err);
        return of({
          ok: false,
          message: 'Failed update Message',
          results: ''
        });
      })
    );
  }
}
