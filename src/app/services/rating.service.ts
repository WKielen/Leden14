import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { tap, retry } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})

export class RatingService extends DataService {

  constructor(
    http: HttpClient) {
      super(environment.baseUrl + '/nas', http);
    }

  /***************************************************************************************************
  / Get the rating for club 1520
  /***************************************************************************************************/
  getRatings$(): Observable<any> {
    return this.http.get(environment.baseUrl + '/nas/getrating')
      .pipe(
        retry(1),
        tap({ // Log the result or error
          next: data => console.log('Received: ', data),
          error: error => console.log('Oeps: ', error)
        }),
      )
  }

}

export class RatingItem {
  bondsnr: string = '';
  rating: string = '';
  senlic: string = '';
  junlic: string = '';
}
