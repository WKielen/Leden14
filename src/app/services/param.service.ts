import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { retry, tap, map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})

export class ParamService extends DataService {

  constructor(
    http: HttpClient) {
    super(environment.baseUrl + '/param', http);
  }

  /***************************************************************************************************
  / Read the Parameter and CREATE one in the database if it doesn't exist. After this read only an
  / update statement is needed.
  /***************************************************************************************************/
  readParamData$(Id: string, Default?: string, Description?: string): Observable<string> {
    return this.http.get(environment.baseUrl + '/param/get?Id=' + Id)
      .pipe(
        map(response => {
          return atob((response as ParamItem).Value);      // atob  = decrypt
        }),
        tap({ // Log the result or error
          next: data => console.log('Received: ', data),
          error: error => {
            console.log('Not found, create one our selves: ', error)
            // De parameter niet gevonden dus maken we hem zelf aan zodat deze gebruikt kan worden.
            this.registerSubscription(this.createParamData$(Id, Default, Description)
              .subscribe());
          }
        }),
        catchError(this.errorHandler)
      );
  }

  /***************************************************************************************************
  / Create a Parameter in the database
  /***************************************************************************************************/
  createParamData$(Id: string, Value: any, Description: string): Observable<Object> {
    let paramItem = new ParamItem();
    paramItem.Id = Id;

    paramItem.Value = btoa(Value ? Value : '');     // btoa = encrypt
    paramItem.Description = Description ? Description : '';

    return this.create$(paramItem);
  }

  /***************************************************************************************************
  / The Update statement of a param
  /***************************************************************************************************/
  saveParamData$(Id: string, Value: any, Description: string): Observable<Object> {
    let paramItem = new ParamItem();
    paramItem.Id = Id;
    paramItem.Value = btoa(Value);
    paramItem.Description = Description ? Description : '';

    return super.update$(paramItem);
  }
}

/***************************************************************************************************
/ Record for the database
/***************************************************************************************************/
export class ParamItem {
  Id?: string = '';
  Value?: string = '';
  Description?: string = '';
}
