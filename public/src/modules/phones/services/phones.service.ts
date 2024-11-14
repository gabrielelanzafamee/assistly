import { Injectable } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { BehaviorSubject, catchError, interval, Observable, of, switchMap } from 'rxjs';
import { ICreatePhoneRequest, ICreatePhoneResponse, IDeletePhoneResposne, IPhoneItem, IPhonesListResponse, IPhonesListTwilioResponse } from '../../../shared/interfaces/phones.interface';
import { HttpParams } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class PhonesService {
  private phonesSubject = new BehaviorSubject<IPhoneItem[]>([]);  // Initialize with `null` or empty array
  phones$: Observable<IPhoneItem[]> = this.phonesSubject.asObservable(); // Observable for subscribers

  constructor(private apiService: ApiService) {
    // this.loadPhones();  // Fetch phones when service is initialized
  }

  // Fetch the phones from the API and update the BehaviorSubject
  public loadPhones() {
    return this.fetchPhones().subscribe({
      next: (phones) => {
        this.phonesSubject.next(phones.results);  // Update the BehaviorSubject with the API data
      },
      error: (err) => {
        console.error('Error fetching phones:', err);
        // Handle error case, maybe set an empty array or error state
        this.phonesSubject.next([]);
      }
    });
  }

  public fetchPhones(): Observable<IPhonesListResponse> {
    return this.apiService.get<IPhonesListResponse>('phones').pipe(
      catchError((err) => {
        console.error('Error fetching phones:', err);
        // Handle error by returning an empty response
        return of({
          ok: false,  // Assuming 'ok' is a boolean
          message: 'Failed to fetch phones',
          results: []
        });
      })
    );
  }

  public fetchAvailablePhones(countryCode: string = 'GB'): Observable<IPhonesListTwilioResponse> {
    const params = new HttpParams().append('countryCode', countryCode);

    // Directly return the API Observable
    return this.apiService.get<IPhonesListTwilioResponse>('phones/twilio/available', params).pipe(
      catchError((err) => {
        console.error('Error fetching phones:', err);
        // Handle error by returning an empty response
        return of({
          ok: false,  // Assuming 'ok' is a boolean
          message: 'Failed to fetch phones',
          results: []
        });
      })
    );
  }

  public fetchPhonesWithInterval(countryCode: string = 'GB', refreshInterval: number = 3000): Observable<IPhonesListTwilioResponse> {
    return interval(refreshInterval).pipe(
      switchMap(() => this.fetchAvailablePhones(countryCode))
    );
  }

  public createPhoneNumber(data: ICreatePhoneRequest): Observable<ICreatePhoneResponse> {
    return this.apiService.post<ICreatePhoneResponse>('phones', data).pipe(
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

  public deletePhoneNumber(id: string): Observable<IDeletePhoneResposne> {
    return this.apiService.delete<ICreatePhoneResponse>(`phones/${id}`).pipe(
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
