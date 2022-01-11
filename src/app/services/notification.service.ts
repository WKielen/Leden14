// “For every complex problem there is an answer that is clear, simple, and wrong.”
import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { AppError } from '../shared/error-handling/app-error';
import { Observable } from 'rxjs';
import { retry, tap, catchError } from 'rxjs/operators';
import { LedenItem, LedenService } from './leden.service';
import { HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})

export class NotificationService extends DataService {

  constructor(
    private ledenService: LedenService,
    http: HttpClient) {
    super(environment.baseUrl + '/notification', http);  // base url omdat de db calls gewoon via de standaard api gaan
  }

  /***************************************************************************************************
  / Ik gooi alle records weg die van deze UserId. Dus alle subscriptions worden weggegooid.
  / Dit gebeurt dmv button op notification.dialog.ts
  /***************************************************************************************************/
  public Unsubscribe$(UserId: string): Observable<Object> {
    return this.http.delete(environment.baseUrl + 'notification/deletefromuserid?userid=' + "'" + UserId + "'")
    .pipe(
      tap({ // Log the result or error
        next: data => console.log('Deleted: ', data),
          error: error => {
            console.log('Oeps: ', error)
          }
        }),
        catchError(this.errorHandler)
      );
      }

  /***************************************************************************************************
  / Na het versturen van de notification, de firebase notification server kan een error teruggeven.
  / Error 404 of 410 geeft aan dat de subscription niet meer geldig is. Daarom moet de entry van deze
  / subscription uit de DB worden verwijderd.
  /***************************************************************************************************/
  private deleteToken$(Token: string): Observable<Object> {
    return this.http.delete(environment.baseUrl + 'notification/deletetoken?token=' + "'" + btoa(Token) + "'")
      .pipe(
        tap({ // Log the result or error
          next: data => console.log('Deleted: ', data),
            error: error => {
              console.log('Oeps: ', error)
            }
          }),
      catchError(this.errorHandler)
      );
  }



  /***************************************************************************************************
 / Send a notification to the email server.
 / De mailserver dient als vehicle om een bericht te sturen naar Firebase Message Service
 / Deze service stuurt het bericht naar de browser die het laten zien op het scherm.
 /***************************************************************************************************/
  notification$(token: any): Observable<Object> {
    return this.http.post(environment.baseUrl + "/notification/sendnotification", token)
      .pipe(
        retry(1),
        tap({
          next: data => console.log('Notification: ', data),
          error: error => console.log('Oeps: ', error)
        }),
        catchError(this.errorHandler)
      );
  }

  /***************************************************************************************************
  / Dit gaat per ROL
  / Hier stuur ik een notificatie aan iedereen met een bepaalde rol. Om dit te doen, lees ik eerst alle
  / leden in met zijn rol. Per lid ga ik de rollen van het lid 'crossreferencen' met de opgegeven rollen.
  /***************************************************************************************************/
  public sendNotificationsForRole(audiance: string[], header: string, message: string): void {
    // console.log('sendNotificationsForRole', 'ik haal alle users op met rol' , audiance, header, message);

    // let sub = this.ledenService.getRol$()
    //   .subscribe({
    //     next: (data: Array<LedenItem>) => {
    //       const ledenLijst: Array<LedenItem> = data;
    //       // console.log('Dit heb ik opgehaald', ledenLijst, 'nu ga ik ze een voor een verzenden');

    //       ledenLijst.forEach(lid => {
    //         this.processLid(lid, audiance, header, message);
    //       })
    //     },
    //     error: (error: AppError) => {
    //       console.log("error", error);
    //     }
    //   })
    // this.registerSubscription(sub);
  }






  
  /***************************************************************************************************
  / Per lid ga ik de rollen van het lid 'crossreferencen' met de opgegeven rollen. Als ik een overeenstemming
  / vind dan wordt er een notification gestuurd en ga ik door met het volgende lid.
  /***************************************************************************************************/
  private processLid(lid: LedenItem, audiance: string[], header: string, message: string): void {
    if (!lid.Rol) {
      return;
    }
    const userRoles = lid.Rol.split(',');  //  AD, YY
    for (let i = 0; i < userRoles.length; i++) {
      for (let j = 0; j < audiance.length; j++) {
        if (userRoles[i] == audiance[j]) {
          this.sendNotificationToUserId(lid.BondsNr, header, message);
          return;
        }
      }
    }
  }

  /***************************************************************************************************
  / Dit gaat over een AANTAL USERS
  / Stuur een notificatie naar alle registraties van een userid. Ik lees eerst alle registraties met
  / dit userid in en dan stuur ik elke browser een melding
  /***************************************************************************************************/
  // private sendNotificationToUserIds(UserIdArray: string[], header: string, message: string): void {
  //   UserIdArray.forEach(userid => {
  //     this.sendNotificationToUserId(userid, header, message);
  //   })
  // }

  /***************************************************************************************************
  / Dit gaat over 1 USER
  / Stuur een notificatie naar alle registraties van een userid. Ik lees eerst alle registraties met
  / dit userid in en dan stuur ik elke browser een melding
  /***************************************************************************************************/
  private sendNotificationToUserId(userid: string, header: string, message: string): void {
    // console.log('sendNotificationToUserId', 'ik ga de user lezen uit notification tabel', userid,  header, message );


    let sub = this.getSubscribtionsUserId$(userid)
      .subscribe({
        next: (data) => {
          let notificationArray = data as Array<NotificationRecord>;
          if (notificationArray) {
            // console.log('Dit heb ik opgehaald', notificationArray, 'stuur het nu een voor een door naar send notification');
            notificationArray.forEach(notificatie => {
              this.sendNotification(atob(notificatie.Token), header, message, notificatie.SendWithVapidAud);
            })
          }
        },
        error: (error: AppError) => {
          console.log("error", error);
        }
      })
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / Get alle registraties van een userid
  /***************************************************************************************************/
  private getSubscribtionsUserId$(UserId: string): Observable<Object> {
    return this.http.get(environment.baseUrl + 'notification/getuserid?userid=' + "'" + UserId + "'")
      .pipe(
        retry(3),
        tap({ // Log the result or error
          next: data => console.log('Received: ', data),
          error: error => console.log('Oeps: ', error)
        }),
        catchError(this.errorHandler)
      );
  }

  /***************************************************************************************************
  / Dit gaat per TOKEN
  / Stuur een notificatie naar de mail server die het door zal sturen naar de Firebase Notification Service
  /***************************************************************************************************/
  public sendNotification(token: string, header: string, message: string, sendwithvapidaud: string): void {
    // console.log('sendNotification', token, 'hier wordt notification$ aangeroepen');

    let payload = { 'sub_token': token, 'message': NotificationService.Create_WS_Payload(header, message), 'SendWithVapidAud': sendwithvapidaud };
    // console.log('payload met sendwithvapid',payload);

    let sub = this.notification$(payload)
      .subscribe({
        next: (data:any) => {
          if (data.hasOwnProperty('failed')) {
            let message: string = data['failed'];
            if (message.indexOf('401') !== -1) {
              let sub2 = this.deleteToken$(token)
                .subscribe();
              this.registerSubscription(sub2);
            }
          }
        },
        error: (error: AppError) => {
          console.log("error", error);
        }
      })
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / We creeeren een payload voor de service worker. Deze snapt dit bericht.
  /***************************************************************************************************/
  private static Create_WS_Payload(header: string, message: string): string {
    let payload = '{"notification": {"title": "';
    payload += header;
    payload += '","body": "';
    payload += message;
    payload += '"';
    payload += ', "icon": "assets/icons/app-logo-72x72.png"';
    payload += ', "badge": "assets/icons/badge-logo.png"';
    payload += ', "vibrate": [100, 50, 100]';
    payload += ', "data": {"primaryKey": "3198048"}';

    // payload += ', "actions": [{"action": "explore","title": "Go to the site"}]';
    payload += '}}';
    return payload;
  }
}

/***************************************************************************************************
/ Record used for storing and reading the datbase
/***************************************************************************************************/
export class NotificationRecord {
  Id!: number;
  UserId!: string;
  Token!: string;
  SendWithVapidAud!: string;
}
