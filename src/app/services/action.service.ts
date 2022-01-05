import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { retry, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class ActionService extends DataService {

  constructor(
    http: HttpClient) {
    super(environment.baseUrl + '/action', http);
  }

  /***************************************************************************************************
  / Deze geeft een set terug afhankelijk van de rol. Als de rol BS is dan komen de BS acties mee. Anders dus niet
  /***************************************************************************************************/
  getAllActions$(): Observable<any> {
    return this.http.get(environment.baseUrl + '/action/getallactions') //getallfromnow
      .pipe(
        retry(3),
        tap({ // Log the result or error 
          next: data => console.log('Received: ', data),
          error: error => console.log('Oeps: ', error)
        }),
      );
  }


  /***************************************************************************************************
  / Deze stream gebuik ik in de ActionMaintenancelist component. Op de pagina waarop het component 
  / meerdere keren staat, breng ik wijzigingen aan die dan direct naar alle componenten gaan.
  /***************************************************************************************************/
  public actionStream = new Subject<Array<ActionItem>>();

  /***************************************************************************************************
  / Get all actions in the future
  /***************************************************************************************************/
  nextWeek$() {
    return this.http.get(environment.baseUrl + '/action/komendeweek') //getallfromnow
    .pipe(
      retry(3),
      tap({ // Log the result or error
        next: data => console.log('Received: ', data),
        error: error => console.log('Oeps: ', error)
      }),
    );
  }
}


export class ActionItem {
  Id?: string = '';
  StartDate?: string = '';
  TargetDate?: string = '';
  EndDate?: string = '';
  Title?: string = '';
  Description?: string = '';
  HolderName?: string = '';
  Status?: string = '';
  Role?: string = '';
}

export const ACTIONSTATUS = {
  OPEN: '0',
  CLOSED: '1',
  ARCHIVED: '2',
  DECISION: '8',
  REPEATING: '9',
};
