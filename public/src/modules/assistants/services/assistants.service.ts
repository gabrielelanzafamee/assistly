import { Injectable } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { BehaviorSubject, catchError, Observable, of } from 'rxjs';
import { IAssistantItem, IAssistantListResponse, ICreateAssistantRequest, ICreateAssistantResponse, IDeleteAssistantResponse, IUpdateAssistantRequest, IUpdateAssistantResponse } from '../../../shared/interfaces/assistants.interface';

@Injectable({providedIn: 'root'})
export class AssistantsService {
  private assistantsSubject = new BehaviorSubject<IAssistantItem[]>([]);  // Initialize with `null` or empty array
  assistants$: Observable<IAssistantItem[]> = this.assistantsSubject.asObservable(); // Observable for subscribers

  constructor(private apiService: ApiService) {
    // this.loadPhones();  // Fetch phones when service is initialized
  }

  // Fetch the phones from the API and update the BehaviorSubject
  public loadPhones() {
    return this.fetchAssistants().subscribe({
      next: (phones) => {
        this.assistantsSubject.next(phones.results);  // Update the BehaviorSubject with the API data
      },
      error: (err) => {
        console.error('Error fetching phones:', err);
        // Handle error case, maybe set an empty array or error state
        this.assistantsSubject.next([]);
      }
    });
  }

  public fetchAssistants(): Observable<IAssistantListResponse> {
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

  public createAssistant(data: ICreateAssistantRequest): Observable<ICreateAssistantResponse> {
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

  public updateAssistant(id: string, data: IUpdateAssistantRequest): Observable<IUpdateAssistantResponse> {
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


  public deleteAssistant(id: string): Observable<IDeleteAssistantResponse> {
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
