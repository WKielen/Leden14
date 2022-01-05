import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { tap, map, retry, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})

export class InschrijvingService extends DataService {

  constructor(
    http: HttpClient) {
    super(environment.baseUrl + '/inschrijving', http);
  }


  register$(inschrijving: InschrijvingItem): Observable<Object> {
    return this.http.post<string>(environment.baseUrl + '/inschrijving/register', inschrijving)
      .pipe(
        retry(3),
        map(response => {
          return response;
        }),
        tap({ // Log the result or error
          next: data => console.log('Received: ', data),
          error: error => console.log('Oeps: ', error)
        }),
        catchError(this.errorHandler)
      );
  }

  /***************************************************************************************************
  / Get the all members that posted for a specific event
  /***************************************************************************************************/
  getSubscriptionsEvent$(Event_Id: number): Observable<any> {
    return this.http.get(environment.baseUrl + '/inschrijving/getsubscriptions?Id=' + Event_Id)
      .pipe(
        retry(1),
        tap({ // Log the result or error
          next: data => console.log('Received: ', data),
          error: error => console.log('Oeps: ', error)
        }),
      )
  }
}

/***************************************************************************************************
/
/***************************************************************************************************/
export class InschrijvingItem {
  Id?: number = 0;
  Agenda_Id?: number = 0;
  LidNr?: number = 0;
  Email?: string = '';
  Naam?: string = '';
  ExtraInformatie?: string = '';
}
