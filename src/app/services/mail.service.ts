import { environment } from '../../environments/environment';
import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { retry, tap, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { ParamService } from './param.service';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})

export class MailService extends DataService {

  // public mailBoxParam = new MailBoxParam();

  constructor(
    http: HttpClient,
    protected paramService: ParamService,
    protected authService: AuthService,
  ) {
    super(environment.baseUrl + '/param', http);
  }

  mail$(mailItems: MailItem[]): Observable<Object> {
    return this.paramService.readParamData$('mailboxparam' + this.authService.userId,
      JSON.stringify(new MailBoxParam()),
      'Om in te loggen in de mailbox')
      .pipe(
        switchMap(data => {
          let result = data as string;
          let mailBoxParam = JSON.parse(result) as MailBoxParam;

          let externalRecord = new ExternalMailApiRecord();
          externalRecord.UserId = mailBoxParam.UserId;
          externalRecord.Password = mailBoxParam.Password;
          externalRecord.From = mailBoxParam.UserId;
          externalRecord.FromName = mailBoxParam.Name;
          externalRecord.MailItems = mailItems;

          return this.http.post(environment.baseUrl + '/mail/sendmail', JSON.stringify(externalRecord))
          .pipe(
            retry(1),
            tap({ // Log the result or error
              next: data => console.log('Received: ', data),
              error: error => console.log('Oeps: ', error)
            }),
            catchError(this.errorHandler)
          );
        }
        )
      )
  }
}

/***************************************************************************************************
/ This record is sent to the mail API
/***************************************************************************************************/
export class ExternalMailApiRecord {
  UserId: string = '';
  Password: string = '';
  From: string = '';
  FromName: string = '';
  MailItems: MailItem[] = [];
}
/**
 * Contains email adres and To name
 */
export class MailItemTo {
  To: string = '';
  ToName: string = '';
}

/***************************************************************************************************
/ An email
/***************************************************************************************************/
export class MailItem extends MailItemTo {
  // CC: string = '';
  // BCC: string = '';
  Subject: string = '';
  Message: string = '';
  Attachment: string = '';
  Type: string = '';
  FileName: string = '';
}

/***************************************************************************************************
/ This record is stored in the Param table as value of a param record
/***************************************************************************************************/
export class MailBoxParam {
  UserId: string = '';
  Password: string = '';
  Name: string = '';
}
